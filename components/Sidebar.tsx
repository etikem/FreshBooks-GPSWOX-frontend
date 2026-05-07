'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ScrollText,
  RefreshCcw,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/cn';

const items = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/logs', label: 'Logs', icon: ScrollText },
  { href: '/retries', label: 'Retries', icon: RefreshCcw },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <nav className="hidden md:flex md:flex-col w-60 shrink-0 border-r border-border bg-bg-panel">
      <div className="px-5 h-14 flex items-center gap-2 border-b border-border">
        <div className="size-7 rounded-lg bg-ink text-white flex items-center justify-center">
          <Zap className="size-4" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">FreshBooks ↔ GPSWOX</div>
          <div className="text-[11px] text-ink-faint">Sync admin</div>
        </div>
      </div>
      <ul className="p-3 space-y-0.5">
        {items.map((it) => {
          const Icon = it.icon;
          const active = path?.startsWith(it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className={cn(
                  'flex items-center gap-2.5 h-9 px-3 rounded-lg text-sm font-medium focus-ring transition-colors',
                  active
                    ? 'bg-bg-subtle text-ink'
                    : 'text-ink-muted hover:text-ink hover:bg-bg-subtle/60',
                )}
              >
                <Icon
                  className={cn(
                    'size-4',
                    active ? 'text-ink' : 'text-ink-faint group-hover:text-ink',
                  )}
                />
                <span>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto p-3">
        <div className="rounded-lg border border-border bg-bg-subtle p-3 text-[12px] text-ink-muted leading-snug">
          <div className="font-medium text-ink mb-0.5">Safety mode</div>
          BLOCK on any ambiguity. Access is restored only when total
          outstanding equals zero.
        </div>
      </div>
    </nav>
  );
}
