'use client';

import { useState } from 'react';
import {
  RefreshCcw,
  UserPlus,
  Car,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, THead, TR, TH, TD } from '@/components/ui/Table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { EmptyState, ErrorState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Pagination, usePagination } from '@/components/ui/Pagination';
import { useReconciliation, useRefreshReconciliation } from '@/lib/hooks';
import type { MissingClient, VehicleMismatch } from '@/lib/types';

export default function ReconciliationPage() {
  const { data, isLoading, error, refetch } = useReconciliation();
  const refresh = useRefreshReconciliation();
  const [tab, setTab] = useState('missing');

  const running = data?.status === 'running' || refresh.isPending;
  const stats = data?.stats;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Reconciliation</h1>
          <p className="text-sm text-ink-muted">
            Discrepancies between ABC Track and FreshBooks.
            {data?.generatedAt && (
              <>
                {' '}
                Last run {new Date(data.generatedAt).toLocaleString()}
                {typeof data.durationMs === 'number' &&
                  ` · ${(data.durationMs / 1000).toFixed(0)}s`}
                {stats && ` · scanned ${stats.active.toLocaleString()} active`}
              </>
            )}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          loading={running}
          disabled={running}
          iconLeft={<RefreshCcw className="size-4" />}
          onClick={() => refresh.mutate()}
        >
          {running ? 'Running…' : 'Run sweep'}
        </Button>
      </div>

      {error ? (
        <Card>
          <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
        </Card>
      ) : data?.status === 'error' ? (
        <Card>
          <ErrorState
            message={data.error ?? 'The sweep failed.'}
            onRetry={() => refresh.mutate()}
          />
        </Card>
      ) : isLoading || (data?.status === 'running' && !stats) ? (
        <Card className="p-0">
          <RunningBanner />
          <SkeletonTable rows={6} />
        </Card>
      ) : (
        <Tabs defaultValue="missing" value={tab} onValueChange={setTab}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <TabsList>
              <TabsTrigger value="missing" count={stats?.missing}>
                Missing in FreshBooks
              </TabsTrigger>
              <TabsTrigger value="vehicles" count={stats?.mismatch}>
                Vehicle mismatch
              </TabsTrigger>
            </TabsList>
            {data?.status === 'running' && (
              <span className="inline-flex items-center gap-2 text-xs text-ink-muted">
                <Loader2 className="size-3.5 animate-spin" />
                Refreshing…
              </span>
            )}
          </div>

          <TabsContent value="missing" className="mt-3">
            <MissingTable rows={data?.missingInFreshbooks ?? []} />
          </TabsContent>

          <TabsContent value="vehicles" className="mt-3">
            <VehicleTable rows={data?.vehicleMismatch ?? []} />
          </TabsContent>
        </Tabs>
      )}

      {stats && stats.errors > 0 && (
        <Card className="p-3 flex items-start gap-2 text-sm">
          <AlertTriangle className="size-4 text-warn shrink-0 mt-0.5" />
          <div className="text-ink-muted">
            {stats.errors.toLocaleString()} client
            {stats.errors === 1 ? '' : 's'} could not be checked this run (lookup
            errors). They are excluded from the tables above.
          </div>
        </Card>
      )}
    </div>
  );
}

function MissingTable({ rows }: { rows: MissingClient[] }) {
  const { page, setPage, pageSize, total, pageRows } = usePagination(rows, 25);

  if (rows.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<CheckCircle2 className="size-5 text-ok" />}
          title="Everyone is in FreshBooks"
          description="Every active ABC Track client has a matching FreshBooks account by email."
        />
      </Card>
    );
  }
  return (
    <Card className="overflow-hidden p-0">
      <div className="px-4 py-3 border-b border-border text-sm text-ink-muted">
        Active in ABC Track with no FreshBooks account — create these in
        FreshBooks.
      </div>
      <Table className="border-0 shadow-none rounded-none">
        <THead>
          <TR>
            <TH>First name</TH>
            <TH>Last name</TH>
            <TH>Email</TH>
            <TH>Phone</TH>
            <TH>ABC Track id</TH>
          </TR>
        </THead>
        <tbody>
          {pageRows.map((r) => (
            <TR key={r.abctrackId}>
              <TD className="text-ink">{r.firstName || '—'}</TD>
              <TD className="text-ink">{r.lastName || '—'}</TD>
              <TD>
                <span className="font-medium text-ink">{r.email}</span>
              </TD>
              <TD className="text-ink-muted">{r.phoneNumber || '—'}</TD>
              <TD className="text-ink-faint font-mono text-xs">{r.abctrackId}</TD>
            </TR>
          ))}
        </tbody>
      </Table>
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
      />
    </Card>
  );
}

function VehicleTable({ rows }: { rows: VehicleMismatch[] }) {
  const { page, setPage, pageSize, total, pageRows } = usePagination(rows, 25);

  if (rows.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<CheckCircle2 className="size-5 text-ok" />}
          title="Vehicle counts match"
          description="Every shared client's ABC Track device count matches the quantity billed on their latest FreshBooks invoice."
        />
      </Card>
    );
  }
  return (
    <Card className="overflow-hidden p-0">
      <div className="px-4 py-3 border-b border-border text-sm text-ink-muted">
        ABC Track device count differs from the FreshBooks billed quantity
        (latest invoice).
      </div>
      <Table className="border-0 shadow-none rounded-none">
        <THead>
          <TR>
            <TH>Client</TH>
            <TH className="text-right">ABC Track devices</TH>
            <TH className="text-right">FreshBooks billed</TH>
            <TH className="text-right">Δ</TH>
            <TH>Latest invoice</TH>
          </TR>
        </THead>
        <tbody>
          {pageRows.map((r) => {
            const delta = r.abctrackDevices - r.freshbooksQty;
            return (
              <TR key={r.abctrackId}>
                <TD>
                  <div className="font-medium text-ink truncate max-w-[280px]">
                    {r.email}
                  </div>
                  {r.name && (
                    <div className="text-xs text-ink-faint truncate max-w-[280px]">
                      {r.name}
                    </div>
                  )}
                </TD>
                <TD className="text-right tabular text-ink">
                  {r.abctrackDevices}
                </TD>
                <TD className="text-right tabular text-ink">
                  {r.hasInvoices ? (
                    r.freshbooksQty
                  ) : (
                    <span className="text-warn">no invoices</span>
                  )}
                </TD>
                <TD className="text-right tabular font-medium">
                  <span className={delta === 0 ? 'text-ink-muted' : 'text-warn'}>
                    {delta > 0 ? `+${delta}` : delta}
                  </span>
                </TD>
                <TD className="text-ink-muted">
                  {r.invoiceNumber ? (
                    <span>
                      <span className="font-mono text-xs">{r.invoiceNumber}</span>
                      {r.invoiceDate && (
                        <span className="text-ink-faint">
                          {' '}
                          · {r.invoiceDate.slice(0, 10)}
                        </span>
                      )}
                    </span>
                  ) : (
                    '—'
                  )}
                </TD>
              </TR>
            );
          })}
        </tbody>
      </Table>
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
      />
    </Card>
  );
}

function RunningBanner() {
  return (
    <div className="px-4 py-3 border-b border-border flex items-center gap-2 text-sm text-ink-muted">
      <Loader2 className="size-4 animate-spin text-info" />
      Sweeping the ABC Track roster against FreshBooks… this can take a minute.
    </div>
  );
}

function SkeletonTable({ rows }: { rows: number }) {
  return (
    <div className="px-4 py-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 py-3 border-b border-border last:border-0"
        >
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-16 ml-auto" />
        </div>
      ))}
    </div>
  );
}
