import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import config from '../../resources/config/config';
import { upsertOnboardingData } from '../../services/onboarding/upsertOnboardingData';
import OnboardingShell from '../../components/OnboardingShell';

type VerificationResult = 'verified' | 'processing' | 'requires_input' | 'failed' | 'loading';

function VerifyCompletePage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<VerificationResult>('loading');
  const [pollingCount, setPollingCount] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    checkVerificationStatus();
  }, []);

  useEffect(() => {
    if (result === 'processing' && pollingCount < 10) {
      const timer = setTimeout(() => {
        checkVerificationStatus();
        setPollingCount((prev) => prev + 1);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [result, pollingCount]);

  const checkVerificationStatus = async () => {
    if (!config.supabaseClient) {
      return;
    }

    try {
      const {
        data: { user },
      } = await config.supabaseClient.auth.getUser();

      if (!user) {
        navigate('/login');
        return;
      }

      const { data: verification } = await config.supabaseClient
        .from('identity_verifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (verification) {
        switch (verification.stripe_status) {
          case 'verified':
            setResult('verified');
            await upsertOnboardingData(user.id, {
              identity_verified: true,
              identity_verified_at: new Date().toISOString(),
            });
            break;
          case 'processing':
          case 'pending':
            setResult('processing');
            break;
          case 'requires_input':
            setResult('requires_input');
            break;
          case 'failed':
          case 'canceled':
            setResult('failed');
            break;
          default:
            setResult('processing');
        }
      } else {
        setResult('processing');
      }
    } catch (error) {
      console.error('Error checking status:', error);
      setResult('processing');
    }
  };

  const handleContinue = () => {
    navigate('/hushh-user-profile');
  };

  const handleRetry = () => {
    navigate('/onboarding/verify');
  };

  const DISPLAY_STEP = 15;
  const PROG_TOTAL = 15;

  const renderContent = () => {
    switch (result) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center space-y-6 py-10">
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-[#F7F5F0]">
              <div className="w-10 h-10 border-4 border-[#EEE9E0] border-t-[#AA4528] rounded-full animate-spin" />
            </div>
            <h2 className="text-[1.8rem] font-medium text-[#151513]" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
              Checking Status...
            </h2>
            <p className="text-[15px] text-[#8C8479] text-center max-w-sm">
              Please wait while we confirm your verification.
            </p>
          </div>
        );

      case 'verified':
        return (
          <div className="flex flex-col items-center justify-center space-y-6 py-10">
            <div className="w-24 h-24 rounded-full flex items-center justify-center bg-[#E3F2E7] animate-[pulse_2s_ease-in-out_infinite]">
              <CheckCircle className="w-14 h-14 text-[#2D7A41]" />
            </div>
            <h2 className="text-[1.8rem] md:text-[2.2rem] font-medium text-[#151513]" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
              Verification Complete
            </h2>
            <p className="text-[15px] text-[#8C8479] text-center max-w-sm leading-relaxed mb-4">
              Your identity has been verified successfully. You now have full access to all features.
            </p>
            <button
              onClick={handleContinue}
              className="w-full max-w-[320px] h-[52px] flex items-center justify-center text-[13px] font-bold tracking-[0.1em] uppercase text-white bg-[#AA4528] hover:bg-[#923A1E] transition-colors rounded-[2px]"
            >
              <span className="mr-2">Continue to Profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        );

      case 'processing':
        return (
          <div className="flex flex-col items-center justify-center space-y-6 py-10">
            <div className="w-24 h-24 rounded-full flex items-center justify-center bg-[#FDF9F7]">
              <Clock className="w-14 h-14 text-[#AA4528]" />
            </div>
            <h2 className="text-[1.8rem] md:text-[2.2rem] font-medium text-[#151513]" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
              Verification in Progress
            </h2>
            <p className="text-[15px] text-[#8C8479] text-center max-w-sm leading-relaxed">
              Your verification is being processed. This usually takes just a few moments.
            </p>
            <div className="w-full max-w-[320px] space-y-2 mt-4">
              <div className="w-full h-1 bg-[#EEE9E0] overflow-hidden rounded-full">
                <div className="h-full bg-[#AA4528] animate-[loading_2s_linear_infinite] w-[40%]" />
              </div>
              <p className="text-[13px] text-[#8C8479] text-center">
                {pollingCount < 10 ? 'Checking status...' : 'Taking longer than expected'}
              </p>
            </div>
            <button
              onClick={handleContinue}
              className="w-full max-w-[320px] mt-6 h-[52px] flex items-center justify-center text-[13px] font-bold tracking-[0.1em] uppercase text-[#151513] border border-[#151513] hover:bg-[#F7F5F0] transition-colors rounded-[2px]"
            >
              Continue Anyway
            </button>
            <p className="text-[12px] text-[#8C8479] mt-2">
              You'll be notified when verification is complete
            </p>
          </div>
        );

      case 'requires_input':
        return (
          <div className="flex flex-col items-center justify-center space-y-6 py-10">
            <div className="w-24 h-24 rounded-full flex items-center justify-center bg-[#FFFAEB]">
              <AlertCircle className="w-14 h-14 text-[#B8860B]" />
            </div>
            <h2 className="text-[1.8rem] md:text-[2.2rem] font-medium text-[#151513]" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
              Additional Info Needed
            </h2>
            <p className="text-[15px] text-[#8C8479] text-center max-w-sm leading-relaxed mb-4">
              We need some additional information to complete your verification. Please try again.
            </p>
            <button
              onClick={handleRetry}
              className="w-full max-w-[320px] h-[52px] flex items-center justify-center text-[13px] font-bold tracking-[0.1em] uppercase text-white bg-[#AA4528] hover:bg-[#923A1E] transition-colors rounded-[2px]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              <span>Try Again</span>
            </button>
            <button
              onClick={handleContinue}
              className="mt-4 text-[13px] font-semibold text-[#8C8479] hover:text-[#151513] transition-colors"
            >
              I'll do this later
            </button>
          </div>
        );

      case 'failed':
        return (
          <div className="flex flex-col items-center justify-center space-y-6 py-10">
            <div className="w-24 h-24 rounded-full flex items-center justify-center bg-red-50">
              <AlertCircle className="w-14 h-14 text-red-600" />
            </div>
            <h2 className="text-[1.8rem] md:text-[2.2rem] font-medium text-[#151513]" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
              Verification Failed
            </h2>
            <p className="text-[15px] text-[#8C8479] text-center max-w-sm leading-relaxed mb-4">
              We couldn't verify your identity. This could be due to unclear images or mismatched information.
            </p>
            <button
              onClick={handleRetry}
              className="w-full max-w-[320px] h-[52px] flex items-center justify-center text-[13px] font-bold tracking-[0.1em] uppercase text-white bg-[#AA4528] hover:bg-[#923A1E] transition-colors rounded-[2px]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              <span>Try Again</span>
            </button>
            <button
              onClick={handleContinue}
              className="mt-4 text-[13px] font-semibold text-[#8C8479] hover:text-[#151513] transition-colors"
            >
              Continue without verification
            </button>
            <p className="text-[12px] text-[#8C8479] mt-2">
              Need help? Contact support@hushh.ai
            </p>
          </div>
        );
    }
  };

  return (
    <OnboardingShell
      step={DISPLAY_STEP}
      totalSteps={PROG_TOTAL}
      onBack={() => navigate('/onboarding/step-13')}
      onClose={() => navigate('/dashboard')}
      hideFooter={true} // In this complete screen, we handle navigation via the content buttons instead of a bottom sticky footer.
    >
      <div className="flex flex-col items-center max-w-lg mx-auto w-full pt-8">
        {renderContent()}
      </div>

      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(0.95); opacity: 0.7; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(250%); }
          }
        `}
      </style>
    </OnboardingShell>
  );
}

export default VerifyCompletePage;
