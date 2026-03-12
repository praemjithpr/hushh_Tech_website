// asset-report-create — Full Plaid Assets integration
// Supports: create, get (JSON), get (PDF), refresh, audit copy
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const PLAID_CLIENT_ID = Deno.env.get('PLAID_CLIENT_ID');
    const PLAID_SECRET = Deno.env.get('PLAID_SECRET');
    const PLAID_ENV = Deno.env.get('PLAID_ENV') || 'sandbox';
    const baseUrl = `https://${PLAID_ENV}.plaid.com`;

    const action = body.action || 'create';

    // ─── GET: Retrieve existing asset report (JSON) ───
    if (action === 'get' && body.assetReportToken) {
      const payload: Record<string, unknown> = {
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        asset_report_token: body.assetReportToken,
      };

      // Optional: include categorized transactions + merchant info
      if (body.includeInsights) {
        payload.include_insights = true;
      }

      // Optional: get fast version of report
      if (body.fastReport) {
        payload.fast_report = true;
      }

      const response = await fetch(`${baseUrl}/asset_report/get`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error_code === 'PRODUCT_NOT_READY') {
          return new Response(
            JSON.stringify({ status: 'pending', message: 'Asset report not ready yet' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
          );
        }
        return new Response(
          JSON.stringify({ error: data.error_message, error_code: data.error_code }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      return new Response(
        JSON.stringify({ status: 'complete', data: data.report }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // ─── GET PDF: Retrieve asset report as PDF ───
    if (action === 'get_pdf' && body.assetReportToken) {
      const response = await fetch(`${baseUrl}/asset_report/pdf/get`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: PLAID_CLIENT_ID,
          secret: PLAID_SECRET,
          asset_report_token: body.assetReportToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error_code === 'PRODUCT_NOT_READY') {
          return new Response(
            JSON.stringify({ status: 'pending', message: 'Asset report PDF not ready yet' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
          );
        }
        return new Response(
          JSON.stringify({ error: errorData.error_message, error_code: errorData.error_code }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      // PDF is returned as binary — convert to base64 for transport
      const pdfBuffer = await response.arrayBuffer();
      const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

      return new Response(
        JSON.stringify({ status: 'complete', pdf_base64: base64Pdf }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // ─── REFRESH: Create new report based on existing one ───
    if (action === 'refresh' && body.assetReportToken) {
      const payload: Record<string, unknown> = {
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        asset_report_token: body.assetReportToken,
      };

      // Optional: override days_requested
      if (body.daysRequested) {
        payload.days_requested = body.daysRequested;
      }

      const response = await fetch(`${baseUrl}/asset_report/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: data.error_message, error_code: data.error_code }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      return new Response(
        JSON.stringify({
          status: 'pending',
          asset_report_token: data.asset_report_token,
          asset_report_id: data.asset_report_id,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // ─── AUDIT COPY: Create audit copy for Fannie Mae / Freddie Mac / Ocrolus ───
    if (action === 'audit_copy' && body.assetReportToken) {
      const response = await fetch(`${baseUrl}/asset_report/audit_copy/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: PLAID_CLIENT_ID,
          secret: PLAID_SECRET,
          asset_report_token: body.assetReportToken,
          auditor_id: body.auditorId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: data.error_message, error_code: data.error_code }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      return new Response(
        JSON.stringify({
          status: 'complete',
          audit_copy_token: data.audit_copy_token,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // ─── CREATE: Create new asset report ───
    const accessToken = body.accessToken || body.access_token;
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'accessToken is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const createPayload: Record<string, unknown> = {
      client_id: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
      access_tokens: [accessToken],
      days_requested: body.daysRequested || 60,
    };

    // Optional: Fast Assets add-on for low-latency initial report
    if (body.fastAssets) {
      createPayload.options = {
        add_ons: ['fast_assets'],
      };
    }

    // Optional: webhook URL for PRODUCT_READY notification
    if (body.webhookUrl) {
      createPayload.options = {
        ...(createPayload.options as Record<string, unknown> || {}),
        webhook: body.webhookUrl,
      };
    }

    // Optional: user info for the report
    if (body.user) {
      createPayload.options = {
        ...(createPayload.options as Record<string, unknown> || {}),
        user: body.user,
      };
    }

    const response = await fetch(`${baseUrl}/asset_report/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.error_message, error_code: data.error_code }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({
        status: 'pending',
        asset_report_token: data.asset_report_token,
        asset_report_id: data.asset_report_id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
