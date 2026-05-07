import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'ok' | 'bad' | 'warn' | 'info';

const tones: Record<Tone, string> = {
  neutral: 'bg-bg-subtle text-ink-muted ring-border',
  ok: 'bg-ok-surface text-ok ring-ok-ring/60',
  bad: 'bg-bad-surface text-bad ring-bad-ring/60',
  warn: 'bg-warn-surface text-warn ring-warn-ring/60',
  info: 'bg-info-surface text-info ring-info-ring/60',
};

export function Badge({
  tone = 'neutral',
  dot = false,
  children,
  className,
}: {
  tone?: Tone;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset',
        tones[tone],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            'size-1.5 rounded-full',
            tone === 'ok' && 'bg-ok',
            tone === 'bad' && 'bg-bad',
            tone === 'warn' && 'bg-warn',
            tone === 'info' && 'bg-info',
            tone === 'neutral' && 'bg-ink-faint',
          )}
        />
      )}
      {children}
    </span>
  );
}
