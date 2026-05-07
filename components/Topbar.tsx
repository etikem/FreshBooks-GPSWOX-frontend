'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, LogOut, User } from 'lucide-react';
import { clearToken } from '@/lib/api';

const titleByPath: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/clients': 'Clients',
  '/logs': 'Logs',
  '/retries': 'Retries',
};

export function Topbar() {
  const router = useRouter();
  const path = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const title =
    Object.entries(titleByPath).find(([p]) => path?.startsWith(p))?.[1] ??
    'Admin';

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function onSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const q = (e.currentTarget.value || '').trim();
      if (!q) return;
      router.push(`/clients?q=${encodeURIComponent(q)}`);
    }
  }

  function logout() {
    clearToken();
    router.replace('/login');
  }

  return (
    <header className="sticky top-0 z-30 h-14 bg-bg-panel/80 backdrop-blur border-b border-border flex items-center gap-4 px-5">
      <div className="text-sm font-semibold text-ink">{title}</div>
      <div className="flex-1 max-w-md ml-4 hidden md:block">
        <div className="relative">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            type="text"
            placeholder="Search clients by email or FreshBooks id…"
            onKeyDown={onSearchKey}
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-bg-subtle border border-transparent hover:border-border focus:border-info/50 focus:bg-bg-panel text-sm placeholder:text-ink-faint focus-ring transition-colors"
          />
        </div>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 h-9 pl-1.5 pr-2.5 rounded-lg hover:bg-bg-subtle focus-ring"
          >
            <span className="size-7 rounded-full bg-info-surface text-info flex items-center justify-center text-xs font-semibold">
              <User className="size-4" />
            </span>
            <span className="text-sm text-ink-muted hidden sm:block">Admin</span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-44 surface shadow-pop py-1 animate-slide-in-up">
              <button
                onClick={logout}
                className="flex items-center gap-2 w-full text-left px-3 h-9 text-sm text-ink hover:bg-bg-subtle"
              >
                <LogOut className="size-4 text-ink-faint" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
