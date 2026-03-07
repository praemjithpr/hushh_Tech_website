import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import config from "../resources/config/config";
import { FaGlobe, FaAt, FaRss, FaPhone } from "react-icons/fa";
import HushhLogo from "./images/Hushhogo.png";

export default function Footer() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Fetch the current session
    config.supabaseClient?.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = config.supabaseClient?.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    }) ?? { data: { subscription: null } };

    return () => {
      if (subscription && typeof subscription.unsubscribe === "function") {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Function to handle PDF download
  const handleDownload = (pdfPath: string) => {
    if (isLoggedIn) {
      const link = document.createElement("a");
      link.href = pdfPath;
      link.download = pdfPath.split("/").pop() || "download";
      link.click();
    } else {
      toast.error("Please log in first to access this content.");
    }
  };

  return (
    <footer className="relative z-10 bg-[#151513]" style={{ fontFamily: 'var(--font-body)' }}>
      {/* ── Main Footer Grid ── */}
      <div className="fr-container py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <img src={HushhLogo} alt="Hushh" className="w-8 h-8 object-contain" />
              <div className="flex flex-col leading-none">
                <span className="text-[16px] font-bold tracking-tight text-white">hushh</span>
                <span className="text-[9px] font-semibold tracking-[0.14em] uppercase text-[#8C8479] mt-px">Technologies</span>
              </div>
            </div>
            <p className="text-[14px] text-[#8C8479] leading-relaxed mb-5 max-w-[260px]">
              The AI-powered Berkshire Hathaway. Combining data science with human expertise for generational wealth.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://www.hushh.ai" target="_blank" rel="noopener noreferrer" aria-label="Website"
                className="w-9 h-9 rounded-full border border-[#2a2a26] flex items-center justify-center hover:border-[#AA4528] text-[#8C8479] hover:text-[#AA4528] transition-colors">
                <FaGlobe className="text-[14px]" />
              </a>
              <a href="mailto:support@hushh.ai" aria-label="Email"
                className="w-9 h-9 rounded-full border border-[#2a2a26] flex items-center justify-center hover:border-[#AA4528] text-[#8C8479] hover:text-[#AA4528] transition-colors">
                <FaAt className="text-[14px]" />
              </a>
              <a href="tel:+18884621726" aria-label="Phone"
                className="w-9 h-9 rounded-full border border-[#2a2a26] flex items-center justify-center hover:border-[#AA4528] text-[#8C8479] hover:text-[#AA4528] transition-colors">
                <FaPhone className="text-[14px]" />
              </a>
            </div>
          </div>



          {/* Quick Links */}
          <div>
            <h3 className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#8C8479] mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: 'About Us', href: '/about/leadership' },
                { label: 'Fund A', href: '/discover-fund-a' },
                { label: 'Community', href: '/community' },
                { label: 'Careers', href: '/career' },
                { label: 'Contact', href: '/contact' },
                { label: 'FAQ', href: '/faq' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <a href={href} className="text-[14px] text-[#C4BFB5] hover:text-white transition-colors">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#8C8479] mb-5">Legal</h3>
            <ul className="space-y-3">
              {[
                { label: 'Privacy Policy', href: '/privacy-policy' },
                { label: 'California Privacy', href: '/california-privacy-policy' },
                { label: 'EU / UK Privacy', href: '/eu-uk-privacy-policy' },
                { label: 'Careers Privacy', href: '/career-privacy-policy' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <a href={href} className="text-[14px] text-[#C4BFB5] hover:text-white transition-colors">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#8C8479] mb-5">Contact</h3>
            <ul className="space-y-4">
              <li>
                <a href="tel:+18884621726" className="block text-[14px] font-semibold text-[#C4BFB5] hover:text-white transition-colors">(888) 462-1726</a>
                <p className="text-[12px] text-[#8C8479] mt-0.5">Mon–Fri: 9AM–6PM PST</p>
              </li>
              <li><a href="mailto:support@hushh.ai" className="text-[14px] text-[#C4BFB5] hover:text-white transition-colors">support@hushh.ai</a></li>
              <li><p className="text-[13px] text-[#8C8479] leading-relaxed">1021 5th St W<br />Kirkland, WA 98033</p></li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-[#2a2a26]">
        <div className="fr-container py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

          <p className="text-[12px] text-[#8C8479]">© 2025 Hushh Technologies LLC. All rights reserved.</p>
          <p className="text-[11px] text-[#4A4540] max-w-xl leading-relaxed">
            <strong className="text-[#8C8479]">Disclaimer:</strong> Investment involves risk, including possible loss of principal. Past performance does not guarantee future results. Hushh Technologies LLC is an SEC registered investment advisor.
          </p>
        </div>
      </div>

      {/* Toast Notification Container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </footer>
  );
}
