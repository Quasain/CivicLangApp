import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      {/* Header / Hero */}
      <header className="border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500">CivicLang</span>
          </h1>
          <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
            AI-powered civic language assistant built for <b>Irvine residents</b> — simplifying, translating, and connecting you with local government services.
          </p>
         
        </div>
      </header>

      {/* Main Sections */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Overview Card */}
        <section className="relative rounded-3xl bg-white/80 backdrop-blur-md shadow-xl ring-1 ring-slate-200 p-8 sm:p-10">
          <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-sky-500/10 to-emerald-500/10 blur-2xl" />
          <h2 className="text-2xl font-semibold text-slate-900 mb-3">All-in-one civic language platform</h2>
          <p className="text-slate-600 mb-6">
            Translate Irvine resources, simplify city documents, and communicate confidently with local agencies — all in your preferred language.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/translate"
              className="rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:from-indigo-500 hover:to-cyan-500 transition"
            >
              🌐 Translate
            </Link>
            <Link
              href="/summarize"
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
            >
              🪶 Simplify
            </Link>
           
            <Link
              href="/rewrite"
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
            >
              ✍️ Write to City
            </Link>
            <Link
              href="/chat"
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
            >
              💬 Civic Chat
            </Link>
          </div>
        </section>

        {/* Right: Highlights / Features */}
        <section className="rounded-3xl bg-white shadow-xl ring-1 ring-slate-200 p-8 sm:p-10">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Why CivicLang stands out</h2>
          <ul className="space-y-4 text-slate-700 text-sm leading-relaxed">
            <li className="flex items-start gap-3">
              <span className="text-indigo-600 text-lg">🏙️</span>
              <span><b>Local context:</b> integrated with Irvine city data, IUSD resources, and OCVote information.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-600 text-lg">🧠</span>
              <span><b>Plain-language simplification:</b> explains civic text in easy-to-understand terms — not just direct translation.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-600 text-lg">🗣️</span>
              <span><b>Multilingual accessibility:</b> supports English, Korean, Chinese, Persian, and Spanish — more coming soon.</span>
            </li>
            
            <li className="flex items-start gap-3">
              <span className="text-indigo-600 text-lg">🤝</span>
              <span><b>Empathy and tone:</b> rewrites messages in formal or polite tones for communicating with city staff.</span>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
