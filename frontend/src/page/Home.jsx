import { useState, useRef, useEffect, useCallback } from "react";
import ALBUMS from "../data/albums";
import ARTISTS from "../data/artists";
import usePlayer from "../hooks/usePlayer";
import BHAKTI from "../data/bhakti";
import HARYANVI from "../data/Haryanvi";
import BHOJPURI from "../data/bhojpuri";
const ACCENT = "#6c63ff";
const PALETTE = [
  "#6c63ff",
  "#ff4d6d",
  "#1db954",
  "#00d4ff",
  "#ff6b35",
  "#f9c74f",
  "#a78bfa",
  "#34d399",
];
const GRAD_PAIRS = [
  ["#1a1a2e", "#e94560"],
  ["#0f3460", "#533483"],
  ["#2d1b69", "#11998e"],
  ["#8B0000", "#FF6B35"],
  ["#1b4332", "#40916c"],
  ["#4a1942", "#c94b4b"],
  ["#134e5e", "#71b280"],
  ["#2c3e50", "#fd746c"],
  ["#1a1a2e", "#6c63ff"],
  ["#0a3d62", "#0c2461"],
  ["#200122", "#6f0000"],
  ["#373b44", "#4286f4"],
];

function strGrad(str = "") {
  const h = [...str].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);
  return GRAD_PAIRS[Math.abs(h) % GRAD_PAIRS.length];
}

const LS = {
  get: (k, d) => {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : d;
    } catch {
      return d;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  },
};

function fmtDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Config ───────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── Upload via backend ───────────────────────────────────────────────────────
async function uploadToCloudinary(file, onProgress) {
  const formData = new FormData();
  formData.append("file", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/api/upload-song`);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress?.(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          url: data.url,
          publicId: data.publicId,
        });
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error")));
    xhr.send(formData);
  });
}

// ─── Delete via backend ───────────────────────────────────────────────────────
async function deleteFromCloudinary(publicId) {
  if (!publicId) return;
  try {
    await fetch(`${API_BASE}/api/upload-song/${encodeURIComponent(publicId)}`, {
      method: "DELETE",
    });
  } catch (err) {
    console.warn("[deleteFromCloudinary] failed:", err.message);
  }
}

// ─── CoverArt ─────────────────────────────────────────────────────────────────
function CoverArt({ src, alt = "", size, radius = 8, fullWidth = false }) {
  const [err, setErr] = useState(false);
  const [c1, c2] = strGrad(alt);
  const base = {
    borderRadius: radius,
    flexShrink: 0,
    objectFit: "cover",
    ...(fullWidth
      ? { width: "100%", aspectRatio: "1/1", display: "block" }
      : { width: size, height: size }),
  };
  if (!src || err) {
    return (
      <div
        style={{
          ...base,
          background: `linear-gradient(135deg,${c1},${c2})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: (size || 64) * 0.34, opacity: 0.7 }}>🎵</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErr(true)}
      style={base}
      loading="lazy"
    />
  );
}

function ArtistAvatar({ src, alt = "", size = 80 }) {
  const [err, setErr] = useState(false);
  const [c1, c2] = strGrad(alt);
  const base = {
    width: size,
    height: size,
    borderRadius: "50%",
    objectFit: "cover",
    flexShrink: 0,
  };
  if (!src || err) {
    return (
      <div
        style={{
          ...base,
          background: `linear-gradient(135deg,${c1},${c2})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: 800,
          fontSize: size * 0.36,
        }}
      >
        {alt.slice(0, 2).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErr(true)}
      style={base}
      loading="lazy"
    />
  );
}

function EqBars({ color = ACCENT, size = 14 }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 2.5,
        alignItems: "flex-end",
        height: size,
      }}
    >
      {[1, 0.45, 0.75, 0.35, 0.6].map((h, i) => (
        <div
          key={i}
          style={{
            width: 2.5,
            borderRadius: 2,
            background: color,
            height: `${h * 100}%`,
            animation: `eq${i} ${0.6 + i * 0.13}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

// ─── UploadProgressToast ──────────────────────────────────────────────────────
function UploadProgressToast({ uploads }) {
  if (!uploads.length) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 100,
        right: 16,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {uploads.map((u) => (
        <div
          key={u.id}
          style={{
            background: "#13151f",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
            padding: "10px 14px",
            minWidth: 220,
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 6,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            ☁️ {u.name}
          </div>
          {u.error ? (
            <div style={{ fontSize: 11, color: "#ff4d6d" }}>
              Upload failed — local pe bajega
            </div>
          ) : u.progress < 100 ? (
            <>
              <div
                style={{
                  height: 4,
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 2,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${u.progress}%`,
                    background: ACCENT,
                    borderRadius: 2,
                    transition: "width 0.2s",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.4)",
                  marginTop: 4,
                }}
              >
                {u.progress}% uploading...
              </div>
            </>
          ) : (
            <div style={{ fontSize: 11, color: "#1db954" }}>
              ✓ Song Upload on DB
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── PlayerBar ────────────────────────────────────────────────────────────────
function PlayerBar({ player, favorites, onToggleFav }) {
  const {
    song,
    album,
    playing,
    progress,
    volume,
    togglePlay,
    seek,
    setVolume,
    close,
    getDurationSecs,
    loop,
    setLoop,
    playNext,
  } = player;
  const [shuffle, setShuffle] = useState(false);
  const isFav = favorites.some((f) => f.id === song?.id);
  const totalSecs = getDurationSecs(song);
  const elapsed = Math.floor((progress / 100) * totalSecs);
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const seekRelative = (delta) => {
    if (!totalSecs) return;
    const newSec = Math.max(0, Math.min(totalSecs, elapsed + delta));
    seek((newSec / totalSecs) * 100);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 900,
        background: "rgba(7,8,13,0.98)",
        backdropFilter: "blur(28px)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Top progress click bar */}
      <div
        style={{
          height: 3,
          background: "rgba(255,255,255,0.06)",
          cursor: "pointer",
        }}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          seek(((e.clientX - r.left) / r.width) * 100);
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: `linear-gradient(90deg,${ACCENT},#ff4d6d)`,
            boxShadow: `0 0 12px ${ACCENT}88`,
            transition: "width 0.12s linear",
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr minmax(240px, 380px) 1fr",
          alignItems: "center",
          padding: "8px 12px 10px",
          gap: 8,
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        {/* LEFT */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}
        >
          <div style={{ position: "relative", flexShrink: 0 }}>
            <CoverArt
              src={album?.cover}
              alt={song?.title || ""}
              size={42}
              radius={7}
            />
            {playing && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 7,
                  background: "rgba(0,0,0,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <EqBars size={11} />
              </div>
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#fff",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {song?.title}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.4)",
                marginTop: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {song?.artists || song?.artist}
            </div>
          </div>
          <button
            onClick={() => onToggleFav(song, album)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 16,
              flexShrink: 0,
              color: isFav ? "#ff4d6d" : "rgba(255,255,255,0.22)",
              transform: isFav ? "scale(1.2)" : "scale(1)",
              transition: "all 0.18s",
            }}
          >
            {isFav ? "♥" : "♡"}
          </button>
        </div>

        {/* CENTER */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 5,
            minWidth: 0,
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <IBtn
              icon="⇄"
              active={shuffle}
              onClick={() => setShuffle((v) => !v)}
            />
            <SkipBtn label="-5s" onClick={() => seekRelative(-5)} />
            <IBtn icon="⏮" size={16} onClick={() => seek(0)} />
            <button
              onClick={togglePlay}
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                border: "none",
                background: "#fff",
                cursor: "pointer",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 18px rgba(255,255,255,0.2)",
                color: "#000",
                flexShrink: 0,
              }}
            >
              {playing ? "⏸" : "▶"}
            </button>
            <IBtn icon="⏭" size={16} onClick={playNext} />
            <SkipBtn label="+5s" onClick={() => seekRelative(5)} />
            <IBtn
              icon="↺"
              active={loop}
              onClick={() => setLoop((v) => !v)}
              title={loop ? "Loop ON" : "Loop OFF"}
            />
          </div>

          {/* SEEK BAR */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              width: "100%",
              minWidth: 0,
            }}
          >
            <span
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.3)",
                minWidth: 30,
                flexShrink: 0,
                textAlign: "right",
              }}
            >
              {fmt(elapsed)}
            </span>
            <div
              style={{
                flex: "1 1 0",
                minWidth: 0,
                height: 4,
                background: "rgba(255,255,255,0.09)",
                borderRadius: 2,
                cursor: "pointer",
                position: "relative",
              }}
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                seek(((e.clientX - r.left) / r.width) * 100);
              }}
              onMouseMove={(e) => {
                if (e.buttons !== 1) return;
                const r = e.currentTarget.getBoundingClientRect();
                seek(
                  Math.max(
                    0,
                    Math.min(100, ((e.clientX - r.left) / r.width) * 100),
                  ),
                );
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: ACCENT,
                  borderRadius: 2,
                  transition: "width 0.12s linear",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    right: -5,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#fff",
                    boxShadow: `0 0 6px ${ACCENT}`,
                  }}
                />
              </div>
            </div>
            <span
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.3)",
                minWidth: 30,
                flexShrink: 0,
              }}
            >
              {song?.duration || "—"}
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            justifyContent: "flex-end",
          }}
        >
          <span
            className="hidden-mobile-vol"
            style={{ fontSize: 13, color: "rgba(255,255,255,0.28)" }}
          >
            {volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            style={{ width: 70, accentColor: ACCENT, cursor: "pointer" }}
            className="hidden-mobile-vol"
          />
          <button
            onClick={close}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.09)",
              color: "rgba(255,255,255,0.38)",
              cursor: "pointer",
              width: 27,
              height: 27,
              borderRadius: "50%",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

function SkipBtn({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "2px 3px",
        fontSize: 10,
        color: "rgba(255,255,255,0.45)",
        fontWeight: 700,
        lineHeight: 1,
        borderRadius: 4,
        flexShrink: 0,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
      onMouseLeave={(e) =>
        (e.currentTarget.style.color = "rgba(255,255,255,0.45)")
      }
    >
      {label}
    </button>
  );
}

function IBtn({ icon, active, onClick, size = 14, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 4,
        fontSize: size,
        color: active ? ACCENT : "rgba(255,255,255,0.35)",
        transition: "color 0.2s",
      }}
    >
      {icon}
    </button>
  );
}

function BackBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        marginBottom: 20,
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#fff",
        borderRadius: 100,
        padding: "7px 18px",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600,
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(255,255,255,0.12)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = "rgba(255,255,255,0.07)")
      }
    >
      ← Back
    </button>
  );
}

