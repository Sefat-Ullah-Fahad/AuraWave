import React from 'react';
import { FiClock, FiTrash2, FiPlay, FiMusic } from 'react-icons/fi';
import { usePlayer } from '../context/PlayerContext.jsx';
import { apiFetch } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { SongRow } from '../components/songs/SongRow.jsx';

export function HistoryPage({ history, onHistoryCleared, onAddToPlaylist, onSongUpdated, setActiveTab }) {
  const { playSong } = usePlayer();
  const { showToast } = useToast();

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your playback history?')) return;

    try {
      await apiFetch('/api/history', { method: 'DELETE' });
      showToast('Playback history cleared', 'success');
      if (onHistoryCleared) onHistoryCleared();
    } catch (e) {
      showToast('Failed to clear history', 'error');
    }
  };

  const formatPlayedAt = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center border border-violet-500/30">
            <FiClock className="text-2xl" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Recently Played</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Tracks you've streamed in AuraWave. Completely private to your account.
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs sm:text-sm font-semibold border border-rose-500/20 transition-colors self-start sm:self-auto"
          >
            <FiTrash2 />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-white/5 max-w-md mx-auto">
          <FiClock className="text-4xl text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No listening history yet</h3>
          <p className="text-xs text-slate-400 mb-5">
            Songs you stream will show up here so you can easily re-listen.
          </p>
          <button
            onClick={() => setActiveTab('library')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
          >
            <FiMusic />
            <span>Start Listening</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((song, idx) => (
            <div key={`${song._id}-${idx}`} className="relative group">
              <SongRow
                song={song}
                index={idx}
                onAddToPlaylist={onAddToPlaylist}
                onSongUpdated={onSongUpdated}
              />
              {song.playedAt && (
                <span className="absolute right-24 sm:right-28 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono hidden md:inline">
                  {formatPlayedAt(song.playedAt)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
