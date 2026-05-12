'use client';

import { useState } from 'react';
import { RotateCcw, X, RefreshCcw, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import { KpiCard } from '@/components/KpiCard';
import { useToast } from '@/components/ui/Toast';
import {
  Table,
  THead,
  TR,
  TH,
  TD,
} from '@/components/ui/Table';
import {
  useRetries,
  useReplayRetry,
  useCancelRetry,
} from '@/lib/hooks';
import { cn } from '@/lib/cn';
import type { RetryJobItem } from '@/lib/types';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'RUNNING', label: 'Running' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'SUCCEEDED', label: 'Succeeded' },
  { value: 'CANCELLED', label: 'Cancelled' },
] as const;

export default function RetriesPage() {
  const [filter, setFilter] = useState<string>('');
  const [confirm, setConfirm] = useState<{ id: string; op: string } | null>(null);
  const toast = useToast();

  const { data, isLoading, error, refetch } = useRetries(filter);
  const replay = useReplayRetry();
  const cancel = useCancelRetry();

  // Header KPIs always reflect the unfiltered counts.
  const all = useRetries('');
  const counts = countByStatus(all.data?.items ?? []);

  async function onReplay(id: string) {
    try {
      await replay.mutateAsync(id);
      toast.success('Retry queued', 'The job will run on the next poll.');
    } catch (e) {
      toast.error('Could not queue retry', (e as Error).message);
    }
  }
  async function onCancel(id: string) {
    try {
      await cancel.mutateAsync(id);
      toast.info('Retry cancelled');
    } catch (e) {
      toast.error('Could not cancel', (e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Retries</h1>
        <p className="text-sm text-ink-muted">
          Outbound ABC Track calls that failed. Exhausted jobs need an operator.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Pending"
          value={counts.PENDING}
          tone="warn"
          icon={RefreshCcw}
        />
        <KpiCard label="Running" value={counts.RUNNING} tone="info" />
        <KpiCard
          label="Failed"
          value={counts.FAILED}
          tone="bad"
          icon={AlertTriangle}
        />
        <KpiCard label="Succeeded" value={counts.SUCCEEDED} tone="ok" />
      </div>

      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-3">
          <div className="inline-flex items-center gap-1 p-1 bg-bg-subtle border border-border rounded-lg">
            {STATUS_TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => setFilter(t.value)}
                className={cn(
                  'h-7 px-3 rounded-md text-xs font-medium transition-colors',
                  filter === t.value
                    ? 'bg-bg-panel text-ink shadow-soft border border-border'
                    : 'text-ink-muted hover:text-ink',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9" />
            ))}
          </div>
        ) : data && data.items.length === 0 ? (
          <EmptyState
            icon={<RefreshCcw className="size-5" />}
            title="No retries"
            description="The retry queue is empty for this filter — that's a good sign."
          />
        ) : (
          <Table className="border-0 shadow-none rounded-none">
            <THead>
              <TR>
                <TH>Client</TH>
                <TH>Operation</TH>
                <TH>Status</TH>
                <TH>Attempts</TH>
                <TH>Next attempt</TH>
                <TH>Last error</TH>
                <TH align="right">Actions</TH>
              </TR>
            </THead>
            <tbody>
              {data?.items.map((r) => (
                <TR key={r.id}>
                  <TD className="font-medium truncate max-w-[200px]">
                    {r.client?.email ?? '—'}
                  </TD>
                  <TD className="font-mono text-[11px] text-ink-faint">
                    {r.operation}
                  </TD>
                  <TD>
                    <StatusBadge status={r.status} />
                  </TD>
                  <TD className="tabular text-ink-muted">
                    {r.attempts}
                    <span className="text-ink-faint">/{r.maxAttempts}</span>
                  </TD>
                  <TD className="text-xs text-ink-muted whitespace-nowrap">
                    {new Date(r.nextAttemptAt).toLocaleString()}
                  </TD>
                  <TD className="text-xs text-bad max-w-[260px] truncate">
                    {r.lastError ?? '—'}
                  </TD>
                  <TD align="right">
                    <RowActions
                      r={r}
                      onReplay={() => onReplay(r.id)}
                      onCancelClick={() => setConfirm({ id: r.id, op: r.operation })}
                      busy={replay.isPending || cancel.isPending}
                    />
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title="Cancel retry?"
        description={
          confirm
            ? `Cancel pending retry for "${confirm.op}"? You can re-queue it later.`
            : undefined
        }
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(null)}>
              Keep
            </Button>
            <Button
              variant="danger"
              loading={cancel.isPending}
              onClick={async () => {
                if (!confirm) return;
                await onCancel(confirm.id);
                setConfirm(null);
              }}
            >
              Cancel retry
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-muted">
          Cancelling does not revert any side-effects already pushed to ABC Track.
        </p>
      </Modal>
    </div>
  );
}

function RowActions({
  r,
  onReplay,
  onCancelClick,
  busy,
}: {
  r: RetryJobItem;
  onReplay: () => void;
  onCancelClick: () => void;
  busy: boolean;
}) {
  const canReplay =
    r.status === 'FAILED' || r.status === 'CANCELLED' || r.status === 'PENDING';
  const canCancel = r.status === 'PENDING';

  return (
    <div className="inline-flex gap-2 justify-end">
      {canReplay && (
        <Button
          size="sm"
          variant="secondary"
          iconLeft={<RotateCcw className="size-3.5" />}
          onClick={onReplay}
          disabled={busy}
        >
          Replay
        </Button>
      )}
      {canCancel && (
        <Button
          size="sm"
          variant="ghost"
          iconLeft={<X className="size-3.5" />}
          onClick={onCancelClick}
          disabled={busy}
        >
          Cancel
        </Button>
      )}
    </div>
  );
}

function countByStatus(items: RetryJobItem[]) {
  const init = {
    PENDING: 0,
    RUNNING: 0,
    SUCCEEDED: 0,
    FAILED: 0,
    CANCELLED: 0,
  } as Record<string, number>;
  for (const it of items) init[it.status] = (init[it.status] ?? 0) + 1;
  return init;
}
