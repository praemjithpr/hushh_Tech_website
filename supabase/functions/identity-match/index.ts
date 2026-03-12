// identity-match — Match user identity against bank account owner data
// Returns: match scores (0-100) for name, email, phone, address
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const accessToken = body.accessToken || body.access_token;

    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'accessToken is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const PLAID_CLIENT_ID = Deno.env.get('PLAID_CLIENT_ID');
    const PLAID_SECRET = Deno.env.get('PLAID_SECRET');
    const PLAID_ENV = Deno.env.get('PLAID_ENV') || 'sandbox';
    const baseUrl = `https://${PLAID_ENV}.plaid.com`;

    // Build user object for matching (all fields optional)
    const user: Record<string, any> = {};
    if (body.legal_name) user.legal_name = body.legal_name;
    if (body.phone_number) user.phone_number = body.phone_number;
    if (body.email_address) user.email_address = body.email_address;
    if (body.address) user.address = body.address;

    const plaidBody: Record<string, any> = {
      client_id: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
      access_token: accessToken,
    };

    // Only include user if at least one field provided
    if (Object.keys(user).length > 0) {
      plaidBody.user = user;
    }

    const response = await fetch(`${baseUrl}/identity/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plaidBody),
    });

    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      console.error('[identity-match] Non-JSON response:', text.slice(0, 200));
      return new Response(
        JSON.stringify({ error: 'Invalid response from Plaid', available: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (!response.ok) {
      // Treat PRODUCTS_NOT_SUPPORTED / INVALID_PRODUCT as 400 not 500
      const errorCode = data.error_code || '';
      const isMissing = ['PRODUCTS_NOT_SUPPORTED', 'INVALID_PRODUCT', 'PRODUCT_NOT_READY',
        'NO_ACCOUNTS', 'ITEM_NOT_FOUND'].includes(errorCode);
      return new Response(
        JSON.stringify({ error: data.error_message, error_code: errorCode, available: false }),
        { status: isMissing ? 400 : response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[identity-match] Error:', err.message);
    return new Response(
      JSON.stringify({ error: err.message, available: false }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
