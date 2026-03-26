import { useState, useEffect } from "react";

const ACCENT = "#6c63ff";
const PINK   = "#ff4d6d";

// ── Animated background noise ──────────────────────────────────────────────
function NoiseOverlay() {
  return (
    <div style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
      backgroundRepeat: "repeat",
      opacity: 0.6,
    }} />
  );
}

// ── Floating vinyl disc ────────────────────────────────────────────────────
function VinylDisc({ size = 260, style = {} }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0d0d1a 60%, #111 100%)",
      border: "3px solid rgba(108,99,255,0.18)",
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative",
      animation: "spinDisc 18s linear infinite",
      boxShadow: `0 0 60px rgba(108,99,255,0.18), 0 24px 60px rgba(0,0,0,0.6)`,
      ...style,
    }}>
      {/* Grooves */}
      {[0.82, 0.68, 0.56, 0.45].map((r, i) => (
        <div key={i} style={{
          position: "absolute",
          width: `${r * 100}%`, height: `${r * 100}%`,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.04)",
        }} />
      ))}
      {/* Label */}
      <div style={{
        width: size * 0.3, height: size * 0.3, borderRadius: "50%",
        background: `linear-gradient(135deg, ${ACCENT}, ${PINK})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.12,
        boxShadow: `0 0 20px ${ACCENT}66`,
      }}>
        🎵
      </div>
      {/* Center hole */}
      <div style={{
        position: "absolute",
        width: size * 0.05, height: size * 0.05, borderRadius: "50%",
        background: "#090b11",
      }} />
    </div>
  );
}

// ── Waveform SVG decoration ────────────────────────────────────────────────
function WaveformBg() {
  const pts = Array.from({ length: 60 }, (_, i) => {
    const h = 20 + Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.3) * 60);
    return { x: i * 14, h };
  });
  return (
    <svg
      width="840" height="120"
      style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", opacity: 0.07 }}
    >
      {pts.map((p, i) => (
        <rect
          key={i}
          x={p.x} y={(120 - p.h) / 2}
          width={8} height={p.h}
          rx={4}
          fill={ACCENT}
        />
      ))}
    </svg>
  );
}

// ── Feature Card ───────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, delay = 0 }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14,
      padding: "20px 18px",
      animation: `fadeUp 0.6s ease ${delay}s both`,
      transition: "background 0.2s, border-color 0.2s",
    }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `${ACCENT}0f`;
        e.currentTarget.style.borderColor = `${ACCENT}33`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}

// ── Notify form ────────────────────────────────────────────────────────────
function NotifyForm() {
  const [email, setEmail]       = useState("");
  const [submitted, setSubmit]  = useState(false);
  const [shake, setShake]       = useState(false);

  const handleSubmit = () => {
    if (!email.includes("@")) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setSubmit(true);
  };

  if (submitted) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 8, animation: "fadeUp 0.5s ease both",
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: `linear-gradient(135deg, ${ACCENT}, ${PINK})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22,
          boxShadow: `0 8px 30px ${ACCENT}55`,
        }}>✓</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>You're on the list! 🎉</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.38)" }}>
          We'll notify you as soon as the feature launches.
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center",
      animation: shake ? "shakeForm 0.4s ease" : "none",
    }}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleSubmit()}
        placeholder="enter your email..."
        style={{
          background: "rgba(255,255,255,0.06)",
          border: `1px solid ${shake ? PINK : "rgba(255,255,255,0.12)"}`,
          borderRadius: 10,
          padding: "11px 16px",
          fontSize: 13,
          color: "#fff",
          outline: "none",
          width: 240,
          fontFamily: "inherit",
          transition: "border-color 0.2s",
        }}
        onFocus={e => e.target.style.borderColor = ACCENT}
        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
      />
      <button
        onClick={handleSubmit}
        style={{
          background: `linear-gradient(135deg, ${ACCENT}, ${PINK})`,
          border: "none", borderRadius: 10,
          padding: "11px 22px",
          fontSize: 13, fontWeight: 700, color: "#fff",
          cursor: "pointer",
          boxShadow: `0 6px 20px ${ACCENT}44`,
          transition: "transform 0.15s, box-shadow 0.15s",
          fontFamily: "inherit",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = `0 10px 28px ${ACCENT}66`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = `0 6px 20px ${ACCENT}44`;
        }}
      >
        Notify Me 🔔
      </button>
    </div>
  );
}

