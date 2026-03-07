/**
 * Home Page — Fundrise-inspired UI
 *
 * Sections (top → bottom):
 *  1. Hero          — serif headline, subtext, dual CTAs, trust strip
 *  2. Stats strip   — 3 key metrics (full-width white band)
 *  3. Hushh Advantage — 4-card features grid (cream bg)
 *  4. Fund A        — dark navy card + 4-feature sidebar grid (cream bg)
 *  5. How It Works  — 3-step numbered process (cream bg)
 *  6. CTA Band      — rust bg, white text, "Get started" button
 *  7. Footer        — HushhTechFooter
 *
 * Typography: Cormorant Garamond (headings) + Source Sans 3 (body)
 * Colors    : fr-rust #AA4528 | fr-navy #151513 | fr-cream #F7F5F0
 *
 * Logic lives in logic.ts — zero changes there.
 */
import { useHomeLogic } from "./logic";
import HushhTechHeader from "../../components/hushh-tech-header/HushhTechHeader";
import HushhTechFooter from "../../components/hushh-tech-footer/HushhTechFooter";
import HushhTechCta, { HushhTechCtaVariant } from "../../components/hushh-tech-cta/HushhTechCta";

/* ── Font shorthand ── */
const displayFont = { fontFamily: "var(--font-display)" };
const bodyFont = { fontFamily: "var(--font-body)" };

/* ── Inline Fundrise section/container helpers ── */
const Section = ({
  children,
  bg = "bg-[#faf9f6]",
  className = "",
}: {
  children: React.ReactNode;
  bg?: string;
  className?: string;
}) => (
  <section className={`${bg} ${className}`}>
    <div className="fr-container fr-section">{children}</div>
  </section>
);

/* ── Overline label ── */
const Overline = ({ children }: { children: React.ReactNode }) => (
  <p className="fr-overline mb-3" style={bodyFont}>{children}</p>
);

