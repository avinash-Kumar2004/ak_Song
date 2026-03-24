// frontend/src/components/ProfileDropdown.jsx
// ── ONLY CHANGE from your original: added `updateUser` to useAuth() ──────────
// Replace your existing ProfileDropdown.jsx with this file
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ─── Icons ────────────────────────────────────────────────────────────────────
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
  </svg>
);
const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const MusicNoteIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3z" />
  </svg>
);

// ─── Avatar Display ───────────────────────────────────────────────────────────
function AvatarDisplay({ user, size = "md" }) {
  const sizeClasses = {
    sm: "w-7 h-7 text-[11px]",
    md: "w-9 h-9 text-[13px]",
    lg: "w-14 h-14 text-[18px]",
  };
  const initials = user?.name
    ? user.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "?";

  if (user?.avatar?.url) {
    return (
      <img
        src={user.avatar.url}
        alt={user.name}
        className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-[#6c63ff]/30`}
      />
    );
  }
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-[#6c63ff] to-[#ff4d6d] flex items-center justify-center font-bold text-white ring-2 ring-[#6c63ff]/30 shrink-0`}>
      {initials}
    </div>
  );
}

// ─── Menu Item ────────────────────────────────────────────────────────────────
function MenuItem({ to, onClick, icon, label, danger = false, badge }) {
  const baseClass = "flex items-center gap-3 px-3.5 py-[10px] rounded-xl text-[13px] font-medium transition-all duration-150 group w-full text-left";
  const colorClass = danger
    ? "text-red-400/80 hover:text-red-400 hover:bg-red-500/[0.08]"
    : "text-gray-400 hover:text-white hover:bg-white/[0.06]";

  const inner = (
    <>
      <span className={`shrink-0 transition-colors duration-150 ${danger ? "text-red-400/60 group-hover:text-red-400" : "text-gray-500 group-hover:text-[#6c63ff]"}`}>
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#6c63ff]/20 text-[#6c63ff]">{badge}</span>
      )}
    </>
  );

  if (to) return <Link to={to} onClick={onClick} className={`${baseClass} ${colorClass}`}>{inner}</Link>;
  return <button onClick={onClick} className={`${baseClass} ${colorClass}`}>{inner}</button>;
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function SpinnerIcon() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProfileDropdown() {
  // ✅ updateUser added — dispatches UPDATE_USER to AuthContext reducer
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen]           = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef  = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        triggerRef.current  && !triggerRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      setOpen(false);
      navigate("/");
    } catch {
      // silently handled
    } finally {
      setLoggingOut(false);
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* ── Trigger Button ── */}
      <button
        ref={triggerRef}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Open profile menu"
        className={[
          "flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border transition-all duration-200 outline-none",
          open
            ? "border-[#6c63ff]/50 bg-[#6c63ff]/[0.08]"
            : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]",
        ].join(" ")}
      >
        <AvatarDisplay user={user} size="sm" />
        <span className="text-[13px] font-medium text-white/80 max-w-[90px] truncate hidden sm:block">
          {user.name?.split(" ")[0]}
        </span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          className={`w-3 h-3 text-gray-500 transition-transform duration-200 hidden sm:block ${open ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* ── Dropdown Panel ── */}
      <div
        ref={dropdownRef}
        role="menu"
        aria-label="Profile menu"
        className={[
          "absolute right-0 top-[calc(100%+10px)] w-[260px] z-50",
          "bg-[#0e1017] border border-white/[0.08] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.5)]",
          "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] origin-top-right",
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none",
        ].join(" ")}
      >
        {/* User Info Header */}
        <div className="px-4 pt-4 pb-3 flex items-center gap-3 border-b border-white/[0.06]">
          <AvatarDisplay user={user} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-white truncate">{user.name}</p>
            <p className="text-[12px] text-gray-500 truncate">{user.email}</p>
            {user.favoriteGenre && (
              <div className="flex items-center gap-1 mt-0.5">
                <MusicNoteIcon />
                <span className="text-[11px] text-[#6c63ff] truncate max-w-[140px]">
                  {user.favoriteGenre.split("–")[0].trim()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <div className="px-2 py-2">
          <MenuItem to="/profile"  icon={<UserIcon />}     label="My Profile"  onClick={() => setOpen(false)} />
          <MenuItem to="/favorite" icon={<HeartIcon />}    label="Favourites"  onClick={() => setOpen(false)} />
          <MenuItem to="/settings" icon={<SettingsIcon />} label="Settings"    onClick={() => setOpen(false)} />
        </div>

        <div className="h-px bg-white/[0.06] mx-2" />

        {/* Logout */}
        <div className="px-2 py-2">
          <MenuItem
            onClick={handleLogout}
            icon={loggingOut ? <SpinnerIcon /> : <LogoutIcon />}
            label={loggingOut ? "Logging out…" : "Log out"}
            danger
          />
        </div>
      </div>
    </div>
  );
}