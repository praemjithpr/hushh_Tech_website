// investments-transactions — Fetch investment transactions from Plaid
// Returns up to 24 months of investment transaction history
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

    // Default: last 90 days of investment transactions
    const endDate = body.endDate || new Date().toISOString().split('T')[0];
    const startDate = body.startDate || (() => {
      const d = new Date();
      d.setDate(d.getDate() - 90);
      return d.toISOString().split('T')[0];
    })();

    const response = await fetch(`${baseUrl}/investments/transactions/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      // Graceful handling — not all institutions support investment transactions
      return new Response(
        JSON.stringify({
          available: false,
          error: errData.error_message || 'Investment transactions not available',
          error_code: errData.error_code || 'PRODUCT_NOT_SUPPORTED',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const data = await response.json();
    return new Response(
      JSON.stringify({
        available: true,
        accounts: data.accounts,
        investment_transactions: data.investment_transactions,
        securities: data.securities,
        total_investment_transactions: data.total_investment_transactions,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ available: false, error: err.message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
