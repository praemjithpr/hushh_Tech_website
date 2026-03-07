import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../resources/config/config';
import { upsertOnboardingData } from '../../services/onboarding/upsertOnboardingData';
import type { ReferralSource } from '../../types/onboarding';
import OnboardingShell from '../../components/OnboardingShell';

/* ═══════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════ */

const CURRENT_STEP = 2;
const TOTAL_STEPS = 12;

interface ReferralOption {
  value: ReferralSource;
  label: string;
  icon: string;
}

const REFERRAL_OPTIONS: ReferralOption[] = [
  { value: 'social_media_ad', label: 'Social Media', icon: 'smartphone' },
  { value: 'family_friend', label: 'Friend or Family', icon: 'group' },
  { value: 'podcast', label: 'Podcast', icon: 'mic' },
  { value: 'website_blog_article', label: 'News Article', icon: 'article' },
  { value: 'ai_tool', label: 'Google Search', icon: 'search' },
  { value: 'other', label: 'Other', icon: 'more_horiz' },
];

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */

export default function OnboardingStep2() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<ReferralSource | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        .select('referral_source')
        .eq('user_id', user.id)
        .maybeSingle();

      if (onboardingData?.referral_source) {
        setSelectedSource(onboardingData.referral_source as ReferralSource);
      }
    };
    getCurrentUser();
  }, [navigate]);

  /* ─── Handlers ─── */
  const handleContinue = async () => {
    if (!userId || !config.supabaseClient || !selectedSource) return;
    setIsLoading(true);
    try {
      await upsertOnboardingData(userId, {
        referral_source: selectedSource,
        current_step: 2,
      });
      navigate('/onboarding/step-3');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    if (userId) {
      try { await upsertOnboardingData(userId, { current_step: 2 }); }
      catch (err) { console.error(err); }
    }
    navigate('/onboarding/step-3');
  };

  /* ═══════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════ */
  return (
    <OnboardingShell
      step={CURRENT_STEP}
      totalSteps={TOTAL_STEPS}
      onBack={() => navigate('/onboarding/step-1')}
      onClose={() => navigate('/dashboard')}
      continueLabel="Continue"
      onContinue={handleContinue}
      continueDisabled={!selectedSource}
      continueLoading={isLoading}
    >
      {/* ── Heading ── */}
      <div className="mb-8">
        <h1
          className="text-[2.2rem] md:text-[2.6rem] font-medium leading-tight text-[#151513] mb-3"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          Please make your selection
        </h1>
        <p className="text-[15px] text-[#8C8479] leading-relaxed">
          How did you first hear about Hushh Fund&nbsp;A?{' '}
          <span className="text-[#AA4528] cursor-pointer hover:underline" onClick={handleSkip}>
            You can skip this.
          </span>
        </p>
      </div>

      {/* ── Selection List (Fundrise card-row style) ── */}
      <div className="border border-[#EEE9E0] rounded-md overflow-hidden divide-y divide-[#F2F0EB]">
        {REFERRAL_OPTIONS.map((option) => {
          const isSelected = selectedSource === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setSelectedSource(option.value)}
              className={`w-full flex items-center justify-between px-5 py-4 text-left transition-colors group ${isSelected ? 'bg-[#FDF9F7]' : 'bg-white hover:bg-[#F7F5F0]'
                }`}
            >
              <div className="flex items-center gap-4">
                {/* Icon dot */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-[#AA4528]/10' : 'bg-[#F2F0EB]'
                    }`}
                >
                  <span
                    className={`material-symbols-outlined text-[18px] transition-colors ${isSelected ? 'text-[#AA4528]' : 'text-[#8C8479]'
                      }`}
                    style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                  >
                    {option.icon}
                  </span>
                </div>

                {/* Label */}
                <span
                  className={`text-[15px] font-medium transition-colors ${isSelected ? 'text-[#AA4528]' : 'text-[#151513]'
                    }`}
                >
                  {option.label}
                </span>
              </div>

              {/* Chevron (Fundrise style) */}
              <span
                className={`material-symbols-outlined text-[20px] transition-colors ${isSelected ? 'text-[#AA4528]' : 'text-[#C4BFB5] group-hover:text-[#8C8479]'
                  }`}
              >
                chevron_right
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Bottom CTA ── */}
      <div className="mt-8 flex gap-3">
        <button
          onClick={handleSkip}
          className="flex-1 py-3.5 rounded-md text-[14px] font-semibold text-[#8C8479] bg-[#F2F0EB] hover:bg-[#EEE9E0] transition-colors"
        >
          Skip
        </button>
        <button
          onClick={handleContinue}
          disabled={!selectedSource || isLoading}
          className={`flex-[2] py-3.5 rounded-md text-[14px] font-semibold transition-all ${selectedSource && !isLoading
            ? 'bg-[#AA4528] text-white hover:bg-[#8C3720] active:scale-[0.99]'
            : 'bg-[#EEE9E0] text-[#C4BFB5] cursor-not-allowed'
            }`}
        >
          {isLoading ? 'Saving…' : 'Continue'}
        </button>
      </div>
    </OnboardingShell>
  );
}
