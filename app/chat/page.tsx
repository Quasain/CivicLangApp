'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Role = 'user' | 'assistant';
type ChatMessage = { role: Role; content: string; ts?: number };

const LS_KEY = 'civic-chat:conversation-v2';

const QUICK_PROMPTS = [
  'Where can I vote in Orange County?',
  'How do I report missed trash pickup?',
  'What documents do I need for IUSD enrollment?',
  'How do I get a library card in Irvine?',
];

export default function ChatPage() {
  const [lang, setLang] = useState<'auto' | 'en' | 'ko' | 'zh' | 'fa' | 'es'>('en');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Load & persist conversation + language
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { messages?: ChatMessage[]; lang?: string };
        if (parsed.messages) setMessages(parsed.messages);
        if (parsed.lang && ['auto','en','ko','zh','fa','es'].includes(parsed.lang))
          setLang(parsed.lang as any);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ messages, lang }));
    } catch {}
  }, [messages, lang]);

  // Auto-scroll to bottom on updates
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  // Cmd/Ctrl + Enter to send
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'enter') {
        e.preventDefault();
        void send();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, messages, lang]);

  const latestAssistant = useMemo(
    () => [...messages].reverse().find((m) => m.role === 'assistant')?.content ?? '',
    [messages]
  );

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setError(null);
    const next = [...messages, { role: 'user', content: text, ts: Date.now() }];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map(({ role, content }) => ({ role, content })),
          language: lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Request failed');

      const reply = (data?.reply || data?.output || '').toString();
      setMessages((prev) => [...prev, { role: 'assistant', content: reply, ts: Date.now() }]);
    } catch (e: any) {
      setError(e?.message || 'Something went wrong.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Sorry — I couldn’t complete that request. Please check your connection and try again.',
          ts: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function newChat() {
    setMessages([]);
    setError(null);
    setInput('');
    try { localStorage.removeItem(LS_KEY); } catch {}
    inputRef.current?.focus();
  }

  function insertPrompt(p: string) {
    setInput(p);
    inputRef.current?.focus();
  }

  async function copyLast() {
    if (!latestAssistant) return;
    await navigator.clipboard.writeText(latestAssistant);
  }

  function exportHistory() {
    const blob = new Blob([JSON.stringify({ messages, lang }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `civic-chat-${new Date().toISOString().slice(0, 19)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const canSend = input.trim().length > 0 && !loading;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Civic Chat</h1>
              <p className="text-xs text-slate-500">
                An intelligent civic chatbot that helps residents simplify city documents, navigate local services, and communicate confidently with Irvine agencies — all in their preferred language.
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
            <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 border border-emerald-200">Live</span>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8">
        <section className="relative mt-0 rounded-3xl ring-1 ring-slate-200 shadow-xl bg-white overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-50 via-sky-50 to-emerald-50" />
          <div className="relative flex flex-col min-h-[84vh] max-h-[94vh]">
            {/* Toolbar */}
            <div className="px-6 sm:px-8 pt-4 pb-2 flex flex-col md:flex-row md:items-center gap-3 justify-between">
              <p className="text-sm text-slate-500">
                Ask in any language; replies come as clear, numbered steps.
              </p>
              <div className="flex flex-wrap gap-2">
                <label className="text-sm text-slate-700 flex items-center gap-2">
                  Reply language:
                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value as any)}
                    className="rounded-md border border-slate-300 px-2 py-1 text-sm bg-white"
                  >
                    <option value="auto">Auto-detect</option>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="zh">Chinese</option>
                    <option value="ko">Korean</option>
                    <option value="fa">Persian</option>
                  </select>
                </label>
                <button
                  onClick={exportHistory}
                  disabled={messages.length === 0}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Export
                </button>
                <button
                  onClick={copyLast}
                  disabled={messages.length === 0}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Copy last
                </button>
                <button
                  onClick={newChat}
                  className="rounded-md border border-rose-300 px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50"
                >
                  New chat
                </button>
              </div>
            </div>

            {/* Conversation */}
            <div ref={listRef} className="px-6 sm:px-8 pt-2 pb-4 flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                <EmptyState />
              ) : (
                <ul className="space-y-4">
                  {messages.map((m, i) => {
                    const urls = m.role === 'assistant' ? extractUrls(m.content) : [];
                    return (
                      <li key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={
                            m.role === 'user'
                              ? 'max-w-[80%] rounded-2xl bg-blue-600 text-white px-4 py-3 shadow-sm'
                              : 'max-w-[80%] rounded-2xl bg-white border px-4 py-3 shadow-sm'
                          }
                        >
                          <MessageText content={m.content} />
                          {m.role === 'assistant' && urls.length > 0 && (
                            <div className="mt-3">
                              <div className="text-xs font-semibold text-slate-700">Sources</div>
                              <ul className="mt-1 space-y-1">
                                {urls.map((u) => (
                                  <li key={u} className="truncate">
                                    <a
                                      href={u}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-xs text-indigo-600 hover:text-indigo-700 underline decoration-dotted underline-offset-4"
                                      title={u}
                                    >
                                      {u}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                  {loading && <LoadingBubble />}
                  {error && (
                    <li className="flex justify-start">
                      <div className="max-w-[80%] rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-rose-700 text-sm">
                        {error}
                      </div>
                    </li>
                  )}
                </ul>
              )}
            </div>

            {/* Composer */}
            <div className="px-6 sm:px-8 pb-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                {messages.length === 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {QUICK_PROMPTS.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => insertPrompt(p)}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
                <form
                  className="flex gap-2 items-end"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (canSend) void send();
                  }}
                >
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about city services, schools, voting, permits, etc. (Ctrl/⌘ + Enter to send)"
                    rows={2}
                    className="flex-1 max-h-36 min-h-[44px] rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!canSend}
                    className="rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white px-5 py-3 font-semibold shadow-lg disabled:opacity-50"
                  >
                    {loading ? 'Thinking…' : 'Send'}
                  </button>
                </form>
                <p className="mt-2 text-xs text-slate-500">Your conversation is stored locally in your browser.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center mt-2">
      <div className="text-lg font-semibold text-slate-800">How can I help?</div>
      <p className="text-slate-500 mt-1">
        Ask in English, Español, 中文, 한국어, فارسی… You’ll get step-by-step instructions.
      </p>
    </div>
  );
}

function LoadingBubble() {
  return (
    <li className="flex justify-start">
      <div className="max-w-[80%] rounded-2xl bg-white border px-4 py-3">
        <div className="animate-pulse space-y-2">
          <div className="h-3 w-48 bg-slate-200 rounded" />
          <div className="h-3 w-72 bg-slate-200 rounded" />
          <div className="h-3 w-56 bg-slate-200 rounded" />
        </div>
      </div>
    </li>
  );
}

function MessageText({ content }: { content: string }) {
  // escape + light formatting
  const html = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/\n/g, '<br/>')
    .replace(/\* /g, '• ')
    .replace(/(\d+)\. /g, '<strong>$1.</strong> ');
  // eslint-disable-next-line react/no-danger
  return <div className="whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
}

function extractUrls(s: string): string[] {
  const urls = Array.from(new Set((s.match(/https?:\/\/[^\s)]+/g) || [])));
  return urls.slice(0, 8);
}
