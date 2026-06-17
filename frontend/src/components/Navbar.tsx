import { Menu, Search, X, Sun, Moon, Plus, User } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddContentClick: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onMenuToggle: () => void;
  username: string | null;
}

export default function Navbar({
  searchQuery,
  setSearchQuery,
  onAddContentClick,
  theme,
  toggleTheme,
  onMenuToggle,
  username,
}: NavbarProps) {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0 z-10">
      {/* Mobile Sidebar Trigger & Search */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ml-2 rounded-lg border border-border text-secondary hover:text-primary hover:bg-background transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search Bar */}
        <div className="relative w-full">
          {/* Left search icon */}
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-secondary pointer-events-none">
            <Search className="h-4 w-4" />
          </span>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setSearchQuery('');
              }
            }}
            placeholder="Search your second brain..."
            className="w-full bg-background border border-border text-primary text-sm rounded-lg pl-10 pr-9 py-2 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all placeholder:text-secondary/60"
          />

          {/* Clear button — only visible when query is non-empty */}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-secondary/60 hover:text-primary focus:text-primary active:scale-90 transition-all focus:outline-none"
              title="Clear search"
              tabIndex={-1}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3.5 pl-4 shrink-0">
        {/* Add Content Button */}
        <button
          onClick={onAddContentClick}
          className="hidden sm:flex items-center gap-2 bg-accent text-white hover:opacity-95 text-sm font-semibold rounded-lg px-4 py-2 shadow-subtle active:scale-[0.98] transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add Content</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 border border-border rounded-lg text-secondary hover:text-primary hover:bg-background transition-all"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* User Profile Avatar */}
        <div className="h-9 w-9 rounded-full bg-background border border-border flex items-center justify-center text-primary shadow-subtle cursor-pointer select-none">
          {username ? (
            <span className="font-sans font-bold text-xs uppercase text-accent">
              {username.substring(0, 2)}
            </span>
          ) : (
            <User className="h-4 w-4 text-secondary" />
          )}
        </div>
      </div>
    </header>
  );
}
