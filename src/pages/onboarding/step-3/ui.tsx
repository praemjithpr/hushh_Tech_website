/**
 * Step 3 — Informational Interstitial (Auto-skip after 10s)
 * Premium Hushh design matching Step 1/2/4/5/7/8.
 * Auto-continues after 10 seconds with a visual countdown.
 * Uses HushhTechBackHeader + HushhTechCta reusable components.
 */
import {
  useStep3Logic,
  CURRENT_STEP,
  TOTAL_STEPS,
  PROGRESS_PCT,
  AUTO_SKIP_SECONDS,
} from "./logic";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import HushhTechBackHeader from "../../../components/hushh-tech-back-header/HushhTechBackHeader";
import HushhTechCta, {
  HushhTechCtaVariant,
} from "../../../components/hushh-tech-cta/HushhTechCta";

export default function OnboardingStep3() {
  const { isLoading, countdown, handleContinue, handleBack } = useStep3Logic();

  /** Countdown progress (1 → 0) */
  const progress = countdown / AUTO_SKIP_SECONDS;

  return (
    <div className="bg-white text-gray-900 min-h-screen antialiased flex flex-col selection:bg-black selection:text-white">
      {/* ═══ Header ═══ */}
      <HushhTechBackHeader onBackClick={handleBack} rightLabel="FAQs" />

      <main className="px-6 flex-grow max-w-md mx-auto w-full pb-24">
        {/* ── Progress Bar ── */}
        <div className="py-4">
          <div className="flex justify-between text-[11px] font-semibold tracking-wide text-gray-500 mb-3 lowercase">
            <span>
              step {CURRENT_STEP}/{TOTAL_STEPS}
            </span>
            <span>{PROGRESS_PCT}% complete</span>
          </div>
          <div className="h-0.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-500"
              style={{ width: `${PROGRESS_PCT}%` }}
            />
          </div>
        </div>

        {/* ── Lottie Animation ── */}
        <section className="flex justify-center py-8">
          <div className="w-48 h-48">
            <DotLottieReact
              src="https://lottie.host/58d10cd9-7087-4394-bb55-3ad6f07d3db6/9epWGP0u3F.lottie"
              loop
              autoplay
            />
          </div>
        </section>

        {/* ── Title Section ── */}
        <section className="py-4 text-center">
          <h1
            className="text-[2.25rem] leading-[1.15] font-normal text-black tracking-tight lowercase"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            let&apos;s continue with
            <br />
            <span className="text-gray-400 italic font-normal">
              some info about you
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-6 leading-relaxed lowercase font-medium max-w-xs mx-auto">
            to comply with federal regulations, we are required to collect
            certain personal information about you.
          </p>
        </section>

        {/* ── Countdown Timer ── */}
        <section className="flex flex-col items-center justify-center py-8">
          <div className="relative w-16 h-16">
            {/* Background circle */}
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="3"
              />
              {/* Progress circle */}
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="#000"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress)}`}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            {/* Countdown number */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-semibold text-black tabular-nums">
                {countdown}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-3 lowercase font-medium">
            auto-continuing in {countdown}s
          </p>
        </section>

        {/* ── CTAs — Continue & Back ── */}
        <section className="pb-12 space-y-3">
          <HushhTechCta
            variant={HushhTechCtaVariant.BLACK}
            onClick={handleContinue}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Continue"}
          </HushhTechCta>

          <HushhTechCta
            variant={HushhTechCtaVariant.WHITE}
            onClick={handleBack}
          >
            Back
          </HushhTechCta>
        </section>

        {/* ── Trust Badges ── */}
        <section className="flex flex-col items-center justify-center text-center gap-2 pb-8">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px] text-gray-600">
              lock
            </span>
            <span className="text-[10px] text-gray-600 tracking-wide uppercase font-medium">
              256 bit encryption
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}
