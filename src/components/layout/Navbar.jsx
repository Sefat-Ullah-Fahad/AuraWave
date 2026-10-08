import React from 'react';
import { FiSearch, FiPlus, FiMusic, FiUser, FiLogIn, FiMenu } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext.jsx';

export function Navbar({ onOpenAddSong, onOpenAuth, onOpenMobileDrawer, searchQuery, onSearchChange, activeTab, setActiveTab }) {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-white/5 px-3 sm:px-6 py-2.5 sm:py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Brand & Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden shrink-0">
          <button
            onClick={onOpenMobileDrawer}
            className="p-2 -ml-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/5 active:scale-95 transition-all"
            aria-label="Open navigation menu"
            title="Open menu"
          >
            <FiMenu className="text-xl text-violet-300" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <FiMusic className="text-white text-sm" />
            </div>
            <span className="text-sm font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-violet-300 bg-clip-text text-transparent hidden min-[360px]:inline">
              AuraWave
            </span>
          </div>
        </div>

        {/* Desktop Greeting */}
        {/* <div className="hidden lg:flex items-center gap-2">
          {user ? (
            <div>
              <p className="text-xs text-slate-400 font-medium">{getGreeting()},</p>
              <h2 className="text-sm font-bold text-white tracking-wide">{user.name}</h2>
            </div>
          ) : (
            <div>
              <p className="text-xs text-slate-400">Welcome to</p>
              <h2 className="text-sm font-bold text-violet-300">AuraWave Player</h2>
            </div>
          )}
        </div> */}

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-2">
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Search your saved songs, artists, playlists..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/60 border border-white/10 text-xs sm:text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/40 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-slate-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Add Song Button */}
          {user ? (
            <button
              onClick={onOpenAddSong}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-violet-600/25 active:scale-95 transition-all"
            >
              <FiPlus className="text-base" />
              <span className="hidden sm:inline">Add YouTube Song</span>
              <span className="sm:hidden">Add</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs sm:text-sm font-semibold active:scale-95 transition-all"
            >
              <FiLogIn />
              <span>Sign In</span>
            </button>
          )}

          {/* User Profile avatar */}
          {user && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold border transition-all ${
                activeTab === 'settings'
                  ? 'bg-violet-600 text-white border-violet-400 ring-2 ring-violet-500/30'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-white/10'
              }`}
              title="User Settings & Profile"
              aria-label="User Settings"
            >
              {user.name.charAt(0).toUpperCase()}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
