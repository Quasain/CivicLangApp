'use client';

import React from 'react';

type LangCode = 'en' | 'ko' | 'zh' | 'fa' | 'es';
type Tone = 'formal' | 'polite' | 'neutral';

const isRTL = (lang: LangCode) => lang === 'fa';

export default function RewritePage() {
  const [text, setText] = React.useState('Garbage not pick up. What now?');
  const [lang, setLang] = React.useState<LangCode>('en');
  const [tone, setTone] = React.useState<Tone>('formal');
  const [out, setOut] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  // Ctrl/Cmd + Enter to run
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'enter') void run();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [text, lang, tone]);

  const run = async () => {
    try {
      setLoading(true);
      setError(null);
      setOut('Rewriting…');
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang, tone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Request failed');
      setOut(data.output ?? data.text ?? '');
    } catch (e: any) {
      setError(e?.message || 'Something went wrong.');
      setOut('');
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setText('');
    setOut('');
    setError(null);
    textareaRef.current?.focus();
  };

  const copyOut = async () => {
    if (!out) return;
    await navigator.clipboard.writeText(out);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            
            <div>
              <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Context-Aware Rewriting</h1>
              <p className="text-xs text-slate-500">Rewrite messages into clear, courteous language in your chosen tone.</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
            <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 border border-emerald-200">Live</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Input card */}
          <section className="relative rounded-3xl bg-white/80 backdrop-blur-md shadow-xl ring-1 ring-slate-200">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-sky-500/10 to-emerald-500/10 blur-2xl" />
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Input</h2>
              <p className="mt-1 text-sm text-slate-500">Paste your message and choose tone + language for the rewrite.</p>

              <div className="mt-5">
                <label htmlFor="srcText" className="block text-sm font-medium text-slate-700 mb-1">
                  Text to rewrite
                </label>
                <textarea
                  id="srcText"
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g., Garbage not pick up. What now?"
                  rows={8}
                  className="w-full resize-y rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />

                {/* Quick examples */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    'Need help: my trash wasn’t collected this morning.',
                    'Streetlight on Cypress Ave is out near 1234—who do I contact?',
                    'Please confirm documents required for IUSD enrollment.',
                  ].map((ex, i) => (
                    <button
                      key={i}
                      type="button"
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100"
                      onClick={() => setText(ex)}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Language</label>
                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value as LangCode)}
                    className="w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                    aria-label="Language"
                  >
                    <option value="en">English</option>
                    <option value="ko">Korean</option>
                    <option value="zh">Chinese</option>
                    <option value="fa">Persian</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as Tone)}
                    className="w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                    aria-label="Tone"
                  >
                    <option value="formal">Formal</option>
                    <option value="polite">Polite</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>

                <div className="flex items-end gap-3">
                  <button
                    type="button"
                    onClick={run}
                    disabled={loading || !text.trim()}
                    className="inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 font-semibold text-white shadow-lg transition disabled:opacity-50
                               bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:via-blue-500 hover:to-cyan-500"
                    aria-label="Rewrite"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Rewriting…
                      </span>
                    ) : (
                      'Rewrite'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={clear}
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50"
                    aria-label="Clear"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Right: Output card */}
          <section className="rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Rewritten Message</h2>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                    onClick={copyOut}
                    disabled={!out || loading}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                {error ? (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700 text-sm">
                    {error}
                  </div>
                ) : loading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-3 rounded bg-slate-200 w-11/12" />
                    <div className="h-3 rounded bg-slate-200 w-10/12" />
                    <div className="h-3 rounded bg-slate-200 w-9/12" />
                    <div className="h-3 rounded bg-slate-200 w-8/12" />
                  </div>
                ) : out ? (
                  <pre
                    className="whitespace-pre-wrap text-slate-900 text-sm leading-relaxed"
                    dir={isRTL(lang) ? 'rtl' : 'ltr'}
                  >
                    {out}
                  </pre>
                ) : (
                  <p className="text-sm text-slate-500">Enter text, choose tone & language, then click “Rewrite”.</p>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
