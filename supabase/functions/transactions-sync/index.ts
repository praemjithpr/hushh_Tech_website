// transactions-sync — Fetch transaction history via /transactions/sync
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { accessToken, cursor, count } = await req.json();

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

    // Paginate through all available transactions
    let allAdded: any[] = [];
    let allModified: any[] = [];
    let allRemoved: any[] = [];
    let nextCursor = cursor || '';
    let hasMore = true;
    let accounts: any[] = [];
    let pageCount = 0;
    const maxPages = 10; // Safety limit

    while (hasMore && pageCount < maxPages) {
      pageCount++;

      const body: Record<string, any> = {
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        access_token: accessToken,
        count: count || 100,
      };

      // Only include cursor if we have one (empty string = get all history)
      if (nextCursor) {
        body.cursor = nextCursor;
      }

      const res = await fetch(`${baseUrl}/transactions/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        // PRODUCT_NOT_READY means transactions are still being pulled
        if (data.error_code === 'PRODUCT_NOT_READY') {
          console.log('[transactions-sync] Transactions not ready yet');
          return new Response(
            JSON.stringify({
              available: false,
              error: 'Transactions data is still being prepared. Try again shortly.',
              status: 'pending',
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
          );
        }

        // PRODUCTS_NOT_SUPPORTED — institution doesn't support transactions
        if (data.error_code === 'PRODUCTS_NOT_SUPPORTED' || data.error_code === 'INVALID_PRODUCT') {
          return new Response(
            JSON.stringify({ available: false, error: 'Transactions not supported for this account' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
          );
        }

        console.error('[transactions-sync] Plaid error:', data);
        return new Response(
          JSON.stringify({ error: data.error_message || 'Failed to sync transactions' }),
          { status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      // Accumulate results
      allAdded = allAdded.concat(data.added || []);
      allModified = allModified.concat(data.modified || []);
      allRemoved = allRemoved.concat(data.removed || []);
      accounts = data.accounts || accounts; // Use latest accounts list
      nextCursor = data.next_cursor;
      hasMore = data.has_more;
    }

    console.log(`[transactions-sync] Fetched ${allAdded.length} added, ${allModified.length} modified, ${allRemoved.length} removed across ${pageCount} pages`);

    return new Response(
      JSON.stringify({
        available: true,
        accounts,
        added: allAdded,
        modified: allModified,
        removed: allRemoved.map((r: any) => r.transaction_id || r),
        total_transactions: allAdded.length,
        next_cursor: nextCursor,
        has_more: hasMore,
        pages_fetched: pageCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err: unknown) {
    console.error('[transactions-sync] Error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
