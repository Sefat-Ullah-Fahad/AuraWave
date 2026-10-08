import React, { useState } from 'react';
import {
  FiArrowLeft,
  FiPlay,
  FiShuffle,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiArrowUp,
  FiArrowDown,
  FiMusic,
  FiX,
} from 'react-icons/fi';
import { usePlayer } from '../context/PlayerContext.jsx';
import { apiFetch } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';

export function PlaylistDetailPage({
  playlist,
  onBack,
  onOpenEdit,
  onDeletePlaylist,
  onOpenAddSong,
  onPlaylistUpdated,
}) {
  const { playSong } = usePlayer();
  const { showToast } = useToast();
  const [reordering, setReordering] = useState(false);

  if (!playlist) return null;

  const songs = playlist.songDetails || [];

  const handlePlayAll = (shuffle = false) => {
    if (songs.length === 0) return;
    if (shuffle) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled);
    } else {
      playSong(songs[0], songs);
    }
  };

  const handleRemoveSong = async (songId) => {
    try {
      await apiFetch(`/api/playlists/${playlist._id}/songs/${songId}`, {
        method: 'DELETE',
      });
      showToast('Removed song from playlist', 'success');
      if (onPlaylistUpdated) onPlaylistUpdated();
    } catch (e) {
      showToast('Failed to remove song from playlist', 'error');
    }
  };

  const handleMoveSong = async (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= songs.length) return;

    const updatedSongIds = songs.map((s) => s._id);
    const [moved] = updatedSongIds.splice(index, 1);
    updatedSongIds.splice(targetIdx, 0, moved);

    try {
      setReordering(true);
      await apiFetch(`/api/playlists/${playlist._id}/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ songIds: updatedSongIds }),
      });
      if (onPlaylistUpdated) onPlaylistUpdated();
    } catch (e) {
      showToast('Failed to update playlist order', 'error');
    } finally {
      setReordering(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <FiArrowLeft />
        <span>Back to Playlists</span>
      </button>

      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 p-6 rounded-3xl bg-gradient-to-b from-violet-950/60 to-slate-900/40 border border-white/10 shadow-xl">
        {/* Artwork */}
        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-gradient-to-tr from-violet-900 to-fuchsia-900 border border-white/10 shadow-2xl overflow-hidden shrink-0 flex items-center justify-center">
          {songs.length > 0 ? (
            <img
              src={songs[0].thumbnail}
              alt={playlist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <FiMusic className="text-5xl text-violet-400/50" />
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <span className="text-[11px] uppercase tracking-wider font-bold text-violet-400">
            Playlist
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white truncate mt-1">
            {playlist.name}
          </h1>
          {playlist.description && (
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              {playlist.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-slate-400 mt-3">
            <span>{songs.length} {songs.length === 1 ? 'song' : 'songs'}</span>
            <span>•</span>
            <span>Created {new Date(playlist.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            {songs.length > 0 && (
              <>
                <button
                  onClick={() => handlePlayAll(false)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-violet-600/30 active:scale-95 transition-all"
                >
                  <FiPlay className="text-sm fill-white" />
                  <span>Play</span>
                </button>
                <button
                  onClick={() => handlePlayAll(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-white/10 active:scale-95 transition-all"
                >
                  <FiShuffle className="text-sm" />
                  <span>Shuffle</span>
                </button>
              </>
            )}

            <button
              onClick={() => onOpenEdit(playlist)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-white/5 transition-colors"
              title="Edit playlist name & description"
            >
              <FiEdit2 />
              <span>Edit</span>
            </button>

            <button
              onClick={() => onDeletePlaylist(playlist._id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-medium border border-rose-500/20 transition-colors"
              title="Delete playlist"
            >
              <FiTrash2 />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Song List */}
      <div>
        <div className="flex items-center justify-between mb-3 px-2">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Tracks</h3>
          <span className="text-xs text-slate-400">
            Use arrows to reorder songs
          </span>
        </div>

        {songs.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-white/5">
            <FiMusic className="text-3xl text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">This playlist is empty</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Add songs from your library to this playlist using the song options menu.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {songs.map((song, idx) => (
              <div
                key={`${song._id}-${idx}`}
                className="group flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-900/40 hover:bg-slate-800/60 border border-white/5 transition-all"
              >
                {/* Number & Thumbnail */}
                <div
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  onClick={() => playSong(song, songs)}
                >
                  <span className="text-xs text-slate-400 font-mono w-5 text-center shrink-0">
                    {idx + 1}
                  </span>
                  <img
                    src={song.thumbnail}
                    alt={song.title}
                    className="w-11 h-11 rounded-lg object-cover bg-slate-800 shrink-0 border border-white/5"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-violet-300">
                      {song.title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{song.channelName}</p>
                  </div>
                </div>

                {/* Duration & Reordering Controls */}
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[11px] font-mono text-slate-400 mr-2 hidden sm:inline">
                    {song.duration}
                  </span>

                  <button
                    onClick={() => handleMoveSong(idx, -1)}
                    disabled={idx === 0 || reordering}
                    className="p-1.5 text-slate-400 hover:text-white disabled:opacity-20 transition-colors rounded"
                    title="Move up"
                    aria-label="Move up"
                  >
                    <FiArrowUp className="text-sm" />
                  </button>

                  <button
                    onClick={() => handleMoveSong(idx, 1)}
                    disabled={idx === songs.length - 1 || reordering}
                    className="p-1.5 text-slate-400 hover:text-white disabled:opacity-20 transition-colors rounded"
                    title="Move down"
                    aria-label="Move down"
                  >
                    <FiArrowDown className="text-sm" />
                  </button>

                  <button
                    onClick={() => handleRemoveSong(song._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors rounded ml-1"
                    title="Remove from playlist"
                    aria-label="Remove from playlist"
                  >
                    <FiX className="text-sm" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
