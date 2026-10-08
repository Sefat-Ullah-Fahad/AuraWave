import React from 'react';
import { FiPlay, FiPause, FiHeart } from 'react-icons/fi';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { apiFetch } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export function SongCard({ song, onSongUpdated }) {
  const { currentSong, isPlaying, playSong } = usePlayer();
  const { showToast } = useToast();

  const isCurrent = currentSong?._id === song._id;

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

  return (
    <div
      onClick={() => playSong(song)}
      className="group relative flex flex-col p-3 rounded-2xl bg-slate-900/40 hover:bg-slate-800/60 border border-white/5 hover:border-violet-500/30 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-violet-950/30"
    >
      {/* Thumbnail container */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-800 mb-2.5">
        <img
          src={song.thumbnail || `https://i.ytimg.com/vi/${song.youtubeVideoId}/hqdefault.jpg`}
          alt={song.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Play overlay button */}
        <div
          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
            isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-lg shadow-violet-600/50 transform group-hover:scale-110 transition-all">
            {isCurrent && isPlaying ? (
              <FiPause className="text-base fill-white" />
            ) : (
              <FiPlay className="text-base fill-white ml-0.5" />
            )}
          </div>
        </div>

        {/* Favorite heart icon top-right */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 backdrop-blur-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          aria-label="Toggle favorite"
        >
          <FiHeart
            className={`text-sm ${
              song.favorite ? 'text-rose-500 fill-rose-500' : 'text-slate-300 hover:text-rose-400'
            }`}
          />
        </button>

        {/* Duration badge bottom-right */}
        {song.duration && (
          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-mono text-slate-300">
            {song.duration}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0">
        <h4
          className={`text-xs sm:text-sm font-semibold truncate ${
            isCurrent ? 'text-violet-400' : 'text-slate-100 group-hover:text-violet-300'
          }`}
          title={song.title}
        >
          {song.title}
        </h4>
        <p className="text-[11px] text-slate-400 truncate mt-0.5">{song.channelName}</p>
      </div>
    </div>
  );
}
