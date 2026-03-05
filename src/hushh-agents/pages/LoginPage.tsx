/**
 * Hushh Agents — Login Page (Saturn editorial design)
 *
 * Matches the homepage design language: DashedSection crop-mark borders,
 * Playfair Display serif headings, Inter sans body, #1400FF accent.
 * After OAuth → redirects to ?redirectTo= param or /hushh-agents.
 */
import { useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { FaApple } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../hooks/useAuth';
import HushhLogo from '../../components/images/Hushhogo.png';

/* ── Fonts ── */
const serif = { fontFamily: "'Playfair Display', serif" };
const sans = { fontFamily: "'Inter', sans-serif" };

/* ── Colors (same as HomePage) ── */
const C = {
  primary: '#1A1A1B',
  accent: '#1400FF',
  textSub: '#8A8A8A',
  divider: '#E5E5E5',
  bg: '#FFFFFF',
  bgLight: '#F5F5F5',
};

/* ═══════════════════════════════════════
   Dashed Corner Section Wrapper
   Saturn-style crop mark borders
   (duplicated from HomePage for self-contained page)
   ═══════════════════════════════════════ */
const DashedSection = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <section
    className={`relative mx-4 sm:mx-6 md:mx-8 my-2 ${className}`}
    style={{
      borderLeft: `1px solid ${C.divider}`,
      borderRight: `1px solid ${C.divider}`,
      borderTop: `1px solid ${C.divider}`,
      borderBottom: `1px solid ${C.divider}`,
    }}
  >
    {/* Top-left corner */}
    <div
      className="absolute top-0 left-0 w-5 h-5 pointer-events-none"
      style={{ borderTop: `1px solid ${C.primary}`, borderLeft: `1px solid ${C.primary}` }}
    />
    {/* Top-right corner */}
    <div
      className="absolute top-0 right-0 w-5 h-5 pointer-events-none"
      style={{ borderTop: `1px solid ${C.primary}`, borderRight: `1px solid ${C.primary}` }}
    />
    {/* Bottom-left corner */}
    <div
      className="absolute bottom-0 left-0 w-5 h-5 pointer-events-none"
      style={{ borderBottom: `1px solid ${C.primary}`, borderLeft: `1px solid ${C.primary}` }}
    />
    {/* Bottom-right corner */}
    <div
      className="absolute bottom-0 right-0 w-5 h-5 pointer-events-none"
      style={{ borderBottom: `1px solid ${C.primary}`, borderRight: `1px solid ${C.primary}` }}
    />
    {children}
  </section>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading, signIn, error } = useAuth();

  /* Where to go after login (default: /hushh-agents) */
  const redirectTo = searchParams.get('redirectTo') || '/hushh-agents';

  /* If already logged in, redirect immediately */
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);

  /* Loading skeleton — matches editorial style */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" style={sans}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-sm bg-gray-50 mx-auto mb-4 animate-pulse" />
          <div className="w-32 h-3 bg-gray-50 rounded-sm mx-auto animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col selection:bg-blue-100"
      style={{ background: C.bg, color: C.primary, ...sans }}
    >
      {/* ═══ Header ═══ */}
      <DashedSection>
        <header className="px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
          <Link to="/hushh-agents" className="flex items-center gap-3">
            <img
              src={HushhLogo}
              alt="Hushh"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
            />
            <span
              className="text-lg sm:text-xl tracking-wide font-normal"
              style={{ ...serif, color: C.primary }}
            >
              HUSHH AGENTS
            </span>
          </Link>
          <Link
            to="/hushh-agents"
            className="text-sm hover:opacity-60 transition-opacity flex items-center gap-1"
            style={{ color: C.textSub, ...sans }}
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back
          </Link>
        </header>
      </DashedSection>

      {/* ═══ Main Content ═══ */}
      <DashedSection className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-16 sm:py-20">
          {/* Logo */}
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-sm flex items-center justify-center mb-8 overflow-hidden"
            style={{ background: C.accent }}
          >
            <img
              src={HushhLogo}
              alt="Hushh"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain brightness-0 invert"
            />
          </div>

          {/* Heading */}
          <h1
            className="text-3xl sm:text-4xl font-normal text-center mb-3"
            style={{ ...serif, color: C.primary }}
          >
            Sign in
          </h1>
          <p
            className="text-sm text-center font-light max-w-xs mb-10"
            style={{ color: C.textSub, ...sans }}
          >
            Access your AI agents, chat history, and preferences.
          </p>

          {/* Error */}
          {error && (
            <div
              className="w-full max-w-sm mb-6 px-5 py-3"
              style={{ background: '#FEF2F2', border: '1px solid #FEE2E2' }}
            >
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          {/* Sign-in Buttons — editorial rectangle style */}
          <div className="w-full max-w-sm space-y-3 mb-10">
            <button
              onClick={() => signIn('apple')}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: C.primary }}
            >
              <FaApple className="text-lg" />
              <span>Continue with Apple</span>
            </button>

            <button
              onClick={() => signIn('google')}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 text-sm font-medium transition-opacity hover:opacity-90"
              style={{
                background: C.bg,
                color: C.primary,
                border: `1px solid ${C.divider}`,
              }}
            >
              <FcGoogle className="text-lg" />
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Dashed divider */}
          <div
            className="w-full max-w-sm border-b border-dashed mb-8"
            style={{ borderColor: C.divider }}
          />

          {/* Features — editorial grid */}
          <div className="w-full max-w-sm">
            <p
              className="text-[11px] tracking-[0.25em] uppercase mb-5 text-center font-medium"
              style={{ color: C.textSub, ...sans }}
            >
              What you get
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: 'chat', label: 'Text Chat' },
                { icon: 'mic', label: 'Voice (Pro)' },
                { icon: 'translate', label: 'Multi-lingual' },
              ].map((f) => (
                <div
                  key={f.icon}
                  className="flex flex-col items-center gap-2 py-4"
                  style={{ background: C.bgLight }}
                >
                  <span
                    className="material-symbols-outlined text-xl"
                    style={{
                      color: C.accent,
                      fontVariationSettings: "'FILL' 0, 'wght' 300",
                    }}
                  >
                    {f.icon}
                  </span>
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: C.primary }}
                  >
                    {f.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashedSection>

      {/* ═══ Footer ═══ */}
      <DashedSection>
        <footer className="px-5 sm:px-8 py-6 flex flex-col items-center gap-4">
          {/* Trust badge */}
          <div className="flex items-center gap-2 opacity-50">
            <span
              className="material-symbols-outlined text-[1rem]"
              style={{ color: C.accent, fontVariationSettings: "'FILL' 0, 'wght' 300" }}
            >
              lock
            </span>
            <span
              className="text-[0.6rem] tracking-[0.15em] uppercase font-medium"
              style={{ color: C.textSub }}
            >
              256-bit encryption
            </span>
          </div>

          {/* Terms */}
          <p
            className="text-[11px] leading-[16px] text-center font-light"
            style={{ color: C.textSub }}
          >
            By continuing, you agree to our{' '}
            <Link
              to="/terms"
              className="underline underline-offset-2 hover:opacity-60"
              style={{ color: C.primary }}
            >
              Terms
            </Link>{' '}
            and{' '}
            <Link
              to="/privacy"
              className="underline underline-offset-2 hover:opacity-60"
              style={{ color: C.primary }}
            >
              Privacy Policy
            </Link>
          </p>
        </footer>
      </DashedSection>

      {/* Bottom spacing */}
      <div className="h-4" />
    </div>
  );
}
