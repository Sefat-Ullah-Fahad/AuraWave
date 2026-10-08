import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { usePlayer } from './context/PlayerContext.jsx';
import { apiFetch } from './lib/api.js';

// Layout
import { Navbar } from './components/layout/Navbar.jsx';
import { Sidebar } from './components/layout/Sidebar.jsx';
import { MobileNav } from './components/layout/MobileNav.jsx';
import { MobileDrawer } from './components/layout/MobileDrawer.jsx';
import { GlobalPlayer } from './components/player/GlobalPlayer.jsx';

// Pages
import { HomePage } from './pages/HomePage.jsx';
import { LibraryPage } from './pages/LibraryPage.jsx';
import { PlaylistsPage } from './pages/PlaylistsPage.jsx';
import { PlaylistDetailPage } from './pages/PlaylistDetailPage.jsx';
import { FavoritesPage } from './pages/FavoritesPage.jsx';
import { HistoryPage } from './pages/HistoryPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';

// Modals
import { AddSongModal } from './components/modals/AddSongModal.jsx';
import { PlaylistModal } from './components/modals/PlaylistModal.jsx';
import { AddToPlaylistModal } from './components/modals/AddToPlaylistModal.jsx';
import { AuthModal } from './components/auth/AuthModal.jsx';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { currentSong } = usePlayer();

  // Navigation tab state: 'home' | 'library' | 'playlists' | 'playlist:<id>' | 'favorites' | 'history' | 'settings'
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [history, setHistory] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Modals state
  const [isAddSongOpen, setIsAddSongOpen] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [playlistToEdit, setPlaylistToEdit] = useState(null);
  const [songToAddToPlaylist, setSongToAddToPlaylist] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Load user data
  const loadUserData = useCallback(async () => {
    if (!user) {
      setSongs([]);
      setPlaylists([]);
      setHistory([]);
      return;
    }

    try {
      setLoadingData(true);
      const [songsRes, playlistsRes, historyRes] = await Promise.all([
        apiFetch('/api/songs'),
        apiFetch('/api/playlists'),
        apiFetch('/api/history'),
      ]);

      setSongs(songsRes?.songs || []);
      setPlaylists(playlistsRes?.playlists || []);
      setHistory(historyRes?.history || []);
    } catch (err) {
      console.warn('Failed to load user data:', err);
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Open Edit Playlist modal
  const handleOpenEditPlaylist = (pl) => {
    setPlaylistToEdit(pl);
    setIsPlaylistModalOpen(true);
  };

  // Open Create Playlist modal
  const handleOpenCreatePlaylist = () => {
    setPlaylistToEdit(null);
    setIsPlaylistModalOpen(true);
  };

  // Delete playlist
  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;
    try {
      await apiFetch(`/api/playlists/${playlistId}`, { method: 'DELETE' });
      setActiveTab('playlists');
      loadUserData();
    } catch (e) {
      console.error(e);
    }
  };

  // Resolve current active playlist if on playlist detail page
  const selectedPlaylist = activeTab.startsWith('playlist:')
    ? playlists.find((p) => p._id === activeTab.replace('playlist:', ''))
    : null;

  return (
    <div className="flex h-screen bg-[#090a10] text-slate-100 overflow-hidden font-sans">
      {/* Desktop Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        playlists={playlists}
        onOpenCreatePlaylist={handleOpenCreatePlaylist}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          onOpenAddSong={() => (user ? setIsAddSongOpen(true) : setIsAuthOpen(true))}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-mobile-player">
          <div className="max-w-7xl mx-auto">
            {authLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !user ? (
              // Unauthenticated Landing View
              <div className="py-12 sm:py-20 text-center max-w-xl mx-auto space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-indigo-600 flex items-center justify-center mx-auto shadow-2xl shadow-violet-600/30">
                  <span className="text-3xl">🎵</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                  Your Personal Music Player
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Save your favorite YouTube music & video links, build personal playlists, and
                  enjoy background audio streaming with an isolated, private account.
                </p>
                <div className="flex items-center justify-center gap-4 pt-2">
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-sm shadow-xl shadow-violet-600/30 active:scale-95 transition-all"
                  >
                    Sign In or Register
                  </button>
                </div>
              </div>
            ) : (
              // Authenticated Pages
              <>
                {activeTab === 'home' && (
                  <HomePage
                    songs={songs}
                    playlists={playlists}
                    history={history}
                    onOpenAddSong={() => setIsAddSongOpen(true)}
                    onOpenCreatePlaylist={handleOpenCreatePlaylist}
                    onAddToPlaylist={(song) => setSongToAddToPlaylist(song)}
                    setActiveTab={setActiveTab}
                    onSongUpdated={loadUserData}
                  />
                )}

                {activeTab === 'library' && (
                  <LibraryPage
                    songs={songs}
                    onOpenAddSong={() => setIsAddSongOpen(true)}
                    onAddToPlaylist={(song) => setSongToAddToPlaylist(song)}
                    onSongDeleted={loadUserData}
                    onSongUpdated={loadUserData}
                    searchQuery={searchQuery}
                  />
                )}

                {activeTab === 'playlists' && (
                  <PlaylistsPage
                    playlists={playlists}
                    onOpenCreatePlaylist={handleOpenCreatePlaylist}
                    setActiveTab={setActiveTab}
                    onEditPlaylist={handleOpenEditPlaylist}
                    onDeletePlaylist={handleDeletePlaylist}
                  />
                )}

                {activeTab.startsWith('playlist:') && (
                  <PlaylistDetailPage
                    playlist={selectedPlaylist}
                    onBack={() => setActiveTab('playlists')}
                    onOpenEdit={handleOpenEditPlaylist}
                    onDeletePlaylist={handleDeletePlaylist}
                    onOpenAddSong={() => setIsAddSongOpen(true)}
                    onPlaylistUpdated={loadUserData}
                  />
                )}

                {activeTab === 'favorites' && (
                  <FavoritesPage
                    songs={songs}
                    onAddToPlaylist={(song) => setSongToAddToPlaylist(song)}
                    onSongDeleted={loadUserData}
                    onSongUpdated={loadUserData}
                    setActiveTab={setActiveTab}
                  />
                )}

                {activeTab === 'history' && (
                  <HistoryPage
                    history={history}
                    onHistoryCleared={() => setHistory([])}
                    onAddToPlaylist={(song) => setSongToAddToPlaylist(song)}
                    onSongUpdated={loadUserData}
                    setActiveTab={setActiveTab}
                  />
                )}

                {activeTab === 'settings' && <SettingsPage />}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Global Persistent Player (Mobile Mini Player + Desktop Bottom Bar) */}
      <GlobalPlayer onSongUpdated={loadUserData} />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Modals */}
      <AddSongModal
        isOpen={isAddSongOpen}
        onClose={() => setIsAddSongOpen(false)}
        onSongAdded={() => loadUserData()}
      />

      <PlaylistModal
        isOpen={isPlaylistModalOpen}
        playlistToEdit={playlistToEdit}
        onClose={() => {
          setIsPlaylistModalOpen(false);
          setPlaylistToEdit(null);
        }}
        onSaved={() => loadUserData()}
      />

      <AddToPlaylistModal
        isOpen={!!songToAddToPlaylist}
        song={songToAddToPlaylist}
        playlists={playlists}
        onClose={() => setSongToAddToPlaylist(null)}
        onPlaylistUpdated={() => loadUserData()}
        onOpenCreatePlaylist={handleOpenCreatePlaylist}
      />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Mobile Navigation Drawer with complete desktop feature parity */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        playlists={playlists}
        onOpenCreatePlaylist={handleOpenCreatePlaylist}
        onOpenAddSong={() => (user ? setIsAddSongOpen(true) : setIsAuthOpen(true))}
      />
    </div>
  );
}
