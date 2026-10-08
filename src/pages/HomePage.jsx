import React from 'react';
import {
  FiPlay,
  FiShuffle,
  FiMusic,
  FiHeart,
  FiFolder,
  FiClock,
  FiPlus,
  FiArrowRight,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';
import { SongCard } from '../components/songs/SongCard.jsx';
import { SongRow } from '../components/songs/SongRow.jsx';

export function HomePage({
  songs,
  playlists,
  history,
  onOpenAddSong,
  onOpenCreatePlaylist,
  onAddToPlaylist,
  setActiveTab,
  onSongUpdated,
}) {
  const { user } = useAuth();
  const { currentSong, isPlaying, playSong, queue } = usePlayer();

  const favoriteSongs = songs.filter((s) => s.favorite);
  const recentlyAddedSongs = [...songs].slice(0, 6);
  const lastPlayedSong = history.length > 0 ? history[0] : songs.length > 0 ? songs[0] : null;

  const playAllSongs = (songsList, shuffle = false) => {
    if (!songsList || songsList.length === 0) return;
    if (shuffle) {
      const shuffled = [...songsList].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled);
    } else {
      playSong(songsList[0], songsList);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-violet-900/40 via-purple-900/30 to-indigo-900/30 border border-white/10 shadow-2xl">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30 mb-3">
            <FiMusic className="text-violet-400" />
            Your Private Audio Stream
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Welcome, {user ? user.name : 'Music Lover'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Your personal, isolated YouTube music collection. Save any video URL, organize into
            playlists, and stream with queue and shuffle.
          </p>

          <div className="flex items-center gap-3 mt-5 flex-wrap">
            {songs.length > 0 && (
              <>
                <button
                  onClick={() => playAllSongs(songs, false)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-violet-600/30 active:scale-95 transition-all"
                >
                  <FiPlay className="text-sm fill-white" />
                  <span>Play All Songs ({songs.length})</span>
                </button>
                <button
                  onClick={() => playAllSongs(songs, true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-semibold border border-white/10 active:scale-95 transition-all"
                >
                  <FiShuffle className="text-sm" />
                  <span>Shuffle</span>
                </button>
              </>
            )}
            <button
              onClick={onOpenAddSong}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white text-xs sm:text-sm font-semibold shadow-md active:scale-95 transition-all"
            >
              <FiPlus className="text-sm" />
              <span>Add YouTube Song</span>
            </button>
          </div>
        </div>
      </div>

      {/* Continue Listening Widget (if available) */}
      {lastPlayedSong && (
        <section className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-white/10">
              <img
                src={lastPlayedSong.thumbnail}
                alt={lastPlayedSong.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => playSong(lastPlayedSong)}
                className="absolute inset-0 bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors"
              >
                <FiPlay className="text-white text-lg fill-white ml-0.5" />
              </button>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-400">
                Continue Listening
              </span>
              <h3 className="text-sm font-bold text-white truncate max-w-md">{lastPlayedSong.title}</h3>
              <p className="text-xs text-slate-400 truncate">{lastPlayedSong.channelName}</p>
            </div>
          </div>

          <button
            onClick={() => playSong(lastPlayedSong)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 text-xs font-semibold border border-violet-500/30 transition-colors shrink-0"
          >
            <FiPlay className="text-xs fill-violet-300" />
            <span>Resume Playback</span>
          </button>
        </section>
      )}

      {/* Recently Played Section */}
      {history.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiClock className="text-violet-400 text-lg" />
              <h2 className="text-base sm:text-lg font-bold text-white">Recently Played</h2>
            </div>
            <button
              onClick={() => setActiveTab('history')}
              className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors"
            >
              <span>See history</span>
              <FiArrowRight className="text-xs" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {history.slice(0, 6).map((song) => (
              <SongCard key={song._id} song={song} onSongUpdated={onSongUpdated} />
            ))}
          </div>
        </section>
      )}

      {/* Favorites Section */}
      {favoriteSongs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiHeart className="text-rose-500 text-lg fill-rose-500" />
              <h2 className="text-base sm:text-lg font-bold text-white">Your Favorites</h2>
              <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-semibold">
                {favoriteSongs.length}
              </span>
            </div>
            <button
              onClick={() => setActiveTab('favorites')}
              className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors"
            >
              <span>View all</span>
              <FiArrowRight className="text-xs" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {favoriteSongs.slice(0, 6).map((song) => (
              <SongCard key={song._id} song={song} onSongUpdated={onSongUpdated} />
            ))}
          </div>
        </section>
      )}

      {/* User Playlists Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FiFolder className="text-violet-400 text-lg" />
            <h2 className="text-base sm:text-lg font-bold text-white">Your Playlists</h2>
            <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full font-semibold">
              {playlists.length}
            </span>
          </div>
          <button
            onClick={() => setActiveTab('playlists')}
            className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors"
          >
            <span>All playlists</span>
            <FiArrowRight className="text-xs" />
          </button>
        </div>

        {playlists.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/30 border border-dashed border-white/10 text-center">
            <FiFolder className="text-3xl text-slate-500 mx-auto mb-2" />
            <p className="text-xs sm:text-sm font-semibold text-slate-300">No playlists created yet</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Create custom mixes like Workout, Focus, Bangla, or Chill
            </p>
            <button
              onClick={onOpenCreatePlaylist}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
            >
              <FiPlus />
              <span>Create First Playlist</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {playlists.slice(0, 5).map((pl) => (
              <div
                key={pl._id}
                onClick={() => setActiveTab(`playlist:${pl._id}`)}
                className="group p-3.5 rounded-2xl bg-slate-900/40 hover:bg-slate-800/60 border border-white/5 hover:border-violet-500/30 cursor-pointer transition-all shadow-md"
              >
                <div className="aspect-square rounded-xl bg-gradient-to-tr from-violet-900/60 to-fuchsia-900/60 border border-white/10 flex items-center justify-center mb-3 relative overflow-hidden group-hover:scale-102 transition-transform">
                  {pl.songDetails && pl.songDetails.length > 0 ? (
                    <img
                      src={pl.songDetails[0].thumbnail}
                      alt={pl.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiFolder className="text-3xl text-violet-300" />
                  )}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg">
                      <FiPlay className="text-base fill-white ml-0.5" />
                    </div>
                  </div>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-violet-300 transition-colors">
                  {pl.name}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  {pl.songCount || pl.songs?.length || 0} songs
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recently Added Songs Section */}
      {recentlyAddedSongs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiMusic className="text-violet-400 text-lg" />
              <h2 className="text-base sm:text-lg font-bold text-white">Recently Added Songs</h2>
            </div>
            <button
              onClick={() => setActiveTab('library')}
              className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors"
            >
              <span>View all library</span>
              <FiArrowRight className="text-xs" />
            </button>
          </div>

          <div className="space-y-2">
            {recentlyAddedSongs.map((song, index) => (
              <SongRow
                key={song._id}
                song={song}
                index={index}
                onAddToPlaylist={onAddToPlaylist}
                onSongUpdated={onSongUpdated}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty State when no songs saved yet */}
      {songs.length === 0 && (
        <div className="p-10 rounded-3xl bg-slate-900/30 border border-white/5 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center mx-auto mb-4">
            <FiMusic className="text-3xl" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Your Library is Empty</h3>
          <p className="text-xs text-slate-400 mb-6">
            Paste any YouTube video or song link to start building your personal music collection.
          </p>
          <button
            onClick={onOpenAddSong}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-violet-600/30 active:scale-95 transition-all"
          >
            <FiPlus className="text-base" />
            <span>Add Your First YouTube Song</span>
          </button>
        </div>
      )}
    </div>
  );
}
