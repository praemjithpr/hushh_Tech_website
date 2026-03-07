/**
 * HushhTechFooter — Fundrise-inspired full site footer.
 *
 * Dark navy background (#151513) with 4-column layout:
 *   Brand + description | Quick Links | Legal | Contact
 *
 * Replaces the old bottom tab-bar with a proper Fundrise-style footer.
 * The tab-bar is no longer used on the home page — nav is in the header.
 *
 * NOTE: The old HushhFooterTab enum is preserved for backward compat
 * in case any file still imports it.
 */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import hushhLogo from "../images/Hushhogo.png";
import config from "../../resources/config/config";

/** Kept for backward compatibility */
export enum HushhFooterTab {
  HOME = "home",
  FUND_A = "fund_a",
  COMMUNITY = "community",
  PROFILE = "profile",
}

interface HushhTechFooterProps {
  className?: string;
}

const QUICK_LINKS = [
  { label: "About Us", path: "/about/leadership" },
  { label: "Fund A", path: "/discover-fund-a" },
  { label: "Community", path: "/community" },
  { label: "Careers", path: "/career" },
  { label: "Contact", path: "/contact" },
  { label: "FAQ", path: "/faq" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", path: "/privacy-policy" },
  { label: "California Privacy", path: "/california-privacy-policy" },
  { label: "EU / UK Privacy", path: "/eu-uk-privacy-policy" },
  { label: "Careers Privacy", path: "/career-privacy-policy" },
];

const HushhTechFooter: React.FC<HushhTechFooterProps> = ({ className = "" }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    config.supabaseClient?.auth.getSession().then(({ data: { session } }) =>
      setIsLoggedIn(!!session)
    );
    const { data: { subscription } } =
      config.supabaseClient?.auth.onAuthStateChange((_e, s) => setIsLoggedIn(!!s)) ??
      { data: { subscription: null } };
    return () => subscription?.unsubscribe?.();
  }, []);

  return (
    <footer
      className={`bg-[#151513] text-white ${className}`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* ── Main footer body ── */}
      <div className="fr-container py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* ── Column 1: Brand ── */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-5 group" aria-label="Hushh Home">
              <div className="w-9 h-9 rounded-md overflow-hidden shrink-0">
                <img src={hushhLogo} alt="Hushh" className="w-9 h-9 object-contain" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[16px] font-bold tracking-tight text-white group-hover:text-[#EEE9E0] transition-colors">hushh</span>
                <span className="text-[9px] font-semibold tracking-[0.14em] uppercase text-[#8C8479] mt-px">Technologies</span>
              </div>
            </Link>
            <p className="text-[14px] text-[#8C8479] leading-relaxed mb-5 max-w-[260px]">
              The AI-powered Berkshire Hathaway. Combining rigorous data science with human expertise for long-term value creation.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.hushh.ai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Website"
                className="w-9 h-9 rounded-full border border-[#2a2a26] flex items-center justify-center hover:border-[#AA4528] hover:text-[#AA4528] text-[#8C8479] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">language</span>
              </a>
              <a
                href="mailto:support@hushh.ai"
                aria-label="Email"
                className="w-9 h-9 rounded-full border border-[#2a2a26] flex items-center justify-center hover:border-[#AA4528] hover:text-[#AA4528] text-[#8C8479] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">mail</span>
              </a>
              <a
                href="tel:+18884621726"
                aria-label="Phone"
                className="w-9 h-9 rounded-full border border-[#2a2a26] flex items-center justify-center hover:border-[#AA4528] hover:text-[#AA4528] text-[#8C8479] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">phone</span>
              </a>
            </div>
          </div>

          {/* ── Column 2: Quick Links ── */}
          <div>
            <h3 className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#8C8479] mb-5">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map(({ label, path }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="text-[14px] text-[#C4BFB5] hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 3: Legal ── */}
          <div>
            <h3 className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#8C8479] mb-5">
              Legal
            </h3>
            <ul className="space-y-3">
              {LEGAL_LINKS.map(({ label, path }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="text-[14px] text-[#C4BFB5] hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 4: Contact ── */}
          <div>
            <h3 className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#8C8479] mb-5">
              Contact
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="tel:+18884621726"
                  className="block text-[14px] text-[#C4BFB5] hover:text-white transition-colors font-semibold"
                >
                  (888) 462-1726
                </a>
                <p className="text-[12px] text-[#8C8479] mt-0.5">Mon–Fri: 9AM–6PM PST</p>
              </li>
              <li>
                <a
                  href="mailto:support@hushh.ai"
                  className="text-[14px] text-[#C4BFB5] hover:text-white transition-colors"
                >
                  support@hushh.ai
                </a>
              </li>
              <li>
                <p className="text-[13px] text-[#8C8479] leading-relaxed">
                  1021 5th St W<br />Kirkland, WA 98033
                </p>
              </li>
            </ul>

            {/* CTA */}
            <div className="mt-6">
              <Link
                to="/investor-profile"
                className="fr-btn-primary text-[13px] !py-2.5 !px-5 inline-flex"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-[#2a2a26]">
        <div className="fr-container py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-[12px] text-[#8C8479]">
            © 2025 Hushh Technologies LLC. All rights reserved.
          </p>
          <p className="text-[11px] text-[#4A4540] max-w-xl leading-relaxed">
            <strong className="text-[#8C8479]">Disclaimer:</strong> Investment involves risk, including possible loss of principal.
            Past performance does not guarantee future results. Hushh Technologies is an SEC registered investment advisor.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default HushhTechFooter;
