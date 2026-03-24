import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* ── Toast Container ── */}
      <div style={{
        position: "fixed",
        top: 96,
        right: 16,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        pointerEvents: "none",
      }}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }) {
  const isError   = toast.type === "error";
  const isSuccess = toast.type === "success";
  const isInfo    = toast.type === "info";

  const bgColor = isError
    ? "rgba(255,77,109,0.12)"
    : isSuccess
    ? "rgba(34,197,94,0.12)"
    : "rgba(108,99,255,0.12)";

  const borderColor = isError
    ? "rgba(255,77,109,0.35)"
    : isSuccess
    ? "rgba(34,197,94,0.35)"
    : "rgba(108,99,255,0.35)";

  const textColor = isError ? "#ff4d6d" : isSuccess ? "#22c55e" : "#6c63ff";

  const icon = isError ? "🔒" : isSuccess ? "✓" : "ℹ";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        borderRadius: 12,
        background: bgColor,
        border: `1px solid ${borderColor}`,
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        minWidth: 260,
        maxWidth: 340,
        pointerEvents: "auto",
        animation: "toastIn 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(20px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0)    scale(1);    }
        }
      `}</style>

      <span style={{ fontSize: 16 }}>{icon}</span>

      <p style={{
        margin: 0, flex: 1,
        fontSize: 13, fontWeight: 600,
        color: textColor, lineHeight: 1.4,
      }}>
        {toast.message}
      </p>

      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: textColor, opacity: 0.6, fontSize: 16,
          padding: 0, lineHeight: 1, flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
};