import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI } from "../api";
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

export default function ChangePasswordPage() {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const [form, setForm]     = useState({ currentPassword: "", newPassword: "" });
  const [show, setShow]     = useState({ current: false, new: false });
  const [loading, setLoading] = useState(false);
  const [err, setErr]       = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErr("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.currentPassword) return setErr("Enter your current password.");
    if (form.newPassword.length < 8) return setErr("New password must be at least 8 characters.");
    if (form.currentPassword === form.newPassword)
      return setErr("New password must be different from current password.");

    setLoading(true); setErr("");
    try {
      await userAPI.changePassword({
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
      });
      setSuccess(true);
      // Auto logout after password change so user re-authenticates
      setTimeout(async () => {
        await logout();
        navigate("/login");
      }, 2000);
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          ← Back
        </button>

        <h1 style={styles.title}>Change Password</h1>
        <p style={styles.sub}>You'll be logged out after changing your password.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Current Password */}
          <div style={styles.fieldWrap}>
            <label style={styles.label}>Current Password</label>
            <div style={styles.passWrap}>
              <input
                name="currentPassword" type={show.current ? "text" : "password"}
                value={form.currentPassword} onChange={handleChange}
                placeholder="Enter current password"
                style={{ ...styles.input, paddingRight: 44 }}
                autoComplete="current-password"
              />
              <button type="button" style={styles.eyeBtn}
                onClick={() => setShow((s) => ({ ...s, current: !s.current }))}>
                <EyeIcon open={show.current} />
              </button>
            </div>
          </div>

          {/* New Password */}
          <div style={styles.fieldWrap}>
            <label style={styles.label}>New Password</label>
            <div style={styles.passWrap}>
              <input
                name="newPassword" type={show.new ? "text" : "password"}
                value={form.newPassword} onChange={handleChange}
                placeholder="Min. 8 characters"
                style={{ ...styles.input, paddingRight: 44 }}
                autoComplete="new-password"
              />
              <button type="button" style={styles.eyeBtn}
                onClick={() => setShow((s) => ({ ...s, new: !s.new }))}>
                <EyeIcon open={show.new} />
              </button>
            </div>
            {/* Strength bar */}
            {form.newPassword && <StrengthBar password={form.newPassword} />}
          </div>

          {err     && <p style={styles.err}>{err}</p>}
          {success && (
            <p style={styles.success}>
              ✓ Password changed! Logging you out...
            </p>
          )}

          <button type="submit" style={styles.btn} disabled={loading || success}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

function StrengthBar({ password }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  const colors = ["", "#ff4d6d", "#ff9800", "#6c63ff", "#22c55e"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
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

const styles = {
  page: {
    minHeight: "100vh", background: "#080a10",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "100px 16px 40px", fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    width: "100%", maxWidth: 440,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 24, padding: "36px 32px",
    backdropFilter: "blur(20px)",
  },
  backBtn: {
    background: "none", border: "none",
    color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer",
    padding: 0, marginBottom: 20, fontFamily: "inherit",
  },
  title: { margin: 0, fontSize: 24, fontWeight: 800, color: "#fff" },
  sub: { margin: "6px 0 28px", fontSize: 13, color: "rgba(255,255,255,0.35)" },
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
    width: "100%", boxSizing: "border-box", fontFamily: "inherit",
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
    cursor: "pointer", fontFamily: "inherit", marginTop: 4,
  },
  err: {
    margin: 0, fontSize: 13, color: "#ff4d6d",
    background: "rgba(255,77,109,0.08)",
    border: "1px solid rgba(255,77,109,0.2)",
    padding: "10px 14px", borderRadius: 8,
  },
  success: {
    margin: 0, fontSize: 13, color: "#22c55e",
    background: "rgba(34,197,94,0.08)",
    border: "1px solid rgba(34,197,94,0.2)",
    padding: "10px 14px", borderRadius: 8,
  },
};