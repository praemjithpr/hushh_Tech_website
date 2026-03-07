/**
 * HushhTechCta — Fundrise-inspired CTA button
 *
 * Variants:
 *   RUST    (primary) — #AA4528 fill + white text
 *   BLACK   (dark)    — #151513 fill + white text
 *   WHITE   (outline) — transparent + dark border
 *
 * Usage:
 *   <HushhTechCta variant={HushhTechCtaVariant.RUST} onClick={fn}>
 *     Get started
 *   </HushhTechCta>
 */
import React from "react";

export enum HushhTechCtaVariant {
  RUST = "rust",
  BLACK = "black",
  WHITE = "white",
}

interface HushhTechCtaProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: HushhTechCtaVariant;
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<HushhTechCtaVariant, string> = {
  [HushhTechCtaVariant.RUST]: [
    "bg-[#AA4528] text-white border border-[#AA4528]",
    "hover:bg-[#8C3720] hover:border-[#8C3720]",
    "shadow-sm hover:shadow-md hover:-translate-y-px",
    "active:translate-y-0 transition-all duration-200",
  ].join(" "),

  [HushhTechCtaVariant.BLACK]: [
    "bg-[#151513] text-white border border-[#151513]",
    "hover:bg-[#2a2a26] hover:border-[#2a2a26]",
    "shadow-sm hover:shadow-md hover:-translate-y-px",
    "active:translate-y-0 transition-all duration-200",
  ].join(" "),

  [HushhTechCtaVariant.WHITE]: [
    "bg-white text-[#151513] border border-[#151513]",
    "hover:bg-[#F7F5F0]",
    "transition-colors duration-200",
  ].join(" "),
};

const BASE_CLASSES = [
  "inline-flex items-center justify-center gap-2 flex-nowrap",
  "w-full min-h-[52px] px-6 sm:px-8 rounded",
  "font-semibold text-[14px] tracking-wide",
  "disabled:opacity-50 disabled:cursor-not-allowed",
].join(" ");

const HushhTechCta: React.FC<HushhTechCtaProps> = ({
  variant,
  children,
  className = "",
  ...rest
}) => {
  // Support legacy BLACK variant usage as primary rust (opt-in override only)
  const resolvedVariant = variant === HushhTechCtaVariant.BLACK
    ? HushhTechCtaVariant.BLACK        // keep BLACK as dark navy (Fundrise secondary)
    : variant;

  return (
    <button
      className={`${BASE_CLASSES} ${VARIANT_CLASSES[resolvedVariant]} ${className}`}
      style={{ fontFamily: "var(--font-body)" }}
      {...rest}
    >
      {children}
    </button>
  );
};

export default HushhTechCta;
