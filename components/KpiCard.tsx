import { cn } from '@/lib/cn';
import type { LucideIcon } from 'lucide-react';

type Tone = 'neutral' | 'ok' | 'bad' | 'warn' | 'info';

const tones: Record<Tone, { fg: string; bg: string }> = {
  neutral: { fg: 'text-ink-muted', bg: 'bg-bg-subtle' },
  ok: { fg: 'text-ok', bg: 'bg-ok-surface' },
  bad: { fg: 'text-bad', bg: 'bg-bad-surface' },
  warn: { fg: 'text-warn', bg: 'bg-warn-surface' },
  info: { fg: 'text-info', bg: 'bg-info-surface' },
};

export function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = 'neutral',
  loading,
}: {
  label: string;
  value: number | string;
  delta?: string;
  icon?: LucideIcon;
  tone?: Tone;
  loading?: boolean;
}) {
  const t = tones[tone];
  return (
    <div className="surface shadow-soft p-4 flex items-start justify-between gap-3 hover:shadow-pop transition-shadow">
      <div className="min-w-0">
        <div className="text-xs font-medium text-ink-muted">{label}</div>
        {loading ? (
          <div className="skeleton h-7 w-20 mt-2 rounded" />
        ) : (
          <div className={cn('text-[26px] leading-tight font-semibold tabular mt-1', t.fg)}>
            {value}
          </div>
        )}
        {delta && (
          <div className="text-xs text-ink-faint mt-1.5">{delta}</div>
        )}
      </div>
      {Icon && (
        <div
          className={cn(
            'size-9 rounded-lg flex items-center justify-center shrink-0',
            t.bg,
            t.fg,
          )}
        >
          <Icon className="size-4" />
        </div>
      )}
    </div>
  );
}
