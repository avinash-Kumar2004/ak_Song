import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const { showToast }     = useToast();
  const navigate          = useNavigate();
  const location          = useLocation();
  const toastShown        = useRef(false);

  useEffect(() => {
    // Reset only when path genuinely changes
    return () => { toastShown.current = false; };
  }, [location.pathname]);

  useEffect(() => {
    if (loading || user) return;          // not ready yet, or already logged in
    if (toastShown.current) return;       // already handled this visit

    toastShown.current = true;            // mark BEFORE async navigate
    showToast("Please log in to access this page 🔒", "error");
    navigate("/", { replace: true });
  }, [loading, user]);                    // ← intentionally omit navigate/showToast/pathname
                                          //   so StrictMode's double-invoke doesn't re-fire

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

  if (!user) return null;

  return children;
}