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

const SONGS = [
  "Tum Hi Ho – Arijit Singh",
  "Kesariya – Arijit Singh",
  "Raataan Lambiyan – Jubin Nautiyal",
  "Believer – Imagine Dragons",
  "Blinding Lights – The Weeknd",
  "Shape of You – Ed Sheeran",
  "Bohemian Rhapsody – Queen",
  "Levitating – Dua Lipa",
  "Stay – The Kid LAROI",
  "As It Was – Harry Styles",
  "Ik Vaari Aa – Arijit Singh",
  "Channa Mereya – Arijit Singh",
  "Apna Bana Le – Arijit Singh",
  "Let Her Go – Passenger",
  "Perfect – Ed Sheeran",
];

export default function SignupPage() {
  const { signup, error, loading, clearError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", favoriteGenre: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [localErr, setLocalErr] = useState("");
  const [step, setStep]         = useState(1); // 1 = basic info, 2 = password + song

  useEffect(() => { clearError?.(); }, []);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setLocalErr("");
  };

  // ── Step 1 validation ──
  const nextStep = () => {
    if (!form.name.trim())  return setLocalErr("Name is required.");
    if (!form.email.trim()) return setLocalErr("Email is required.");
    if (!form.phone.trim()) return setLocalErr("Phone number is required.");
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!emailOk)           return setLocalErr("Enter a valid email.");
    const phoneOk = /^\+?[\d\s\-()]{7,15}$/.test(form.phone);
    if (!phoneOk)           return setLocalErr("Enter a valid phone number.");
    setLocalErr("");
    setStep(2);
  };

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.password || form.password.length < 8)
      return setLocalErr("Password must be at least 8 characters.");
    try {
      await signup(form);
      navigate("/");
    } catch {
      // error handled by AuthContext
    }
  };

  const displayErr = localErr || error;

  return (
    <div style={styles.page}>
      {/* Background blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoRow}>
          <div style={styles.logoBox}><MusicIcon /></div>
          <span style={styles.logoText}>Sound<span style={{ color: "#6c63ff" }}>Wave</span></span>
        </div>

        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.sub}>Join millions of music lovers</p>

        {/* Step indicator */}
        <div style={styles.stepRow}>
          {[1, 2].map((s) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                ...styles.stepDot,
                background: step >= s ? "#6c63ff" : "rgba(255,255,255,0.1)",
                boxShadow: step >= s ? "0 0 12px rgba(108,99,255,0.5)" : "none",
              }}>
                {step > s ? "✓" : s}
              </div>
              {s < 2 && <div style={{
                width: 40, height: 2,
                background: step > s ? "#6c63ff" : "rgba(255,255,255,0.1)",
                transition: "background 0.3s",
              }} />}
            </div>
          ))}
        </div>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div style={styles.formSection}>
            <Field label="Full Name" name="name" value={form.name}
              onChange={handleChange} placeholder="Rahul Sharma" />
            <Field label="Email Address" name="email" type="email" value={form.email}
              onChange={handleChange} placeholder="rahul@email.com" />
            <Field label="Phone Number" name="phone" type="tel" value={form.phone}
              onChange={handleChange} placeholder="+91 98765 43210" />

            {displayErr && <p style={styles.err}>{displayErr}</p>}

            <button style={styles.btn} onClick={nextStep}>
              Continue →
            </button>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <form onSubmit={handleSubmit} style={styles.formSection}>
            {/* Password */}
            <div style={styles.fieldWrap}>
              <label style={styles.label}>Password</label>
              <div style={styles.passWrap}>
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  style={{ ...styles.input, paddingRight: 42 }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  style={styles.eyeBtn}
                >
                  <EyeIcon open={showPass} />
                </button>
              </div>
              {/* Password strength bar */}
              {form.password && (
                <StrengthBar password={form.password} />
              )}
            </div>

            {/* Favorite Song dropdown */}
            <div style={styles.fieldWrap}>
              <label style={styles.label}>
                🎵 Favorite Song <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>(optional)</span>
              </label>
              <select
                name="favoriteGenre"
                value={form.favoriteGenre}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="">— Select your favorite song —</option>
                {SONGS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {displayErr && <p style={styles.err}>{displayErr}</p>}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ ...styles.btn, background: "rgba(255,255,255,0.07)", flex: "0 0 auto", padding: "13px 20px" }}
              >
                ← Back
              </button>
              <button type="submit" style={{ ...styles.btn, flex: 1 }} disabled={loading}>
                {loading ? "Creating account..." : "Create Account 🎶"}
              </button>
            </div>
          </form>
        )}

        <p style={styles.switchText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>Log in</Link>
        </p>
      </div>
    </div>
  );
}

