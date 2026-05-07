import {
  CheckCircle2,
  ShieldOff,
  Power,
  PowerOff,
  CalendarClock,
  AlertTriangle,
  Wrench,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { ActionKind } from '@/lib/types';

interface ActivityItem {
  id: string;
  kind: ActionKind | string;
  message: string;
  createdAt: string;
  client?: { id: string; email: string } | null;
}

const map: Partial<
  Record<
    ActionKind,
    { icon: typeof CheckCircle2; tone: 'ok' | 'bad' | 'info' | 'warn' | 'neutral' }
  >
> = {
  DECISION_RESTORE: { icon: CheckCircle2, tone: 'ok' },
  DECISION_BLOCK: { icon: ShieldOff, tone: 'bad' },
  GPSWOX_ENABLE: { icon: Power, tone: 'ok' },
  GPSWOX_DISABLE: { icon: PowerOff, tone: 'bad' },
  GPSWOX_UPDATE_EXPIRATION: { icon: CalendarClock, tone: 'info' },
  ERROR: { icon: AlertTriangle, tone: 'bad' },
  MANUAL_SYNC: { icon: Wrench, tone: 'info' },
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <div className="text-sm text-ink-muted py-6 text-center">
        No activity yet.
      </div>
    );
  }
  return (
    <ol className="relative">
      {items.map((it, i) => (
        <FeedRow key={it.id} item={it} last={i === items.length - 1} />
      ))}
    </ol>
  );
}

function FeedRow({ item, last }: { item: ActivityItem; last: boolean }) {
  const meta = map[item.kind as ActionKind] ?? {
    icon: Activity,
    tone: 'neutral' as const,
  };
  const Icon = meta.icon;
  const toneCls =
    meta.tone === 'ok'
      ? 'bg-ok-surface text-ok ring-ok-ring/60'
      : meta.tone === 'bad'
      ? 'bg-bad-surface text-bad ring-bad-ring/60'
      : meta.tone === 'warn'
      ? 'bg-warn-surface text-warn ring-warn-ring/60'
      : meta.tone === 'info'
      ? 'bg-info-surface text-info ring-info-ring/60'
      : 'bg-bg-subtle text-ink-muted ring-border';

  return (
    <li className="relative flex gap-3 py-3 first:pt-0">
      <div className="relative flex flex-col items-center">
        <span
          className={cn(
            'size-7 rounded-full flex items-center justify-center ring-1 ring-inset z-10',
            toneCls,
          )}
        >
          <Icon className="size-3.5" />
        </span>
        {!last && (
          <span className="flex-1 w-px bg-border-subtle mt-1 mb-[-12px]" />
        )}
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="text-sm text-ink truncate">{item.message}</div>
        <div className="text-xs text-ink-faint mt-0.5 flex items-center gap-2">
          <span className="truncate">{item.client?.email ?? '—'}</span>
          <span>·</span>
          <RelativeTime iso={item.createdAt} />
        </div>
      </div>
    </li>
  );
}

function RelativeTime({ iso }: { iso: string }) {
  return <span title={new Date(iso).toLocaleString()}>{relative(iso)}</span>;
}

function relative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.round(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}
