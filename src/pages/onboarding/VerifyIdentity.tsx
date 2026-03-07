import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  FileText,
  Camera,
  Mail,
  Phone,
  RefreshCw,
  AlertCircle,
  XCircle
} from 'lucide-react';
import config from '../../resources/config/config';
import OnboardingShell from '../../components/OnboardingShell';

interface OnboardingData {
  legal_first_name?: string;
  legal_last_name?: string;
  email?: string;
  phone_number?: string;
  phone_country_code?: string;
  is_identity_verified?: boolean;
  identity_verified_at?: string;
}

interface VerificationStatus {
  status: 'not_started' | 'pending' | 'processing' | 'verified' | 'requires_input' | 'failed';
  document_verified: boolean;
  selfie_verified: boolean;
  email_verified: boolean;
  phone_verified: boolean;
}

function VerifyIdentityPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingVerification, setStartingVerification] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    status: 'not_started',
    document_verified: false,
    selfie_verified: false,
    email_verified: false,
    phone_verified: false,
  });

  // Check authentication and load data
  useEffect(() => {
    window.scrollTo(0, 0);
    loadUserData();
  }, []);

  const loadUserData = async () => {
    if (!config.supabaseClient) {
      setError('Configuration error');
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await config.supabaseClient.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Load onboarding data
      const { data: onboarding } = await config.supabaseClient
        .from('onboarding_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (onboarding) {
        setOnboardingData(onboarding);

        // If already verified, redirect to profile
        if (onboarding.identity_verified) {
          navigate('/hushh-user-profile');
          return;
        }
      }

      // Check existing verification status
      const { data: verification } = await config.supabaseClient
        .from('identity_verifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (verification) {
        setVerificationStatus({
          status: verification.stripe_status || 'not_started',
          document_verified: verification.document_verified || false,
          selfie_verified: verification.selfie_verified || false,
          email_verified: verification.email_verified || false,
          phone_verified: verification.phone_verified || false,
        });

        // If verified, redirect
        if (verification.stripe_status === 'verified') {
          navigate('/hushh-user-profile');
          return;
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startVerification = async () => {
    setStartingVerification(true);

    try {
      const { data: { session } } = await config.supabaseClient!.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Build phone number with country code
      const fullPhone = onboardingData?.phone_country_code && onboardingData?.phone_number
        ? `${onboardingData.phone_country_code}${onboardingData.phone_number}`
        : undefined;

      // Call edge function to create verification session
      const response = await fetch(
        `${config.SUPABASE_URL}/functions/v1/create-verification-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            email: onboardingData?.email,
            phone: fullPhone,
            returnUrl: `${window.location.origin}/onboarding/verify-complete`,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to start verification');
      }

      // Redirect to Stripe verification URL
      if (result.session?.url) {
        window.location.href = result.session.url;
      } else {
        throw new Error('No verification URL received');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Failed to start verification');
      setStartingVerification(false);
    }
  };

  const skipVerification = async () => {
    // Mark as skipped and proceed to profile
    // User can verify later from profile page
    navigate('/hushh-user-profile');
  };

  const DISPLAY_STEP = 14;
  const PROG_TOTAL = 15;

  if (loading) {
    return (
      <OnboardingShell
        step={DISPLAY_STEP}
        totalSteps={PROG_TOTAL}
        onBack={() => navigate('/onboarding/step-13')}
        onClose={() => navigate('/dashboard')}
        continueLabel="Loading"
        onContinue={() => { }}
        continueDisabled={true}
        hideFooter={true}
      >
        <div className="flex flex-col items-center justify-center space-y-4 py-20 animate-pulse">
          <div className="w-12 h-12 border-4 border-[#EEE9E0] border-t-[#AA4528] rounded-full animate-spin" />
          <p className="text-[15px] font-medium text-[#8C8479]">Loading verification status...</p>
        </div>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell
      step={DISPLAY_STEP}
      totalSteps={PROG_TOTAL}
      onBack={() => navigate('/onboarding/step-13')}
      onClose={() => navigate('/dashboard')}
      continueLabel={startingVerification ? 'Starting...' : (verificationStatus.status === 'requires_input' ? 'Continue Verification' : 'Start Verification')}
      onContinue={startVerification}
      continueDisabled={startingVerification}
      continueLoading={startingVerification}
    >
      <div className="flex flex-col items-center max-w-lg mx-auto w-full">
        {/* Header Icon */}
        <div className="w-20 h-20 rounded-full bg-[#151513] flex items-center justify-center mb-6 shadow-md">
          <Shield className="w-10 h-10 text-white" />
        </div>

        {/* Title */}
        <div className="text-center mb-10 w-full">
          <h1
            className="text-[2.2rem] md:text-[2.6rem] font-medium leading-tight text-[#151513] mb-3"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
          >
            Verify Your Identity
          </h1>
          <p className="text-[15px] text-[#8C8479] leading-relaxed max-w-md mx-auto">
            Complete a quick verification to secure your account and unlock all features.
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="w-full mb-6 p-4 bg-red-50 border border-red-100 rounded-md flex items-start space-x-3 text-red-700">
            <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-[14px] leading-relaxed">{error}</div>
          </div>
        )}

        {/* Status Alerts */}
        {verificationStatus.status === 'processing' && (
          <div className="w-full mb-6 p-4 bg-[#FDF9F7] border border-[#AA4528]/20 rounded-md flex items-start space-x-3">
            <RefreshCw className="w-5 h-5 text-[#AA4528] shrink-0 mt-0.5 animate-spin" />
            <div>
              <h3 className="text-[14px] font-bold text-[#AA4528] mb-1">Verification in Progress</h3>
              <p className="text-[13px] text-[#8C8479]">Your verification is being processed. This usually takes a few minutes.</p>
            </div>
          </div>
        )}

        {verificationStatus.status === 'requires_input' && (
          <div className="w-full mb-6 p-4 bg-[#FFFAEB] border border-[#D4AF37]/30 rounded-md flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-[#B8860B] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-[14px] font-bold text-[#9e7309] mb-1">Additional Information Required</h3>
              <p className="text-[13px] text-[#B8860B]">Please complete the verification process. Some information may need to be resubmitted.</p>
            </div>
          </div>
        )}

        {verificationStatus.status === 'failed' && (
          <div className="w-full mb-6 p-4 bg-red-50 border border-red-100 rounded-md flex items-start space-x-3">
            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-[14px] font-bold text-red-800 mb-1">Verification Failed</h3>
              <p className="text-[13px] text-red-700">Your verification could not be completed. Please try again or contact support.</p>
            </div>
          </div>
        )}

        {/* What will be verified */}
        <div className="w-full bg-[#F7F5F0] rounded-md border border-[#EEE9E0] p-6 mb-8">
          <p className="text-[12px] font-bold tracking-[0.1em] text-[#8C8479] uppercase mb-5">
            What will be verified
          </p>

          <div className="space-y-5">
            {/* Gov ID */}
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 rounded-sm flex items-center justify-center shrink-0 ${verificationStatus.document_verified ? 'bg-[#E3F2E7]' : 'bg-white border border-[#EEE9E0]'}`}>
                <FileText className={`w-6 h-6 ${verificationStatus.document_verified ? 'text-[#2D7A41]' : 'text-[#8C8479]'}`} />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center space-x-2">
                  <h4 className="text-[15px] font-bold text-[#151513]">Government ID</h4>
                  {verificationStatus.document_verified && (
                    <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-[#2D7A41] text-white rounded-sm">Verified</span>
                  )}
                </div>
                <p className="text-[13px] text-[#8C8479] mt-0.5">Passport, Driver's License, or ID Card</p>
              </div>
            </div>

            {/* Selfie */}
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 rounded-sm flex items-center justify-center shrink-0 ${verificationStatus.selfie_verified ? 'bg-[#E3F2E7]' : 'bg-white border border-[#EEE9E0]'}`}>
                <Camera className={`w-6 h-6 ${verificationStatus.selfie_verified ? 'text-[#2D7A41]' : 'text-[#8C8479]'}`} />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center space-x-2">
                  <h4 className="text-[15px] font-bold text-[#151513]">Selfie Verification</h4>
                  {verificationStatus.selfie_verified && (
                    <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-[#2D7A41] text-white rounded-sm">Verified</span>
                  )}
                </div>
                <p className="text-[13px] text-[#8C8479] mt-0.5">Live selfie matching your ID photo</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 rounded-sm flex items-center justify-center shrink-0 ${verificationStatus.email_verified ? 'bg-[#E3F2E7]' : 'bg-white border border-[#EEE9E0]'}`}>
                <Mail className={`w-6 h-6 ${verificationStatus.email_verified ? 'text-[#2D7A41]' : 'text-[#8C8479]'}`} />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center space-x-2">
                  <h4 className="text-[15px] font-bold text-[#151513]">Email</h4>
                  {verificationStatus.email_verified && (
                    <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-[#2D7A41] text-white rounded-sm">Verified</span>
                  )}
                </div>
                <p className="text-[13px] text-[#8C8479] mt-0.5 truncate pr-2">{onboardingData?.email || 'Your email address'}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 rounded-sm flex items-center justify-center shrink-0 ${verificationStatus.phone_verified ? 'bg-[#E3F2E7]' : 'bg-white border border-[#EEE9E0]'}`}>
                <Phone className={`w-6 h-6 ${verificationStatus.phone_verified ? 'text-[#2D7A41]' : 'text-[#8C8479]'}`} />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center space-x-2">
                  <h4 className="text-[15px] font-bold text-[#151513]">Phone Number</h4>
                  {verificationStatus.phone_verified && (
                    <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-[#2D7A41] text-white rounded-sm">Verified</span>
                  )}
                </div>
                <p className="text-[13px] text-[#8C8479] mt-0.5">
                  {onboardingData?.phone_country_code && onboardingData?.phone_number
                    ? `${onboardingData.phone_country_code} ${onboardingData.phone_number.replace(/(.{3})/g, '$1 ').trim()}`
                    : 'Your phone number'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="w-full bg-[#FDFBF9] rounded-md border border-[#EEE9E0] p-5 mb-8">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-[#AA4528] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[14px] font-bold text-[#151513] mb-1">Secure & Private</h4>
              <p className="text-[13px] text-[#8C8479] leading-relaxed">
                Your documents are encrypted and processed securely by Stripe Identity.
                We never store your raw document images.
              </p>
            </div>
          </div>
        </div>

        {/* Sub-footer actions */}
        <div className="w-full flex justify-center text-center mt-6 py-6 border-t border-[#F2F0EB]">
          <button
            onClick={skipVerification}
            disabled={startingVerification}
            className="text-[14px] font-semibold text-[#8C8479] hover:text-[#151513] transition-colors"
          >
            I'll do this later
          </button>
        </div>

      </div>
    </OnboardingShell>
  );
}

export default VerifyIdentityPage;
