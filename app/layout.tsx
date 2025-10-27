import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import HeaderNav from "@/components/HeaderNav";

export const metadata: Metadata = {
  title: "CivicLang",
  description: "Language for Civic Life — AI-powered local language access for Irvine",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="h-full scroll-smooth bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950"
    >
      <body className="min-h-full text-slate-900 antialiased dark:text-slate-200">
        {/* Skip link for accessibility */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-slate-900 focus:px-3 focus:py-2 focus:text-white"
        >
          Skip to main content
        </a>

        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              {/* Brand */}
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="inline-block h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 shadow ring-1 ring-black/5" />
                <span className="flex flex-col leading-tight">
                  <span className="text-lg font-semibold tracking-tight">CivicLang</span>
                  <span className="text-[11px] text-slate-500 hidden sm:block">
                    Language for Civic Life
                  </span>
                </span>
              </Link>

              {/* Navigation (client component for active state) */}
              <HeaderNav />
            </div>
          </div>
        </header>

        {/* Main */}
        <main id="main" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="mt-16 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-center">
            <div className="mb-3">
              <span className="block text-base font-semibold tracking-tight">
                CivicLang
              </span>
              <span className="block text-xs text-slate-500">
                Language for Civic Life
              </span>
            </div>
            <p className="max-w-2xl mx-auto text-sm text-slate-600 dark:text-slate-300">
              Bridging languages to make local government accessible to everyone.
            </p>

            <nav className="mt-5 flex flex-wrap justify-center gap-3 text-sm">
              <FooterLink href="/translate" label="Translate" />
              <FooterDot />
              <FooterLink href="/summarize" label="Simplify" />
              <FooterDot />
              <FooterLink href="/map" label="Map" />
              <FooterDot />
              <FooterLink href="/chat" label="Civic Chat" />
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}

/* ===== Footer helpers (server-safe) ===== */

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
    >
      {label}
    </Link>
  );
}

function FooterDot() {
  return <span className="text-slate-300 dark:text-slate-600">•</span>;
}
