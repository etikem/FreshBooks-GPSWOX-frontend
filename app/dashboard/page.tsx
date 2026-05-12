'use client';

import Link from 'next/link';
import {
  Users,
  ShieldCheck,
  ShieldOff,
  RefreshCcw,
  AlertTriangle,
  Ban,
  Webhook,
  Bug,
} from 'lucide-react';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { KpiCard } from '@/components/KpiCard';
import { StatusBar } from '@/components/StatusBar';
import { ActivityFeed } from '@/components/ActivityFeed';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Table,
  THead,
  TR,
  TH,
  TD,
} from '@/components/ui/Table';
import { useStats, useActionLogs, useNotifications } from '@/lib/hooks';
import type { NotificationsResponse } from '@/lib/types';

export default function DashboardPage() {
  const stats = useStats();
  const logs = useActionLogs();
  const notifications = useNotifications();

  if (stats.error) {
    return <ErrorState message={(stats.error as Error).message} onRetry={() => stats.refetch()} />;
  }

  const totals = stats.data?.totals;
  const retries = stats.data?.retries;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total clients"
          value={totals?.totalClients ?? 0}
          icon={Users}
          tone="info"
          loading={stats.isLoading}
        />
        <KpiCard
          label="Active"
          value={totals?.active ?? 0}
          icon={ShieldCheck}
          tone="ok"
          loading={stats.isLoading}
          delta={
            totals
              ? `${pct(totals.active, totals.totalClients)}% of total`
              : undefined
          }
        />
        <KpiCard
          label="Disabled"
          value={totals?.blocked ?? 0}
          icon={ShieldOff}
          tone="bad"
          loading={stats.isLoading}
          delta={
            totals
              ? `${pct(totals.blocked, totals.totalClients)}% of total`
              : undefined
          }
        />
        <KpiCard
          label="Retry queue"
          value={(retries?.pending ?? 0) + (retries?.failed ?? 0)}
          icon={retries?.failed ? AlertTriangle : RefreshCcw}
          tone={retries?.failed ? 'bad' : 'warn'}
          loading={stats.isLoading}
          delta={
            retries
              ? `${retries.pending} pending · ${retries.failed} failed`
              : undefined
          }
        />
      </div>

      {/* Action items — only render the card when there's something to act on. */}
      {notifications.data && hasNotifications(notifications.data) && (
        <Card>
          <CardHeader>
            <CardTitle>Action items</CardTitle>
            <span className="text-xs text-ink-faint">
              Things that need an operator
            </span>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <NotificationTile
                tone="neutral"
                icon={<Ban className="size-4" />}
                label="Cancelled"
                count={notifications.data.cancelled.count}
                href="/clients?status=CANCELLED"
              />
              <NotificationTile
                tone="bad"
                icon={<Webhook className="size-4" />}
                label="Webhook failures"
                count={notifications.data.webhookFailures.count}
                href="/logs"
              />
              <NotificationTile
                tone="bad"
                icon={<RefreshCcw className="size-4" />}
                label="Failed retries"
                count={notifications.data.failedRetries.count}
                href="/retries?status=FAILED"
              />
              <NotificationTile
                tone="bad"
                icon={<Bug className="size-4" />}
                label="Sync errors"
                count={notifications.data.recentSyncErrors.count}
                href="/logs"
              />
            </div>
          </CardBody>
        </Card>
      )}

      {/* Chart + recent syncs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Access status</CardTitle>
          </CardHeader>
          <CardBody>
            {stats.isLoading || !totals ? (
              <div className="space-y-3">
                <Skeleton className="h-3" />
                <Skeleton className="h-2" />
                <Skeleton className="h-12" />
              </div>
            ) : (
              <StatusBar
                active={totals.active}
                blocked={totals.blocked}
                unknown={Math.max(
                  totals.totalClients - totals.active - totals.blocked,
                  0,
                )}
              />
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent syncs</CardTitle>
            <span className="text-xs text-ink-faint">Auto-refreshing</span>
          </CardHeader>
          <div className="px-1">
            <Table className="border-0 shadow-none">
              <THead>
                <TR>
                  <TH>When</TH>
                  <TH>Client</TH>
                  <TH>Trigger</TH>
                  <TH>Outcome</TH>
                  <TH align="right">Outstanding</TH>
                </TR>
              </THead>
              <tbody>
                {stats.isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TR key={i}>
                      <TD><Skeleton className="h-3 w-24" /></TD>
                      <TD><Skeleton className="h-3 w-32" /></TD>
                      <TD><Skeleton className="h-3 w-16" /></TD>
                      <TD><Skeleton className="h-3 w-20" /></TD>
                      <TD align="right"><Skeleton className="h-3 w-12 ml-auto" /></TD>
                    </TR>
                  ))
                ) : stats.data?.recentSyncs.length === 0 ? (
                  <TR>
                    <TD className="text-ink-muted py-8 text-center" align="center">
                      <span className="block">No syncs yet.</span>
                    </TD>
                    <TD></TD><TD></TD><TD></TD><TD></TD>
                  </TR>
                ) : (
                  stats.data?.recentSyncs.slice(0, 8).map((s) => (
                    <TR key={s.id}>
                      <TD className="text-ink-muted text-xs whitespace-nowrap">
                        {new Date(s.startedAt).toLocaleString()}
                      </TD>
                      <TD className="font-medium truncate max-w-[200px]">
                        {s.client?.email ?? '—'}
                      </TD>
                      <TD className="text-ink-muted">{s.trigger}</TD>
                      <TD>{s.outcome ? <StatusBadge status={s.outcome} /> : '—'}</TD>
                      <TD align="right" className="font-mono text-xs">
                        {s.outstanding ?? '—'}
                      </TD>
                    </TR>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Activity feed */}
      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
          <span className="text-xs text-ink-faint">
            Latest actions across all clients
          </span>
        </CardHeader>
        <CardBody>
          {logs.isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="size-7 rounded-full" />
                  <div className="flex-1 space-y-2 pt-1">
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-2.5 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ActivityFeed items={logs.data?.items.slice(0, 12) ?? []} />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function pct(n: number, total: number): number {
  if (!total) return 0;
  return Math.round((n / total) * 100);
}

function hasNotifications(n: NotificationsResponse): boolean {
  return (
    n.cancelled.count > 0 ||
    n.webhookFailures.count > 0 ||
    n.failedRetries.count > 0 ||
    n.recentSyncErrors.count > 0
  );
}

function NotificationTile({
  tone,
  icon,
  label,
  count,
  href,
}: {
  tone: 'warn' | 'bad' | 'neutral';
  icon: React.ReactNode;
  label: string;
  count: number;
  href: string;
}) {
  const toneClass =
    tone === 'bad'
      ? 'text-bad border-bad/30 bg-bad/5 hover:border-bad/50'
      : tone === 'warn'
      ? 'text-warn border-warn/30 bg-warn/5 hover:border-warn/50'
      : 'text-ink border-border bg-bg-subtle hover:border-info/40';
  return (
    <Link
      href={href}
      className={`surface p-3 flex items-center gap-3 transition-colors border ${toneClass}`}
    >
      <span className="opacity-80">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-ink-faint">{label}</div>
        <div className="text-lg font-semibold tabular">{count}</div>
      </div>
    </Link>
  );
}
