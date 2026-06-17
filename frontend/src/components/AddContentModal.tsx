import React, { useState } from 'react';
import { X, Link2, FileText, Sparkles, Video as VideoIcon, Plus, Hash } from 'lucide-react';
import { TwitterIcon } from './Icons';
import type { ContentType } from '../types';

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (params: {
    title: string;
    type: ContentType;
    link?: string;
    description?: string;
    tags?: string[];
  }) => Promise<void>;
  collections: string[];
}

export default function AddContentModal({
  isOpen,
  onClose,
  onAdd,
  collections,
}: AddContentModalProps) {
  const [activeTab, setActiveTab] = useState<ContentType>('link');
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const tabs: { id: ContentType; name: string; icon: any }[] = [
    { id: 'link', name: 'Link', icon: Link2 },
    { id: 'note', name: 'Note', icon: FileText },
    { id: 'thought', name: 'Thought', icon: Sparkles },
    { id: 'tweet', name: 'Tweet', icon: TwitterIcon },
    { id: 'video', name: 'Video', icon: VideoIcon },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    // Validation per tab type
    if ((activeTab === 'link' || activeTab === 'tweet' || activeTab === 'video') && !link.trim()) {
      setError(`Link is required for type "${activeTab}"`);
      return;
    }

    setLoading(true);
    try {
      // Parse tags
      const tagList = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);

      if (selectedCollection) {
        tagList.push(selectedCollection.toLowerCase());
      }

      await onAdd({
        title: title.trim(),
        type: activeTab,
        link: link.trim() || undefined,
        description: description.trim() || undefined,
        tags: tagList,
      });

      // Clear form on success
      setTitle('');
      setLink('');
      setDescription('');
      setTagsInput('');
      setSelectedCollection('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add resource. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      {/* Click Outside to Close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-premium overflow-hidden transition-all transform scale-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0 bg-background/30">
          <h3 className="text-base font-bold text-primary">Add Resource</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-border text-secondary hover:text-primary hover:bg-background transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-border bg-background/10 p-1.5 shrink-0 gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setError('');
                }}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  isSelected
                    ? 'bg-accent text-white shadow-subtle'
                    : 'text-secondary hover:text-primary hover:bg-background/80'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Title Field */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-secondary mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. JavaScript Clean Code Guidelines"
              className="w-full bg-background border border-border text-primary text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent px-3.5 py-2.5 transition-all"
              required
              autoFocus
            />
          </div>

          {/* Conditional URL Link Field */}
          {(activeTab === 'link' || activeTab === 'tweet' || activeTab === 'video') && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-secondary mb-1.5">
                {activeTab === 'link' ? 'URL' : activeTab === 'tweet' ? 'Tweet URL' : 'YouTube Video URL'}
              </label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder={
                  activeTab === 'link'
                    ? 'https://example.com/article'
                    : activeTab === 'tweet'
                    ? 'https://twitter.com/username/status/123456'
                    : 'https://youtube.com/watch?v=xyz'
                }
                className="w-full bg-background border border-border text-primary text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent px-3.5 py-2.5 transition-all"
                required
              />
            </div>
          )}

          {/* Conditional Description Field */}
          {(activeTab === 'note' || activeTab === 'thought' || activeTab === 'link') && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-secondary mb-1.5">
                {activeTab === 'note' ? 'Content' : activeTab === 'thought' ? 'Thought Detail' : 'Description / Notes'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  activeTab === 'note'
                    ? 'Type your detailed note or code snippet here...'
                    : activeTab === 'thought'
                    ? 'What is on your mind? Jot down your quick insight...'
                    : 'Add a summary or key takeaways for this URL...'
                }
                rows={activeTab === 'note' ? 6 : 4}
                className="w-full bg-background border border-border text-primary text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent px-3.5 py-2.5 transition-all resize-none font-sans"
              />
            </div>
          )}

          {/* Tags field */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-secondary mb-1.5">
              Tags (Comma separated)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-secondary">
                <Hash className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. coding, javascript, tutorial"
                className="w-full bg-background border border-border text-primary text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent pl-9 pr-4 py-2.5 transition-all"
              />
            </div>
          </div>

          {/* Collections Selector */}
          {collections.length > 0 && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-secondary mb-1.5">
                Add to Collection
              </label>
              <select
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
                className="w-full bg-background border border-border text-primary text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent px-3 py-2.5 transition-all"
              >
                <option value="">None (General)</option>
                {collections.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-4 border-t border-border flex justify-end gap-3.5 bg-background/10 mt-6 -mx-6 -mb-6 p-6 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border text-secondary hover:text-primary hover:bg-background/80 text-sm font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-accent text-white hover:opacity-95 text-sm font-semibold rounded-lg px-5 py-2 shadow-subtle active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>{loading ? 'Adding...' : 'Add Resource'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
