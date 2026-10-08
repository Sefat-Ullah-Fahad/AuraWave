import React, { useEffect, useRef } from 'react';
import {
  FiChevronDown,
  FiPlay,
  FiPause,
  FiSkipBack,
  FiSkipForward,
  FiShuffle,
  FiRepeat,
  FiHeart,
  FiList,
  FiVolume2,
  FiVolumeX,
} from 'react-icons/fi';
import gsap from 'gsap';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { apiFetch } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export function ExpandedMobilePlayer({ isOpen, onClose, onOpenQueue, onSongUpdated }) {
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
    playbackMode,
    togglePlaybackMode,
    repeatMode,
    toggleRepeatMode,
    volume,
    setVolume,
    isMuted,
    toggleMute,
  } = usePlayer();

  const { showToast } = useToast();
  const modalRef = useRef(null);
  const artworkRef = useRef(null);

  // GSAP slide-up animation
  useEffect(() => {
    if (!isOpen) return;

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { y: '100%', opacity: 0.8 },
        { y: '0%', opacity: 1, duration: 0.35, ease: 'power3.out' }
      );

      if (artworkRef.current) {
        gsap.fromTo(
          artworkRef.current,
          { scale: 0.9, opacity: 0.5 },
          { scale: 1, opacity: 1, duration: 0.45, delay: 0.1, ease: 'back.out(1.2)' }
        );
      }
    }
  }, [isOpen]);

  if (!isOpen || !currentSong) return null;

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleToggleFavorite = async () => {
    try {
      const res = await apiFetch(`/api/songs/${currentSong._id}/favorite`, { method: 'PATCH' });
      currentSong.favorite = res.favorite;
      showToast(res.message, 'success');
      if (onSongUpdated) onSongUpdated();
    } catch (e) {
      showToast('Could not update favorite status', 'error');
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-[#17122a] via-[#0d0e17] to-[#07080d] p-6 text-white safe-bottom overflow-y-auto"
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-4">
        <button
          onClick={onClose}
          className="p-2 -ml-2 text-slate-300 hover:text-white rounded-full transition-colors active:scale-95"
          aria-label="Collapse player"
        >
          <FiChevronDown className="text-2xl" />
        </button>

        <div className="text-center">
          <p className="text-[10px] tracking-widest uppercase font-semibold text-violet-400">
            Playing From Your Library
          </p>
          <p className="text-xs font-medium text-slate-300 truncate max-w-[200px]">
            {currentSong.channelName}
          </p>
        </div>

        <button
          onClick={onOpenQueue}
          className="p-2 -mr-2 text-slate-300 hover:text-white rounded-full transition-colors active:scale-95"
          aria-label="Open playback queue"
        >
          <FiList className="text-xl" />
        </button>
      </div>

      {/* Main Artwork */}
      <div className="flex-1 flex flex-col items-center justify-center my-6 relative">
        {/* Glow backdrop */}
        <div
          className="absolute w-64 h-64 rounded-full blur-3xl opacity-25 bg-violet-600 pointer-events-none transition-all duration-700"
          style={{ transform: isPlaying ? 'scale(1.2)' : 'scale(0.9)' }}
        />

        <div
          ref={artworkRef}
          className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-2xl shadow-violet-950/80 border border-white/10"
        >
          <img
            src={currentSong.thumbnail || `https://i.ytimg.com/vi/${currentSong.youtubeVideoId}/hqdefault.jpg`}
            alt={currentSong.title}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isPlaying ? 'scale-105' : 'scale-100'
            }`}
          />
          {isBuffering && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
              <div className="w-10 h-10 border-3 border-violet-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Song Info & Favorite */}
      <div className="flex items-center justify-between mb-6">
        <div className="min-w-0 pr-4">
          <h2 className="text-lg sm:text-xl font-bold truncate text-white leading-tight">
            {currentSong.title}
          </h2>
          <p className="text-sm font-medium text-slate-400 truncate mt-1">
            {currentSong.channelName}
          </p>
        </div>
        <button
          onClick={handleToggleFavorite}
          className={`p-2.5 rounded-full transition-transform active:scale-125 ${
            currentSong.favorite
              ? 'text-rose-500 bg-rose-500/10'
              : 'text-slate-400 hover:text-white bg-white/5'
          }`}
          aria-label={currentSong.favorite ? 'Unfavorite song' : 'Favorite song'}
        >
          <FiHeart className={`text-xl ${currentSong.favorite ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Progress Scrubber */}
      <div className="space-y-1.5 mb-6">
        <div className="relative flex items-center">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={(e) => seekTo(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${progressPercent}%, #2d2640 ${progressPercent}%, #2d2640 100%)`,
            }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-mono text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-between mb-8 px-2">
        {/* Shuffle */}
        <button
          onClick={togglePlaybackMode}
          className={`p-2.5 rounded-full transition-colors ${
            playbackMode === 'shuffle'
              ? 'text-violet-400 bg-violet-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label={`Shuffle mode: ${playbackMode}`}
        >
          <FiShuffle className="text-lg" />
        </button>

        {/* Previous */}
        <button
          onClick={prevSong}
          className="p-3 text-slate-200 hover:text-white active:scale-95 transition-transform"
          aria-label="Previous song"
        >
          <FiSkipBack className="text-2xl" />
        </button>

        {/* Play / Pause Circular Glowing Button */}
        <button
          onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-violet-600/40 active:scale-90 transition-all"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <FiPause className="text-2xl fill-white" />
          ) : (
            <FiPlay className="text-2xl fill-white ml-1" />
          )}
        </button>

        {/* Next */}
        <button
          onClick={nextSong}
          className="p-3 text-slate-200 hover:text-white active:scale-95 transition-transform"
          aria-label="Next song"
        >
          <FiSkipForward className="text-2xl" />
        </button>

        {/* Repeat */}
        <button
          onClick={toggleRepeatMode}
          className={`p-2.5 rounded-full relative transition-colors ${
            repeatMode !== 'off'
              ? 'text-violet-400 bg-violet-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label={`Repeat mode: ${repeatMode}`}
        >
          <FiRepeat className="text-lg" />
          {repeatMode === 'one' && (
            <span className="absolute top-1 right-1 text-[9px] font-bold text-violet-300">
              1
            </span>
          )}
        </button>
      </div>

      {/* Volume Bar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl">
        <button
          onClick={toggleMute}
          className="text-slate-400 hover:text-white transition-colors"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <FiVolumeX className="text-base" /> : <FiVolume2 className="text-base" />}
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={isMuted ? 0 : volume}
          onChange={(e) => setVolume(parseInt(e.target.value, 10))}
          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-[11px] font-mono text-slate-400 w-7 text-right">
          {isMuted ? '0%' : `${volume}%`}
        </span>
      </div>
    </div>
  );
}
