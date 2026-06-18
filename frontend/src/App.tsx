import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import RightSidebar from './components/RightSidebar';
import Card from './components/Card';
import AddContentModal from './components/AddContentModal';
import AuthModal from './components/AuthModal';
import { getContent, addContent, deleteContent, toggleShare, getShareStatus, getSharedContent, isAuthenticated, getUsername, logout } from './services/api';
import { useTheme } from './hooks/useTheme';
import type { ContentItem, ContentType } from './types';
import { Brain, Plus, AlertCircle, Globe, LayoutGrid, Sun, Moon, Search, X } from 'lucide-react';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  
  // Auth states
  const [auth, setAuth] = useState(isAuthenticated());
  const [username, setUsername] = useState(getUsername());
  
  // Data states
  const [items, setItems] = useState<ContentItem[]>([]);
  const [trashItems, setTrashItems] = useState<ContentItem[]>([]);
  const [collections, setCollections] = useState<string[]>(['Coding', 'Design', 'Reading List', 'Tweets Archive']);
  
  // UI states
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Share link states
  const [isSharing, setIsSharing] = useState(false);
  const [shareHash, setShareHash] = useState<string | null>(null);
  
  // Router states
  const [route, setRoute] = useState<{ path: string; param?: string }>({ path: 'dashboard' });

  // Handle URL hashes or paths for simple routing
  useEffect(() => {
    const handleUrlRouting = () => {
      const path = window.location.pathname;
      if (path.startsWith('/share/')) {
        const hash = path.split('/share/')[1];
        if (hash) {
          setRoute({ path: 'shared', param: hash });
          return;
        }
      }
      setRoute({ path: 'dashboard' });
    };

    handleUrlRouting();
    window.addEventListener('popstate', handleUrlRouting);
    return () => window.removeEventListener('popstate', handleUrlRouting);
  }, []);

  // Fetch items and share status when authenticated
  useEffect(() => {
    if (auth && route.path === 'dashboard') {
      fetchData();
    }
  }, [auth, route.path]);

  const fetchData = async () => {
    try {
      const res = await getContent();
      setItems(res.contents || []);

      // Read current share status non-destructively (GET, not POST)
      const shareStatus = await getShareStatus().catch(() => ({ isSharing: false, hash: null }));
      setIsSharing(shareStatus.isSharing);
      setShareHash(shareStatus.hash ?? null);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  // Public shared dashboard state
  const [sharedUser, setSharedUser] = useState('');
  const [sharedItems, setSharedItems] = useState<ContentItem[]>([]);
  const [sharedError, setSharedError] = useState('');
  const [sharedLoading, setSharedLoading] = useState(false);
  const [sharedSearchQuery, setSharedSearchQuery] = useState('');

  useEffect(() => {
    if (route.path === 'shared' && route.param) {
      loadSharedContent(route.param);
    }
  }, [route.path, route.param]);

  const loadSharedContent = async (hash: string) => {
    setSharedLoading(true);
    setSharedError('');
    try {
      const data = await getSharedContent(hash);
      setSharedUser(data.username);
      setSharedItems(data.content || []);
    } catch (err: any) {
      setSharedError(err.message || 'The shared link is invalid or has expired.');
    } finally {
      setSharedLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setAuth(true);
    setUsername(getUsername());
    // Refresh page state to normal dashboard path
    window.history.pushState({}, '', '/');
    setRoute({ path: 'dashboard' });
  };

  const handleLogout = () => {
    logout();
    setAuth(false);
    setUsername(null);
    setItems([]);
    setTrashItems([]);
    setIsSharing(false);
    setShareHash(null);
  };

  const handleAddItem = async (params: {
    title: string;
    type: ContentType;
    link?: string;
    description?: string;
    tags?: string[];
  }) => {
    await addContent(params);
    await fetchData();
  };

  const handleDeleteItem = async (id: string) => {
    // If we're deleting from the active dashboard list, move to virtual trash
    const itemToTrash = items.find(item => item._id === id);
    if (itemToTrash) {
      setTrashItems(prev => [itemToTrash, ...prev]);
      setItems(prev => prev.filter(item => item._id !== id));
    }
  };

  const handlePermanentDelete = async (id: string) => {
    try {
      await deleteContent(id);
      setTrashItems(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      console.error('Failed to permanently delete:', err);
    }
  };

  const handleRestoreItem = (id: string) => {
    const itemToRestore = trashItems.find(item => item._id === id);
    if (itemToRestore) {
      setItems(prev => [itemToRestore, ...prev]);
      setTrashItems(prev => prev.filter(item => item._id !== id));
    }
  };

  const handleShareToggle = async (val: boolean) => {
    try {
      const res = await toggleShare(val);
      if (val && res.hash) {
        setIsSharing(true);
        setShareHash(res.hash);
      } else {
        setIsSharing(false);
        setShareHash(null);
      }
    } catch (err) {
      console.error('Error toggling workspace share:', err);
    }
  };

  const handleAddCollection = (name: string) => {
    if (!collections.includes(name)) {
      setCollections(prev => [...prev, name]);
    }
  };

  // Filter Items logic
  const getFilteredItems = () => {
    // If there is an active search query, perform a GLOBAL search across ALL items
    // regardless of activeFilter. This mirrors how Notion/Obsidian/Linear search works —
    // search is a universal operation, not scoped to the current category tab.
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      // Always search the full items array (never trashItems — trash is a separate scope)
      return items.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        item.type.toLowerCase().includes(query)
      );
    }

    // No search query — apply normal navigation filters
    let list = activeFilter === 'trash' ? trashItems : items;

    // Filter by type if not 'all', 'shared', or 'trash'
    if (activeFilter !== 'all' && activeFilter !== 'shared' && activeFilter !== 'trash') {
      list = list.filter(item => item.type === activeFilter);
    }

    // Filter by active collection tag
    if (activeCollection) {
      list = list.filter(item =>
        item.tags?.some(tag => tag.toLowerCase() === activeCollection.toLowerCase())
      );
    }

    return list;
  };

  const filteredItems = getFilteredItems();

  // Public View rendering
  if (route.path === 'shared') {
    return (
      <div className="min-h-screen bg-background text-primary flex flex-col font-sans">
        {/* Public Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0 shadow-subtle">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center text-white">
              <Brain className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg text-primary tracking-tight">Brainly Public Space</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-secondary bg-background border border-border px-3 py-1.5 rounded-lg">
            <Globe className="h-3.5 w-3.5 text-green-500 animate-pulse" />
            <span>Shared by @{sharedUser || 'user'}</span>
          </div>
        </header>

        {/* Public Main Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {sharedLoading ? (
            <div className="flex flex-col items-center justify-center h-80 space-y-4">
              <span className="h-10 w-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></span>
              <p className="text-sm text-secondary font-medium">Loading workspace resources...</p>
            </div>
          ) : sharedError ? (
            <div className="flex flex-col items-center justify-center h-80 max-w-md mx-auto text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-primary">Workspace Unavailable</h2>
              <p className="text-sm text-secondary leading-relaxed">{sharedError}</p>
              <button 
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all shadow-subtle"
              >
                Go to Brainly Home
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="border-b border-border pb-5">
                <h2 className="text-2xl font-bold tracking-tight text-primary">@{sharedUser}'s Curated Space</h2>
                <p className="text-sm text-secondary mt-1">Browse through the resources and insights compiled in this shared workspace.</p>
              </div>

              {/* Search Box */}
              <div className="relative w-full max-w-lg">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-secondary pointer-events-none">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={sharedSearchQuery}
                  onChange={(e) => setSharedSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Escape') setSharedSearchQuery(''); }}
                  placeholder="Search this shared workspace..."
                  className="w-full bg-background border border-border text-primary text-sm rounded-lg pl-10 pr-9 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all placeholder:text-secondary/60"
                />
                {sharedSearchQuery && (
                  <button
                    onClick={() => setSharedSearchQuery('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-secondary/60 hover:text-primary transition-colors focus:outline-none"
                    title="Clear search"
                    tabIndex={-1}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {(() => {
                const query = sharedSearchQuery.toLowerCase().trim();
                const filteredShared = query
                  ? sharedItems.filter(
                      (item) =>
                        item.title.toLowerCase().includes(query) ||
                        item.description?.toLowerCase().includes(query) ||
                        item.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
                        item.type.toLowerCase().includes(query)
                    )
                  : sharedItems;

                if (sharedItems.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-xl">
                      <p className="text-sm text-secondary italic">This workspace is currently empty.</p>
                    </div>
                  );
                }

                if (filteredShared.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-xl">
                      <Search className="h-8 w-8 text-secondary/30 mb-3" />
                      <p className="text-sm font-semibold text-primary">No results found</p>
                      <p className="text-xs text-secondary mt-1 max-w-xs text-center">
                        No items match "{sharedSearchQuery}". Try a different keyword.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredShared.map((item) => (
                      <Card
                        key={item._id}
                        item={item}
                        onDelete={() => {}}
                        isPublicView={true}
                      />
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </main>
      </div>
    );
  }

  // Guest landing layout (Not Authenticated)
  if (!auth) {
    return (
      <div className="min-h-screen bg-background text-primary flex flex-col font-sans relative overflow-hidden">
        {/* Background grids */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
        
        {/* Landing Navbar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 lg:px-12 shrink-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center text-white">
              <Brain className="h-5 w-5" />
            </div>
            <span className="font-sans font-bold text-lg tracking-tight text-primary">
              Brainly
            </span>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 border border-border rounded-lg text-secondary hover:text-primary hover:bg-card transition-all"
          >
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>
        </header>

        {/* Hero Body */}
        <main className="flex-1 flex flex-col lg:flex-row items-center justify-between max-w-7xl mx-auto w-full px-6 lg:px-12 py-12 lg:py-24 gap-12 z-10">
          <div className="flex-1 space-y-6 text-center lg:text-left max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Personal Knowledge Management</span>
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-primary leading-tight font-sans">
              Your digital <span className="text-accent">second brain</span>, curated with premium minimalism.
            </h1>
            <p className="text-base lg:text-lg text-secondary leading-relaxed">
              Brainly lets you capture, organize, and catalog links, files, personal thoughts, tweets, and YouTube videos. Keep your web discoveries secure and review them anytime.
            </p>
            
            {/* Features List */}
            <div className="grid grid-cols-2 gap-4 text-left pt-2">
              <div className="flex items-center gap-2.5 text-sm text-secondary">
                <span className="h-2 w-2 rounded-full bg-accent" />
                <span>Tabbed Creation Forms</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-secondary">
                <span className="h-2 w-2 rounded-full bg-accent" />
                <span>Responsive Viewports</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-secondary">
                <span className="h-2 w-2 rounded-full bg-accent" />
                <span>Instant Sharing Toggles</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-secondary">
                <span className="h-2 w-2 rounded-full bg-accent" />
                <span>Virtual Trash Protection</span>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full flex justify-center lg:justify-end">
            {/* Landing page displays the Auth Modal form explicitly */}
            <div className="w-full max-w-md border border-border bg-card rounded-2xl shadow-premium p-1">
              <AuthModal onSuccess={handleLoginSuccess} />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Dashboard layout (Authenticated)
  return (
    <div className="min-h-screen bg-background text-primary flex overflow-hidden font-sans">
      
      {/* Left Sidebar */}
      <Sidebar
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        activeCollection={activeCollection}
        setActiveCollection={setActiveCollection}
        collections={collections}
        onAddCollection={handleAddCollection}
        username={username}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Panel Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navbar */}
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAddContentClick={() => setIsAddModalOpen(true)}
          theme={theme}
          toggleTheme={toggleTheme}
          onMenuToggle={() => setIsSidebarOpen(true)}
          username={username}
        />

        {/* Content Area split between Dashboard Grid and optional Right Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Main Cards Grid */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
            
            {/* Header section with Dynamic Titles */}
            <div className="flex items-center justify-between border-b border-border/80 pb-4 shrink-0">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-primary capitalize">
                  {searchQuery.trim()
                    ? `Search Results`
                    : activeCollection
                    ? `Collection: ${activeCollection}`
                    : `${activeFilter} Content`}
                </h2>
                <p className="text-xs text-secondary mt-0.5">
                  {searchQuery.trim()
                    ? `Showing results across all content types for "${searchQuery.trim()}"`
                    : activeFilter === 'trash'
                    ? 'Review deleted items. Items restored return to the main dashboard.'
                    : `Displaying your saved resources and assets under ${activeCollection ? `collection "${activeCollection}"` : `category "${activeFilter}"`}.`}
                </p>
              </div>

              {/* Mobile Floating Add Button Trigger (redundant to navbar for accessibility) */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="sm:hidden p-2 bg-accent text-white rounded-full shadow-subtle focus:outline-none"
                title="Add Content"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {/* Grid display */}
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-border rounded-xl px-4 text-center">
                <Brain className="h-10 w-10 text-secondary/40 mb-3" />
                <h3 className="text-sm font-semibold text-primary">No resources found</h3>
                <p className="text-xs text-secondary mt-1 max-w-xs leading-relaxed">
                  {searchQuery 
                    ? "We couldn't find matches for your search terms. Try refining the query."
                    : activeFilter === 'trash'
                    ? "The Trash is currently empty."
                    : "Capture items using the 'Add Content' option to populate your second brain."}
                </p>
                {!searchQuery && activeFilter !== 'trash' && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="mt-4 flex items-center gap-1.5 bg-accent text-white text-xs font-semibold px-3.5 py-2 rounded-lg hover:opacity-95 transition-all shadow-subtle"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create Card</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <Card
                    key={item._id}
                    item={item}
                    onDelete={activeFilter === 'trash' ? handlePermanentDelete : handleDeleteItem}
                    onRestore={activeFilter === 'trash' ? handleRestoreItem : undefined}
                    isTrashView={activeFilter === 'trash'}
                  />
                ))}
              </div>
            )}
          </main>

          {/* Right Sidebar - hidden on smaller sizes (tablet/mobile) */}
          <div className="hidden xl:flex xl:h-full">
            <RightSidebar
              items={items}
              isSharing={isSharing}
              onToggleShare={handleShareToggle}
              shareHash={shareHash}
              onCardClick={(item) => {
                // Quick search triggers on card click for fast indexing
                setSearchQuery(item.title);
              }}
            />
          </div>

        </div>
      </div>

      {/* Creation Modal */}
      <AddContentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddItem}
        collections={collections}
      />

    </div>
  );
}
