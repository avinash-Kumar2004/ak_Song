import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const EyeIcon = ({ open }) =>
  open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

const MusicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
    <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3z"/>
  </svg>
);

const EmailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.69a16 16 0 0 0 6.29 6.29l.96-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

export default function LoginPage() {
  const { login, error, loading, clearError } = useAuth();
  const navigate = useNavigate();

  const [loginMode, setLoginMode] = useState("email"); // "email" | "phone"
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword]     = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [localErr, setLocalErr]     = useState("");

  useEffect(() => {
    clearError?.();
    setIdentifier("");
    setLocalErr("");
  }, [loginMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return setLocalErr("Please enter your email or phone.");
    if (!password)          return setLocalErr("Please enter your password.");
    setLocalErr("");
    try {
      await login({ identifier: identifier.trim(), password });
      navigate("/");
    } catch {
      // error handled by AuthContext
    }
  };

  const displayErr = localErr || error;

  return (
    <div style={styles.page}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoRow}>
          <div style={styles.logoBox}><MusicIcon /></div>
          <span style={styles.logoText}>Sound<span style={{ color: "#6c63ff" }}>Wave</span></span>
        </div>

        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.sub}>Sign in to continue listening</p>

        {/* Toggle: Email / Phone */}
        <div style={styles.toggleRow}>
          {["email", "phone"].map((mode) => (
            <button
              key={mode}
              onClick={() => setLoginMode(mode)}
              style={{
                ...styles.toggleBtn,
                background: loginMode === mode
                  ? "rgba(108,99,255,0.15)"
                  : "transparent",
                color: loginMode === mode ? "#6c63ff" : "rgba(255,255,255,0.35)",
                border: loginMode === mode
                  ? "1px solid rgba(108,99,255,0.4)"
                  : "1px solid transparent",
              }}
            >
              {mode === "email" ? <EmailIcon /> : <PhoneIcon />}
              {mode === "email" ? "Email" : "Phone"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Identifier field */}
          <div style={styles.fieldWrap}>
            <label style={styles.label}>
              {loginMode === "email" ? "Email Address" : "Phone Number"}
            </label>
            <input
              type={loginMode === "email" ? "email" : "tel"}
              value={identifier}
              onChange={(e) => { setIdentifier(e.target.value); setLocalErr(""); }}
              placeholder={loginMode === "email" ? "rahul@email.com" : "+91 98765 43210"}
              style={styles.input}
              autoComplete={loginMode === "email" ? "email" : "tel"}
            />
          </div>

          {/* Password field */}
          <div style={styles.fieldWrap}>
            <label style={styles.label}>Password</label>
            <div style={styles.passWrap}>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setLocalErr(""); }}
                placeholder="Your password"
                style={{ ...styles.input, paddingRight: 44 }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                style={styles.eyeBtn}
              >
                <EyeIcon open={showPass} />
              </button>
            </div>
          </div>

          {displayErr && <p style={styles.err}>{displayErr}</p>}

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? "Signing in..." : "Sign In 🎵"}
          </button>
        </form>

        <p style={styles.switchText}>
          Don't have an account?{" "}
          <Link to="/signup" style={styles.link}>Sign up free</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#080a10",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 16px 40px",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Segoe UI', sans-serif",
  },
  blob1: {
    position: "absolute", width: 400, height: 400, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)",
    top: -100, right: -100, pointerEvents: "none",
  },
  blob2: {
    position: "absolute", width: 300, height: 300, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,77,109,0.08) 0%, transparent 70%)",
    bottom: -50, left: -50, pointerEvents: "none",
  },
  card: {
    width: "100%", maxWidth: 420,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: "36px 32px",
    backdropFilter: "blur(20px)",
    position: "relative", zIndex: 1,
  },
  logoRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 24 },
  logoBox: {
    width: 38, height: 38, borderRadius: 10,
    background: "linear-gradient(135deg,#6c63ff,#ff4d6d)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  logoText: { fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: -0.5 },
  title: { margin: 0, fontSize: 26, fontWeight: 800, color: "#fff" },
  sub: { margin: "6px 0 24px", fontSize: 13, color: "rgba(255,255,255,0.4)" },
  toggleRow: {
    display: "flex", gap: 8, marginBottom: 24,
  },
  toggleBtn: {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
    gap: 7, padding: "10px 0", borderRadius: 10,
    fontSize: 13, fontWeight: 600, cursor: "pointer",
    transition: "all 0.2s", fontFamily: "inherit",
  },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  fieldWrap: { display: "flex", flexDirection: "column", gap: 6 },
  label: {
    fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.55)",
    letterSpacing: 0.3, textTransform: "uppercase",
  },
  input: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10, padding: "13px 14px",
    fontSize: 14, color: "#fff", outline: "none",
    width: "100%", boxSizing: "border-box",
    transition: "border-color 0.2s", fontFamily: "inherit",
  },
  passWrap: { position: "relative" },
  eyeBtn: {
    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer",
    color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", padding: 0,
  },
  btn: {
    background: "linear-gradient(135deg,#6c63ff,#7c74ff)",
    border: "none", borderRadius: 12, padding: "14px",
    fontSize: 14, fontWeight: 700, color: "#fff",
    cursor: "pointer", transition: "opacity 0.2s", fontFamily: "inherit",
    marginTop: 4,
  },
  err: {
    margin: 0, fontSize: 13, color: "#ff4d6d",
    background: "rgba(255,77,109,0.08)",
    border: "1px solid rgba(255,77,109,0.2)",
    padding: "10px 14px", borderRadius: 8,
  },
  switchText: {
    margin: "20px 0 0", textAlign: "center",
    fontSize: 13, color: "rgba(255,255,255,0.35)",
  },
  link: { color: "#6c63ff", fontWeight: 600, textDecoration: "none" },
};