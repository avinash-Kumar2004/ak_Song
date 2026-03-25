import { useState, useRef, useEffect, useCallback } from "react";
import ALBUMS from "../data/albums";
import ARTISTS from "../data/artists";
import usePlayer from "../hooks/usePlayer";
import BHAKTI from "../data/bhakti";
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

// ─── REPLACE YOUR EXISTING PlayerBar FUNCTION WITH THIS ───────────────────────
// Sirf PlayerBar function replace karo, baaki code same rahega

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
  } = player;
  const [loop, setLoop] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const isFav = favorites.some((f) => f.id === song?.id);
  const totalSecs = getDurationSecs(song);
  const elapsed = Math.floor((progress / 100) * totalSecs);
  const fmt = (s) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const seekRelative = (deltaSec) => {
    if (!totalSecs) return;
    const newSec = Math.max(0, Math.min(totalSecs, elapsed + deltaSec));
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
      {/* ── Top seekbar strip ── */}
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

      {/* ── Main row ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          padding: "8px 12px 10px",
          gap: 8,
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        {/* LEFT: cover + title + fav */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            minWidth: 0,
          }}
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

        {/* CENTER: controls + seekbar — full-width column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 5,
            minWidth: 0,
          }}
        >
          {/* Control buttons row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <IBtn
              icon="⇄"
              active={shuffle}
              onClick={() => setShuffle((v) => !v)}
            />
            <SkipBtn label="-5s" onClick={() => seekRelative(-5)} />
            <IBtn icon="⏮" size={16} onClick={() => seek(0)} />

            {/* Play/Pause */}
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
                transition: "transform 0.1s",
              }}
              onMouseDown={(e) =>
                (e.currentTarget.style.transform = "scale(0.9)")
              }
              onMouseUp={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              {playing ? "⏸" : "▶"}
            </button>

            <IBtn icon="⏭" size={16} onClick={() => seek(100)} />
            <SkipBtn label="+5s" onClick={() => seekRelative(5)} />
            <IBtn icon="↺" active={loop} onClick={() => setLoop((v) => !v)} />
          </div>

          {/* Seekbar + timestamps */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              width: "100%",
            }}
          >
            <span
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.3)",
                minWidth: 28,
                flexShrink: 0,
              }}
            >
              {fmt(elapsed)}
            </span>
            <div
              style={{
                flex: 1,
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
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: ACCENT,
                  borderRadius: 2,
                  transition: "width 0.12s linear",
                }}
              />
            </div>
            <span
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.3)",
                minWidth: 28,
                textAlign: "right",
                flexShrink: 0,
              }}
            >
              {song?.duration || "—"}
            </span>
          </div>
        </div>

        {/* RIGHT: volume + close */}
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

// ─── NEW helper component — SkipBtn (+5s / -5s) ───────────────────────────
// Ye bhi add karo (IBtn ke paas)
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
        transition: "color 0.15s",
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

// ─── GlobalStyles mein ye CSS bhi add karo (existing .hidden-mobile-vol ke baad) ─
/*
@media(max-width:767px){
  .hidden-mobile-vol { display:none!important; }
}
*/
// NOTE: Ye already tumhare GlobalStyles mein hai, kuch aur add nahi karna

