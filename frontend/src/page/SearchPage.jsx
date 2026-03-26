/**
 * src/pages/SearchPage.jsx
 * — Searches across ALL songs passed via `songs` prop
 * — ALSO searches across siteContent (pages, albums, playlists, etc.)
 * — Matches songs: title, artist, artists, albumTitle, albumName
 * — Matches siteContent: label, title, description, tags
 *
 * Props:
 *   songs        : Song[]          — full library (required)
 *   siteContent  : SiteItem[]      — website pages/sections to search (optional)
 *                  SiteItem shape: { id, label, description?, icon?, tags?[], onClick? }
 *   player       : object          — { song, playing, play, togglePlay } (optional)
 *   onFav        : fn              — toggle favorite (optional)
 *   favorites    : Song[]          — to show heart state (optional)
 *
 * Usage example:
 *   const siteContent = [
 *     { id: "home",      label: "Home",           icon: "🏠", description: "Your main feed" },
 *     { id: "library",   label: "Library",        icon: "📚", description: "All your songs" },
 *     { id: "favorites", label: "Liked Songs",    icon: "❤️", description: "Your favourites", tags: ["liked","heart"] },
 *     { id: "albums",    label: "Albums",         icon: "💿", description: "Browse albums" },
 *     { id: "playlists", label: "My Playlists",   icon: "🎶", description: "Custom playlists", tags: ["playlist"] },
 *   ];
 *   <SearchPage songs={songs} siteContent={siteContent} player={player} ... />
 */

import { useState, useRef, useEffect, useCallback } from "react";

const ACCENT = "#6c63ff";
const PINK   = "#ff4d6d";
const TEAL   = "#11998e";

// ── Helpers ────────────────────────────────────────────────────────────────
const GRAD_PAIRS = [
  ["#1a1a2e","#e94560"],["#0f3460","#533483"],["#2d1b69","#11998e"],
  ["#8B0000","#FF6B35"],["#1b4332","#40916c"],["#4a1942","#c94b4b"],
  ["#134e5e","#71b280"],["#2c3e50","#fd746c"],["#1a1a2e","#6c63ff"],
  ["#0a3d62","#0c2461"],["#200122","#6f0000"],["#373b44","#4286f4"],
];

function strGrad(str = "") {
  const h = [...str].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);
  return GRAD_PAIRS[Math.abs(h) % GRAD_PAIRS.length];
}

function normalize(str = "") {
  return str.toLowerCase().trim();
}

function matchesSong(song, query) {
  const q = normalize(query);
  if (!q) return false;
  return [
    song.title, song.artist, song.artists,
    song.albumTitle, song.albumName, song.album,
  ].some(f => f && normalize(f).includes(q));
}

function matchesSiteItem(item, query) {
  const q = normalize(query);
  if (!q) return false;
  const fields = [
    item.label,
    item.title,
    item.description,
    ...(Array.isArray(item.tags) ? item.tags : []),
  ];
  return fields.some(f => f && normalize(f).includes(q));
}