// ─── SongRow ──────────────────────────────────────────────────────────────────
function SongRow({
  song,
  idx,
  active,
  playing,
  onPlay,
  togglePlay,
  isFav,
  onFav,
  showCover,
  coverSrc,
  likedAt,
}) {
  return (
    <div
      onClick={() => (active ? togglePlay?.() : onPlay())}
      style={{
        display: "grid",
        gridTemplateColumns: showCover ? "36px 56px 1fr 80px" : "36px 1fr 80px",
        padding: "11px 16px",
        alignItems: "center",
        cursor: "pointer",
        background: active ? `${ACCENT}14` : "transparent",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        transition: "background 0.15s",
        gap: 12,
      }}
      onMouseEnter={(e) => {
        if (!active)
          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {active && playing ? (
          <EqBars color={ACCENT} size={13} />
        ) : (
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.28)" }}>
            {idx + 1}
          </span>
        )}
      </div>
      {showCover && (
        <CoverArt src={coverSrc} alt={song.title} size={40} radius={6} />
      )}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: active ? ACCENT : "#fff",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {song.title}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.38)",
            marginTop: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {song.artists || song.artist}
          {likedAt && (
            <span
              style={{
                marginLeft: 8,
                color: "rgba(255,255,255,0.2)",
                fontSize: 10,
              }}
            >
              Added {fmtDate(likedAt)}
            </span>
          )}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFav();
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 15,
            padding: 2,
            color: isFav ? "#ff4d6d" : "rgba(255,255,255,0.2)",
            transition: "all 0.18s",
            transform: isFav ? "scale(1.2)" : "scale(1)",
          }}
        >
          {isFav ? "♥" : "♡"}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            active ? togglePlay?.() : onPlay();
          }}
          style={{
            background: active ? ACCENT : "rgba(255,255,255,0.08)",
            border: "none",
            color: "#fff",
            borderRadius: "50%",
            width: 28,
            height: 28,
            cursor: "pointer",
            fontSize: 11,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {active && playing ? "⏸" : "▶"}
        </button>
        <span
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.28)",
            minWidth: 32,
            textAlign: "right",
          }}
        >
          {song.duration}
        </span>
      </div>
    </div>
  );
}

