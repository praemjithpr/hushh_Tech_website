/**
 * Step 9 - SSN + Date of Birth (iOS-native design)
 *
 * Collects Social Security Number (optional) and Date of Birth (required).
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../resources/config/config';
import { upsertOnboardingData } from '../../services/onboarding/upsertOnboardingData';
import OnboardingShell from '../../components/OnboardingShell';

/* ═══════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════ */

const DISPLAY_STEP = 8;
const TOTAL_STEPS = 12;
const PROGRESS_PCT = Math.round((DISPLAY_STEP / TOTAL_STEPS) * 100);

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */

export default function OnboardingStep9() {
  const navigate = useNavigate();
  const [ssn, setSsn] = useState('');
  const [dob, setDob] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  /* ─── Helpers ─── */
  const formatIsoToDisplay = (iso?: string | null) => {
    if (!iso) return '';
    const parts = iso.split('-');
    if (parts.length === 3) return `${parts[1]}/${parts[2]}/${parts[0]}`;
    return iso;
  };

  const parseDobToIso = (value: string) => {
    if (!value) return null;
    const parts = value.split('/');
    if (parts.length === 3) {
      let [p1, p2, year] = parts.map((p) => p.trim());
      let month = p1, day = p2;
      if (parseInt(p1, 10) > 12) { day = p1; month = p2; }
      const iso = `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      if (!Number.isNaN(Date.parse(iso))) return iso;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value))) return value;
    return null;
  };

  /* ─── Load saved data ─── */
  useEffect(() => {
    const loadData = async () => {
      if (!config.supabaseClient) return;
      const { data: { user } } = await config.supabaseClient.auth.getUser();
      if (!user) return;

      const { data } = await config.supabaseClient
        .from('onboarding_data')
        .select('ssn_encrypted, date_of_birth')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.date_of_birth) {
        const saved = formatIsoToDisplay(data.date_of_birth);
        if (saved) setDob(saved);
        // Also populate dropdowns from ISO date
        const parts = data.date_of_birth.split('-');
        if (parts.length === 3) {
          setDobYear(parts[0]);
          setDobMonth(parts[1]);
          setDobDay(parts[2]);
        }
      }
      if (data?.ssn_encrypted && data.ssn_encrypted !== '999-99-9999') {
        setSsn(data.ssn_encrypted);
      }
    };
    loadData();
  }, []);

  /* ─── Formatters ─── */
  const formatSSN = (v: string) => {
    const d = v.replace(/\D/g, '');
    if (d.length <= 3) return d;
    if (d.length <= 5) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5, 9)}`;
  };

  const formatDate = (v: string) => {
    const d = v.replace(/\D/g, '');
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
    return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4, 8)}`;
  };

  const handleSSNChange = (e: React.ChangeEvent<HTMLInputElement>) => setSsn(formatSSN(e.target.value));
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => setDob(formatDate(e.target.value));

  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) setDob(formatIsoToDisplay(e.target.value));
  };

  const openDatePicker = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker?.();
      dateInputRef.current.click();
    }
  };

  // Sync dob string from dropdown selections
  useEffect(() => {
    if (dobMonth && dobDay && dobYear) {
      setDob(`${dobMonth}/${dobDay}/${dobYear}`);
    }
  }, [dobMonth, dobDay, dobYear]);

  // Generate year options (current year down to 1930)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1929 }, (_, i) => String(currentYear - i));
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Days in selected month/year
  const daysInMonth = dobMonth && dobYear
    ? new Date(parseInt(dobYear), parseInt(dobMonth), 0).getDate()
    : 31;
  const dayOptions = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'));

  // Correct day if month changed and day is now out of range
  useEffect(() => {
    if (dobDay && parseInt(dobDay) > daysInMonth) {
      setDobDay(String(daysInMonth).padStart(2, '0'));
    }
  }, [dobMonth, dobYear, daysInMonth, dobDay]);

  const isFormValid = !!(dobMonth && dobDay && dobYear && dobYear.length === 4);

  /* ─── Handlers ─── */
  const handleContinue = async () => {
    if (!isFormValid) { setError('Please enter your date of birth'); return; }
    setLoading(true); setError(null);

    if (!config.supabaseClient) { setError('Configuration error'); setLoading(false); return; }
    const { data: { user } } = await config.supabaseClient.auth.getUser();
    if (!user) { setError('Not authenticated'); setLoading(false); return; }

    const isoDob = parseDobToIso(dob);
    if (!isoDob) { setError('Please enter a valid date (MM/DD/YYYY)'); setLoading(false); return; }

    const { error: e } = await upsertOnboardingData(user.id, {
      ssn_encrypted: ssn, date_of_birth: isoDob, current_step: 9,
    });
    if (e) { setError('Failed to save data'); setLoading(false); return; }
    navigate('/onboarding/step-11');
  };

  const handleSkip = async () => {
    if (!isFormValid) { setError('Please enter your date of birth before skipping'); return; }
    setLoading(true); setError(null);

    if (!config.supabaseClient) { setError('Configuration error'); setLoading(false); return; }
    const { data: { user } } = await config.supabaseClient.auth.getUser();
    if (!user) { setError('Not authenticated'); setLoading(false); return; }

    const isoDob = parseDobToIso(dob);
    if (!isoDob) { setError('Please enter a valid date (MM/DD/YYYY)'); setLoading(false); return; }

    const { error: e } = await upsertOnboardingData(user.id, {
      ssn_encrypted: '999-99-9999', date_of_birth: isoDob, current_step: 9,
    });
    if (e) { setError('Failed to save data'); setLoading(false); return; }
    navigate('/onboarding/step-11');
  };

  const handleBack = () => navigate('/onboarding/step-8');

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
      continueDisabled={!isFormValid || loading}
      continueLoading={loading}
    >
      {/* ── Title ── */}
      <div className="mb-8">
        <h1
          className="text-[2.2rem] md:text-[2.6rem] font-medium leading-tight text-[#151513] mb-3"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          We just need a few more details
        </h1>
        <p className="text-[15px] text-[#8C8479] leading-relaxed">
          Federal law requires us to collect this info for tax reporting.
        </p>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mb-6 p-3 rounded-md bg-red-50 border border-red-100 text-[14px] text-red-700">
          {error}
        </div>
      )}

      {/* ── SSN Section ── */}
      <div className="mb-8">
        <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8C8479] mb-2">
          Social Security Number
        </label>

        <div className="border border-[#EEE9E0] rounded-md overflow-hidden bg-white focus-within:border-[#AA4528] focus-within:ring-1 focus-within:ring-[#AA4528]/20 transition-all">
          <div className="flex items-center px-4 py-3">
            <input
              type="text"
              value={ssn}
              onChange={handleSSNChange}
              placeholder="000-00-0000"
              maxLength={11}
              inputMode="numeric"
              className="flex-1 bg-transparent border-none p-0 text-[15px] text-[#151513] placeholder-[#C4BFB5] focus:outline-none tracking-widest"
            />
            <span className="material-symbols-outlined text-[#C4BFB5] text-[20px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>lock</span>
          </div>

          <div className="h-[1px] bg-[#F2F0EB] w-full" />

          {/* Why SSN expandable */}
          <details
            className="group"
            open={showInfo}
            onToggle={(e) => setShowInfo((e.target as HTMLDetailsElement).open)}
          >
            <summary className="w-full flex items-center justify-between px-4 py-3 bg-[#F7F5F0] hover:bg-[#F2F0EB] transition-colors cursor-pointer list-none">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#AA4528] text-[18px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>info</span>
                <span className="text-[14px] text-[#AA4528] font-medium">Why do we need your SSN?</span>
              </div>
              <span className="material-symbols-outlined text-[#8C8479] text-[18px] transform transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            <div className="px-4 py-3 bg-white">
              <p className="text-[13px] leading-relaxed text-[#8C8479]">
                We are required by federal law to collect this information to prevent fraud and verify your identity before opening an investment account.
              </p>
            </div>
          </details>
        </div>
      </div>

      {/* ── DOB Section ── */}
      <div className="mb-8">
        <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8C8479] mb-2">
          Date of birth
        </label>

        <div className="border border-[#EEE9E0] rounded-md overflow-hidden bg-white">
          {/* Month selector */}
          <div className="flex items-center relative border-b border-[#F2F0EB] focus-within:bg-[#FDF9F7]">
            <span className="text-[14px] font-medium text-[#8C8479] w-20 shrink-0 px-4 py-3 border-r border-[#F2F0EB] bg-[#F7F5F0]">Month</span>
            <select
              value={dobMonth}
              onChange={(e) => setDobMonth(e.target.value)}
              aria-label="Birth month"
              className="flex-1 bg-transparent border-none px-4 py-3 text-[15px] text-[#151513] focus:outline-none appearance-none cursor-pointer"
            >
              <option value="" disabled>Select month</option>
              {monthNames.map((name, idx) => (
                <option key={name} value={String(idx + 1).padStart(2, '0')}>
                  {name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 flex items-center">
              <span className="material-symbols-outlined text-[#8C8479] text-[18px]">expand_more</span>
            </div>
          </div>

          {/* Day selector */}
          <div className="flex items-center relative border-b border-[#F2F0EB] focus-within:bg-[#FDF9F7]">
            <span className="text-[14px] font-medium text-[#8C8479] w-20 shrink-0 px-4 py-3 border-r border-[#F2F0EB] bg-[#F7F5F0]">Day</span>
            <select
              value={dobDay}
              onChange={(e) => setDobDay(e.target.value)}
              aria-label="Birth day"
              className="flex-1 bg-transparent border-none px-4 py-3 text-[15px] text-[#151513] focus:outline-none appearance-none cursor-pointer"
            >
              <option value="" disabled>Select day</option>
              {dayOptions.map((d) => (
                <option key={d} value={d}>{parseInt(d)}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 flex items-center">
              <span className="material-symbols-outlined text-[#8C8479] text-[18px]">expand_more</span>
            </div>
          </div>

          {/* Year selector */}
          <div className="flex items-center relative focus-within:bg-[#FDF9F7]">
            <span className="text-[14px] font-medium text-[#8C8479] w-20 shrink-0 px-4 py-3 border-r border-[#F2F0EB] bg-[#F7F5F0]">Year</span>
            <select
              value={dobYear}
              onChange={(e) => setDobYear(e.target.value)}
              aria-label="Birth year"
              className="flex-1 bg-transparent border-none px-4 py-3 text-[15px] text-[#151513] focus:outline-none appearance-none cursor-pointer"
            >
              <option value="" disabled>Select year</option>
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 flex items-center">
              <span className="material-symbols-outlined text-[#8C8479] text-[18px]">expand_more</span>
            </div>
          </div>
        </div>

        {/* Confirmation text when all selected */}
        {isFormValid && (
          <p className="mt-2 text-[13px] text-[#2D7A41] font-medium flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}>check_circle</span>
            {monthNames[parseInt(dobMonth) - 1]} {parseInt(dobDay)}, {dobYear}
          </p>
        )}
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
          disabled={!isFormValid || loading}
          className={`flex-[2] py-3.5 rounded-md text-[14px] font-semibold transition-all ${isFormValid && !loading
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