// ── Password strength bar ─────────────────────────────────────────────────
function StrengthBar({ password }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ff4d6d", "#ff9800", "#6c63ff", "#22c55e"];

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i <= score ? colors[score] : "rgba(255,255,255,0.1)",
            transition: "background 0.3s",
          }} />
        ))}
      </div>
      <p style={{ margin: "4px 0 0", fontSize: 11, color: colors[score] }}>
        {labels[score]}
      </p>
    </div>
  );
}

// ── Reusable field ────────────────────────────────────────────────────────
function Field({ label, name, value, onChange, placeholder, type = "text" }) {
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.label}>{label}</label>
      <input
        name={name} type={type} value={value}
        onChange={onChange} placeholder={placeholder}
        style={styles.input} autoComplete="off"
      />
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────
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
    top: -100, left: -100, pointerEvents: "none",
  },
  blob2: {
    position: "absolute", width: 300, height: 300, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,77,109,0.08) 0%, transparent 70%)",
    bottom: -50, right: -50, pointerEvents: "none",
  },
  card: {
    width: "100%", maxWidth: 440,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: "36px 32px",
    backdropFilter: "blur(20px)",
    position: "relative",
    zIndex: 1,
  },
  logoRow: {
    display: "flex", alignItems: "center", gap: 10, marginBottom: 24,
  },
  logoBox: {
    width: 38, height: 38, borderRadius: 10,
    background: "linear-gradient(135deg,#6c63ff,#ff4d6d)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  logoText: {
    fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: -0.5,
  },
  title: {
    margin: 0, fontSize: 26, fontWeight: 800, color: "#fff",
  },
  sub: {
    margin: "6px 0 20px", fontSize: 13, color: "rgba(255,255,255,0.4)",
  },
  stepRow: {
    display: "flex", alignItems: "center", gap: 0, marginBottom: 28,
  },
  stepDot: {
    width: 30, height: 30, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 700, color: "#fff",
    transition: "all 0.3s",
  },
  formSection: {
    display: "flex", flexDirection: "column", gap: 16,
  },
  fieldWrap: {
    display: "flex", flexDirection: "column", gap: 6,
  },
  label: {
    fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.55)",
    letterSpacing: 0.3, textTransform: "uppercase",
  },
  input: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "13px 14px",
    fontSize: 14,
    color: "#fff",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  },
  select: {
    background: "#0e1017",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "13px 14px",
    fontSize: 14,
    color: "#fff",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
    cursor: "pointer",
  },
  passWrap: { position: "relative" },
  eyeBtn: {
    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer",
    color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center",
    padding: 0,
  },
  btn: {
    background: "linear-gradient(135deg,#6c63ff,#7c74ff)",
    border: "none",
    borderRadius: 12,
    padding: "13px 20px",
    fontSize: 14,
    fontWeight: 700,
    color: "#fff",
    cursor: "pointer",
    transition: "opacity 0.2s, transform 0.15s",
    fontFamily: "inherit",
  },
  err: {
    margin: 0, fontSize: 13, color: "#ff4d6d",
    background: "rgba(255,77,109,0.08)",
    border: "1px solid rgba(255,77,109,0.2)",
    padding: "10px 14px",
    borderRadius: 8,
  },
  switchText: {
    margin: "20px 0 0", textAlign: "center",
    fontSize: 13, color: "rgba(255,255,255,0.35)",
  },
  link: {
    color: "#6c63ff", fontWeight: 600, textDecoration: "none",
  },
};