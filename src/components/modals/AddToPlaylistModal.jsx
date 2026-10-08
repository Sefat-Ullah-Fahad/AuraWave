import React, { useState } from 'react';
import { FiX, FiFolder, FiPlus, FiCheck, FiLoader } from 'react-icons/fi';
import { apiFetch } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export function AddToPlaylistModal({ isOpen, onClose, song, playlists, onPlaylistUpdated, onOpenCreatePlaylist }) {
  const [loadingId, setLoadingId] = useState(null);
  const { showToast } = useToast();

  if (!isOpen || !song) return null;

  const handleAdd = async (playlist) => {
    try {
      setLoadingId(playlist._id);
      await apiFetch(`/api/playlists/${playlist._id}/songs`, {
        method: 'POST',
        body: JSON.stringify({ songId: song._id }),
      });
      showToast(`Added to "${playlist.name}"!`, 'success');
      if (onPlaylistUpdated) onPlaylistUpdated();
      onClose();
    } catch (err) {
      showToast(err.message || 'Could not add to playlist', 'error');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121422] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-fuchsia-600/20 text-fuchsia-400 flex items-center justify-center">
              <FiFolder className="text-lg" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Add to Playlist</h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[240px]">{song.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <FiX className="text-base" />
          </button>
        </div>

        {/* List of playlists */}
        <div className="p-4 max-h-72 overflow-y-auto space-y-2">
          {playlists && playlists.length > 0 ? (
            playlists.map((pl) => {
              const alreadyIn = pl.songs?.includes(song._id);
              const isLoading = loadingId === pl._id;

              return (
                <button
                  key={pl._id}
                  disabled={alreadyIn || isLoading}
                  onClick={() => handleAdd(pl)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    alreadyIn
                      ? 'bg-slate-900/30 border-white/5 opacity-60 cursor-default'
                      : 'bg-slate-900/60 border-white/5 hover:border-violet-500/40 hover:bg-slate-800/60 active:scale-98'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-violet-600/20 text-violet-300 flex items-center justify-center shrink-0">
                      <FiFolder className="text-base" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{pl.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {pl.songCount || pl.songs?.length || 0} songs
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    {alreadyIn ? (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <FiCheck /> Added
                      </span>
                    ) : isLoading ? (
                      <FiLoader className="animate-spin text-violet-400 text-sm" />
                    ) : (
                      <span className="text-xs text-violet-400 hover:text-violet-300 font-semibold px-2 py-1 rounded bg-violet-600/20">
                        Add
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-center py-6 text-slate-400">
              <p className="text-xs">You have no playlists yet.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900/50 border-t border-white/5 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              if (onOpenCreatePlaylist) onOpenCreatePlaylist();
            }}
            className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors"
          >
            <FiPlus /> New Playlist
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