// ─── DeleteConfirmDialog ──────────────────────────────────────────────────────
function DeleteConfirmDialog({ song, onConfirm, onCancel }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        background: "rgba(0,0,0,0.82)",
        backdropFilter: "blur(16px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        style={{
          background: "#13151f",
          borderRadius: 20,
          border: "1px solid rgba(255,77,77,0.3)",
          padding: "28px 28px 22px",
          width: 360,
          maxWidth: "92vw",
          boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
          animation: "fadeUp 0.22s ease",
        }}
      >
        <div style={{ fontSize: 40, textAlign: "center", marginBottom: 12 }}>
          🗑️
        </div>
        <div
          style={{
            fontSize: 17,
            fontWeight: 800,
            color: "#fff",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Song delete karo?
        </div>
        <div
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.45)",
            textAlign: "center",
            marginBottom: 24,
            lineHeight: 1.6,
          }}
        >
          <span style={{ color: "#fff", fontWeight: 600 }}>
            "{song?.title}"
          </span>{" "}
          ko library se hata doge?
          <br />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.28)" }}>
            Cloudinary se bhi remove hoga
          </span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "11px",
              borderRadius: 100,
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "11px",
              borderRadius: 100,
              border: "none",
              background: "linear-gradient(135deg,#ff4d4d,#ff6b35)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 18px rgba(255,77,77,0.45)",
            }}
          >
            Haan, Delete karo
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── UploadedSongCard ─────────────────────────────────────────────────────────
function UploadedSongCard({
  song,
  active,
  playing,
  onPlay,
  togglePlay,
  isFav,
  onFav,
  onOpenDetail,
}) {
  const [c1, c2] = strGrad(song.title);
  return (
    <div
      style={{
        background: "#13151f",
        borderRadius: 14,
        border: `1px solid ${active ? ACCENT + "55" : "rgba(255,255,255,0.07)"}`,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        transition: "border-color 0.2s,transform 0.2s",
        cursor: "pointer",
        position: "relative",
      }}
      className="song-card"
      onClick={onOpenDetail}
    >
      <div
        style={{
          position: "relative",
          borderRadius: 10,
          overflow: "hidden",
          aspectRatio: "1/1",
          background: `linear-gradient(135deg,${c1},${c2})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 36, opacity: 0.7 }}>🎵</span>
        {active && playing && (
          <div style={{ position: "absolute", bottom: 8, left: 8 }}>
            <EqBars size={14} />
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            active ? togglePlay?.() : onPlay();
          }}
          style={{
            position: "absolute",
            bottom: 8,
            right: 8,
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: ACCENT,
            border: "none",
            color: "#fff",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: `0 4px 14px ${ACCENT}66`,
            opacity: active ? 1 : 0,
            transition: "opacity 0.2s",
          }}
          className="play-btn-ov"
        >
          {active && playing ? "⏸" : "▶"}
        </button>
      </div>
      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginBottom: 3,
          }}
        >
          {song.title}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.38)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {song.artists}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFav();
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 16,
            color: isFav ? "#ff4d6d" : "rgba(255,255,255,0.25)",
            transition: "all 0.18s",
            transform: isFav ? "scale(1.2)" : "scale(1)",
          }}
        >
          {isFav ? "♥" : "♡"}
        </button>
        {song.cloudinaryUrl ? (
          <span style={{ fontSize: 10, color: "#1db954" }}>☁️ Saved</span>
        ) : (
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
            Local
          </span>
        )}
      </div>
    </div>
  );
}

// ─── UploadedSongDetail ───────────────────────────────────────────────────────
function UploadedSongDetail({
  song,
  player,
  favorites,
  onToggleFav,
  onBack,
  blobUrls,
  onDelete,
}) {
  const { song: curSong, playing, play, togglePlay } = player;
  const active = curSong?.id === song.id;
  const isFav = favorites.some((f) => f.id === song.id);
  const [showDelete, setShowDelete] = useState(false);
  const [c1, c2] = strGrad(song.title);

  const playUrl = song.cloudinaryUrl || blobUrls[song.id];

  return (
    <div style={{ animation: "fadeUp 0.3s ease" }}>
      <BackBtn onClick={onBack} />

      <div
        style={{
          background: `linear-gradient(180deg,rgba(108,99,255,0.18),transparent)`,
          borderRadius: 16,
          padding: "26px 22px 20px",
          marginBottom: 10,
          display: "flex",
          gap: 22,
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        {/* Cover */}
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: 12,
            flexShrink: 0,
            background: `linear-gradient(135deg,${c1},${c2})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
            position: "relative",
          }}
        >
          🎵
          {active && playing && (
            <div style={{ position: "absolute", bottom: 10, left: 10 }}>
              <EqBars size={16} />
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "rgba(255,255,255,0.45)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 7,
            }}
          >
            Uploaded Song
          </div>
          <h2
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: "#fff",
              margin: "0 0 6px",
              lineHeight: 1.1,
            }}
          >
            {song.title}
          </h2>
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.5)",
              marginBottom: 4,
            }}
          >
            {song.artists}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.3)",
              marginBottom: 12,
            }}
          >
            Uploaded {fmtDate(song.uploadedAt)}
            {song.cloudinaryUrl && (
              <span style={{ marginLeft: 8, color: "#1db954" }}>
                ☁️ Cloudinary pe saved
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => {
                if (!playUrl) return;
                active ? togglePlay() : play({ ...song, url: playUrl }, null);
              }}
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "none",
                background: playUrl ? ACCENT : "rgba(255,255,255,0.15)",
                cursor: playUrl ? "pointer" : "not-allowed",
                fontSize: 18,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: playUrl ? `0 8px 24px ${ACCENT}55` : "none",
              }}
            >
              {active && playing ? "⏸" : "▶"}
            </button>

            <button
              onClick={() => onToggleFav(song, null)}
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                border: `2px solid ${isFav ? "#ff4d6d" : "rgba(255,255,255,0.2)"}`,
                background: isFav ? "rgba(255,77,109,0.15)" : "transparent",
                cursor: "pointer",
                fontSize: 18,
                color: isFav ? "#ff4d6d" : "rgba(255,255,255,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
              {isFav ? "♥" : "♡"}
            </button>

            <button
              onClick={() => setShowDelete(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "10px 18px",
                borderRadius: 100,
                border: "1px solid rgba(255,77,77,0.4)",
                background: "rgba(255,77,77,0.1)",
                color: "#ff4d6d",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,77,77,0.2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,77,77,0.1)")
              }
            >
              🗑 Delete Song
            </button>
          </div>

          {!playUrl && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#ff4d6d" }}>
              ⚠️ Audio unavailable — app restart ke baad blob expire ho jaata
              hai
            </div>
          )}
        </div>
      </div>

      {/* Song info card */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.06)",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: "#fff",
            marginBottom: 4,
          }}
        >
          Song Details
        </div>
        {[
          ["Title", song.title],
          ["Artist", song.artists],
          ["Duration", song.duration || "—"],
          ["Uploaded", fmtDate(song.uploadedAt)],
          [
            "Storage",
            song.cloudinaryUrl ? "Cloudinary (cloud)" : "Local blob only",
          ],
          ...(song.cloudinaryUrl
            ? [["Cloudinary URL", song.cloudinaryUrl]]
            : []),
        ].map(([label, value]) => (
          <div
            key={label}
            style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
          >
            <span
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.35)",
                minWidth: 90,
                flexShrink: 0,
              }}
            >
              {label}
            </span>
            <span
              style={{ fontSize: 12, color: "#fff", wordBreak: "break-all" }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {showDelete && (
        <DeleteConfirmDialog
          song={song}
          onConfirm={() => {
            setShowDelete(false);
            onDelete(song);
            onBack();
          }}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}

// ─── AlbumDetail ──────────────────────────────────────────────────────────────
function AlbumDetail({ album, player, favorites, onToggleFav, onBack }) {
  const { song: curSong, playing, play, togglePlay } = player;
  const [c1] = strGrad(album.title);
  return (
    <div style={{ animation: "fadeUp 0.3s ease" }}>
      <BackBtn onClick={onBack} />
      <div
        style={{
          background: `linear-gradient(180deg,${album.color || c1}bb 0%,transparent 100%)`,
          borderRadius: 16,
          padding: "26px 22px 20px",
          marginBottom: 10,
          display: "flex",
          gap: 22,
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <CoverArt src={album.cover} alt={album.title} size={150} radius={12} />
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "rgba(255,255,255,0.45)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 7,
            }}
          >
            Album
          </div>
          <h2
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: "#fff",
              margin: "0 0 6px",
              lineHeight: 1.1,
            }}
          >
            {album.title}
          </h2>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
            {album.artist} · {album.releaseDate} · {album.songs.length} songs
          </div>
          <div
            style={{
              display: "flex",
              gap: 14,
              marginTop: 16,
              alignItems: "center",
            }}
          >
            <button
              onClick={() => play(album.songs[0], album)}
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "none",
                background: ACCENT,
                cursor: "pointer",
                fontSize: 18,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 8px 24px ${ACCENT}55`,
              }}
            >
              ▶
            </button>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              {album.label}
            </span>
          </div>
        </div>
      </div>
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}
      >
        {album.songs.map((song, i) => (
          <SongRow
            key={song.id}
            song={song}
            idx={i}
            active={curSong?.id === song.id}
            playing={playing}
            onPlay={() => play(song, album)}
            togglePlay={togglePlay}
            isFav={favorites.some((f) => f.id === song.id)}
            onFav={() => onToggleFav(song, album)}
          />
        ))}
      </div>
      <div
        style={{
          padding: "12px 4px 4px",
          fontSize: 11,
          color: "rgba(255,255,255,0.2)",
        }}
      >
        {album.releaseDate} · © {album.label}
      </div>
    </div>
  );
}

// ─── ArtistDetail ─────────────────────────────────────────────────────────────
function ArtistDetail({ artist, player, favorites, onToggleFav, onBack }) {
  const { song: curSong, playing, play, togglePlay } = player;
  return (
    <div style={{ animation: "fadeUp 0.3s ease" }}>
      <BackBtn onClick={onBack} />
      <div
        style={{
          borderRadius: 16,
          padding: "26px 22px 20px",
          marginBottom: 10,
          background:
            "linear-gradient(180deg,rgba(108,99,255,0.16),transparent)",
          display: "flex",
          gap: 22,
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <ArtistAvatar src={artist.img} alt={artist.name} size={150} />
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "rgba(255,255,255,0.45)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 7,
            }}
          >
            Artist
          </div>
          <h2
            style={{
              fontSize: 30,
              fontWeight: 900,
              color: "#fff",
              margin: "0 0 5px",
            }}
          >
            {artist.name}
          </h2>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
            {artist.genre} · {artist.followers} followers
          </div>
          {artist.bio && (
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.3)",
                marginTop: 4,
              }}
            >
              {artist.bio}
            </div>
          )}
          <button
            onClick={() => play(artist.songs[0], { songs: artist.songs })}
            style={{
              marginTop: 16,
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "none",
              background: ACCENT,
              cursor: "pointer",
              fontSize: 18,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 8px 24px ${ACCENT}55`,
            }}
          >
            ▶
          </button>
        </div>
      </div>
      <h3
        style={{
          fontSize: 15,
          fontWeight: 800,
          color: "#fff",
          padding: "4px 4px 12px",
        }}
      >
        Popular
      </h3>
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}
      >
        {artist.songs.map((song, i) => (
          <SongRow
            key={song.id}
            song={song}
            idx={i}
            active={curSong?.id === song.id}
            playing={playing}
            onPlay={() => play(song, { songs: artist.songs })}
            togglePlay={togglePlay}
            isFav={favorites.some((f) => f.id === song.id)}
            onFav={() => onToggleFav(song, null)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── LikedSongsPage ───────────────────────────────────────────────────────────
function LikedSongsPage({ player, favorites, onToggleFav, onUnfav, onBack }) {
  const { song: curSong, playing, play, togglePlay } = player;
  return (
    <div style={{ animation: "fadeUp 0.3s ease" }}>
      <BackBtn onClick={onBack} />
      <div
        style={{
          background:
            "linear-gradient(180deg,rgba(255,77,109,0.18),transparent)",
          borderRadius: 16,
          padding: "26px 22px 20px",
          marginBottom: 10,
          display: "flex",
          gap: 22,
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: 12,
            flexShrink: 0,
            background: "linear-gradient(135deg,#ff4d6d,#6c63ff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
          }}
        >
          ♥
        </div>
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "rgba(255,255,255,0.45)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 7,
            }}
          >
            Playlist
          </div>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: "#fff",
              margin: "0 0 6px",
            }}
          >
            Liked Songs
          </h2>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
            {favorites.length} songs
          </div>
          {favorites.length > 0 && (
            <button
              onClick={() => play(favorites[0], { songs: favorites })}
              style={{
                marginTop: 16,
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "none",
                background: ACCENT,
                cursor: "pointer",
                fontSize: 18,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 8px 24px ${ACCENT}55`,
              }}
            >
              ▶
            </button>
          )}
        </div>
      </div>
      {favorites.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "rgba(255,255,255,0.26)",
            fontSize: 14,
          }}
        >
          <div style={{ fontSize: 44, marginBottom: 12 }}>🎵</div>
          Koi liked song nahi abhi
          <br />
          <span style={{ fontSize: 12 }}>
            Kisi bhi song ke paas ♡ click karo
          </span>
        </div>
      ) : (
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.06)",
            overflow: "hidden",
          }}
        >
          {favorites.map((song, i) => (
            <SongRow
              key={song.id}
              song={song}
              idx={i}
              active={curSong?.id === song.id}
              playing={playing}
              onPlay={() => play(song, { songs: favorites })}
              togglePlay={togglePlay}
              isFav={true}
              onFav={() => onUnfav(song)}
              showCover={true}
              coverSrc={song.albumCover}
              likedAt={song.likedAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PlaylistDetail ───────────────────────────────────────────────────────────
function PlaylistDetail({
  playlist,
  player,
  favorites,
  onToggleFav,
  onBack,
  blobUrls,
}) {
  const { song: curSong, playing, play, togglePlay } = player;
  const [c1, c2] = strGrad(playlist.title);
  return (
    <div style={{ animation: "fadeUp 0.3s ease" }}>
      <BackBtn onClick={onBack} />
      <div
        style={{
          background: `linear-gradient(180deg,${playlist.color}22 0%,transparent 100%)`,
          borderRadius: 16,
          padding: "26px 22px 20px",
          marginBottom: 10,
          display: "flex",
          gap: 22,
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: 12,
            flexShrink: 0,
            background: `linear-gradient(135deg,${c1},${c2})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
          }}
        >
          🎵
        </div>
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "rgba(255,255,255,0.45)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 7,
            }}
          >
            Playlist
          </div>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: "#fff",
              margin: "0 0 6px",
            }}
          >
            {playlist.title}
          </h2>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
            {playlist.songs?.length || 0} songs
          </div>
          {playlist.songs?.length > 0 && (
            <button
              onClick={() => {
                const s = playlist.songs[0];
                play(
                  {
                    ...s,
                    url: blobUrls[s.id] || s.url || s.cloudinaryUrl || s.file,
                  },
                  { songs: playlist.songs },
                );
              }}
              style={{
                marginTop: 16,
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "none",
                background: playlist.color || ACCENT,
                cursor: "pointer",
                fontSize: 18,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ▶
            </button>
          )}
        </div>
      </div>
      {!playlist.songs?.length ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "rgba(255,255,255,0.26)",
            fontSize: 14,
          }}
        >
          <div style={{ fontSize: 44, marginBottom: 12 }}>📂</div>Is playlist
          mein koi song nahi
        </div>
      ) : (
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.06)",
            overflow: "hidden",
          }}
        >
          {playlist.songs.map((song, i) => {
            const url =
              blobUrls[song.id] || song.cloudinaryUrl || song.url || song.file;
            return (
              <SongRow
                key={song.id}
                song={song}
                idx={i}
                active={curSong?.id === song.id}
                playing={playing}
                onPlay={() => play({ ...song, url }, { songs: playlist.songs })}
                togglePlay={togglePlay}
                isFav={favorites.some((f) => f.id === song.id)}
                onFav={() => onToggleFav(song, null)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── UploadPlaylistDialog ─────────────────────────────────────────────────────
function UploadPlaylistDialog({ files, playlists, onConfirm, onCancel }) {
  const [selected, setSelected] = useState("none");
  const [newName, setNewName] = useState("");
  const handleConfirm = () => {
    if (selected === "none") {
      onConfirm(null);
      return;
    }
    if (selected === "new") {
      if (!newName.trim()) return;
      onConfirm("new", newName.trim());
      return;
    }
    onConfirm(selected);
  };
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1100,
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(14px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        style={{
          background: "#13151f",
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.1)",
          padding: 28,
          width: 380,
          maxWidth: "92vw",
          animation: "fadeUp 0.22s ease",
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: "#fff",
            marginBottom: 6,
          }}
        >
          Song kahan add karein?
        </div>
        <div
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.38)",
            marginBottom: 20,
          }}
        >
          {files.length} song{files.length > 1 ? "s" : ""} upload ho rahi hai
        </div>
        {[
          {
            id: "none",
            icon: "🎵",
            title: "Kisi playlist mein nahi",
            sub: "Sirf Your Songs mein save hoga",
          },
        ].map((opt) => (
          <div
            key={opt.id}
            onClick={() => setSelected(opt.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              borderRadius: 12,
              marginBottom: 8,
              cursor: "pointer",
              border: `1.5px solid ${selected === opt.id ? ACCENT : "rgba(255,255,255,0.08)"}`,
              background:
                selected === opt.id ? `${ACCENT}12` : "rgba(255,255,255,0.03)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              {opt.icon}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                {opt.title}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>
                {opt.sub}
              </div>
            </div>
            {selected === opt.id && (
              <div
                style={{
                  marginLeft: "auto",
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: ACCENT,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  color: "#fff",
                }}
              >
                ✓
              </div>
            )}
          </div>
        ))}
        {playlists.map((pl) => (
          <div
            key={pl.id}
            onClick={() => setSelected(pl.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              borderRadius: 12,
              marginBottom: 8,
              cursor: "pointer",
              border: `1.5px solid ${selected === pl.id ? pl.color : "rgba(255,255,255,0.08)"}`,
              background:
                selected === pl.id ? `${pl.color}14` : "rgba(255,255,255,0.03)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `${pl.color}22`,
                border: `1px solid ${pl.color}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              🎵
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#fff",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {pl.title}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>
                {pl.songs?.length || 0} songs
              </div>
            </div>
            {selected === pl.id && (
              <div
                style={{
                  marginLeft: "auto",
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: pl.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                ✓
              </div>
            )}
          </div>
        ))}
        <div
          onClick={() => setSelected("new")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 14px",
            borderRadius: 12,
            marginBottom: 8,
            cursor: "pointer",
            border: `1.5px solid ${selected === "new" ? ACCENT : "rgba(255,255,255,0.08)"}`,
            background:
              selected === "new" ? `${ACCENT}12` : "rgba(255,255,255,0.03)",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: `${ACCENT}22`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              color: ACCENT,
              fontWeight: 800,
            }}
          >
            +
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
            Nayi playlist banao
          </div>
          {selected === "new" && (
            <div
              style={{
                marginLeft: "auto",
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: ACCENT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                color: "#fff",
              }}
            >
              ✓
            </div>
          )}
        </div>
        {selected === "new" && (
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Playlist ka naam..."
            autoFocus
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 10,
              border: `1.5px solid ${newName ? ACCENT : "rgba(255,255,255,0.1)"}`,
              background: "rgba(255,255,255,0.05)",
              color: "#fff",
              fontSize: 13,
              outline: "none",
              marginBottom: 12,
              boxSizing: "border-box",
            }}
          />
        )}
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            marginTop: 6,
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "9px 20px",
              borderRadius: 100,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: "9px 24px",
              borderRadius: 100,
              border: "none",
              background: ACCENT,
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: `0 4px 16px ${ACCENT}44`,
            }}
          >
            {selected === "new" ? "Banao & Add karo" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SidebarContents ──────────────────────────────────────────────────────────
function SidebarContents({
  playlists,
  favorites,
  uploadCount,
  onLiked,
  onNewPl,
  onSelectPlaylist,
  activePlaylistId,
  fileRef,
  onUpload,
}) {
  return (
    <>
      <div
        onClick={onLiked}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          background: "rgba(255,77,109,0.09)",
          border: "1px solid rgba(255,77,109,0.17)",
          borderRadius: 12,
          cursor: "pointer",
          flexShrink: 0,
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "rgba(255,77,109,0.17)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "rgba(255,77,109,0.09)")
        }
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 8,
            flexShrink: 0,
            background: "linear-gradient(135deg,#ff4d6d,#6c63ff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          ♥
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
            Liked Songs
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.33)",
              marginTop: 1,
            }}
          >
            {favorites.length} songs
          </div>
        </div>
      </div>

      <div
        style={{
          background: "#11131c",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.07)",
          overflow: "hidden",
          flex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 14px 10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 15 }}>📚</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>
              Your Library
            </span>
          </div>
          <button
            onClick={onNewPl}
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              border: "none",
              background: `${ACCENT}25`,
              color: ACCENT,
              cursor: "pointer",
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            +
          </button>
        </div>
        {playlists.length === 0 ? (
          <div style={{ padding: "18px 14px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📂</div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.3)",
                lineHeight: 1.5,
              }}
            >
              Koi playlist nahi
              <br />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
                + click karke banao
              </span>
            </div>
          </div>
        ) : (
          playlists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => onSelectPlaylist(pl)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 14px",
                borderTop: "1px solid rgba(255,255,255,0.04)",
                cursor: "pointer",
                background:
                  activePlaylistId === pl.id ? `${pl.color}12` : "transparent",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background =
                  activePlaylistId === pl.id
                    ? `${pl.color}12`
                    : "rgba(255,255,255,0.04)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background =
                  activePlaylistId === pl.id ? `${pl.color}12` : "transparent")
              }
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  flexShrink: 0,
                  background: `${pl.color}1e`,
                  border: `1px solid ${pl.color}33`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                }}
              >
                🎵
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: activePlaylistId === pl.id ? pl.color : "#fff",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {pl.title}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.3)",
                    marginTop: 1,
                  }}
                >
                  Playlist · {pl.songs?.length || 0} songs
                </div>
              </div>
            </div>
          ))
        )}
        {playlists.length > 0 && (
          <div
            onClick={onNewPl}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderTop: "1px solid rgba(255,255,255,0.04)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.04)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                flexShrink: 0,
                background: `${ACCENT}14`,
                border: `1px dashed ${ACCENT}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                color: ACCENT,
              }}
            >
              +
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "rgba(255,255,255,0.4)",
              }}
            >
              Add more playlist
            </div>
          </div>
        )}
      </div>

      {/* Upload */}
      <div
        style={{
          background: "#11131c",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.07)",
          padding: 14,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 3,
          }}
        >
          Upload Song
        </div>
        <div
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.32)",
            marginBottom: 11,
            lineHeight: 1.5,
          }}
        >
          MP3 daal — Cloudinary pe save hoga
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="audio/*"
          multiple
          onChange={onUpload}
          style={{ display: "none" }}
        />
        <button
          onClick={() => fileRef.current?.click()}
          style={{
            width: "100%",
            padding: "9px",
            borderRadius: 100,
            background: `${ACCENT}14`,
            border: `1px solid ${ACCENT}36`,
            color: ACCENT,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
          }}
        >
          ⬆ Upload Audio
        </button>
        {uploadCount > 0 && (
          <div
            style={{
              marginTop: 8,
              fontSize: 10,
              color: "rgba(255,255,255,0.28)",
              textAlign: "center",
            }}
          >
            {uploadCount} song{uploadCount > 1 ? "s" : ""} in library ✓
          </div>
        )}
      </div>
    </>
  );
}

