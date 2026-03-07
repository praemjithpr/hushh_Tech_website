import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../resources/config/config';
import { upsertOnboardingData } from '../../services/onboarding/upsertOnboardingData';
import OnboardingShell from '../../components/OnboardingShell';
import { fetchAuthNumbers } from '../../services/plaid/plaidService';

// SVG Icons
// BackIcon removed as unused

// BankIcon removed as unused

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#AA4528" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

// ArrowForwardIcon removed as unused

// Share class pill icons
const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#D4AF37" stroke="#D4AF37" strokeWidth="1">
    <polygon points="12,2 15,8.5 22,9.3 17,14 18.2,21 12,17.5 5.8,21 7,14 2,9.3 9,8.5" />
  </svg>
);

const DiamondIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3H18L22 9L12 21L2 9L6 3Z" />
  </svg>
);

const VerifiedIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2b8cee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L15 5L19 5L19 9L22 12L19 15L19 19L15 19L12 22L9 19L5 19L5 15L2 12L5 9L5 5L9 5L12 2Z" />
    <polyline points="9,12 11,14 15,10" />
  </svg>
);

// Share class configurations
interface ShareClassInfo {
  id: string;
  name: string;
  unitPrice: number;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
}

const SHARE_CLASSES: ShareClassInfo[] = [
  {
    id: 'class_a',
    name: 'Class A',
    unitPrice: 25000000,
    color: '#8C8479',
    bgColor: '#FDFBF9',
    borderColor: '#E5E0D8',
    icon: <DiamondIcon />,
  },
  {
    id: 'class_b',
    name: 'Class B',
    unitPrice: 5000000,
    color: '#AA4528',
    bgColor: '#FDF9F7',
    borderColor: 'rgba(170, 69, 40, 0.2)',
    icon: <StarIcon />,
  },
  {
    id: 'class_c',
    name: 'Class C',
    unitPrice: 1000000,
    color: '#151513',
    bgColor: '#F7F5F0',
    borderColor: 'rgba(21, 21, 19, 0.1)',
    icon: <VerifiedIcon />,
  },
];

