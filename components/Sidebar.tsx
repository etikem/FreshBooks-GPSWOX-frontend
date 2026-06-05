'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ScrollText,
  RefreshCcw,
  GitCompareArrows,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/clients', label: 'Clients', icon: Users },
      { href: '/reconciliation', label: 'Reconciliation', icon: GitCompareArrows },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/logs', label: 'Logs', icon: ScrollText },
      { href: '/retries', label: 'Retries', icon: RefreshCcw },
    ],
  },
];

/**
 * The shared inner nav — used both by the persistent desktop Sidebar and by
 * the MobileNav slide-in drawer. `onNavigate` is the hook the mobile drawer
 * uses to close itself when the user picks a destination.
 */
export function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  return (
    <div className="h-full flex flex-col">
      <div className="px-5 h-16 flex items-center gap-2.5 shrink-0">
        <BrandMark />
        <div className="leading-tight">
          <div className="text-[15px] font-semibold tracking-tight">
            FreshBooks
          </div>
          <div className="text-[11px] text-ink-onSidebarMuted">
            ↔ ABC Track admin
          </div>
        </div>
      </div>

      <div className="px-3 pt-3 pb-2 space-y-5 flex-1 overflow-y-auto">
        {groups.map((g) => (
          <div key={g.label}>
            <div className="px-3 mb-2 text-[10px] font-semibold tracking-[0.14em] uppercase text-ink-onSidebarMuted/80">
              {g.label}
            </div>
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const Icon = it.icon;
                const active = path?.startsWith(it.href);
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      onClick={onNavigate}
                      className={cn(
                        'group relative flex items-center gap-3 h-10 px-3 rounded-lg text-sm font-medium focus-ring transition-colors',
                        active
                          ? 'bg-info/15 text-ink-onSidebar'
                          : 'text-ink-onSidebarMuted hover:text-ink-onSidebar hover:bg-white/[0.04]',
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-info" />
                      )}
                      <Icon
                        className={cn(
                          'size-4 shrink-0',
                          active ? 'text-info' : 'opacity-80',
                        )}
                      />
                      <span>{it.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-auto p-3 shrink-0">
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3 text-[12px] text-ink-onSidebarMuted leading-snug">
          <div className="font-medium text-ink-onSidebar mb-0.5">
            Safety mode
          </div>
          BLOCK on any ambiguity. Access is restored only when total
          outstanding equals zero.
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <nav className="hidden md:flex md:flex-col w-60 shrink-0 bg-bg-sidebar text-ink-onSidebar">
      <SidebarBody />
    </nav>
  );
}

function BrandMark() {
  return (
    <span className="relative size-9 rounded-xl bg-white/[0.06] flex items-center justify-center ring-1 ring-white/10">
      <span className="absolute inset-1.5 rounded-lg bg-info/15" />
      <span className="relative size-2.5 rounded-full bg-info shadow-glow" />
    </span>
  );
}