// ─── MobileSidebarDrawer ──────────────────────────────────────────────────────
function MobileSidebarDrawer({ open, onClose, children }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 700,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(6px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.28s ease",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 750,
          width: 280,
          background: "#0e1017",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          padding: "72px 8px 16px",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          overflowY: "auto",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 18,
            right: 14,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.5)",
            width: 30,
            height: 30,
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>
        {children}
      </div>
    </>
  );
}

function SectionHead({ title }) {
  return (
    <h2
      style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 14 }}
    >
      {title}
    </h2>
  );
}

function GlobalStyles() {
  return (
    <style>{`
      @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      ${[0, 1, 2, 3, 4].map((i) => `@keyframes eq${i}{from{transform:scaleY(0.2)}to{transform:scaleY(1)}}`).join("")}
      *{box-sizing:border-box;margin:0;padding:0;}
      ::-webkit-scrollbar{width:4px;height:4px}
      ::-webkit-scrollbar-track{background:transparent}
      ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.09);border-radius:4px}
      .hide-scroll::-webkit-scrollbar{height:0;display:none}
      .hide-scroll{scrollbar-width:none;-ms-overflow-style:none;}
      .card-h{transition:transform 0.2s;cursor:pointer;}
      .card-h:hover{transform:translateY(-3px);}
      .card-h:hover .play-ov{opacity:1!important;}
      .art-h{transition:transform 0.2s;cursor:pointer;}
      .art-h:hover{transform:scale(1.04);}
      .song-card:hover .play-btn-ov{opacity:1!important;}
      .desktop-sidebar{display:flex;}
      .mobile-only{display:none;}
      .mobile-sidebar-btn{display:none!important;}
      .hidden-mobile-vol{}
      @media(max-width:767px){
        .desktop-sidebar{display:none!important;}
        .mobile-only{display:block;}
        .mobile-sidebar-btn{display:flex!important;}
        .hidden-mobile-vol{display:none!important;}
      }
    `}</style>
  );
}

