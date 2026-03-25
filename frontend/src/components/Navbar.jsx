import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfileDropdown from "./ProfileDropdown";

const ACCENT = "#6c63ff";
const NAVBAR_H = 64;

// ─── Icons ────────────────────────────────────────────────────────────────────
const IcoMusic = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
    <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3z" />
  </svg>
);
const IcoHome = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
);
const IcoSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IcoHeart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);
const IcoLibrary = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
  </svg>
);
const IcoDownload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 20h14v-2H5v2zm7-18v10.17l-3.59-3.58L7 10l5 5 5-5-1.41-1.41L13 12.17V2h-1z" />
  </svg>
);
const IcoSettings = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const IcoSupport = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
  </svg>
);

// ─── Link configs ─────────────────────────────────────────────────────────────
const DESKTOP_LINKS = [
  { label: "Favorite", href: "/favorite", Ico: IcoHeart },
  { label: "Support",  href: "/support",  Ico: IcoSupport },
  { label: "Download", href: "/download", Ico: IcoDownload },
];

const MOBILE_LINKS = [
  { label: "Home",     href: "/",         Ico: IcoHome },
  { label: "Search",   href: "/search",   Ico: IcoSearch },
  { label: "Library",  href: "/library",  Ico: IcoLibrary },
  { label: "Favorite", href: "/favorite", Ico: IcoHeart },
  { label: "Download", href: "/download", Ico: IcoDownload },
  { label: "Support",  href: "/support",  Ico: IcoSupport },
  { label: "Settings", href: "/settings", Ico: IcoSettings },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Navbar({
  onMobileLibraryOpen,
  playlists = [],
  favorites = [],
  uploadCount = 0,
  onUpload,
  fileRef,
  onNewPlaylist,
}) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const isLoggedIn = !!user;

  const [menuOpen, setMenuOpen] = useState(false);
  const [search,   setSearch]   = useState("");
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const hamRef  = useRef(null);
  const path = location.pathname;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 6);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [path]);

  useEffect(() => {
    const fn = (e) => {
      if (
        menuOpen &&
        menuRef.current && !menuRef.current.contains(e.target) &&
        hamRef.current  && !hamRef.current.contains(e.target)
      ) setMenuOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [menuOpen]);

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const active = (href) => (href === "/" ? path === "/" : path.startsWith(href));

  const handleSearch = (e) => {
    setSearch(e.target.value);
    if (path !== "/search") navigate("/search");
  };

  return (
    <>
      <NavCSS />

      {/* ══ NAVBAR BAR ══ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        height: NAVBAR_H,
        display: "flex", alignItems: "center",
        padding: "0 20px", gap: 0,
        background: scrolled ? "rgba(7,8,14,0.97)" : "rgba(7,8,14,0.88)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        boxShadow: scrolled ? "0 2px 30px rgba(0,0,0,0.6)" : "none",
        transition: "background 0.3s, box-shadow 0.3s",
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      }}>

        {/* Logo */}
        <Link to="/" className="nb-logo" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", flexShrink: 0, marginRight: 16 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, flexShrink: 0,
            background: "linear-gradient(135deg,#6c63ff,#ff4d6d)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 3px 14px rgba(108,99,255,0.45)",
          }}>
            <IcoMusic />
          </div>
          <span className="nb-logo-text" style={{
            fontWeight: 800, fontSize: 18, color: "rgba(255,255,255,0.93)",
            letterSpacing: "-0.3px",
          }}>
            Sound<span style={{ color: ACCENT }}>Wave</span>
          </span>
        </Link>

        {/* Search bar — desktop only */}
        <div className="nb-search" style={{
          display: "flex", alignItems: "center", gap: 8,
          width: 390, flexShrink: 0, marginRight: 12,
        }}>
          <Link to="/" title="Home" className="nb-icon-btn" style={{
            width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `1px solid ${active("/") ? ACCENT + "55" : "rgba(255,255,255,0.1)"}`,
            background: active("/") ? ACCENT + "18" : "rgba(255,255,255,0.03)",
            color: active("/") ? ACCENT : "rgba(255,255,255,0.4)",
            textDecoration: "none",
          }}>
            <IcoHome />
          </Link>
          <div style={{
            flex: 1, height: 36, display: "flex", alignItems: "center", gap: 8,
            padding: "0 14px", borderRadius: 100,
            border: `1px solid ${path === "/search" ? ACCENT + "60" : "rgba(255,255,255,0.1)"}`,
            background: path === "/search" ? ACCENT + "0d" : "rgba(255,255,255,0.04)",
            cursor: "text",
          }} onClick={() => { if (path !== "/search") navigate("/search"); }}>
            <span style={{ color: "rgba(255,255,255,0.3)", display: "flex" }}><IcoSearch /></span>
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              onFocus={() => { if (path !== "/search") navigate("/search"); }}
              placeholder="Search songs, artists..."
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: "#fff", fontSize: 13,
                fontFamily: "inherit",
              }}
            />
          </div>
        </div>

        {/* Spacer */}
        <div className="nb-spacer" style={{ flex: 1 }} />

        {/* Desktop right section */}
        <div className="nb-desktop" style={{
          display: "flex", alignItems: "center", gap: 2, flexShrink: 0,
        }}>
          {DESKTOP_LINKS.map(({ label, href, Ico }) => (
            <Link key={href} to={href} className="nb-link" style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 11px", borderRadius: 8,
              fontSize: 13, fontWeight: 500, textDecoration: "none",
              color: active(href) ? ACCENT : "rgba(255,255,255,0.5)",
              background: active(href) ? ACCENT + "14" : "transparent",
              whiteSpace: "nowrap",
            }}>
              <span style={{ display: "flex", opacity: 0.75 }}><Ico /></span>
              {label}
            </Link>
          ))}

          <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.08)", margin: "0 8px" }} />

          <Link to="/settings" className="nb-icon-btn" title="Settings" style={{
            width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `1px solid ${active("/settings") ? ACCENT + "55" : "rgba(255,255,255,0.1)"}`,
            background: active("/settings") ? ACCENT + "18" : "rgba(255,255,255,0.03)",
            color: active("/settings") ? ACCENT : "rgba(255,255,255,0.4)",
            textDecoration: "none",
          }}>
            <IcoSettings />
          </Link>

          {!authLoading && (
            isLoggedIn
              ? <div style={{ marginLeft: 8 }}><ProfileDropdown /></div>
              : <div style={{ display: "flex", gap: 8, marginLeft: 8 }}>
                  <Link to="/signup" className="nb-signup" style={{
                    padding: "7px 16px", borderRadius: 100,
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 600,
                    textDecoration: "none", whiteSpace: "nowrap",
                  }}>Sign up</Link>
                  <Link to="/login" className="nb-login" style={{
                    padding: "7px 18px", borderRadius: 100,
                    background: ACCENT, color: "#fff",
                    fontSize: 13, fontWeight: 700,
                    textDecoration: "none", whiteSpace: "nowrap",
                    boxShadow: `0 4px 16px ${ACCENT}50`,
                  }}>Log in</Link>
                </div>
          )}
        </div>

        {/* ── Hamburger — mobile only ── */}
        <button
          ref={hamRef}
          onClick={() => setMenuOpen(o => !o)}
          className="nb-ham"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          style={{
            flexShrink: 0, marginLeft: "auto",
            width: 40, height: 40, borderRadius: 10, padding: 0,
            display: "none", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 5,
            background: menuOpen ? `${ACCENT}18` : "rgba(255,255,255,0.05)",
            border: `1px solid ${menuOpen ? ACCENT + "50" : "rgba(255,255,255,0.1)"}`,
            cursor: "pointer",
          }}
        >
          <span style={{
            display: "block", width: 18, height: 1.5,
            background: menuOpen ? ACCENT : "rgba(255,255,255,0.75)",
            borderRadius: 2,
            transform: menuOpen ? "translateY(6.5px) rotate(45deg)" : "none",
            transition: "transform 0.27s ease, background 0.2s",
          }} />
          <span style={{
            display: "block", width: 18, height: 1.5,
            background: menuOpen ? ACCENT : "rgba(255,255,255,0.75)",
            borderRadius: 2,
            opacity: menuOpen ? 0 : 1,
            transform: menuOpen ? "scaleX(0)" : "scaleX(1)",
            transition: "opacity 0.2s, transform 0.2s",
          }} />
          <span style={{
            display: "block", width: 18, height: 1.5,
            background: menuOpen ? ACCENT : "rgba(255,255,255,0.75)",
            borderRadius: 2,
            transform: menuOpen ? "translateY(-6.5px) rotate(-45deg)" : "none",
            transition: "transform 0.27s ease, background 0.2s",
          }} />
        </button>
      </nav>

      {/* ══ BACKDROP ══ */}
      <div
        onClick={() => setMenuOpen(false)}
        className="nb-backdrop"
        style={{
          position: "fixed", inset: 0, zIndex: 998,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transition: "opacity 0.25s",
          display: "none",
        }}
      />

      {/* ══ MOBILE MENU ══ */}
      <div
        ref={menuRef}
        className="nb-menu"
        style={{
          position: "fixed",
          top: NAVBAR_H, left: 0, right: 0,
          zIndex: 999,
          background: "#0b0d16",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          maxHeight: `calc(100dvh - ${NAVBAR_H}px)`,
          overflowY: "auto",
          transform: menuOpen ? "translateY(0)" : "translateY(-10px)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.22s",
          display: "none",
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}
      >
        {/* Mobile search */}
        <div style={{ padding: "14px 14px 8px" }}>
          <div style={{
            height: 42, display: "flex", alignItems: "center", gap: 10,
            padding: "0 14px", borderRadius: 100,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)",
          }}>
            <span style={{ color: "rgba(255,255,255,0.3)", display: "flex" }}><IcoSearch /></span>
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              onFocus={() => { navigate("/search"); setMenuOpen(false); }}
              placeholder="Search songs, artists..."
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: "#fff", fontSize: 14, fontFamily: "inherit",
              }}
            />
          </div>
        </div>

        {/* Nav links */}
        <div style={{ padding: "4px 10px" }}>
          {MOBILE_LINKS.map(({ label, href, Ico }) => (
            <Link
              key={href}
              to={href}
              onClick={() => setMenuOpen(false)}
              className="nb-mlink"
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 12,
                fontSize: 14, fontWeight: 500, textDecoration: "none",
                color: active(href) ? ACCENT : "rgba(255,255,255,0.65)",
                background: active(href) ? `${ACCENT}12` : "transparent",
                marginBottom: 2,
              }}
            >
              <span style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: active(href) ? `${ACCENT}22` : "rgba(255,255,255,0.06)",
                color: active(href) ? ACCENT : "rgba(255,255,255,0.4)",
              }}>
                <Ico />
              </span>
              <span>{label}</span>
              {active(href) && (
                <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: ACCENT, flexShrink: 0 }} />
              )}
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "6px 14px" }} />

        {/* Auth */}
        <div style={{ padding: "8px 14px 20px" }}>
          {!authLoading && (
            isLoggedIn
              ? (
                <Link to="/profile" onClick={() => setMenuOpen(false)} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "11px 14px", borderRadius: 12,
                  fontSize: 14, fontWeight: 500,
                  color: "rgba(255,255,255,0.65)",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  textDecoration: "none",
                }}>
                  👤 My Profile
                </Link>
              )
              : (
                <div style={{ display: "flex", gap: 10 }}>
                  <Link to="/signup" onClick={() => setMenuOpen(false)} className="nb-signup" style={{
                    flex: 1, textAlign: "center", padding: "11px", borderRadius: 100,
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 600,
                    textDecoration: "none",
                  }}>Sign up</Link>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="nb-login" style={{
                    flex: 1, textAlign: "center", padding: "11px", borderRadius: 100,
                    background: ACCENT, color: "#fff",
                    fontSize: 13, fontWeight: 700, textDecoration: "none",
                    boxShadow: `0 4px 16px ${ACCENT}50`,
                  }}>Log in</Link>
                </div>
              )
          )}
        </div>
      </div>

      <NavCSS />
    </>
  );
}

