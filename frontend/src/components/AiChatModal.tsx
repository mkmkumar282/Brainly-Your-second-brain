import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, Bot, User, Loader2, BookOpen, AlertCircle } from 'lucide-react';
import { askAI } from '../services/api';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  sources?: string[];
  isError?: boolean;
}

interface AiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

export default function AiChatModal({ isOpen, onClose, userId }: AiChatModalProps) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-focus the input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Scroll to the latest message after each update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    // Optimistically append the user's message
    setMessages(prev => [...prev, { role: 'user', text: trimmed }]);
    setQuestion('');
    setLoading(true);

    try {
      if (!userId) throw new Error('User not authenticated. Please sign in again.');

      const { answer, sourcesUsed } = await askAI(userId, trimmed);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: answer, sources: sourcesUsed },
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: err.message || 'Something went wrong. Please try again.',
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-4 sm:pb-0">
      {/* Click-outside closes modal */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Panel */}
      <div className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-premium flex flex-col overflow-hidden"
           style={{ height: 'min(640px, 90vh)' }}>

        {/* ── Header ─────────────────────────────────── */}
        <div className="h-14 shrink-0 border-b border-border flex items-center justify-between px-5 bg-background/40">
          <div className="flex items-center gap-2.5">
            {/* Animated gradient icon */}
            <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                 style={{ background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)' }}>
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary leading-tight">Ask your Second Brain</p>
              <p className="text-[10px] text-secondary leading-tight">Powered by Gemini · Searches your saved notes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-border text-secondary hover:text-primary hover:bg-background transition-colors"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Message Feed ───────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* Welcome state (empty messages) */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-8">
              {/* Glowing orb */}
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl flex items-center justify-center"
                     style={{ background: 'linear-gradient(135deg, #2563EB22 0%, #7C3AED22 100%)', border: '1px solid #2563EB33' }}>
                  <Bot className="h-8 w-8" style={{ color: '#2563EB' }} />
                </div>
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-card animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">What would you like to know?</p>
                <p className="text-xs text-secondary mt-1 max-w-xs leading-relaxed">
                  I'll search through your saved notes, links, and thoughts to answer your question.
                </p>
              </div>

              {/* Suggestion chips */}
              <div className="flex flex-wrap gap-2 justify-center pt-1">
                {[
                  'What did I save about React?',
                  'Summarize my design notes',
                  'Find my JavaScript resources',
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setQuestion(chip)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border text-secondary hover:text-primary hover:border-accent/50 hover:bg-accent/5 transition-all"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conversation messages */}
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

              {/* AI Avatar */}
              {msg.role === 'assistant' && (
                <div className="h-7 w-7 shrink-0 rounded-lg flex items-center justify-center mt-0.5"
                     style={{ background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)' }}>
                  {msg.isError
                    ? <AlertCircle className="h-3.5 w-3.5 text-white" />
                    : <Bot className="h-3.5 w-3.5 text-white" />}
                </div>
              )}

              {/* Bubble */}
              <div className={`max-w-[82%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-accent text-white rounded-br-sm'
                    : msg.isError
                    ? 'bg-red-500/10 border border-red-500/20 text-red-400 rounded-bl-sm'
                    : 'bg-background border border-border text-primary rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>

                {/* Sources citation pills */}
                {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 px-1">
                    <span className="flex items-center gap-1 text-[10px] text-secondary font-medium">
                      <BookOpen className="h-3 w-3" /> Sources:
                    </span>
                    {msg.sources.map((src, si) => (
                      <span
                        key={si}
                        className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
                        style={{
                          borderColor: '#2563EB44',
                          background: '#2563EB11',
                          color: '#2563EB',
                        }}
                      >
                        {src}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* User Avatar */}
              {msg.role === 'user' && (
                <div className="h-7 w-7 shrink-0 rounded-lg bg-background border border-border flex items-center justify-center mt-0.5">
                  <User className="h-3.5 w-3.5 text-secondary" />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator while loading */}
          {loading && (
            <div className="flex gap-2.5 justify-start">
              <div className="h-7 w-7 shrink-0 rounded-lg flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)' }}>
                <Bot className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-background border border-border flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 text-accent animate-spin" />
                <span className="text-xs text-secondary">Searching your brain...</span>
              </div>
            </div>
          )}

          {/* Invisible anchor to scroll to */}
          <div ref={bottomRef} />
        </div>

        {/* ── Input Bar ──────────────────────────────── */}
        <form
          onSubmit={handleSubmit}
          className="shrink-0 border-t border-border bg-background/40 px-4 py-3 flex items-center gap-3"
        >
          <input
            ref={inputRef}
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your saved notes..."
            disabled={loading}
            className="flex-1 bg-background border border-border text-primary text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all placeholder:text-secondary/60 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!question.trim() || loading}
            id="ai-chat-send-btn"
            className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-white transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            style={{ background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)' }}
            title="Send"
          >
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
