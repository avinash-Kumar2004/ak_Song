// frontend/src/page/ProfilePage.jsx
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userAPI } from "../api";
function initials(name = "") {
  return name.trim().split(" ").map((w) => w[0]?.toUpperCase()).slice(0, 2).join("");
}

function Tab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={[
        "pb-3 px-1 text-sm font-semibold border-b-2 -mb-px transition-all duration-150",
        active ? "border-[#6c63ff] text-[#6c63ff]" : "border-transparent text-gray-500 hover:text-gray-300",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-600 mt-1">{hint}</p>}
    </div>
  );
}

function Alert({ msg }) {
  if (!msg) return null;
  return (
    <div className={[
      "text-sm px-4 py-2.5 rounded-xl mb-5",
      msg.type === "success"
        ? "bg-green-900/30 text-green-300 border border-green-700/30"
        : "bg-red-900/30 text-red-300 border border-red-700/30",
    ].join(" ")}>
      {msg.text}
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileRef  = useRef(null);

  const [tab,       setTab]       = useState("info");
  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [msg,       setMsg]       = useState(null);

  const [name, setName] = useState(user?.name || "");
  const [bio,  setBio]  = useState(user?.bio  || "");
  const [curPwd,  setCurPwd]  = useState("");
  const [newPwd,  setNewPwd]  = useState("");
  const [confPwd, setConfPwd] = useState("");

  const flash = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };

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
      updateUser?.(data.data.user);
      flash("success", "Avatar updated!");
    } catch (err) {
      flash("error", err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    if (!name.trim()) return flash("error", "Name cannot be empty.");
    setSaving(true);
    try {
      const { data } = await userAPI.updateProfile({ name: name.trim(), bio: bio.trim() });
      updateUser?.(data.data.user);
      flash("success", "Profile updated!");
    } catch (err) {
      flash("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!curPwd || !newPwd || !confPwd) return flash("error", "All fields are required.");
    if (newPwd.length < 8)              return flash("error", "New password must be at least 8 characters.");
    if (newPwd !== confPwd)             return flash("error", "Passwords do not match.");
    setSaving(true);
    try {
      await userAPI.changePassword({ currentPassword: curPwd, newPassword: newPwd });
      flash("success", "Password changed! Logging out…");
      setCurPwd(""); setNewPwd(""); setConfPwd("");
      setTimeout(async () => { await logout?.(); navigate("/login"); }, 2000);
    } catch (err) {
      flash("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      await fetch("/api/users/me", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("sw_token")}` },
      });
      await logout?.();
      navigate("/");
    } catch {
      flash("error", "Failed to delete account.");
    }
  };

  const avatarUrl = user?.avatar?.url;

  return (
    <div className="min-h-screen bg-[#0a0c12] pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-6 transition-colors group"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        <div className="bg-[#0e1017] border border-white/[0.07] rounded-2xl overflow-hidden shadow-2xl">

          {/* Banner */}
          <div className="relative h-28 bg-gradient-to-r from-[#6c63ff]/40 via-[#8b5cf6]/30 to-[#ff4d6d]/30">
            <div className="absolute top-2 left-8 w-16 h-16 rounded-full bg-[#6c63ff]/20 blur-2xl" />
            <div className="absolute bottom-0 right-12 w-20 h-20 rounded-full bg-[#ff4d6d]/15 blur-2xl" />

            {/* Avatar */}
            <div className="absolute -bottom-10 left-6">
              <div className="relative cursor-pointer group" onClick={() => fileRef.current?.click()} title="Change photo">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={user?.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-[#0e1017] group-hover:border-[#6c63ff]/50 transition-all" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6c63ff] to-[#ff4d6d] flex items-center justify-center text-2xl font-bold text-white border-4 border-[#0e1017] group-hover:border-[#6c63ff]/50 transition-all select-none">
                    {initials(user?.name) || "?"}
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#6c63ff] rounded-full flex items-center justify-center border-2 border-[#0e1017] shadow-lg">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
          </div>

          {/* User info */}
          <div className="pt-14 px-6 pb-2">
            <p className="text-lg font-bold text-white">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            {uploading
              ? <p className="text-xs text-[#6c63ff] mt-1 animate-pulse">Uploading avatar…</p>
              : <p className="text-xs text-gray-600 mt-1">Click avatar to change photo</p>
            }
          </div>

          {/* Tabs + Forms */}
          <div className="px-6 pb-6">
            <Alert msg={msg} />

            <div className="flex gap-5 border-b border-white/[0.07] mb-6">
              <Tab active={tab === "info"}     onClick={() => setTab("info")}>Profile Info</Tab>
              <Tab active={tab === "password"} onClick={() => setTab("password")}>Password</Tab>
            </div>

            {/* Info Tab */}
            {tab === "info" && (
              <form onSubmit={handleSaveInfo} className="flex flex-col gap-4">
                <Field label="Full Name">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#6c63ff]/60 transition-all" />
                </Field>

                <Field label="Email" hint="Email cannot be changed.">
                  <input value={user?.email || ""} readOnly
                    className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed" />
                </Field>

                {user?.phone && (
                  <Field label="Phone">
                    <input value={user.phone} readOnly
                      className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed" />
                  </Field>
                )}

                <Field label="Bio" hint={`${bio.length}/200 characters`}>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell something about yourself…" maxLength={200} rows={3}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#6c63ff]/60 transition-all resize-none" />
                </Field>

                <button type="submit" disabled={saving}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#8b5cf6] text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-all">
                  {saving ? "Saving…" : "Save Changes"}
                </button>

                {/* Danger Zone */}
                <div className="mt-2 pt-5 border-t border-white/[0.06]">
                  <p className="text-xs font-bold text-red-400 mb-1">⚠ Danger Zone</p>
                  <p className="text-xs text-gray-500 mb-3">Permanently delete your account and all data. Cannot be undone.</p>
                  <button type="button" onClick={handleDelete}
                    className="w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-semibold text-sm hover:bg-red-500/20 transition-all">
                    Delete My Account
                  </button>
                </div>
              </form>
            )}

            {/* Password Tab */}
            {tab === "password" && (
              <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                {[
                  { label: "Current Password",    val: curPwd,  set: setCurPwd,  ph: "••••••••" },
                  { label: "New Password",         val: newPwd,  set: setNewPwd,  ph: "Min 8 characters" },
                  { label: "Confirm New Password", val: confPwd, set: setConfPwd, ph: "Repeat new password" },
                ].map(({ label, val, set, ph }) => (
                  <Field key={label} label={label}>
                    <input type="password" value={val} onChange={(e) => set(e.target.value)} placeholder={ph}
                      className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#6c63ff]/60 transition-all" />
                  </Field>
                ))}
                <button type="submit" disabled={saving}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#8b5cf6] text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-all">
                  {saving ? "Updating…" : "Update Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}