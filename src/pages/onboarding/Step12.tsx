import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../resources/config/config';
import { upsertOnboardingData } from '../../services/onboarding/upsertOnboardingData';
import OnboardingShell from '../../components/OnboardingShell';

type RecurringFrequency = 'once_a_month' | 'twice_a_month' | 'weekly' | 'every_other_week';

// Edit icon
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

// Chevron down icon
const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

// Check icon
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

// Share class configurations
interface ShareClassInfo {
  id: string;
  name: string;
  unitPrice: number;
  color: string;
}

const SHARE_CLASSES: ShareClassInfo[] = [
  {
    id: 'class_a',
    name: 'Class A',
    unitPrice: 25000000,
    color: '#E5E0D8',
  },
  {
    id: 'class_b',
    name: 'Class B',
    unitPrice: 5000000,
    color: '#AA4528',
  },
  {
    id: 'class_c',
    name: 'Class C',
    unitPrice: 1000000,
    color: '#151513',
  },
];

// Format currency for display
const formatCurrency = (amount: number): string => {
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(1)}B`;
  }
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(0)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
};

// Validation constants
const MIN_AMOUNT = 100; // Minimum $100
const MAX_AMOUNT = 100000000; // Maximum $100 million

// Format number with commas
const formatNumberWithCommas = (value: string): string => {
  const numbers = value.replace(/[^\d]/g, '');
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Parse formatted number to raw number
const parseFormattedNumber = (value: string): number => {
  return parseInt(value.replace(/[^\d]/g, '')) || 0;
};

function OnboardingStep12() {
  const navigate = useNavigate();
  const [frequency, setFrequency] = useState<RecurringFrequency>('once_a_month');
  const [investmentDay, setInvestmentDay] = useState('1st');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(750000);
  const [customAmount, setCustomAmount] = useState('');
  const [customAmountError, setCustomAmountError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Share class units state
  const [shareUnits, setShareUnits] = useState<{
    class_a_units: number;
    class_b_units: number;
    class_c_units: number;
  }>({
    class_a_units: 0,
    class_b_units: 0,
    class_c_units: 0,
  });

  // Calculate total investment from share units
  const calculateTotalInvestment = () => {
    return (
      (shareUnits.class_a_units * 25000000) +
      (shareUnits.class_b_units * 5000000) +
      (shareUnits.class_c_units * 1000000)
    );
  };

  const totalInvestment = calculateTotalInvestment();
  const hasAnyUnits = shareUnits.class_a_units > 0 || shareUnits.class_b_units > 0 || shareUnits.class_c_units > 0;

  // Calculate allocation percentages for progress bar
  const getPercentages = () => {
    if (totalInvestment === 0) return { a: 0, b: 0, c: 0 };
    const aAmount = shareUnits.class_a_units * 25000000;
    const bAmount = shareUnits.class_b_units * 5000000;
    const cAmount = shareUnits.class_c_units * 1000000;
    return {
      a: (aAmount / totalInvestment) * 100,
      b: (bAmount / totalInvestment) * 100,
      c: (cAmount / totalInvestment) * 100,
    };
  };

  const percentages = getPercentages();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!config.supabaseClient) return;

      const { data: { user } } = await config.supabaseClient.auth.getUser();
      if (!user) return;

      const { data } = await config.supabaseClient
        .from('onboarding_data')
        .select('recurring_frequency, recurring_day_of_month, recurring_amount, class_a_units, class_b_units, class_c_units')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setShareUnits({
          class_a_units: data.class_a_units || 0,
          class_b_units: data.class_b_units || 0,
          class_c_units: data.class_c_units || 0,
        });

        if (data.recurring_frequency) {
          const freqMap: Record<string, RecurringFrequency> = {
            // Current DB values (match onboarding_data_recurring_frequency_check)
            once_a_month: 'once_a_month',
            twice_a_month: 'twice_a_month',
            weekly: 'weekly',
            every_other_week: 'every_other_week',

            // Legacy values (older constraint/data)
            monthly: 'once_a_month',
            bimonthly: 'twice_a_month',
            biweekly: 'every_other_week',
          };

          const raw = String(data.recurring_frequency);
          setFrequency(freqMap[raw] || 'once_a_month');
        }
        if (data.recurring_day_of_month) {
          const dayNum = data.recurring_day_of_month;
          if (dayNum === 31) {
            setInvestmentDay('Last');
          } else {
            const suffix = dayNum === 1 ? 'st' : dayNum === 2 ? 'nd' : dayNum === 3 ? 'rd' : 'th';
            setInvestmentDay(`${dayNum}${suffix}`);
          }
        }
        if (data.recurring_amount) {
          const amount = data.recurring_amount;
          if ([500000, 750000, 1000000, 1500000].includes(amount)) {
            setSelectedAmount(amount);
          } else {
            setSelectedAmount(null);
            setCustomAmount(amount.toString());
          }
        }
      }
    };

    loadData();
  }, []);

  const handleAmountClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
    setCustomAmountError(null);
    setError(null);
  };

  // Validate custom amount input
  const validateAmount = (rawValue: number): string | null => {
    if (rawValue === 0) return null; // Empty is okay, will be caught on submit
    if (rawValue < MIN_AMOUNT) {
      return `Minimum amount is $${MIN_AMOUNT.toLocaleString()}`;
    }
    if (rawValue > MAX_AMOUNT) {
      return `Maximum amount is $${(MAX_AMOUNT / 1000000).toFixed(0)}M`;
    }
    return null;
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAmount(null);
    setError(null);

    // Extract only digits
    const rawValue = e.target.value.replace(/[^\d]/g, '');

    // Limit input to prevent extremely long numbers (max 12 digits = $999,999,999,999)
    if (rawValue.length > 12) {
      return;
    }

    // Format with commas for display
    const formattedValue = formatNumberWithCommas(rawValue);
    setCustomAmount(formattedValue);

    // Validate
    const numericValue = parseFormattedNumber(formattedValue);
    const validationError = validateAmount(numericValue);
    setCustomAmountError(validationError);
  };

  const getFinalAmount = () => {
    if (selectedAmount) return selectedAmount;
    return parseFormattedNumber(customAmount);
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    const finalAmount = getFinalAmount();
    if (finalAmount === 0) return false;
    if (customAmountError) return false;
    if (customAmount && !selectedAmount) {
      const numericValue = parseFormattedNumber(customAmount);
      if (numericValue < MIN_AMOUNT || numericValue > MAX_AMOUNT) return false;
    }
    return true;
  };

  const getUnits = (classId: string): number => {
    if (classId === 'class_a') return shareUnits.class_a_units;
    if (classId === 'class_b') return shareUnits.class_b_units;
    if (classId === 'class_c') return shareUnits.class_c_units;
    return 0;
  };

  const completeOnboarding = async (skipRecurring: boolean = false) => {
    setLoading(true);
    setError(null);

    if (!config.supabaseClient) {
      setError('Configuration error');
      setLoading(false);
      return;
    }

    const { data: { user } } = await config.supabaseClient.auth.getUser();
    if (!user) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    const finalAmount = getFinalAmount();

    const convertDayToInt = (day: string | number): number => {
      if (typeof day === 'number') return day;
      if (day === 'Last') return 31;
      return parseInt(day.replace(/\D/g, ''));
    };

    const convertFrequencyToDb = (freq: RecurringFrequency): string => {
      // DB constraint expects these exact values.
      return freq;
    };

    const updateData: Record<string, unknown> = {
      user_id: user.id,
      current_step: 12,
      is_completed: true,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!skipRecurring && finalAmount > 0) {
      updateData.recurring_frequency = convertFrequencyToDb(frequency);
      updateData.recurring_day_of_month = convertDayToInt(investmentDay);
      updateData.recurring_amount = finalAmount;
    }

    const { error: upsertError } = await upsertOnboardingData(user.id, updateData);

    if (upsertError) {
      setError('Failed to save data');
      setLoading(false);
      return;
    }

    navigate('/onboarding/step-13');
  };

  const handleContinue = () => {
    const finalAmount = getFinalAmount();

    // Check if there's already a validation error
    if (customAmountError) {
      setError(customAmountError);
      return;
    }

    // Validate amount
    if (finalAmount === 0) {
      setError('Please select or enter an amount');
      return;
    }

    if (finalAmount < MIN_AMOUNT) {
      setError(`Minimum amount is $${MIN_AMOUNT.toLocaleString()}`);
      return;
    }

    if (finalAmount > MAX_AMOUNT) {
      setError(`Maximum amount is $${(MAX_AMOUNT / 1000000).toFixed(0)}M`);
      return;
    }

    completeOnboarding(false);
  };

  const handleSkip = () => {
    completeOnboarding(true);
  };

  const handleBack = () => {
    navigate('/onboarding/step-11');
  };

  const DISPLAY_STEP = 12;
  const PROG_TOTAL = 15;

  return (
    <OnboardingShell
      step={DISPLAY_STEP}
      totalSteps={PROG_TOTAL}
      onBack={handleBack}
      onClose={() => navigate('/dashboard')}
      continueLabel={loading ? 'Saving…' : 'Continue'}
      onContinue={handleContinue}
      continueDisabled={!isFormValid() || loading}
      continueLoading={loading}
    >
      {/* Title */}
      <div className="mb-8">
        <h1
          className="text-[2.2rem] md:text-[2.6rem] font-medium leading-tight text-[#151513] mb-3"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          Make a recurring investment
        </h1>
        <p className="text-[15px] text-[#8C8479] leading-relaxed">
          Grow your wealth with periodic contributions.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Investment Allocation Progress Summary */}
      {hasAnyUnits && (
        <div className="mb-8 p-6 bg-[#F7F5F0] rounded-md border border-[#EEE9E0] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#8C8479]">
              Your Investment Allocation
            </h2>
            <button
              onClick={() => navigate('/onboarding/step-10')}
              className="text-[#AA4528] text-[13px] font-semibold hover:text-[#8C3720] transition-colors flex items-center gap-1.5"
            >
              <EditIcon />
              Edit
            </button>
          </div>

          <div className="mb-5">
            <span className="text-3xl font-medium text-[#151513]" style={{ fontFamily: 'var(--font-display)' }}>
              {formatCurrency(totalInvestment)}
            </span>
          </div>

          <div className="flex h-1.5 w-full rounded-sm overflow-hidden mb-5">
            {percentages.a > 0 && (
              <div className="h-full bg-[#E5E0D8]" style={{ width: `${percentages.a}%` }} />
            )}
            {percentages.b > 0 && (
              <div className="h-full bg-[#AA4528]" style={{ width: `${percentages.b}%` }} />
            )}
            {percentages.c > 0 && (
              <div className="h-full bg-[#151513]" style={{ width: `${percentages.c}%` }} />
            )}
          </div>

          <div className="flex flex-wrap gap-2.5">
            {SHARE_CLASSES.map((shareClass) => {
              const units = getUnits(shareClass.id);
              if (units === 0) return null;

              return (
                <div
                  key={shareClass.id}
                  className="inline-flex items-center gap-2"
                >
                  <span
                    className="size-2.5 rounded-sm"
                    style={{ backgroundColor: shareClass.color }}
                  />
                  <span className="text-[13px] font-semibold text-[#5C564D]">
                    {shareClass.name} — {units}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Editor Main Wrap */}
      <div className="border border-[#EEE9E0] rounded-md p-5 sm:p-6 bg-white space-y-8">

        {/* Frequency Section */}
        <div>
          <h3 className="text-[15px] font-bold text-[#151513] mb-4">Frequency</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {[
              { value: 'once_a_month', label: 'Once a month' },
              { value: 'twice_a_month', label: 'Twice a month' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'every_other_week', label: 'Every other week' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFrequency(option.value as RecurringFrequency)}
                className={`flex h-12 items-center justify-center rounded-md text-[14px] font-semibold transition-all ${frequency === option.value
                  ? 'bg-[#AA4528] text-white border-transparent'
                  : 'bg-white border border-[#EEE9E0] text-[#5C564D] hover:bg-[#F7F5F0]'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-semibold text-[#8C8479] uppercase tracking-wider">
              Investment days
            </label>
            <div className="relative">
              <select
                value={investmentDay}
                onChange={(e) => setInvestmentDay(e.target.value)}
                className="w-full h-12 rounded-md border border-[#EEE9E0] bg-white text-[#151513] px-4 text-[15px] font-medium focus:border-[#AA4528] focus:ring-1 focus:ring-[#AA4528]/20 outline-none appearance-none cursor-pointer"
              >
                <option value="1st">1st</option>
                <option value="2nd">2nd</option>
                <option value="5th">5th</option>
                <option value="10th">10th</option>
                <option value="15th">15th</option>
                <option value="20th">20th</option>
                <option value="25th">25th</option>
                <option value="Last">Last day of month</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#8C8479]">
                <ChevronDownIcon />
              </div>
            </div>
          </div>
        </div>

        {/* Recurring Amount Section */}
        <div className="pt-6 border-t border-[#EEE9E0]">
          <h3 className="text-[15px] font-bold text-[#151513] mb-4">Recurring Amount</h3>

          <div className="grid grid-cols-2 gap-3 mb-5">
            {[500000, 750000, 1000000, 1500000].map((amount) => (
              <button
                key={amount}
                onClick={() => handleAmountClick(amount)}
                className={`relative flex items-center justify-center h-14 rounded-md transition-all ${selectedAmount === amount
                  ? 'border-2 border-[#AA4528] bg-[#FDF9F7] text-[#AA4528]'
                  : 'border border-[#EEE9E0] bg-white hover:border-[#AA4528]/50 hover:bg-[#F7F5F0] text-[#151513]'
                  }`}
              >
                <span className="text-[15px] font-bold">
                  ${amount.toLocaleString()}
                </span>
                {selectedAmount === amount && (
                  <div className="absolute top-1.5 right-1.5 text-[#AA4528]">
                    <CheckIcon />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="relative">
              <span className={`absolute inset-y-0 left-0 pl-4 flex items-center font-medium text-[16px] ${customAmountError ? 'text-red-400' : 'text-[#8C8479]'
                }`}>
                $
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={customAmount}
                onChange={handleCustomAmountChange}
                placeholder="Other Amount"
                className={`w-full h-14 rounded-md border bg-white text-[#151513] pl-8 pr-4 text-[16px] font-bold outline-none transition-all placeholder:text-[#C4BFB5] ${customAmountError
                  ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-[#EEE9E0] focus:border-[#AA4528] focus:ring-1 focus:ring-[#AA4528]/20'
                  }`}
              />
            </div>

            {customAmountError && (
              <p className="text-red-500 text-[12px] font-medium">{customAmountError}</p>
            )}

            {!customAmountError && customAmount && (
              <p className="text-[#2D7A41] text-[12px] font-medium">
                Amount: ${parseFormattedNumber(customAmount).toLocaleString()}
              </p>
            )}

            {!customAmount && !selectedAmount && (
              <p className="text-[#8C8479] text-[12px]">
                Min: $100 &bull; Max: $100M
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Skip Section (Before shell CTA) */}
      <div className="mt-8 pt-6 border-t border-[#F2F0EB]">
        <button
          onClick={handleSkip}
          disabled={loading}
          className="w-full py-3.5 rounded-md text-[14px] font-semibold text-[#8C8479] bg-[#F2F0EB] hover:bg-[#EEE9E0] transition-colors"
        >
          I'll do this later
        </button>
      </div>

    </OnboardingShell>
  );
}

export default OnboardingStep12;
