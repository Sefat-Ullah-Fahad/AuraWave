import React, { useState, useRef, useEffect } from 'react';
import {
  FiPlay,
  FiPause,
  FiHeart,
  FiMoreVertical,
  FiPlus,
  FiTrash2,
  FiList,
} from 'react-icons/fi';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { apiFetch } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export function SongRow({
  song,
  index,
  playlist = null,
  onSongDeleted,
  onAddToPlaylist,
  onRemoveFromPlaylist,
  onSongUpdated,
}) {
  const { currentSong, isPlaying, playSong, addToQueue } = usePlayer();
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isCurrent = currentSong?._id === song._id;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    try {
      const res = await apiFetch(`/api/songs/${song._id}/favorite`, { method: 'PATCH' });
      song.favorite = res.favorite;
      showToast(res.message, 'success');
      if (onSongUpdated) onSongUpdated();
    } catch (e) {
      showToast('Failed to update favorite status', 'error');
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    try {
      await apiFetch(`/api/songs/${song._id}`, { method: 'DELETE' });
      showToast('Song removed from library', 'success');
      if (onSongDeleted) onSongDeleted(song._id);
    } catch (e) {
      showToast(e.message || 'Failed to remove song', 'error');
    }
  };

  return (
    <div
      onClick={() => playSong(song)}
      className={`group flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl cursor-pointer border transition-all ${
        isCurrent
          ? 'bg-violet-900/25 border-violet-500/40 shadow-sm'
          : 'bg-slate-900/30 border-white/5 hover:bg-slate-800/50 hover:border-white/10'
      }`}
    >
      {/* Left: Index / Play Icon & Thumbnail & Title */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Index number or Equalizer animation */}
        <div className="w-5 text-center shrink-0 hidden sm:block">
          {isCurrent && isPlaying ? (
            <div className="flex items-center justify-center gap-0.5">
              <span className="w-0.5 bg-violet-400 rounded-full eq-bar-1" />
              <span className="w-0.5 bg-fuchsia-400 rounded-full eq-bar-2" />
              <span className="w-0.5 bg-indigo-400 rounded-full eq-bar-3" />
            </div>
          ) : (
            <span className="text-xs font-semibold text-slate-400 group-hover:hidden">
              {index + 1}
            </span>
          )}
          <span className="hidden group-hover:block text-slate-300">
            <FiPlay className="text-xs mx-auto" />
          </span>
        </div>

        {/* Thumbnail */}
        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-800 border border-white/5">
          <img
            src={song.thumbnail || `https://i.ytimg.com/vi/${song.youtubeVideoId}/hqdefault.jpg`}
            alt={song.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {isCurrent && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              {isPlaying ? (
                <FiPause className="text-white text-base fill-white" />
              ) : (
                <FiPlay className="text-white text-base fill-white" />
              )}
            </div>
          )}
        </div>

        {/* Title & Channel */}
        <div className="min-w-0 flex-1">
          <p
            className={`text-xs sm:text-sm font-semibold truncate ${
              isCurrent ? 'text-violet-300' : 'text-slate-200 group-hover:text-white'
            }`}
          >
            {song.title}
          </p>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">{song.channelName}</p>
        </div>
      </div>

      {/* Right: Duration, Favorite & Actions */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
        <span className="text-[11px] text-slate-400 font-mono hidden sm:inline mr-1">
          {song.duration || '3:30'}
        </span>

        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
          title={song.favorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-label="Favorite song"
        >
          <FiHeart
            className={`text-base ${
              song.favorite ? 'text-rose-500 fill-rose-500' : ''
            }`}
          />
        </button>

        {/* More Options Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            aria-label="More options"
          >
            <FiMoreVertical className="text-base" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 glass-dropdown rounded-xl shadow-xl z-20 py-1.5 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => {
                  addToQueue(song);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-violet-600/20 text-left transition-colors"
              >
                <FiList className="text-sm text-violet-400" />
                <span>Add to Queue</span>
              </button>

              <button
                onClick={() => {
                  onAddToPlaylist(song);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-violet-600/20 text-left transition-colors"
              >
                <FiPlus className="text-sm text-fuchsia-400" />
                <span>Add to Playlist</span>
              </button>

              {playlist && onRemoveFromPlaylist && (
                <button
                  onClick={() => {
                    onRemoveFromPlaylist(song._id);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-amber-300 hover:bg-amber-500/20 text-left transition-colors"
                >
                  <FiTrash2 className="text-sm" />
                  <span>Remove from Playlist</span>
                </button>
              )}

              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/20 text-left transition-colors border-t border-white/5 mt-1 pt-1.5"
              >
                <FiTrash2 className="text-sm" />
                <span>Delete from Library</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
