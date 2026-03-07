import { useState, useEffect, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../resources/config/config';
import { upsertOnboardingData } from '../../services/onboarding/upsertOnboardingData';
import OnboardingShell from '../../components/OnboardingShell';

type RecurringFrequency = 'once_a_month' | 'twice_a_month' | 'weekly' | 'every_other_week';

// Back arrow icon
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

// Edit icon
const EditIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

// Info icon
const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

// Arrow forward icon
const ArrowForwardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12,5 19,12 12,19" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

// Wallet icon
const WalletIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-20 text-[#2b8cee]">
    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
    <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
  </svg>
);

// Close icon for modal
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Remove icon (minus) for modal
const RemoveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// Add icon (plus) for modal
const AddIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// Share class configurations
interface ShareClassInfo {
  id: string;
  name: string;
  unitPrice: number;
  tier: 'platinum' | 'gold' | 'standard';
  borderGradient: string;
  badge?: string;
}

const SHARE_CLASSES: ShareClassInfo[] = [
  {
    id: 'class_a',
    name: 'Class A',
    unitPrice: 25000000,
    tier: 'platinum',
    borderGradient: 'bg-gradient-to-b from-[#8C8479] via-[#C4BFB5] to-[#8C8479]',
    badge: 'ULTRA',
  },
  {
    id: 'class_b',
    name: 'Class B',
    unitPrice: 5000000,
    tier: 'gold',
    borderGradient: 'bg-gradient-to-b from-[#AA4528] via-[#8C3720] to-[#AA4528]',
    badge: 'PREMIUM',
  },
  {
    id: 'class_c',
    name: 'Class C',
    unitPrice: 1000000,
    tier: 'standard',
    borderGradient: 'bg-[#151513]',
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

const formatFullCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

const MIN_RECURRING_AMOUNT = 100;
const MAX_RECURRING_AMOUNT = 100000000;

const formatNumberWithCommas = (value: string): string => {
  const numbers = value.replace(/[^\d]/g, '');
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const parseFormattedNumber = (value: string): number => {
  return parseInt(value.replace(/[^\d]/g, ''), 10) || 0;
};

function OnboardingStep11() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUnits, setShareUnits] = useState<{
    class_a_units: number;
    class_b_units: number;
    class_c_units: number;
  }>({
    class_a_units: 0,
    class_b_units: 0,
    class_c_units: 0,
  });
  const [frequency, setFrequency] = useState<RecurringFrequency>('once_a_month');
  const [investmentDay, setInvestmentDay] = useState('1st');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [customAmountError, setCustomAmountError] = useState<string | null>(null);
  const [showRecurringEditor, setShowRecurringEditor] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localShareUnits, setLocalShareUnits] = useState({
    class_a_units: 0,
    class_b_units: 0,
    class_c_units: 0,
  });
  const [savingModal, setSavingModal] = useState(false);

  // Calculate total investment from share units
  const calculateTotal = (units = shareUnits) => {
    return (
      (units.class_a_units * 25000000) +
      (units.class_b_units * 5000000) +
      (units.class_c_units * 1000000)
    );
  };

  const totalInvestment = calculateTotal();
  const modalTotalInvestment = calculateTotal(localShareUnits);

  // Check if modal has changes
  const hasModalChanges =
    localShareUnits.class_a_units !== shareUnits.class_a_units ||
    localShareUnits.class_b_units !== shareUnits.class_b_units ||
    localShareUnits.class_c_units !== shareUnits.class_c_units;

  /* ─── Enable page-level scrolling ─── */
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
        .select('class_a_units, class_b_units, class_c_units, initial_investment_amount, recurring_frequency, recurring_day_of_month, recurring_amount')
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
            setCustomAmount('');
          } else {
            setSelectedAmount(null);
            setCustomAmount(amount.toLocaleString());
          }
        }
      }
    };

    loadData();
  }, []);

  // Open modal and initialize local state
  const handleOpenModal = () => {
    setLocalShareUnits({ ...shareUnits });
    setIsModalOpen(true);
  };

  // Close modal without saving
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Increment units in modal
  const handleIncrement = (classId: string) => {
    setLocalShareUnits(prev => ({
      ...prev,
      [`${classId}_units`]: (prev[`${classId}_units` as keyof typeof prev] || 0) + 1,
    }));
  };

  // Decrement units in modal
  const handleDecrement = (classId: string) => {
    setLocalShareUnits(prev => ({
      ...prev,
      [`${classId}_units`]: Math.max(0, (prev[`${classId}_units` as keyof typeof prev] || 0) - 1),
    }));
  };

  // Save modal changes to Supabase
  const handleSaveChanges = async () => {
    if (!hasModalChanges) return;

    setSavingModal(true);

    if (!config.supabaseClient) {
      setSavingModal(false);
      return;
    }

    const { data: { user } } = await config.supabaseClient.auth.getUser();
    if (!user) {
      setSavingModal(false);
      return;
    }

    const { error: upsertError } = await upsertOnboardingData(user.id, {
      class_a_units: localShareUnits.class_a_units,
      class_b_units: localShareUnits.class_b_units,
      class_c_units: localShareUnits.class_c_units,
      initial_investment_amount: modalTotalInvestment,
    });

    if (!upsertError) {
      setShareUnits({ ...localShareUnits });
      setIsModalOpen(false);
    }

    setSavingModal(false);
  };

  const handleAmountClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
    setCustomAmountError(null);
    setError(null);
  };

  const validateRecurringAmount = (rawValue: number): string | null => {
    if (rawValue === 0) return null;
    if (rawValue < MIN_RECURRING_AMOUNT) {
      return `Minimum recurring amount is $${MIN_RECURRING_AMOUNT.toLocaleString()}`;
    }
    if (rawValue > MAX_RECURRING_AMOUNT) {
      return `Maximum recurring amount is $${(MAX_RECURRING_AMOUNT / 1000000).toFixed(0)}M`;
    }
    return null;
  };

  const handleCustomAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedAmount(null);
    setError(null);

    const rawValue = e.target.value.replace(/[^\d]/g, '');
    if (rawValue.length > 12) return;

    const formattedValue = formatNumberWithCommas(rawValue);
    setCustomAmount(formattedValue);
    setCustomAmountError(validateRecurringAmount(parseFormattedNumber(formattedValue)));
  };

  const getFinalRecurringAmount = () => {
    if (selectedAmount) return selectedAmount;
    return parseFormattedNumber(customAmount);
  };

  // Get units for modal display
  const getModalUnits = (classId: string): number => {
    if (classId === 'class_a') return localShareUnits.class_a_units;
    if (classId === 'class_b') return localShareUnits.class_b_units;
    if (classId === 'class_c') return localShareUnits.class_c_units;
    return 0;
  };

  const handleContinue = async () => {
    if (totalInvestment < 1000000) {
      setError('Minimum investment is $1 million');
      return;
    }

    if (customAmountError) {
      setShowRecurringEditor(true);
      setError(customAmountError);
      return;
    }

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

    const recurringAmount = getFinalRecurringAmount();
    const convertDayToInt = (day: string | number): number => {
      if (typeof day === 'number') return day;
      if (day === 'Last') return 31;
      return parseInt(day.replace(/\D/g, ''), 10);
    };

    const convertFrequencyToDb = (freq: RecurringFrequency): string => {
      // DB constraint expects these exact values.
      return freq;
    };

    const updateData: Record<string, unknown> = {
      user_id: user.id,
      initial_investment_amount: totalInvestment,
      current_step: 12,
      updated_at: new Date().toISOString(),
    };

    if (recurringAmount > 0) {
      updateData.recurring_frequency = convertFrequencyToDb(frequency);
      updateData.recurring_day_of_month = convertDayToInt(investmentDay);
      updateData.recurring_amount = recurringAmount;
    } else {
      updateData.recurring_frequency = null;
      updateData.recurring_day_of_month = null;
      updateData.recurring_amount = null;
    }

    const { error: upsertError } = await upsertOnboardingData(user.id, updateData);

    if (upsertError) {
      setError('Failed to save data');
      setLoading(false);
      return;
    }

    navigate('/onboarding/step-13');
  };

  // Get units for a class
  const getUnits = (classId: string): number => {
    if (classId === 'class_a') return shareUnits.class_a_units;
    if (classId === 'class_b') return shareUnits.class_b_units;
    if (classId === 'class_c') return shareUnits.class_c_units;
    return 0;
  };

  const hasAnyUnits = shareUnits.class_a_units > 0 || shareUnits.class_b_units > 0 || shareUnits.class_c_units > 0;
  const recurringAmount = getFinalRecurringAmount();
  const hasValidRecurringAmount =
    !customAmountError &&
    (
      !customAmount || selectedAmount !== null ||
      (recurringAmount >= MIN_RECURRING_AMOUNT && recurringAmount <= MAX_RECURRING_AMOUNT)
    );
  const isFormValid = hasAnyUnits && totalInvestment >= 1000000 && hasValidRecurringAmount;

  const handleBack = () => {
    navigate('/onboarding/step-9');
  };

  const handleSkip = () => {
    navigate('/onboarding/step-13');
  };

  // Generate units summary text
  const getUnitsSummary = () => {
    const parts = [];
    if (shareUnits.class_a_units > 0) parts.push(`${shareUnits.class_a_units} Class A`);
    if (shareUnits.class_b_units > 0) parts.push(`${shareUnits.class_b_units} Class B`);
    if (shareUnits.class_c_units > 0) parts.push(`${shareUnits.class_c_units} Class C`);
    return parts.join(' + ') + ' units';
  };

  const getFrequencyLabel = (value: RecurringFrequency): string => {
    if (value === 'once_a_month') return 'Once a month';
    if (value === 'twice_a_month') return 'Twice a month';
    if (value === 'weekly') return 'Weekly';
    return 'Every other week';
  };

  const recurringSummaryTitle =
    recurringAmount > 0
      ? `$${recurringAmount.toLocaleString()} recurring`
      : 'No recurring investment configured';
  const recurringSummarySubtitle =
    recurringAmount > 0
      ? `${getFrequencyLabel(frequency)} \u2022 Day ${investmentDay}`
      : 'Tap Edit to add recurring amount, frequency, and day.';

  const DISPLAY_STEP = 10;
  const PROG_TOTAL = 12;
  const PROG_PCT = Math.round((DISPLAY_STEP / PROG_TOTAL) * 100);

  return (
    <OnboardingShell
      step={DISPLAY_STEP}
      totalSteps={PROG_TOTAL}
      onBack={handleBack}
      onClose={() => navigate('/dashboard')}
      continueLabel={loading ? 'Saving…' : 'Continue'}
      onContinue={handleContinue}
      continueDisabled={!isFormValid || loading}
      continueLoading={loading}
    >
      <div className="mb-8">
        <h1
          className="text-[2.2rem] md:text-[2.6rem] font-medium leading-tight text-[#151513] mb-3"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          Investment Summary
        </h1>
        <p className="text-[15px] text-[#8C8479] leading-relaxed">
          Review your selected share class units and total initial investment.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Share Class Cards */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-[14px] font-bold text-[#151513] uppercase tracking-[0.05em]">Share Class Units</h2>
          <button
            onClick={handleOpenModal}
            className="text-[13px] font-semibold text-[#AA4528] hover:text-[#8C3720] transition-colors flex items-center gap-1.5"
          >
            <EditIcon />
            Edit
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {SHARE_CLASSES.map((shareClass) => {
            const units = getUnits(shareClass.id);
            const subtotal = units * shareClass.unitPrice;
            const hasUnits = units > 0;

            return (
              <div
                key={shareClass.id}
                className={`flex flex-col rounded-md border p-5 relative overflow-hidden transition-colors ${hasUnits
                  ? 'bg-white border-[#EEE9E0]'
                  : 'bg-[#FDF9F7]/30 border-[#EEE9E0] opacity-60'
                  }`}
              >
                {/* Colored left border */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${hasUnits ? shareClass.borderGradient : 'bg-[#E5E0D8]'
                  }`} />

                <div className="pl-3">
                  {/* Header row */}
                  <div className="flex justify-between items-center mb-1">
                    <h3 className={`text-[17px] font-bold ${hasUnits ? 'text-[#151513]' : 'text-[#8C8479]'}`}>
                      {shareClass.name}
                    </h3>
                    <span className={`px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded-sm border ${hasUnits
                      ? 'bg-[#FDF9F7] text-[#AA4528] border-[#AA4528]/20'
                      : 'bg-[#F2F0EB] text-[#8C8479] border-[#EEE9E0]'
                      }`}>
                      {hasUnits ? 'active' : 'disabled'}
                    </span>
                  </div>

                  {/* Price and units row */}
                  <div className={`flex justify-between items-center text-[14px] ${hasUnits ? 'text-[#5C564D]' : 'text-[#8C8479]'}`}>
                    <span>{formatCurrency(shareClass.unitPrice)} / unit</span>
                    <span className="font-medium">{units} units</span>
                  </div>

                  {/* Subtotal */}
                  {hasUnits && (
                    <div className="pt-3 border-t border-[#F2F0EB] mt-3">
                      <p className="text-[#151513] font-semibold text-[15px] flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total Investment Card */}
      <div className="mb-8 p-6 bg-[#F7F5F0] rounded-md border border-[#EEE9E0] text-center flex flex-col items-center relative overflow-hidden">
        <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#8C8479] mb-2">
          Total Initial Investment
        </span>
        <span className="text-4xl md:text-5xl font-medium text-[#151513] mb-3" style={{ fontFamily: 'var(--font-display)' }}>
          {hasAnyUnits ? formatFullCurrency(totalInvestment) : '$0'}
        </span>
        <div className="h-[2px] w-12 bg-[#AA4528] mb-3" />
        {hasAnyUnits ? (
          <span className="text-[14px] font-medium text-[#5C564D]">
            {getUnitsSummary()}
          </span>
        ) : (
          <span className="text-[14px] text-[#8C8479]">
            Select units to continue.
          </span>
        )}
      </div>

      {/* Info Notice */}
      <div className="mb-8 p-4 bg-[#FDF9F7] border border-[#AA4528]/20 rounded-md flex gap-3 items-start">
        <span className="text-[#AA4528] shrink-0 mt-0.5">
          <InfoIcon />
        </span>
        <p className="text-[14px] text-[#5C564D] leading-relaxed">
          We are currently accepting investments of $1 million or greater for Hushh Fund A.
        </p>
      </div>

      {/* Recurring Investment */}
      <div className="mb-8">
        <h2 className="text-[14px] font-bold text-[#151513] uppercase tracking-[0.05em] mb-1">Recurring Investment</h2>
        <p className="text-[13px] text-[#8C8479] mb-4">
          Optional. Review now and edit only if needed.
        </p>

        {/* Collapsed summary + edit */}
        <div className="bg-white rounded-md border border-[#EEE9E0] p-4 flex items-center justify-between gap-3 mb-4">
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-[#151513] truncate">{recurringSummaryTitle}</p>
            <p className="text-[13px] text-[#8C8479] mt-0.5">{recurringSummarySubtitle}</p>
          </div>
          <button
            onClick={() => setShowRecurringEditor((prev) => !prev)}
            className="shrink-0 rounded bg-[#F7F5F0] hover:bg-[#EEE9E0] border border-[#EEE9E0] px-3.5 py-1.5 text-[13px] font-semibold text-[#5C564D] transition-colors"
          >
            {showRecurringEditor ? 'Hide' : 'Edit'}
          </button>
        </div>

        {showRecurringEditor && (
          <div className="border border-[#EEE9E0] rounded-md p-5 bg-[#FDFBF9] space-y-6">
            {/* Frequency Section */}
            <div>
              <h3 className="text-[14px] font-bold text-[#151513] mb-3">Frequency</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
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
                  Investment day
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

            {/* Recurring Amount */}
            <div className="pt-6 border-t border-[#EEE9E0]">
              <h3 className="text-[14px] font-bold text-[#151513] mb-3">Recurring Amount</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
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
                {!customAmount && selectedAmount === null && (
                  <p className="text-[#8C8479] text-[12px]">
                    Leave empty if you want to set recurring later.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 pt-6 border-t border-[#F2F0EB] flex gap-3">
        <button
          onClick={handleSkip}
          className="flex-1 py-3.5 rounded-md text-[14px] font-semibold text-[#8C8479] bg-[#F2F0EB] hover:bg-[#EEE9E0] transition-colors"
        >
          Skip
        </button>
        <button
          onClick={handleContinue}
          disabled={!isFormValid || loading}
          className={`flex-[2] py-3.5 rounded-md text-[14px] font-semibold transition-all ${isFormValid && !loading
            ? 'bg-[#AA4528] text-white hover:bg-[#8C3720] active:scale-[0.99]'
            : 'bg-[#EEE9E0] text-[#C4BFB5] cursor-not-allowed'
            }`}
        >
          {loading ? 'Saving…' : 'Continue'}
        </button>
      </div>

      {/* Edit Share Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#151513]/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-[480px] bg-[#F7F5F0] rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex flex-col bg-white border-b border-[#EEE9E0] px-6 py-5 sticky top-0 z-10 shrink-0">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-[22px] font-medium text-[#151513]" style={{ fontFamily: 'var(--font-display)' }}>Edit Units</h3>
                <button onClick={handleCloseModal} className="text-[#8C8479] hover:text-[#151513] transition-colors">
                  <CloseIcon />
                </button>
              </div>
              <p className="text-[14px] text-[#8C8479]">Adjust your allocation across our funds.</p>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 pb-8">
              <div className="flex flex-col gap-5">
                {SHARE_CLASSES.map((shareClass) => {
                  const units = getModalUnits(shareClass.id);

                  return (
                    <div
                      key={shareClass.id}
                      className="flex flex-col rounded-md border border-[#EEE9E0] p-5 relative overflow-hidden bg-white"
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${shareClass.borderGradient}`} />

                      <div className="pl-3">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-[17px] font-bold text-[#151513]">
                            {shareClass.name}
                          </h4>
                          {shareClass.badge && (
                            <span className={`px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded border ${shareClass.tier === 'platinum'
                              ? 'bg-[#F2F0EB] text-[#5C564D] border-[#E5E0D8]'
                              : 'bg-[#FDF9F7] text-[#AA4528] border-[#AA4528]/20'
                              }`}>
                              {shareClass.badge}
                            </span>
                          )}
                        </div>

                        <p className="text-[14px] text-[#8C8479] mb-4 border-b border-[#F2F0EB] pb-3">
                          {formatCurrency(shareClass.unitPrice)} / unit
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-[14px] font-semibold text-[#5C564D]">Allocation</span>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleDecrement(shareClass.id)}
                              disabled={units === 0}
                              className={`flex items-center justify-center w-8 h-8 rounded border transition-colors ${units === 0
                                ? 'border-[#EEE9E0] text-[#E5E0D8] bg-[#F2F0EB] cursor-not-allowed'
                                : 'border-[#C4BFB5] text-[#5C564D] hover:bg-[#F2F0EB] hover:border-[#8C8479]'
                                }`}
                            >
                              <RemoveIcon />
                            </button>

                            <span className="text-[18px] font-bold text-[#151513] min-w-[32px] text-center">
                              {units}
                            </span>

                            <button
                              onClick={() => handleIncrement(shareClass.id)}
                              className="flex items-center justify-center w-8 h-8 rounded border border-[#AA4528] text-[#AA4528] hover:bg-[#FDF9F7] transition-colors"
                            >
                              <AddIcon />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Total */}
              <div className="mt-8 bg-white rounded-md border border-[#EEE9E0] p-5 text-center flex flex-col border-t-4 border-t-[#AA4528]">
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#8C8479] mb-1">
                  New Total Selection
                </span>
                <span className="text-[28px] font-medium text-[#151513]" style={{ fontFamily: 'var(--font-display)' }}>
                  {formatFullCurrency(modalTotalInvestment)}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-white border-t border-[#EEE9E0] p-6 shrink-0 flex gap-3">
              <button
                onClick={handleCloseModal}
                className="w-1/3 py-3 rounded-md text-[14px] font-semibold text-[#5C564D] bg-[#F2F0EB] hover:bg-[#EEE9E0] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={!hasModalChanges || savingModal}
                className={`flex-1 py-3 rounded-md text-[14px] font-semibold transition-colors ${hasModalChanges && !savingModal
                  ? 'bg-[#151513] text-white hover:bg-[#2A2A2A]'
                  : 'bg-[#EEE9E0] text-[#C4BFB5] cursor-not-allowed'
                  }`}
              >
                {savingModal ? 'Saving…' : 'Update Selection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </OnboardingShell>
  );
}

export default OnboardingStep11;

