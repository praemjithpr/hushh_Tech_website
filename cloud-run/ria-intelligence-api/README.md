# Hushh RIA Intelligence API

Standalone Python API for advisor lookup and public-web dossier generation.

## Quick Start

Public API me **sirf name/query dena hota hai**.

Example:

```json
{
  "query": "ANA ROUMENOVA CARTER"
}
```

You do **not** send:

- Phase 1 seed JSON
- FINRA details manually
- CRD number manually
- any image/document payload

Current public flow:

1. caller sends a name query
2. Phase 1 verifies the advisor or firm via Gemini on Vertex AI against FINRA/SEC sources
3. the verified Phase 1 profile is passed as seed JSON into OpenAI Responses API
4. backend scrapes and ranks public image candidates
5. API returns the final dossier JSON

## Base URL

Production:

```text
https://hushh-ria-intelligence-api-53407187172.us-central1.run.app
```

Local:

```text
http://127.0.0.1:8000
```

## Endpoints

| Method | Endpoint | Use |
|---|---|---|
| `GET` | `/` | Basic liveness check |
| `GET` | `/health` | Health check for Cloud Run and external monitors |
| `GET` | `/healthz` | Legacy compatibility alias; avoid using this path on Cloud Run |
| `POST` | `/v1/ria/profile` | Main query-based advisor dossier API |

## `POST /v1/ria/profile`

### Input

```json
{
  "query": "ANA ROUMENOVA CARTER"
}
```

### Input rules

- `query` is required
- `query` must not be blank
- this route does not accept a Phase 1 seed payload directly
- the backend itself builds the Phase 1 verified profile internally
- client only sends the advisor or firm name

## Output

### Success response shape

```json
{
  "subject": {
    "full_name": "ANA ROUMENOVA CARTER",
    "crd_number": "4424794",
    "current_firm": "LCG CAPITAL ADVISORS, LLC",
    "location": "Tampa, Florida"
  },
  "executive_summary": "Ana Carter is a finance executive and outsourced FINOP.",
  "verified_profiles": [
    {
      "platform": "FINRA BrokerCheck",
      "label": "BrokerCheck Report - ANA ROUMENOVA CARTER",
      "url": "https://files.brokercheck.finra.org/individual/individual_4424794.pdf",
      "handle": null,
      "source_title": "BrokerCheck Report - ANA ROUMENOVA CARTER",
      "source_url": "https://files.brokercheck.finra.org/individual/individual_4424794.pdf",
      "evidence_note": "Official regulatory source captured during Phase 1 verification."
    }
  ],
  "public_images": [
    {
      "kind": "headshot",
      "image_url": "https://images.example/ana-final.jpg",
      "source_page_url": "https://cartanaconsulting.com/about-cartana/",
      "source_title": "About Cartana",
      "confidence_note": "Best public headshot among validated candidates."
    }
  ],
  "key_facts": [
    {
      "fact": "Founder of Cartana Consulting Solutions.",
      "source_title": "About Cartana",
      "source_url": "https://cartanaconsulting.com/about-cartana/",
      "evidence_note": "Official company biography."
    }
  ],
  "unverified_or_not_found": [],
  "prompts_used": [
    "Ana Roumenova Carter LinkedIn"
  ]
}
```

## Runtime Behavior

- Public request contract is always:
  - input: `{ "query": "<name>" }`
  - output: final dossier JSON
- Phase 1 no confident FINRA/SEC match:
  - returns `200`
  - `subject.full_name` is filled from the query
  - `subject.crd_number/current_firm/location = null`
  - `verified_profiles`, `public_images`, `key_facts` are empty
  - `unverified_or_not_found` contains the not-found reason
- Phase 1 verified + OpenAI dossier success:
  - returns `200`
  - final dossier JSON
- Phase 1 verified + image-ranking fallback:
  - returns `200`
  - final dossier JSON with validated fallback public image candidates
- full Phase 1 upstream failure:
  - returns `502`
- blank query:
  - returns `400`

## Image Behavior

- OpenAI dossier research returns profile/page/image evidence
- backend then fetches candidate/source pages and extracts images from:
  - `og:image`
  - `twitter:image`
  - `<img>`
- shortlisted images are ranked with a second OpenAI pass
- if that ranking step fails, the API falls back to locally validated public image candidates
- final `public_images` contains public source URLs only
- no DOCX is generated
- no image is uploaded to GCS by this endpoint

## Example curl

### Production

```bash
curl https://hushh-ria-intelligence-api-53407187172.us-central1.run.app/health

curl -X POST https://hushh-ria-intelligence-api-53407187172.us-central1.run.app/v1/ria/profile \
  -H "Content-Type: application/json" \
  -d '{
    "query": "ANA ROUMENOVA CARTER"
  }'
```

Minimal one-line request:

```bash
curl -X POST https://hushh-ria-intelligence-api-53407187172.us-central1.run.app/v1/ria/profile -H "Content-Type: application/json" -d '{"query":"ANA ROUMENOVA CARTER"}'
```

### Local

```bash
curl http://127.0.0.1:8000/health

curl -X POST http://127.0.0.1:8000/v1/ria/profile \
  -H "Content-Type: application/json" \
  -d '{
    "query": "ANA ROUMENOVA CARTER"
  }'
```

## Environment

Required:

- `GOOGLE_CLOUD_PROJECT`
- `OPENAI_API_KEY`

Optional:

- `GOOGLE_CLOUD_LOCATION=global`
- `RIA_PRIMARY_MODEL=gemini-3.1-pro-preview`
- `RIA_FALLBACK_MODEL=gemini-2.5-pro`
- `OPENAI_MODEL=gpt-5.4`
- `OPENAI_IMAGE_RANK_MODEL=gpt-5.4-mini`
- `OPENAI_TIMEOUT_SECONDS=90`
- `PORT=8080`

## Local Run

```bash
cd cloud-run/ria-intelligence-api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID
export GOOGLE_CLOUD_LOCATION=global
export OPENAI_API_KEY=YOUR_OPENAI_KEY
export RIA_PRIMARY_MODEL=gemini-3.1-pro-preview
export RIA_FALLBACK_MODEL=gemini-2.5-pro
export OPENAI_MODEL=gpt-5.4
export OPENAI_IMAGE_RANK_MODEL=gpt-5.4-mini
uvicorn app.main:app --reload
```

## Deploy

```bash
./scripts/deploy-ria-intelligence-api.sh \
  --project YOUR_PROJECT_ID \
  --region us-central1 \
  --openai-api-key-secret YOUR_SECRET_NAME
```

## Server-Side OpenAI Key

Keep the OpenAI key on the server side only.

Recommended production setup:

1. store the key in GCP Secret Manager
2. grant the Cloud Run service account `roles/secretmanager.secretAccessor`
3. deploy with `--openai-api-key-secret YOUR_SECRET_NAME`

Example:

```bash
./scripts/deploy-ria-intelligence-api.sh \
  --project hushone-app \
  --region us-central1 \
  --openai-api-key-secret ria-intelligence-openai-api-key
```

The live service is currently configured this way, so `OPENAI_API_KEY` is injected into Cloud Run from Secret Manager instead of being kept in source code or frontend code.

## Security Note

Do not hardcode OpenAI keys in source, docs, or scripts.

If an OpenAI key was shared in chat on **March 21, 2026**, rotate it before production use and move it into Secret Manager.
