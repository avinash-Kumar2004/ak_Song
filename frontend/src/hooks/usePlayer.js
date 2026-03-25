// hooks/usePlayer.js
import { useState, useRef, useEffect, useCallback } from "react";

export default function usePlayer() {
  const audioRef = useRef(null);
  const fakeTimerRef = useRef(null);

  const [song, setSong] = useState(null);
  const [album, setAlbum] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [visible, setVisible] = useState(false);
  const [fakeMode, setFakeMode] = useState(false);
  const [duration, setDuration] = useState(0);
  const [loadError, setLoadError] = useState(false);

  // Init audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.8;
    audio.preload = "metadata";
    audioRef.current = audio;

    audio.addEventListener("timeupdate", () => {
      if (audio.duration && isFinite(audio.duration)) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    });

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });

    audio.addEventListener("ended", () => {
      setPlaying(false);
      setProgress(100);
    });

    audio.addEventListener("error", () => {
      // Page load pe blank src hoti hai — us pe error ignore karo
      if (!audio.src || audio.src === window.location.href) return;

      console.warn("[Player] Audio load failed, switching to preview mode");
      setLoadError(true);
      setFakeMode(true);
      setPlaying(true);
    });

    audio.addEventListener("canplay", () => {
      setLoadError(false);
    });

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Fake progress ticker (jab real audio nahi hai)
  useEffect(() => {
    clearInterval(fakeTimerRef.current);
    if (fakeMode && playing) {
      fakeTimerRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            setPlaying(false);
            return 100;
          }
          return p + 0.22;
        });
      }, 150);
    }
    return () => clearInterval(fakeTimerRef.current);
  }, [fakeMode, playing]);

  const play = useCallback((newSong, newAlbum) => {
    if (!newSong) return;
    const audio = audioRef.current;

    setSong(newSong);
    setAlbum(newAlbum);
    setVisible(true);
    setProgress(0);
    setLoadError(false);
    setFakeMode(false);              // ← pehle reset karo
    clearInterval(fakeTimerRef.current);

    // file ya url dono support karo
    const filePath = newSong.file || newSong.url;

    if (filePath) {
      // Stop current playback
      audio.pause();
      audio.currentTime = 0;
      audio.src = filePath;

      const tryPlay = audio.play();
      if (tryPlay !== undefined) {
        tryPlay
          .then(() => {
            setPlaying(true);
            setFakeMode(false);
          })
          .catch((err) => {
            console.warn("[Player] play() failed:", err.name, err.message);

            if (err.name === "NotAllowedError") {
              // Autoplay block — audio load hua hai, user click karega toh chalega
              setFakeMode(false);
              setPlaying(false);
            } else {
              // Real error — file nahi mili etc
              setFakeMode(true);
              setPlaying(true);
            }
          });
      }
    } else {
      // Koi file nahi — preview/fake mode
      audio.pause();
      setFakeMode(true);
      setPlaying(true);
    }
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (fakeMode) {
      setPlaying((p) => !p);
      return;
    }
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => {
          setFakeMode(true);
          setPlaying(true);
        });
    }
  }, [playing, fakeMode]);

  const seek = useCallback(
    (pct) => {
      const audio = audioRef.current;
      setProgress(pct);
      if (!fakeMode && audio && audio.duration && isFinite(audio.duration)) {
        audio.currentTime = (pct / 100) * audio.duration;
      }
    },
    [fakeMode]
  );

  const setVolume = useCallback((v) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  const close = useCallback(() => {
    audioRef.current?.pause();
    clearInterval(fakeTimerRef.current);
    setVisible(false);
    setPlaying(false);
    setProgress(0);
  }, []);

  // Duration string se seconds nikalo
  const getDurationSecs = useCallback(
    (s) => {
      if (!fakeMode && duration && isFinite(duration)) return duration;
      const str = s?.duration || "3:30";
      const [m, sec] = str.split(":").map(Number);
      return (m || 0) * 60 + (sec || 0);
    },
    [fakeMode, duration]
  );

  return {
    // State
    song,
    album,
    playing,
    progress,
    volume,
    visible,
    fakeMode,
    loadError,
    // Actions
    play,
    togglePlay,
    seek,
    setVolume,
    close,
    getDurationSecs,
    // Direct setters
    setVisible,
    setPlaying,
  };
}