'use client';

import {
  CalendarClock,
  Mail,
  Hash,
  Cpu,
  Wallet,
  CalendarDays,
  Phone,
  MapPin,
  Building2,
  Globe,
  Receipt,
  StickyNote,
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
      toast.success(
        'Manual sync triggered',
        'We refetched FreshBooks and applied the decision.',
      );
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
              {c.lastSyncedAt
                ? `Last synced ${new Date(c.lastSyncedAt).toLocaleString()}`
                : 'Never synced'}
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
          <ProfilePanel c={c} />
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
          <Badge tone="neutral">ABC Track #{c.gpswoxUserId}</Badge>
        ) : (
          <Badge tone="warn">No ABC Track user mapped</Badge>
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

/**
 * FreshBooks profile pulled from /users/clients/<id> on the client.* webhook.
 * Renders nothing when none of the fields are populated — keeps the drawer
 * tidy for clients that pre-date the profile-fetch wiring.
 */
function ProfilePanel({
  c,
}: {
  c: NonNullable<ReturnType<typeof useClient>['data']>;
}) {
  const fullName = [c.firstName, c.lastName].filter(Boolean).join(' ').trim();
  const addressLines = [
    c.addressStreet,
    c.addressStreet2,
    [c.addressCity, c.addressProvince, c.addressCode].filter(Boolean).join(', '),
    c.addressCountry,
  ].filter((v) => v && v.length > 0) as string[];

  const rows: Array<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = [];
  if (fullName || c.organization) {
    rows.push({
      icon: <Building2 className="size-4" />,
      label: 'Name',
      value: (
        <div className="space-y-0.5">
          {fullName && <div>{fullName}</div>}
          {c.organization && (
            <div className="text-ink-muted text-xs">{c.organization}</div>
          )}
        </div>
      ),
    });
  }
  const phones = [
    c.businessPhone && { tag: 'Business', value: c.businessPhone },
    c.mobilePhone && { tag: 'Mobile', value: c.mobilePhone },
    c.homePhone && { tag: 'Home', value: c.homePhone },
  ].filter(Boolean) as Array<{ tag: string; value: string }>;
  if (phones.length > 0) {
    rows.push({
      icon: <Phone className="size-4" />,
      label: 'Phone',
      value: (
        <div className="space-y-0.5">
          {phones.map((p) => (
            <div key={p.tag} className="font-mono text-xs">
              <span className="text-ink-faint mr-2">{p.tag}</span>
              {p.value}
            </div>
          ))}
        </div>
      ),
    });
  }
  if (addressLines.length > 0) {
    rows.push({
      icon: <MapPin className="size-4" />,
      label: 'Address',
      value: (
        <div className="space-y-0.5 text-xs">
          {addressLines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      ),
    });
  }
  if (c.currencyCode || c.language) {
    rows.push({
      icon: <Globe className="size-4" />,
      label: 'Locale',
      value: (
        <div className="space-x-2 text-xs">
          {c.currencyCode && <span>{c.currencyCode}</span>}
          {c.language && <span className="text-ink-muted">{c.language}</span>}
        </div>
      ),
    });
  }
  if (c.vatNumber || c.vatName) {
    rows.push({
      icon: <Receipt className="size-4" />,
      label: 'VAT',
      value: (
        <div className="space-y-0.5 text-xs">
          {c.vatNumber && <div className="font-mono">{c.vatNumber}</div>}
          {c.vatName && <div className="text-ink-muted">{c.vatName}</div>}
        </div>
      ),
    });
  }
  if (c.notes) {
    rows.push({
      icon: <StickyNote className="size-4" />,
      label: 'Notes',
      value: (
        <div className="text-xs whitespace-pre-wrap text-ink-muted">{c.notes}</div>
      ),
    });
  }

  if (rows.length === 0) return null;

  return (
    <div className="surface p-4 space-y-3">
      <div className="text-sm font-medium text-ink">Profile</div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        {rows.map((r, i) => (
          <div key={i} className="contents">
            <dt className="flex items-center gap-1.5 text-ink-faint text-xs">
              {r.icon}
              {r.label}
            </dt>
            <dd className="text-ink min-w-0">{r.value}</dd>
          </div>
        ))}
      </dl>
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

const INVOICE_STATUS_LABELS: Record<string, string> = {
  '1': 'Draft',
  '2': 'Sent',
  '3': 'Viewed',
  '4': 'Paid',
};

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
          <TH>Issued</TH>
          <TH>Due</TH>
        </TR>
      </THead>
      <tbody>
        {invoices.map((i) => {
          const balanceNum = parseFloat(i.balance);
          const voided = i.active === false;
          return (
            <TR
              key={i.id}
              className={cn(voided && 'opacity-50 line-through decoration-ink-faint/60')}
            >
              <TD className="font-mono text-xs">{i.invoiceNumber ?? i.id}</TD>
              <TD align="right" className="tabular">{i.amount}</TD>
              <TD align="right" className="tabular text-ink-muted">{i.paid}</TD>
              <TD
                align="right"
                className={cn(
                  'tabular font-medium',
                  voided
                    ? 'text-ink-faint'
                    : balanceNum > 0
                    ? 'text-bad'
                    : 'text-ok',
                )}
              >
                {i.balance}
              </TD>
              <TD>
                {voided ? (
                  <Badge tone="neutral">Voided</Badge>
                ) : (
                  <Badge tone={balanceNum > 0 ? 'bad' : 'ok'}>
                    {INVOICE_STATUS_LABELS[i.status] ?? i.status}
                  </Badge>
                )}
              </TD>
              <TD className="text-ink-muted text-xs whitespace-nowrap">
                {i.issuedDate?.slice(0, 10) ?? '—'}
              </TD>
              <TD className="text-ink-muted text-xs whitespace-nowrap">
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
