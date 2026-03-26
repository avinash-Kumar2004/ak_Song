/**
 * src/pages/Favorite.jsx
 * — Props se favorites aaye toh use karo, warna localStorage se lo
 * — usePlayer se apna player instance banata hai
 */

import { useState } from "react";
import usePlayer from "../hooks/usePlayer";

const ACCENT = "#6c63ff";

const GRAD_PAIRS = [
  ["#1a1a2e", "#e94560"], ["#0f3460", "#533483"], ["#2d1b69", "#11998e"],
  ["#8B0000", "#FF6B35"], ["#1b4332", "#40916c"], ["#4a1942", "#c94b4b"],
  ["#134e5e", "#71b280"], ["#2c3e50", "#fd746c"], ["#1a1a2e", "#6c63ff"],
  ["#0a3d62", "#0c2461"], ["#200122", "#6f0000"], ["#373b44", "#4286f4"],
];

function strGrad(str = "") {
  const h = [...str].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);
  return GRAD_PAIRS[Math.abs(h) % GRAD_PAIRS.length];
}

function fmtDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function EqBars({ color = ACCENT, size = 14 }) {
  return (
    <div style={{ display: "flex", gap: 2.5, alignItems: "flex-end", height: size }}>
      {[1, 0.45, 0.75, 0.35, 0.6].map((h, i) => (
        <div key={i} style={{
          width: 2.5, borderRadius: 2, background: color,
          height: `${h * 100}%`,
          animation: `eq${i} ${0.6 + i * 0.13}s ease-in-out infinite alternate`,
        }} />
      ))}
    </div>
  );
}

function CoverArt({ src, alt = "", size = 48, radius = 8 }) {
  const [err, setErr] = useState(false);
  const [c1, c2] = strGrad(alt);
  const base = {
    width: size, height: size, borderRadius: radius,
    flexShrink: 0, objectFit: "cover",
  };
  if (!src || err) {
    return (
      <div style={{
        ...base,
        background: `linear-gradient(135deg,${c1},${c2})`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: size * 0.34, opacity: 0.7 }}>🎵</span>
      </div>
    );
  }
  return (
    <img src={src} alt={alt} onError={() => setErr(true)} style={base} loading="lazy" />
  );
}

