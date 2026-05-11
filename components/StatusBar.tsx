import { cn } from '@/lib/cn';

/**
 * Stacked horizontal bar that summarises Active vs Disabled clients.
 * Internal prop name stays `blocked` to match the backend totals API;
 * the display label is "Disabled" so the UI matches ABC Track's
 * terminology. SVG-free, just styled divs — keeps bundle small and
 * renders crisply.
 */
export function StatusBar({
  active,
  blocked,
  unknown = 0,
}: {
  active: number;
  blocked: number;
  unknown?: number;
}) {
  const total = Math.max(active + blocked + unknown, 1);
  const pct = (n: number) => (n / total) * 100;

  return (
    <div>
      <div className="flex items-center gap-3 text-xs text-ink-muted mb-2">
        <Legend dot="bg-ok" label={`Active · ${active}`} />
        <Legend dot="bg-bad" label={`Disabled · ${blocked}`} />
        {unknown > 0 && <Legend dot="bg-warn" label={`Unknown · ${unknown}`} />}
        <span className="ml-auto tabular text-ink-faint">{total} total</span>
      </div>
      <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-bg-subtle">
        <Segment width={pct(active)} className="bg-ok" />
        <Segment width={pct(blocked)} className="bg-bad" />
        <Segment width={pct(unknown)} className="bg-warn" />
      </div>
      <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
        <Stat label="Active" value={active} pct={pct(active)} tone="ok" />
        <Stat label="Disabled" value={blocked} pct={pct(blocked)} tone="bad" />
        <Stat label="Unknown" value={unknown} pct={pct(unknown)} tone="warn" />
      </div>
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('size-1.5 rounded-full', dot)} />
      {label}
    </span>
  );
}

function Segment({ width, className }: { width: number; className: string }) {
  if (width <= 0) return null;
  return (
    <div
      style={{ width: `${width}%` }}
      className={cn('h-full transition-all', className)}
    />
  );
}

function Stat({
  label,
  value,
  pct,
  tone,
}: {
  label: string;
  value: number;
  pct: number;
  tone: 'ok' | 'bad' | 'warn';
}) {
  const fg =
    tone === 'ok' ? 'text-ok' : tone === 'bad' ? 'text-bad' : 'text-warn';
  return (
    <div>
      <div className="text-xs text-ink-muted">{label}</div>
      <div className="flex items-baseline gap-2">
        <span className={cn('text-xl font-semibold tabular', fg)}>{value}</span>
        <span className="text-xs text-ink-faint tabular">{pct.toFixed(0)}%</span>
      </div>
    </div>
  );
}
