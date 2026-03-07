/**
 * OnboardingShell — Fundrise-inspired onboarding layout wrapper.
 *
 * Exact pattern from Fundrise /reits/checkout/* pages:
 *  - Cream (#F7F5F0) full-screen background
 *  - White top bar: Back (left) | Logo (center) | X / Continue (right)
 *  - Optional rust announcement banner (top strip)
 *  - Main content: centered white card, max-w-xl, rounded-md, px-8 py-10
 *  - Thin progress bar under the header
 *
 * Usage:
 *  <OnboardingShell
 *    step={2}
 *    totalSteps={12}
 *    onBack={() => navigate(-1)}
 *    onClose={() => navigate('/dashboard')}
 *    continueLabel="Continue"
 *    onContinue={handleContinue}
 *    continueDisabled={!valid}
 *    continueLoading={isLoading}
 *  >
 *    {children}
 *  </OnboardingShell>
 */
import React from "react";
import { Link } from "react-router-dom";
import hushhLogo from "../components/images/Hushhogo.png";

interface OnboardingShellProps {
    /** Current step number (1-based) */
    step: number;
    /** Total steps */
    totalSteps: number;
    /** Fires when user clicks "← Back" */
    onBack?: () => void;
    /** Fires when user clicks the X (close) */
    onClose?: () => void;
    /** Primary action button label (default: "Continue") */
    continueLabel?: string;
    /** Fires when user clicks the Continue button */
    onContinue?: () => void;
    /** If true, Continue button is greyed out */
    continueDisabled?: boolean;
    /** If true, Continue button shows spinner + "Saving…" */
    continueLoading?: boolean;
    /** If true, hide the Continue button (for steps that handle it differently) */
    hideContinueBtn?: boolean;
    /** Page content */
    children: React.ReactNode;
    /** Optional bottom CTA (overrides built-in Continue btn) */
    footerSlot?: React.ReactNode;
    /** If true, hide the footer slot area */
    hideFooter?: boolean;
}

const OnboardingShell: React.FC<OnboardingShellProps> = ({
    step,
    totalSteps,
    onBack,
    onClose,
    continueLabel = "Continue",
    onContinue,
    continueDisabled = false,
    continueLoading = false,
    hideContinueBtn = false,
    children,
    footerSlot,
    hideFooter = false,
}) => {
    const progressPct = Math.min(100, Math.round((step / totalSteps) * 100));

    return (
        <div
            className="min-h-[100dvh] flex flex-col bg-[#faf9f6]"
            style={{ fontFamily: "var(--font-body)", color: "var(--fr-navy)" }}
        >
            {/* ══════════════════════════════════════
          TOP NAV BAR — Fundrise checkout style
          ══════════════════════════════════════ */}
            <header className="sticky top-0 z-40 bg-white border-b border-[#F2F0EB]">
                <div className="relative flex items-center justify-between px-5 md:px-8 h-[60px] max-w-3xl mx-auto">
                    {/* ← Back */}
                    <div className="w-16">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="flex items-center gap-0.5 text-[14px] font-semibold text-[#4A4540] hover:text-[#151513] transition-colors group"
                                aria-label="Go back"
                            >
                                <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-0.5 transition-transform">
                                    chevron_left
                                </span>
                                Back
                            </button>
                        )}
                    </div>

                    {/* Center — Logo */}
                    <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5" aria-label="Hushh Home">
                        <img src={hushhLogo} alt="Hushh" className="w-7 h-7 object-contain" />
                        <span className="text-[15px] font-bold text-[#151513] tracking-tight hidden sm:block">hushh</span>
                    </Link>

                    {/* Right — Continue or ✕ */}
                    <div className="w-16 flex justify-end">
                        {!hideContinueBtn && onContinue ? (
                            <button
                                onClick={onContinue}
                                disabled={continueDisabled || continueLoading}
                                className={`px-4 py-2 rounded text-[13px] font-semibold transition-all ${continueDisabled || continueLoading
                                    ? "bg-[#EEE9E0] text-[#C4BFB5] cursor-not-allowed"
                                    : "bg-[#AA4528] text-white hover:bg-[#8C3720]"
                                    }`}
                            >
                                {continueLoading ? "Saving…" : continueLabel}
                            </button>
                        ) : onClose ? (
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F2F0EB] transition-colors"
                                aria-label="Close onboarding"
                            >
                                <span className="material-symbols-outlined text-[#4A4540] text-[20px]">close</span>
                            </button>
                        ) : null}
                    </div>
                </div>

                {/* Progress bar */}
                <div className="h-[3px] bg-[#EEE9E0] max-w-3xl mx-auto">
                    <div
                        className="h-full bg-[#AA4528] transition-all duration-500 ease-out"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
            </header>

            {/* ══════════════════════════════════════
          MAIN CONTENT
          ══════════════════════════════════════ */}
            <main className="flex-1 flex flex-col items-center px-4 py-8 md:py-12">
                {/* Step counter */}
                <p
                    className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#8C8479] mb-4"
                    style={{ fontFamily: "var(--font-body)" }}
                >
                    Step {step} of {totalSteps}
                </p>

                {/* White card */}
                <div className="w-full max-w-xl bg-white rounded-md border border-[#EEE9E0] shadow-[0_2px_16px_rgba(21,21,19,0.06)] px-6 sm:px-10 py-8 md:py-10">
                    {children}
                </div>

                {/* Footer slot (e.g. legal disclaimer, secondary actions) */}
                {footerSlot && !hideFooter && (
                    <div className="w-full max-w-xl mt-4">{footerSlot}</div>
                )}
            </main>
        </div>
    );
};

export default OnboardingShell;
