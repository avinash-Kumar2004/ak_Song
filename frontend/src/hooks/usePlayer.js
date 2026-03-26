/**
 * usePlayer — Fixed
 * KEY FIX: src = song.url || song.preview || song.file  ← "file" field support added
 */

import { useState, useRef, useEffect, useCallback } from "react";

const DURATION_MAP = {
  "3:30": 210, "3:45": 225, "4:00": 240, "4:15": 255,
  "4:30": 270, "3:20": 200, "2:58": 178, "3:55": 235,
  "5:10": 310, "4:45": 285, "3:10": 190, "2:45": 165,
  "3:18": 198, "2:54": 174, "3:42": 222, "2:59": 179,
  "4:08": 248, "3:41": 221, "3:27": 207,
};

function parseDuration(dur) {
  if (!dur || dur === "—") return 0;
  if (DURATION_MAP[dur]) return DURATION_MAP[dur];
  const parts = dur.split(":");
  return (Number(parts[0]) || 0) * 60 + (Number(parts[1]) || 0);
}

export default function usePlayer() {
  const audioRef  = useRef(null);
  const rafRef    = useRef(null);
  const queueRef  = useRef([]);
  const albumRef  = useRef(null);
  const loopRef   = useRef(false);

  const [song,     setSong]       = useState(null);
  const [album,    setAlbum]      = useState(null);
  const [playing,  setPlaying]    = useState(false);
  const [progress, setProgress]   = useState(0);
  const [volume,   setVol]        = useState(0.8);
  const [visible,  setVisible]    = useState(false);
  const [loop,     _setLoopState] = useState(false);
  const [noAudio,  setNoAudio]    = useState(false);

  const setLoop = useCallback((val) => {
    const next = typeof val === "function" ? val(loopRef.current) : val;
    loopRef.current = next;
    _setLoopState(next);
  }, []);

  // _playSong via ref — no stale closures
  const _playSongRef = useRef(null);
  _playSongRef.current = (targetSong, ctx) => {
    if (!targetSong) return;
    const audio = audioRef.current;
    if (!audio) return;

    setSong(targetSong);
    setAlbum(ctx);
    setVisible(true);
    setProgress(0);
    albumRef.current = ctx;
    audio._currentSongId = targetSong.id;

    // ✅ THE FIX: check url, preview, AND file
    const src = targetSong.url || targetSong.preview || targetSong.file;

    if (!src) {
      setNoAudio(true);
      setPlaying(false);
      console.warn(`[usePlayer] No audio source for: "${targetSong.title}"`);
      return;
    }

    setNoAudio(false);
    audio.pause();
    audio.src = src;
    audio.load();
    audio.play().catch(err => {
      if (err.name !== "AbortError") {
        console.warn("[usePlayer] play() failed:", err.message);
      }
    });
  };

  // Audio element — init once
  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.8;
    audioRef.current = audio;

    const tick = () => {
      if (!audio.paused && audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    const onPlay  = () => { setPlaying(true);  rafRef.current = requestAnimationFrame(tick); };
    const onPause = () => { setPlaying(false); cancelAnimationFrame(rafRef.current); };
    const onEnded = () => {
      setPlaying(false);
      cancelAnimationFrame(rafRef.current);
      setProgress(0);

      if (loopRef.current) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }

      const queue = queueRef.current;
      if (queue.length < 2) return;
      const idx = queue.findIndex(s => s.id === audio._currentSongId);
      if (idx === -1) return;
      const next = queue[idx + 1];
      if (next) _playSongRef.current(next, albumRef.current);
    };

    audio.addEventListener("play",  onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      cancelAnimationFrame(rafRef.current);
      audio.pause();
      audio.removeEventListener("play",  onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const play = useCallback((targetSong, ctx) => {
    if (!targetSong) return;
    queueRef.current = ctx?.songs?.length ? ctx.songs : [targetSong];
    _playSongRef.current(targetSong, ctx);
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    audio.paused ? audio.play().catch(() => {}) : audio.pause();
  }, []);

  const seek = useCallback((pct) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = (pct / 100) * audio.duration;
    setProgress(pct);
  }, []);

  const setVolume = useCallback((val) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVol(clamped);
    if (audioRef.current) audioRef.current.volume = clamped;
  }, []);

  const close = useCallback(() => {
    const audio = audioRef.current;
    if (audio) { audio.pause(); audio.src = ""; }
    cancelAnimationFrame(rafRef.current);
    setSong(null); setAlbum(null);
    setPlaying(false); setProgress(0);
    setVisible(false); setNoAudio(false);
    queueRef.current = [];
    albumRef.current = null;
  }, []);

  const playNext = useCallback(() => {
    const queue = queueRef.current;
    const audio = audioRef.current;
    if (!queue.length || !audio) return;
    const idx = queue.findIndex(s => s.id === audio._currentSongId);
    const next = queue[idx + 1];
    if (next) _playSongRef.current(next, albumRef.current);
  }, []);

  const playPrev = useCallback(() => {
    const queue = queueRef.current;
    const audio = audioRef.current;
    if (!queue.length || !audio) return;
    if (audio.currentTime > 3) { audio.currentTime = 0; return; }
    const idx = queue.findIndex(s => s.id === audio._currentSongId);
    const prev = queue[idx - 1];
    if (prev) _playSongRef.current(prev, albumRef.current);
  }, []);

  const getDurationSecs = useCallback((s) => {
    if (!s) return 0;
    const dur = audioRef.current?.duration;
    if (dur && !isNaN(dur)) return Math.floor(dur);
    return parseDuration(s.duration);
  }, []);

  return {
    song, album, playing, progress, volume, visible, loop, noAudio,
    play, togglePlay, seek, setVolume, close,
    getDurationSecs, setLoop, playNext, playPrev,
  };
}