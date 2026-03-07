/**
 * Step 8 - Address Entry (iOS-native design)
 *
 * Collects user's residential address. Auto-detects location via GPS
 * with IP fallback, then saves into onboarding_data.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../resources/config/config';
import { upsertOnboardingData } from '../../services/onboarding/upsertOnboardingData';
import OnboardingShell from '../../components/OnboardingShell';
import { useLocationDropdowns } from '../../hooks/useLocationDropdowns';
import { locationService } from '../../services/location/locationService';
import { SearchableSelect } from '../../components/onboarding/SearchableSelect';

/* ═══════════════════════════════════════════════
   CONSTANTS & VALIDATION
   ═══════════════════════════════════════════════ */

const DISPLAY_STEP = 7;
const TOTAL_STEPS = 12;
const PROGRESS_PCT = Math.round((DISPLAY_STEP / TOTAL_STEPS) * 100);

const validateAddress = (v: string) => {
  if (!v.trim()) return 'Address is required';
  if (v.trim().length < 5) return 'Address is too short';
  if (v.trim().length > 100) return 'Address is too long';
  if (!/[a-zA-Z]/.test(v)) return 'Please enter a valid address';
  return undefined;
};

const validateRequired = (v: string, label: string) =>
  !v ? `Please select a ${label}` : undefined;

const validateZip = (v: string) => {
  if (!v.trim()) return 'ZIP / postal code is required';
  if (v.trim().length < 3 || v.trim().length > 10) return 'Enter a valid postal code';
  return undefined;
};

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */

