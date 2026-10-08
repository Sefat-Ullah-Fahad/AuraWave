import React from 'react';
import {
  FiX,
  FiTrash2,
  FiMusic,
  FiArrowUp,
  FiArrowDown,
  FiPlay,
  FiCheckCircle,
} from 'react-icons/fi';
import { usePlayer } from '../../context/PlayerContext.jsx';

export function QueueModal({ isOpen, onClose }) {
  const {
    queue,
    currentIndex,
    currentSong,
    playSongAtIndex,
    removeFromQueue,
    clearQueue,
    reorderQueue,
  } = usePlayer();

  if (!isOpen) return null;

  const moveItem = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= queue.length) return;
    const updated = [...queue];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    reorderQueue(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121420] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-slate-900/40">
          <div className="flex items-center gap-2">
            <FiMusic className="text-violet-400 text-lg" />
            <h3 className="font-bold text-base text-white">Play Queue</h3>
            <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full font-medium">
              {queue.length} {queue.length === 1 ? 'song' : 'songs'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {queue.length > 0 && (
              <button
                onClick={clearQueue}
                className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2.5 py-1.5 rounded-lg transition-colors"
                title="Clear all songs in queue"
              >
                <FiTrash2 />
                <span>Clear</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              aria-label="Close queue"
            >
              <FiX className="text-lg" />
            </button>
          </div>
        </div>

        {/* Queue Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {queue.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FiMusic className="text-4xl mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">Your queue is currently empty</p>
              <p className="text-xs text-slate-400 mt-1">
                Add songs from your library or playlists to build a queue
              </p>
            </div>
          ) : (
            queue.map((song, idx) => {
              const isCurrent = idx === currentIndex;
              return (
                <div
                  key={`${song._id}-${idx}`}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-violet-900/30 border-violet-500/40 shadow-sm'
                      : 'bg-slate-900/40 border-white/5 hover:bg-slate-800/40'
                  }`}
                >
                  {/* Position or Current indicator */}
                  <span className="text-xs font-semibold text-slate-400 w-5 text-center shrink-0">
                    {isCurrent ? (
                      <span className="inline-block w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                    ) : (
                      idx + 1
                    )}
                  </span>

                  {/* Thumbnail */}
                  <img
                    src={song.thumbnail || `https://i.ytimg.com/vi/${song.youtubeVideoId}/hqdefault.jpg`}
                    alt={song.title}
                    className="w-11 h-11 rounded-lg object-cover bg-slate-800 shrink-0 border border-white/5"
                  />

                  {/* Title & Artist */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => playSongAtIndex(idx)}
                  >
                    <p
                      className={`text-xs sm:text-sm font-semibold truncate ${
                        isCurrent ? 'text-violet-300' : 'text-slate-200'
                      }`}
                    >
                      {song.title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{song.channelName}</p>
                  </div>

                  {/* Reorder Up/Down */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveItem(idx, idx - 1)}
                      disabled={idx === 0}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-20 disabled:hover:text-slate-400 rounded transition-colors"
                      title="Move up in queue"
                      aria-label="Move song up in queue"
                    >
                      <FiArrowUp className="text-sm" />
                    </button>
                    <button
                      onClick={() => moveItem(idx, idx + 1)}
                      disabled={idx === queue.length - 1}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-20 disabled:hover:text-slate-400 rounded transition-colors"
                      title="Move down in queue"
                      aria-label="Move song down in queue"
                    >
                      <FiArrowDown className="text-sm" />
                    </button>
                    <button
                      onClick={() => removeFromQueue(idx)}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors ml-1"
                      title="Remove from queue"
                      aria-label="Remove from queue"
                    >
                      <FiX className="text-sm" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
