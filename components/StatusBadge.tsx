import { Badge } from './ui/Badge';

const map: Record<string, { tone: 'ok' | 'bad' | 'warn' | 'info' | 'neutral'; label?: string; dot?: boolean }> = {
  // Client status
  ACTIVE: { tone: 'ok', dot: true },
  BLOCKED: { tone: 'bad', dot: true },
  CANCELLED: { tone: 'neutral' },
  UNKNOWN: { tone: 'warn', dot: true },

  // Sync outcome
  RESTORED: { tone: 'ok', dot: true, label: 'Restored' },
  NO_CHANGE: { tone: 'neutral', label: 'No change' },
  ERROR: { tone: 'bad', dot: true, label: 'Error' },

  // Retry status
  PENDING: { tone: 'warn', dot: true, label: 'Pending' },
  RUNNING: { tone: 'info', dot: true, label: 'Running' },
  SUCCEEDED: { tone: 'ok', dot: true, label: 'Succeeded' },
  FAILED: { tone: 'bad', dot: true, label: 'Failed' },

  // Action kinds (for log lists)
  DECISION_BLOCK: { tone: 'bad', label: 'Block' },
  DECISION_RESTORE: { tone: 'ok', label: 'Restore' },
  GPSWOX_ENABLE: { tone: 'ok', label: 'ABC Track enable' },
  GPSWOX_DISABLE: { tone: 'bad', label: 'ABC Track disable' },
  GPSWOX_UPDATE_EXPIRATION: { tone: 'info', label: 'Update expiry' },
  MANUAL_SYNC: { tone: 'info', label: 'Manual sync' },
};

export function StatusBadge({ status }: { status: string }) {
  const meta = map[status] ?? { tone: 'neutral' as const };
  return (
    <Badge tone={meta.tone} dot={meta.dot}>
      {meta.label ?? prettify(status)}
    </Badge>
  );
}

function prettify(s: string): string {
  return s
    .toLowerCase()
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