function SongRow({ song, idx, active, playing, onPlay, togglePlay, onUnfav }) {
  return (
    <div
      onClick={() => active ? togglePlay?.() : onPlay()}
      style={{
        display: "grid",
        gridTemplateColumns: "36px 52px 1fr auto",
        padding: "10px 16px",
        alignItems: "center",
        gap: 12,
        cursor: "pointer",
        background: active ? `${ACCENT}14` : "transparent",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        transition: "background 0.15s",
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      {/* Index / EQ */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        {active && playing
          ? <EqBars color={ACCENT} size={13} />
          : <span style={{ fontSize: 12, color: "rgba(255,255,255,0.28)" }}>{idx + 1}</span>
        }
      </div>

      {/* Cover */}
      <CoverArt src={song.albumCover} alt={song.title} size={44} radius={7} />

      {/* Info */}
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600,
          color: active ? ACCENT : "#fff",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {song.title}
        </div>
        <div style={{
          fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {song.artists || song.artist || "Unknown Artist"}
        </div>
        {song.albumTitle && (
          <div style={{
            fontSize: 10, color: "rgba(255,255,255,0.28)", marginTop: 2,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            📀 {song.albumTitle}
          </div>
        )}
        {song.likedAt && (
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", marginTop: 2 }}>
            ❤️ Added {fmtDate(song.likedAt)}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          fontSize: 11, color: "rgba(255,255,255,0.28)",
          minWidth: 32, textAlign: "right",
        }}>
          {song.duration || "—"}
        </span>

        {/* Unlike button */}
        <button
          onClick={e => { e.stopPropagation(); onUnfav?.(); }}
          title="Remove from Liked Songs"
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 16, color: "#ff4d6d", padding: 3,
            transition: "transform 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.35)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          ♥
        </button>

        {/* Play/Pause button */}
        <button
          onClick={e => { e.stopPropagation(); active ? togglePlay?.() : onPlay(); }}
          style={{
            background: active ? ACCENT : "rgba(255,255,255,0.08)",
            border: "none", color: "#fff", borderRadius: "50%",
            width: 30, height: 30, cursor: "pointer", fontSize: 11,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {active && playing ? "⏸" : "▶"}
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Favorite({ player: playerProp, favorites: favProp, onUnfav: onUnfavProp }) {

  // ── 1. Player — prop se aaye toh use karo, warna khud banao ──────────────
  const ownPlayer = usePlayer();
  const player = playerProp ?? ownPlayer;

  const curSong    = player?.song        ?? null;
  const playing    = player?.playing     ?? false;
  const play       = player?.play        ?? (() => {});
  const togglePlay = player?.togglePlay  ?? (() => {});

  // ── 2. Favorites — prop se aaye toh use karo, warna localStorage se lo ──
  const [localFavs, setLocalFavs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sw_favorites") || "[]");
    } catch {
      return [];
    }
  });

  const favorites = favProp ?? localFavs;

  // ── 3. Unfav handler ──────────────────────────────────────────────────────
  const handleUnfav = (song) => {
    if (onUnfavProp) {
      // Parent ne handler diya hai (App.jsx se)
      onUnfavProp(song);
    } else {
      // Seedha localStorage update karo
      setLocalFavs(prev => {
        const updated = prev.filter(f => f.id !== song.id);
        try {
          localStorage.setItem("sw_favorites", JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#090b11",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: "#fff",
      paddingBottom: 100,
      // paddingTop:"50px"
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(180deg, rgba(255,77,109,0.22) 0%, transparent 100%)",
        borderRadius: 16,
        margin: "16px 18px 10px",
        padding: "26px 22px 20px",
        display: "flex",
        gap: 22,
        alignItems: "flex-end",
        flexWrap: "wrap",
      }}>
        {/* Artwork */}
        <div style={{
          width: 150, height: 150, borderRadius: 12, flexShrink: 0,
          background: "linear-gradient(135deg,#ff4d6d,#6c63ff)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 60,
          boxShadow: "0 12px 40px rgba(255,77,109,0.35)",
        }}>
          ♥
        </div>

        {/* Meta */}
        <div>
          <div style={{
            fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.45)",
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 7,
          }}>
            Playlist
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "#fff", margin: "0 0 6px" }}>
            Liked Songs
          </h2>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
            {favorites.length} {favorites.length === 1 ? "song" : "songs"}
          </div>

          {favorites.length > 0 && (
            <button
              onClick={() => play(favorites[0], { songs: favorites })}
              style={{
                marginTop: 16, width: 48, height: 48, borderRadius: "50%",
                border: "none", background: ACCENT, cursor: "pointer",
                fontSize: 18, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 8px 24px ${ACCENT}55`,
                transition: "transform 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              ▶
            </button>
          )}
        </div>
      </div>

      {/* Song list */}
      {favorites.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 20px",
          color: "rgba(255,255,255,0.26)", fontSize: 14,
          margin: "0 18px",
          background: "rgba(255,255,255,0.02)",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.05)",
        }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>🎵</div>
          <div style={{ fontWeight: 600, marginBottom: 6, color: "rgba(255,255,255,0.45)" }}>
            Koi liked song nahi abhi
          </div>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.22)" }}>
            Kisi bhi song ke paas ♡ click karo — woh yahan aa jayega
          </span>
        </div>
      ) : (
        <div style={{
          margin: "0 18px",
          background: "rgba(255,255,255,0.02)",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}>
          {favorites.map((song, i) => (
            <SongRow
              key={song.id}
              song={song}
              idx={i}
              active={curSong?.id === song.id}
              playing={playing}
              onPlay={() => play(song, { songs: favorites })}
              togglePlay={togglePlay}
              onUnfav={() => handleUnfav(song)}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:none } }
        ${[0,1,2,3,4].map(i =>
          `@keyframes eq${i}{from{transform:scaleY(0.2)}to{transform:scaleY(1)}}`
        ).join("")}
      `}</style>
    </div>
  );
}