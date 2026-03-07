import { useEffect, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../resources/config/config';
import { upsertOnboardingData } from '../../services/onboarding/upsertOnboardingData';
import OnboardingShell from '../../components/OnboardingShell';

/* ═══════════════════════════════════════════════
   TYPES & CONSTANTS
   ═══════════════════════════════════════════════ */

type RecurringFrequency = 'once_a_month' | 'twice_a_month' | 'weekly' | 'every_other_week';

interface ShareClass {
  id: string;
  name: string;
  tier: 'ultra' | 'premium' | 'standard';
  unitPrice: number;
  displayPrice: string;
  description: string;
  tierLabel?: string;
}

const SHARE_CLASSES: ShareClass[] = [
  {
    id: 'class_a',
    name: 'Class A',
    tier: 'ultra',
    unitPrice: 25000000,
    displayPrice: '$25M',
    description: 'Maximum allocation priority with exclusive institutional benefits.',
    tierLabel: 'Ultra',
  },
  {
    id: 'class_b',
    name: 'Class B',
    tier: 'premium',
    unitPrice: 5000000,
    displayPrice: '$5M',
    description: 'Enhanced portfolio access and relationship management.',
    tierLabel: 'Premium',
  },
  {
    id: 'class_c',
    name: 'Class C',
    tier: 'standard',
    unitPrice: 1000000,
    displayPrice: '$1M',
    description: 'Standard tier with full access to AI-powered multi-strategy alpha.',
  },
];

const TOTAL_STEPS = 12;
const CURRENT_STEP = 1;

const formatCurrency = (amount: number): string => {
  if (amount === 0) return '$0';
  if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`;
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(0)}M`;
  return `$${amount.toLocaleString()}`;
};

const MIN_RECURRING_AMOUNT = 100;
const MAX_RECURRING_AMOUNT = 100000000;

const formatNumberWithCommas = (value: string): string => {
  const numbers = value.replace(/[^\d]/g, '');
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const parseFormattedNumber = (value: string): number =>
  parseInt(value.replace(/[^\d]/g, ''), 10) || 0;

/* Tier badge color maps */
const TIER_COLORS: Record<string, { bg: string; text: string }> = {
  ultra: { bg: 'bg-[#AA4528]/10', text: 'text-[#AA4528]' },
  premium: { bg: 'bg-[#F7F5F0]', text: 'text-[#4A4540]' },
  standard: { bg: 'bg-[#F2F0EB]', text: 'text-[#8C8479]' },
};

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */

export default function OnboardingStep1() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [units, setUnits] = useState<Record<string, number>>({
    class_a: 0, class_b: 0, class_c: 0,
  });
  const [frequency, setFrequency] = useState<RecurringFrequency>('once_a_month');
  const [investmentDay, setInvestmentDay] = useState('1st of the month');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [customAmountError, setCustomAmountError] = useState<string | null>(null);

  const totalInvestment = SHARE_CLASSES.reduce(
    (total, sc) => total + units[sc.id] * sc.unitPrice, 0
  );
  const hasSelection = Object.values(units).some((c) => c > 0);

  /* ─── Scroll & body class ─── */
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.classList.add('onboarding-page-scroll');
    document.body.classList.add('onboarding-page-scroll');
    return () => {
      document.documentElement.classList.remove('onboarding-page-scroll');
      document.body.classList.remove('onboarding-page-scroll');
    };
  }, []);

  /* ─── Load user + existing data ─── */
  useEffect(() => {
    const getCurrentUser = async () => {
      if (!config.supabaseClient) return;
      const { data: { user } } = await config.supabaseClient.auth.getUser();
      if (!user) { navigate('/login'); return; }
      setUserId(user.id);

      const hasSkipped = sessionStorage.getItem('financial_link_skipped') === 'true';
      const hasCompleted = sessionStorage.getItem('financial_verification_complete') === 'true';

      if (!hasSkipped && !hasCompleted) {
        const { data: financialData } = await config.supabaseClient
          .from('user_financial_data')
          .select('status')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!financialData || (financialData.status !== 'complete' && financialData.status !== 'partial')) {
          navigate('/onboarding/financial-link', { replace: true });
          return;
        }
      }

      const { data: onboardingData } = await config.supabaseClient
        .from('onboarding_data')
        .select('class_a_units, class_b_units, class_c_units, recurring_frequency, recurring_day_of_month, recurring_amount')
        .eq('user_id', user.id)
        .maybeSingle();

      if (onboardingData) {
        setUnits({
          class_a: onboardingData.class_a_units || 0,
          class_b: onboardingData.class_b_units || 0,
          class_c: onboardingData.class_c_units || 0,
        });
        if (onboardingData.recurring_frequency) {
          const freqMap: Record<string, RecurringFrequency> = {
            once_a_month: 'once_a_month', twice_a_month: 'twice_a_month',
            weekly: 'weekly', every_other_week: 'every_other_week',
            monthly: 'once_a_month', bimonthly: 'twice_a_month', biweekly: 'every_other_week',
          };
          setFrequency(freqMap[String(onboardingData.recurring_frequency)] || 'once_a_month');
        }
        if (onboardingData.recurring_day_of_month) {
          const d = onboardingData.recurring_day_of_month;
          setInvestmentDay(d === 31 ? 'Last day of the month' : d === 15 ? '15th of the month' : '1st of the month');
        }
        if (onboardingData.recurring_amount) {
          const amt = onboardingData.recurring_amount;
          if ([500000, 750000, 1000000, 1500000].includes(amt)) {
            setSelectedAmount(amt); setCustomAmount('');
          } else {
            setSelectedAmount(null); setCustomAmount(amt.toLocaleString());
          }
        }
      }
    };
    getCurrentUser();
  }, [navigate]);

  /* ─── Handlers ─── */
  const handleUnitChange = (classId: string, delta: number) =>
    setUnits((prev) => ({ ...prev, [classId]: Math.max(0, prev[classId] + delta) }));

  const handleAmountClick = (amount: number) => {
    setSelectedAmount(amount); setCustomAmount(''); setCustomAmountError(null); setError(null);
  };

  const validateRecurringAmount = (v: number): string | null => {
    if (v === 0) return null;
    if (v < MIN_RECURRING_AMOUNT) return `Minimum is $${MIN_RECURRING_AMOUNT.toLocaleString()}`;
    if (v > MAX_RECURRING_AMOUNT) return `Maximum is $${(MAX_RECURRING_AMOUNT / 1000000).toFixed(0)}M`;
    return null;
  };

  const handleCustomAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedAmount(null); setError(null);
    const raw = e.target.value.replace(/[^\d]/g, '');
    if (raw.length > 12) return;
    const formatted = formatNumberWithCommas(raw);
    setCustomAmount(formatted);
    setCustomAmountError(validateRecurringAmount(parseFormattedNumber(formatted)));
  };

  const getFinalRecurringAmount = () => selectedAmount || parseFormattedNumber(customAmount);

  const handleNext = async () => {
    if (!userId || !config.supabaseClient || !hasSelection) return;
    if (customAmountError) { setError(customAmountError); return; }

    setIsLoading(true); setError(null);
    try {
      const recurringAmount = getFinalRecurringAmount();
      let dayInt = 1;
      if (investmentDay.includes('15th')) dayInt = 15;
      else if (investmentDay.includes('Last')) dayInt = 31;

      const updateData: Record<string, unknown> = {
        selected_fund: 'hushh_fund_a',
        class_a_units: units.class_a,
        class_b_units: units.class_b,
        class_c_units: units.class_c,
        initial_investment_amount: totalInvestment,
        current_step: 1,
        updated_at: new Date().toISOString(),
      };

      if (recurringAmount > 0) {
        updateData.recurring_frequency = frequency;
        updateData.recurring_day_of_month = dayInt;
        updateData.recurring_amount = recurringAmount;
      } else {
        updateData.recurring_frequency = null;
        updateData.recurring_day_of_month = null;
        updateData.recurring_amount = null;
      }

      const { error: saveError } = await upsertOnboardingData(userId, updateData);
      if (saveError) { setError(saveError.message || 'Failed to save'); return; }

      sessionStorage.removeItem('financial_link_skipped');
      sessionStorage.removeItem('financial_verification_complete');
      navigate('/onboarding/step-2');
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const freqOptions: { value: RecurringFrequency; label: string }[] = [
    { value: 'once_a_month', label: 'Once a month' },
    { value: 'twice_a_month', label: 'Twice a month' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'every_other_week', label: 'Bi-weekly' },
  ];
  const amountPresets = [500000, 750000, 1000000, 1500000];

  /* ═══════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════ */
  return (
    <OnboardingShell
      step={CURRENT_STEP}
      totalSteps={TOTAL_STEPS}
      onBack={() => navigate('/onboarding/financial-link')}
      onClose={() => navigate('/dashboard')}
      continueLabel="Continue"
      onContinue={handleNext}
      continueDisabled={!hasSelection || !!customAmountError}
      continueLoading={isLoading}
    >
      {/* ── Heading ── */}
      <div className="mb-8">
        <p className="fr-overline mb-2">Institutional Series</p>
        <h1
          className="text-[2.2rem] md:text-[2.6rem] font-medium leading-tight text-[#151513] mb-3"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          Select your{' '}
          <em className="not-italic text-[#AA4528]">share class allocation</em>
        </h1>
        <p className="text-[15px] text-[#8C8479] leading-relaxed">
          Our inaugural fund leverages AI-driven value investing. Allocate units per share class.
        </p>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
          {error}
        </div>
      )}

      {/* ── Share Class Selection Cards (Fundrise style) ── */}
      <div className="space-y-3 mb-8">
        {SHARE_CLASSES.map((sc) => {
          const count = units[sc.id];
          const isSelected = count > 0;
          const colors = TIER_COLORS[sc.tier];

          return (
            <div
              key={sc.id}
              className={`border rounded-md transition-all duration-200 overflow-hidden ${isSelected
                ? 'border-[#AA4528]/40 bg-[#FDF9F7]'
                : 'border-[#EEE9E0] bg-white hover:border-[#C4BFB5]'
                }`}
            >
              {/* Card header */}
              <div className="px-5 py-4 border-b border-[#F2F0EB] flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[16px] font-semibold text-[#151513]">{sc.name}</h3>
                    {sc.tierLabel && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${colors.bg} ${colors.text}`}>
                        {sc.tierLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-[#8C8479] leading-relaxed pr-2">{sc.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[18px] font-semibold text-[#151513]">{sc.displayPrice}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8C8479]">per unit</div>
                </div>
              </div>

              {/* Stepper */}
              <div className="px-5 py-3 flex items-center justify-between">
                <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8C8479]">Units</span>
                <div className="flex items-center gap-5">
                  <button
                    onClick={() => handleUnitChange(sc.id, -1)}
                    disabled={count === 0}
                    className="w-8 h-8 rounded-full border border-[#C4BFB5] flex items-center justify-center text-[#8C8479] disabled:opacity-40 hover:border-[#AA4528] hover:text-[#AA4528] transition-colors"
                    aria-label={`Decrease ${sc.name}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                  <span className="text-[20px] font-medium w-5 text-center text-[#151513]" style={{ fontFamily: 'var(--font-display)' }}>
                    {count}
                  </span>
                  <button
                    onClick={() => handleUnitChange(sc.id, 1)}
                    className="w-8 h-8 rounded-full border border-[#AA4528]/60 text-[#AA4528] flex items-center justify-center hover:bg-[#AA4528] hover:text-white transition-colors"
                    aria-label={`Increase ${sc.name}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Total ── */}
      {totalInvestment > 0 && (
        <div className="mb-8 px-5 py-4 bg-[#F7F5F0] rounded-md border border-[#EEE9E0] flex items-center justify-between">
          <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8C8479]">Total Initial Investment</span>
          <span className="text-[24px] font-medium text-[#AA4528]" style={{ fontFamily: 'var(--font-display)' }}>
            {formatCurrency(totalInvestment)}
          </span>
        </div>
      )}

      {/* ── Recurring Investment (Fundrise style) ── */}
      <div className="border-t border-[#F2F0EB] pt-8">
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-[18px] font-medium text-[#151513]" style={{ fontFamily: 'var(--font-display)' }}>
              Recurring Investment
            </h2>
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8C8479] bg-[#F2F0EB] px-2 py-0.5 rounded-full">
              Optional
            </span>
          </div>
          <p className="text-[13px] text-[#8C8479] leading-relaxed">
            Configure automated contributions to streamline future capital calls.
          </p>
        </div>

        {/* Frequency */}
        <div className="mb-5">
          <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8C8479] mb-3">
            Frequency
          </label>
          <div className="grid grid-cols-2 gap-2">
            {freqOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFrequency(opt.value)}
                className={`py-2.5 px-3 text-[14px] font-medium rounded-md border text-center transition-colors ${frequency === opt.value
                  ? 'bg-[#FDF9F7] text-[#AA4528] border-[#AA4528]/40'
                  : 'bg-white text-[#4A4540] border-[#EEE9E0] hover:border-[#C4BFB5]'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Investment Day */}
        <div className="mb-5">
          <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8C8479] mb-2">
            Investment Day
          </label>
          <div className="relative">
            <select
              value={investmentDay}
              onChange={(e) => setInvestmentDay(e.target.value)}
              className="w-full appearance-none bg-white border border-[#EEE9E0] rounded-md py-3 px-4 pr-9 text-[15px] text-[#151513] focus:outline-none focus:border-[#AA4528] focus:ring-1 focus:ring-[#AA4528]/20 transition-colors"
            >
              <option>1st of the month</option>
              <option>15th of the month</option>
              <option>Last day of the month</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#8C8479]">
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </div>
          </div>
        </div>

        {/* Recurring Amount */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8C8479] mb-3">
            Recurring Amount
          </label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {amountPresets.map((amt) => (
              <button
                key={amt}
                onClick={() => handleAmountClick(amt)}
                className={`py-2.5 px-3 text-[14px] font-medium rounded-md border text-center transition-colors ${selectedAmount === amt
                  ? 'bg-[#FDF9F7] text-[#AA4528] border-[#AA4528]/40'
                  : 'bg-white text-[#4A4540] border-[#EEE9E0] hover:border-[#C4BFB5]'
                  }`}
              >
                ${(amt / 1000).toLocaleString()}k
              </button>
            ))}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-[#8C8479] text-[15px] font-medium">$</span>
            </div>
            <input
              type="text"
              inputMode="numeric"
              value={customAmount}
              onChange={handleCustomAmountChange}
              placeholder="Enter custom amount"
              className={`block w-full pl-8 pr-4 py-3 border rounded-md bg-white text-[#151513] placeholder-[#C4BFB5] focus:outline-none focus:ring-1 text-[15px] transition-colors ${customAmountError
                ? 'border-red-300 focus:ring-red-300 focus:border-red-400'
                : 'border-[#EEE9E0] focus:border-[#AA4528] focus:ring-[#AA4528]/20'
                }`}
            />
          </div>
          {customAmountError && (
            <p className="text-red-500 text-[12px] mt-1.5">{customAmountError}</p>
          )}
        </div>
      </div>

      {/* ── Bottom CTA (inside card on desktop, mirrors Fundrise "Continue" button behavior) ── */}
      <div className="mt-8 pt-6 border-t border-[#F2F0EB]">
        <button
          onClick={handleNext}
          disabled={!hasSelection || isLoading || !!customAmountError}
          className={`w-full py-3.5 rounded-md text-[15px] font-semibold transition-all ${!hasSelection || isLoading || !!customAmountError
            ? 'bg-[#EEE9E0] text-[#C4BFB5] cursor-not-allowed'
            : 'bg-[#AA4528] text-white hover:bg-[#8C3720] active:scale-[0.99]'
            }`}
        >
          {isLoading ? 'Saving…' : 'Continue'}
        </button>
        <p className="text-[11px] text-center text-[#8C8479] mt-3">
          Minimum investment per unit · Units can be adjusted later
        </p>
      </div>
    </OnboardingShell>
  );
}
