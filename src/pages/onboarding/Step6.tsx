import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../resources/config/config';
import { useFooterVisibility } from '../../utils/useFooterVisibility';

// Back arrow icon
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

// Chevron down icon for select
const ChevronDownIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

// Location pin icon (professional, no emoji)
const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

// United States first, then all other countries alphabetically
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
  'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

// Country code to full name mapping for GPS detection
const countryCodeToName: Record<string, string> = {
  'US': 'United States',
  'CA': 'Canada',
  'GB': 'United Kingdom',
  'UK': 'United Kingdom',
  'IN': 'India',
  'CN': 'China',
  'JP': 'Japan',
  'AU': 'Australia',
  'DE': 'Germany',
  'FR': 'France',
  'IT': 'Italy',
  'ES': 'Spain',
  'BR': 'Brazil',
  'MX': 'Mexico',
  'RU': 'Russia',
  'KR': 'South Korea',
  'SA': 'Saudi Arabia',
  'AE': 'United Arab Emirates',
  'SG': 'Singapore',
  'HK': 'Hong Kong',
  'NZ': 'New Zealand',
  'ZA': 'South Africa',
  'EG': 'Egypt',
  'NG': 'Nigeria',
  'PK': 'Pakistan',
  'BD': 'Bangladesh',
  'ID': 'Indonesia',
  'MY': 'Malaysia',
  'TH': 'Thailand',
  'VN': 'Vietnam',
  'PH': 'Philippines',
  'TR': 'Turkey',
  'PL': 'Poland',
  'NL': 'Netherlands',
  'BE': 'Belgium',
  'SE': 'Sweden',
  'NO': 'Norway',
  'DK': 'Denmark',
  'FI': 'Finland',
  'CH': 'Switzerland',
  'AT': 'Austria',
  'PT': 'Portugal',
  'GR': 'Greece',
  'IE': 'Ireland',
  'IL': 'Israel',
  'AR': 'Argentina',
  'CL': 'Chile',
  'CO': 'Colombia',
  'PE': 'Peru',
  'VE': 'Venezuela',
};

// Edge Function URL for GPS geocoding
const LOCATION_GEOCODE_API = `${config.SUPABASE_URL}/functions/v1/hushh-location-geocode`;

// Location data type from GPS API
interface LocationData {
  country: string;
  countryCode: string;
  state: string;
  stateCode: string;
  city: string;
  postalCode: string;
  phoneDialCode: string;
  timezone: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
}

