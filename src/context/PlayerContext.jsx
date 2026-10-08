import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { apiFetch } from "../lib/api.js";
import { useToast } from "./ToastContext.jsx";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackMode, setPlaybackMode] = useState("sequential"); // 'sequential' | 'shuffle'
  const [repeatMode, setRepeatMode] = useState("off"); // 'off' | 'one' | 'all'
  const [isExpanded, setIsExpanded] = useState(false); // Mobile expanded player modal

  const { showToast } = useToast();

  const playerRef = useRef(null);
  const isApiReadyRef = useRef(false);
  const timerRef = useRef(null);
  const lastRecordedSongIdRef = useRef(null);
  const mediaSessionActionsRef = useRef({});

  // Initialize YouTube IFrame API script
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.YT && window.YT.Player) {
      isApiReadyRef.current = true;
      initPlayer();
      return;
    }

    // Load official script
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      isApiReadyRef.current = true;
      initPlayer();
    };

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Initialize YT Player Instance
  const initPlayer = () => {
    if (!window.YT || !window.YT.Player || playerRef.current) return;

    try {
      playerRef.current = new window.YT.Player("aurawave-yt-iframe", {
        height: "100%",
        width: "100%",
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            event.target.setVolume(volume);
          },
          onStateChange: handlePlayerStateChange,
          onError: handlePlayerError,
        },
      });
    } catch (e) {
      console.warn("YT player init error:", e);
    }
  };

  // Sync timer during playback
  const startProgressTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (
        playerRef.current &&
        typeof playerRef.current.getCurrentTime === "function"
      ) {
        const cur = playerRef.current.getCurrentTime() || 0;
        const dur = playerRef.current.getDuration() || 0;
        setCurrentTime(cur);
        if (dur > 0) setDuration(dur);
      }
    }, 500);
  };

  const stopProgressTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Handle YouTube Player Events
  const handlePlayerStateChange = (event) => {
    if (!window.YT) return;

    // 1: PLAYING
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      setIsBuffering(false);
      startProgressTimer();

      // Record playback to user history (once per song play)
      if (currentSong && lastRecordedSongIdRef.current !== currentSong._id) {
        lastRecordedSongIdRef.current = currentSong._id;
        apiFetch("/api/history", {
          method: "POST",
          body: JSON.stringify({ songId: currentSong._id }),
        }).catch(() => {});
      }
    }
    // 2: PAUSED
    else if (event.data === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
      setIsBuffering(false);
      stopProgressTimer();
    }
    // 3: BUFFERING
    else if (event.data === window.YT.PlayerState.BUFFERING) {
      setIsBuffering(true);
    }
    // 0: ENDED
    else if (event.data === window.YT.PlayerState.ENDED) {
      setIsPlaying(false);
      stopProgressTimer();
      handleSongEnded();
    }
  };

  const handlePlayerError = (event) => {
    setIsBuffering(false);
    setIsPlaying(false);
    console.warn("YouTube Player Error Code:", event.data);
    showToast(
      "YouTube video could not be played. Skipping to next song.",
      "error",
    );
    setTimeout(() => {
      nextSong();
    }, 1200);
  };

  // Auto-play logic when song finishes
  const handleSongEnded = () => {
    if (repeatMode === "one") {
      if (playerRef.current?.seekTo) {
        playerRef.current.seekTo(0);
        playerRef.current.playVideo();
      }
      return;
    }

    // Next song in queue
    if (queue.length > 0) {
      if (currentIndex < queue.length - 1) {
        playSongAtIndex(currentIndex + 1);
      } else if (repeatMode === "all") {
        playSongAtIndex(0);
      } else {
        // Queue finished
        setIsPlaying(false);
        showToast("Queue completed.", "info");
      }
    }
  };

  // Media Session metadata and lock-screen controls
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    const mediaSession = navigator.mediaSession;
    if (!currentSong) {
      mediaSession.metadata = null;
      mediaSession.playbackState = "none";
      return;
    }

    mediaSession.metadata = new window.MediaMetadata({
      title: currentSong.title,
      artist: currentSong.channelName || "YouTube Music",
      album: "AuraWave Personal Player",
      artwork: [
        {
          src:
            currentSong.thumbnail ||
            `https://i.ytimg.com/vi/${currentSong.youtubeVideoId}/hqdefault.jpg`,
          sizes: "512x512",
          type: "image/jpeg",
        },
      ],
    });

    const handlers = {
      play: () => mediaSessionActionsRef.current.play?.(),
      pause: () => mediaSessionActionsRef.current.pause?.(),
      previoustrack: () => mediaSessionActionsRef.current.prevSong?.(),
      nexttrack: () => mediaSessionActionsRef.current.nextSong?.(),
      seekto: (details) => {
        if (details.seekTime !== undefined)
          mediaSessionActionsRef.current.seekTo?.(details.seekTime);
      },
      seekbackward: (details) =>
        mediaSessionActionsRef.current.seekBy?.(-(details.seekOffset || 10)),
      seekforward: (details) =>
        mediaSessionActionsRef.current.seekBy?.(details.seekOffset || 10),
    };

    for (const [action, handler] of Object.entries(handlers)) {
      try {
        mediaSession.setActionHandler(action, handler);
      } catch {}
    }

    return () => {
      for (const action of Object.keys(handlers)) {
        try {
          mediaSession.setActionHandler(action, null);
        } catch {}
      }
    };
  }, [currentSong]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator))
      return;

    const mediaSession = navigator.mediaSession;
    mediaSession.playbackState = currentSong
      ? isPlaying
        ? "playing"
        : "paused"
      : "none";

    if (
      currentSong &&
      duration > 0 &&
      typeof mediaSession.setPositionState === "function"
    ) {
      try {
        mediaSession.setPositionState({
          duration,
          playbackRate: 1,
          position: Math.min(currentTime, duration),
        });
      } catch {}
    }
  }, [currentSong, currentTime, duration, isPlaying]);

  // Load a video into the player
  const loadVideo = (videoId) => {
    if (!playerRef.current || !playerRef.current.loadVideoById) {
      // If player element exists but not fully ready, retry briefly
      setTimeout(() => loadVideo(videoId), 300);
      return;
    }

    try {
      playerRef.current.loadVideoById(videoId);
      setIsPlaying(true);
      setCurrentTime(0);
    } catch (err) {
      console.warn("Error loading video by ID:", err);
    }
  };

  // Play a specific song and optionally replace current queue
  const playSong = (song, newQueue = null) => {
    if (!song) return;

    if (newQueue) {
      setQueue(newQueue);
      const idx = newQueue.findIndex((s) => s._id === song._id);
      setCurrentIndex(idx !== -1 ? idx : 0);
    } else {
      // If not in current queue, append
      const existingIdx = queue.findIndex((s) => s._id === song._id);
      if (existingIdx !== -1) {
        setCurrentIndex(existingIdx);
      } else {
        const updated = [...queue, song];
        setQueue(updated);
        setCurrentIndex(updated.length - 1);
      }
    }

    setCurrentSong(song);
    loadVideo(song.youtubeVideoId);
  };

  // Play at queue index
  const playSongAtIndex = (index) => {
    if (index >= 0 && index < queue.length) {
      setCurrentIndex(index);
      const song = queue[index];
      setCurrentSong(song);
      loadVideo(song.youtubeVideoId);
    }
  };

  // Toggle play / pause
  const togglePlay = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo?.();
    } else {
      if (!currentSong && queue.length > 0) {
        playSongAtIndex(0);
      } else {
        playerRef.current.playVideo?.();
      }
    }
  };

  // Next song
  const nextSong = () => {
    if (queue.length === 0) return;

    if (playbackMode === "shuffle" && queue.length > 1) {
      // Pick random index different from current
      let randIdx = Math.floor(Math.random() * queue.length);
      if (randIdx === currentIndex) {
        randIdx = (randIdx + 1) % queue.length;
      }
      playSongAtIndex(randIdx);
      return;
    }

    if (currentIndex < queue.length - 1) {
      playSongAtIndex(currentIndex + 1);
    } else if (repeatMode === "all") {
      playSongAtIndex(0);
    } else {
      showToast("End of queue reached.", "info");
    }
  };

  // Previous song
  const prevSong = () => {
    if (queue.length === 0) return;

    // If more than 3 seconds in, restart current song
    if (currentTime > 3 && playerRef.current?.seekTo) {
      playerRef.current.seekTo(0);
      return;
    }

    if (currentIndex > 0) {
      playSongAtIndex(currentIndex - 1);
    } else {
      // Loop to end or restart
      playSongAtIndex(queue.length - 1);
    }
  };

  // Seek
  const seekTo = (seconds) => {
    if (playerRef.current?.seekTo) {
      playerRef.current.seekTo(seconds, true);
      setCurrentTime(seconds);
    }
  };

  mediaSessionActionsRef.current = {
    play: () => {
      if (!playerRef.current) return;
      if (!currentSong && queue.length > 0) {
        playSongAtIndex(0);
      } else {
        playerRef.current.playVideo?.();
      }
    },
    pause: () => playerRef.current?.pauseVideo?.(),
    nextSong,
    prevSong,
    seekTo,
    seekBy: (offset) =>
      seekTo(Math.max(0, Math.min(duration, currentTime + offset))),
  };

  // Volume
  const setVolume = (val) => {
    const clamped = Math.max(0, Math.min(100, val));
    setVolumeState(clamped);
    setIsMuted(clamped === 0);
    if (playerRef.current?.setVolume) {
      playerRef.current.setVolume(clamped);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(volume || 50);
    } else {
      setIsMuted(true);
      if (playerRef.current?.setVolume) {
        playerRef.current.setVolume(0);
      }
    }
  };

  // Add song to queue
  const addToQueue = (song) => {
    if (!song) return;
    setQueue((prev) => {
      const exists = prev.some((s) => s._id === song._id);
      if (exists) {
        showToast("Song is already in queue.", "info");
        return prev;
      }
      showToast("Added to queue.", "success");
      return [...prev, song];
    });
  };

  // Remove from queue
  const removeFromQueue = (indexToRemove) => {
    setQueue((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      if (indexToRemove < currentIndex) {
        setCurrentIndex((c) => c - 1);
      } else if (indexToRemove === currentIndex) {
        if (updated.length > 0) {
          const nextIdx = Math.min(indexToRemove, updated.length - 1);
          setCurrentIndex(nextIdx);
          setCurrentSong(updated[nextIdx]);
          loadVideo(updated[nextIdx].youtubeVideoId);
        } else {
          setCurrentSong(null);
          setCurrentIndex(-1);
          setIsPlaying(false);
        }
      }
      return updated;
    });
    showToast("Removed from queue.", "info");
  };

  // Clear queue
  const clearQueue = () => {
    setQueue([]);
    setCurrentIndex(-1);
    setCurrentSong(null);
    setIsPlaying(false);
    if (playerRef.current?.stopVideo) {
      playerRef.current.stopVideo();
    }
    showToast("Queue cleared.", "info");
  };

  // Reorder queue
  const reorderQueue = (newQueue) => {
    setQueue(newQueue);
    if (currentSong) {
      const newIdx = newQueue.findIndex((s) => s._id === currentSong._id);
      if (newIdx !== -1) {
        setCurrentIndex(newIdx);
      }
    }
  };

  // Cycle playback mode: sequential -> shuffle
  const togglePlaybackMode = () => {
    const nextMode = playbackMode === "sequential" ? "shuffle" : "sequential";
    setPlaybackMode(nextMode);
    showToast(
      nextMode === "shuffle"
        ? "Shuffle mode enabled"
        : "Sequential mode enabled",
      "info",
    );
  };

  // Cycle repeat mode: off -> one -> all
  const toggleRepeatMode = () => {
    let next;
    if (repeatMode === "off") next = "all";
    else if (repeatMode === "all") next = "one";
    else next = "off";

    setRepeatMode(next);
    const labels = {
      off: "Repeat off",
      one: "Repeat current song",
      all: "Repeat queue",
    };
    showToast(labels[next], "info");
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        queue,
        currentIndex,
        isPlaying,
        isBuffering,
        currentTime,
        duration,
        volume,
        isMuted,
        playbackMode,
        repeatMode,
        isExpanded,
        setIsExpanded,
        playSong,
        playSongAtIndex,
        togglePlay,
        nextSong,
        prevSong,
        seekTo,
        setVolume,
        toggleMute,
        addToQueue,
        removeFromQueue,
        clearQueue,
        reorderQueue,
        togglePlaybackMode,
        toggleRepeatMode,
      }}
    >
      {children}
      {/* YouTube IFrame container with standard dimensions for uninterrupted playback */}
      <div
        id="aurawave-yt-iframe-container"
        className="fixed bottom-0 right-0 w-[240px] h-[140px] opacity-[0.01] pointer-events-none overflow-hidden z-[-1]"
        aria-hidden="true"
      >
        <div id="aurawave-yt-iframe" />
      </div>
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within PlayerProvider");
  }
  return context;
}
