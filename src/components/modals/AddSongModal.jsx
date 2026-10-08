import React, { useState, useEffect } from 'react';
import { FiX, FiYoutube, FiCheck, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { apiFetch } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { usePlayer } from '../../context/PlayerContext.jsx';

export function AddSongModal({ isOpen, onClose, onSongAdded }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [customTitle, setCustomTitle] = useState('');

  const { showToast } = useToast();
  const { playSong } = usePlayer();

  useEffect(() => {
    if (!isOpen) {
      setUrl('');
      setPreview(null);
      setError('');
      setCustomTitle('');
    }
  }, [isOpen]);

  // Debounced auto-preview when user enters a valid looking YouTube URL
  useEffect(() => {
    if (!url.trim()) {
      setPreview(null);
      setError('');
      return;
    }

    const timer = setTimeout(async () => {
      if (url.includes('youtube.com') || url.includes('youtu.be') || /^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
        try {
          setPreviewLoading(true);
          setError('');
          const data = await apiFetch('/api/songs/preview', {
            method: 'POST',
            body: JSON.stringify({ url: url.trim() }),
          });
          setPreview(data.preview);
          setCustomTitle(data.preview.title);
        } catch (err) {
          setError(err.message || 'Could not fetch YouTube preview.');
          setPreview(null);
        } finally {
          setPreviewLoading(false);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [url]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a YouTube link.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await apiFetch('/api/songs', {
        method: 'POST',
        body: JSON.stringify({
          url: url.trim(),
          title: customTitle.trim() || undefined,
        }),
      });

      showToast('Song added to your library!', 'success');
      if (onSongAdded) onSongAdded(data.song);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add YouTube song.');
    } finally {
      setLoading(false);
    }
  };

  const sampleLinks = [
    { title: 'Lofi Chill Beats', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },
    { title: 'Synthwave Neon', url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121422] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center">
              <FiYoutube className="text-lg" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Add YouTube Song</h3>
              <p className="text-xs text-slate-400">Save any music video or track to your personal library</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              YouTube Video Link
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                autoFocus
              />
              {previewLoading && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-violet-400 animate-spin">
                  <FiLoader className="text-base" />
                </div>
              )}
            </div>
          </div>

          {/* Quick Sample Links */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-slate-400">Try sample:</span>
            {sampleLinks.map((s) => (
              <button
                key={s.title}
                type="button"
                onClick={() => setUrl(s.url)}
                className="text-[11px] bg-slate-800/80 hover:bg-violet-600/20 text-violet-300 hover:text-violet-200 px-2 py-0.5 rounded-md border border-white/5 transition-colors"
              >
                {s.title}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs">
              <FiAlertCircle className="text-rose-400 shrink-0 text-sm" />
              <span>{error}</span>
            </div>
          )}

          {/* Video Preview Card */}
          {preview && (
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-violet-500/30 space-y-3">
              <div className="flex gap-3">
                <img
                  src={preview.thumbnail}
                  alt={preview.title}
                  className="w-20 h-14 rounded-lg object-cover bg-slate-800 shrink-0 border border-white/10"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">{preview.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{preview.channelName}</p>
                  <span className="inline-block text-[10px] bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded font-mono mt-1">
                    Duration: {preview.duration}
                  </span>
                </div>
              </div>

              {/* Optional Custom Title Override */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Custom Title (Optional)
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 active:scale-95 transition-all"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin text-sm" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <FiCheck className="text-sm" />
                  <span>Add Song</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