// Country list
const COUNTRIES = [
  { code: '', name: 'Select Country' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SG', name: 'Singapore' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'AU', name: 'Australia' },
  { code: 'JP', name: 'Japan' },
  { code: 'IN', name: 'India' },
  { code: 'AE', name: 'United Arab Emirates' },
];

// Plaid account from auth/get response
interface PlaidAccount {
  accountId: string;
  name: string;
  mask: string; // last 4 digits
  subtype: string;
  achAccount: string;
  achRouting: string;
}

// Known Plaid sandbox test values — never auto-fill these in production
const SANDBOX_TEST_ACCOUNTS = new Set([
  '1111222233330000', '1111222233331111', '2222333344440000',
  '3333444455550000', '6666777788880000', '0000000000000000',
]);
const SANDBOX_TEST_ROUTING = new Set([
  '011401533', '021000021', '011000015', '054001725',
]);

// Validate Plaid-returned data before auto-filling
const isValidPlaidAccountNumber = (value: string): boolean => {
  if (!value || value.length < 4 || value.length > 17) return false;
  if (!/^\d+$/.test(value)) return false;
  if (SANDBOX_TEST_ACCOUNTS.has(value)) return false;
  return true;
};

const isValidPlaidRoutingNumber = (value: string): boolean => {
  if (!value || value.length !== 9) return false;
  if (!/^\d+$/.test(value)) return false;
  if (SANDBOX_TEST_ROUTING.has(value)) return false;
  return true;
};

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

function OnboardingStep13() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true); // Data fetch loading
  const [error, setError] = useState<string | null>(null);

  // Plaid auto-fill status message (shown as banner)
  const [autoFillMessage, setAutoFillMessage] = useState<string | null>(null);

  // Cleanup refs for async operations
  const autoFillTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  // Track which fields user has manually edited (prevents Plaid overwrite)
  const userModifiedFields = useRef(new Set<string>());

  // Plaid multi-account state
  const [plaidAccounts, setPlaidAccounts] = useState<PlaidAccount[]>([]);
  const [selectedAccountIdx, setSelectedAccountIdx] = useState(0);
  const [plaidInstitutionName, setPlaidInstitutionName] = useState('');

  // Banking form state
  const [bankName, setBankName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [bankCity, setBankCity] = useState('');
  const [bankCountry, setBankCountry] = useState('');
  const [accountType, setAccountType] = useState<'checking' | 'savings'>('checking');
  const [selectedOnboardingAccountType, setSelectedOnboardingAccountType] = useState('');

  // Touched state for showing validation errors only after user interaction
  const [touched, setTouched] = useState({
    bankName: false,
    accountHolderName: false,
    accountNumber: false,
    confirmAccountNumber: false,
    routingNumber: false,
    bankCountry: false,
    bankCity: false,
  });

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

  // formattedOnboardingAccountType removed as unused

  // Cleanup on unmount — clear timeouts, mark unmounted
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (autoFillTimeoutRef.current) clearTimeout(autoFillTimeoutRef.current);
    };
  }, []);

  // Apply selected account from multi-account picker
  const applyAccountSelection = useCallback((account: PlaidAccount) => {
    if (!userModifiedFields.current.has('accountNumber')) {
      setAccountNumber(account.achAccount);
      setConfirmAccountNumber(account.achAccount);
    }
    if (!userModifiedFields.current.has('routingNumber')) {
      setRoutingNumber(account.achRouting);
    }
    if (!userModifiedFields.current.has('accountType')) {
      const subtype = account.subtype as 'checking' | 'savings';
      if (subtype === 'checking' || subtype === 'savings') setAccountType(subtype);
    }
  }, []);

  // ─── Plaid Auto-Fill Logic ───
  // Fetches ACH account/routing numbers from Plaid via the user's stored access_token.
  // Validates data before auto-filling (rejects sandbox test values).
  // If multiple accounts exist, shows picker instead of blindly selecting the first.
  const attemptPlaidAutoFill = async (
    userId: string,
    dbHasBankName: boolean,
    dbHasCountry: boolean,
  ) => {
    if (!config.supabaseClient) return;

    try {
      // 1. Check if user has a Plaid access token from the financial link step
      const { data: financialData } = await config.supabaseClient
        .from('user_financial_data')
        .select('plaid_access_token, institution_name')
        .eq('user_id', userId)
        .maybeSingle();

      if (!financialData?.plaid_access_token) return; // No linked bank — nothing to auto-fill
      if (!isMountedRef.current) return;

      setAutoFillMessage('🔍 Auto-filling from your linked bank...');
      console.log('[Step13] Plaid access_token found, fetching auth numbers...');

      // 2. Fetch ACH auth numbers from Plaid via Edge Function
      const authData = await fetchAuthNumbers(financialData.plaid_access_token);
      if (!isMountedRef.current) return;

      // Handle expired/invalid access token
      if (!authData) {
        console.warn('[Step13] Plaid returned no auth data — token may be expired');
        setAutoFillMessage('⚠️ Bank connection expired. Please enter details manually.');
        autoFillTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) setAutoFillMessage(null);
        }, 5000);
        return;
      }

      const achNumbers = authData.numbers?.ach || [];
      const accounts = authData.accounts || [];

      // Handle no ACH accounts (bank doesn't support ACH)
      if (achNumbers.length === 0) {
        console.warn('[Step13] No ACH accounts returned from Plaid');
        setAutoFillMessage('⚠️ Your bank does not support ACH. Please enter details manually.');
        autoFillTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) setAutoFillMessage(null);
        }, 5000);
        return;
      }

      // 3. Map Plaid response to our PlaidAccount format
      const mappedAccounts: PlaidAccount[] = achNumbers.map((ach: any) => {
        const matched = accounts.find((a: any) => a.account_id === ach.account_id) as any;
        return {
          accountId: ach.account_id || '',
          name: matched?.name || matched?.official_name || 'Account',
          mask: matched?.mask || (ach.account ? ach.account.slice(-4) : '****'),
          subtype: matched?.subtype || 'checking',
          achAccount: ach.account || '',
          achRouting: ach.routing || '',
        };
      });

      // 4. Validate data — reject sandbox/test values
      const hasAnySandboxData = mappedAccounts.some(
        (acct) =>
          SANDBOX_TEST_ACCOUNTS.has(acct.achAccount) ||
          SANDBOX_TEST_ROUTING.has(acct.achRouting),
      );

      if (hasAnySandboxData) {
        console.error('[Step13] 🚨 Sandbox test data detected — NOT auto-filling in production');
        setAutoFillMessage('⚠️ Test bank data detected. Please enter your real bank details.');
        autoFillTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) setAutoFillMessage(null);
        }, 6000);
        return;
      }

      // Filter out accounts with invalid data
      const validAccounts = mappedAccounts.filter(
        (acct) => isValidPlaidAccountNumber(acct.achAccount) && isValidPlaidRoutingNumber(acct.achRouting),
      );

      if (validAccounts.length === 0) {
        console.warn('[Step13] No valid accounts after validation');
        setAutoFillMessage('⚠️ Could not verify bank details. Please enter manually.');
        autoFillTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) setAutoFillMessage(null);
        }, 5000);
        return;
      }

      // 5. Set accounts for picker UI
      setPlaidAccounts(validAccounts);
      if (financialData.institution_name) setPlaidInstitutionName(financialData.institution_name);

      // 6. Auto-fill logic depends on number of accounts
      if (validAccounts.length === 1) {
        // Single account — auto-fill directly
        const account = validAccounts[0];
        setSelectedAccountIdx(0);

        if (!userModifiedFields.current.has('accountNumber')) {
          setAccountNumber(account.achAccount);
          setConfirmAccountNumber(account.achAccount);
        }
        if (!userModifiedFields.current.has('routingNumber')) {
          setRoutingNumber(account.achRouting);
        }
        if (!userModifiedFields.current.has('accountType')) {
          const subtype = account.subtype as 'checking' | 'savings';
          if (subtype === 'checking' || subtype === 'savings') setAccountType(subtype);
        }

        setAutoFillMessage('✅ Bank details auto-filled from Plaid');
      } else {
        // Multiple accounts — show picker, DON'T auto-select
        // User must explicitly choose which account to use
        setSelectedAccountIdx(-1); // -1 = nothing selected yet
        setAutoFillMessage('👆 Select which bank account to use for wire transfers');
      }

      // Fill bank name & country only if not already set
      if (financialData.institution_name && !dbHasBankName && !userModifiedFields.current.has('bankName')) {
        setBankName(financialData.institution_name);
      }
      if (!dbHasCountry && !userModifiedFields.current.has('bankCountry')) {
        setBankCountry('US'); // ACH = US-only
      }

      console.log('[Step13] Plaid auto-fill complete:', {
        accountsFound: validAccounts.length,
        institution: financialData.institution_name,
      });

      // Clear success message after delay
      autoFillTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) setAutoFillMessage(null);
      }, 5000);
    } catch (err) {
      console.error('[Step13] Plaid auto-fill failed:', err);
      if (isMountedRef.current) {
        setAutoFillMessage('⚠️ Could not auto-fill bank details. Please enter manually.');
        autoFillTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) setAutoFillMessage(null);
        }, 5000);
      }
    }
  };

  // Load existing data
  /* ─── Enable page-level scrolling ─── */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!config.supabaseClient) { setPageLoading(false); return; }

      try {
        const { data: { user } } = await config.supabaseClient.auth.getUser();
        if (!user) { setPageLoading(false); return; }

        const { data } = await config.supabaseClient
          .from('onboarding_data')
          .select(`
          class_a_units, class_b_units, class_c_units,
          account_type,
          legal_first_name, legal_last_name,
          bank_name, bank_account_holder_name, bank_account_type,
          bank_routing_number, bank_address_city, bank_address_country
        `)
          .eq('user_id', user.id)
          .maybeSingle();

        // Track what DB already has so we know what's "pre-filled" vs "empty"
        let dbHasBankName = false;
        let dbHasCountry = false;

        if (data) {
          setShareUnits({
            class_a_units: data.class_a_units || 0,
            class_b_units: data.class_b_units || 0,
            class_c_units: data.class_c_units || 0,
          });

          if (data.legal_first_name && data.legal_last_name && !data.bank_account_holder_name) {
            setAccountHolderName(`${data.legal_first_name} ${data.legal_last_name}`);
          }

          if (data.bank_name) { setBankName(data.bank_name); dbHasBankName = true; }
          if (data.bank_account_holder_name) setAccountHolderName(data.bank_account_holder_name);
          if (data.bank_account_type) setAccountType(data.bank_account_type as 'checking' | 'savings');
          if (data.account_type) setSelectedOnboardingAccountType(String(data.account_type));
          if (data.bank_routing_number) setRoutingNumber(data.bank_routing_number);
          if (data.bank_address_city) setBankCity(data.bank_address_city);
          if (data.bank_address_country) { setBankCountry(data.bank_address_country); dbHasCountry = true; }
        }

        // --- Plaid Auto-Fill ---
        // Only attempt if user hasn't already saved bank data in a previous session
        const hasBankDataAlready = data?.bank_routing_number;
        if (!hasBankDataAlready) {
          await attemptPlaidAutoFill(user.id, dbHasBankName, dbHasCountry);
        }
      } catch (err) {
        console.error('[Step13] Error loading data:', err);
      } finally {
        setPageLoading(false);
      }
    };

    loadData();
  }, []);

  // Get units for a class
  const getUnits = (classId: string): number => {
    if (classId === 'class_a') return shareUnits.class_a_units;
    if (classId === 'class_b') return shareUnits.class_b_units;
    if (classId === 'class_c') return shareUnits.class_c_units;
    return 0;
  };

  // Mark field as touched on blur
  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Validation functions for each field
  const validateBankName = (value: string): string | null => {
    if (!value.trim()) return 'Bank name is required';
    if (value.trim().length < 2) return 'Bank name must be at least 2 characters';
    if (value.trim().length > 100) return 'Bank name is too long';
    return null;
  };

  const validateAccountHolderName = (value: string): string | null => {
    if (!value.trim()) return 'Account holder name is required';
    if (value.trim().length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z\s\-'.]+$/.test(value.trim())) return 'Name should only contain letters';
    if (value.trim().length > 100) return 'Name is too long';
    return null;
  };

  const validateAccountNumber = (value: string): string | null => {
    if (!value.trim()) return 'Account number is required';
    if (!/^\d+$/.test(value)) return 'Account number must contain only digits';
    if (value.length < 4) return 'Account number must be at least 4 digits';
    if (value.length > 17) return 'Account number is too long';
    return null;
  };

  const validateConfirmAccountNumber = (value: string, original: string): string | null => {
    if (!value.trim()) return 'Please confirm your account number';
    if (value !== original) return 'Account numbers do not match';
    return null;
  };

  const validateBankCountry = (value: string): string | null => {
    if (!value) return 'Please select a country';
    return null;
  };

  const validateRoutingNumber = (value: string, country: string): string | null => {
    if (!value.trim()) return 'Routing number is required';
    if (!/^\d+$/.test(value)) return 'Routing number must contain only digits';
    // US routing numbers must be exactly 9 digits
    if (country === 'US' && value.length !== 9) return 'US routing number must be exactly 9 digits';
    // For other countries, allow 5-15 digits
    if (country !== 'US' && (value.length < 5 || value.length > 15)) return 'Routing number must be 5-15 digits';
    return null;
  };

  // Get error for each field
  const bankNameError = validateBankName(bankName);
  const accountHolderNameError = validateAccountHolderName(accountHolderName);
  const accountNumberError = validateAccountNumber(accountNumber);
  const confirmAccountNumberError = validateConfirmAccountNumber(confirmAccountNumber, accountNumber);
  const bankCountryError = validateBankCountry(bankCountry);
  const routingNumberError = validateRoutingNumber(routingNumber, bankCountry);

  // Check if form is valid
  const isFormValid = (): boolean => {
    return (
      !bankNameError &&
      !accountHolderNameError &&
      !accountNumberError &&
      !confirmAccountNumberError &&
      !bankCountryError &&
      !routingNumberError
    );
  };

  // Save banking info and continue
  const handleContinue = async () => {
    if (!bankName.trim()) {
      setError('Please enter your bank name');
      return;
    }
    if (!accountHolderName.trim()) {
      setError('Please enter the account holder name');
      return;
    }
    if (!accountNumber.trim()) {
      setError('Please enter your account number');
      return;
    }
    if (accountNumber !== confirmAccountNumber) {
      setError('Account numbers do not match');
      return;
    }
    if (!bankCountry) {
      setError('Please select your bank country');
      return;
    }
    if (!routingNumber.trim()) {
      setError('Please enter the routing number');
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

    // ⚠️ NOTE: btoa() is base64 ENCODING, not encryption.
    // TODO: Replace with server-side AES-256 encryption or Supabase Vault for production security.
    const encryptedAccountNumber = btoa(accountNumber);

    const { error: upsertError } = await upsertOnboardingData(user.id, {
      bank_name: bankName.trim(),
      bank_account_holder_name: accountHolderName.trim(),
      bank_account_number_encrypted: encryptedAccountNumber,
      bank_routing_number: routingNumber.trim(),
      bank_address_city: bankCity.trim() || null,
      bank_address_country: bankCountry,
      bank_account_type: accountType,
      banking_info_skipped: false,
      banking_info_submitted_at: new Date().toISOString(),
      current_step: 13,
      is_completed: true,
      completed_at: new Date().toISOString(),
    });

    if (upsertError) {
      setError('Failed to save banking information');
      setLoading(false);
      return;
    }

    navigate('/onboarding/meet-ceo');
  };

  // Skip and continue later
  const handleSkip = async () => {
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

    const { error: upsertError } = await upsertOnboardingData(user.id, {
      banking_info_skipped: true,
      current_step: 13,
      is_completed: true,
      completed_at: new Date().toISOString(),
    });

    if (upsertError) {
      setError('Failed to save data');
      setLoading(false);
      return;
    }

    navigate('/onboarding/meet-ceo');
  };

  const handleBack = () => {
    navigate('/onboarding/step-11');
  };

  const DISPLAY_STEP = 13;
  const PROG_TOTAL = 15;

  return (
    <OnboardingShell
      step={DISPLAY_STEP}
      totalSteps={PROG_TOTAL}
      onBack={handleBack}
      onClose={() => navigate('/dashboard')}
      continueLabel={loading ? 'Saving…' : 'Continue'}
      onContinue={handleContinue}
      continueDisabled={loading || !isFormValid()}
      continueLoading={loading}
    >
      <div className="mb-8">
        <h1
          className="text-[2.2rem] md:text-[2.6rem] font-medium leading-tight text-[#151513] mb-3"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          Bank Details
        </h1>
        <p className="text-[15px] text-[#8C8479] leading-relaxed">
          Provide your banking information for secure investment transfers.
        </p>
      </div>

      {pageLoading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-[120px] bg-[#EEE9E0] rounded-md" />
          <div className="space-y-0 rounded-md overflow-hidden border border-[#EEE9E0]">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-[#F2F0EB] border-b border-[#EEE9E0]" />)}
          </div>
          <div className="flex justify-center pt-4">
            <div className="w-10 h-10 border-4 border-[#EEE9E0] border-t-[#AA4528] rounded-full animate-spin" />
          </div>
          <p className="text-center text-[13px] text-[#8C8479]">Loading your data...</p>
        </div>
      )}

      {!pageLoading && <>
        {error && (
          <div className="mb-6 mx-1 p-4 bg-red-50 border border-red-100 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Plaid Auto-Fill Banner */}
        {autoFillMessage && (
          <div className="mb-6 mx-1 p-3 bg-[#FDF9F7] border border-[#AA4528]/20 rounded-md text-[#AA4528] text-sm font-medium text-center animate-pulse">
            {autoFillMessage}
          </div>
        )}

        {/* Multi-Account Selector — shown when Plaid returns 2+ accounts */}
        {plaidAccounts.length > 1 && (
          <div className="mb-8">
            <div className="bg-white rounded-md border border-[#EEE9E0] p-5">
              <p className="text-[12px] font-bold tracking-widest text-[#8C8479] uppercase mb-4">
                {plaidInstitutionName ? `${plaidInstitutionName} - ` : ''}Select Account
              </p>
              <div className="space-y-3">
                {plaidAccounts.map((acct, idx) => {
                  const isSelected = idx === selectedAccountIdx;
                  return (
                    <button
                      key={acct.accountId || idx}
                      type="button"
                      onClick={() => {
                        setSelectedAccountIdx(idx);
                        userModifiedFields.current.delete('accountNumber');
                        userModifiedFields.current.delete('confirmAccountNumber');
                        userModifiedFields.current.delete('routingNumber');
                        userModifiedFields.current.delete('accountType');
                        applyAccountSelection(acct);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-md border transition-all text-left ${isSelected
                        ? 'border-[#AA4528] bg-[#FDF9F7] ring-1 ring-[#AA4528]/20'
                        : 'border-[#EEE9E0] bg-white hover:bg-[#F7F5F0]'
                        }`}
                      aria-label={`Select ${acct.name} ending in ${acct.mask}`}
                    >
                      {/* Radio indicator */}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-[#AA4528]' : 'border-[#C4BFB5]'
                        }`}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#AA4528]" />}
                      </div>
                      {/* Account info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-bold text-[#151513] truncate">{acct.name}</p>
                        <p className="text-[13px] text-[#8C8479]">
                          {acct.subtype.charAt(0).toUpperCase() + acct.subtype.slice(1)} &middot; &bull;&bull;&bull;&bull;{acct.mask}
                        </p>
                      </div>
                      {/* Selected check */}
                      {isSelected && (
                        <span className="text-[#AA4528] text-xl font-bold">
                          <span className="material-symbols-outlined text-[20px]">check</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Investment Amount Summary */}
        {hasAnyUnits && (
          <div className="mb-8">
            <div className="bg-[#F7F5F0] rounded-md border border-[#EEE9E0] p-6 text-center">
              <p className="text-[12px] font-bold tracking-[0.1em] text-[#8C8479] uppercase mb-2">
                Investment Amount
              </p>
              <div className="text-3xl font-medium text-[#151513] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                {formatCurrency(totalInvestment)}
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {SHARE_CLASSES.map((shareClass) => {
                  const units = getUnits(shareClass.id);
                  if (units === 0) return null;

                  return (
                    <div
                      key={shareClass.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm"
                      style={{
                        backgroundColor: shareClass.bgColor,
                        border: `1px solid ${shareClass.borderColor}`,
                      }}
                    >
                      {shareClass.icon}
                      <span
                        className="text-[12px] font-bold"
                        style={{ color: shareClass.color }}
                      >
                        {shareClass.name} — {units}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Banking Information Form */}
        <div className="mb-8 space-y-6">
          <h2 className="text-[14px] font-bold text-[#151513] uppercase tracking-[0.05em] border-b border-[#EEE9E0] pb-2">
            Banking Information
          </h2>

          <div className="space-y-4">
            {/* Bank Name */}
            <div>
              <label className="block text-[13px] font-bold text-[#5C564D] mb-1.5 uppercase tracking-wide">
                Bank Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => { userModifiedFields.current.add('bankName'); setBankName(e.target.value); }}
                onBlur={() => handleBlur('bankName')}
                placeholder="Bank Name"
                className={`w-full h-12 rounded-md border bg-white px-4 text-[16px] text-[#151513] placeholder:text-[#C4BFB5] outline-none transition-all ${touched.bankName && bankNameError
                  ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-[#EEE9E0] focus:border-[#AA4528] focus:ring-1 focus:ring-[#AA4528]/20'
                  }`}
              />
              {touched.bankName && bankNameError && <p className="mt-1.5 text-[12px] text-red-500">{bankNameError}</p>}
            </div>

            {/* Holder Name */}
            <div>
              <label className="block text-[13px] font-bold text-[#5C564D] mb-1.5 uppercase tracking-wide">
                Account Holder Name
              </label>
              <input
                type="text"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                onBlur={() => handleBlur('accountHolderName')}
                placeholder="Account Holder Name"
                className={`w-full h-12 rounded-md border bg-white px-4 text-[16px] text-[#151513] placeholder:text-[#C4BFB5] outline-none transition-all ${touched.accountHolderName && accountHolderNameError
                  ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-[#EEE9E0] focus:border-[#AA4528] focus:ring-1 focus:ring-[#AA4528]/20'
                  }`}
              />
              <p className="mt-1.5 text-[12px] text-[#8C8479]">Ensure the account holder name matches your ID exactly.</p>
              {touched.accountHolderName && accountHolderNameError && <p className="mt-1.5 text-[12px] text-red-500">{accountHolderNameError}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Account Type */}
              <div>
                <label className="block text-[13px] font-bold text-[#5C564D] mb-1.5 uppercase tracking-wide">
                  Account Type
                </label>
                <div className="relative">
                  <select
                    value={accountType}
                    onChange={(e) => { userModifiedFields.current.add('accountType'); setAccountType(e.target.value as any); }}
                    className="w-full h-12 rounded-md border border-[#EEE9E0] bg-white px-4 text-[15px] text-[#151513] focus:border-[#AA4528] focus:ring-1 focus:ring-[#AA4528]/20 outline-none appearance-none cursor-pointer"
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#8C8479]">
                    <ChevronDownIcon />
                  </div>
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-[13px] font-bold text-[#5C564D] mb-1.5 uppercase tracking-wide">
                  Country
                </label>
                <div className="relative">
                  <select
                    value={bankCountry}
                    onChange={(e) => { userModifiedFields.current.add('bankCountry'); setBankCountry(e.target.value); handleBlur('bankCountry'); }}
                    onBlur={() => handleBlur('bankCountry')}
                    className={`w-full h-12 rounded-md border bg-white px-4 text-[15px] text-[#151513] focus:border-[#AA4528] focus:ring-1 focus:ring-[#AA4528]/20 outline-none appearance-none cursor-pointer ${touched.bankCountry && bankCountryError ? 'border-red-400' : 'border-[#EEE9E0]'
                      }`}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code} disabled={c.code === ''}>{c.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#8C8479]">
                    <ChevronDownIcon />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Details Form */}
        <div className="mb-8 space-y-6">
          <h2 className="text-[14px] font-bold text-[#151513] uppercase tracking-[0.05em] border-b border-[#EEE9E0] pb-2">
            Account Details
          </h2>

          <div className="space-y-4">
            {/* Routing Number */}
            <div>
              <label className="block text-[13px] font-bold text-[#5C564D] mb-1.5 uppercase tracking-wide">
                Routing Number
              </label>
              <input
                type="tel"
                inputMode="numeric"
                value={routingNumber}
                onChange={(e) => { userModifiedFields.current.add('routingNumber'); setRoutingNumber(e.target.value.replace(/\D/g, '').slice(0, bankCountry === 'US' ? 9 : 15)); }}
                onBlur={() => handleBlur('routingNumber')}
                placeholder={bankCountry === 'US' ? '9 digits' : 'Routing number'}
                maxLength={bankCountry === 'US' ? 9 : 15}
                className={`w-full h-12 rounded-md border bg-white px-4 text-[16px] text-[#151513] placeholder:text-[#C4BFB5] outline-none transition-all font-mono ${touched.routingNumber && routingNumberError
                  ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-[#EEE9E0] focus:border-[#AA4528] focus:ring-1 focus:ring-[#AA4528]/20'
                  }`}
              />
              <p className="mt-1.5 text-[12px] text-[#8C8479]">Routing number can be found on the bottom left of your check.</p>
              {touched.routingNumber && routingNumberError && <p className="mt-1.5 text-[12px] text-red-500">{routingNumberError}</p>}
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-[13px] font-bold text-[#5C564D] mb-1.5 uppercase tracking-wide">
                Account Number
              </label>
              <input
                type="tel"
                inputMode="numeric"
                value={accountNumber}
                onChange={(e) => { userModifiedFields.current.add('accountNumber'); setAccountNumber(e.target.value.replace(/\D/g, '')); }}
                onBlur={() => handleBlur('accountNumber')}
                placeholder="Account Number"
                className={`w-full h-12 rounded-md border bg-white px-4 text-[16px] text-[#151513] placeholder:text-[#C4BFB5] outline-none transition-all font-mono ${touched.accountNumber && accountNumberError
                  ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-[#EEE9E0] focus:border-[#AA4528] focus:ring-1 focus:ring-[#AA4528]/20'
                  }`}
              />
              {touched.accountNumber && accountNumberError && <p className="mt-1.5 text-[12px] text-red-500">{accountNumberError}</p>}
            </div>

            {/* Confirm Account Number */}
            <div>
              <label className="block text-[13px] font-bold text-[#5C564D] mb-1.5 uppercase tracking-wide">
                Confirm Account Number
              </label>
              <input
                type="tel"
                inputMode="numeric"
                value={confirmAccountNumber}
                onChange={(e) => { userModifiedFields.current.add('confirmAccountNumber'); setConfirmAccountNumber(e.target.value.replace(/\D/g, '')); }}
                onBlur={() => handleBlur('confirmAccountNumber')}
                placeholder="Re-enter number"
                className={`w-full h-12 rounded-md border bg-white px-4 text-[16px] text-[#151513] placeholder:text-[#C4BFB5] outline-none transition-all font-mono ${touched.confirmAccountNumber && confirmAccountNumberError
                  ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-[#EEE9E0] focus:border-[#AA4528] focus:ring-1 focus:ring-[#AA4528]/20'
                  }`}
              />
              {touched.confirmAccountNumber && confirmAccountNumberError && <p className="mt-1.5 text-[12px] text-red-500">{confirmAccountNumberError}</p>}
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex flex-col items-center justify-center mt-6 mb-8 py-6 bg-[#FDFBF9] rounded-md border border-[#EEE9E0]">
          <div className="flex items-center space-x-2 text-[#AA4528] mb-1">
            <LockIcon />
            <span className="text-[14px] font-bold">Bank-level Security</span>
          </div>
          <p className="text-[12px] text-[#8C8479] text-center max-w-xs">
            Your data is encrypted with 256-bit SSL security.
          </p>
        </div>

        {/* Bottom Skip Section */}
        <div className="mt-8 pt-6 border-t border-[#F2F0EB]">
          <button
            onClick={handleSkip}
            disabled={loading}
            className="w-full py-3.5 rounded-md text-[14px] font-semibold text-[#8C8479] bg-[#F2F0EB] hover:bg-[#EEE9E0] transition-colors"
          >
            I'll do this later
          </button>
        </div>
      </>}
    </OnboardingShell>
  );
}

export default OnboardingStep13;
