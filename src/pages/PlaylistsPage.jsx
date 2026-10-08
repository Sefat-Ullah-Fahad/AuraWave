import React from 'react';
import { FiFolder, FiPlus, FiPlay, FiTrash2, FiEdit2 } from 'react-icons/fi';

export function PlaylistsPage({ playlists, onOpenCreatePlaylist, setActiveTab, onEditPlaylist, onDeletePlaylist }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <FiFolder className="text-violet-400 text-2xl" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Your Playlists</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Custom collections created by you. Completely isolated and private.
          </p>
        </div>

        <button
          onClick={onOpenCreatePlaylist}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs sm:text-sm font-semibold shadow-md active:scale-95 transition-all self-start sm:self-auto"
        >
          <FiPlus className="text-base" />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Playlist Grid */}
      {playlists.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-dashed border-white/10 max-w-md mx-auto">
          <FiFolder className="text-4xl text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No playlists yet</h3>
          <p className="text-xs text-slate-400 mb-5">
            Create your first playlist to organize songs by genre, mood, or artist.
          </p>
          <button
            onClick={onOpenCreatePlaylist}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
          >
            <FiPlus />
            <span>Create Playlist</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {playlists.map((pl) => (
            <div
              key={pl._id}
              onClick={() => setActiveTab(`playlist:${pl._id}`)}
              className="group flex flex-col p-3.5 rounded-2xl bg-slate-900/40 hover:bg-slate-800/60 border border-white/5 hover:border-violet-500/30 cursor-pointer transition-all duration-300 shadow-md"
            >
              {/* Cover Art Preview */}
              <div className="aspect-square rounded-xl bg-gradient-to-tr from-violet-950 via-slate-900 to-fuchsia-950 border border-white/10 overflow-hidden relative mb-3 group-hover:scale-102 transition-transform">
                {pl.songDetails && pl.songDetails.length > 0 ? (
                  <img
                    src={pl.songDetails[0].thumbnail}
                    alt={pl.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiFolder className="text-4xl text-violet-400/50" />
                  </div>
                )}

                {/* Hover Play button */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-11 h-11 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <FiPlay className="text-lg fill-white ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Title and metadata */}
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-violet-300 transition-colors">
                  {pl.name}
                </h4>
                {pl.description && (
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{pl.description}</p>
                )}
                <span className="inline-block text-[10px] text-violet-400/80 font-medium mt-1">
                  {pl.songCount || pl.songs?.length || 0} songs
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
