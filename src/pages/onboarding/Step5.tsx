import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactCountryFlag from 'react-country-flag';
import config from '../../resources/config/config';
import { upsertOnboardingData } from '../../services/onboarding/upsertOnboardingData';
import type { UIAccountType } from '../../types/onboarding';
import { ACCOUNT_TYPE_OPTIONS } from '../../types/onboarding';
import { locationService } from '../../services/location';
import OnboardingShell from '../../components/OnboardingShell';

/* ═══════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════ */

const CURRENT_STEP = 5;
const TOTAL_STEPS = 12;
const PROGRESS_PCT = Math.round((CURRENT_STEP / TOTAL_STEPS) * 100);

interface DialCodeOption {
  code: string;
  country: string;
  iso: string;
}

const PHONE_DIAL_CODES: DialCodeOption[] = [
  { code: '+1', country: 'United States', iso: 'US' },
  { code: '+44', country: 'United Kingdom', iso: 'GB' },
  { code: '+33', country: 'France', iso: 'FR' },
  { code: '+49', country: 'Germany', iso: 'DE' },
  { code: '+39', country: 'Italy', iso: 'IT' },
  { code: '+34', country: 'Spain', iso: 'ES' },
  { code: '+31', country: 'Netherlands', iso: 'NL' },
  { code: '+91', country: 'India', iso: 'IN' },
  { code: '+86', country: 'China', iso: 'CN' },
  { code: '+81', country: 'Japan', iso: 'JP' },
  { code: '+82', country: 'South Korea', iso: 'KR' },
  { code: '+61', country: 'Australia', iso: 'AU' },
  { code: '+65', country: 'Singapore', iso: 'SG' },
  { code: '+971', country: 'United Arab Emirates', iso: 'AE' },
  { code: '+966', country: 'Saudi Arabia', iso: 'SA' },
  { code: '+55', country: 'Brazil', iso: 'BR' },
  { code: '+52', country: 'Mexico', iso: 'MX' },
  { code: '+7', country: 'Russia', iso: 'RU' },
  { code: '+62', country: 'Indonesia', iso: 'ID' },
  { code: '+60', country: 'Malaysia', iso: 'MY' },
  { code: '+66', country: 'Thailand', iso: 'TH' },
  { code: '+63', country: 'Philippines', iso: 'PH' },
  { code: '+92', country: 'Pakistan', iso: 'PK' },
  { code: '+880', country: 'Bangladesh', iso: 'BD' },
  { code: '+27', country: 'South Africa', iso: 'ZA' },
  { code: '+234', country: 'Nigeria', iso: 'NG' },
  { code: '+20', country: 'Egypt', iso: 'EG' },
  { code: '+90', country: 'Turkey', iso: 'TR' },
];

/** Maps UIAccountType → legacy account_structure for backward compatibility */
const toAccountStructure = (accountType: UIAccountType): 'individual' | 'other' => {
  return accountType === 'individual' ? 'individual' : 'other';
};

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */

