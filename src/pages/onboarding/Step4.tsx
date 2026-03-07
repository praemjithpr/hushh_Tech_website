import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../resources/config/config';
import { upsertOnboardingData } from '../../services/onboarding/upsertOnboardingData';
import { locationService, LocationData, COUNTRY_CODE_TO_NAME } from '../../services/location';
import PermissionHelpModal from '../../components/PermissionHelpModal';
import OnboardingShell from '../../components/OnboardingShell';

/* ═══════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════ */

const CURRENT_STEP = 4;
const TOTAL_STEPS = 12;
const PROGRESS_PCT = Math.round((CURRENT_STEP / TOTAL_STEPS) * 100);

// United States first, then alphabetical
const countries = [
  'United States',
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia',
  'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium',
  'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei',
  'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde',
  'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo',
  'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica',
  'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea',
  'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia',
  'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland',
  'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'North Korea',
  'South Korea', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia',
  'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macedonia', 'Madagascar', 'Malawi',
  'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico',
  'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
  'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria',
  'Norway', 'Oman', 'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru',
  'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis',
  'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia',
  'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Sudan', 'Spain', 'Sri Lanka',
  'Sudan', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan',
  'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan',
  'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'Uruguay',
  'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
];

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */

export default function OnboardingStep4() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [citizenshipCountry, setCitizenshipCountry] = useState('');
  const [residenceCountry, setResidenceCountry] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // GPS location detection state
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [userManuallyChanged, setUserManuallyChanged] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'detecting' | 'success' | 'ip-success' | 'denied' | 'failed' | 'manual' | null>(null);
  const [detectedLocation, setDetectedLocation] = useState('');
  const [userConfirmedManual, setUserConfirmedManual] = useState(false);
  const [showPermissionHelp, setShowPermissionHelp] = useState(false);
  const [hasPreviousData, setHasPreviousData] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const canContinue = locationDetected || userConfirmedManual;

  /* ─── Scroll to top ─── */
  useEffect(() => { window.scrollTo(0, 0); }, []);

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

      if (onboardingData) {
        if (onboardingData.citizenship_country) {
          setCitizenshipCountry(onboardingData.citizenship_country);
          setUserManuallyChanged(true);
          setHasPreviousData(true);
        }
        if (onboardingData.residence_country) {
          setResidenceCountry(onboardingData.residence_country);
        }
      }
    };
    getCurrentUser();
    return () => { locationService.cancel(); };
  }, [navigate]);

  // Show modal on first visit
  useEffect(() => {
    if (!locationStatus && !hasPreviousData && userId) {
      setShowLocationModal(true);
    }
  }, [userId, locationStatus, hasPreviousData]);

  /* ─── Location detection ─── */
  const detectLocation = async (uid: string) => {
    setIsDetectingLocation(true);
    setLocationStatus('detecting');

    try {
      const result = await locationService.detectLocation();

      if ((result.source === 'detected' || result.source === 'ip-detected') && result.data) {
        const locationData: LocationData = result.data;
        const countryName = COUNTRY_CODE_TO_NAME[locationData.countryCode] || locationData.country;

        if (countries.includes(countryName)) {
          setCitizenshipCountry(countryName);
          setResidenceCountry(countryName);
        }

        setDetectedLocation(locationData.city || locationData.state || countryName);
        setLocationDetected(true);
        setLocationStatus(result.source === 'detected' ? 'success' : 'ip-success');
        setHasPreviousData(false);

        try { await locationService.saveLocationToOnboarding(uid, locationData); }
        catch (e) { console.warn('[Step4] Cache failed:', e); }
      } else if (result.source === 'denied') {
        setLocationStatus('denied');
      } else {
        setLocationStatus('failed');
      }
    } catch (error) {
      console.error('[Step4] Location error:', error);
      setLocationStatus('failed');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  /* ─── Handlers ─── */
  const handleCitizenshipChange = (value: string) => {
    setCitizenshipCountry(value);
    setUserManuallyChanged(true);
    if (userConfirmedManual) { setUserConfirmedManual(false); setLocationStatus('manual'); }
  };

  const handleResidenceChange = (value: string) => {
    setResidenceCountry(value);
    setUserManuallyChanged(true);
    if (userConfirmedManual) { setUserConfirmedManual(false); setLocationStatus('manual'); }
  };

  const handleConfirmManualSelection = () => {
    if (citizenshipCountry && residenceCountry) {
      setUserConfirmedManual(true);
      setLocationStatus('manual');
    }
  };

  const handleRetry = async () => {
    setLocationDetected(false);
    setUserManuallyChanged(false);
    setUserConfirmedManual(false);
    if (userId) await detectLocation(userId);
  };

  // iOS Alert: "Allow Once" or "Allow While Using App"
  const handleAllowLocation = async () => {
    if (!userId) return;
    setShowLocationModal(false);
    await detectLocation(userId);
  };

  // iOS Alert: "Don't Allow"
  const handleDontAllow = () => {
    setShowLocationModal(false);
    setLocationStatus('manual');
  };

  const handleContinue = async () => {
    if (!userId || !config.supabaseClient || !canContinue) return;
    setIsLoading(true);
    try {
      await upsertOnboardingData(userId, {
        citizenship_country: citizenshipCountry,
        residence_country: residenceCountry,
        current_step: 4,
      });
      navigate('/onboarding/step-5');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => navigate('/onboarding/step-2');
  const handleSkip = () => navigate('/onboarding/step-5');

  const isErrorStatus = locationStatus === 'denied' || locationStatus === 'failed';
  const isSuccessStatus = locationStatus === 'success' || locationStatus === 'ip-success';
  const shouldShowForm = Boolean(locationStatus || hasPreviousData);
  const canConfirmSelection = Boolean(citizenshipCountry && residenceCountry && !userConfirmedManual);

  /* ═══════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════ */
  return (
    <>
      <OnboardingShell
        step={CURRENT_STEP}
        totalSteps={TOTAL_STEPS}
        onBack={() => navigate('/onboarding/step-2')}
        onClose={() => navigate('/dashboard')}
        continueLabel={isLoading ? 'Saving…' : 'Continue'}
        onContinue={handleContinue}
        continueDisabled={!canContinue || isDetectingLocation}
        continueLoading={isLoading}
        hideContinueBtn={showLocationModal}
      >
        {/* ── Title ── */}
        <div className="mb-6">
          <h1
            className="text-[2.2rem] md:text-[2.6rem] font-medium leading-tight text-[#151513] mb-2"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
          >
            Confirm your residence
          </h1>
          <p className="text-[15px] text-[#8C8479] leading-relaxed">
            We need to know where you live and pay taxes to open your investment account.
          </p>
        </div>

        {/* ─── Status Banners ─── */}
        {locationStatus === 'detecting' && (
          <div className="flex items-center gap-3 p-3 mb-4 bg-[#F7F5F0] rounded-md border border-[#EEE9E0]">
            <div className="animate-spin h-5 w-5 border-2 border-[#AA4528] border-t-transparent rounded-full shrink-0" />
            <p className="text-[14px] font-medium text-[#AA4528]">Detecting your location…</p>
          </div>
        )}

        {isSuccessStatus && (
          <div className="flex items-start gap-3 p-4 mb-6 bg-green-50 rounded-md border border-green-100">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white mt-0.5">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>check</span>
            </div>
            <p className="text-[14px] leading-snug text-[#151513]">
              <span className="font-semibold">Location detected:</span> {detectedLocation}
            </p>
          </div>
        )}

        {isErrorStatus && (
          <div className="mb-4">
            <div className="flex items-center justify-between gap-3 p-3 bg-red-50 rounded-md border border-red-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500 text-xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}>error</span>
                <p className="text-[13px] font-medium text-red-700">
                  {locationStatus === 'denied' ? 'Location access denied' : 'Could not detect location'}
                </p>
              </div>
              <button onClick={handleRetry} className="text-[#AA4528] text-[13px] font-semibold shrink-0">Retry</button>
            </div>
            {locationStatus === 'denied' && (
              <button
                onClick={(e) => { e.preventDefault(); setShowPermissionHelp(true); }}
                className="mt-2 ml-1 text-xs font-semibold text-[#AA4528]"
              >
                How to enable location
              </button>
            )}
          </div>
        )}

        {/* ─── Country Selection — Fundrise form row style ─── */}
        {shouldShowForm && (
          <div className="space-y-5 mb-6">
            {/* Citizenship */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8C8479] mb-2">
                Country of Citizenship
              </label>
              <div className="relative">
                <select
                  value={citizenshipCountry}
                  onChange={(e) => handleCitizenshipChange(e.target.value)}
                  disabled={isDetectingLocation}
                  className="w-full appearance-none bg-white border border-[#EEE9E0] rounded-md py-3 px-4 pr-9 text-[15px] text-[#151513] focus:outline-none focus:border-[#AA4528] focus:ring-1 focus:ring-[#AA4528]/20 transition-colors disabled:opacity-50"
                >
                  <option disabled value="">Select country</option>
                  {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#8C8479]">
                  <span className="material-symbols-outlined text-[18px]">expand_more</span>
                </div>
              </div>
            </div>

            {/* Residence */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8C8479] mb-2">
                Country of Residence
              </label>
              <div className="relative">
                <select
                  value={residenceCountry}
                  onChange={(e) => handleResidenceChange(e.target.value)}
                  disabled={isDetectingLocation}
                  className="w-full appearance-none bg-white border border-[#EEE9E0] rounded-md py-3 px-4 pr-9 text-[15px] text-[#151513] focus:outline-none focus:border-[#AA4528] focus:ring-1 focus:ring-[#AA4528]/20 transition-colors disabled:opacity-50"
                >
                  <option disabled value="">Select country</option>
                  {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#8C8479]">
                  <span className="material-symbols-outlined text-[18px]">expand_more</span>
                </div>
              </div>
            </div>

            {/* Confirm manual selection */}
            {!locationDetected && canConfirmSelection && !userConfirmedManual && (
              <button
                onClick={handleConfirmManualSelection}
                className="w-full py-2.5 rounded-md bg-[#FDF9F7] border border-[#AA4528]/30 text-[#AA4528] font-semibold text-[14px] transition-all hover:bg-[#AA4528]/10"
              >
                Confirm Selection
              </button>
            )}
          </div>
        )}

        {/* ─── Detect Location Button ─── */}
        {!showLocationModal && !isDetectingLocation && !isSuccessStatus && (
          <button
            onClick={() => userId && detectLocation(userId)}
            className="w-full py-3 rounded-md border border-[#EEE9E0] bg-[#F7F5F0] text-[#AA4528] font-semibold text-[14px] flex items-center justify-center gap-2 hover:border-[#AA4528]/30 transition-colors mb-6"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>my_location</span>
            Detect My Location
          </button>
        )}

        {/* ─── Bottom CTA ─── */}
        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 py-3.5 rounded-md text-[14px] font-semibold text-[#8C8479] bg-[#F2F0EB] hover:bg-[#EEE9E0] transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleContinue}
            disabled={!canContinue || isLoading || isDetectingLocation}
            className={`flex-[2] py-3.5 rounded-md text-[14px] font-semibold transition-all ${canContinue && !isLoading && !isDetectingLocation
              ? 'bg-[#AA4528] text-white hover:bg-[#8C3720] active:scale-[0.99]'
              : 'bg-[#EEE9E0] text-[#C4BFB5] cursor-not-allowed'
              }`}
          >
            {isDetectingLocation ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Detecting…
              </span>
            ) : isLoading ? 'Saving…' : 'Continue'}
          </button>
        </div>

        {/* ─── Dark Overlay ─── */}
        {showLocationModal && (
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]" />
        )}

        {/* ─── iOS Alert Dialog (preserved for UX) ─── */}
        {showLocationModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center px-8">
            <div
              className="w-[270px] overflow-hidden rounded-[14px] shadow-2xl"
              style={{
                backgroundColor: 'rgba(245, 245, 245, 0.85)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              }}
            >
              {/* Content */}
              <div className="px-4 pt-5 pb-4 text-center">
                <h3 className="text-[17px] font-semibold leading-[22px] text-black mb-1">
                  Allow &ldquo;Hushh&rdquo; to use your location?
                </h3>
                <p className="text-[13px] leading-[16px] font-medium text-black px-1">
                  Your location is used to automatically determine your country and streamline the verification process.
                </p>
              </div>

              {/* Action buttons — stacked iOS style */}
              <div className="flex flex-col border-t" style={{ borderColor: 'rgba(60,60,67,0.2)' }}>
                <button
                  onClick={handleAllowLocation}
                  className="h-[44px] w-full text-[17px] leading-[22px] text-[#AA4528] font-medium active:bg-gray-200/50 transition-colors border-b"
                  style={{ borderColor: 'rgba(60,60,67,0.2)' }}
                >
                  Allow Once
                </button>
                <button
                  onClick={handleAllowLocation}
                  className="h-[44px] w-full text-[17px] leading-[22px] text-[#AA4528] font-medium active:bg-gray-200/50 transition-colors border-b"
                  style={{ borderColor: 'rgba(60,60,67,0.2)' }}
                >
                  Allow While Using App
                </button>
                <button
                  onClick={handleDontAllow}
                  className="h-[44px] w-full text-[17px] leading-[22px] text-[#AA4528] font-semibold active:bg-gray-200/50 transition-colors"
                >
                  Don&apos;t Allow
                </button>
              </div>
            </div>
          </div>
        )}


      </OnboardingShell>

      {/* Permission Help Modal */}
      <PermissionHelpModal
        isOpen={showPermissionHelp}
        onClose={() => setShowPermissionHelp(false)}
      />
    </>
  );
}
