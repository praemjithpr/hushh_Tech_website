/**
 * Community Events Page — Delight-First UX (Responsive)
 * Events showcase + track selector + registration form + success state.
 * Matches Hushh premium UI standard: Playfair headings, onboarding form rows,
 * HushhTechBackHeader, HushhTechCta, trust badges.
 * Responsive: mobile-first, scales beautifully to tablet & desktop.
 */
import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useCommunityEventsLogic,
  EVENTS,
  TRACK_OPTIONS,
  Track,
} from "./logic";
import HushhTechBackHeader from "../../components/hushh-tech-back-header/HushhTechBackHeader";
import HushhTechCta, {
  HushhTechCtaVariant,
} from "../../components/hushh-tech-cta/HushhTechCta";

/* ── Playfair heading style ── */
const playfair = { fontFamily: "'Playfair Display', serif" };

/* ── Stagger animation variants ── */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function CommunityEventsPage() {
  const s = useCommunityEventsLogic();
  const formRef = useRef<HTMLDivElement>(null);

  /** Scroll to form when track is selected */
  const handleTrackSelect = (t: Track) => {
    s.setTrack(t);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  };

  return (
    <div className="bg-fr-cream text-fr-navy min-h-screen antialiased flex flex-col selection:bg-fr-rust selection:text-white font-sans">
      {/* ═══ Header ═══ */}
      <HushhTechBackHeader onBackClick={s.handleBack} rightLabel="FAQs" />

      <main className="px-5 sm:px-8 lg:px-12 flex-grow max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto w-full pb-12">
        {/* ════════════════════════════════════════════════
            ACT 1 — Hero & Events Showcase
            ════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {!s.isSubmitted ? (
            <motion.div
              key="main-content"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
            >
              {/* ── Hero ── */}
              <motion.section
                className="pt-8 pb-10 sm:pt-12 sm:pb-14 lg:pt-16 lg:pb-16"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
              >
                <h3 className="text-[10px] sm:text-xs tracking-[0.2em] text-fr-rust uppercase mb-4 font-medium">
                  Community
                </h3>
                <h1
                  className="text-[2.75rem] sm:text-5xl lg:text-6xl leading-[1.1] font-normal text-fr-navy tracking-tight font-display"
                >
                  Build. Break.
                  <br />
                  <span className="text-gray-400 italic font-light">
                    Ship.
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-gray-500 mt-4 sm:mt-6 leading-relaxed font-light max-w-lg">
                  Join our builder community. Hackathons, bug bashes, demo days
                  — real projects, real impact.
                </p>
              </motion.section>

              {/* ── Events ── */}
              <motion.section
                className="pb-12 sm:pb-16"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={containerVariants}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-6">
                  {EVENTS.map((event) => (
                    <motion.div
                      key={event.id}
                      variants={cardVariants}
                      className="py-5 border-b border-gray-200 md:border md:border-gray-200 md:rounded-xl md:p-5 md:hover:shadow-md md:transition-shadow group cursor-default bg-white shadow-sm hover:border-fr-rust/30"
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon circle with accent dot */}
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-fr-cream flex items-center justify-center group-hover:bg-fr-rust/5 transition-colors">
                            <span
                              className="material-symbols-outlined text-fr-navy text-lg sm:text-xl"
                              style={{ fontVariationSettings: "'wght' 400" }}
                            >
                              {event.icon}
                            </span>
                          </div>
                          {/* Accent dot */}
                          <div
                            className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${event.id === 'hackathon' ? 'bg-fr-rust' : 'bg-fr-navy'}`}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm sm:text-base font-semibold text-fr-navy">
                              {event.title}
                            </p>
                            <span className="material-symbols-outlined text-gray-300 text-base group-hover:text-fr-rust group-hover:translate-x-1 transition-all duration-300">
                              arrow_forward
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-fr-rust font-medium mt-0.5">
                            {event.subtitle}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-400 font-light mt-1 leading-relaxed">
                            {event.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* ════════════════════════════════════════════════
                  ACT 2 — Choose Your Track
                  ════════════════════════════════════════════════ */}
              <motion.section
                className="pb-10 sm:pb-14"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeIn}
              >
                <h3 className="text-[10px] sm:text-xs tracking-[0.2em] text-fr-rust uppercase mb-4 font-medium">
                  Get Started
                </h3>
                <h2
                  className="text-[2rem] sm:text-[2.5rem] lg:text-5xl leading-[1.15] font-normal text-fr-navy tracking-tight font-display mb-2"
                >
                  Ready to
                  <br />
                  <span className="text-gray-400 italic font-light">
                    Participate?
                  </span>
                </h2>
                <p className="text-sm sm:text-base text-gray-500 font-light leading-relaxed mb-8 max-w-lg">
                  Choose your track to get started.
                </p>

                {/* Track cards — side-by-side on md+ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {TRACK_OPTIONS.map((opt) => {
                    const isSelected = s.track === opt.id;
                    const isOther = s.track !== null && !isSelected;

                    return (
                      <motion.button
                        key={opt.id}
                        onClick={() => handleTrackSelect(opt.id)}
                        className={`w-full text-left p-5 sm:p-6 border transition-all duration-300 rounded-none md:rounded-xl shadow-sm ${isSelected
                            ? "bg-fr-navy text-white border-fr-navy shadow-lg"
                            : isOther
                              ? "bg-white text-gray-400 border-gray-200 opacity-50"
                              : "bg-white text-fr-navy border-gray-200 hover:border-fr-rust"
                          }`}
                        whileTap={{ scale: 0.98 }}
                        layout
                        aria-label={`Select ${opt.title} track`}
                        tabIndex={0}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 ${isSelected ? "bg-white/10" : "bg-fr-cream"
                              }`}
                          >
                            <span
                              className={`material-symbols-outlined text-lg sm:text-xl ${isSelected ? "text-white" : "text-fr-navy"
                                }`}
                              style={{
                                fontVariationSettings: "'wght' 400",
                              }}
                            >
                              {opt.icon}
                            </span>
                          </div>
                          <div>
                            <p
                              className={`text-sm sm:text-base font-semibold ${isSelected ? "text-white" : ""
                                }`}
                            >
                              {opt.title}
                            </p>
                            <p
                              className={`text-xs sm:text-sm font-medium mt-0.5 ${isSelected
                                  ? "text-white/70"
                                  : "text-fr-rust"
                                }`}
                            >
                              {opt.subtitle}
                            </p>
                            <p
                              className={`text-xs sm:text-sm font-light mt-1 ${isSelected
                                  ? "text-white/50"
                                  : "text-gray-400"
                                }`}
                            >
                              {opt.description}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.section>

              {/* ════════════════════════════════════════════════
                  ACT 3 — Registration Form
                  ════════════════════════════════════════════════ */}
              <AnimatePresence>
                {s.track && (
                  <motion.div
                    ref={formRef}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="max-w-xl mx-auto"
                  >
                    {/* ── Progress Bar ── */}
                    <div className="py-4">
                      <div className="flex justify-between text-[11px] sm:text-xs font-semibold tracking-wide text-gray-500 mb-3">
                        <span>Registration</span>
                        <span>{s.progress}% Complete</span>
                      </div>
                      <div className="h-0.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-fr-rust transition-all duration-500 ease-out"
                          style={{ width: `${s.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* ── Title ── */}
                    <section className="py-8 sm:py-10">
                      <h3 className="text-[10px] sm:text-xs tracking-[0.2em] text-fr-rust uppercase mb-4 font-medium">
                        Your Details
                      </h3>
                      <h2
                        className="text-[2rem] sm:text-[2.5rem] leading-[1.15] font-normal text-fr-navy tracking-tight font-display"
                      >
                        Register
                        <br />
                        <span className="text-gray-400 italic font-light">
                          for Events.
                        </span>
                      </h2>
                      <p className="text-sm sm:text-base text-gray-500 mt-4 leading-relaxed font-light">
                        Fill in your details and submit your demo to
                        participate.
                      </p>
                    </section>

                    {/* ── Form Fields ── */}
                    <section className="space-y-0">
                      {/* Full Name */}
                      <FormRow
                        icon="person"
                        label="Full Name"
                        error={s.errors.fullName}
                      >
                        <input
                          type="text"
                          value={s.form.fullName}
                          onChange={(e) =>
                            s.updateField("fullName", e.target.value)
                          }
                          placeholder="John Doe"
                          className="w-full text-xs sm:text-sm text-fr-navy font-medium bg-transparent border-none outline-none p-0 placeholder:text-gray-300"
                          aria-label="Full name"
                        />
                      </FormRow>

                      {/* University */}
                      <FormRow
                        icon="school"
                        label="University / College"
                        error={s.errors.university}
                      >
                        <input
                          type="text"
                          value={s.form.university}
                          onChange={(e) =>
                            s.updateField("university", e.target.value)
                          }
                          placeholder="MIT, Stanford, IIT Delhi..."
                          className="w-full text-xs sm:text-sm text-fr-navy font-medium bg-transparent border-none outline-none p-0 placeholder:text-gray-300"
                          aria-label="University or college"
                        />
                      </FormRow>

                      {/* Roll Number */}
                      <FormRow
                        icon="badge"
                        label="University Roll Number"
                        error={s.errors.rollNumber}
                      >
                        <input
                          type="text"
                          value={s.form.rollNumber}
                          onChange={(e) =>
                            s.updateField("rollNumber", e.target.value)
                          }
                          placeholder="2024CS101"
                          className="w-full text-xs sm:text-sm text-fr-navy font-medium bg-transparent border-none outline-none p-0 placeholder:text-gray-300"
                          aria-label="University roll number"
                        />
                      </FormRow>

                      {/* University Email */}
                      <FormRow
                        icon="mail"
                        label="University Email (.edu)"
                        error={s.errors.universityEmail}
                      >
                        <input
                          type="email"
                          value={s.form.universityEmail}
                          onChange={(e) =>
                            s.updateField("universityEmail", e.target.value)
                          }
                          placeholder="john@university.edu"
                          className="w-full text-xs sm:text-sm text-fr-navy font-medium bg-transparent border-none outline-none p-0 placeholder:text-gray-300"
                          aria-label="University email address"
                        />
                      </FormRow>

                      {/* Personal Email */}
                      <FormRow
                        icon="alternate_email"
                        label="Personal Email"
                        error={s.errors.personalEmail}
                      >
                        <input
                          type="email"
                          value={s.form.personalEmail}
                          onChange={(e) =>
                            s.updateField("personalEmail", e.target.value)
                          }
                          placeholder="john@gmail.com"
                          className="w-full text-xs sm:text-sm text-fr-navy font-medium bg-transparent border-none outline-none p-0 placeholder:text-gray-300"
                          aria-label="Personal email address"
                        />
                      </FormRow>

                      {/* Profile Photo */}
                      <FormRow
                        icon="photo_camera"
                        label="Profile Photo"
                        error={s.errors.photoFile}
                      >
                        <div className="flex items-center gap-3">
                          <label
                            className="text-xs sm:text-sm text-fr-rust font-semibold cursor-pointer hover:underline"
                            tabIndex={0}
                            role="button"
                            aria-label="Choose profile photo"
                          >
                            Choose File
                            <input
                              type="file"
                              accept="image/*"
                              onChange={s.handlePhotoChange}
                              className="hidden"
                            />
                          </label>
                          {s.photoPreview && (
                            <div className="flex items-center gap-2">
                              <img
                                src={s.photoPreview}
                                alt="Preview"
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-200"
                              />
                              <span className="material-symbols-outlined text-emerald-500 text-sm">
                                check_circle
                              </span>
                            </div>
                          )}
                        </div>
                      </FormRow>

                      {/* Team Participants */}
                      <FormRow
                        icon="group"
                        label="Team Participants"
                        error={s.errors.teamParticipants}
                      >
                        <textarea
                          value={s.form.teamParticipants}
                          onChange={(e) =>
                            s.updateField("teamParticipants", e.target.value)
                          }
                          placeholder="Jane Smith, Mike Johnson, Sarah Lee"
                          rows={2}
                          className="w-full text-xs sm:text-sm text-fr-navy font-medium bg-transparent border-none outline-none p-0 resize-none placeholder:text-gray-300"
                          aria-label="Team participants"
                        />
                      </FormRow>

                      {/* Events Selection */}
                      <div className="py-5 border-b border-gray-200">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-fr-cream flex items-center justify-center shrink-0">
                            <span
                              className="material-symbols-outlined text-fr-navy text-lg sm:text-xl"
                              style={{
                                fontVariationSettings: "'wght' 400",
                              }}
                            >
                              event
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-semibold text-fr-navy mb-3">
                              Which Events?
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {EVENTS.map((ev) => {
                                const checked = s.form.events.includes(
                                  ev.id
                                );
                                return (
                                  <button
                                    key={ev.id}
                                    onClick={() => s.toggleEvent(ev.id)}
                                    className={`flex items-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-medium transition-all duration-200 rounded-lg ${checked
                                        ? "bg-fr-navy text-white shadow-md"
                                        : "bg-white text-fr-navy border border-gray-100 hover:border-fr-rust hover:bg-fr-cream"
                                      }`}
                                    aria-label={`Toggle ${ev.title}`}
                                    aria-pressed={checked}
                                    tabIndex={0}
                                    type="button"
                                  >
                                    <span
                                      className={`material-symbols-outlined text-sm ${checked
                                          ? "text-white"
                                          : "text-gray-400"
                                        }`}
                                    >
                                      {checked
                                        ? "check_box"
                                        : "check_box_outline_blank"}
                                    </span>
                                    {ev.title}
                                  </button>
                                );
                              })}
                            </div>
                            {s.errors.events && (
                              <p className="text-[11px] sm:text-xs text-red-500 mt-2 font-medium">
                                {s.errors.events}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* ── Track-Specific Fields ── */}

                      {/* Engineering: GitHub PR Link */}
                      {s.track === "engineering" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                        >
                          <FormRow
                            icon="code"
                            label="GitHub PR Link"
                            error={s.errors.prLink}
                          >
                            <input
                              type="url"
                              value={s.form.prLink}
                              onChange={(e) =>
                                s.updateField("prLink", e.target.value)
                              }
                              placeholder="https://github.com/org/repo/pull/123"
                              className="w-full text-xs sm:text-sm text-fr-navy font-medium bg-transparent border-none outline-none p-0 placeholder:text-gray-300"
                              aria-label="GitHub pull request link"
                            />
                          </FormRow>
                        </motion.div>
                      )}

                      {/* MBA: PRD Document Upload */}
                      {s.track === "mba" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                        >
                          <FormRow
                            icon="description"
                            label="PRD Document (PDF)"
                            error={s.errors.prdFile}
                          >
                            <div className="flex items-center gap-3">
                              <label
                                className="text-xs sm:text-sm text-fr-rust font-semibold cursor-pointer hover:underline"
                                tabIndex={0}
                                role="button"
                                aria-label="Upload PRD document"
                              >
                                Upload PDF
                                <input
                                  type="file"
                                  accept=".pdf"
                                  onChange={s.handlePrdChange}
                                  className="hidden"
                                />
                              </label>
                              {s.prdFileName && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs sm:text-sm text-gray-500 font-medium truncate max-w-[120px] sm:max-w-[200px]">
                                    {s.prdFileName}
                                  </span>
                                  <span className="material-symbols-outlined text-emerald-500 text-sm">
                                    check_circle
                                  </span>
                                </div>
                              )}
                            </div>
                          </FormRow>
                        </motion.div>
                      )}

                      {/* ── Demo Requirements Callout ── */}
                      <div className="py-6">
                        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <span
                              className="material-symbols-outlined text-fr-navy text-lg"
                              style={{
                                fontVariationSettings: "'wght' 400",
                              }}
                            >
                              videocam
                            </span>
                            <p className="text-sm sm:text-base font-semibold text-fr-navy">
                              Demo Requirements
                            </p>
                          </div>
                          <ul className="space-y-2 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-2 sm:space-y-0">
                            {[
                              "Your face must be visible in the video",
                              "Explain your project clearly",
                              "Upload to YouTube (unlisted is fine)",
                              "Share the link below",
                            ].map((item, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-xs sm:text-sm text-gray-500 font-light leading-relaxed"
                              >
                                <span className="material-symbols-outlined text-fr-rust text-xs mt-0.5">
                                  check
                                </span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Demo Video Link */}
                      <FormRow
                        icon="play_circle"
                        label="Demo Video (YouTube Link)"
                        error={s.errors.demoLink}
                      >
                        <input
                          type="url"
                          value={s.form.demoLink}
                          onChange={(e) =>
                            s.updateField("demoLink", e.target.value)
                          }
                          placeholder="https://youtube.com/watch?v=..."
                          className="w-full text-xs sm:text-sm text-fr-navy font-medium bg-transparent border-none outline-none p-0 placeholder:text-gray-300"
                          aria-label="Demo video YouTube link"
                        />
                      </FormRow>
                    </section>

                    {/* ── Submit CTA ── */}
                    <section className="pb-8 pt-8 space-y-3 max-w-md mx-auto">
                      <HushhTechCta
                        variant={HushhTechCtaVariant.BLACK}
                        onClick={s.handleSubmit}
                        disabled={s.isSubmitting || s.progress < 10}
                      >
                        {s.isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            Submitting...
                          </div>
                        ) : (
                          "Submit Registration"
                        )}
                      </HushhTechCta>
                    </section>

                    {/* ── Trust Badge ── */}
                    <section className="flex flex-col items-center justify-center text-center gap-2 pb-8">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px] text-fr-rust">
                          lock
                        </span>
                        <span className="text-[10px] sm:text-xs text-gray-500 tracking-wide uppercase font-medium">
                          256 Bit Encryption
                        </span>
                      </div>
                    </section>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* ════════════════════════════════════════════════
               ACT 4 — Success State
               ════════════════════════════════════════════════ */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="py-20 sm:py-28 flex flex-col items-center text-center"
            >
              {/* Animated checkmark circle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2,
                }}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-emerald-500 flex items-center justify-center mb-8 bg-white shadow-sm"
              >
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="material-symbols-outlined text-emerald-500 text-4xl sm:text-5xl"
                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}
                >
                  check
                </motion.span>
              </motion.div>

              <h1
                className="text-[2.5rem] sm:text-5xl lg:text-6xl leading-[1.1] font-normal text-fr-navy tracking-tight font-display mb-3"
              >
                You're{" "}
                <span className="text-gray-400 italic font-light">In.</span>
              </h1>

              <p className="text-sm sm:text-base text-gray-500 font-light leading-relaxed max-w-xs sm:max-w-sm mb-8">
                We'll be in touch at{" "}
                <span className="font-medium text-fr-navy">
                  {s.form.universityEmail}
                </span>
              </p>

              {/* Registered events */}
              <div className="w-full max-w-xs sm:max-w-md space-y-2 mb-10">
                <p className="text-[10px] sm:text-xs tracking-[0.2em] text-fr-rust uppercase font-medium mb-3">
                  Registered For
                </p>
                {s.form.events.map((evId) => {
                  const ev = EVENTS.find((e) => e.id === evId);
                  if (!ev) return null;
                  return (
                    <motion.div
                      key={evId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex items-center gap-3 py-3 px-1 border-b border-gray-100 bg-white/50 rounded-lg px-2 mb-1"
                    >
                      <div className="relative">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-fr-cream flex items-center justify-center">
                          <span className="material-symbols-outlined text-fr-navy text-sm sm:text-base">
                            {ev.icon}
                          </span>
                        </div>
                        <div
                          className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${evId === 'hackathon' ? 'bg-fr-rust' : 'bg-fr-navy'}`}
                        />
                      </div>
                      <p className="text-sm sm:text-base font-medium text-fr-navy">
                        {ev.title}
                      </p>
                      <span className="material-symbols-outlined text-emerald-500 text-sm ml-auto">
                        check_circle
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Track badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-white rounded-full border border-gray-100 shadow-sm">
                <span className="material-symbols-outlined text-fr-rust text-sm sm:text-base">
                  {s.track === "engineering" ? "terminal" : "analytics"}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-fr-navy uppercase tracking-wide">
                  {s.track === "engineering"
                    ? "Engineering Track"
                    : "MBA Track"}
                </span>
              </div>

              {/* Back to home CTA */}
              <section className="w-full max-w-md mx-auto mt-12 space-y-3">
                <HushhTechCta
                  variant={HushhTechCtaVariant.BLACK}
                  onClick={s.handleBack}
                >
                  Back to Home
                </HushhTechCta>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Reusable Form Row — matches onboarding style
   ═══════════════════════════════════════════ */
interface FormRowProps {
  icon: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}

const FormRow = ({ icon, label, error, children }: FormRowProps) => (
  <div
    className={`py-5 border-b ${error ? "border-red-200" : "border-gray-200"
      }`}
  >
    <div className="flex items-start gap-4">
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 ${error ? "bg-red-50" : "bg-gray-100"
          }`}
      >
        <span
          className={`material-symbols-outlined text-lg sm:text-xl ${error ? "text-red-500" : "text-gray-700"
            }`}
          style={{ fontVariationSettings: "'wght' 400" }}
        >
          {icon}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm sm:text-base font-semibold mb-1 ${error ? "text-red-600" : "text-gray-900"
            }`}
        >
          {label}
        </p>
        {children}
        {error && (
          <p className="text-[11px] sm:text-xs text-red-500 mt-1.5 font-medium">
            {error}
          </p>
        )}
      </div>
    </div>
  </div>
);
