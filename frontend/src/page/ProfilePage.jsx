import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp  } from "../context/AppContext";

export default function ProfilePage() {
  const navigate = useNavigate();
  const auth     = useAuth?.();
  const user     = auth?.user;
  const { accent, isDark, profileImage, setProfileImage, displayName, setDisplayName } = useApp();

  const bg = isDark ? "#0a0c12" : "#f0f2f5";

  const [name,       setName]       = useState(user?.displayName || displayName || "");
  const [email,      setEmail]      = useState(user?.email || "");
  const [bio,        setBio]        = useState(() => localStorage.getItem("sw_bio") ?? "");
  const [imgPreview, setImgPreview] = useState(profileImage || null);
  const [saving,     setSaving]     = useState(false);
  const [toast,      setToast]      = useState(null);
  const [errors,     setErrors]     = useState({});
  const fileRef = useRef(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast("Image must be under 5MB", "error"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImgPreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs = {};
    if (!name.trim())           errs.name  = "Display name is required";
    if (!email.trim())          errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Enter a valid email";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    // Simulate async save
    await new Promise(r => setTimeout(r, 800));
    // Persist to AppContext + localStorage
    setDisplayName(name);
    setProfileImage(imgPreview);
    localStorage.setItem("sw_bio", bio);
    // Try to update Firebase user if available
    try {
      if (auth?.updateProfile) await auth.updateProfile({ displayName: name });
    } catch {}
    setSaving(false);
    showToast("Profile updated!");
  };

  const handleRemovePhoto = () => {
    setImgPreview(null);
    setProfileImage(null);
  };

  const avatar = (name?.[0] || user?.email?.[0] || "U").toUpperCase();

  const inputStyle = (err) => ({
    width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 14,
    border: `1.5px solid ${err ? "#ff4d6d" : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)"}`,
    background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    color: isDark ? "#f0f0f0" : "#111",
    outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  });

  const labelStyle = {
    fontSize: 12, fontWeight: 600, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
    letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6, display: "block",
  };

  return (
    <>
      <style>{`
        @keyframes pfSlide { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes pfToast { from{opacity:0;transform:translateX(-50%) translateY(10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        .pf-input:focus { border-color: ${accent} !important; box-shadow: 0 0 0 3px ${accent}22; }
        .pf-btn-save:hover { opacity: 0.9; transform: translateY(-1px); }
        .pf-btn-save:active { transform: translateY(0); }
      `}</style>

      <div style={{ minHeight: "100vh", background: bg, paddingTop: 80, paddingBottom: 60,
        fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 16px" }}>

          {/* Back button */}
          <button onClick={() => navigate("/settings")}
            style={{ display:"flex", alignItems:"center", gap:6, background:"none",
              border:"none", cursor:"pointer", color:isDark?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.4)",
              fontSize:13, marginBottom:24, padding:0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Back to Settings
          </button>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800,
              color: isDark ? "#f0f0f0" : "#111", letterSpacing: "-0.5px", margin: 0 }}>
              Edit Profile
            </h1>
            <p style={{ color: isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.45)",
              fontSize: 14, margin: "4px 0 0" }}>
              Update your personal information
            </p>
          </div>

          {/* Avatar section */}
          <div style={{ background: isDark ? "#13151f" : "#fff",
            borderRadius: 20, border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`,
            padding: 24, marginBottom: 16, display: "flex", alignItems: "center", gap: 20,
            animation: "pfSlide 0.3s ease" }}>
            {/* Avatar preview */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: 88, height: 88, borderRadius: "50%", overflow: "hidden",
                boxShadow: `0 0 0 3px ${bg}, 0 0 0 5px ${accent}66` }}>
                {imgPreview ? (
                  <img src={imgPreview} alt="profile"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%",
                    background: `linear-gradient(135deg, ${accent}, #ff4d6d)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 34, fontWeight: 800, color: "#fff" }}>{avatar}</div>
                )}
              </div>
              {/* Camera overlay */}
              <button onClick={() => fileRef.current?.click()}
                style={{ position: "absolute", bottom: 0, right: 0,
                  width: 28, height: 28, borderRadius: "50%",
                  background: accent, border: `2px solid ${bg}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", outline: "none" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff">
                  <path d="M12 15.2A3.2 3.2 0 0 1 8.8 12 3.2 3.2 0 0 1 12 8.8 3.2 3.2 0 0 1 15.2 12 3.2 3.2 0 0 1 12 15.2M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>
                </svg>
              </button>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700,
                color: isDark ? "#f0f0f0" : "#111" }}>{name || "Your Name"}</div>
              <div style={{ fontSize: 13, color: isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.45)",
                marginTop: 2 }}>{email}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button onClick={() => fileRef.current?.click()}
                  style={{ padding: "7px 16px", borderRadius: 100, fontSize: 12, fontWeight: 600,
                    background: `${accent}1a`, border: `1px solid ${accent}44`,
                    color: accent, cursor: "pointer", outline: "none" }}>
                  Upload Photo
                </button>
                {imgPreview && (
                  <button onClick={handleRemovePhoto}
                    style={{ padding: "7px 16px", borderRadius: 100, fontSize: 12, fontWeight: 600,
                      background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.3)",
                      color: "#ff4d6d", cursor: "pointer", outline: "none" }}>
                    Remove
                  </button>
                )}
              </div>
              <p style={{ fontSize: 11, color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.35)",
                margin: "8px 0 0" }}>JPG, PNG or GIF · Max 5MB</p>
            </div>

            <input ref={fileRef} type="file" accept="image/*"
              onChange={handleImageChange} style={{ display: "none" }} />
          </div>

          {/* Form fields */}
          <div style={{ background: isDark ? "#13151f" : "#fff",
            borderRadius: 20, border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`,
            padding: 24, marginBottom: 16, animation: "pfSlide 0.35s ease",
            display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Display name */}
            <div>
              <label style={labelStyle}>Display Name</label>
              <input className="pf-input" value={name} onChange={e => setName(e.target.value)}
                placeholder="Your display name" style={inputStyle(errors.name)}
                onFocus={e => { e.target.style.borderColor = accent; e.target.style.boxShadow = `0 0 0 3px ${accent}22`; }}
                onBlur={e  => { e.target.style.borderColor = errors.name ? "#ff4d6d" : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)"; e.target.style.boxShadow = "none"; }}
              />
              {errors.name && <p style={{ color:"#ff4d6d", fontSize:12, margin:"4px 0 0" }}>{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>Email Address</label>
              <input className="pf-input" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" style={inputStyle(errors.email)}
                onFocus={e => { e.target.style.borderColor = accent; e.target.style.boxShadow = `0 0 0 3px ${accent}22`; }}
                onBlur={e  => { e.target.style.borderColor = errors.email ? "#ff4d6d" : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)"; e.target.style.boxShadow = "none"; }}
              />
              {errors.email && <p style={{ color:"#ff4d6d", fontSize:12, margin:"4px 0 0" }}>{errors.email}</p>}
            </div>

            {/* Bio */}
            <div>
              <label style={labelStyle}>Bio <span style={{ opacity:0.5, fontWeight:400, textTransform:"none", letterSpacing:0 }}>(optional)</span></label>
              <textarea value={bio} onChange={e => setBio(e.target.value)}
                placeholder="Tell people a little about yourself..."
                rows={3} maxLength={160}
                style={{ ...inputStyle(false), resize: "none", lineHeight: 1.6 }}
                onFocus={e => { e.target.style.borderColor = accent; e.target.style.boxShadow = `0 0 0 3px ${accent}22`; }}
                onBlur={e  => { e.target.style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)"; e.target.style.boxShadow = "none"; }}
              />
              <p style={{ fontSize: 11, color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.35)",
                margin: "4px 0 0", textAlign: "right" }}>{bio.length}/160</p>
            </div>
          </div>

          {/* Quick links */}
          <div style={{ background: isDark ? "#13151f" : "#fff",
            borderRadius: 16, border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`,
            overflow: "hidden", marginBottom: 24 }}>
            {[
              { icon:"🔑", label:"Change Password", onClick:()=>navigate("/change-password") },
              { icon:"⚙️", label:"Account Settings",  onClick:()=>navigate("/settings") },
            ].map(({icon, label, onClick}, i) => (
              <div key={i} onClick={onClick}
                style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 20px",
                  borderTop: i===0?"none":`1px solid ${isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.06)"}`,
                  cursor:"pointer", transition:"background 0.15s",
                  color: isDark ? "#f0f0f0" : "#111" }}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{ width:36, height:36, borderRadius:10,
                  background:"rgba(255,255,255,0.06)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>{icon}</div>
                <span style={{ fontSize:14, fontWeight:500 }}>{label}</span>
                <span style={{ marginLeft:"auto", opacity:0.4, fontSize:18 }}>›</span>
              </div>
            ))}
          </div>

          {/* Save button */}
          <button className="pf-btn-save" onClick={handleSave} disabled={saving}
            style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none",
              background: saving ? `${accent}88` : accent,
              color: "#fff", fontSize: 15, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
              transition: "all 0.2s", outline: "none",
              boxShadow: saving ? "none" : `0 4px 20px ${accent}55` }}>
            {saving ? (
              <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                <span style={{ width:16, height:16, borderRadius:"50%",
                  border:`2px solid rgba(255,255,255,0.3)`, borderTopColor:"#fff",
                  display:"inline-block", animation:"spin 0.7s linear infinite" }}/>
                Saving...
              </span>
            ) : "Save Changes"}
          </button>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)",
          background: toast.type==="error" ? "#ff4d6d" : accent,
          color:"#fff", padding:"11px 26px", borderRadius:100,
          fontSize:13, fontWeight:600, boxShadow:`0 4px 24px rgba(0,0,0,0.4)`,
          zIndex:999999, animation:"pfToast 0.3s ease", whiteSpace:"nowrap", pointerEvents:"none" }}>
          {toast.type==="error" ? "⚠️ " : "✓ "}{toast.msg}
        </div>
      )}
    </>
  );
}