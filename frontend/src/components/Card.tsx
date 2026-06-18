import { useState } from 'react';
import { Link2, FileText, Sparkles, Video, Trash2, ArrowUpRight, Copy, Check, RotateCcw } from 'lucide-react';
import { TwitterIcon } from './Icons';
import type { ContentItem } from '../types';

interface CardProps {
  item: ContentItem;
  onDelete: (id: string) => void;
  isTrashView?: boolean;
  onRestore?: (id: string) => void;
  isPublicView?: boolean;
}

export default function Card({
  item,
  onDelete,
  isTrashView = false,
  onRestore,
  isPublicView = false,
}: CardProps) {
  const [copied, setCopied] = useState(false);

  const { _id, title, type, link, description, tags, createdAt } = item;

  // Icon mapping
  const typeIcons = {
    link: Link2,
    note: FileText,
    thought: Sparkles,
    tweet: TwitterIcon,
    video: Video,
  };

  const Icon = typeIcons[type] || Link2;

  // Type theme coloring for cards
  const typeThemes = {
    link: 'border-blue-500/20 text-blue-500 bg-blue-500/5',
    note: 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5',
    thought: 'border-yellow-500/20 text-yellow-500 bg-yellow-500/5',
    tweet: 'border-sky-500/20 text-sky-500 bg-sky-500/5',
    video: 'border-red-500/20 text-red-500 bg-red-500/5',
  };

  const themeClass = typeThemes[type] || typeThemes.link;

  // Date formatter
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Unknown Date';

  // Helper to extract YouTube video ID
  const getYouTubeId = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleCopyLink = () => {
    const textToCopy = link || `${window.location.origin}/content/${_id}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ytId = type === 'video' ? getYouTubeId(link) : null;

  return (
    <article className="bg-card border border-border rounded-xl p-5 hover:border-accent/30 hover:shadow-subtle transition-all duration-200 flex flex-col justify-between space-y-4 group">
      
      {/* Card Header */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Resource Type Tag */}
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${themeClass}`}>
            <Icon className="h-3 w-3 shrink-0" />
            <span>{type}</span>
          </span>

          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isTrashView ? (
              <>
                {onRestore && (
                  <button
                    onClick={() => onRestore(_id)}
                    className="p-1.5 text-secondary hover:text-primary hover:bg-background rounded-lg transition-all"
                    title="Restore item"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => onDelete(_id)}
                  className="p-1.5 text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Delete permanently"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                {!isPublicView && link && (
                  <button
                    onClick={handleCopyLink}
                    className="p-1.5 text-secondary hover:text-primary hover:bg-background rounded-lg transition-all"
                    title="Copy resource URL"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                )}
                {!isPublicView && (
                  <button
                    onClick={() => onDelete(_id)}
                    className="p-1.5 text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Delete item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Card Title & Content */}
        <div>
          <h3 className="text-sm font-semibold text-primary group-hover:text-accent transition-colors leading-snug">
            {link && type !== 'thought' ? (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:underline decoration-accent/30"
              >
                {title}
                <ArrowUpRight className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
              </a>
            ) : (
              title
            )}
          </h3>

          {/* Description styling based on content types */}
          {description && (
            <div className="mt-2.5">
              {type === 'thought' ? (
                <blockquote className="border-l-2 border-yellow-500/30 pl-3 italic text-xs text-secondary leading-relaxed bg-yellow-500/5 py-1.5 pr-2 rounded-r-md">
                  "{description}"
                </blockquote>
              ) : type === 'note' ? (
                <p className="text-xs text-secondary leading-relaxed font-sans whitespace-pre-wrap line-clamp-6">
                  {description}
                </p>
              ) : (
                <p className="text-xs text-secondary leading-relaxed line-clamp-3">
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Special Embed Previews */}
          {type === 'video' && ytId && (
            <div className="mt-3 overflow-hidden rounded-lg border border-border aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${ytId}`}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )}

          {type === 'tweet' && link && (
            <div className="mt-3 p-3 border border-border rounded-lg bg-background/40 flex items-start gap-2.5">
              <TwitterIcon className="h-4 w-4 text-sky-400 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-semibold text-secondary">Embedded Tweet</span>
                <p className="text-xs text-primary truncate mt-0.5">{link}</p>
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-accent hover:underline inline-block mt-1 font-semibold"
                >
                  View original thread
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="space-y-3 pt-3.5 border-t border-border/60">
        {/* Tag chips */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium bg-background border border-border text-secondary hover:text-primary hover:border-accent/20 cursor-pointer transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] text-secondary">
          <span>{formattedDate}</span>
          {!isPublicView && (
            <span className="font-medium text-accent/80 hover:text-accent cursor-pointer transition-colors">
              Workspace Asset
            </span>
          )}
        </div>
      </div>

    </article>
  );
}
