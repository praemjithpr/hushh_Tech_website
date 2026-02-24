/**
 * Step 5 — A Few More Details (Account Type + Phone)
 * Premium Hushh design matching Step 1/2/4.
 * Logic stays in logic.ts — zero logic changes.
 * Uses HushhTechBackHeader + HushhTechCta reusable components.
 */
import ReactCountryFlag from "react-country-flag";
import {
  useStep5Logic,
  CURRENT_STEP,
  TOTAL_STEPS,
  PROGRESS_PCT,
  PHONE_DIAL_CODES,
  ACCOUNT_TYPE_OPTIONS,
} from "./logic";
import HushhTechBackHeader from "../../../components/hushh-tech-back-header/HushhTechBackHeader";
import HushhTechCta, {
  HushhTechCtaVariant,
} from "../../../components/hushh-tech-cta/HushhTechCta";

/** Material icon for each account type */
const ACCOUNT_ICONS: Record<string, string> = {
  individual: "person",
  joint: "group",
  trust: "verified_user",
  entity: "domain",
  ira: "savings",
  sdira: "account_balance",
};

export default function OnboardingStep5() {
  const {
    selectedAccountType,
    setSelectedAccountType,
    phoneNumber,
    countryCode,
    selectedDialCountryIso,
    isAutoDetectingDialCode,
    isLoading,
    showDialPicker,
    setShowDialPicker,
    canContinue,
    selectedDialOption,
    formatPhoneNumber,
    handlePhoneChange,
    handleContinue,
    handleBack,
    handleSkip,
    handleSelectDialCode,
  } = useStep5Logic();

  return (
    <div className="bg-white text-gray-900 min-h-screen antialiased flex flex-col selection:bg-black selection:text-white relative overflow-hidden">
      {/* ═══ Background layer (blurs when dial picker is open) ═══ */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          showDialPicker
            ? "scale-[0.98] blur-[2px] opacity-40 pointer-events-none select-none"
            : ""
        }`}
      >
        {/* ═══ Header ═══ */}
        <HushhTechBackHeader onBackClick={handleBack} rightLabel="FAQs" />

        <main className="px-6 flex-grow max-w-md mx-auto w-full pb-48">
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

          {/* ── Title Section ── */}
          <section className="py-8">
            <h3 className="text-[11px] tracking-wide text-gray-500 lowercase mb-4 font-semibold">
              account setup
            </h3>
            <h1
              className="text-[2.75rem] leading-[1.1] font-normal text-black tracking-tight lowercase"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              a few more
              <br />
              <span className="text-gray-400 italic font-normal">details</span>
            </h1>
            <p className="text-sm text-gray-500 mt-4 leading-relaxed lowercase font-medium">
              this helps us personalize your account and keep your profile
              secure.
            </p>
          </section>

          {/* ── Account Type Selection ── */}
          <section className="mb-10">
            <h3 className="text-[11px] tracking-wide text-gray-500 lowercase mb-4 font-semibold">
              account type
            </h3>
            <div className="space-y-0">
              {ACCOUNT_TYPE_OPTIONS.map((option, index) => {
                const isSelected = selectedAccountType === option.value;
                const isLast = index === ACCOUNT_TYPE_OPTIONS.length - 1;
                const icon =
                  ACCOUNT_ICONS[option.value] || "account_circle";
                return (
                  <button
                    key={option.value}
                    onClick={() => setSelectedAccountType(option.value)}
                    className={`w-full flex items-center gap-4 py-5 text-left transition-colors group ${
                      !isLast ? "border-b border-gray-200" : ""
                    }`}
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`Select ${option.label} account`}
                  >
                    {/* Icon circle */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-black"
                          : "bg-gray-100 group-hover:bg-gray-200"
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-lg ${
                          isSelected ? "text-white" : "text-gray-700"
                        }`}
                        style={{ fontVariationSettings: "'wght' 400" }}
                      >
                        {icon}
                      </span>
                    </div>

                    {/* Label */}
                    <span
                      className={`text-sm lowercase font-semibold flex-1 ${
                        isSelected ? "text-black" : "text-gray-700"
                      }`}
                    >
                      {option.label.toLowerCase()}
                    </span>

                    {/* Checkmark */}
                    {isSelected && (
                      <span
                        className="material-symbols-outlined text-black text-lg shrink-0"
                        style={{
                          fontVariationSettings: "'FILL' 1, 'wght' 600",
                        }}
                      >
                        check_circle
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Phone Number ── */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[11px] tracking-wide text-gray-500 lowercase font-semibold">
                phone number
              </h3>
              {isAutoDetectingDialCode && (
                <span className="text-[10px] font-medium text-gray-400 lowercase">
                  detecting...
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 lowercase font-medium mb-5">
              we&apos;ll use this to verify your identity when needed.
            </p>

            {/* Phone input row */}
            <div className="py-5 border-b border-gray-200">
              <div className="flex items-center gap-4">
                {/* Dial code selector */}
                <button
                  onClick={() => setShowDialPicker(true)}
                  className="flex items-center gap-2 shrink-0 group"
                  aria-label="Select country code"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-gray-200 transition-colors overflow-hidden">
                    <ReactCountryFlag
                      countryCode={selectedDialOption.iso}
                      svg
                      style={{
                        width: "1.5em",
                        height: "1.5em",
                        borderRadius: 2,
                      }}
                      aria-label={selectedDialOption.country}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {selectedDialOption.code}
                  </span>
                  <span
                    className="material-symbols-outlined text-gray-400 text-base"
                    style={{ fontVariationSettings: "'wght' 400" }}
                  >
                    expand_more
                  </span>
                </button>

                {/* Phone input */}
                <input
                  type="tel"
                  value={formatPhoneNumber(phoneNumber)}
                  onChange={handlePhoneChange}
                  placeholder="(000) 000-0000"
                  className="flex-1 text-sm font-medium text-gray-900 placeholder-gray-400 bg-transparent border-none outline-none p-0"
                  aria-label="Phone number"
                />
              </div>
            </div>

            <p className="text-[10px] text-gray-400 mt-2 lowercase font-medium">
              standard message and data rates may apply.
            </p>
          </section>

          {/* ── CTAs — Continue & Skip ── */}
          <section className="pb-12 space-y-3">
            <HushhTechCta
              variant={HushhTechCtaVariant.BLACK}
              onClick={handleContinue}
              disabled={!canContinue || isLoading}
            >
              {isLoading ? "Saving..." : "Continue"}
            </HushhTechCta>

            <HushhTechCta
              variant={HushhTechCtaVariant.WHITE}
              onClick={handleSkip}
            >
              Skip
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

      {/* ═══ Dial Code Picker Modal — Premium Design ═══ */}
      {showDialPicker && (
        <>
          {/* Glass overlay */}
          <div
            className="fixed inset-0 z-40 bg-white/60 backdrop-blur-sm"
            onClick={() => setShowDialPicker(false)}
          />

          {/* Modal card */}
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-0 sm:pb-0">
            <div className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08),0_0_1px_rgba(0,0,0,0.04)] border border-gray-100/50 flex flex-col max-h-[70vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
                <h2
                  className="text-xl text-black lowercase tracking-tight"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  select country code
                </h2>
                <button
                  onClick={() => setShowDialPicker(false)}
                  className="text-xs font-bold uppercase tracking-widest text-black hover:underline"
                >
                  Done
                </button>
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto">
                {PHONE_DIAL_CODES.map((option) => {
                  const isActive =
                    option.code === countryCode &&
                    option.iso === selectedDialCountryIso;
                  return (
                    <button
                      key={option.iso}
                      onClick={() => handleSelectDialCode(option)}
                      className={`w-full flex items-center justify-between px-6 py-4 border-b border-gray-100 transition-colors ${
                        isActive
                          ? "bg-gray-50"
                          : "hover:bg-gray-50 active:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <ReactCountryFlag
                          countryCode={option.iso}
                          svg
                          style={{
                            width: "1.25em",
                            height: "1.25em",
                            borderRadius: 2,
                          }}
                          aria-label={option.country}
                        />
                        <span className="text-sm font-medium text-gray-900 lowercase">
                          {option.country.toLowerCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-medium text-gray-500">
                          {option.code}
                        </span>
                        {isActive && (
                          <span
                            className="material-symbols-outlined text-black text-lg"
                            style={{
                              fontVariationSettings:
                                "'FILL' 1, 'wght' 600",
                            }}
                          >
                            check
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
