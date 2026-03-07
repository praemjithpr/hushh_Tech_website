/**
 * HushhTechNavDrawer — Fundrise-inspired full-screen mobile nav drawer.
 * Slides in from right. Dark overlay backdrop. Clean serif heading.
 * Auth state determines logged-in vs logged-out footer section.
 */
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import hushhLogo from "../images/Hushhogo.png";
import config from "../../resources/config/config";

interface HushhTechNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Our Philosophy", path: "/about/leadership" },
  { label: "Fund A", path: "/discover-fund-a" },
  { label: "Community", path: "/community" },
  { label: "Contact", path: "/contact" },
  { label: "FAQ", path: "/faq" },
];

const HushhTechNavDrawer: React.FC<HushhTechNavDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  /* Auth check when opened */
  useEffect(() => {
    if (!isOpen || !config.supabaseClient) return;
    config.supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session?.user);
    });
  }, [isOpen]);

  /* Lock body scroll */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleNav = (path: string) => { onClose(); navigate(path); };

  const handleLogout = async () => {
    onClose();
    await config.supabaseClient?.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[98] bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className="fixed top-0 right-0 bottom-0 z-[99] w-full max-w-sm bg-white flex flex-col shadow-2xl animate-slideDown"
        style={{ fontFamily: "var(--font-body)", animationName: "slideInRight", animationDuration: "0.3s", animationFillMode: "both" }}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
        `}</style>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F2F0EB]">
          <Link to="/" onClick={onClose} className="flex items-center gap-2.5">
            <img src={hushhLogo} alt="Hushh" className="w-7 h-7 object-contain" />
            <span className="text-[15px] font-bold text-[#151513] tracking-tight">hushh</span>
          </Link>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F2F0EB] transition-colors"
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined text-[#4A4540] text-xl">close</span>
          </button>
        </div>

        {/* ── Nav Links ── */}
        <nav className="flex-1 overflow-y-auto px-6 py-6" aria-label="Mobile navigation">
          <ul className="space-y-1">
            {NAV_LINKS.map(({ label, path }) => (
              <li key={path}>
                <button
                  onClick={() => handleNav(path)}
                  className={`w-full text-left px-4 py-3.5 rounded-md flex items-center justify-between group transition-colors ${isActive(path)
                      ? "bg-[#F7F5F0] text-[#AA4528] font-semibold"
                      : "text-[#151513] hover:bg-[#F7F5F0] font-medium"
                    }`}
                  style={{ fontSize: "16px" }}
                >
                  <span>{label}</span>
                  <span
                    className={`material-symbols-outlined text-base transition-transform group-hover:translate-x-0.5 ${isActive(path) ? "text-[#AA4528]" : "text-[#C4BFB5]"
                      }`}
                  >
                    chevron_right
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {/* Divider */}
          <div className="my-6 border-t border-[#F2F0EB]" />

          {/* Highlight CTA */}
          <button
            onClick={() => handleNav("/investor-profile")}
            className="w-full fr-btn-primary mb-3"
          >
            Get Started
          </button>
          <button
            onClick={() => handleNav("/discover-fund-a")}
            className="w-full fr-btn-outline"
          >
            Discover Fund A
          </button>
        </nav>

        {/* ── Footer ── */}
        <div className="px-6 py-5 border-t border-[#F2F0EB] bg-[#F7F5F0]">
          {isLoggedIn ? (
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleNav("/hushh-user-profile")}
                className="text-[14px] font-semibold text-[#151513] hover:text-[#AA4528] transition-colors"
              >
                View Profile
              </button>
              <button
                onClick={handleLogout}
                className="text-[13px] font-medium text-[#8C8479] hover:text-[#151513] transition-colors"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleNav("/Login")}
                className="text-[14px] font-semibold text-[#151513] hover:text-[#AA4528] transition-colors"
              >
                Log in
              </button>
              <button
                onClick={() => handleNav("/signup")}
                className="text-[13px] font-medium text-[#8C8479] hover:text-[#151513] transition-colors"
              >
                Create account
              </button>
            </div>
          )}
          <p className="text-[11px] text-[#C4BFB5] mt-3 leading-tight">
            © 2025 Hushh Technologies LLC. SEC Registered.
          </p>
        </div>
      </div>
    </>
  );
};

export default HushhTechNavDrawer;
