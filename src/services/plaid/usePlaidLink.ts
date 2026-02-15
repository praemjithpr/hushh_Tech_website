/**
 * usePlaidLink — Clean Plaid Link hook
 * 
 * Simple flow: Create token → Open Link → Exchange → Fetch data
 * No OAuth complexity. Works with non-OAuth banks (First Platypus, etc.)
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { usePlaidLink as usePlaidLinkSDK, PlaidLinkOnSuccess, PlaidLinkOnExit, PlaidLinkOnEvent } from 'react-plaid-link';
import {
  createLinkToken,
  exchangeToken,
  fetchAllFinancialData,
  checkAssetReport,
  getProductStatus,
  saveFinancialDataToSupabase,
  type FinancialDataResponse,
  type ProductFetchStatus,
} from './plaidService';

// =====================================================
// Types
// =====================================================

export interface PlaidLinkState {
  step: 'idle' | 'creating_token' | 'ready' | 'linking' | 'exchanging' | 'fetching' | 'done' | 'error';
  linkToken: string | null;
  error: string | null;
  institution: { name: string; id: string } | null;
  balanceStatus: ProductFetchStatus;
  assetsStatus: ProductFetchStatus;
  investmentsStatus: ProductFetchStatus;
  financialData: FinancialDataResponse | null;
  canProceed: boolean;
  productsAvailable: number;
}

export interface UsePlaidLinkReturn extends PlaidLinkState {
  openPlaidLink: () => void;
  retry: () => void;
  isReady: boolean;
  open: () => void;
}

// =====================================================
// Hook
// =====================================================

export const usePlaidLinkHook = (userId: string, userEmail?: string): UsePlaidLinkReturn => {
  const [state, setState] = useState<PlaidLinkState>({
    step: 'idle',
    linkToken: null,
    error: null,
    institution: null,
    balanceStatus: 'idle',
    assetsStatus: 'idle',
    investmentsStatus: 'idle',
    financialData: null,
    canProceed: false,
    productsAvailable: 0,
  });

  const accessTokenRef = useRef<string | null>(null);
  const assetPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initializedRef = useRef(false);

  // Step 1: Create link token
  const initToken = useCallback(async () => {
    if (!userId) return;
    setState(s => ({ ...s, step: 'creating_token', error: null }));

    try {
      console.log('[Plaid] Creating link token...');
      const { link_token } = await createLinkToken(userId, userEmail);
      setState(s => ({ ...s, step: 'ready', linkToken: link_token }));
    } catch (err: any) {
      setState(s => ({ ...s, step: 'error', error: err.message || 'Failed to initialize' }));
    }
  }, [userId, userEmail]);

  // Auto-init once
  useEffect(() => {
    if (userId && !initializedRef.current) {
      initializedRef.current = true;
      initToken();
    }
  }, [userId, initToken]);

  // Step 2: Handle Plaid Link success
  const handleSuccess: PlaidLinkOnSuccess = useCallback(async (publicToken, metadata) => {
    console.log('[Plaid] ✅ onSuccess', { token: publicToken?.slice(0, 20), institution: metadata?.institution?.name });

    const inst = {
      name: metadata.institution?.name || 'Unknown',
      id: metadata.institution?.institution_id || '',
    };

    setState(s => ({
      ...s, step: 'exchanging', institution: inst,
      balanceStatus: 'loading', assetsStatus: 'loading', investmentsStatus: 'loading',
    }));

    try {
      // Exchange token
      console.log('[Plaid] Exchanging token...');
      const exchange = await exchangeToken(publicToken, userId, inst.name, inst.id);
      console.log('[Plaid] ✅ Exchange done:', { item_id: exchange.item_id });
      accessTokenRef.current = exchange.access_token;

      setState(s => ({ ...s, step: 'fetching' }));

      // Fetch financial data
      console.log('[Plaid] Fetching financial data...');
      const result = await fetchAllFinancialData(exchange.access_token, userId);
      console.log('[Plaid] ✅ Result:', {
        status: result.status,
        balance: result.balance.available,
        assets: result.assets.available,
        investments: result.investments.available,
      });

      setState(s => ({
        ...s, step: 'done', financialData: result,
        balanceStatus: getProductStatus(result.balance),
        assetsStatus: getProductStatus(result.assets),
        investmentsStatus: getProductStatus(result.investments),
        canProceed: result.summary.can_proceed,
        productsAvailable: result.summary.products_available,
      }));

      // Save to Supabase (background)
      saveFinancialDataToSupabase(userId, result, inst.name, inst.id, exchange.item_id)
        .catch(e => console.warn('[Plaid] Save failed:', e));

      // Poll assets if pending
      if (getProductStatus(result.assets) === 'pending' && result.assets.data?.asset_report_token) {
        pollAssets(result.assets.data.asset_report_token);
      }
    } catch (err: any) {
      console.error('[Plaid] ❌ Error:', err);
      setState(s => ({
        ...s, step: 'error', error: err.message || 'Failed to connect',
        balanceStatus: 'error', assetsStatus: 'error', investmentsStatus: 'error',
      }));
    }
  }, [userId]);

  // Handle exit
  const handleExit: PlaidLinkOnExit = useCallback((err, metadata) => {
    console.log('[Plaid] 🚪 onExit', { error: err, status: metadata?.status });
    if (err) {
      setState(s => ({
        ...s, step: 'error',
        error: `Connection interrupted: ${err.display_message || err.error_message || 'Unknown error'}`,
      }));
    }
  }, []);

  // Log events
  const handleEvent: PlaidLinkOnEvent = useCallback((eventName, metadata) => {
    console.log(`[Plaid] 📡 ${eventName}`, metadata);
  }, []);

  // Asset polling
  const pollAssets = useCallback((token: string) => {
    if (assetPollRef.current) clearInterval(assetPollRef.current);
    let attempts = 0;

    assetPollRef.current = setInterval(async () => {
      if (++attempts > 10) { clearInterval(assetPollRef.current!); return; }
      try {
        const result = await checkAssetReport(token, userId);
        if (result.status === 'complete') {
          clearInterval(assetPollRef.current!);
          setState(s => ({
            ...s, assetsStatus: 'success',
            productsAvailable: (s.productsAvailable || 0) + 1,
            financialData: s.financialData ? {
              ...s.financialData,
              assets: { available: true, data: result.data, error: null, reason: null },
            } : s.financialData,
          }));
        }
      } catch { /* silent */ }
    }, 5000);
  }, [userId]);

  // Cleanup
  useEffect(() => () => { if (assetPollRef.current) clearInterval(assetPollRef.current); }, []);

  // Plaid SDK
  const { open, ready } = usePlaidLinkSDK({
    token: state.linkToken,
    onSuccess: handleSuccess,
    onExit: handleExit,
    onEvent: handleEvent,
  });

  // Public API
  const openPlaidLink = useCallback(() => {
    if (ready) { setState(s => ({ ...s, step: 'linking' })); open(); }
  }, [ready, open]);

  const retry = useCallback(() => {
    setState({
      step: 'idle', linkToken: null, error: null, institution: null,
      balanceStatus: 'idle', assetsStatus: 'idle', investmentsStatus: 'idle',
      financialData: null, canProceed: false, productsAvailable: 0,
    });
    accessTokenRef.current = null;
    initializedRef.current = false;
    initToken();
  }, [initToken]);

  return {
    ...state, openPlaidLink, retry,
    isReady: ready && state.step === 'ready',
    open: openPlaidLink,
  };
};

export default usePlaidLinkHook;
