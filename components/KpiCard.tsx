import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { LucideIcon } from 'lucide-react';

type Tone = 'neutral' | 'ok' | 'bad' | 'warn' | 'info';

const toneAccent: Record<Tone, { bg: string; fg: string }> = {
  neutral: { fg: 'text-ink-muted', bg: 'bg-bg-subtle' },
  ok: { fg: 'text-ok', bg: 'bg-ok-surface' },
  bad: { fg: 'text-bad', bg: 'bg-bad-surface' },
  warn: { fg: 'text-warn', bg: 'bg-warn-surface' },
  info: { fg: 'text-info', bg: 'bg-info-surface' },
};

export interface KpiCardProps {
  label: string;
  value: number | string;
  /** Optional secondary line under the value. */
  delta?: string;
  /**
   * Direction of the delta (controls arrow + color). Omit for a neutral
   * caption with no arrow.
   */
  trend?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  tone?: Tone;
  loading?: boolean;
}

export function KpiCard({
  label,
  value,
  delta,
  trend = 'neutral',
  icon: Icon,
  tone = 'neutral',
  loading,
}: KpiCardProps) {
  const t = toneAccent[tone];
  return (
    <div className="surface shadow-soft p-5 flex flex-col gap-3 min-h-[128px] hover:shadow-pop transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-medium text-ink-muted">{label}</div>
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

      {loading ? (
        <div className="skeleton h-8 w-28" />
      ) : (
        <div className="text-[28px] leading-none font-semibold tabular text-ink">
          {value}
        </div>
      )}

      {delta && (
        <div
          className={cn(
            'inline-flex items-center gap-1 text-xs font-medium tabular',
            trend === 'up' && 'text-ok',
            trend === 'down' && 'text-bad',
            trend === 'neutral' && 'text-ink-faint',
          )}
        >
          {trend === 'up' && <ArrowUpRight className="size-3.5" />}
          {trend === 'down' && <ArrowDownRight className="size-3.5" />}
          <span>{delta}</span>
        </div>
      )}
    </div>
  );
}