// ─── HOME (default export) ────────────────────────────────────────────────────
export default function Home({
  sharedPlaylists,
  setSharedPlaylists,
  sharedFavorites,
  setSharedFavorites,
  sharedFileRef,
  onRegisterMobileOpen,
  onRegisterNewPlaylist,
  onRegisterUploadHandler,
  onUploadCountChange,
}) {
  const player = usePlayer();
  const {
    song: curSong,
    playing,
    play,
    togglePlay,
    visible: playerVisible,
  } = player;

  const [view, setView] = useState("home");
  const [selAlbum, setSelAlbum] = useState(null);
  const [selArtist, setSelArtist] = useState(null);
  const [selPlaylist, setSelPlaylist] = useState(null);
  const [selUploadedSong, setSelUploadedSong] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [localFavorites, setLocalFavorites] = useState(() =>
    LS.get("sw_favorites", []),
  );
  const [localPlaylists, setLocalPlaylists] = useState(() =>
    LS.get("sw_playlists", []),
  );

  const favorites =
    sharedFavorites !== undefined ? sharedFavorites : localFavorites;
  const setFavorites =
    sharedFavorites !== undefined ? setSharedFavorites : setLocalFavorites;
  const playlists =
    sharedPlaylists !== undefined ? sharedPlaylists : localPlaylists;
  const setPlaylists =
    sharedPlaylists !== undefined ? setSharedPlaylists : setLocalPlaylists;

  const [uploadedSongs, setUploadedSongs] = useState(() =>
    LS.get("sw_uploads_meta", []),
  );
  const [blobUrls, setBlobUrls] = useState({});
  const [showNewPl, setShowNewPl] = useState(false);
  const [newPlName, setNewPlName] = useState("");
  const [uploadDialog, setUploadDialog] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [cloudinaryUploads, setCloudinaryUploads] = useState([]);

  const fileRef = sharedFileRef ?? useRef(null);

  useEffect(() => {
    LS.set("sw_favorites", favorites);
  }, [favorites]);
  useEffect(() => {
    LS.set("sw_playlists", playlists);
  }, [playlists]);
  useEffect(() => {
    LS.set(
      "sw_uploads_meta",
      uploadedSongs.map((s) => ({ ...s, url: undefined })),
    );
    onUploadCountChange?.(uploadedSongs.length);
  }, [uploadedSongs]);

  useEffect(() => {
    onRegisterMobileOpen?.((v) => {
      if (v === "liked") setView("liked");
    });
    onRegisterNewPlaylist?.(() => setShowNewPl(true));
    onRegisterUploadHandler?.((e) => triggerUpload(e));
  }, []);

  // ── toggleFav ──────────────────────────────────────────────────────────────
  const toggleFav = useCallback(
    (song, album) => {
      setFavorites((prev) => {
        const exists = prev.some((f) => f.id === song.id);
        if (exists) return prev.filter((f) => f.id !== song.id);
        return [
          ...prev,
          {
            ...song,
            albumCover: album?.cover,
            albumTitle: album?.title,
            likedAt: Date.now(),
          },
        ];
      });
    },
    [setFavorites],
  );

  const unfavSong = useCallback(
    (song) => {
      setFavorites((prev) => prev.filter((f) => f.id !== song.id));
    },
    [setFavorites],
  );

  // ── Delete uploaded song ──────────────────────────────────────────────────
  const handleDeleteSong = useCallback(
    (song) => {
      deleteFromCloudinary(song.cloudinaryPublicId);
      setBlobUrls((prev) => {
        if (prev[song.id]) URL.revokeObjectURL(prev[song.id]);
        const next = { ...prev };
        delete next[song.id];
        return next;
      });
      setUploadedSongs((prev) => prev.filter((s) => s.id !== song.id));
      setPlaylists((prev) =>
        prev.map((pl) => ({
          ...pl,
          songs: (pl.songs || []).filter((s) => s.id !== song.id),
        })),
      );
      setFavorites((prev) => prev.filter((f) => f.id !== song.id));
      if (curSong?.id === song.id) player.close();
    },
    [curSong, player, setFavorites, setPlaylists],
  );

  // ── Upload flow ────────────────────────────────────────────────────────────
  const triggerUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadDialog({ files });
    e.target.value = "";
  };

  const processUpload = async (files, playlistId, newPlaylistName) => {
    let targetPlaylistId = playlistId;
    if (playlistId === "new" && newPlaylistName) {
      const color = PALETTE[playlists.length % PALETTE.length];
      const newPl = {
        id: `pl${Date.now()}`,
        title: newPlaylistName,
        songs: [],
        color,
      };
      setPlaylists((prev) => [...prev, newPl]);
      targetPlaylistId = newPl.id;
    }

    setUploadDialog(null);

    const newSongs = await Promise.all(
      files.map(async (file) => {
        const id = `up_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const blobUrl = URL.createObjectURL(file);
        setBlobUrls((prev) => ({ ...prev, [id]: blobUrl }));

        const song = {
          id,
          title: file.name.replace(/\.[^.]+$/, ""),
          artists: "Uploaded by you",
          duration: "—",
          uploadedAt: Date.now(),
          cloudinaryUrl: null,
          cloudinaryPublicId: null,
        };

        setUploadedSongs((prev) => [song, ...prev]);

        const toastId = id;
        setCloudinaryUploads((prev) => [
          ...prev,
          { id: toastId, name: song.title, progress: 0, error: false },
        ]);

        try {
          const result = await uploadToCloudinary(file, (pct) => {
            setCloudinaryUploads((prev) =>
              prev.map((u) => (u.id === toastId ? { ...u, progress: pct } : u)),
            );
          });

          setUploadedSongs((prev) =>
            prev.map((s) =>
              s.id === id
                ? {
                    ...s,
                    cloudinaryUrl: result.url,
                    cloudinaryPublicId: result.publicId,
                  }
                : s,
            ),
          );
          setCloudinaryUploads((prev) =>
            prev.map((u) => (u.id === toastId ? { ...u, progress: 100 } : u)),
          );

          setTimeout(
            () =>
              setCloudinaryUploads((prev) =>
                prev.filter((u) => u.id !== toastId),
              ),
            3000,
          );

          return {
            song: {
              ...song,
              cloudinaryUrl: result.url,
              cloudinaryPublicId: result.publicId,
            },
            blobUrl,
          };
        } catch (err) {
          console.warn("[Cloudinary] Upload failed:", err.message);
          setCloudinaryUploads((prev) =>
            prev.map((u) => (u.id === toastId ? { ...u, error: true } : u)),
          );
          setTimeout(
            () =>
              setCloudinaryUploads((prev) =>
                prev.filter((u) => u.id !== toastId),
              ),
            4000,
          );
          return { song, blobUrl };
        }
      }),
    );

    if (targetPlaylistId && targetPlaylistId !== "none") {
      setPlaylists((prev) =>
        prev.map((pl) => {
          if (pl.id === targetPlaylistId)
            return {
              ...pl,
              songs: [...(pl.songs || []), ...newSongs.map((x) => x.song)],
            };
          return pl;
        }),
      );
    }

    if (newSongs.length > 0) {
      const first = newSongs[0];
      const allWithUrls = newSongs.map((x) => ({ ...x.song, url: x.blobUrl }));
      play({ ...first.song, url: first.blobUrl }, { songs: allWithUrls });
    }
  };

  const createPlaylist = () => {
    if (!newPlName.trim()) return;
    const color = PALETTE[playlists.length % PALETTE.length];
    setPlaylists((prev) => [
      ...prev,
      { id: `pl${Date.now()}`, title: newPlName.trim(), songs: [], color },
    ]);
    setNewPlName("");
    setShowNewPl(false);
  };

  const selectPlaylist = (pl) => {
    setSelPlaylist(pl);
    setView("playlist");
    setSidebarOpen(false);
  };

  const NAVBAR_H = 64;
  const pb = playerVisible ? 88 : 0;

  const sidebarProps = {
    playlists,
    favorites,
    uploadCount: uploadedSongs.length,
    onLiked: () => {
      setView("liked");
      setSidebarOpen(false);
    },
    onNewPl: () => setShowNewPl(true),
    onSelectPlaylist: selectPlaylist,
    activePlaylistId: selPlaylist?.id,
    fileRef,
    onUpload: triggerUpload,
  };

  // ── renderContent ──────────────────────────────────────────────────────────
  const renderContent = () => {
    if (view === "liked")
      return (
        <LikedSongsPage
          player={player}
          favorites={favorites}
          onToggleFav={toggleFav}
          onUnfav={unfavSong}
          onBack={() => setView("home")}
        />
      );

    if (view === "album" && selAlbum)
      return (
        <AlbumDetail
          album={selAlbum}
          player={player}
          favorites={favorites}
          onToggleFav={toggleFav}
          onBack={() => setView("home")}
        />
      );

    if (view === "artist" && selArtist)
      return (
        <ArtistDetail
          artist={selArtist}
          player={player}
          favorites={favorites}
          onToggleFav={toggleFav}
          onBack={() => setView("home")}
        />
      );

    if (view === "playlist" && selPlaylist) {
      const livePlaylist =
        playlists.find((p) => p.id === selPlaylist.id) || selPlaylist;
      return (
        <PlaylistDetail
          playlist={livePlaylist}
          player={player}
          favorites={favorites}
          onToggleFav={toggleFav}
          onBack={() => setView("home")}
          blobUrls={blobUrls}
        />
      );
    }

    if (view === "uploadedSong" && selUploadedSong) {
      const liveSong =
        uploadedSongs.find((s) => s.id === selUploadedSong.id) ||
        selUploadedSong;
      return (
        <UploadedSongDetail
          song={liveSong}
          player={player}
          favorites={favorites}
          onToggleFav={toggleFav}
          onBack={() => setView("home")}
          blobUrls={blobUrls}
          onDelete={(song) => {
            handleDeleteSong(song);
            setView("home");
          }}
        />
      );
    }

    // ── HOME view ──
    return (
      <div style={{ animation: "fadeUp 0.35s ease" }}>
        {/* Uploaded Songs */}
        {uploadedSongs.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <SectionHead title="Your Songs" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))",
                gap: 14,
              }}
            >
              {uploadedSongs.map((song) => (
                <UploadedSongCard
                  key={song.id}
                  song={song}
                  active={curSong?.id === song.id}
                  playing={playing}
                  onPlay={() => {
                    const url = blobUrls[song.id] || song.cloudinaryUrl;
                    if (!url) return;
                    const allWithUrls = uploadedSongs.map((s) => ({
                      ...s,
                      url: blobUrls[s.id] || s.cloudinaryUrl,
                    }));
                    play({ ...song, url }, { songs: allWithUrls });
                  }}
                  togglePlay={() => {
                    if (curSong?.id === song.id) {
                      togglePlay();
                      return;
                    }
                    const url = blobUrls[song.id] || song.cloudinaryUrl;
                    if (!url) return;
                    const allWithUrls = uploadedSongs.map((s) => ({
                      ...s,
                      url: blobUrls[s.id] || s.cloudinaryUrl,
                    }));
                    play({ ...song, url }, { songs: allWithUrls });
                  }}
                  isFav={favorites.some((f) => f.id === song.id)}
                  onFav={() => toggleFav(song, null)}
                  onOpenDetail={() => {
                    setSelUploadedSong(song);
                    setView("uploadedSong");
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* Trending Albums */}
        <section style={{ marginBottom: 32 }}>
          <SectionHead title="Trending Songs" />
          <div
            className="hide-scroll"
            style={{
              display: "flex",
              gap: 14,
              overflowX: "auto",
              paddingBottom: 8,
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {ALBUMS.map((album) => {
              const isActive = album.songs.some((s) => s.id === curSong?.id);
              return (
                <div
                  key={album.id}
                  className="card-h"
                  onClick={() => {
                    setSelAlbum(album);
                    setView("album");
                  }}
                  style={{
                    flex: "0 0 160px",
                    scrollSnapAlign: "start",
                    background: "#11131c",
                    borderRadius: 14,
                    border: `1px solid ${isActive ? ACCENT + "44" : "rgba(255,255,255,0.06)"}`,
                    padding: 12,
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      marginBottom: 10,
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                  >
                    <CoverArt
                      src={album.cover}
                      alt={album.title}
                      fullWidth
                      radius={10}
                    />
                    <div
                      className="play-ov"
                      style={{
                        position: "absolute",
                        bottom: 8,
                        right: 8,
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: ACCENT,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        color: "#fff",
                        opacity: 0,
                        transition: "opacity 0.2s",
                        boxShadow: `0 4px 14px ${ACCENT}66`,
                      }}
                    >
                      ▶
                    </div>
                    {isActive && playing && (
                      <div
                        style={{ position: "absolute", bottom: 10, left: 10 }}
                      >
                        <EqBars size={12} />
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: "#fff",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginBottom: 4,
                    }}
                  >
                    {album.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.5)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {album.artist}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Popular Artists */}
        <section style={{ marginBottom: 32 }}>
          <SectionHead title="Popular Artists" />
          <div
            className="hide-scroll"
            style={{
              display: "flex",
              gap: 14,
              overflowX: "auto",
              paddingBottom: 8,
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {ARTISTS.map((artist) => (
              <div
                key={artist.id}
                className="art-h"
                onClick={() => {
                  setSelArtist(artist);
                  setView("artist");
                }}
                style={{
                  flex: "0 0 150px",
                  scrollSnapAlign: "start",
                  background: "#11131c",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.06)",
                  padding: "16px 12px 14px",
                  textAlign: "center",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: 10,
                  }}
                >
                  <ArtistAvatar src={artist.img} alt={artist.name} size={84} />
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#fff",
                    marginBottom: 3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {artist.name}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.45)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {artist.genre}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bhakti Songs */}
        <section style={{ marginBottom: 32 }}>
          <SectionHead title="Bhakti Songs" />
          <div
            className="hide-scroll"
            style={{
              display: "flex",
              gap: 14,
              overflowX: "auto",
              paddingBottom: 8,
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {BHAKTI.map((bhaktis) => {
              const isActive = bhaktis.songs?.some((s) => s.id === curSong?.id);
              return (
                <div
                  key={bhaktis.id}
                  className="card-h"
                  onClick={() => {
                    setSelAlbum(bhaktis);
                    setView("album");
                  }}
                  style={{
                    flex: "0 0 160px",
                    scrollSnapAlign: "start",
                    background: "#11131c",
                    borderRadius: 14,
                    border: `1px solid ${isActive ? ACCENT + "44" : "rgba(255,255,255,0.06)"}`,
                    padding: 12,
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      marginBottom: 10,
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                  >
                    <CoverArt
                      src={bhaktis.cover}
                      alt={bhaktis.title}
                      fullWidth
                      radius={10}
                    />
                    <div
                      className="play-ov"
                      style={{
                        position: "absolute",
                        bottom: 8,
                        right: 8,
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: ACCENT,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        color: "#fff",
                        opacity: 0,
                        transition: "opacity 0.2s",
                      }}
                    >
                      ▶
                    </div>
                    {isActive && playing && (
                      <div
                        style={{ position: "absolute", bottom: 10, left: 10 }}
                      >
                        <EqBars size={12} />
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: "#fff",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginBottom: 4,
                    }}
                  >
                    {bhaktis.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.5)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {bhaktis.artist}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        {/* Haryanvi Songs */}
        <section style={{ marginBottom: 32 }}>
          <SectionHead title="Haryanvi Songs" />
          <div
            className="hide-scroll"
            style={{
              display: "flex",
              gap: 14,
              overflowX: "auto",
              paddingBottom: 8,
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {HARYANVI.map((haryana) => {
              const isActive = haryana.songs?.some((s) => s.id === curSong?.id);
              return (
                <div
                  key={haryana.id}
                  className="card-h"
                  onClick={() => {
                    setSelAlbum(haryana);
                    setView("album");
                  }}
                  style={{
                    flex: "0 0 160px",
                    scrollSnapAlign: "start",
                    background: "#11131c",
                    borderRadius: 14,
                    border: `1px solid ${isActive ? ACCENT + "44" : "rgba(255,255,255,0.06)"}`,
                    padding: 12,
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      marginBottom: 10,
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                  >
                    <CoverArt
                      src={haryana.cover}
                      alt={haryana.title}
                      fullWidth
                      radius={10}
                    />
                    <div
                      className="play-ov"
                      style={{
                        position: "absolute",
                        bottom: 8,
                        right: 8,
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: ACCENT,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        color: "#fff",
                        opacity: 0,
                        transition: "opacity 0.2s",
                      }}
                    >
                      ▶
                    </div>
                    {isActive && playing && (
                      <div
                        style={{ position: "absolute", bottom: 10, left: 10 }}
                      >
                        <EqBars size={12} />
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: "#fff",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginBottom: 4,
                    }}
                  >
                    {haryana.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.5)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {haryana.artist}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        {/* bhojpuri Songs */}
        <section style={{ marginBottom: 32 }}>
          <SectionHead title="Bhojpuri Songs" />
          <div
            className="hide-scroll"
            style={{
              display: "flex",
              gap: 14,
              overflowX: "auto",  
              paddingBottom: 8,
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {BHOJPURI.map((bhoj) => {
              const isActive = bhoj.songs?.some((s) => s.id === curSong?.id);
              return (
                <div
                  key={bhoj.id}
                  className="card-h"
                  onClick={() => {
                    setSelAlbum(bhoj);
                    setView("album");
                  }}
                  style={{
                    flex: "0 0 160px",
                    scrollSnapAlign: "start",
                    background: "#11131c",
                    borderRadius: 14,
                    border: `1px solid ${isActive ? ACCENT + "44" : "rgba(255,255,255,0.06)"}`,
                    padding: 12,
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      marginBottom: 10,
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                  >
                    <CoverArt
                      src={bhoj.cover}
                      alt={bhoj.title}
                      fullWidth
                      radius={10}
                    />
                    <div
                      className="play-ov"
                      style={{
                        position: "absolute",
                        bottom: 8,
                        right: 8,
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: ACCENT,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        color: "#fff",
                        opacity: 0,
                        transition: "opacity 0.2s",
                      }}
                    >
                      ▶
                    </div>
                    {isActive && playing && (
                      <div
                        style={{ position: "absolute", bottom: 10, left: 10 }}
                      >
                        <EqBars size={12} />
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: "#fff",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginBottom: 4,
                    }}
                  >
                    {bhoj.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.5)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {bhoj.artist}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  };

  return (
    <>
      <GlobalStyles />

      {/* Mobile sidebar toggle */}
      <button
        className="mobile-sidebar-btn"
        onClick={() => setSidebarOpen(true)}
        style={{
          position: "fixed",
          bottom: playerVisible ? 104 : 20,
          left: 16,
          zIndex: 500,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: ACCENT,
          border: "none",
          color: "#fff",
          fontSize: 20,
          cursor: "pointer",
          display: "none",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 4px 20px ${ACCENT}88`,
        }}
      >
        📚
      </button>

      <div className="mobile-only">
        <MobileSidebarDrawer
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        >
          <SidebarContents {...sidebarProps} />
        </MobileSidebarDrawer>
      </div>

      <div
        style={{
          display: "flex",
          height: `calc(100vh - ${NAVBAR_H}px - ${pb}px)`,
          marginTop: NAVBAR_H,
          background: "#090b11",
          fontFamily: "'Segoe UI',system-ui,sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Desktop Sidebar */}
        <div className="desktop-sidebar">
          <aside
            style={{
              width: 262,
              flexShrink: 0,
              height: "100%",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              padding: "10px 8px",
              borderRight: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <SidebarContents {...sidebarProps} />
          </aside>
        </div>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: "auto", padding: "16px 18px 20px" }}>
          {renderContent()}
        </main>
      </div>

      {/* Player */}
      {playerVisible && curSong && (
        <PlayerBar
          player={player}
          favorites={favorites}
          onToggleFav={toggleFav}
        />
      )}

      {/* Cloudinary upload progress toasts */}
      <UploadProgressToast uploads={cloudinaryUploads} />

      {/* Upload playlist dialog */}
      {uploadDialog && (
        <UploadPlaylistDialog
          files={uploadDialog.files}
          playlists={playlists}
          onConfirm={(playlistId, newPlaylistName) =>
            processUpload(uploadDialog.files, playlistId, newPlaylistName)
          }
          onCancel={() => setUploadDialog(null)}
        />
      )}

      {/* New playlist modal */}
      {showNewPl && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 800,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowNewPl(false);
          }}
        >
          <div
            style={{
              background: "#13151f",
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.1)",
              padding: 24,
              width: 340,
              animation: "fadeUp 0.22s ease",
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "#fff",
                marginBottom: 4,
              }}
            >
              Create playlist
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.38)",
                marginBottom: 18,
              }}
            >
              Playlist ka naam do
            </div>
            <input
              value={newPlName}
              onChange={(e) => setNewPlName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createPlaylist()}
              placeholder="My Playlist #1"
              autoFocus
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                border: `1.5px solid ${newPlName ? ACCENT : "rgba(255,255,255,0.1)"}`,
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
                fontSize: 13,
                outline: "none",
                marginBottom: 14,
                boxSizing: "border-box",
              }}
            />
            <div
              style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}
            >
              <button
                onClick={() => setShowNewPl(false)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 100,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={createPlaylist}
                disabled={!newPlName.trim()}
                style={{
                  padding: "8px 22px",
                  borderRadius: 100,
                  border: "none",
                  background: newPlName.trim()
                    ? ACCENT
                    : "rgba(255,255,255,0.1)",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: newPlName.trim() ? "pointer" : "not-allowed",
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm (from home grid) */}
      {deleteTarget && (
        <DeleteConfirmDialog
          song={deleteTarget.song}
          onConfirm={() => {
            handleDeleteSong(deleteTarget.song);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}

export { LikedSongsPage as FavoritePage };
