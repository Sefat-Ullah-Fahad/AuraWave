import React from 'react';
import { FiHome, FiMusic, FiFolder, FiHeart, FiSettings } from 'react-icons/fi';

export function MobileNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: FiHome },
    { id: 'library', label: 'Library', icon: FiMusic },
    { id: 'playlists', label: 'Playlists', icon: FiFolder },
    { id: 'favorites', label: 'Favorites', icon: FiHeart },
    { id: 'settings', label: 'Settings', icon: FiSettings },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-white/10 px-2 py-2 safe-bottom">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            activeTab === tab.id ||
            (tab.id === 'playlists' && activeTab.startsWith('playlist:'));

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-violet-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`text-xl ${isActive ? 'scale-110 text-violet-400' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-violet-400" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
