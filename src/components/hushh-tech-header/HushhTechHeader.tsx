/**
 * HushhTechHeader — Fundrise-inspired sticky navigation header
 *
 * Desktop: Logo left | Nav links center | "Log in" + "Get started" right
 * Mobile:  Logo left | Hamburger right
 *
 * All backend logic (auth session, navigation) is preserved.
 */
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import hushhLogo from "../images/Hushhogo.png";
import HushhTechNavDrawer from "../hushh-tech-nav-drawer/HushhTechNavDrawer";
import config from "../../resources/config/config";

interface HushhTechHeaderProps {
  fixed?: boolean;
  className?: string;
}

const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Philosophy", path: "/about/leadership" },
  { label: "Fund A", path: "/discover-fund-a" },
  { label: "Community", path: "/community" },
  { label: "Contact", path: "/contact" },
  { label: "FAQ", path: "/faq" },
];

const HushhTechHeader: React.FC<HushhTechHeaderProps> = ({
  fixed = false,
  className = "",
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  /* Scroll shadow */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Auth session */
  useEffect(() => {
    if (!config.supabaseClient) return;
    config.supabaseClient.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = config.supabaseClient.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription?.unsubscribe();
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const headerBg = isScrolled ? "bg-white shadow-nav" : "bg-[#faf9f6] border-b border-[#F2F0EB]";
  const positionCls = fixed ? "fixed top-0 left-0 right-0 z-50" : "sticky top-0 z-50";

  return (
    <>
      <header
        className={`${positionCls} ${headerBg} transition-shadow duration-300 ${className}`}
        style={{ fontFamily: "var(--font-body)" }}
      >
        <div className="fr-container">
          <div className="flex items-center justify-between h-16 md:h-[72px]">

            {/* ── Logo ── */}
            <Link
              to="/"
              className="flex items-center gap-2.5 shrink-0 group"
              aria-label="Hushh Technologies — Home"
            >
              <div className="w-8 h-8 rounded-md overflow-hidden flex items-center justify-center shrink-0">
                <img src={hushhLogo} alt="Hushh" className="w-8 h-8 object-contain" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[16px] font-bold tracking-tight text-[#151513]">hushh</span>
                <span className="text-[9px] font-semibold tracking-[0.14em] uppercase text-[#8C8479] mt-px">Technologies</span>
              </div>
            </Link>

            {/* ── Desktop Nav Links ── */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Primary navigation">
              {NAV_LINKS.map(({ label, path }) => (
                <Link
                  key={path}
                  to={path}
                  className={`px-3 py-2 text-[14px] font-semibold rounded transition-colors duration-150 ${isActive(path)
                    ? "text-[#AA4528]"
                    : "text-[#4A4540] hover:text-[#151513]"
                    }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* ── Desktop CTAs ── */}
            <div className="hidden lg:flex items-center gap-3">
              {session ? (
                <>
                  <button
                    onClick={() => navigate("/hushh-user-profile")}
                    className="text-[14px] font-semibold text-[#4A4540] hover:text-[#151513] transition-colors px-3 py-2"
                  >
                    Profile
                  </button>
                  <button
                    onClick={async () => {
                      await config.supabaseClient?.auth.signOut();
                      navigate("/");
                    }}
                    className="fr-btn-dark text-[13px] !py-2.5 !px-5"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/Login")}
                    className="text-[14px] font-semibold text-[#4A4540] hover:text-[#151513] transition-colors px-3 py-2"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => navigate("/investor-profile")}
                    className="fr-btn-primary text-[13px] !py-2.5 !px-5"
                  >
                    Get started
                  </button>
                </>
              )}
            </div>

            {/* ── Mobile Hamburger ── */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#F2F0EB] transition-colors"
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined text-[#151513] text-xl">menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Drawer */}
      <HushhTechNavDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
};

export default HushhTechHeader;
