/**
 * Step 7 - Legal Name Entry (iOS-native design)
 *
 * Collects user's legal first and last name for verification.
 * Auto-fills from OAuth provider metadata (Google, Apple).
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../resources/config/config';
import { upsertOnboardingData } from '../../services/onboarding/upsertOnboardingData';
import OnboardingShell from '../../components/OnboardingShell';

/* ═══════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════ */

const DISPLAY_STEP = 6;
const TOTAL_STEPS = 12;
const PROGRESS_PCT = Math.round((DISPLAY_STEP / TOTAL_STEPS) * 100);

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */

export default function OnboardingStep7() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  /* ─── Load user + existing data ─── */
  useEffect(() => {
    const loadData = async () => {
      if (!config.supabaseClient) return;

      const { data: { user } } = await config.supabaseClient.auth.getUser();
      if (!user) { navigate('/login'); return; }

      // Extract name from OAuth provider metadata
      const meta = user.user_metadata || {};
      const oauthFirst = meta.given_name || meta.first_name || (meta.full_name?.split(' ')[0]) || (meta.name?.split(' ')[0]) || '';
      const oauthLast = meta.family_name || meta.last_name || (meta.full_name?.split(' ').slice(1).join(' ')) || (meta.name?.split(' ').slice(1).join(' ')) || '';

      // Check saved data — priority: DB > OAuth
      const { data } = await config.supabaseClient
        .from('onboarding_data')
        .select('legal_first_name, legal_last_name')
        .eq('user_id', user.id)
        .maybeSingle();

      setFirstName(data?.legal_first_name || oauthFirst);
      setLastName(data?.legal_last_name || oauthLast);
    };
    loadData();
  }, [navigate]);

  /* ─── Handlers ─── */
  const handleContinue = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter both first and last name');
      return;
    }

    setIsLoading(true);
    setError(null);

    if (!config.supabaseClient) { setError('Configuration error'); setIsLoading(false); return; }

    const { data: { user } } = await config.supabaseClient.auth.getUser();
    if (!user) { setError('Not authenticated'); setIsLoading(false); return; }

    const { error: upsertError } = await upsertOnboardingData(user.id, {
      legal_first_name: firstName.trim(),
      legal_last_name: lastName.trim(),
      current_step: 7,
    });

    if (upsertError) { setError('Failed to save data'); setIsLoading(false); return; }
    navigate('/onboarding/step-8');
  };

  const handleBack = () => navigate('/onboarding/step-5');

  const handleSkip = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      if (config.supabaseClient) {
        const { data: { user } } = await config.supabaseClient.auth.getUser();
        if (user) await upsertOnboardingData(user.id, { current_step: 7 });
      }
      navigate('/onboarding/step-8');
    } catch { navigate('/onboarding/step-8'); }
    finally { setIsLoading(false); }
  };

  const isValid = firstName.trim() && lastName.trim();

  /* ═══════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════ */
  return (
    <OnboardingShell
      step={DISPLAY_STEP}
      totalSteps={TOTAL_STEPS}
      onBack={handleBack}
      onClose={() => navigate('/dashboard')}
      continueLabel={isLoading ? 'Saving…' : 'Continue'}
      onContinue={handleContinue}
      continueDisabled={!isValid || isLoading}
      continueLoading={isLoading}
    >
      {/* ── Title ── */}
      <div className="mb-8">
        <h1
          className="text-[2.2rem] md:text-[2.6rem] font-medium leading-tight text-[#151513] mb-3"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          Enter your full legal name
        </h1>
        <p className="text-[15px] text-[#8C8479] leading-relaxed">
          We are required to collect this info for verification purposes.
        </p>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mb-6 p-3 rounded-md bg-red-50 border border-red-100 text-[14px] text-red-700">
          {error}
        </div>
      )}

      {/* ── Name Fields ── */}
      <div className="flex flex-col gap-5 mb-8">
        <div>
          <label htmlFor="firstName" className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8C8479] mb-2">
            First name
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => { setFirstName(e.target.value); if (error) setError(null); }}
            placeholder="Required"
            className="w-full bg-white border border-[#EEE9E0] rounded-md py-3 px-4 text-[15px] text-[#151513] placeholder-[#C4BFB5] focus:outline-none focus:border-[#AA4528] focus:ring-1 focus:ring-[#AA4528]/20 transition-all"
            autoComplete="given-name"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8C8479] mb-2">
            Last name
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => { setLastName(e.target.value); if (error) setError(null); }}
            placeholder="Required"
            className="w-full bg-white border border-[#EEE9E0] rounded-md py-3 px-4 text-[15px] text-[#151513] placeholder-[#C4BFB5] focus:outline-none focus:border-[#AA4528] focus:ring-1 focus:ring-[#AA4528]/20 transition-all"
            autoComplete="family-name"
          />
        </div>
      </div>

      <p className="text-[12px] text-[#8C8479]">
        Make sure this matches your government ID.
      </p>

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
          disabled={!isValid || isLoading}
          className={`flex-[2] py-3.5 rounded-md text-[14px] font-semibold transition-all ${isValid && !isLoading
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
