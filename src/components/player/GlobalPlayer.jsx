import React, { useState } from "react";
import {
  FiPlay,
  FiPause,
  FiSkipBack,
  FiSkipForward,
  FiShuffle,
  FiRepeat,
  FiVolume2,
  FiVolumeX,
  FiList,
  FiHeart,
  FiMaximize2,
  FiLock,
} from "react-icons/fi";
import { usePlayer } from "../../context/PlayerContext.jsx";
import { ExpandedMobilePlayer } from "./ExpandedMobilePlayer.jsx";
import { QueueModal } from "./QueueModal.jsx";
import { apiFetch } from "../../lib/api.js";
import { useToast } from "../../context/ToastContext.jsx";

export function GlobalPlayer({ onSongUpdated }) {
  const {
    currentSong,
    isPlaying,
    isBuffering,
    togglePlay,
    nextSong,
    prevSong,
    currentTime,
    duration,
    seekTo,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    playbackMode,
    togglePlaybackMode,
    repeatMode,
    toggleRepeatMode,
    queue,
    isExpanded,
    setIsExpanded,
    setIsScreenLocked,
  } = usePlayer();

  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const { showToast } = useToast();

  if (!currentSong) return null;

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    try {
      const res = await apiFetch(`/api/songs/${currentSong._id}/favorite`, {
        method: "PATCH",
      });
      currentSong.favorite = res.favorite;
      showToast(res.message, "success");
      if (onSongUpdated) onSongUpdated();
    } catch (e) {
      showToast("Could not update favorite status", "error");
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* =========================================
          MOBILE COMPACT MINI PLAYER (Above bottom nav)
         ========================================= */}
      <div className="lg:hidden fixed bottom-[58px] left-2 right-2 z-30 safe-bottom">
        <div
          onClick={() => setIsExpanded(true)}
          className="glass-panel border border-violet-500/30 rounded-2xl p-2.5 flex items-center gap-3 shadow-2xl shadow-violet-950/80 cursor-pointer overflow-hidden relative"
        >
          {/* Progress thin line at very top of mini-player */}
          <div
            className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Song Thumbnail */}
          <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-white/10">
            <img
              src={
                currentSong.thumbnail ||
                `https://i.ytimg.com/vi/${currentSong.youtubeVideoId}/hqdefault.jpg`
              }
              alt={currentSong.title}
              className="w-full h-full object-cover"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-0.5">
                <span className="w-1 bg-violet-400 rounded-full eq-bar-1" />
                <span className="w-1 bg-fuchsia-400 rounded-full eq-bar-2" />
                <span className="w-1 bg-indigo-400 rounded-full eq-bar-3" />
              </div>
            )}
          </div>

          {/* Song Details */}
          <div className="flex-1 min-w-0 pr-1">
            <h4 className="text-xs font-semibold text-white truncate">
              {currentSong.title}
            </h4>
            <p className="text-[11px] text-slate-400 truncate">
              {currentSong.channelName}
            </p>
          </div>

          {/* Controls */}
          <div
            className="flex items-center gap-1 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsScreenLocked(true)}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              aria-label="Lock screen"
              title="Lock screen"
            >
              <FiLock className="text-base" />
            </button>

            <button
              onClick={handleToggleFavorite}
              className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
              aria-label="Favorite"
            >
              <FiHeart
                className={`text-base ${
                  currentSong.favorite ? "text-rose-500 fill-rose-500" : ""
                }`}
              />
            </button>

            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-md active:scale-90 transition-transform"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <FiPause className="text-sm fill-white" />
              ) : (
                <FiPlay className="text-sm fill-white ml-0.5" />
              )}
            </button>

            <button
              onClick={nextSong}
              className="p-2 text-slate-300 hover:text-white active:scale-95 transition-transform"
              aria-label="Next song"
            >
              <FiSkipForward className="text-base" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================
          DESKTOP PERSISTENT BOTTOM PLAYER BAR
         ========================================= */}
      <div className="hidden lg:block fixed bottom-0 left-0 right-0 z-40 bg-[#0c0d16]/95 backdrop-blur-xl border-t border-white/10 px-6 py-2.5 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          {/* Left: Song Info */}
          <div className="flex items-center gap-3.5 w-1/4 min-w-[220px]">
            <img
              src={
                currentSong.thumbnail ||
                `https://i.ytimg.com/vi/${currentSong.youtubeVideoId}/hqdefault.jpg`
              }
              alt={currentSong.title}
              className="w-13 h-13 rounded-xl object-cover bg-slate-800 border border-white/10 shadow-md shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h4
                className="text-xs sm:text-sm font-semibold text-white truncate"
                title={currentSong.title}
              >
                {currentSong.title}
              </h4>
              <p className="text-xs text-slate-400 truncate">
                {currentSong.channelName}
              </p>
            </div>
            <button
              onClick={handleToggleFavorite}
              className="p-2 text-slate-400 hover:text-rose-400 rounded-lg transition-colors shrink-0"
              aria-label="Toggle favorite"
            >
              <FiHeart
                className={`text-base ${
                  currentSong.favorite ? "text-rose-500 fill-rose-500" : ""
                }`}
              />
            </button>
          </div>

          {/* Middle: Controls & Progress Scrubber */}
          <div className="flex-1 max-w-2xl flex flex-col items-center">
            {/* Buttons */}
            <div className="flex items-center gap-4 mb-1.5">
              <button
                onClick={togglePlaybackMode}
                className={`p-1.5 rounded-lg transition-colors ${
                  playbackMode === "shuffle"
                    ? "text-violet-400 bg-violet-500/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title={`Shuffle: ${playbackMode}`}
                aria-label={`Shuffle: ${playbackMode}`}
              >
                <FiShuffle className="text-sm" />
              </button>

              <button
                onClick={prevSong}
                className="p-1.5 text-slate-300 hover:text-white transition-colors"
                title="Previous"
                aria-label="Previous song"
              >
                <FiSkipBack className="text-lg" />
              </button>

              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-lg shadow-violet-600/30 active:scale-95 transition-all"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <FiPause className="text-base fill-white" />
                ) : (
                  <FiPlay className="text-base fill-white ml-0.5" />
                )}
              </button>

              <button
                onClick={nextSong}
                className="p-1.5 text-slate-300 hover:text-white transition-colors"
                title="Next"
                aria-label="Next song"
              >
                <FiSkipForward className="text-lg" />
              </button>

              <button
                onClick={toggleRepeatMode}
                className={`p-1.5 rounded-lg relative transition-colors ${
                  repeatMode !== "off"
                    ? "text-violet-400 bg-violet-500/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title={`Repeat: ${repeatMode}`}
                aria-label={`Repeat mode: ${repeatMode}`}
              >
                <FiRepeat className="text-sm" />
                {repeatMode === "one" && (
                  <span className="absolute -top-1 -right-1 text-[8px] font-bold text-violet-300 bg-violet-950 rounded-full px-1">
                    1
                  </span>
                )}
              </button>
            </div>

            {/* Time Scrubber */}
            <div className="w-full flex items-center gap-3">
              <span className="text-[11px] font-mono text-slate-400 w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <div className="flex-1 relative flex items-center">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => seekTo(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${progressPercent}%, #23263b ${progressPercent}%, #23263b 100%)`,
                  }}
                />
              </div>
              <span className="text-[11px] font-mono text-slate-400 w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right: Volume & Queue */}
          <div className="flex items-center justify-end gap-3 w-1/4 min-w-[200px]">
            {/* Queue Toggle */}
            <button
              onClick={() => setIsQueueOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-white/5 transition-colors"
              title="View Queue"
              aria-label="View Queue"
            >
              <FiList />
              <span>Queue ({queue.length})</span>
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <FiVolumeX className="text-base" />
                ) : (
                  <FiVolume2 className="text-base" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                className="w-20 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <button
              onClick={() => setIsScreenLocked(true)}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Lock screen"
              aria-label="Lock screen"
            >
              <FiLock className="text-base" />
            </button>
          </div>
        </div>
      </div>

      {/* Full-screen Mobile Expanded Player Sheet */}
      <ExpandedMobilePlayer
        isOpen={isExpanded}
        onClose={() => setIsExpanded(false)}
        onOpenQueue={() => {
          setIsExpanded(false);
          setIsQueueOpen(true);
        }}
        onSongUpdated={onSongUpdated}
      />

      {/* Queue Modal */}
      <QueueModal isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
    </>
  );
}
