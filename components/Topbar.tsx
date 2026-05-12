'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, LogOut, Search, Settings, User } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { clearToken } from '@/lib/api';
import { useNotifications } from '@/lib/hooks';
import type { NotificationsResponse } from '@/lib/types';

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
  const notifications = useNotifications();
  const notifCount = countNotifications(notifications.data);

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
    <header className="sticky top-0 z-30 h-16 bg-bg-topbar/85 backdrop-blur border-b border-border flex items-center gap-4 px-6">
      <h1 className="text-[22px] font-semibold tracking-tight text-ink">
        {title}
      </h1>

      <div className="flex-1 max-w-md ml-6 hidden md:block">
        <div className="relative">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            type="text"
            placeholder="Search clients by email or FreshBooks id…"
            onKeyDown={onSearchKey}
            className="w-full h-9 pl-9 pr-3 rounded-full bg-bg-subtle border border-border hover:border-info/40 focus:border-info/60 text-sm text-ink placeholder:text-ink-faint focus-ring transition-colors"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <ThemeToggle />

        <Link
          href="/logs"
          aria-label={
            notifCount
              ? `${notifCount} notifications — view logs`
              : 'View logs'
          }
          className="relative size-9 inline-flex items-center justify-center rounded-lg text-ink-muted hover-overlay-1 hover:text-ink focus-ring transition-colors"
        >
          <Bell className="size-4" />
          {notifCount > 0 && (
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-info ring-2 ring-bg-topbar" />
          )}
        </Link>

        <Link
          href="/retries"
          aria-label="Retries"
          className="size-9 inline-flex items-center justify-center rounded-lg text-ink-muted hover-overlay-1 hover:text-ink focus-ring transition-colors"
        >
          <Settings className="size-4" />
        </Link>

        <div className="w-px h-6 mx-1 bg-border" aria-hidden />

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 h-9 pl-1 pr-2.5 rounded-lg hover-overlay-1 focus-ring"
          >
            <span className="size-7 rounded-full bg-info/15 text-info ring-1 ring-info/30 flex items-center justify-center text-xs font-semibold">
              <User className="size-4" />
            </span>
            <span className="text-sm text-ink-muted hidden sm:block">
              Admin
            </span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-44 surface shadow-pop py-1 animate-slide-in-up">
              <button
                onClick={logout}
                className="flex items-center gap-2 w-full text-left px-3 h-9 text-sm text-ink hover-overlay-1"
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

function countNotifications(n: NotificationsResponse | undefined): number {
  if (!n) return 0;
  return (
    n.cancelled.count +
    n.webhookFailures.count +
    n.failedRetries.count +
    n.recentSyncErrors.count
  );
}