function highlight(text = "", query = "") {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    normalize(part) === normalize(query)
      ? <mark key={i} style={{ background: `${ACCENT}55`, color: "#fff", borderRadius: 3, padding: "0 2px" }}>{part}</mark>
      : part
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────
function CoverArt({ src, alt = "", size = 48, radius = 8 }) {
  const [err, setErr] = useState(false);
  const [c1, c2] = strGrad(alt);
  const base = { width: size, height: size, borderRadius: radius, flexShrink: 0, objectFit: "cover" };
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
  return <img src={src} alt={alt} onError={() => setErr(true)} style={base} loading="lazy" />;
}

function EqBars({ color = ACCENT, size = 13 }) {
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

function SongRow({ song, idx, active, playing, onPlay, togglePlay, isFav, onFav, query }) {
  return (
    <div
      onClick={() => active ? togglePlay?.() : onPlay()}
      style={{
        display: "grid",
        gridTemplateColumns: "32px 50px 1fr auto",
        padding: "10px 16px",
        alignItems: "center",
        gap: 12,
        cursor: "pointer",
        background: active ? `${ACCENT}14` : "transparent",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        transition: "background 0.15s",
        animation: `fadeUp 0.35s ease ${Math.min(idx * 0.04, 0.3)}s both`,
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      {/* Index / EQ */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        {active && playing
          ? <EqBars color={ACCENT} size={13} />
          : <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{idx + 1}</span>
        }
      </div>

      {/* Cover */}
      <CoverArt src={song.albumCover || song.cover} alt={song.title} size={44} radius={7} />

      {/* Info */}
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600,
          color: active ? ACCENT : "#fff",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {highlight(song.title, query)}
        </div>
        <div style={{
          fontSize: 11, color: "rgba(255,255,255,0.42)", marginTop: 2,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {highlight(song.artists || song.artist || "Unknown Artist", query)}
        </div>
        {(song.albumTitle || song.albumName || song.album) && (
          <div style={{
            fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 2,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            📀 {highlight(song.albumTitle || song.albumName || song.album, query)}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", minWidth: 32, textAlign: "right" }}>
          {song.duration || "—"}
        </span>

        {onFav && (
          <button
            onClick={e => { e.stopPropagation(); onFav(song); }}
            title={isFav ? "Remove from Liked" : "Add to Liked"}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 16,
              color: isFav ? PINK : "rgba(255,255,255,0.25)",
              padding: 3, transition: "transform 0.15s, color 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.35)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            {isFav ? "♥" : "♡"}
          </button>
        )}

        <button
          onClick={e => { e.stopPropagation(); active ? togglePlay?.() : onPlay(); }}
          style={{
            background: active ? ACCENT : "rgba(255,255,255,0.08)",
            border: "none", color: "#fff", borderRadius: "50%",
            width: 30, height: 30, cursor: "pointer", fontSize: 11,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "background 0.15s",
          }}
        >
          {active && playing ? "⏸" : "▶"}
        </button>
      </div>
    </div>
  );
}

// ── NEW: Site Content Row ──────────────────────────────────────────────────
function SiteItemRow({ item, idx, query }) {
  return (
    <div
      onClick={() => item.onClick?.()}
      style={{
        display: "grid",
        gridTemplateColumns: "48px 1fr auto",
        padding: "10px 16px",
        alignItems: "center",
        gap: 12,
        cursor: item.onClick ? "pointer" : "default",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        transition: "background 0.15s",
        animation: `fadeUp 0.35s ease ${Math.min(idx * 0.04, 0.3)}s both`,
      }}
      onMouseEnter={e => { if (item.onClick) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      {/* Icon box */}
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: `linear-gradient(135deg, ${TEAL}44, ${ACCENT}44)`,
        border: `1px solid ${TEAL}33`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, flexShrink: 0,
      }}>
        {item.icon || "📄"}
      </div>

      {/* Info */}
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600, color: "#fff",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {highlight(item.label || item.title || "", query)}
        </div>
        {item.description && (
          <div style={{
            fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 2,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {highlight(item.description, query)}
          </div>
        )}
      </div>

      {/* Arrow if clickable */}
      {item.onClick && (
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.2)" }}>→</span>
      )}
    </div>
  );
}

// ── Search Input ───────────────────────────────────────────────────────────
function SearchBar({ value, onChange, onClear, inputRef }) {
  return (
    <div style={{
      position: "relative",
      margin: "20px 18px 0",
      animation: "fadeUp 0.4s ease both",
    }}>
      <div style={{
        position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
        fontSize: 16, color: "rgba(255,255,255,0.35)", pointerEvents: "none",
        userSelect: "none",
      }}>🔍</div>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search songs, artists, albums, pages..."
        autoFocus
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.06)",
          border: "1.5px solid rgba(255,255,255,0.1)",
          borderRadius: 14,
          padding: "14px 46px 14px 46px",
          fontSize: 15,
          color: "#fff",
          outline: "none",
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          boxSizing: "border-box",
          transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
        }}
        onFocus={e => {
          e.target.style.borderColor = ACCENT;
          e.target.style.background = "rgba(108,99,255,0.08)";
          e.target.style.boxShadow = `0 0 0 3px ${ACCENT}22`;
        }}
        onBlur={e => {
          e.target.style.borderColor = "rgba(255,255,255,0.1)";
          e.target.style.background = "rgba(255,255,255,0.06)";
          e.target.style.boxShadow = "none";
        }}
      />

      {value && (
        <button
          onClick={onClear}
          style={{
            position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.12)", border: "none", borderRadius: "50%",
            width: 22, height: 22, cursor: "pointer", color: "rgba(255,255,255,0.6)",
            fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
        >
          ✕
        </button>
      )}
    </div>
  );
}

// ── Not Found State ────────────────────────────────────────────────────────
function NotFound({ query }) {
  return (
    <div style={{
      textAlign: "center",
      padding: "60px 24px",
      animation: "fadeUp 0.4s ease both",
    }}>
      <div style={{
        width: 100, height: 100, borderRadius: "50%",
        background: "radial-gradient(circle, #1a1a2e 0%, #0d0d1a 70%)",
        border: "2px solid rgba(255,255,255,0.07)",
        margin: "0 auto 20px",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 38,
        boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
        animation: "floatBob 3s ease-in-out infinite",
      }}>
        🔍
      </div>

      <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>
        No results for
      </div>
      <div style={{
        fontSize: 20, fontWeight: 900, color: "#fff",
        marginBottom: 12, wordBreak: "break-word",
      }}>
        "{query}"
      </div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.7, maxWidth: 280, margin: "0 auto" }}>
        Try a different spelling, or search by artist or album name.
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 20 }}>
        {["Try artist name", "Check spelling", "Search album"].map((tip, i) => (
          <div key={i} style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 99, padding: "5px 12px",
            fontSize: 11, color: "rgba(255,255,255,0.35)",
          }}>
            {tip}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Empty / Initial State ──────────────────────────────────────────────────
function EmptyState({ totalSongs }) {
  return (
    <div style={{
      textAlign: "center",
      padding: "50px 24px",
      animation: "fadeUp 0.5s ease both",
    }}>
      <div style={{ fontSize: 48, marginBottom: 14, animation: "floatBob 4s ease-in-out infinite" }}>🎵</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>
        Search your music
      </div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
        {totalSongs > 0
          ? `${totalSongs} song${totalSongs !== 1 ? "s" : ""} in your library`
          : "No songs in library yet"}
      </div>

      <div style={{ display: "flex", gap: 4, alignItems: "flex-end", justifyContent: "center", height: 40, marginTop: 24 }}>
        {[0.4, 0.7, 1, 0.6, 0.85, 0.5, 0.9, 0.3, 0.75, 0.55, 0.95, 0.4].map((h, i) => (
          <div key={i} style={{
            width: 4, borderRadius: 3,
            height: `${h * 100}%`,
            background: `rgba(108,99,255,${0.15 + h * 0.25})`,
            animation: `eq${i % 5} ${0.8 + i * 0.1}s ease-in-out infinite alternate`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Section Header ─────────────────────────────────────────────────────────
function SectionHeader({ label, count }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 18px 10px",
      animation: "fadeUp 0.3s ease both",
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        {label}
      </div>
      <div style={{
        fontSize: 11, color: "rgba(255,255,255,0.3)",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 99, padding: "3px 10px",
      }}>
        {count} {count === 1 ? "result" : "results"}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function SearchPage({
  songs = [],
  siteContent = [],   // ← NEW: array of { id, label, description?, icon?, tags?, onClick? }
  player,
  onFav,
  favorites = [],
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const curSong    = player?.song       ?? null;
  const playing    = player?.playing    ?? false;
  const play       = player?.play       ?? (() => {});
  const togglePlay = player?.togglePlay ?? (() => {});

  const favIds = new Set(favorites.map(f => f.id));

  // Filter songs
  const songResults = query.trim()
    ? songs.filter(s => matchesSong(s, query))
    : [];

  // Filter site content
  const siteResults = query.trim()
    ? siteContent.filter(item => matchesSiteItem(item, query))
    : [];

  const hasAnyResults = songResults.length > 0 || siteResults.length > 0;

  const handleClear = useCallback(() => {
    setQuery("");
    inputRef.current?.focus();
  }, []);

  // Keyboard shortcut: "/" focuses search
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const showEmpty    = !query.trim();
  const showNotFound = query.trim() && !hasAnyResults;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#090b11",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: "#fff",
      paddingBottom: 120,
      position: "relative",
      overflow: "hidden",
      paddingTop:"50px"
    }}>

      {/* Ambient glow */}
      <div style={{
        position: "fixed", top: -100, left: "50%", transform: "translateX(-50%)",
        width: 500, height: 300, borderRadius: "50%",
        background: `radial-gradient(ellipse, ${ACCENT}18 0%, transparent 70%)`,
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* ── Page Header ── */}
      <div style={{
        position: "relative", zIndex: 1,
        padding: "24px 18px 0",
        display: "flex", alignItems: "center", gap: 10,
        animation: "fadeUp 0.4s ease both",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `linear-gradient(135deg, ${ACCENT}, ${PINK})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 17,
          boxShadow: `0 4px 14px ${ACCENT}44`,
        }}>
          🔍
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 900, margin: 0, color: "#fff" }}>Search</h2>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>
            Press <kbd style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 4, padding: "1px 5px", fontSize: 10,
              fontFamily: "monospace",
            }}>/</kbd> to focus
          </div>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <SearchBar
          value={query}
          onChange={setQuery}
          onClear={handleClear}
          inputRef={inputRef}
        />
      </div>

      {/* ── Body ── */}
      <div style={{ position: "relative", zIndex: 1, marginTop: 12 }}>

        {showEmpty && <EmptyState totalSongs={songs.length} />}

        {showNotFound && <NotFound query={query} />}

        {/* ── Site Content Results (Pages, Albums, Playlists, etc.) ── */}
        {siteResults.length > 0 && (
          <>
            <SectionHeader label="Pages & Sections" count={siteResults.length} />
            <div style={{
              margin: "0 18px 18px",
              background: `rgba(17,153,142,0.05)`,
              borderRadius: 12,
              border: `1px solid ${TEAL}22`,
              overflow: "hidden",
            }}>
              {siteResults.map((item, i) => (
                <SiteItemRow
                  key={item.id ?? i}
                  item={item}
                  idx={i}
                  query={query}
                />
              ))}
            </div>
          </>
        )}

        {/* ── Song Results ── */}
        {songResults.length > 0 && (
          <>
            <SectionHeader label="Songs" count={songResults.length} />
            <div style={{
              margin: "0 18px",
              background: "rgba(255,255,255,0.02)",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.06)",
              overflow: "hidden",
            }}>
              {songResults.map((song, i) => (
                <SongRow
                  key={song.id ?? i}
                  song={song}
                  idx={i}
                  query={query}
                  active={curSong?.id === song.id}
                  playing={playing}
                  onPlay={() => play(song, { songs: songResults })}
                  togglePlay={togglePlay}
                  isFav={favIds.has(song.id)}
                  onFav={onFav}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Global keyframes ── */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatBob {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-8px); }
        }
        ${[0,1,2,3,4].map(i =>
          `@keyframes eq${i}{from{transform:scaleY(0.2)}to{transform:scaleY(1)}}`
        ).join("")}
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.22); }
      `}</style>
    </div>
  );
}