export default function HomePage() {
  const { primaryCTA, onNavigate } = useHomeLogic();

  return (
    <div
      data-page="home"
      className="min-h-screen flex flex-col"
      style={{ ...bodyFont, backgroundColor: "var(--fr-cream)", color: "var(--fr-navy)" }}
    >
      {/* ════════════════════════════════
          Header
          ════════════════════════════════ */}
      <HushhTechHeader fixed={false} />

      <main className="flex-1">

        {/* ════════════════════════════════
            1. HERO SECTION
            White background, large serif headline
            ════════════════════════════════ */}
        <section className="bg-white">
          <div className="fr-container">
            <div className="py-20 md:py-24 lg:py-32 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12 lg:gap-20">

              {/* Left — Text content */}
              <div className="flex-1 max-w-2xl">
                {/* Overline */}
                <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-[#C4BFB5] bg-[#F7F5F0]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#AA4528] inline-block" />
                  <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#AA4528]" style={bodyFont}>
                    AI-Powered Investing
                  </span>
                </div>

                {/* H1 */}
                <h1
                  className="text-[3.2rem] md:text-[4rem] lg:text-[4.8rem] xl:text-[5.5rem] leading-[1.05] font-medium text-[#151513] tracking-tight mb-6"
                  style={displayFont}
                >
                  Investing in<br />
                  the{" "}
                  <em className="not-italic text-[#AA4528]">Future.</em>
                </h1>

                <p
                  className="text-[17px] md:text-[18px] text-[#4A4540] leading-relaxed max-w-xl mb-10"
                  style={bodyFont}
                >
                  The world's first AI-powered Berkshire Hathaway. We merge rigorous data
                  science with human wisdom to invest in exceptional businesses for
                  generational wealth creation.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                  <HushhTechCta
                    variant={HushhTechCtaVariant.RUST}
                    onClick={primaryCTA.action}
                    disabled={primaryCTA.loading}
                    className="!w-auto !px-8"
                  >
                    {primaryCTA.text}
                  </HushhTechCta>
                  <HushhTechCta
                    variant={HushhTechCtaVariant.WHITE}
                    onClick={() => onNavigate("/discover-fund-a")}
                    className="!w-auto !px-8"
                  >
                    Discover Fund A
                  </HushhTechCta>
                </div>

                {/* Trust badges */}
                <div className="flex items-center gap-6 mt-8">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#AA4528] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                    <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#8C8479]" style={bodyFont}>
                      SEC Registered
                    </span>
                  </div>
                  <div className="w-px h-4 bg-[#C4BFB5]" />
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#AA4528] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                      lock
                    </span>
                    <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#8C8479]" style={bodyFont}>
                      Bank-Level Security
                    </span>
                  </div>
                </div>
              </div>

              {/* Right — Feature mini-cards (desktop only) */}
              <div className="hidden lg:flex flex-col gap-4 w-[340px] xl:w-[380px] shrink-0">
                {[
                  {
                    dot: "#AA4528",
                    title: "AI-Powered",
                    desc: "Institutional-grade analytics processing millions of signals in real time.",
                  },
                  {
                    dot: "#4A4540",
                    title: "Human-Led",
                    desc: "Seasoned expert oversight ensuring long-term strategic vision.",
                  },
                  {
                    dot: "#C4BFB5",
                    title: "Transparent",
                    desc: "Full visibility into every investment decision and fee structure.",
                  },
                ].map(({ dot, title, desc }) => (
                  <div key={title} className="bg-[#F7F5F0] border border-[#EEE9E0] rounded-md p-6 hover:border-[#AA4528]/30 transition-colors">
                    <div className="w-2.5 h-2.5 rounded-full mb-4" style={{ backgroundColor: dot }} />
                    <h3 className="text-[19px] font-light mb-2 text-[#151513]" style={displayFont}>{title}</h3>
                    <p className="text-[13px] text-[#8C8479] leading-relaxed" style={bodyFont}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════
            2. STATS STRIP
            White band, 3 large number metrics
            ════════════════════════════════ */}
        <section className="bg-white border-t border-b border-[#F2F0EB]">
          <div className="fr-container">
            <div className="py-10 md:py-12 grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-0 md:divide-x md:divide-[#F2F0EB]">
              {[
                { value: "18–23%", label: "Target Net IRR" },
                { value: "$10M+", label: "Assets Under Management" },
                { value: "2024", label: "Fund Inception Year" },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col items-center text-center md:px-8">
                  <span
                    className="text-[2.8rem] md:text-[3.5rem] font-light leading-none text-[#151513] mb-2"
                    style={displayFont}
                  >
                    {value}
                  </span>
                  <span className="text-[13px] font-semibold tracking-[0.06em] uppercase text-[#8C8479]" style={bodyFont}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════
            3. THE HUSHH ADVANTAGE
            4-card feature grid, cream background
            ════════════════════════════════ */}
        <Section>
          <Overline>Why Hushh</Overline>
          <h2
            className="text-[2.6rem] md:text-[3.2rem] lg:text-[3.8rem] font-light text-[#151513] leading-tight mb-4"
            style={displayFont}
          >
            The Hushh Advantage
          </h2>
          <p className="text-[16px] text-[#8C8479] max-w-xl mb-14" style={bodyFont}>
            We've reimagined what an investment firm can be — combining the precision of
            artificial intelligence with the judgment of experienced fund managers.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "analytics",
                title: "Data Driven",
                desc: "Real-time market analytics and proprietary signals inform every decision.",
                accent: "#AA4528",
              },
              {
                icon: "savings",
                title: "Low Fees",
                desc: "Industry-low fee structure means more of your returns stay with you.",
                accent: "#4A4540",
              },
              {
                icon: "workspace_premium",
                title: "Expert Vetted",
                desc: "Every opportunity curated by top-tier financial minds and AI screening.",
                accent: "#AA4528",
              },
              {
                icon: "autorenew",
                title: "Automated",
                desc: "Set-and-forget intelligent rebalancing for worry-free long-term investing.",
                accent: "#4A4540",
              },
            ].map(({ icon, title, desc, accent }) => (
              <div
                key={title}
                className="fr-card flex flex-col gap-5 group"
                style={{ cursor: "default" }}
              >
                <div
                  className="w-11 h-11 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: `${accent}15` }}
                >
                  <span
                    className="material-symbols-outlined text-[22px]"
                    style={{ color: accent, fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                  >
                    {icon}
                  </span>
                </div>
                <div>
                  <h3 className="text-[18px] font-light text-[#151513] mb-2" style={displayFont}>{title}</h3>
                  <p className="text-[13px] text-[#8C8479] leading-relaxed" style={bodyFont}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ════════════════════════════════
            4. FUND A + FEATURE GRID
            Dark card + 4-cell sidebar grid
            ════════════════════════════════ */}
        <Section className="bg-[#EEE9E0]">
          <Overline>Flagship Product</Overline>
          <h2
            className="text-[2.6rem] md:text-[3.2rem] font-light text-[#151513] leading-tight mb-12"
            style={displayFont}
          >
            Fund A
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12">

            {/* Dark Fund A card */}
            <div className="bg-[#151513] text-white rounded-md p-8 md:p-10 relative overflow-hidden flex flex-col justify-between min-h-[340px]">
              {/* Subtle rust glow */}
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #AA4528, transparent 70%)", pointerEvents: "none" }} />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#8C8479] block mb-2" style={bodyFont}>
                      Flagship Growth Fund
                    </span>
                    <h3 className="text-[3rem] font-light leading-none text-white" style={displayFont}>
                      Fund A
                    </h3>
                  </div>
                  <span className="bg-[#AA4528]/20 border border-[#AA4528]/30 text-[#AA4528] text-[11px] font-semibold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full" style={bodyFont}>
                    High Growth
                  </span>
                </div>

                <div className="space-y-5 mb-8">
                  <div>
                    <p className="text-[12px] text-[#8C8479] mb-1" style={bodyFont}>Target Net IRR</p>
                    <p className="text-[3.5rem] font-light leading-none text-[#AA4528]" style={displayFont}>
                      18–23%
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] text-[#8C8479] mb-1" style={bodyFont}>Inception Year</p>
                    <p className="text-[22px] font-light text-white" style={displayFont}>2024</p>
                  </div>
                </div>
              </div>

              <div
                className="relative z-10 pt-5 border-t border-white/10 flex items-center justify-between cursor-pointer group"
                onClick={() => onNavigate("/discover-fund-a")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") onNavigate("/discover-fund-a"); }}
              >
                <span className="text-[12px] font-semibold tracking-[0.1em] uppercase text-[#AA4528]" style={bodyFont}>
                  Performance Details
                </span>
                <span className="material-symbols-outlined text-[#AA4528] text-base group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </div>

            {/* Feature mini-grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "rocket_launch", title: "High Growth", desc: "Accelerated returns targeting exceptional businesses." },
                { icon: "pie_chart", title: "Diversified", desc: "Multi-sector allocation across emerging tech verticals." },
                { icon: "trending_up", title: "Liquid Returns", desc: "Quarterly redemption windows for portfolio flexibility." },
                { icon: "security", title: "Secure Assets", desc: "Regulated custodian with bank-level security protocols." },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="bg-white border border-[#EEE9E0] rounded-md p-5 md:p-6 hover:border-[#AA4528]/30 transition-colors flex flex-col gap-4">
                  <span
                    className="material-symbols-outlined text-[24px] text-[#AA4528]"
                    style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                  >
                    {icon}
                  </span>
                  <div>
                    <h4 className="text-[16px] font-light text-[#151513] mb-1" style={displayFont}>{title}</h4>
                    <p className="text-[12px] text-[#8C8479] leading-relaxed" style={bodyFont}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ════════════════════════════════
            5. HOW IT WORKS
            3-step numbered process
            ════════════════════════════════ */}
        <Section className="bg-white">
          <Overline>Our Process</Overline>
          <h2
            className="text-[2.6rem] md:text-[3.2rem] font-light text-[#151513] leading-tight mb-14"
            style={displayFont}
          >
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                step: "01",
                title: "Complete Your Profile",
                desc: "Tell us about your investment goals and risk appetite. Our AI tailors a strategy just for you.",
              },
              {
                step: "02",
                title: "Fund Your Account",
                desc: "Connect your bank securely and make your initial contribution. Minimums start at $1,000.",
              },
              {
                step: "03",
                title: "Watch Your Wealth Grow",
                desc: "Our AI monitors and rebalances continuously — you just track your dashboard's progress.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col gap-4">
                <span
                  className="text-[4rem] font-light leading-none text-[#EEE9E0] select-none"
                  style={displayFont}
                >
                  {step}
                </span>
                <h3 className="text-[20px] font-light text-[#151513]" style={displayFont}>{title}</h3>
                <p className="text-[14px] text-[#8C8479] leading-relaxed" style={bodyFont}>{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-col sm:flex-row gap-3">
            <HushhTechCta
              variant={HushhTechCtaVariant.RUST}
              onClick={() => onNavigate("/discover-fund-a")}
              className="!w-auto !px-10"
            >
              Explore Our Approach
            </HushhTechCta>
            <HushhTechCta
              variant={HushhTechCtaVariant.WHITE}
              onClick={() => onNavigate("/community")}
              className="!w-auto !px-10"
            >
              Learn More
            </HushhTechCta>
          </div>
        </Section>

        {/* ════════════════════════════════
            6. CTA BAND
            Rust background, white text, "Get started" button
            ════════════════════════════════ */}
        <section className="bg-[#AA4528]">
          <div className="fr-container">
            <div className="py-16 md:py-20 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div className="max-w-xl">
                <h2
                  className="text-[2.5rem] md:text-[3rem] font-light text-white leading-tight mb-3"
                  style={displayFont}
                >
                  Ready to build generational wealth?
                </h2>
                <p className="text-[16px] text-white/75 leading-relaxed" style={bodyFont}>
                  Join thousands of investors who trust Hushh to grow their portfolios with
                  AI-powered precision and human expertise.
                </p>
              </div>
              <div className="shrink-0">
                <button
                  onClick={primaryCTA.action}
                  className="inline-flex items-center gap-2 bg-white text-[#AA4528] font-semibold text-[15px] px-8 py-4 rounded hover:bg-[#F7F5F0] transition-colors shadow-lg"
                  style={bodyFont}
                >
                  {primaryCTA.text}
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════
            Disclaimer
            ════════════════════════════════ */}
        <section className="bg-[#F7F5F0] py-6">
          <div className="fr-container">
            <p className="text-[11px] text-[#8C8479] text-center leading-relaxed max-w-2xl mx-auto" style={bodyFont}>
              * Past performance is not indicative of future results. Investment involves risk,
              including possible loss of principal. Hushh Technologies LLC is an SEC registered
              investment advisor.
            </p>
          </div>
        </section>
      </main>

      {/* ════════════════════════════════
          Footer
          ════════════════════════════════ */}
      <HushhTechFooter />
    </div>
  );
}
