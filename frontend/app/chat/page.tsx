'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth';
import { useChatStore } from '@/lib/store/chat';
import ThemeToggle from '@/components/ThemeToggle';

const SUGGESTIONS = [
  'What is the B.Tech CSE fee?',
  'How do I apply for admission?',
  'What are the hostel options?',
  'What EAMCET rank is needed for CSE?',
];

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function formatTime(date?: Date) {
  const d = date ? new Date(date) : new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Cleans raw markdown asterisks from AI text
function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')   // **bold** → plain
    .replace(/\*(.*?)\*/g, '$1')        // *italic* → plain
    .replace(/#{1,3}\s/g, '')           // ## headings → plain
    .trim();
}

function FormattedMessage({ content, isUser }: { content: string; isUser: boolean }) {
  if (isUser) {
    return <p style={{ margin: 0, lineHeight: '1.6' }}>{content}</p>;
  }

  // Split into lines and group
  const lines = cleanMarkdown(content).split('\n');
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      blocks.push(
        <ol key={key} style={{ margin: '0.4rem 0 0.4rem 1.1rem', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {listItems.map((item, i) => (
            <li key={i} style={{ fontSize: '0.87rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
              {item}
            </li>
          ))}
        </ol>
      );
      listItems = [];
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList(`list-${i}`);
      return;
    }

    // Numbered list: "1. " or "- "
    const numberedMatch = trimmed.match(/^\d+\.\s+(.+)/);
    const bulletMatch = trimmed.match(/^[-•]\s+(.+)/);

    if (numberedMatch) {
      listItems.push(numberedMatch[1]);
    } else if (bulletMatch) {
      listItems.push(bulletMatch[1]);
    } else {
      flushList(`list-${i}`);
      // Source citation line
      if (trimmed.toLowerCase().startsWith('source:')) {
        blocks.push(
          <p key={i} style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginTop: '0.6rem',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.2px',
          }}>
            📄 {trimmed}
          </p>
        );
      } else {
        blocks.push(
          <p key={i} style={{ margin: '0.2rem 0', lineHeight: '1.65', fontSize: '0.87rem' }}>
            {trimmed}
          </p>
        );
      }
    }
  });

  flushList('list-end');

  return <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>{blocks}</div>;
}

export default function ChatPage() {
  const router = useRouter();
  const { token, user, logout } = useAuthStore();
  const { messages, sendMessage, isLoading } = useChatStore();
  const [input, setInput] = useState('');
  const [openSources, setOpenSources] = useState<{ [key: string]: boolean }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!token) router.push('/login');
  }, [token, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    await sendMessage(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto resize
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 150) + 'px';
  };

  const toggleSources = (id: string) => {
    setOpenSources(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getInitials = (email?: string) => {
    if (!email) return 'U';
    return email[0].toUpperCase();
  };

  return (
    <div className="chat-page">
      {/* Subtle bg */}
      <div className="page-bg" style={{ opacity: 0.4 }}>
        <div className="bg-orb-3" />
      </div>

      {/* Navbar */}
      <nav className="chat-nav">
        <div className="chat-nav-left">
          <Link href="/" className="chat-nav-logo">
            <span className="logo-gradient">AskUni</span>
          </Link>
          <div className="chat-nav-divider" />
          <span className="chat-nav-title">AI Knowledge Assistant</span>
        </div>
        <div className="chat-nav-right">
          {user?.role === 'admin' && (
            <Link href="/admin" className="btn-ghost" style={{ padding: '0.38rem 1rem', fontSize: '0.8rem' }}>
              ⚙ Admin
            </Link>
          )}
          <ThemeToggle />
          <div className="user-chip">
            <div className="user-chip-avatar">{getInitials(user?.email)}</div>
            <span>{user?.email ?? 'Student'}</span>
          </div>
          <button
            id="signout-btn"
            className="btn-danger"
            onClick={logout}
            style={{ padding: '0.38rem 1rem', fontSize: '0.8rem' }}
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Chat Body */}
      <div className="chat-body">
        {messages.length === 0 && !isLoading && (
          <div className="chat-empty">
            <div className="chat-empty-icon">🎓</div>
            <h2 className="chat-empty-title">What do you want to know?</h2>
            <p className="chat-empty-sub">
              Ask anything about Anurag University — fees, admissions,
              programs, campus life — and get an AI-powered cited answer.
            </p>
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  className="suggestion-chip"
                  onClick={() => handleSend(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`msg-row ${isUser ? 'user' : 'bot'}`}
            >
              <div className={`msg-avatar ${isUser ? 'user-av' : 'bot-av'}`}>
                {isUser ? getInitials(user?.email) : '🤖'}
              </div>

              <div>
                <div className={`msg-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}`}>
                  <FormattedMessage content={message.content} isUser={isUser} />

                  {!isUser && (
                    <>
                      {/* Confidence */}
                      {message.confidence_score !== undefined && (
                        <div
                          className={`confidence-badge ${message.confidence_score > 0.7 ? 'high' : 'medium'}`}
                        >
                          <span>{message.confidence_score > 0.7 ? '✓' : '~'}</span>
                          {Math.round(message.confidence_score * 100)}% confident
                        </div>
                      )}

                      {/* Sources toggle */}
                      {message.sources && message.sources.length > 0 && (
                        <>
                          <button
                            className="sources-toggle"
                            onClick={() => toggleSources(message.id)}
                          >
                            {openSources[message.id] ? '▲' : '▼'}{' '}
                            {message.sources.length} source{message.sources.length > 1 ? 's' : ''}
                          </button>

                          {openSources[message.id] && (
                            <div className="sources-panel">
                              {message.sources.map((src, idx) => (
                                <div key={idx} className="source-chip">
                                  <div className="source-chip-name">📄 {src.source}</div>
                                  <div className="source-chip-score">
                                    Relevance: {(src.score * 100).toFixed(1)}%
                                  </div>
                                  <div className="source-chip-content">{src.content}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}

                      {/* Processing time */}
                      {message.processing_time && (
                        <div className="msg-time">
                          ⏱ {message.processing_time.toFixed(2)}s
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && (
          <div className="msg-row bot">
            <div className="msg-avatar bot-av">🤖</div>
            <div className="typing-dots">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <div className="chat-input-wrap">
          <textarea
            ref={textareaRef}
            id="chat-input"
            className="chat-textarea"
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask about fees, admissions, programs… (Enter to send)"
            rows={1}
            disabled={isLoading}
          />
          <button
            id="chat-send-btn"
            className="chat-send-btn"
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </div>
        <p className="chat-input-hint">
          Shift+Enter for new line · Powered by Mistral RAG
        </p>
      </div>
    </div>
  );
}
