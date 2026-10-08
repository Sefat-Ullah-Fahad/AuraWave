import React, { useEffect, useRef } from 'react';
import {
  FiX,
  FiHome,
  FiMusic,
  FiFolder,
  FiHeart,
  FiClock,
  FiSettings,
  FiPlus,
  FiLogOut,
  FiRadio,
} from 'react-icons/fi';
import gsap from 'gsap';
import { useAuth } from '../../context/AuthContext.jsx';

export function MobileDrawer({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  playlists,
  onOpenCreatePlaylist,
  onOpenAddSong,
}) {
  const { user, logout } = useAuth();
  const drawerRef = useRef(null);
  const backdropRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      if (backdropRef.current) {
        gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
      }
      if (drawerRef.current) {
        gsap.fromTo(
          drawerRef.current,
          { x: '-100%' },
          { x: '0%', duration: 0.3, ease: 'power3.out' }
        );
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const navItems = [
    { id: 'home', label: 'Home', icon: FiHome },
    { id: 'library', label: 'Your Library', icon: FiMusic },
    { id: 'playlists', label: 'Playlists', icon: FiFolder },
    { id: 'favorites', label: 'Favorites', icon: FiHeart },
    { id: 'history', label: 'Recently Played', icon: FiClock },
    { id: 'settings', label: 'Settings & Profile', icon: FiSettings },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div
        ref={drawerRef}
        className="relative w-4/5 max-w-xs h-full bg-[#0d0e17] border-r border-white/10 p-5 flex flex-col z-10 safe-bottom overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/5 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <FiRadio className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">AuraWave</h2>
              <p className="text-[10px] text-violet-400 font-medium uppercase tracking-wider">
                Music Vault
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close menu"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Quick Add Song Button */}
        {user && (
          <button
            onClick={() => {
              onClose();
              onOpenAddSong();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 active:scale-95 transition-all mb-4"
          >
            <FiPlus className="text-base" />
            <span>Add YouTube Song</span>
          </button>
        )}

        {/* Navigation Menu */}
        <div className="space-y-1 mb-6">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                }`}
              >
                <Icon
                  className={`text-base ${
                    isActive ? 'text-violet-400' : 'text-slate-400'
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

        {/* Playlists List */}
        <div className="flex-1 overflow-y-auto mb-4 border-t border-white/5 pt-4">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Playlists
            </p>
            {user && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCreatePlaylist();
                }}
                className="text-slate-400 hover:text-violet-400 p-1 rounded-lg hover:bg-white/5 transition-colors"
                title="Create playlist"
                aria-label="Create playlist"
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
                  onClick={() => handleNavClick(`playlist:${pl._id}`)}
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
              <p className="px-3 py-2 text-[11px] text-slate-400 italic">
                No playlists created yet.
              </p>
            )}
          </div>
        </div>

        {/* User Profile & Sign Out Footer */}
        {user && (
          <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                logout();
              }}
              className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <FiLogOut className="text-base" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
