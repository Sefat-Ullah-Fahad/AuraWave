import React, { useState } from 'react';
import {
  FiSettings,
  FiUser,
  FiLock,
  FiLogOut,
  FiCheck,
  FiLoader,
  FiSliders,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function SettingsPage() {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const { playbackMode, togglePlaybackMode } = usePlayer();
  const { showToast } = useToast();

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // App Theme State
  const [theme, setTheme] = useState('violet'); // 'violet' | 'obsidian' | 'cyan'

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }
    try {
      setProfileLoading(true);
      await updateProfile(name.trim(), phone.trim());
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast('All password fields are required', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }

    try {
      setPasswordLoading(true);
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <FiSettings className="text-violet-400 text-2xl" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Settings & Profile</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your account credentials, preferences, and database connection.
          </p>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 text-xs sm:text-sm font-semibold border border-rose-500/20 active:scale-95 transition-all"
        >
          <FiLogOut />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Profile Section */}
      <section className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center">
            <FiUser className="text-xl" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Personal Profile</h2>
            <p className="text-xs text-slate-400">All data in AuraWave is isolated strictly to this account</p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-white/10 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Email Address (Login ID)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-4 py-2 rounded-xl bg-slate-950/50 border border-white/5 text-sm text-slate-400 cursor-not-allowed"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Email is permanently attached to your user ID.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+1234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-white/10 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={profileLoading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md active:scale-95 transition-all disabled:opacity-50"
            >
              {profileLoading ? <FiLoader className="animate-spin" /> : <FiCheck />}
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </section>

      {/* Change Password Section */}
      <section className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-fuchsia-600/20 text-fuchsia-400 flex items-center justify-center">
            <FiLock className="text-xl" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Security & Password</h2>
            <p className="text-xs text-slate-400">Update your account login password</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-4 pr-10 py-2 rounded-xl bg-slate-950 border border-white/10 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 transition-colors"
                aria-label={showCurrentPass ? 'Hide password' : 'Show password'}
              >
                {showCurrentPass ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 rounded-xl bg-slate-950 border border-white/10 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 transition-colors"
                  aria-label={showNewPass ? 'Hide password' : 'Show password'}
                >
                  {showNewPass ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 rounded-xl bg-slate-950 border border-white/10 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 transition-colors"
                  aria-label={showConfirmPass ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPass ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={passwordLoading || !currentPassword || !newPassword}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-white/10 shadow-md active:scale-95 transition-all disabled:opacity-50"
            >
              {passwordLoading ? <FiLoader className="animate-spin" /> : <FiCheck />}
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </section>

      {/* Playback Preferences */}
      <section className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
            <FiSliders className="text-xl" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Playback Preferences</h2>
            <p className="text-xs text-slate-400">Configure default player behavior</p>
          </div>
        </div>

        <div className="space-y-4 max-w-lg">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5">
            <div>
              <h4 className="text-xs font-semibold text-white">Default Playback Mode</h4>
              <p className="text-[11px] text-slate-400">Choose sequential or shuffle ordering</p>
            </div>
            <button
              onClick={togglePlaybackMode}
              className="px-3 py-1.5 rounded-lg bg-violet-600/20 text-violet-300 border border-violet-500/30 text-xs font-semibold capitalize"
            >
              {playbackMode}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
