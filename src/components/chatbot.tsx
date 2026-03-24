'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Loader2, Clock, RotateCcw } from 'lucide-react';
import { getSessionId } from '@/src/lib/recommendations';
import { isSignalsEnabled } from '@/src/lib/consent';
import { getArticleBySlug } from '@/src/lib/data';
import { getCategoryByName } from '@/src/lib/config';
import {
  trackChatOpened,
  trackChatClosed,
  trackChatMessageSent,
  trackChatRecommendationClicked,
} from '@/src/lib/business-events';
import type { ChatMessage } from '@/src/lib/chat';

const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    "Hi! I'm the Daily Query assistant. I can help you find articles you'll enjoy or tell you about our subscription plans. What would you like to know?",
};

// Parse <<slug>> markers from text and return clean text + article slugs
function parseArticleRefs(content: string): { text: string; slugs: string[] } {
  const slugs: string[] = [];
  const text = content.replace(/<<([\w-]+)>>/g, (_, slug) => {
    if (!slugs.includes(slug)) slugs.push(slug);
    return '';
  }).replace(/\n{3,}/g, '\n\n').trim();
  return { text, slugs };
}

function ArticleCard({ slug, onLinkClick }: { slug: string; onLinkClick: (slug: string) => void }) {
  const article = getArticleBySlug(slug);
  if (!article) return null;

  const category = getCategoryByName(article.category);

  return (
    <a
      href={`/articles/${slug}`}
      onClick={(e) => {
        e.preventDefault();
        onLinkClick(slug);
        window.location.href = `/articles/${slug}`;
      }}
      className="block rounded-lg overflow-hidden border border-gray-200 hover:border-brand-primary/50 hover:shadow-md transition-all mt-2"
    >
      <div className="relative h-28">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        {category && (
          <span
            className="absolute top-2 right-2 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: category.color }}
          >
            {category.name}
          </span>
        )}
      </div>
      <div className="p-2.5">
        <h4 className="text-xs font-semibold text-gray-900 leading-tight line-clamp-2">
          {article.title}
        </h4>
        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500">
          <span>{article.author}</span>
          <span className="flex items-center gap-0.5">
            <Clock className="h-2.5 w-2.5" />
            {article.readTime} min
          </span>
        </div>
      </div>
    </a>
  );
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [signalsOn, setSignalsOn] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with Signals toggle on mount and when it changes
  useEffect(() => {
    setSignalsOn(isSignalsEnabled());

    const handleSignalsChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setSignalsOn(detail.enabled);
    };

    window.addEventListener('signalsPreferenceChanged', handleSignalsChange);
    return () => {
      window.removeEventListener('signalsPreferenceChanged', handleSignalsChange);
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen) {
      trackChatOpened();
    } else {
      trackChatClosed();
    }
  };

  const handleReset = () => {
    setMessages([WELCOME_MESSAGE]);
    setInput('');
  };

  const handleLinkClick = (slug: string) => {
    trackChatRecommendationClicked(slug);
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    trackChatMessageSent(trimmed);

    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    // Add placeholder for assistant response
    const assistantMessage: ChatMessage = { role: 'assistant', content: '' };
    setMessages([...updatedMessages, assistantMessage]);

    try {
      // Brief delay before fetching to feel more natural
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const sessionId = getSessionId();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages
            .filter((m) => m !== WELCOME_MESSAGE)
            .map((m) => ({ role: m.role, content: m.content })),
          sessionId,
          currentPage: window.location.pathname,
          signalsEnabled: signalsOn,
        }),
      });

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6);
          try {
            const data = JSON.parse(jsonStr);
            if (data.type === 'text_delta') {
              accumulated += data.text;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: 'assistant',
                  content: accumulated,
                };
                return updated;
              });
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Drawer */}
      {isOpen && (
        <div
          className={`fixed bottom-24 right-6 z-40 w-[calc(100vw-3rem)] sm:w-96 h-[500px] max-h-[80vh] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden animate-fade-in ${
            signalsOn ? 'ring-2 ring-emerald-400' : ''
          }`}
        >
          {/* Header */}
          <div className="bg-brand-primary text-white px-4 py-3 flex items-center justify-between shrink-0">
            <h3 className="font-semibold text-sm">Chat with The Daily Query</h3>
            <div className="flex items-center gap-1.5">
              {signalsOn && (
                <span className="text-[9px] font-medium bg-emerald-400 text-white px-1.5 py-0.5 rounded-full">
                  Signals
                </span>
              )}
              <button
                onClick={handleReset}
                className="text-white/80 hover:text-white transition-colors p-0.5"
                aria-label="Reset chat"
                title="Reset chat"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={handleToggle}
                className="text-white/80 hover:text-white transition-colors p-0.5"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => {
              const { text, slugs } = msg.role === 'assistant'
                ? parseArticleRefs(msg.content)
                : { text: msg.content, slugs: [] };

              return (
                <div key={i}>
                  <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-brand-primary text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {text || (isLoading && i === messages.length - 1 && msg.role === 'assistant' ? null : text)}
                      {isLoading && i === messages.length - 1 && msg.role === 'assistant' && !text && (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      )}
                    </div>
                  </div>
                  {/* Article cards rendered below the message bubble */}
                  {slugs.length > 0 && (
                    <div className="max-w-[85%] mt-1 space-y-2">
                      {slugs.map((slug) => (
                        <ArticleCard key={slug} slug={slug} onLinkClick={handleLinkClick} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3 shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={handleToggle}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-brand-primary hover:bg-brand-primary-dark text-white shadow-lg flex items-center justify-center transition-all hover:scale-105"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
}
