// frontend/src/components/ProfileModal.jsx
import { useState, useRef } from "react";
import { userAPI } from "../api";
function initials(name = "") {
  return name.trim().split(" ").map((w) => w[0]?.toUpperCase()).slice(0, 2).join("");
}

export default function ProfileModal({ user, onClose, onUserUpdate, onLogout }) {
  const fileRef = useRef(null);
  const [tab, setTab]           = useState("info");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState(null); // { type: "success"|"error", text }

  const [name, setName] = useState(user?.name || "");
  const [bio, setBio]   = useState(user?.bio  || "");

  const [curPwd,  setCurPwd]  = useState("");
  const [newPwd,  setNewPwd]  = useState("");
  const [confPwd, setConfPwd] = useState("");

  const flash = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };

  // ── Avatar upload ──────────────────────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return flash("error", "Only image files allowed.");
    if (file.size > 5 * 1024 * 1024)    return flash("error", "Image must be under 5 MB.");

    const formData = new FormData();
    formData.append("avatar", file);
    setUploading(true);
    try {
      const { data } = await userAPI.uploadAvatar(formData);
      onUserUpdate?.(data.data.user);
      flash("success", "Avatar updated!");
    } catch (err) {
      flash("error", err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // ── Save profile info ──────────────────────────────────────────────────
  const handleSaveInfo = async (e) => {
    e.preventDefault();
    if (!name.trim()) return flash("error", "Name cannot be empty.");
    setSaving(true);
    try {
      const { data } = await userAPI.updateProfile({ name: name.trim(), bio: bio.trim() });
      onUserUpdate?.(data.data.user);
      flash("success", "Profile updated!");
    } catch (err) {
      flash("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Change password ────────────────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!curPwd || !newPwd || !confPwd) return flash("error", "All fields are required.");
    if (newPwd.length < 8)              return flash("error", "New password must be at least 8 characters.");
    if (newPwd !== confPwd)             return flash("error", "New passwords do not match.");
    setSaving(true);
    try {
      await userAPI.changePassword({ currentPassword: curPwd, newPassword: newPwd });
      flash("success", "Password changed! Logging you out…");
      setCurPwd(""); setNewPwd(""); setConfPwd("");
      setTimeout(() => { onLogout?.(); }, 2000);
    } catch (err) {
      flash("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete account ─────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      await fetch("/api/users/me", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("sw_token")}` },
      });
      onLogout?.();
      onClose();
    } catch {
      flash("error", "Failed to delete account.");
    }
  };

  const avatarUrl = user?.avatar?.url;

  return (
    // ── Overlay ──
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* ── Modal box ── */}
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#0e1017] border border-white/10 rounded-2xl shadow-2xl text-white">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <h2 className="text-base font-bold">My Profile</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5">
          {/* ── Avatar ── */}
          <div className="flex flex-col items-center mb-6">
            <div
              className="relative w-24 h-24 cursor-pointer group"
              onClick={() => fileRef.current?.click()}
              title="Change photo"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-24 h-24 rounded-full object-cover border-[3px] border-white/10 group-hover:border-[#6c63ff]/60 transition-all" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#6c63ff] to-[#ff4d6d] flex items-center justify-center text-3xl font-bold text-white border-[3px] border-white/10 group-hover:border-[#6c63ff]/60 transition-all select-none">
                  {initials(user?.name) || "?"}
                </div>
              )}
              {/* Edit badge */}
              <div className="absolute bottom-0.5 right-0.5 w-7 h-7 bg-[#6c63ff] rounded-full flex items-center justify-center shadow-lg border-2 border-[#0e1017]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            {uploading
              ? <p className="text-xs text-[#6c63ff] mt-2 animate-pulse">Uploading…</p>
              : <p className="text-xs text-gray-600 mt-2">Click photo to change</p>
            }
          </div>

          {/* ── Alert ── */}
          {msg && (
            <div className={[
              "text-sm px-4 py-2.5 rounded-xl mb-4",
              msg.type === "success"
                ? "bg-green-900/40 text-green-300 border border-green-700/40"
                : "bg-red-900/40 text-red-300 border border-red-700/40",
            ].join(" ")}>
              {msg.text}
            </div>
          )}

          {/* ── Tabs ── */}
          <div className="flex gap-1 mb-5 border-b border-white/[0.07]">
            {["info", "password"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={[
                  "pb-2.5 px-1 text-sm font-semibold border-b-2 -mb-px transition-all duration-150 capitalize",
                  tab === t
                    ? "border-[#6c63ff] text-[#6c63ff]"
                    : "border-transparent text-gray-500 hover:text-gray-300",
                ].join(" ")}
              >
                {t === "info" ? "Profile Info" : "Password"}
              </button>
            ))}
          </div>

          {/* ── Tab: Info ── */}
          {tab === "info" && (
            <form onSubmit={handleSaveInfo} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Full Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#6c63ff]/60 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Email</label>
                <input
                  value={user?.email || ""}
                  readOnly
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3.5 py-2.5 text-sm text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-600 mt-1">Email cannot be changed.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell something about yourself…"
                  maxLength={200}
                  rows={3}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#6c63ff]/60 transition-all resize-none"
                />
                <p className="text-xs text-gray-600 text-right">{bio.length}/200</p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#8b5cf6] text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-all"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>

              {/* Danger zone */}
              <div className="border-t border-white/[0.07] pt-4 mt-1">
                <p className="text-xs font-bold text-red-400 mb-1">⚠ Danger Zone</p>
                <p className="text-xs text-gray-500 mb-3">
                  Permanently delete your account and all data. This cannot be undone.
                </p>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-semibold text-sm hover:bg-red-500/20 transition-all"
                >
                  Delete My Account
                </button>
              </div>
            </form>
          )}

          {/* ── Tab: Password ── */}
          {tab === "password" && (
            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              {[
                { label: "Current Password", val: curPwd, set: setCurPwd, ph: "••••••••" },
                { label: "New Password",     val: newPwd, set: setNewPwd, ph: "Min 8 characters" },
                { label: "Confirm New Password", val: confPwd, set: setConfPwd, ph: "Repeat new password" },
              ].map(({ label, val, set, ph }) => (
                <div key={label}>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">{label}</label>
                  <input
                    type="password"
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    placeholder={ph}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#6c63ff]/60 transition-all"
                  />
                </div>
              ))}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#8b5cf6] text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-all"
              >
                {saving ? "Updating…" : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}