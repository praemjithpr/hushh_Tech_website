// liabilities — Fetch credit card, student loan, and mortgage liabilities data
import { corsHeaders } from '../_shared/cors.ts';

const PLAID_CLIENT_ID = Deno.env.get('PLAID_CLIENT_ID');
const PLAID_SECRET = Deno.env.get('PLAID_SECRET');
const PLAID_ENV = Deno.env.get('PLAID_ENV') || 'sandbox';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { accessToken } = await req.json();

    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'accessToken is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const baseUrl = `https://${PLAID_ENV}.plaid.com`;

    // Call /liabilities/get — returns credit, student, mortgage data
    const response = await fetch(`${baseUrl}/liabilities/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        access_token: accessToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorCode = data.error_code || '';
      console.error('[liabilities] Plaid error:', errorCode, data.error_message);

      // PRODUCTS_NOT_SUPPORTED or NO_LIABILITY_ACCOUNTS — institution doesn't support liabilities
      if (errorCode === 'PRODUCTS_NOT_SUPPORTED' || errorCode === 'NO_LIABILITY_ACCOUNTS') {
        return new Response(
          JSON.stringify({ available: false, error: data.error_message, reason: 'not_supported' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      return new Response(
        JSON.stringify({ error: data.error_message || 'Failed to fetch liabilities' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Summarize the liabilities data
    const liabilities = data.liabilities || {};
    const credit = liabilities.credit || [];
    const student = liabilities.student || [];
    const mortgage = liabilities.mortgage || [];

    const summary = {
      credit_cards: credit.length,
      student_loans: student.length,
      mortgages: mortgage.length,
      total_accounts: credit.length + student.length + mortgage.length,
    };

    console.log('[liabilities] ✅ Fetched:', summary);

    return new Response(
      JSON.stringify({
        available: true,
        accounts: data.accounts || [],
        liabilities: {
          credit,
          student,
          mortgage,
        },
        summary,
        request_id: data.request_id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err: unknown) {
    console.error('[liabilities] Error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
