import React, { useState, useMemo } from 'react';
import {
  FiMusic,
  FiPlay,
  FiShuffle,
  FiPlus,
  FiHeart,
  FiGrid,
  FiList,
  FiSearch,
} from 'react-icons/fi';
import { usePlayer } from '../context/PlayerContext.jsx';
import { SongRow } from '../components/songs/SongRow.jsx';
import { SongCard } from '../components/songs/SongCard.jsx';

export function LibraryPage({
  songs,
  onOpenAddSong,
  onAddToPlaylist,
  onSongDeleted,
  onSongUpdated,
  searchQuery,
}) {
  const { playSong } = usePlayer();
  const [filter, setFilter] = useState('all'); // 'all' | 'favorites' | 'popular'
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [localSearch, setLocalSearch] = useState('');

  const effectiveSearch = (searchQuery || localSearch).trim().toLowerCase();

  const filteredSongs = useMemo(() => {
    let result = [...songs];

    // Filter type
    if (filter === 'favorites') {
      result = result.filter((s) => s.favorite);
    } else if (filter === 'popular') {
      result = result.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
    }

    // Search query
    if (effectiveSearch) {
      result = result.filter(
        (s) =>
          (s.title && s.title.toLowerCase().includes(effectiveSearch)) ||
          (s.channelName && s.channelName.toLowerCase().includes(effectiveSearch))
      );
    }

    return result;
  }, [songs, filter, effectiveSearch]);

  const playAll = (shuffle = false) => {
    if (filteredSongs.length === 0) return;
    if (shuffle) {
      const shuffled = [...filteredSongs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled);
    } else {
      playSong(filteredSongs[0], filteredSongs);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <FiMusic className="text-violet-400 text-2xl" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Your Music Library</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {songs.length} saved YouTube {songs.length === 1 ? 'song' : 'songs'} in your personal vault
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {filteredSongs.length > 0 && (
            <>
              <button
                onClick={() => playAll(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs sm:text-sm font-semibold shadow-md active:scale-95 transition-all"
              >
                <FiPlay className="text-sm fill-white" />
                <span>Play All</span>
              </button>
              <button
                onClick={() => playAll(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-white/10 active:scale-95 transition-all"
                title="Shuffle all songs in library"
              >
                <FiShuffle className="text-sm" />
                <span>Shuffle</span>
              </button>
            </>
          )}

          <button
            onClick={onOpenAddSong}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs sm:text-sm font-semibold shadow-md active:scale-95 transition-all"
          >
            <FiPlus className="text-base" />
            <span>Add YouTube Song</span>
          </button>
        </div>
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filter === 'all'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            All Songs ({songs.length})
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filter === 'favorites'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <FiHeart className="text-xs" />
            <span>Favorites ({songs.filter((s) => s.favorite).length})</span>
          </button>
          <button
            onClick={() => setFilter('popular')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filter === 'popular'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            Most Played
          </button>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/5 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="List view"
            aria-label="List view"
          >
            <FiList className="text-base" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Grid view"
            aria-label="Grid view"
          >
            <FiGrid className="text-base" />
          </button>
        </div>
      </div>

      {/* Songs Display */}
      {filteredSongs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-white/5 max-w-md mx-auto">
          <FiMusic className="text-4xl text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">
            {effectiveSearch ? 'No matching songs found' : 'No songs in this filter'}
          </h3>
          <p className="text-xs text-slate-400 mb-5">
            {effectiveSearch
              ? `No saved tracks matched "${effectiveSearch}" in your library.`
              : 'Add YouTube tracks to fill up your library.'}
          </p>
          <button
            onClick={onOpenAddSong}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
          >
            <FiPlus />
            <span>Add YouTube Song</span>
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-2">
          {filteredSongs.map((song, idx) => (
            <SongRow
              key={song._id}
              song={song}
              index={idx}
              onSongDeleted={onSongDeleted}
              onAddToPlaylist={onAddToPlaylist}
              onSongUpdated={onSongUpdated}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {filteredSongs.map((song) => (
            <SongCard key={song._id} song={song} onSongUpdated={onSongUpdated} />
          ))}
        </div>
      )}
    </div>
  );
}