// ── Countdown ──────────────────────────────────────────────────────────────
function CountdownBadge() {
  const [dots, setDots] = useState(".");
  useEffect(() => {
    const iv = setInterval(() => setDots(d => d.length >= 3 ? "." : d + "."), 600);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      background: `${PINK}18`,
       marginTop:"20px",
      border: `1px solid ${PINK}33`,
      borderRadius: 99, padding: "6px 16px",
      fontSize: 12, fontWeight: 700, color: PINK,
      letterSpacing: "0.05em",
      
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: PINK,
        boxShadow: `0 0 8px ${PINK}`,
        animation: "pulse 1.4s ease infinite",
        display: "inline-block",
       
      }} />
      Coming Soon{dots}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function DownloadPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#090b11",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: "#fff",
      paddingBottom: 100,
      position: "relative",
      overflow: "hidden",
      py:"50px"
    }}>
      <NoiseOverlay />

      {/* Ambient glow blobs */}
      <div style={{
        position: "fixed", top: -120, right: -120, width: 400, height: 400,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${ACCENT}22 0%, transparent 70%)`,
        pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "fixed", bottom: -80, left: -80, width: 320, height: 320,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${PINK}18 0%, transparent 70%)`,
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center",
        padding: "52px 24px 40px",
        gap: 20,
      }}>
        <CountdownBadge />

        <VinylDisc size={220} style={{ margin: "10px 0" }} />

        <div style={{ animation: "fadeUp 0.7s ease 0.1s both" }}>
          <h1 style={{
            fontSize: "clamp(26px, 5vw, 40px)",
            fontWeight: 900,
            margin: "0 0 10px",
            background: `linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.55) 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1.15,
          }}>
            Download Feature
          </h1>
          <div style={{
            fontSize: 13, color: "rgba(255,255,255,0.4)",
            maxWidth: 380, lineHeight: 1.7, margin: "0 auto",
          }}>
            We're building the ability to listen to your songs offline.
            This service isn't available just yet — but it's coming soon! 🚀
          </div>
        </div>

        {/* Status pill */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 99, padding: "8px 18px",
          fontSize: 12, color: "rgba(255,255,255,0.5)",
          animation: "fadeUp 0.7s ease 0.2s both",
        }}>
          <span style={{ fontSize: 16 }}>🛠️</span>
          <span>Currently under development</span>
          <span style={{
            background: `${ACCENT}22`, color: ACCENT,
            borderRadius: 99, padding: "2px 10px", fontWeight: 700,
          }}>v2.0 planned</span>
        </div>
      </div>

      {/* ── What's Coming Section ─────────────────────────────────────────── */}
      <div style={{
        position: "relative", zIndex: 1,
        margin: "0 18px 28px",
        overflow: "hidden",
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700,
          color: "rgba(255,255,255,0.3)",
          textTransform: "uppercase", letterSpacing: "0.12em",
          marginBottom: 14, paddingLeft: 4,
          animation: "fadeUp 0.6s ease 0.25s both",
        }}>
          What you'll get when it launches
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 10,
          justifyItems: "center",
          maxWidth: 700,
          margin: "0 auto",
        }}>
          <FeatureCard
            icon="📥"
            title="Offline Download"
            desc="Download songs and listen without internet"
            delay={0.3}
          />
          <FeatureCard
            icon="🎵"
            title="High Quality Audio"
            desc="Download in 320kbps MP3 or lossless formats"
            delay={0.38}
          />
          <FeatureCard
            icon="📁"
            title="Playlist Export"
            desc="Download an entire playlist all at once"
            delay={0.46}
          />
          <FeatureCard
            icon="📱"
            title="Mobile Sync"
            desc="Downloaded songs available on the mobile app too"
            delay={0.54}
          />
          <FeatureCard
            icon="🔒"
            title="DRM Protection"
            desc="Secure downloads — only on your device"
            delay={0.62}
          />
          <FeatureCard
            icon="⚡"
            title="Fast Downloads"
            desc="Blazing fast download speed via CDN"
            delay={0.7}
          />
        </div>
      </div>

      {/* ── Divider with waveform ─────────────────────────────────────────── */}
      <div style={{
        position: "relative", height: 120,
        margin: "0 18px 28px",
        background: "rgba(255,255,255,0.015)",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.05)",
        overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1,
      }}>
        <WaveformBg />
        <div style={{
          position: "relative", zIndex: 2, textAlign: "center",
        }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>
            For now
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>
            Keep saving songs to your Liked Songs 💜
          </div>
        </div>
      </div>

      {/* ── Notify Section ───────────────────────────────────────────────── */}
      <div style={{
        position: "relative", zIndex: 1,
        margin: "0 18px 28px",
        background: `linear-gradient(135deg, ${ACCENT}0d, ${PINK}0d)`,
        border: `1px solid ${ACCENT}22`,
        borderRadius: 16,
        padding: "30px 24px",
        textAlign: "center",
        animation: "fadeUp 0.7s ease 0.8s both",
      }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>🔔</div>
        <h3 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 8px", color: "#fff" }}>
          Get notified at launch!
        </h3>
        <p style={{
          fontSize: 12, color: "rgba(255,255,255,0.38)",
          margin: "0 0 20px", lineHeight: 1.7,
        }}>
          Drop your email below — when the Download feature is ready,<br />
          you'll be the first to know.
        </p>
        <NotifyForm />
      </div>

      {/* ── Bottom disclaimer ─────────────────────────────────────────────── */}
      <div style={{
        position: "relative", zIndex: 1,
        textAlign: "center",
        padding: "0 24px",
        color: "rgba(255,255,255,0.18)",
        fontSize: 11,
        lineHeight: 1.8,
      }}>
        <span>🎵 SoundWave &nbsp;•&nbsp; Download feature — future plan &nbsp;•&nbsp; Currently unavailable</span>
      </div>

      {/* ── Global Styles ─────────────────────────────────────────────────── */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spinDisc {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }
        @keyframes shakeForm {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-8px); }
          40%     { transform: translateX(8px); }
          60%     { transform: translateX(-5px); }
          80%     { transform: translateX(5px); }
        }
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.25); }
      `}</style>
    </div>
  );
}