export default function OnboardingStep5() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedAccountType, setSelectedAccountType] = useState<UIAccountType | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [selectedDialCountryIso, setSelectedDialCountryIso] = useState('US');
  const [isAutoDetectingDialCode, setIsAutoDetectingDialCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDialPicker, setShowDialPicker] = useState(false);

  /* ─── Enable page-level scrolling ─── */
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

      const { data: onboardingData } = await config.supabaseClient
        .from('onboarding_data')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Restore account type
      if (onboardingData?.account_type) {
        const validTypes: UIAccountType[] = ['individual', 'joint', 'retirement', 'trust'];
        const saved = onboardingData.account_type as string;
        if (validTypes.includes(saved as UIAccountType)) {
          setSelectedAccountType(saved as UIAccountType);
        }
      } else if (onboardingData?.account_structure === 'individual') {
        setSelectedAccountType('individual');
      }

      if (onboardingData?.phone_number) {
        setPhoneNumber(String(onboardingData.phone_number).replace(/\D/g, ''));
      }

      const savedPhoneCode = onboardingData?.phone_country_code ? String(onboardingData.phone_country_code) : '';
      const cachedDial =
        savedPhoneCode ||
        (onboardingData?.gps_detected_phone_dial_code ? String(onboardingData.gps_detected_phone_dial_code) : '') ||
        ((onboardingData?.gps_location_data as any)?.phoneDialCode ? String((onboardingData.gps_location_data as any).phoneDialCode) : '');

      if (cachedDial) {
        setCountryCode(cachedDial);
        const matched = PHONE_DIAL_CODES.find((o) => o.code === cachedDial);
        if (matched) setSelectedDialCountryIso(matched.iso);
      } else {
        setIsAutoDetectingDialCode(true);
        try {
          const ipLoc = await locationService.getLocationByIp();
          if (ipLoc?.phoneDialCode) {
            setCountryCode(ipLoc.phoneDialCode);
            const matched = PHONE_DIAL_CODES.find((o) => o.code === ipLoc.phoneDialCode);
            if (matched) setSelectedDialCountryIso(matched.iso);
          }
          if (ipLoc?.countryCode) {
            const iso = String(ipLoc.countryCode).toUpperCase();
            if (PHONE_DIAL_CODES.some((o) => o.iso === iso)) setSelectedDialCountryIso(iso);
          }
          if (!onboardingData?.gps_location_data) {
            try { await locationService.saveLocationToOnboarding(user.id, ipLoc); }
            catch (e) { console.warn('[Step5] cache fail:', e); }
          }
        } catch (err) {
          console.warn('[Step5] IP detection failed:', err);
        } finally {
          setIsAutoDetectingDialCode(false);
        }
      }
    };
    getCurrentUser();
  }, [navigate]);

  /* ─── Phone formatting ─── */
  const formatPhoneNumber = (value: string) => {
    const d = value.replace(/\D/g, '');
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    if (d.length <= 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
    return d;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 15) setPhoneNumber(value);
  };

  const isValidPhone = phoneNumber.length >= 8 && phoneNumber.length <= 15;
  const canContinue = Boolean(selectedAccountType) && isValidPhone;

  const selectedDialOption = useMemo(() => {
    return PHONE_DIAL_CODES.find((o) => o.code === countryCode && o.iso === selectedDialCountryIso)
      || PHONE_DIAL_CODES.find((o) => o.code === countryCode)
      || PHONE_DIAL_CODES[0];
  }, [countryCode, selectedDialCountryIso]);

  /* ─── Handlers ─── */
  const handleContinue = async () => {
    if (!selectedAccountType || !userId || !config.supabaseClient || !isValidPhone) return;
    setIsLoading(true);
    try {
      await upsertOnboardingData(userId, {
        account_type: selectedAccountType,
        account_structure: toAccountStructure(selectedAccountType),
        phone_number: phoneNumber,
        phone_country_code: countryCode,
        current_step: 5,
      });
      navigate('/onboarding/step-7');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => navigate('/onboarding/step-4');
  const handleSkip = () => navigate('/onboarding/step-7');

  const handleSelectDialCode = (option: DialCodeOption) => {
    setCountryCode(option.code);
    setSelectedDialCountryIso(option.iso);
    setShowDialPicker(false);
  };

  /* ═══════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════ */
  return (
    <>
      <OnboardingShell
        step={CURRENT_STEP}
        totalSteps={TOTAL_STEPS}
        onBack={() => navigate('/onboarding/step-4')}
        onClose={() => navigate('/dashboard')}
        continueLabel="Continue"
        onContinue={handleContinue}
        continueDisabled={!canContinue}
        continueLoading={isLoading}
      >
        {/* ── Title ── */}
        <div className="mb-8">
          <h1
            className="text-[2.2rem] md:text-[2.6rem] font-medium leading-tight text-[#151513] mb-2"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
          >
            A few more details
          </h1>
          <p className="text-[15px] text-[#8C8479] leading-relaxed">
            This helps us personalize your account and keep your profile secure.
          </p>
        </div>

        {/* ─── Account Type ─── */}
        <div className="mb-10">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8C8479] mb-3">
            Account type
          </h2>
          <div className="border border-[#EEE9E0] rounded-md overflow-hidden divide-y divide-[#F2F0EB]">
            {ACCOUNT_TYPE_OPTIONS.map((option) => {
              const isSelected = selectedAccountType === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedAccountType(option.value)}
                  className={`w-full flex items-center justify-between px-5 py-4 text-left transition-colors group ${isSelected ? 'bg-[#FDF9F7]' : 'bg-white hover:bg-[#F7F5F0]'
                    }`}
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`Select ${option.label} account`}
                >
                  <span
                    className={`text-[15px] font-medium transition-colors ${isSelected ? 'text-[#AA4528]' : 'text-[#151513]'
                      }`}
                  >
                    {option.label}
                  </span>
                  {isSelected && (
                    <span
                      className="material-symbols-outlined text-[#AA4528] text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}
                    >
                      check
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Phone Number ─── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-[20px] font-medium text-[#151513] mb-1" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
              Phone number
            </h2>
            {isAutoDetectingDialCode && (
              <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#8C8479]">
                Detecting…
              </span>
            )}
          </div>
          <p className="text-[13px] text-[#8C8479] leading-relaxed mb-4">
            We'll use this to verify your identity when needed.
          </p>

          <div className="flex bg-white border border-[#EEE9E0] rounded-md overflow-hidden focus-within:border-[#AA4528] focus-within:ring-1 focus-within:ring-[#AA4528]/20 transition-all">
            {/* Country code selector */}
            <button
              onClick={() => setShowDialPicker(true)}
              className="flex items-center pl-4 pr-2 py-3 border-r border-[#EEE9E0] bg-[#F7F5F0] hover:bg-[#F2F0EB] transition-colors"
            >
              <ReactCountryFlag
                countryCode={selectedDialOption.iso}
                svg
                style={{ width: '1.25em', height: '1.25em', borderRadius: 2 }}
              />
              <span className="text-[15px] font-medium text-[#151513] ml-2">
                {selectedDialOption.code}
              </span>
              <span className="material-symbols-outlined text-[#8C8479] text-[18px] ml-1">
                expand_more
              </span>
            </button>

            {/* Phone input */}
            <input
              type="tel"
              value={formatPhoneNumber(phoneNumber)}
              onChange={handlePhoneChange}
              placeholder="(000) 000-0000"
              className="flex-1 bg-transparent px-4 py-3 text-[15px] text-[#151513] placeholder-[#C4BFB5] outline-none"
            />
          </div>
          <p className="text-[11px] text-[#8C8479] mt-2">
            Standard message and data rates may apply.
          </p>
        </div>

        {/* ── Bottom CTA ── */}
        <div className="mt-8 pt-6 border-t border-[#F2F0EB] flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 py-3.5 rounded-md text-[14px] font-semibold text-[#8C8479] bg-[#F2F0EB] hover:bg-[#EEE9E0] transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleContinue}
            disabled={!canContinue || isLoading}
            className={`flex-[2] py-3.5 rounded-md text-[14px] font-semibold transition-all ${canContinue && !isLoading
              ? 'bg-[#AA4528] text-white hover:bg-[#8C3720] active:scale-[0.99]'
              : 'bg-[#EEE9E0] text-[#C4BFB5] cursor-not-allowed'
              }`}
          >
            {isLoading ? 'Saving…' : 'Continue'}
          </button>
        </div>
      </OnboardingShell>

      {/* ═══ Dial Code Picker Modal (Fundrise style) ═══ */}
      {showDialPicker && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#151513]/40 backdrop-blur-[2px]">
          {/* Dismiss overlay */}
          <div className="absolute inset-0" onClick={() => setShowDialPicker(false)} />

          {/* Modal content */}
          <div
            className="relative w-full sm:w-[500px] max-h-[70vh] flex flex-col bg-white sm:rounded-md rounded-t-xl shadow-2xl overflow-hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F2F0EB] bg-white">
              <h3 className="text-[16px] font-semibold text-[#151513]">Select Country Code</h3>
              <button onClick={() => setShowDialPicker(false)} className="text-[#AA4528] font-semibold text-[14px]">
                Done
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#F2F0EB]">
              {PHONE_DIAL_CODES.map((option) => (
                <button
                  key={option.iso}
                  onClick={() => handleSelectDialCode(option)}
                  className={`w-full flex items-center justify-between px-6 py-3.5 transition-colors ${option.code === countryCode && option.iso === selectedDialCountryIso
                    ? 'bg-[#FDF9F7]'
                    : 'bg-white hover:bg-[#F7F5F0]'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <ReactCountryFlag
                      countryCode={option.iso}
                      svg
                      style={{ width: '1.25em', height: '1.25em', borderRadius: 2 }}
                    />
                    <span className="text-[15px] font-medium text-[#151513]">{option.country}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[14px] font-semibold text-[#8C8479]">{option.code}</span>
                    {option.code === countryCode && option.iso === selectedDialCountryIso && (
                      <span className="material-symbols-outlined text-[#AA4528] text-[20px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 500" }}>
                        check
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
