import { useState } from 'react';
import { BarChart3, Link2, Video, Sparkles, Share2, Copy, Check } from 'lucide-react';
import { TwitterIcon } from './Icons';
import type { ContentItem } from '../types';

interface RightSidebarProps {
  items: ContentItem[];
  isSharing: boolean;
  onToggleShare: (val: boolean) => void;
  shareHash: string | null;
  onCardClick: (item: ContentItem) => void;
}

export default function RightSidebar({
  items,
  isSharing,
  onToggleShare,
  shareHash,
  onCardClick,
}: RightSidebarProps) {
  const [copied, setCopied] = useState(false);

  // Statistics calculations
  const totalItems = items.length;
  const linkCount = items.filter((i) => i.type === 'link').length;
  const noteCount = items.filter((i) => i.type === 'note').length;
  const thoughtCount = items.filter((i) => i.type === 'thought').length;
  const tweetCount = items.filter((i) => i.type === 'tweet').length;
  const videoCount = items.filter((i) => i.type === 'video').length;

  const shareUrl = shareHash ? `${window.location.origin}/share/${shareHash}` : null;

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Get recently added items (last 3)
  const recentlyAdded = [...items]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 3);

  return (
    <aside className="w-80 bg-card border-l border-border flex flex-col shrink-0 h-full overflow-y-auto no-scrollbar">
      <div className="p-6 space-y-8">

        {/* [1] Share Your Brain — PRIMARY, always at top */}
        <div>
          <div className="flex items-center gap-2 mb-3.5">
            <Share2 className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary">
              Share Your Brain
            </h3>
          </div>
          <div className="p-4 bg-background border border-border rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-secondary">Share Entire Brain</span>
              <button
                onClick={() => onToggleShare(!isSharing)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isSharing ? 'bg-accent' : 'bg-border'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isSharing ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {isSharing && (
              <div className="space-y-2">
                <p className="text-[10px] text-secondary leading-normal">
                  Anyone with the link can view your saved resources dashboard.
                </p>
                {shareUrl ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                      className="w-full bg-card border border-border text-[11px] text-primary rounded px-2.5 py-1.5 focus:outline-none font-mono cursor-text"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="p-1.5 bg-card border border-border hover:bg-background text-secondary hover:text-primary rounded transition-all shrink-0"
                      title="Copy share link"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] text-secondary italic">Generating link...</p>
                )}
              </div>
            )}

            {!isSharing && (
              <p className="text-[10px] text-secondary leading-normal">
                Toggle on to generate a public link for your entire brain.
              </p>
            )}
          </div>
        </div>

        {/* [2] Quick Stats */}
        <div>
          <div className="flex items-center gap-2 mb-3.5">
            <BarChart3 className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary">
              Quick Stats
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-3 bg-background border border-border rounded-lg text-center">
              <span className="block text-2xl font-bold text-primary">{totalItems}</span>
              <span className="text-[10px] uppercase font-semibold text-secondary tracking-wider mt-0.5">Total Assets</span>
            </div>
            <div className="p-3 bg-background border border-border rounded-lg text-center">
              <span className="block text-2xl font-bold text-primary">{noteCount}</span>
              <span className="text-[10px] uppercase font-semibold text-secondary tracking-wider mt-0.5">Notes</span>
            </div>
          </div>
          <div className="mt-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="flex items-center gap-2 text-secondary">
                <Link2 className="h-3.5 w-3.5 text-blue-500" /> Links
              </span>
              <span className="font-semibold text-primary">{linkCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs px-1">
              <span className="flex items-center gap-2 text-secondary">
                <Sparkles className="h-3.5 w-3.5 text-yellow-500" /> Thoughts
              </span>
              <span className="font-semibold text-primary">{thoughtCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs px-1">
              <span className="flex items-center gap-2 text-secondary">
                <TwitterIcon className="h-3.5 w-3.5 text-sky-400" /> Tweets
              </span>
              <span className="font-semibold text-primary">{tweetCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs px-1">
              <span className="flex items-center gap-2 text-secondary">
                <Video className="h-3.5 w-3.5 text-red-500" /> Videos
              </span>
              <span className="font-semibold text-primary">{videoCount}</span>
            </div>
          </div>
        </div>

        {/* [3] Recently Added */}
        <div className="pb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary mb-3.5">
            Recently Added
          </h3>
          {recentlyAdded.length === 0 ? (
            <p className="text-xs text-secondary italic">No resources added yet.</p>
          ) : (
            <div className="space-y-3">
              {recentlyAdded.map((item) => (
                <button
                  key={item._id}
                  onClick={() => onCardClick(item)}
                  className="w-full text-left p-3 bg-background border border-border rounded-lg hover:border-accent/30 transition-all group"
                >
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-accent block mb-1">
                    {item.type}
                  </span>
                  <h4 className="text-xs font-semibold text-primary group-hover:text-accent transition-colors truncate">
                    {item.title}
                  </h4>
                  {item.createdAt && (
                    <span className="text-[10px] text-secondary mt-1 block">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </aside>
  );
}
