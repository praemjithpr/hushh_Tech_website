// bank-income — Fetch Bank Income data from Plaid
// Returns income streams derived from deposit activity
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

    const accessToken = body.accessToken || body.access_token;
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'accessToken is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Bank Income — income streams from deposit activity
    const response = await fetch(`${baseUrl}/credit/bank_income/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        user_token: null,
        options: {
          count: 1,
        },
      }),
    });

    // If bank_income/get fails, try the simpler /credit/bank_income/get with access_token
    if (!response.ok) {
      // Fallback: Try with access tokens array
      const fallbackRes = await fetch(`${baseUrl}/credit/bank_income/get`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: PLAID_CLIENT_ID,
          secret: PLAID_SECRET,
          options: {
            count: 1,
          },
        }),
      });

      if (!fallbackRes.ok) {
        const errData = await fallbackRes.json().catch(() => ({}));
        // Not all accounts support income — return graceful response
        return new Response(
          JSON.stringify({
            available: false,
            error: errData.error_message || 'Income data not available',
            error_code: errData.error_code || 'PRODUCT_NOT_SUPPORTED',
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      const fallbackData = await fallbackRes.json();
      return new Response(
        JSON.stringify({ available: true, ...fallbackData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const data = await response.json();
    return new Response(
      JSON.stringify({ available: true, ...data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ available: false, error: err.message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