export default function OnboardingStep8() {
  const navigate = useNavigate();
  const dropdowns = useLocationDropdowns();

  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [zipCode, setZipCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  /* ─── Enable page-level scrolling ─── */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* ─── Auto-detect location ─── */
  const detectAndApply = async (userId?: string) => {
    setIsDetecting(true);
    setDetectionStatus('Detecting your location...');

    try {
      const result = await locationService.detectLocation();
      if (!result.data) { setDetectionStatus(null); return; }

      if (result.data.postalCode) setZipCode(result.data.postalCode);

      if (result.data.formattedAddress) {
        const parsed = locationService.parseFormattedAddress(result.data.formattedAddress, result.data);
        if (parsed.line1) setAddressLine1(parsed.line1);
        if (parsed.line2) setAddressLine2(parsed.line2);
      }

      dropdowns.applyDetectedLocation(
        result.data.countryCode,
        result.data.stateCode,
        result.data.state,
        result.data.city,
      );

      if (userId) {
        locationService.saveLocationToOnboarding(userId, result.data).catch(() => { });
      }

      setDetectionStatus(result.data.city || result.data.country || 'Location detected');
      setTimeout(() => setDetectionStatus(null), 2500);
    } catch {
      setDetectionStatus(null);
    } finally {
      setIsDetecting(false);
    }
  };

  /* ─── Init: Load saved data or detect ─── */
  useEffect(() => {
    const init = async () => {
      if (!config.supabaseClient) return;
      const { data: { user } } = await config.supabaseClient.auth.getUser();
      if (!user) return;

      const { data: saved } = await config.supabaseClient
        .from('onboarding_data')
        .select('address_line_1, address_line_2, address_country, state, city, zip_code, residence_country')
        .eq('user_id', user.id)
        .maybeSingle();

      if (saved?.address_line_1) {
        setAddressLine1(saved.address_line_1);
        setAddressLine2(saved.address_line_2 || '');
        setZipCode(saved.zip_code || '');
        const code = locationService.mapCountryToIsoCode(saved.address_country || 'US');
        dropdowns.applyDetectedLocation(code, saved.state, undefined, saved.city);
        return;
      }

      await detectAndApply(user.id);

      if (saved?.residence_country) {
        const code = locationService.mapCountryToIsoCode(saved.residence_country);
        dropdowns.applyDetectedLocation(code);
      }
    };
    init();
    return () => { locationService.cancel(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── Handlers ─── */
  const handleDetectClick = async () => {
    if (!config.supabaseClient) return;
    const { data: { user } } = await config.supabaseClient.auth.getUser();
    await detectAndApply(user?.id);
  };

  const validate = (field: string, value: string) => {
    switch (field) {
      case 'addressLine1': return validateAddress(value);
      case 'country': return validateRequired(value, 'country');
      case 'state': return validateRequired(value, 'state');
      case 'city': return validateRequired(value, 'city');
      case 'zipCode': return validateZip(value);
      default: return undefined;
    }
  };

  const handleBlur = (field: string, value: string) => {
    setTouched((p) => ({ ...p, [field]: true }));
    setErrors((p) => ({ ...p, [field]: validate(field, value) }));
  };

  const validateAll = () => {
    const next = {
      addressLine1: validateAddress(addressLine1),
      country: validateRequired(dropdowns.country, 'country'),
      state: validateRequired(dropdowns.state, 'state'),
      city: validateRequired(dropdowns.city, 'city'),
      zipCode: validateZip(zipCode),
    };
    setErrors(next);
    setTouched({ addressLine1: true, country: true, state: true, city: true, zipCode: true });
    return !Object.values(next).some(Boolean);
  };

  const handleContinue = async () => {
    if (!validateAll()) { setError('Please fix the errors above'); return; }
    setLoading(true);
    setError(null);

    if (!config.supabaseClient) { setLoading(false); return; }
    const { data: { user } } = await config.supabaseClient.auth.getUser();
    if (!user) { setError('Not authenticated'); setLoading(false); return; }

    const { error: saveError } = await upsertOnboardingData(user.id, {
      address_line_1: addressLine1.trim(),
      address_line_2: addressLine2.trim() || null,
      address_country: dropdowns.country,
      state: dropdowns.state,
      city: dropdowns.city,
      zip_code: zipCode.trim(),
      current_step: 8,
    });

    if (saveError) { setError('Failed to save. Please try again.'); setLoading(false); return; }
    navigate('/onboarding/step-9');
  };

  const handleBack = () => navigate('/onboarding/step-7');

  const handleSkip = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (config.supabaseClient) {
        const { data: { user } } = await config.supabaseClient.auth.getUser();
        if (user) await upsertOnboardingData(user.id, { current_step: 8 });
      }
      navigate('/onboarding/step-9');
    } catch { navigate('/onboarding/step-9'); }
    finally { setLoading(false); }
  };

  const isValid = addressLine1.trim() && dropdowns.country && dropdowns.state && dropdowns.city && zipCode.trim();

  /* ═══════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════ */
  return (
    <OnboardingShell
      step={DISPLAY_STEP}
      totalSteps={TOTAL_STEPS}
      onBack={handleBack}
      onClose={() => navigate('/dashboard')}
      continueLabel={loading ? 'Saving…' : 'Continue'}
      onContinue={handleContinue}
      continueDisabled={!isValid || loading}
      continueLoading={loading}
    >
      {/* ── Title ── */}
      <div className="mb-8">
        <h1
          className="text-[2.2rem] md:text-[2.6rem] font-medium leading-tight text-[#151513] mb-3"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          Enter your address
        </h1>
        <p className="text-[15px] text-[#8C8479] leading-relaxed">
          Please provide your primary residence address.
        </p>
      </div>

      {/* ── Detection status ── */}
      {(isDetecting || detectionStatus) && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-md mb-6 text-[13px] font-medium border ${isDetecting ? 'bg-[#FDF9F7] text-[#AA4528] border-[#EEE9E0]' : 'bg-[#F2F0EB] text-[#8C8479] border-[#EEE9E0]'
          }`}>
          {isDetecting && (
            <span className="h-1.5 w-1.5 rounded-full bg-[#AA4528] animate-pulse" aria-hidden="true" />
          )}
          <span>{detectionStatus}</span>
        </div>
      )}

      {/* ── Use my current location ── */}
      <div className="mb-8">
        <button
          type="button"
          onClick={handleDetectClick}
          disabled={isDetecting}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-white border border-[#EEE9E0] hover:bg-[#F7F5F0] rounded-md transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[#AA4528] text-[20px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}>near_me</span>
          <span className="text-[14px] font-semibold text-[#151513]">Use my current location</span>
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mb-6 p-3 rounded-md bg-red-50 border border-red-100 text-[14px] text-red-700">
          {error}
        </div>
      )}

      {/* ── Address Fields ── */}
      <div className="flex flex-col gap-5 mb-8">
        {/* Address Line 1 */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8C8479] mb-2">
            Address line 1
          </label>
          <input
            type="text"
            value={addressLine1}
            onChange={(e) => {
              setAddressLine1(e.target.value);
              if (touched.addressLine1) setErrors((p) => ({ ...p, addressLine1: validateAddress(e.target.value) }));
            }}
            onBlur={() => handleBlur('addressLine1', addressLine1)}
            placeholder="Street address"
            className={`w-full bg-white border ${touched.addressLine1 && errors.addressLine1 ? 'border-red-300' : 'border-[#EEE9E0]'} rounded-md py-3 px-4 text-[15px] text-[#151513] placeholder-[#C4BFB5] focus:outline-none focus:border-[#AA4528] focus:ring-1 focus:ring-[#AA4528]/20 transition-all`}
            autoComplete="address-line1"
          />
          {touched.addressLine1 && errors.addressLine1 && (
            <p className="text-[12px] text-red-500 mt-1.5">{errors.addressLine1}</p>
          )}
        </div>

        {/* Address Line 2 */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8C8479] mb-2">
            Address line 2
          </label>
          <input
            type="text"
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
            placeholder="Apt, Suite, Bldg (Optional)"
            className="w-full bg-white border border-[#EEE9E0] rounded-md py-3 px-4 text-[15px] text-[#151513] placeholder-[#C4BFB5] focus:outline-none focus:border-[#AA4528] focus:ring-1 focus:ring-[#AA4528]/20 transition-all"
            autoComplete="address-line2"
          />
        </div>

        {/* Country */}
        <div className="onboarding-select-wrapper">
          <SearchableSelect
            id="country"
            label="Country"
            value={dropdowns.country}
            options={dropdowns.countries.map((c) => ({ value: c.isoCode, label: c.name }))}
            onChange={dropdowns.setCountry}
            placeholder="Search country..."
            required
            autoComplete="country"
          />
        </div>

        {/* State */}
        <div className="onboarding-select-wrapper">
          <SearchableSelect
            id="state"
            label="State / Province"
            value={dropdowns.state}
            options={dropdowns.states.map((s) => ({ value: s.isoCode, label: s.name }))}
            onChange={dropdowns.setState}
            placeholder="Search state..."
            disabled={!dropdowns.country}
            loading={dropdowns.loadingStates}
            loadError={dropdowns.statesError}
            onRetry={dropdowns.retryStates}
            required
            autoComplete="address-level1"
          />
        </div>

        {/* City */}
        <div className="onboarding-select-wrapper">
          <SearchableSelect
            id="city"
            label="City"
            value={dropdowns.city}
            options={dropdowns.cities.map((c) => ({ value: c.name, label: c.name }))}
            onChange={dropdowns.setCity}
            placeholder="Search city..."
            disabled={!dropdowns.state}
            loading={dropdowns.loadingCities}
            loadError={dropdowns.citiesError}
            onRetry={dropdowns.retryCities}
            required
            autoComplete="address-level2"
          />
        </div>

        {/* ZIP Code */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8C8479] mb-2">
            ZIP Code
          </label>
          <input
            type="text"
            value={zipCode}
            inputMode="text"
            onChange={(e) => {
              const next = e.target.value.slice(0, 10);
              setZipCode(next);
              if (touched.zipCode) setErrors((p) => ({ ...p, zipCode: validateZip(next) }));
            }}
            onBlur={() => handleBlur('zipCode', zipCode)}
            placeholder="e.g. 10001"
            className={`w-full bg-white border ${touched.zipCode && errors.zipCode ? 'border-red-300' : 'border-[#EEE9E0]'} rounded-md py-3 px-4 text-[15px] text-[#151513] placeholder-[#C4BFB5] focus:outline-none focus:border-[#AA4528] focus:ring-1 focus:ring-[#AA4528]/20 transition-all`}
            autoComplete="postal-code"
          />
          {touched.zipCode && errors.zipCode ? (
            <p className="text-[12px] text-red-500 mt-1.5">{errors.zipCode}</p>
          ) : (
            <p className="text-[12px] text-[#8C8479] mt-1.5">
              Supports numeric and alphanumeric codes based on region selection.
            </p>
          )}
        </div>
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
          disabled={!isValid || loading}
          className={`flex-[2] py-3.5 rounded-md text-[14px] font-semibold transition-all ${isValid && !loading
            ? 'bg-[#AA4528] text-white hover:bg-[#8C3720] active:scale-[0.99]'
            : 'bg-[#EEE9E0] text-[#C4BFB5] cursor-not-allowed'
            }`}
        >
          {loading ? 'Saving…' : 'Continue'}
        </button>
      </div>
    </OnboardingShell>
  );
}
