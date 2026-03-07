import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import config from '../../resources/config/config';
import { upsertOnboardingData } from '../../services/onboarding/upsertOnboardingData';
import OnboardingShell from '../../components/OnboardingShell';

const CURRENT_STEP = 3;
const TOTAL_STEPS = 12;

export default function OnboardingStep3() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const getCurrentUser = async () => {
      if (!config.supabaseClient) return;
      const { data: { user } } = await config.supabaseClient.auth.getUser();
      if (!user) { navigate('/login'); return; }
      setUserId(user.id);
    };
    getCurrentUser();
  }, [navigate]);

  const handleContinue = async () => {
    if (!userId || !config.supabaseClient) return;
    setIsLoading(true);
    try {
      await upsertOnboardingData(userId, { current_step: 3 });
      navigate('/onboarding/step-4');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OnboardingShell
      step={CURRENT_STEP}
      totalSteps={TOTAL_STEPS}
      onBack={() => navigate('/onboarding/step-2')}
      onClose={() => navigate('/dashboard')}
      continueLabel="Continue"
      onContinue={handleContinue}
      continueLoading={isLoading}
    >
      {/* Lottie animation */}
      <div className="flex justify-center mb-8">
        <div style={{ width: 180, height: 180 }}>
          <DotLottieReact
            src="https://lottie.host/58d10cd9-7087-4394-bb55-3ad6f07d3db6/9epWGP0u3F.lottie"
            loop
            autoplay
          />
        </div>
      </div>

      {/* Heading */}
      <h1
        className="text-[2.2rem] md:text-[2.6rem] font-medium leading-tight text-[#151513] mb-4 text-center"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
      >
        Let's continue with some information about you
      </h1>

      <p className="text-[15px] text-[#8C8479] leading-relaxed text-center mb-8">
        To comply with federal regulations — and as is typical with any investment
        platform — we are required to collect certain personal information about you.
      </p>

      {/* Trust indicators */}
      <div className="flex items-center justify-center gap-6 pt-4 border-t border-[#F2F0EB]">
        {[
          { icon: 'lock', label: 'Encrypted' },
          { icon: 'verified_user', label: 'SEC Registered' },
          { icon: 'privacy_tip', label: 'Private' },
        ].map(({ icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5">
            <span
              className="material-symbols-outlined text-[22px] text-[#AA4528]"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
            >
              {icon}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8C8479]">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={handleContinue}
        disabled={isLoading}
        className={`mt-8 w-full py-3.5 rounded-md text-[15px] font-semibold transition-all ${isLoading
          ? 'bg-[#EEE9E0] text-[#C4BFB5] cursor-not-allowed'
          : 'bg-[#AA4528] text-white hover:bg-[#8C3720] active:scale-[0.99]'
          }`}
      >
        {isLoading ? 'Loading…' : 'Continue'}
      </button>
    </OnboardingShell>
  );
}
