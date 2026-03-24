import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const { showToast }     = useToast();
  const navigate          = useNavigate();
  const location          = useLocation();
  const toastShown        = useRef(false); // prevent double toast in StrictMode

  useEffect(() => {
    // Only act once loading is done and user is NOT logged in
    if (!loading && !user) {
      if (!toastShown.current) {
        showToast("Please log in to access this page 🔒", "error");
        toastShown.current = true;
      }
      // Send them back to home, not to /login
      navigate("/", { replace: true });
    }
  }, [loading, user, navigate, showToast, location.pathname]);

  // ── Loading spinner ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0a0c12",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          width: 36,
          height: 36,
          border: "3px solid rgba(108,99,255,0.15)",
          borderTop: "3px solid #6c63ff",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not logged in — render nothing (navigate already called above)
  if (!user) return null;

  // ✅ Logged in — render the protected page
  return children;
}