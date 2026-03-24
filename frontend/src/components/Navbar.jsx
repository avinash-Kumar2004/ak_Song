import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfileDropdown from "./ProfileDropdown";

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const MusicIcon = () => (
  <svg className="w-[18px] h-[18px] fill-white" viewBox="0 0 24 24">
    <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3z" />
  </svg>
);
const HomeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
);
const SearchIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const LibraryIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
  </svg>
);
const SettingsIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

// ─── Route Config ─────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Favorite", href: "/favorite" },
  { label: "Support",  href: "/support"  },
  { label: "Download", href: "/download" },
];

const MOBILE_LINKS = [
  { label: "Home",     href: "/",         Icon: HomeIcon    },
  { label: "Search",   href: "/search",   Icon: SearchIcon  },
  { label: "Library",  href: "/library",  Icon: LibraryIcon },
  { label: "Favorite", href: "/favorite", Icon: null        },
  { label: "Support",  href: "/support",  Icon: null        },
  { label: "Download", href: "/download", Icon: null        },
  { label: "Settings", href: "/settings", Icon: SettingsIcon },
];

// ─── Navbar ───────────────────────────────────────────────────────────────────
export default function Navbar() {
  const location  = useLocation();
  const navigate  = useNavigate();

  // ── Auth state ─────────────────────────────────────────────────────────
  const { user, loading: authLoading } = useAuth();
  const isLoggedIn = !!user;

  const [menuOpen, setMenuOpen] = useState(false);
  const [search,   setSearch]   = useState("");
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const hamRef  = useRef(null);

  const path = location.pathname;

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [path]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        hamRef.current  && !hamRef.current.contains(e.target)
      ) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close menu on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const isActive = (href) =>
    href === "/" ? path === "/" : path.startsWith(href);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    if (path !== "/search") navigate("/search");
  };

  return (
    <>
      {/* ══════════════ NAVBAR ══════════════ */}
      <nav
        className={[
          "fixed top-0 left-0 right-0 z-50",
          "h-16 flex items-center gap-3 px-5",
          "border-b border-white/[0.07]",
          "transition-all duration-300",
          scrolled
            ? "bg-[#0a0c12]/95 backdrop-blur-2xl shadow-[0_4px_40px_rgba(0,0,0,0.4)]"
            : "bg-[#0a0c12]/80 backdrop-blur-xl",
        ].join(" ")}
      >
        {/* ── Logo ── */}
        <Link
          to="/"
          className="flex items-center gap-2.5 shrink-0 group select-none"
          aria-label="SoundWave Home"
        >
          <div className="w-[34px] h-[34px] rounded-[9px] bg-gradient-to-br from-[#6c63ff] to-[#ff4d6d] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
            <MusicIcon />
          </div>
          <span className="font-extrabold text-[18px] tracking-tight text-white/90 hidden sm:block">
            Sound<span className="text-[#6c63ff]">Wave</span>
          </span>
        </Link>

        {/* ── Center: Home + Search ── */}
        <div className="flex-1 flex items-center justify-center gap-2 max-w-[520px] mx-auto">
          <Link
            to="/"
            aria-label="Home"
            className={[
              "w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0 border transition-all duration-200",
              isActive("/") && path === "/"
                ? "text-[#6c63ff] bg-[#6c63ff]/10 border-[#6c63ff]/40"
                : "text-gray-500 bg-transparent border-white/10 hover:text-white hover:bg-white/[0.07] hover:border-white/20",
            ].join(" ")}
          >
            <HomeIcon className="w-[18px] h-[18px]" />
          </Link>

          <div
            className={[
              "flex-1 h-[38px] flex items-center gap-2 px-3.5 rounded-full border transition-all duration-200",
              path === "/search"
                ? "bg-[#6c63ff]/[0.07] border-[#6c63ff]/50"
                : "bg-white/[0.05] border-white/10 hover:border-white/20 hover:bg-white/[0.07]",
            ].join(" ")}
          >
            <SearchIcon className="w-[15px] h-[15px] text-gray-500 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              onFocus={() => { if (path !== "/search") navigate("/search"); }}
              placeholder="What do you want to play?"
              className="bg-transparent border-none outline-none text-white text-[13.5px] w-full placeholder:text-gray-600 font-[inherit]"
              aria-label="Search songs"
            />
          </div>
        </div>

        {/* ── Right: Links + Settings + Auth / Profile ── */}
        <div className="hidden md:flex items-center gap-1 shrink-0">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              to={href}
              className={[
                "text-[13px] font-medium px-2.5 py-1.5 rounded-lg transition-all duration-150",
                isActive(href)
                  ? "text-[#6c63ff] bg-[#6c63ff]/10"
                  : "text-gray-500 hover:text-white hover:bg-white/[0.06]",
              ].join(" ")}
            >
              {label}
            </Link>
          ))}

          <div className="w-px h-[22px] bg-white/[0.08] mx-1" />

          <Link
            to="/settings"
            aria-label="Settings"
            className={[
              "w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200",
              isActive("/settings")
                ? "text-[#6c63ff] bg-[#6c63ff]/10 border-[#6c63ff]/40"
                : "text-gray-500 border-white/10 hover:text-white hover:bg-white/[0.07]",
            ].join(" ")}
          >
            <SettingsIcon className="w-4 h-4" />
          </Link>

          {/* ── Auth: show profile dropdown if logged in, else Sign up/Log in ── */}
          {!authLoading && (
            isLoggedIn ? (
              // ✅ Logged-in state
              <div className="ml-1">
                <ProfileDropdown />
              </div>
            ) : (
              // 🔓 Guest state
              <>
                <Link
                  to="/signup"
                  className="ml-1 text-[13px] font-semibold px-4 py-[7px] rounded-full border border-white/[0.15] text-white hover:border-[#6c63ff] hover:text-[#6c63ff] transition-all duration-200 whitespace-nowrap"
                >
                  Sign up
                </Link>
                <Link
                  to="/login"
                  className="text-[13px] font-bold px-[18px] py-[7px] rounded-full bg-[#6c63ff] text-white hover:bg-[#7c74ff] hover:-translate-y-px active:translate-y-0 transition-all duration-200 whitespace-nowrap"
                >
                  Log in
                </Link>
              </>
            )
          )}
        </div>

        {/* ── Hamburger (mobile) ── */}
        <button
          ref={hamRef}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className={[
            "md:hidden ml-auto w-[38px] h-[38px] rounded-full flex flex-col items-center justify-center gap-[4px]",
            "border transition-all duration-200 shrink-0",
            menuOpen
              ? "bg-white/[0.08] border-white/20 text-white"
              : "bg-white/[0.04] border-white/10 text-gray-500 hover:text-white hover:bg-white/[0.07]",
          ].join(" ")}
        >
          <span className={["block w-4 h-[1.5px] bg-current rounded-full origin-center transition-all duration-300", menuOpen ? "translate-y-[5.5px] rotate-45" : ""].join(" ")} />
          <span className={["block w-4 h-[1.5px] bg-current rounded-full transition-all duration-300", menuOpen ? "opacity-0 scale-x-0" : ""].join(" ")} />
          <span className={["block w-4 h-[1.5px] bg-current rounded-full origin-center transition-all duration-300", menuOpen ? "-translate-y-[5.5px] -rotate-45" : ""].join(" ")} />
        </button>
      </nav>

      {/* ══════════════ MOBILE MENU ══════════════ */}
      <div
        onClick={() => setMenuOpen(false)}
        className={[
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300",
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        aria-hidden="true"
      />

      <div
        ref={menuRef}
        className={[
          "fixed top-16 left-0 right-0 z-40 md:hidden",
          "bg-[#0e1017] border-b border-white/[0.07]",
          "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          menuOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-3 pointer-events-none",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="px-4 py-3 flex flex-col gap-0.5">
          {MOBILE_LINKS.map(({ label, href, Icon: IconComp }) => (
            <Link
              key={href}
              to={href}
              className={[
                "flex items-center gap-3 px-3.5 py-[11px] rounded-xl text-[14px] font-medium transition-all duration-150",
                isActive(href)
                  ? "text-[#6c63ff] bg-[#6c63ff]/10"
                  : "text-gray-500 hover:text-white hover:bg-white/[0.06]",
              ].join(" ")}
            >
              {IconComp && (
                <IconComp className={["w-[17px] h-[17px] shrink-0", isActive(href) ? "text-[#6c63ff]" : "text-current"].join(" ")} />
              )}
              {label}
            </Link>
          ))}

          <div className="h-px bg-white/[0.07] my-2" />

          {/* Mobile auth section */}
          {isLoggedIn ? (
            <Link
              to="/profile"
              className="flex items-center gap-3 px-3.5 py-[11px] rounded-xl text-[14px] font-medium text-gray-500 hover:text-white hover:bg-white/[0.06] transition-all duration-150"
            >
              My Profile
            </Link>
          ) : (
            <div className="flex gap-2 pt-1 pb-2">
              <Link
                to="/signup"
                className="flex-1 text-center text-[13px] font-semibold py-2.5 rounded-full border border-white/[0.15] text-white hover:border-[#6c63ff] hover:text-[#6c63ff] transition-all duration-200"
              >
                Sign up
              </Link>
              <Link
                to="/login"
                className="flex-1 text-center text-[13px] font-bold py-2.5 rounded-full bg-[#6c63ff] text-white hover:bg-[#7c74ff] transition-all duration-200"
              >
                Log in
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}