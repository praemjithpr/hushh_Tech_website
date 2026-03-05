/**
 * Enrich kirkland_agents with photos, services, ratings from UNIQUE_ALL_AGENTS.json
 * 
 * Usage: node scripts/enrich-kirkland-agents.cjs
 */
const fs = require('fs');
const https = require('https');

const JSON_PATH = '/Users/ankit.singh/Downloads/UNIQUE_ALL_AGENTS.json';
const PROJECT_REF = 'ibsisfnjxeowvdtvgzff';
const MGMT_TOKEN = 'sbp_e5596b577b611b0b141baaf2a87e10c10eac3830';

/** Run SQL via Supabase Management API */
function runSQL(query) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query });
    const req = https.request({
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MGMT_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/** Escape single quotes for SQL */
function esc(str) {
  if (!str) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

/** Convert JS array to Postgres TEXT[] literal */
function pgArray(arr) {
  if (!arr || arr.length === 0) return "ARRAY[]::TEXT[]";
  const items = arr.map(s => `"${s.replace(/"/g, '\\"').replace(/'/g, "''")}`).join('","');
  return `'{${items}}'::TEXT[]`;
}

async function main() {
  console.log('📂 Reading JSON...');
  const agents = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  console.log(`   Found ${agents.length} agents`);

  // Build UPDATE statements in batches of 25
  const BATCH_SIZE = 25;
  let updated = 0;
  let withPhotos = 0;

  for (let i = 0; i < agents.length; i += BATCH_SIZE) {
    const batch = agents.slice(i, i + BATCH_SIZE);
    const statements = batch.map(a => {
      const photos = (a.photos || []).slice(0, 5); // Max 5 photos
      const services = (a.services || []).slice(0, 25);
      const photoUrl = photos.length > 0 ? esc(photos[0]) : 'NULL';
      const rating = typeof a.rating === 'number' ? a.rating : 'NULL';
      
      if (photos.length > 0) withPhotos++;

      return `UPDATE public.kirkland_agents SET
        photos = ${pgArray(photos)},
        photo_url = ${photoUrl},
        avg_rating = ${rating},
        services = ${pgArray(services)}
        WHERE id = ${esc(a.id)};`;
    }).join('\n');

    try {
      await runSQL(statements);
      updated += batch.length;
      process.stdout.write(`\r   Updated ${updated}/${agents.length} (${withPhotos} with photos)`);
    } catch (err) {
      console.error(`\n❌ Batch ${i} failed:`, err.message);
    }
  }

  console.log(`\n✅ Done! Updated ${updated} agents, ${withPhotos} with photos`);
}

main().catch(console.error);