export default function OnboardingStep6() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [citizenshipCountry, setCitizenshipCountry] = useState('United States');
  const [residenceCountry, setResidenceCountry] = useState('United States');
  const [isLoading, setIsLoading] = useState(false);
  const isFooterVisible = useFooterVisibility();

  // GPS location detection state
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [locationDetected, setLocationDetected] = useState(false);
  const locationAbortController = useRef<AbortController | null>(null);

  useEffect(() => {
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const getCurrentUser = async () => {
      if (!config.supabaseClient) return;
      
      const { data: { user } } = await config.supabaseClient.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUserId(user.id);

      // Load existing data if any
      const { data: onboardingData } = await config.supabaseClient
        .from('onboarding_data')
        .select('citizenship_country, residence_country, gps_location_data')
        .eq('user_id', user.id)
        .single();

      if (onboardingData) {
        // If user already has data, use it
        if (onboardingData.citizenship_country) {
          setCitizenshipCountry(onboardingData.citizenship_country);
        }
        if (onboardingData.residence_country) {
          setResidenceCountry(onboardingData.residence_country);
        }
        
        // If GPS data already cached, don't detect again
        if (onboardingData.gps_location_data) {
          setLocationDetected(true);
          return;
        }
      }

      // Start GPS detection for new users
      detectLocation(user.id);
    };

    getCurrentUser();
    
    // Cleanup
    return () => {
      if (locationAbortController.current) {
        locationAbortController.current.abort();
      }
    };
  }, [navigate]);

  // GPS location detection function
  const detectLocation = async (uid: string) => {
    // Check if geolocation is available
    if (!navigator.geolocation) {
      console.log('[Step6] Geolocation not available');
      return;
    }

    setIsDetectingLocation(true);
    setLocationMessage('Detecting your location...');

    try {
      // Request GPS coordinates
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes cache
          }
        );
      });

      const { latitude, longitude } = position.coords;
      console.log(`[Step6] GPS coordinates: ${latitude}, ${longitude}`);

      // Create abort controller
      locationAbortController.current = new AbortController();

      // Call geocoding API with Supabase anon key for authentication
      const response = await fetch(LOCATION_GEOCODE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${config.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ latitude, longitude }),
        signal: locationAbortController.current.signal,
      });

      const result = await response.json();

      if (result.success && result.data) {
        const locationData: LocationData = result.data;
        console.log('[Step6] Location detected:', locationData);

        // Map country code to full name
        const countryName = countryCodeToName[locationData.countryCode] || locationData.country;
        
        // Update UI with detected country
        if (countries.includes(countryName)) {
          setCitizenshipCountry(countryName);
          setResidenceCountry(countryName);
        }

        setLocationMessage(`Location detected: ${locationData.city || locationData.state || countryName}`);
        setLocationDetected(true);

        // Cache GPS location data to onboarding_data for use in Step 8 and Step 10
        if (config.supabaseClient) {
          await config.supabaseClient
            .from('onboarding_data')
            .update({
              gps_location_data: locationData,
              gps_detected_country: countryName,
              gps_detected_state: locationData.state,
              gps_detected_city: locationData.city,
              gps_detected_postal_code: locationData.postalCode,
              gps_detected_phone_dial_code: locationData.phoneDialCode,
              gps_detected_timezone: locationData.timezone,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', uid);
        }

        // Clear message after 2 seconds
        setTimeout(() => {
          setLocationMessage(null);
        }, 2000);
      } else {
        console.log('[Step6] Geocoding failed:', result.error);
        setLocationMessage(null);
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log('[Step6] Location detection aborted');
      } else if ((error as GeolocationPositionError).code === 1) {
        // User denied permission
        console.log('[Step6] Location permission denied');
        setLocationMessage('Location access denied');
        setTimeout(() => setLocationMessage(null), 2000);
      } else {
        console.error('[Step6] Location detection error:', error);
      }
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleContinue = async () => {
    if (!userId || !config.supabaseClient) return;

    setIsLoading(true);
    try {
      await config.supabaseClient
        .from('onboarding_data')
        .update({
          citizenship_country: citizenshipCountry,
          residence_country: residenceCountry,
          current_step: 6,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      navigate('/onboarding/step-7');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/onboarding/step-5');
  };

  return (
    <div 
      className="bg-slate-50 min-h-screen"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <div className="relative flex min-h-screen w-full flex-col bg-white max-w-[500px] mx-auto shadow-xl overflow-hidden border-x border-slate-100">
        
        {/* Sticky Header */}
        <header className="flex items-center px-4 pt-4 pb-2 bg-white sticky top-0 z-10">
          <button 
            onClick={handleBack}
            aria-label="Go back"
            className="flex size-10 shrink-0 items-center justify-center text-slate-900 rounded-full hover:bg-slate-50 transition-colors"
          >
            <BackIcon />
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col px-6 pb-44">
          {/* Header Section */}
          <div className="mb-8 text-center">
            <h1 className="text-slate-900 text-[22px] font-bold leading-tight tracking-tight mb-3">
              Confirm your residence
            </h1>
            <p className="text-slate-500 text-[14px] font-normal leading-relaxed">
              We need to know where you live and pay taxes to open your investment account.
            </p>
            
            {/* GPS Location Detection Status */}
            {(isDetectingLocation || locationMessage) && (
              <div className={`mt-4 py-2 px-4 rounded-full inline-flex items-center gap-2 text-sm font-medium transition-all ${
                isDetectingLocation 
                  ? 'bg-blue-50 text-blue-600' 
                  : locationDetected
                    ? 'bg-green-50 text-green-600'
                    : 'bg-slate-50 text-slate-500'
              }`}>
                {isDetectingLocation ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{locationMessage}</span>
                  </>
                ) : (
                  <>
                    <LocationIcon />
                    <span>{locationMessage}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Carded Form Block */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 mb-8">
            {/* Country of Citizenship */}
            <div className="mb-6 relative">
              <label className="block text-slate-900 text-sm font-medium leading-normal mb-2 ml-1">
                Country of citizenship
              </label>
              <div className="relative">
                <select
                  value={citizenshipCountry}
                  onChange={(e) => setCitizenshipCountry(e.target.value)}
                  className="w-full bg-white text-slate-900 border border-gray-200 rounded-xl h-14 px-4 pr-10 text-base font-normal focus:outline-none focus:border-[#2b8cee] focus:ring-1 focus:ring-[#2b8cee] transition-all cursor-pointer appearance-none"
                >
                  <option disabled value="">Select country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                  <ChevronDownIcon />
                </div>
              </div>
            </div>

            {/* Country of Residence */}
            <div className="relative">
              <label className="block text-slate-900 text-sm font-medium leading-normal mb-2 ml-1">
                Country of residence
              </label>
              <div className="relative">
                <select
                  value={residenceCountry}
                  onChange={(e) => setResidenceCountry(e.target.value)}
                  className="w-full bg-white text-slate-900 border border-gray-200 rounded-xl h-14 px-4 pr-10 text-base font-normal focus:outline-none focus:border-[#2b8cee] focus:ring-1 focus:ring-[#2b8cee] transition-all cursor-pointer appearance-none"
                >
                  <option disabled value="">Select country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                  <ChevronDownIcon />
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Fixed Footer - Hidden when main footer is visible */}
        {!isFooterVisible && (
          <div className="fixed bottom-0 z-20 w-full max-w-[500px] bg-white border-t border-slate-100 p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]" data-onboarding-footer>
            {/* Buttons */}
            <div className="flex flex-col gap-4">
              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={isLoading}
                className="flex w-full h-12 cursor-pointer items-center justify-center rounded-full bg-[#2b8cee] text-white text-base font-bold transition-all hover:bg-[#2070c0] active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed shadow-md shadow-[#2b8cee]/20"
              >
                {isLoading ? 'Saving...' : 'Continue'}
              </button>

              {/* Back Button */}
              <button
                onClick={handleBack}
                className="flex w-full cursor-pointer items-center justify-center rounded-full bg-transparent py-2 text-slate-500 text-sm font-bold hover:text-slate-800 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
