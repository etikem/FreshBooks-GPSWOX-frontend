'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Search, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Table,
  THead,
  TR,
  TH,
  TD,
} from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import { ClientDetailDrawer } from '@/components/ClientDetailDrawer';
import { useClients } from '@/lib/hooks';
import { cn } from '@/lib/cn';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'BLOCKED', label: 'Blocked' },
  { value: 'UNKNOWN', label: 'Unknown' },
] as const;

export default function ClientsPage() {
  return (
    <Suspense fallback={<SkeletonTable rows={8} />}>
      <ClientsPageContent />
    </Suspense>
  );
}

function ClientsPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const initialQ = params?.get('q') ?? '';
  const initialId = params?.get('id') ?? null;

  const [q, setQ] = useState(initialQ);
  const [debouncedQ, setDebouncedQ] = useState(initialQ);
  const [status, setStatus] = useState<string>('');
  const [openId, setOpenId] = useState<string | null>(initialId);
  const [page, setPage] = useState(1);
  const pageSize = 50;

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQ(q), 200);
    return () => clearTimeout(handle);
  }, [q]);

  // Reset to first page whenever the filter changes — otherwise we'd
  // request a `skip` that's beyond the new result set.
  useEffect(() => {
    setPage(1);
  }, [debouncedQ, status]);

  const { data, isLoading, error, refetch } = useClients(
    debouncedQ,
    status,
    page,
    pageSize,
  );

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  const openClient = (id: string) => {
    setOpenId(id);
    const url = new URL(window.location.href);
    url.searchParams.set('id', id);
    router.replace(url.pathname + '?' + url.searchParams.toString());
  };
  const closeClient = () => {
    setOpenId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('id');
    const qs = url.searchParams.toString();
    router.replace(url.pathname + (qs ? '?' + qs : ''));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Clients</h1>
          <p className="text-sm text-ink-muted">
            {data ? `${data.total.toLocaleString()} total` : 'Loading…'}
          </p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-sm">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by email or FreshBooks id"
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-bg-subtle border border-white/10 hover:border-white/20 focus:border-info/60 focus:bg-bg-panel text-sm text-ink placeholder:text-ink-faint focus-ring transition-colors"
            />
          </div>
          <div className="inline-flex items-center gap-1 p-1 bg-bg-subtle border border-border rounded-lg">
            {STATUS_TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => setStatus(t.value)}
                className={cn(
                  'h-7 px-3 rounded-md text-xs font-medium transition-colors',
                  status === t.value
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
          <ErrorState
            message={(error as Error).message}
            onRetry={() => refetch()}
          />
        ) : isLoading ? (
          <SkeletonTable rows={8} />
        ) : data && data.items.length === 0 ? (
          <EmptyState
            icon={<Users className="size-5" />}
            title="No clients match"
            description="Try clearing the search or status filter, or run a manual sync from a webhook."
          />
        ) : (
          <Table className="border-0 shadow-none rounded-none">
            <THead>
              <TR>
                <TH>Client</TH>
                <TH>Status</TH>
                <TH align="right">Outstanding</TH>
                <TH>Paid through</TH>
                <TH>Access expires</TH>
                <TH>FreshBooks id</TH>
              </TR>
            </THead>
            <tbody>
              {data?.items.map((c) => {
                const outstanding = c.lastOutstanding
                  ? parseFloat(c.lastOutstanding)
                  : null;
                return (
                  <TR key={c.id} onClick={() => openClient(c.id)}>
                    <TD>
                      <div className="font-medium text-ink truncate max-w-[280px]">
                        {c.email}
                      </div>
                      {c.name && (
                        <div className="text-xs text-ink-faint truncate max-w-[280px]">
                          {c.name}
                        </div>
                      )}
                    </TD>
                    <TD>
                      <StatusBadge status={c.status} />
                    </TD>
                    <TD
                      align="right"
                      className={cn(
                        'tabular font-medium',
                        outstanding === null
                          ? 'text-ink-faint'
                          : outstanding > 0
                          ? 'text-bad'
                          : 'text-ok',
                      )}
                    >
                      {c.lastOutstanding ?? '—'}
                    </TD>
                    <TD className="text-ink-muted">
                      {c.paidThroughDate?.slice(0, 10) ?? '—'}
                    </TD>
                    <TD className="text-ink-muted">
                      {c.accessExpiresAt?.slice(0, 10) ?? '—'}
                    </TD>
                    <TD className="text-ink-faint font-mono text-xs">
                      {c.freshbooksClientId}
                    </TD>
                  </TR>
                );
              })}
            </tbody>
          </Table>
        )}

        {data && data.items.length > 0 && (
          <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between gap-3 text-sm">
            <div className="text-ink-muted tabular">
              {rangeStart.toLocaleString()}–{rangeEnd.toLocaleString()} of{' '}
              {total.toLocaleString()}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                iconLeft={<ChevronLeft className="size-4" />}
              >
                Prev
              </Button>
              <span className="text-ink-muted tabular px-1">
                Page {page} / {totalPages}
              </span>
              <Button
                size="sm"
                variant="secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                iconRight={<ChevronRight className="size-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <ClientDetailDrawer clientId={openId} onClose={closeClient} />
    </div>
  );
}

function SkeletonTable({ rows }: { rows: number }) {
  return (
    <div className="px-4 py-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3 border-b border-white/10 last:border-0">
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-3 w-20 ml-auto" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  );
}
