import React from 'react';
import { FiHeart, FiPlay, FiShuffle, FiMusic } from 'react-icons/fi';
import { usePlayer } from '../context/PlayerContext.jsx';
import { SongRow } from '../components/songs/SongRow.jsx';

export function FavoritesPage({ songs, onAddToPlaylist, onSongDeleted, onSongUpdated, setActiveTab }) {
  const { playSong } = usePlayer();
  const favoriteSongs = songs.filter((s) => s.favorite);

  const handlePlayAll = (shuffle = false) => {
    if (favoriteSongs.length === 0) return;
    if (shuffle) {
      const shuffled = [...favoriteSongs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled);
    } else {
      playSong(favoriteSongs[0], favoriteSongs);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-600/20 text-rose-500 flex items-center justify-center border border-rose-500/30">
            <FiHeart className="text-2xl fill-rose-500" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Your Favorites</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              {favoriteSongs.length} liked {favoriteSongs.length === 1 ? 'song' : 'songs'} in your library
            </p>
          </div>
        </div>

        {favoriteSongs.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => handlePlayAll(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs sm:text-sm font-semibold shadow-md active:scale-95 transition-all"
            >
              <FiPlay className="text-sm fill-white" />
              <span>Play All</span>
            </button>
            <button
              onClick={() => handlePlayAll(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-white/10 active:scale-95 transition-all"
            >
              <FiShuffle className="text-sm" />
              <span>Shuffle</span>
            </button>
          </div>
        )}
      </div>

      {/* Song List */}
      {favoriteSongs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-white/5 max-w-md mx-auto">
          <FiHeart className="text-4xl text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No favorite songs yet</h3>
          <p className="text-xs text-slate-400 mb-5">
            Click the heart icon on any song in your library to add it to your favorites.
          </p>
          <button
            onClick={() => setActiveTab('library')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
          >
            <FiMusic />
            <span>Explore Your Library</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {favoriteSongs.map((song, idx) => (
            <SongRow
              key={song._id}
              song={song}
              index={idx}
              onAddToPlaylist={onAddToPlaylist}
              onSongDeleted={onSongDeleted}
              onSongUpdated={onSongUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
