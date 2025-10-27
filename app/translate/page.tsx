'use client';

import React from 'react';

type LangCode = 'en' | 'ko' | 'zh' | 'fa' | 'es';

const LANG_LABEL: Record<LangCode, string> = {
  en: 'English',
  ko: 'Korean',
  zh: 'Chinese',
  fa: 'Persian',
  es: 'Spanish',
};

const isRTL = (lang: LangCode) => lang === 'fa'; // extend if you later add Arabic/Hebrew

export default function TranslatePage() {
  const [source, setSource] = React.useState<LangCode>('en');
  const [target, setTarget] = React.useState<LangCode>('ko');
  const [text, setText] = React.useState(
    'Residents must ensure compliance with municipal Code 5.22B regarding refuse container visibility.'
  );
  const [simplify, setSimplify] = React.useState(true);
  const [out, setOut] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  // Ctrl/Cmd + Enter to run
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'enter') {
        void run();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [text, target, simplify, source]);

  const run = async () => {
    try {
      setLoading(true);
      setError(null);
      setOut('Translating…');
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // send extra hints; backend can ignore if unsupported
        body: JSON.stringify({ text, target, source, simplify }),
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

  const swapLangs = () => {
    setSource(target);
    setTarget(source);
    // Optionally swap text/out as well:
    if (out) {
      setText(out);
      setOut('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            
            <div>
              <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
                Translate with Plain-Language Option
              </h1>
              <p className="text-xs text-slate-500">
                Translate official text and optionally simplify the wording for clarity.
              </p>
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
              <p className="mt-1 text-sm text-slate-500">
                Paste ordinance text, city service instructions, or any official message.
              </p>

              {/* Textarea */}
              <div className="mt-5">
                <label htmlFor="srcText" className="block text-sm font-medium text-slate-700 mb-1">
                  Source text
                </label>
                <textarea
                  id="srcText"
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write or paste text to translate…"
                  rows={8}
                  className="w-full resize-y rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />

                {/* Quick examples */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    'Bulky item pickup requires scheduling at least 2 business days in advance.',
                    'Residents must keep containers out of public view except on collection day.',
                    'Ballots may be returned by mail, drop box, or any vote center in Orange County.',
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">From</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as LangCode)}
                    className="w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                    aria-label="Source language"
                  >
                    {(['en', 'ko', 'zh', 'fa', 'es'] as LangCode[]).map((l) => (
                      <option key={l} value={l}>
                        {LANG_LABEL[l]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={swapLangs}
                    className="inline-flex w-full items-center justify-center rounded-2xl px-5 py-[10px] font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50"
                    aria-label="Swap languages"
                  >
                    Swap
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">To</label>
                  <select
                    value={target}
                    onChange={(e) => setTarget(e.target.value as LangCode)}
                    className="w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                    aria-label="Target language"
                  >
                    {(['en', 'ko', 'zh', 'fa', 'es'] as LangCode[]).map((l) => (
                      <option key={l} value={l}>
                        {LANG_LABEL[l]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Options + Actions */}
              <div className="mt-4 flex flex-col md:flex-row items-start md:items-center gap-4">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    checked={simplify}
                    onChange={(e) => setSimplify(e.target.checked)}
                  />
                  Simplify wording (plain language)
                </label>

                <div className="flex gap-3 md:ml-auto">
                  <button
                    type="button"
                    onClick={run}
                    disabled={loading || !text.trim()}
                    className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold text-white shadow-lg transition disabled:opacity-50
                               bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:via-blue-500 hover:to-cyan-500"
                    aria-label="Translate"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Translating…
                      </span>
                    ) : (
                      'Translate'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={clear}
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50"
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
                <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Translation</h2>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                    onClick={async () => out && (await navigator.clipboard.writeText(out))}
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
                    dir={isRTL(target) ? 'rtl' : 'ltr'}
                  >
                    {out}
                  </pre>
                ) : (
                  <p className="text-sm text-slate-500">Enter text and click “Translate”.</p>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}