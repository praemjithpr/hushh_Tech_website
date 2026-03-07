import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../resources/config/config';
import OnboardingShell from '../../components/OnboardingShell';
import { usePlaidLinkHook } from '../../services/plaid/usePlaidLink';
import { formatCurrency } from '../../services/plaid/plaidService';
import type { FinancialVerificationResult } from '../../types/kyc';

export default function OnboardingFinancialLink() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [isReady, setIsReady] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const getUser = async () => {
      if (!config.supabaseClient) { navigate('/login'); return; }
      const { data: { user } } = await config.supabaseClient.auth.getUser();
      if (!user) { navigate('/login'); return; }

      setUserId(user.id);
      setUserEmail(user.email || undefined);
      setIsReady(true);
    };
    getUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const plaid = usePlaidLinkHook(userId, userEmail);

  /* Data Extraction */
  const allAccounts = plaid.financialData?.balance?.data?.accounts || [];
  const totalBalance = allAccounts.reduce((sum: number, acc: any) => sum + (acc.balances?.current ?? acc.balances?.available ?? 0), 0);

  const identityInfo = (() => {
    const id = plaid.financialData?.identity?.data;
    if (!id || !id.accounts?.[0]?.owners?.[0]) return null;
    const owner = id.accounts[0].owners[0];
    return {
      names: owner.names || [],
      emails: [...new Set((owner.emails || []).map((e: any) => e.data?.toLowerCase()).filter(Boolean))],
      phones: [...new Set((owner.phone_numbers || []).map((p: any) => p.data).filter(Boolean))],
      addresses: (owner.addresses || []).map((a: any) => [a.data?.street, a.data?.city, a.data?.region, a.data?.postal_code, a.data?.country].filter(Boolean).join(', ')),
    };
  })();

  const investmentHoldings = plaid.financialData?.investments?.data?.holdings || [];

  /* UI Logic */
  const isProcessing = ['creating_token', 'exchanging', 'fetching'].includes(plaid.step);
  const isInitializing = plaid.step === 'idle' || plaid.step === 'creating_token';
  const isDone = plaid.step === 'done';
  const canProceed = isDone && plaid.canProceed;

  const buttonText = (() => {
    if (plaid.step === 'idle' || plaid.step === 'creating_token') return 'Preparing...';
    if (plaid.step === 'linking') return 'Connecting...';
    if (plaid.step === 'exchanging') return 'Securing connection...';
    if (plaid.step === 'fetching') return 'Fetching financial data...';
    if (isDone && canProceed) return 'Continue to onboarding';
    if (plaid.step === 'error' || (isDone && !plaid.canProceed)) return 'Try Again';
    return 'Connect Bank Account';
  })();

  const handleButtonClick = () => {
    if (isDone && canProceed) {
      sessionStorage.setItem('financial_verification_complete', 'true');
      navigate('/onboarding/step-1', { replace: true });
      return;
    }
    if (plaid.step === 'error' || (isDone && !plaid.canProceed)) { plaid.retry(); return; }
    if (plaid.isReady) plaid.openPlaidLink();
  };

  const handleSkip = () => {
    sessionStorage.setItem('financial_link_skipped', 'true');
    navigate('/onboarding/step-1', { replace: true });
  };

  if (!isReady || !userId) {
    return (
      <OnboardingShell step={1} totalSteps={15} hideContinueBtn>
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <div className="w-10 h-10 border-4 border-[#EEE9E0] border-t-[#AA4528] rounded-full animate-spin mb-4" />
          <p className="text-[14px] text-[#8C8479]">Preparing your secure onboarding...</p>
        </div>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell
      step={1}
      totalSteps={15}
      continueLabel={buttonText}
      onContinue={handleButtonClick}
      continueDisabled={isInitializing || isProcessing}
      continueLoading={isProcessing}
      onBack={handleSkip}
      onClose={handleSkip}
    >
      <div className="flex flex-col">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-[2.2rem] md:text-[2.6rem] font-medium leading-tight text-[#151513] mb-3" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
            Verify Your <span className="text-gray-400 italic">Financial Profile</span>
          </h1>
          <p className="text-[15px] text-[#8C8479] leading-relaxed">
            {isDone && plaid.institution
              ? `Connected to ${plaid.institution.name}. You can continue to the next step.`
              : "We'll securely check your financial profile before starting KYC verification to ensure compliance."}
          </p>
        </div>

        {/* Status Rows */}
        <div className="space-y-4 mb-8">
          {[
            { icon: 'account_balance', title: 'Assets & Balance', status: plaid.balanceStatus, value: allAccounts.length > 0 ? `${allAccounts.length} accounts connected` : 'Not linked' },
            { icon: 'monitoring', title: 'Investments', status: plaid.investmentsStatus, value: investmentHoldings.length > 0 ? `${investmentHoldings.length} holdings identified` : 'No holdings' },
            { icon: 'badge', title: 'Bank Identity', status: identityInfo ? 'success' : 'idle', value: identityInfo ? `✓ Verified — ${identityInfo.names[0]}` : 'Not available' },
          ].map((row) => (
            <div key={row.title} className="p-4 bg-white border border-[#EEE9E0] rounded-md flex items-center justify-between group hover:border-[#AA4528] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-sm bg-[#F7F5F0] border border-[#EEE9E0] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#151513] text-[20px]">{row.icon}</span>
                </div>
                <div>
                  <p className="text-[15px] font-bold text-[#151513]">{row.title}</p>
                  <p className={`text-[12px] font-medium ${row.status === 'success' ? 'text-[#15803D]' : 'text-[#8C8479]'}`}>{row.value}</p>
                </div>
              </div>
              <span className={`material-symbols-outlined text-[18px] ${row.status === 'success' ? 'text-[#15803D]' : 'text-[#EEE9E0]'}`}>
                {row.status === 'success' ? 'check_circle' : 'chevron_right'}
              </span>
            </div>
          ))}
        </div>

        {/* Error */}
        {plaid.error && plaid.step === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-md text-center">
            <p className="text-[13px] text-red-600 font-medium">{plaid.error}</p>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex flex-col items-center pt-6 border-t border-[#F2F0EB]">
          <button onClick={handleSkip} className="text-[14px] font-semibold text-[#8C8479] hover:text-[#151513] mb-4">
            Skip for now
          </button>
          <div className="flex items-center gap-1.5 opacity-60">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            <span className="text-[11px] font-medium text-[#8C8479]">Secure bank-level 256-bit encryption</span>
          </div>
        </div>
      </div>
    </OnboardingShell>
  );
}
