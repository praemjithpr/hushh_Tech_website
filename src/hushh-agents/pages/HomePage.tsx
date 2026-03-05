/**
 * Hushh Agents — Landing Page (Saturn-inspired)
 *
 * Clean, editorial layout with dashed corner borders,
 * serif headings, feature sections, CEO testimonial,
 * enterprise security badges, and KPI stats.
 * Fully public — no auth gate.
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import DeleteAccountModal from '../../components/DeleteAccountModal';
import HushhLogo from '../../components/images/Hushhogo.png';

/* ── Fonts ── */
const serif = { fontFamily: "'Playfair Display', serif" };
const sans = { fontFamily: "'Inter', sans-serif" };

/* ── Colors ── */
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
   ═══════════════════════════════════════ */
const DashedSection = ({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) => (
  <section
    id={id}
    className={`relative mx-4 sm:mx-6 md:mx-8 my-2 ${className}`}
    style={{
      borderLeft: `1px solid ${C.divider}`,
      borderRight: `1px solid ${C.divider}`,
      borderTop: `1px solid ${C.divider}`,
      borderBottom: `1px solid ${C.divider}`,
      clipPath:
        'polygon(0 0, 20px 0, 20px 0, 20px 0, calc(100% - 20px) 0, 100% 0, 100% 20px, 100% 20px, 100% calc(100% - 20px), 100% 100%, calc(100% - 20px) 100%, 20px 100%, 0 100%, 0 calc(100% - 20px), 0 20px)',
    }}
  >
    {/* Top-left corner */}
    <div
      className="absolute top-0 left-0 w-5 h-5 pointer-events-none"
      style={{
        borderTop: `1px solid ${C.primary}`,
        borderLeft: `1px solid ${C.primary}`,
      }}
    />
    {/* Top-right corner */}
    <div
      className="absolute top-0 right-0 w-5 h-5 pointer-events-none"
      style={{
        borderTop: `1px solid ${C.primary}`,
        borderRight: `1px solid ${C.primary}`,
      }}
    />
    {/* Bottom-left corner */}
    <div
      className="absolute bottom-0 left-0 w-5 h-5 pointer-events-none"
      style={{
        borderBottom: `1px solid ${C.primary}`,
        borderLeft: `1px solid ${C.primary}`,
      }}
    />
    {/* Bottom-right corner */}
    <div
      className="absolute bottom-0 right-0 w-5 h-5 pointer-events-none"
      style={{
        borderBottom: `1px solid ${C.primary}`,
        borderRight: `1px solid ${C.primary}`,
      }}
    />
    {children}
  </section>
);

/* ═══════════════════════════════════════
   Feature Section Component
   Visual card + label + heading + desc
   ═══════════════════════════════════════ */
const FeatureSection = ({
  label,
  heading,
  description,
  description2,
  linkText,
  linkTo,
  mockupIcon,
  mockupItems,
}: {
  label: string;
  heading: string;
  description: string;
  description2?: string;
  linkText: string;
  linkTo: string;
  mockupIcon: string;
  mockupItems?: string[];
}) => {
  const navigate = useNavigate();
  const [activeIdx, setActiveIdx] = useState(0);

  /* Auto-cycle through items every 2s — Saturn video-like effect */
  useEffect(() => {
    if (!mockupItems || mockupItems.length === 0) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % mockupItems.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [mockupItems]);

  return (
    <DashedSection>
      {/* Visual Card — premium product mockup */}
      <div
        className="w-full py-8 sm:py-12 md:py-16 flex items-center justify-center relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, ${C.bgLight} 0%, #EBEBEB 100%)` }}
      >
        {mockupItems ? (
          <div
            className="w-[88%] max-w-[280px] sm:max-w-[320px] rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
              border: '1px solid rgba(255,255,255,0.6)',
              animation: 'float-card 6s ease-in-out infinite',
            }}
          >
            {/* Mini app header bar */}
            <div className="flex items-center gap-1.5 px-4 py-2.5" style={{ borderBottom: '1px solid #F0F0F0' }}>
              <div className="w-2 h-2 rounded-full bg-[#FF5F57]" />
              <div className="w-2 h-2 rounded-full bg-[#FFBD2E]" />
              <div className="w-2 h-2 rounded-full bg-[#28C840]" />
              <span className="ml-auto text-[9px] font-medium tracking-wider uppercase" style={{ color: '#BBB' }}>
                hushh agents
              </span>
            </div>

            {/* Items list */}
            <div className="p-3 sm:p-4 flex flex-col gap-1.5 sm:gap-2">
              {mockupItems.map((item, i) => {
                const isActive = i === activeIdx;
                return (
                  <div
                    key={item}
                    className="flex items-center gap-2.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg transition-all duration-600"
                    style={{
                      background: isActive ? `linear-gradient(90deg, rgba(20,0,255,0.06) 0%, rgba(20,0,255,0.02) 100%)` : 'transparent',
                      borderLeft: isActive ? `3px solid ${C.accent}` : '3px solid transparent',
                      transform: isActive ? 'translateX(2px)' : 'translateX(0)',
                      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    {/* Check/radio icon */}
                    <div
                      className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-400"
                      style={{
                        width: 18, height: 18,
                        background: isActive ? C.accent : 'transparent',
                        border: isActive ? 'none' : '1.5px solid #D0D0D0',
                      }}
                    >
                      {isActive && (
                        <span className="text-white text-[10px] font-bold">✓</span>
                      )}
                    </div>
                    <span
                      className="text-[12px] sm:text-[13px] transition-all duration-400"
                      style={{
                        color: isActive ? C.primary : '#B0B0B0',
                        fontWeight: isActive ? 600 : 400,
                        letterSpacing: isActive ? '0.01em' : '0',
                      }}
                    >
                      {item}
                    </span>
                    {/* Animated arrow for active */}
                    <span
                      className="ml-auto transition-all duration-400"
                      style={{
                        opacity: isActive ? 0.6 : 0,
                        transform: isActive ? 'translateX(0)' : 'translateX(-8px)',
                        fontSize: 12,
                        color: C.accent,
                      }}
                    >
                      →
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bottom progress indicator */}
            <div className="px-4 pb-3">
              <div className="flex gap-1.5">
                {mockupItems.map((_, i) => (
                  <div
                    key={i}
                    className="h-[3px] rounded-full flex-1 transition-all duration-500"
                    style={{
                      background: i <= activeIdx ? C.accent : '#E8E8E8',
                      opacity: i === activeIdx ? 1 : i < activeIdx ? 0.4 : 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Concentric circles with pulse */}
            <div
              className="w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-dashed flex items-center justify-center"
              style={{ borderColor: '#D0D0D0', animation: 'pulse-ring 3s ease-in-out infinite' }}
            >
              <div
                className="w-44 h-44 sm:w-52 sm:h-52 rounded-full border flex items-center justify-center"
                style={{ borderColor: '#D8D8D8' }}
              >
                <div
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center"
                  style={{ background: C.accent }}
                >
                  <span className="material-symbols-outlined text-white text-4xl sm:text-5xl">
                    {mockupIcon}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Text Content */}
      <div className="px-5 sm:px-8 py-8 sm:py-10">
        <p
          className="text-[11px] tracking-[0.25em] uppercase mb-3 font-medium"
          style={{ color: C.textSub, ...sans }}
        >
          {label}
        </p>
        <h3
          className="text-2xl sm:text-3xl mb-4 font-normal"
          style={{ ...serif, color: C.primary }}
        >
          {heading}
        </h3>
        <p
          className="text-sm leading-relaxed mb-3 font-light"
          style={{ color: C.textSub, ...sans }}
        >
          {description}
        </p>
        {description2 && (
          <p
            className="text-sm leading-relaxed mb-3 font-light"
            style={{ color: C.textSub, ...sans }}
          >
            {description2}
          </p>
        )}
        <button
          onClick={() => navigate(linkTo)}
          className="text-sm font-semibold mt-2 hover:opacity-70 transition-opacity"
          style={{ color: C.accent, ...sans }}
        >
          {linkText}
        </button>
      </div>
    </DashedSection>
  );
};

/* ═══════════════════════════════════════
   KPI Stat Block
   ═══════════════════════════════════════ */
const KpiBlock = ({ value, label }: { value: string; label: string }) => (
  <DashedSection>
    <div className="px-5 sm:px-8 py-16 sm:py-20">
      <h3
        className="text-5xl sm:text-6xl mb-6 font-normal"
        style={{ ...serif, color: C.primary }}
      >
        {value}
      </h3>
      <p
        className="text-sm leading-relaxed font-light max-w-md"
        style={{ color: C.textSub, ...sans }}
      >
        {label}
      </p>
    </div>
  </DashedSection>
);

/* ═══════════════════════════════════════
   Main Page Component
   ═══════════════════════════════════════ */
export default function AgentsHomePage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { isAuthenticated, signOut } = useAuth();

  /* Log out handler — clears session cache + redirects */
  const handleLogout = useCallback(async () => {
    setIsMenuOpen(false);
    try {
      await signOut();
      /* Clear cached agent data */
      try { sessionStorage.removeItem('hushh_agents_cache'); } catch {}
      try { localStorage.removeItem('hushh_agents_cache'); } catch {}
      navigate('/hushh-agents', { replace: true });
    } catch {
      navigate('/hushh-agents', { replace: true });
    }
  }, [signOut, navigate]);

  /* Delete account — opens production glassmorphism modal */
  const handleOpenDeleteModal = useCallback(() => {
    setIsMenuOpen(false);
    setIsDeleteModalOpen(true);
  }, []);

  /* After account is deleted via modal — redirect to landing */
  const handleAccountDeleted = useCallback(() => {
    setIsDeleteModalOpen(false);
    try { sessionStorage.clear(); } catch {}
    navigate('/hushh-agents', { replace: true });
  }, [navigate]);

  /* Nav items with icons */
  const navItems = [
    { label: 'Home', to: '/hushh-agents', icon: 'home' },
    { label: 'Chat', to: '/hushh-agents/chat', icon: 'chat' },
    { label: 'Voice', to: '/hushh-agents/voice', icon: 'mic' },
    { label: 'Code', to: '/hushh-agents/code', icon: 'code' },
  ];

  return (
    <div
      className="min-h-screen selection:bg-blue-100"
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
          <button
            onClick={() => setIsMenuOpen(true)}
            className="w-10 h-10 flex items-center justify-center"
            aria-label="Open menu"
          >
            <div className="flex flex-col gap-[5px]">
              <span className="w-6 h-[1.5px]" style={{ background: C.primary }} />
              <span className="w-6 h-[1.5px]" style={{ background: C.primary }} />
            </div>
          </button>
        </header>
      </DashedSection>

      {/* ═══ Nav Drawer — Session-aware ═══ */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col" style={sans}>
          {/* Drawer Header */}
          <DashedSection>
            <div className="px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
              <Link to="/hushh-agents" className="flex items-center gap-3">
                <img src={HushhLogo} alt="Hushh" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
                <span className="text-lg sm:text-xl tracking-wide font-normal" style={{ ...serif, color: C.primary }}>
                  HUSHH AGENTS
                </span>
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center"
                aria-label="Close menu"
              >
                <span className="material-symbols-outlined text-2xl" style={{ color: C.textSub }}>close</span>
              </button>
            </div>
          </DashedSection>

          {/* Nav Links — Card-style with icons */}
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-xs space-y-3">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => { setIsMenuOpen(false); navigate(item.to); }}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]"
                  style={{ borderColor: C.divider, background: C.bg }}
                >
                  <span
                    className="material-symbols-outlined text-xl"
                    style={{ color: C.accent }}
                  >
                    {item.icon}
                  </span>
                  <span
                    className="text-sm font-medium tracking-wide"
                    style={{ color: C.primary }}
                  >
                    {item.label}
                  </span>
                  <span
                    className="material-symbols-outlined text-base ml-auto"
                    style={{ color: '#D0D0D0' }}
                  >
                    chevron_right
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Actions — session-aware */}
          <div className="px-6 pb-10 space-y-3">
            {isAuthenticated ? (
              <>
                {/* Log out */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-medium tracking-wide transition-colors hover:bg-gray-100"
                  style={{ background: C.bgLight, color: C.primary }}
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  Log out
                </button>

                {/* Delete account — opens production glassmorphism modal */}
                <button
                  onClick={handleOpenDeleteModal}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-medium tracking-wide text-red-500 transition-colors hover:bg-red-50"
                  style={{ background: 'transparent', border: '1px solid #FEE2E2' }}
                >
                  <span className="material-symbols-outlined text-lg">delete_forever</span>
                  Delete account
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setIsMenuOpen(false); navigate('/hushh-agents/login'); }}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-medium tracking-wide transition-colors hover:bg-gray-100"
                  style={{ background: C.bgLight, color: C.primary }}
                >
                  <span className="material-symbols-outlined text-lg">login</span>
                  Login
                </button>
                <button
                  onClick={() => { setIsMenuOpen(false); navigate('/hushh-agents/kirkland'); }}
                  className="w-full py-4 rounded-xl text-center text-sm font-medium tracking-wide text-white transition-opacity hover:opacity-90"
                  style={{ background: C.accent }}
                >
                  Get started
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══ Hero ═══ */}
      <DashedSection>
        <div className="px-5 sm:px-8 py-20 sm:py-28 md:py-32 text-center">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-normal leading-tight mb-6"
            style={{ ...serif, color: C.primary }}
          >
            Unlock your
            <br />
            <span className="italic" style={{ color: C.textSub }}>
              advisory potential
            </span>
          </h1>
          <p
            className="text-sm sm:text-base leading-relaxed font-light max-w-lg mx-auto mb-10"
            style={{ color: C.textSub, ...sans }}
          >
            AI-powered agents for Registered Investment Advisors and financial
            professionals. Discover local advisors, automate workflows, and
            deliver excellence at scale.
          </p>
          <button
            onClick={() => navigate('/hushh-agents/kirkland')}
            className="inline-flex items-center gap-2 px-8 py-4 text-sm font-medium text-white tracking-wide transition-opacity hover:opacity-90"
            style={{ background: C.accent }}
          >
            Get started
            <span className="text-lg">→</span>
          </button>
        </div>
      </DashedSection>

      {/* ═══ Trusted By — Scrolling Marquee ═══ */}
      <DashedSection>
        <div className="py-14 sm:py-20 overflow-hidden" style={{ background: C.bgLight }}>
          {/* Marquee with fade edges */}
          <div
            className="relative mb-10"
            style={{
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
              maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
            }}
          >
            <div
              className="flex items-center whitespace-nowrap"
              style={{
                animation: 'marquee-scroll 30s linear infinite',
                width: 'max-content',
              }}
            >
              {[1, 2].map((set) => (
                <div key={set} className="flex items-center" style={{ gap: '4.5rem' }}>
                  {/* rockwealth */}
                  <span
                    className="text-2xl sm:text-3xl md:text-4xl tracking-tight"
                    style={{ color: C.primary, opacity: 0.35, fontFamily: "'Inter', sans-serif", fontWeight: 700 }}
                  >
                    rock<span style={{ fontWeight: 300 }}>wealth</span>
                  </span>

                  {/* Paradigm Norton | for life */}
                  <span
                    className="text-2xl sm:text-3xl md:text-4xl flex items-center"
                    style={{ color: C.primary, opacity: 0.35 }}
                  >
                    <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>Paradigm</span>
                    <span className="inline-block w-px mx-3" style={{ height: '1.8em', background: '#AAAAAA' }} />
                    <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 300, fontStyle: 'italic' }}>for life</span>
                  </span>

                  {/* COOPER PARRY */}
                  <span
                    className="text-2xl sm:text-3xl md:text-4xl uppercase"
                    style={{ color: C.primary, opacity: 0.35, fontFamily: "'Inter', sans-serif", fontWeight: 900, letterSpacing: '0.12em' }}
                  >
                    Cooper Parry
                  </span>

                  {/* hushh.ai */}
                  <span
                    className="text-2xl sm:text-3xl md:text-4xl tracking-tight"
                    style={{ color: C.primary, opacity: 0.35, fontFamily: "'Inter', sans-serif", fontWeight: 800 }}
                  >
                    hushh<span style={{ fontWeight: 300 }}>.ai</span>
                  </span>

                  {/* Kirkland Advisors */}
                  <span
                    className="text-2xl sm:text-3xl md:text-4xl"
                    style={{ color: C.primary, opacity: 0.35, fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
                  >
                    Kirkland <span style={{ fontWeight: 300, fontStyle: 'italic' }}>Advisors</span>
                  </span>

                  {/* Google Cloud */}
                  <span
                    className="text-2xl sm:text-3xl md:text-4xl"
                    style={{ color: C.primary, opacity: 0.35, fontFamily: "'Inter', sans-serif", fontWeight: 500, letterSpacing: '0.02em' }}
                  >
                    Google Cloud
                  </span>

                  {/* spacer between sets */}
                  <span className="inline-block" style={{ width: '4.5rem' }} />
                </div>
              ))}
            </div>
          </div>

          <p
            className="text-sm text-center font-light tracking-wide px-5"
            style={{ color: C.textSub, fontFamily: "'Inter', sans-serif" }}
          >
            Trusted by over 500+ leading advice firms
          </p>
        </div>
      </DashedSection>

      {/* Animation keyframes */}
      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.03); }
        }
        @keyframes float-card {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
      `}</style>

      {/* ═══ Feature 1: Kirkland R.I.A. Agents (PRIMARY) ═══ */}
      <FeatureSection
        label="R.I.A. AGENT NETWORK"
        heading="Discover advisors near you"
        description="Browse and connect with Registered Investment Advisors in Kirkland and beyond. Search by name, specialty, or location to find the right financial expertise."
        description2="Unify everything into a single source of truth through deep integrations with your advisory ecosystem and back-office platforms."
        linkText="Learn more"
        linkTo="/hushh-agents/kirkland"
        mockupIcon="domain"
        mockupItems={['R.I.A. Advisors', 'Fund Research', 'Compliance Reports', 'Client Matching']}
      />

      {/* ═══ Feature 2: AI Chat ═══ */}
      <FeatureSection
        label="INTELLIGENT CONVERSATIONS"
        heading="Converse naturally in any language"
        description="Your AI companion that understands context, nuance, and multiple languages. Ask questions, get analysis, creative writing, and more."
        description2="Create a seamless conversational experience where your AI operates in perfect harmony, scaling effortlessly with your needs."
        linkText="Learn more"
        linkTo="/hushh-agents/chat"
        mockupIcon="chat"
        mockupItems={['Natural Language', 'Multi-turn Context', 'Creative Writing', 'Code Analysis']}
      />

      {/* ═══ Feature 3: Voice Agent ═══ */}
      <FeatureSection
        label="VOICE INTELLIGENCE"
        heading="Speak naturally, get instant responses"
        description="Real-time voice conversations powered by advanced AI. Speak in Tamil, Hindi, or English and get native responses instantly."
        description2="Reinvent communication from text-only to voice-first with intelligent speech recognition across every interaction."
        linkText="Learn more"
        linkTo="/hushh-agents/voice"
        mockupIcon="record_voice_over"
      />

      {/* ═══ Feature 4: Code Generation ═══ */}
      <FeatureSection
        label="CODE ASSISTANT"
        heading="Generate, debug and optimize code"
        description="AI-powered code generation, debugging, explanation, and optimization with step-by-step reasoning."
        description2="From suitability analysis to code reviews, release your team from manual debugging to focus exclusively on value delivery."
        linkText="Learn more"
        linkTo="/hushh-agents/code"
        mockupIcon="code"
      />

      {/* ═══ CEO Section ═══ */}
      <DashedSection>
        <div className="px-5 sm:px-8 pt-6 sm:pt-8">
          {/* CEO Image */}
          <div
            className="w-full aspect-[4/3] sm:aspect-[16/10] rounded-sm overflow-hidden mb-8 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1a1a1b 0%, #333 100%)' }}
          >
            <div className="text-center">
              <div
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                <span className="text-5xl sm:text-6xl" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  MS
                </span>
              </div>
              <span
                className="text-xs uppercase tracking-[0.2em] font-medium"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                hushh technologies
              </span>
            </div>
            {/* Next Arrow */}
            <button
              className="absolute right-8 sm:right-10 bottom-[calc(50%+20px)] w-10 h-10 rounded flex items-center justify-center"
              style={{ background: C.primary }}
              aria-label="Next testimonial"
            >
              <span className="material-symbols-outlined text-white text-lg">chevron_right</span>
            </button>
          </div>

          {/* Quote */}
          <p
            className="text-sm sm:text-base leading-relaxed font-light mb-8"
            style={{ color: C.textSub, ...sans }}
          >
            We're redefining the data landscape. Our mission: empower users by making their
            data universally accessible and valuable, all while placing paramount importance
            on privacy and user control. Hushh Agents lets us focus on delivering that for
            our users.
          </p>

          {/* Dashed Divider */}
          <div
            className="border-b border-dashed mb-6"
            style={{ borderColor: C.divider }}
          />

          {/* CEO Info */}
          <div className="pb-8">
            <h4 className="text-base font-bold mb-1" style={{ color: C.primary, ...sans }}>
              Manish Sainani
            </h4>
            <p className="text-sm font-light" style={{ color: C.textSub, ...sans }}>
              CEO
            </p>
            <p className="text-sm font-light" style={{ color: C.textSub, ...sans }}>
              Hushh Technologies
            </p>
          </div>
        </div>
      </DashedSection>

      {/* ═══ Enterprise Security ═══ */}
      <DashedSection>
        <div className="px-5 sm:px-8 py-10 sm:py-14">
          <h3
            className="text-2xl sm:text-3xl mb-5 font-normal"
            style={{ ...serif, color: C.primary }}
          >
            Enterprise security as standard
          </h3>
          <div className="space-y-1 mb-4">
            <p className="text-sm font-light" style={{ color: C.textSub, ...sans }}>
              Privacy. Security. Peace of mind.
            </p>
            <p className="text-sm font-light" style={{ color: C.textSub, ...sans }}>
              Never used for training.
            </p>
            <p className="text-sm font-light" style={{ color: C.textSub, ...sans }}>
              Round the clock enterprise security.
            </p>
          </div>
          <button
            className="text-sm font-semibold mt-2 mb-8 hover:opacity-70 transition-opacity"
            style={{ color: C.accent, ...sans }}
          >
            Learn more
          </button>

          {/* Security Badges */}
          <div className="flex items-center gap-6 sm:gap-10">
            {/* SOC 2 */}
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border flex flex-col items-center justify-center"
              style={{ borderColor: C.divider }}
            >
              <span className="text-[11px] font-bold" style={{ color: C.primary }}>
                AICPA
              </span>
              <span className="text-[10px] font-light" style={{ color: C.textSub }}>
                SOC 2
              </span>
            </div>
            {/* GDPR */}
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border flex flex-col items-center justify-center"
              style={{ borderColor: C.divider }}
            >
              <div className="flex items-center gap-0.5 mb-0.5">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[8px]" style={{ color: C.textSub }}>
                    ★
                  </span>
                ))}
              </div>
              <span className="text-[11px] font-bold" style={{ color: C.primary }}>
                GDPR
              </span>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[8px]" style={{ color: C.textSub }}>
                    ★
                  </span>
                ))}
              </div>
            </div>
            {/* Cyber Essentials */}
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border flex flex-col items-center justify-center"
              style={{ borderColor: C.divider }}
            >
              <span className="material-symbols-outlined text-sm mb-0.5" style={{ color: C.textSub }}>
                check
              </span>
              <span className="text-[10px] font-medium text-center leading-tight" style={{ color: C.primary }}>
                Cyber
              </span>
              <span className="text-[9px] font-light" style={{ color: C.textSub }}>
                Essentials
              </span>
            </div>
          </div>
        </div>
      </DashedSection>

      {/* ═══ KPI Stats ═══ */}
      <KpiBlock
        value="500+"
        label="Leading enterprises use Hushh Agents to automate workflows, generate insights and enhance productivity"
      />
      <KpiBlock
        value="3,000+"
        label="AI-powered conversations processed daily across multiple languages and modalities"
      />
      <KpiBlock
        value="99.9%"
        label="Uptime SLA backed by Google Cloud infrastructure with enterprise-grade reliability"
      />

      {/* ═══ CTA Footer ═══ */}
      <div className="mx-4 sm:mx-6 md:mx-8 my-8">
        <div
          className="rounded-sm px-6 sm:px-10 py-14 sm:py-20"
          style={{ background: C.primary }}
        >
          <h3
            className="text-3xl sm:text-4xl text-white mb-8 font-normal"
            style={serif}
          >
            Unlock your AI agents
          </h3>
          <button
            onClick={() => navigate('/hushh-agents/kirkland')}
            className="inline-flex items-center gap-2 px-7 py-4 text-sm font-medium tracking-wide text-white transition-opacity hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            Get started
            <span className="text-lg">→</span>
          </button>
        </div>
      </div>

      {/* ═══ Footer ═══ */}
      <DashedSection>
        <footer className="px-5 sm:px-8 py-10 sm:py-14">
          <p className="text-sm mb-6" style={{ color: C.textSub, ...sans }}>
            contact@hushh.ai
          </p>
          <div className="space-y-4 mb-8">
            {['Careers', 'Journal', 'Security', 'Agents', 'About Us'].map((link) => (
              <p key={link}>
                <span
                  className="text-sm cursor-pointer hover:opacity-60 transition-opacity"
                  style={{ color: C.primary, ...sans }}
                >
                  {link}
                </span>
              </p>
            ))}
          </div>
          <div className="border-t pt-6" style={{ borderColor: C.divider }}>
            <div className="flex items-center gap-4 flex-wrap text-sm mb-3">
              <Link to="/privacy-policy" className="hover:opacity-60" style={{ color: C.primary }}>
                Privacy Policy
              </Link>
              <span style={{ color: C.divider }}>•</span>
              <span style={{ color: C.primary }}>Terms of Service</span>
            </div>
            <p className="text-xs font-light" style={{ color: C.textSub }}>
              Hushh Technologies LLC, Kirkland, Washington
            </p>
            <p className="text-xs font-light mt-1" style={{ color: C.textSub }}>
              © {new Date().getFullYear()}, All rights reserved.
            </p>
          </div>
        </footer>
      </DashedSection>

      {/* Bottom spacing */}
      <div className="h-8" />

      {/* ═══ Delete Account Modal — Production glassmorphism (reused from main app) ═══ */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onAccountDeleted={handleAccountDeleted}
      />
    </div>
  );
}
