import { Brain, LayoutGrid, Link2, FileText, Sparkles, Video, Share2, Trash2, LogOut, Folder, Plus, X } from 'lucide-react';
import { TwitterIcon } from './Icons';
import React, { useState } from 'react';

interface SidebarProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  activeCollection: string | null;
  setActiveCollection: (collection: string | null) => void;
  collections: string[];
  onAddCollection: (name: string) => void;
  username: string | null;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  activeFilter,
  setActiveFilter,
  activeCollection,
  setActiveCollection,
  collections,
  onAddCollection,
  username,
  onLogout,
  isOpen,
  onClose,
}: SidebarProps) {
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showAddCollection, setShowAddCollection] = useState(false);

  const navItems = [
    { id: 'all', name: 'All Content', icon: LayoutGrid },
    { id: 'link', name: 'Links', icon: Link2 },
    { id: 'note', name: 'Notes', icon: FileText },
    { id: 'thought', name: 'Thoughts', icon: Sparkles },
    { id: 'tweet', name: 'Tweets', icon: TwitterIcon },
    { id: 'video', name: 'Videos', icon: Video },
    { id: 'shared', name: 'Shared Content', icon: Share2 },
    { id: 'trash', name: 'Trash', icon: Trash2 },
  ];

  const handleAddCollectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCollectionName.trim()) {
      onAddCollection(newCollectionName.trim());
      setNewCollectionName('');
      setShowAddCollection(false);
    }
  };

  const handleFilterClick = (id: string) => {
    setActiveFilter(id);
    setActiveCollection(null);
    onClose();
  };

  const handleCollectionClick = (name: string) => {
    setActiveCollection(name === activeCollection ? null : name);
    setActiveFilter('all'); // default to all contents when clicking collection
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-45 w-64 bg-card border-r border-border flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:z-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo Section */}
          <div className="h-16 border-b border-border flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center text-white">
                <Brain className="h-5 w-5 animate-pulse" />
              </div>
              <span className="font-sans font-bold text-lg tracking-tight text-primary">
                Brainly
              </span>
            </div>
            {/* Mobile Close Button */}
            <button 
              onClick={onClose} 
              className="lg:hidden p-1.5 rounded-lg border border-border text-secondary hover:text-primary hover:bg-background transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Scrollable Area */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7 no-scrollbar">
            {/* main section */}
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-secondary px-3 mb-2.5">
                Categories
              </span>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeFilter === item.id && activeCollection === null;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleFilterClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                        isActive
                          ? 'bg-accent/10 text-accent font-semibold'
                          : 'text-secondary hover:text-primary hover:bg-background/60'
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-accent' : 'text-secondary'}`} />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* collections section */}
            <div>
              <div className="flex items-center justify-between px-3 mb-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                  Collections
                </span>
                <button 
                  onClick={() => setShowAddCollection(!showAddCollection)}
                  className="p-1 text-secondary hover:text-primary hover:bg-background rounded transition-colors"
                  title="Create collection"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {showAddCollection && (
                <form onSubmit={handleAddCollectionSubmit} className="px-3 mb-3">
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="New collection..."
                    className="w-full bg-background border border-border text-primary text-xs rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent"
                    autoFocus
                    required
                  />
                </form>
              )}

              {collections.length === 0 ? (
                <p className="text-xs text-secondary px-3 italic py-1">
                  No collections created
                </p>
              ) : (
                <div className="space-y-1">
                  {collections.map((name) => {
                    const isActive = activeCollection === name;
                    return (
                      <button
                        key={name}
                        onClick={() => handleCollectionClick(name)}
                        className={`w-full flex items-center gap-3 px-3 py-1.5 text-sm rounded-lg transition-all duration-150 ${
                          isActive
                            ? 'bg-accent/10 text-accent font-semibold'
                            : 'text-secondary hover:text-primary hover:bg-background/60'
                        }`}
                      >
                        <Folder className={`h-4 w-4 shrink-0 ${isActive ? 'text-accent' : 'text-secondary'}`} />
                        <span className="truncate">{name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-border shrink-0 bg-background/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-full bg-accent text-white flex items-center justify-center font-sans font-bold uppercase shrink-0 shadow-subtle border border-border/20">
              {username ? username.substring(0, 2) : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-primary truncate leading-tight">
                {username || 'Guest User'}
              </p>
              <p className="text-xs text-secondary truncate mt-0.5 leading-none">
                Personal Workspace
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all shrink-0"
            title="Log Out"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </aside>
    </>
  );
}
