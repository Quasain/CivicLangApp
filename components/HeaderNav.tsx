'use client';

import Link from 'next/link';
import { Languages } from 'lucide-react';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/summarize', label: 'Simplify' },
 
  { href: '/rewrite', label: 'Write to City', icon: <Languages size={16} /> },
  { href: '/map', label: 'Map' },
];

export default function HeaderNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname?.startsWith(href));

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-6 text-[15px]">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={[
              'relative transition',
              isActive(item.href)
                ? 'text-indigo-600 dark:text-indigo-400 font-medium'
                : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100',
            ].join(' ')}
          >
            <span className="inline-flex items-center gap-1.5">
              {item.icon}
              {item.label}
            </span>
            {isActive(item.href) && (
              <span className="absolute left-0 -bottom-1 h-0.5 w-full rounded-full bg-indigo-600 dark:bg-indigo-400" />
			  
            )}
          </Link>
        ))}
        <Link
          href="/chat"
          className="rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 px-4 py-2 font-semibold text-white shadow hover:from-indigo-500 hover:to-cyan-500 transition"
        >
          Civic Chat
        </Link>
      </nav>

      {/* Mobile nav (no extra JS) */}
      <details className="md:hidden relative">
        <summary className="list-none cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          Menu
        </summary>
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={[
                'block rounded-lg px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800',
                isActive(item.href)
                  ? 'text-indigo-600 dark:text-indigo-400 font-medium'
                  : 'text-slate-700 dark:text-slate-200',
              ].join(' ')}
            >
              <span className="inline-flex items-center gap-1.5">
                {item.icon}
                {item.label}
              </span>
            </Link>
          ))}
          <Link
            href="/chat"
            className="mt-1 block rounded-lg bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:from-indigo-500 hover:to-cyan-500"
          >
            Civic Chat
          </Link>
        </div>
      </details>
    </>
  );
}