function NavCSS() {
  return (
    <style>{`
      /* ── hover states ── */
      .nb-logo:hover > div { transform: scale(1.06) rotate(-2deg); }
      .nb-link:hover  { color: #fff !important; background: rgba(255,255,255,0.07) !important; }
      .nb-icon-btn:hover { color: #fff !important; background: rgba(255,255,255,0.09) !important; border-color: rgba(255,255,255,0.22) !important; }
      .nb-signup:hover { border-color: ${ACCENT} !important; color: ${ACCENT} !important; }
      .nb-login:hover  { filter: brightness(1.15); transform: translateY(-1px); }
      .nb-mlink:hover  { color: #fff !important; background: rgba(255,255,255,0.06) !important; }
      .nb-ham:hover    { background: rgba(255,255,255,0.08) !important; }

      /* ── transitions ── */
      .nb-logo > div, .nb-link, .nb-icon-btn, .nb-signup, .nb-login, .nb-mlink, .nb-ham {
        transition: all 0.18s ease;
      }

      /* ── input resets ── */
      input::placeholder { color: rgba(255,255,255,0.22) !important; }
      input:focus { outline: none !important; box-shadow: none !important; }

      /* ── scrollbar ── */
      .nb-menu::-webkit-scrollbar { width: 3px; }
      .nb-menu::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }

      /* ────────────────────────────────────
         RESPONSIVE — this is the key part
      ──────────────────────────────────── */

      /* DESKTOP: show desktop items */
      @media (min-width: 768px) {
        .nb-ham      { display: none !important; }
        .nb-backdrop { display: none !important; }
        .nb-menu     { display: none !important; }
        .nb-desktop  { display: flex !important; }
        .nb-search   { display: flex !important; }
        .nb-spacer   { display: block !important; }
      }

      /* MOBILE: show hamburger, hide desktop */
      @media (max-width: 767px) {
        .nb-ham      { display: flex !important; }
        .nb-backdrop { display: block !important; }
        .nb-menu     { display: block !important; }
        .nb-desktop  { display: none !important; }
        .nb-search   { display: none !important; }
        .nb-spacer   { display: none !important; }
      }

      /* Tiny screens — hide logo text */
      @media (max-width: 380px) {
        .nb-logo-text { display: none !important; }
      }
    `}</style>
  );
}