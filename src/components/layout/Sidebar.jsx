import React from 'react';
import {
  FiHome,
  FiMusic,
  FiFolder,
  FiHeart,
  FiClock,
  FiSettings,
  FiPlus,
  FiRadio,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext.jsx';

export function Sidebar({ activeTab, setActiveTab, playlists, onOpenCreatePlaylist }) {
  const { user } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', icon: FiHome },
    { id: 'library', label: 'Your Library', icon: FiMusic },
    { id: 'playlists', label: 'Playlists', icon: FiFolder },
    { id: 'favorites', label: 'Favorites', icon: FiHeart },
    { id: 'history', label: 'Recently Played', icon: FiClock },
    { id: 'settings', label: 'Settings', icon: FiSettings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-[#0d0e17] border-r border-white/5 p-4 select-none shrink-0">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-2 py-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <FiRadio className="text-white text-xl animate-pulse" />
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-violet-300 bg-clip-text text-transparent">
            AuraWave
          </h1>
          <p className="text-[10px] text-violet-400 font-medium uppercase tracking-wider">
            Personal Music Vault
          </p>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="space-y-1 mb-8">
        <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              }`}
            >
              <Icon
                className={`text-lg transition-transform ${
                  isActive ? 'text-violet-400 scale-110' : 'text-slate-400'
                }`}
              />
              <span>{item.label}</span>
              {item.id === 'favorites' && (
                <span className="ml-auto text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded-full font-semibold">
                  Liked
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Playlists section */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="flex items-center justify-between px-3 mb-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Playlists
          </p>
          {user && (
            <button
              onClick={onOpenCreatePlaylist}
              className="text-slate-400 hover:text-violet-400 p-1 rounded-lg hover:bg-white/5 transition-colors"
              title="Create new playlist"
              aria-label="Create new playlist"
            >
              <FiPlus className="text-sm" />
            </button>
          )}
        </div>

        <div className="space-y-1">
          {playlists && playlists.length > 0 ? (
            playlists.map((pl) => (
              <button
                key={pl._id}
                onClick={() => {
                  setActiveTab(`playlist:${pl._id}`);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium truncate text-left transition-colors ${
                  activeTab === `playlist:${pl._id}`
                    ? 'text-violet-300 bg-violet-600/10 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span className="truncate">{pl.name}</span>
                <span className="text-[10px] text-slate-400 ml-2 shrink-0">
                  {pl.songCount || pl.songs?.length || 0}
                </span>
              </button>
            ))
          ) : (
            <div className="px-3 py-4 text-xs text-slate-400 italic">
              No playlists yet. Create one above!
            </div>
          )}
        </div>
      </div>

      {/* Footer User Info */}
      {user && (
        <div className="pt-4 border-t border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="truncate flex-1">
            <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
      )}
    </aside>
  );
}
