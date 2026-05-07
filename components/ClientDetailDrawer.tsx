'use client';

import {
  CalendarClock,
  Mail,
  Hash,
  Cpu,
  Wallet,
  CalendarDays,
} from 'lucide-react';
import { Drawer } from './ui/Drawer';
import { Button } from './ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/Tabs';
import {
  Table,
  THead,
  TR,
  TH,
  TD,
} from './ui/Table';
import { StatusBadge } from './StatusBadge';
import { Badge } from './ui/Badge';
import { Skeleton, SkeletonText } from './ui/Skeleton';
import { EmptyState, ErrorState } from './ui/EmptyState';
import { ActivityFeed } from './ActivityFeed';
import { useClient, useManualSync } from '@/lib/hooks';
import { useToast } from './ui/Toast';
import { cn } from '@/lib/cn';

export function ClientDetailDrawer({
  clientId,
  onClose,
}: {
  clientId: string | null;
  onClose: () => void;
}) {
  const open = !!clientId;
  const detail = useClient(clientId);
  const sync = useManualSync();
  const toast = useToast();

  const c = detail.data;

  const onSync = async () => {
    if (!clientId) return;
    try {
      await sync.mutateAsync(clientId);
      toast.success('Manual sync triggered', 'We refetched FreshBooks and applied the decision.');
    } catch (e) {
      toast.error('Manual sync failed', (e as Error).message);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={620}
      title={c?.email ?? (detail.isLoading ? 'Loading…' : 'Client')}
      description={c?.name ?? c?.freshbooksClientId}
      footer={
        c ? (
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-faint">
              Last synced{' '}
              {c?.invoices?.length
                ? new Date(c.invoices[0]?.id ? Date.now() : Date.now()).toLocaleString()
                : '—'}
            </span>
            <Button
              variant="primary"
              size="sm"
              loading={sync.isPending}
              onClick={onSync}
            >
              Manual sync
            </Button>
          </div>
        ) : null
      }
    >
      {detail.isLoading ? (
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
          <SkeletonText lines={4} />
        </div>
      ) : detail.error ? (
        <ErrorState
          message={(detail.error as Error).message}
          onRetry={() => detail.refetch()}
        />
      ) : !c ? null : (
        <div className="p-5 space-y-5">
          <Overview c={c} />
          <Tabs defaultValue="invoices">
            <TabsList>
              <TabsTrigger value="invoices" count={c.invoices.length}>
                Invoices
              </TabsTrigger>
              <TabsTrigger value="logs" count={c.actionLogs.length}>
                Logs
              </TabsTrigger>
              <TabsTrigger value="actions" count={c.syncRuns.length}>
                Sync runs
              </TabsTrigger>
            </TabsList>

            <div className="mt-3">
              <TabsContent value="invoices">
                <InvoicesTable invoices={c.invoices} />
              </TabsContent>
              <TabsContent value="logs">
                {c.actionLogs.length === 0 ? (
                  <EmptyState title="No actions yet" />
                ) : (
                  <div className="surface p-4">
                    <ActivityFeed
                      items={c.actionLogs.map((a) => ({
                        id: a.id,
                        kind: a.kind,
                        message: a.message,
                        createdAt: a.createdAt,
                        client: { id: c.id, email: c.email },
                      }))}
                    />
                  </div>
                )}
              </TabsContent>
              <TabsContent value="actions">
                <SyncRunsTable runs={c.syncRuns} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      )}
    </Drawer>
  );
}

function Overview({ c }: { c: NonNullable<ReturnType<typeof useClient>['data']> }) {
  const outstanding = c.lastOutstanding ?? '—';
  const outstandingTone =
    c.lastOutstanding && parseFloat(c.lastOutstanding) > 0 ? 'bad' : 'ok';

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <StatusBadge status={c.status} />
        {c.gpswoxUserId ? (
          <Badge tone="neutral">GPSWOX #{c.gpswoxUserId}</Badge>
        ) : (
          <Badge tone="warn">No GPSWOX user mapped</Badge>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Stat
          icon={<Wallet className="size-4" />}
          label="Outstanding"
          value={outstanding}
          tone={outstandingTone}
        />
        <Stat
          icon={<CalendarClock className="size-4" />}
          label="Paid through"
          value={c.paidThroughDate?.slice(0, 10) ?? '—'}
        />
        <Stat
          icon={<CalendarDays className="size-4" />}
          label="Access expires"
          value={c.accessExpiresAt?.slice(0, 10) ?? '—'}
        />
        <Stat
          icon={<Hash className="size-4" />}
          label="FreshBooks id"
          value={c.freshbooksClientId}
          mono
        />
        <Stat
          icon={<Mail className="size-4" />}
          label="Email"
          value={c.email}
        />
        <Stat
          icon={<Cpu className="size-4" />}
          label="Contract"
          value={`${c.contractStartDate.slice(0, 10)} → ${c.contractEndDate.slice(0, 10)}`}
        />
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  tone,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: 'ok' | 'bad';
  mono?: boolean;
}) {
  const valueCls = cn(
    'text-sm font-medium mt-1',
    tone === 'bad' && 'text-bad',
    tone === 'ok' && 'text-ok',
    mono && 'font-mono text-xs',
  );
  return (
    <div className="surface p-3">
      <div className="flex items-center gap-1.5 text-xs text-ink-faint">
        <span className="text-ink-faint">{icon}</span>
        {label}
      </div>
      <div className={valueCls}>{value}</div>
    </div>
  );
}

function InvoicesTable({
  invoices,
}: {
  invoices: NonNullable<ReturnType<typeof useClient>['data']>['invoices'];
}) {
  if (invoices.length === 0) {
    return <EmptyState title="No invoices yet" />;
  }
  return (
    <Table>
      <THead>
        <TR>
          <TH>Number</TH>
          <TH align="right">Amount</TH>
          <TH align="right">Paid</TH>
          <TH align="right">Balance</TH>
          <TH>Status</TH>
          <TH>Due</TH>
        </TR>
      </THead>
      <tbody>
        {invoices.map((i) => {
          const balanceNum = parseFloat(i.balance);
          return (
            <TR key={i.id}>
              <TD className="font-mono text-xs">{i.invoiceNumber ?? i.id}</TD>
              <TD align="right" className="tabular">{i.amount}</TD>
              <TD align="right" className="tabular text-ink-muted">{i.paid}</TD>
              <TD
                align="right"
                className={cn(
                  'tabular font-medium',
                  balanceNum > 0 ? 'text-bad' : 'text-ok',
                )}
              >
                {i.balance}
              </TD>
              <TD>
                <Badge tone={balanceNum > 0 ? 'bad' : 'ok'}>{i.status}</Badge>
              </TD>
              <TD className="text-ink-muted text-xs">
                {i.dueDate?.slice(0, 10) ?? '—'}
              </TD>
            </TR>
          );
        })}
      </tbody>
    </Table>
  );
}

function SyncRunsTable({
  runs,
}: {
  runs: NonNullable<ReturnType<typeof useClient>['data']>['syncRuns'];
}) {
  if (runs.length === 0) return <EmptyState title="No sync runs yet" />;
  return (
    <Table>
      <THead>
        <TR>
          <TH>When</TH>
          <TH>Trigger</TH>
          <TH>Outcome</TH>
          <TH align="right">Outstanding</TH>
          <TH>Notes</TH>
        </TR>
      </THead>
      <tbody>
        {runs.map((r) => (
          <TR key={r.id}>
            <TD className="text-xs text-ink-muted whitespace-nowrap">
              {new Date(r.startedAt).toLocaleString()}
            </TD>
            <TD>{r.trigger}</TD>
            <TD>{r.outcome ? <StatusBadge status={r.outcome} /> : '—'}</TD>
            <TD align="right" className="tabular">{r.outstanding ?? '—'}</TD>
            <TD className="text-xs text-ink-muted max-w-[280px] truncate">
              {r.notes ?? '—'}
            </TD>
          </TR>
        ))}
      </tbody>
    </Table>
  );
}
