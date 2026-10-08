import React, { useState, useEffect } from 'react';
import { FiX, FiFolder, FiCheck, FiLoader } from 'react-icons/fi';
import { apiFetch } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export function PlaylistModal({ isOpen, onClose, playlistToEdit = null, onSaved }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { showToast } = useToast();

  useEffect(() => {
    if (playlistToEdit) {
      setName(playlistToEdit.name || '');
      setDescription(playlistToEdit.description || '');
    } else {
      setName('');
      setDescription('');
    }
    setError('');
  }, [playlistToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Playlist name is required.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (playlistToEdit) {
        await apiFetch(`/api/playlists/${playlistToEdit._id}`, {
          method: 'PUT',
          body: JSON.stringify({ name: name.trim(), description: description.trim() }),
        });
        showToast('Playlist updated successfully!', 'success');
      } else {
        await apiFetch('/api/playlists', {
          method: 'POST',
          body: JSON.stringify({ name: name.trim(), description: description.trim() }),
        });
        showToast('Playlist created successfully!', 'success');
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save playlist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121422] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 text-violet-400 flex items-center justify-center">
              <FiFolder className="text-lg" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {playlistToEdit ? 'Edit Playlist' : 'Create New Playlist'}
              </h3>
              <p className="text-xs text-slate-400">
                Organize your YouTube songs into personalized collections
              </p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Playlist Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Chill Beats, Workout, Bangla Songs"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Add an optional description for this mix..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all resize-none"
            />
          </div>

          {error && (
            <p className="text-rose-400 text-xs p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/20">
              {error}
            </p>
          )}

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
              disabled={loading || !name.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 active:scale-95 transition-all"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin text-sm" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FiCheck className="text-sm" />
                  <span>{playlistToEdit ? 'Save Changes' : 'Create Playlist'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