function IBtn({ icon, active, onClick, size = 14 }) {
  return (
    <button
      onClick={onClick}
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
        outline: "none",
        transition: "background 0.15s",
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

// ─── Song Row ───────────────────────────────────────────────────────────────
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
          minWidth: 0,
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

// ─── AlbumDetail ────────────────────────────────────────────────────────────
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
                transition: "transform 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.08)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
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

// ─── ArtistDetail ───────────────────────────────────────────────────────────
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
            onClick={() => play(artist.songs[0], null)}
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
            onPlay={() => play(song, null)}
            togglePlay={togglePlay}
            isFav={favorites.some((f) => f.id === song.id)}
            onFav={() => onToggleFav(song, null)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── LikedSongsPage ─────────────────────────────────────────────────────────
function LikedSongsPage({ player, favorites, onToggleFav, onBack }) {
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
              onClick={() => play(favorites[0], null)}
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
          Abhi koi liked song nahi
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
              onPlay={() => play(song, null)}
              togglePlay={togglePlay}
              isFav={true}
              onFav={() => onToggleFav(song, null)}
              showCover={true}
              coverSrc={song.albumCover}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SidebarContents ────────────────────────────────────────────────────────
function SidebarContents({
  playlists,
  favorites,
  uploadCount,
  onLiked,
  onNewPl,
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
          transition: "background 0.15s",
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
        {playlists.map((pl) => (
          <div
            key={pl.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 14px",
              borderTop: "1px solid rgba(255,255,255,0.04)",
              cursor: "pointer",
              transition: "background 0.15s",
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
                  color: "#fff",
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
        ))}
      </div>

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
          MP3 daal, real audio bajega
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

// ─── Mobile Sidebar Drawer ──────────────────────────────────────────────────
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

// ─── HOME ────────────────────────────────────────────────────────────────────
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [localFavorites, setLocalFavorites] = useState(() =>
    LS.get("sw_favorites", []),
  );
  const [localPlaylists, setLocalPlaylists] = useState(() =>
    LS.get("sw_playlists", [
      { id: "pl1", title: "My Favorites", songs: [], color: "#6c63ff" },
      { id: "pl2", title: "Workout Bangers", songs: [], color: "#ff6b35" },
      { id: "pl3", title: "Late Night Vibes", songs: [], color: "#00d4ff" },
    ]),
  );

  const favorites = sharedFavorites ?? localFavorites;
  const setFavorites = sharedFavorites ? setSharedFavorites : setLocalFavorites;
  const playlists = sharedPlaylists ?? localPlaylists;
  const setPlaylists = sharedPlaylists ? setSharedPlaylists : setLocalPlaylists;

  const [uploadedSongs, setUploadedSongs] = useState(() =>
    LS.get("sw_uploads_meta", []),
  );
  const [blobUrls, setBlobUrls] = useState({});
  const [showNewPl, setShowNewPl] = useState(false);
  const [newPlName, setNewPlName] = useState("");

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
    onRegisterUploadHandler?.((e) => handleUpload(e));
  }, []);

  const toggleFav = useCallback(
    (song, album) => {
      setFavorites((prev) => {
        const exists = prev.some((f) => f.id === song.id);
        return exists
          ? prev.filter((f) => f.id !== song.id)
          : [
              ...prev,
              { ...song, albumCover: album?.cover, albumTitle: album?.title },
            ];
      });
    },
    [setFavorites],
  );

  const handleUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const blobUrl = URL.createObjectURL(file);
      const id = `up_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const song = {
        id,
        title: file.name.replace(/\.[^.]+$/, ""),
        artists: "Uploaded by you",
        duration: "—",
        uploadedAt: Date.now(),
      };
      setBlobUrls((prev) => ({ ...prev, [id]: blobUrl }));
      setUploadedSongs((prev) => [song, ...prev]);
      play({ ...song, url: blobUrl }, null);
    });
    e.target.value = "";
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
    fileRef,
    onUpload: handleUpload,
  };

  const renderContent = () => {
    if (view === "liked")
      return (
        <LikedSongsPage
          player={player}
          favorites={favorites}
          onToggleFav={toggleFav}
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

    return (
      <div style={{ animation: "fadeUp 0.35s ease" }}>
        {uploadedSongs.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <SectionHead title="Your Songs" />
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.06)",
                overflow: "hidden",
              }}
            >
              {uploadedSongs.map((song, i) => {
                const withUrl = { ...song, url: blobUrls[song.id] };
                return (
                  <SongRow
                    key={song.id}
                    song={song}
                    idx={i}
                    active={curSong?.id === song.id}
                    playing={playing}
                    onPlay={() => play(withUrl, null)}
                    togglePlay={togglePlay}
                    isFav={favorites.some((f) => f.id === song.id)}
                    onFav={() => toggleFav(song, null)}
                  />
                );
              })}
            </div>
          </section>
        )}

        <section style={{ marginBottom: 32 }}>
          <SectionHead title="Trending Songs" />
          <div
            style={{
              display: "flex",
              gap: 14,
              overflowX: "auto",
              paddingBottom: 8,
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
            }}
            className="hide-scroll"
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
                    transition: "border-color 0.2s, transform 0.2s",
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

        <section style={{ marginBottom: 32 }}>
          <SectionHead title="Popular Artists" />
          <div
            style={{
              display: "flex",
              gap: 14,
              overflowX: "auto",
              paddingBottom: 8,
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
            }}
            className="hide-scroll"
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
                    transition: "border-color 0.2s, transform 0.2s",
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
      </div>
    );
  };

  return (
    <>
      <GlobalStyles />
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
        <main style={{ flex: 1, overflowY: "auto", padding: "16px 18px 20px" }}>
          {renderContent()}
        </main>
      </div>
      {playerVisible && curSong && (
        <PlayerBar
          player={player}
          favorites={favorites}
          onToggleFav={toggleFav}
        />
      )}
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
            animation: "fadeIn 0.2s ease",
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

export { LikedSongsPage as FavoritePage };
