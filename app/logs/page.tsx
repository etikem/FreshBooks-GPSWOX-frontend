'use client';

import { useState } from 'react';
import { ScrollText, Webhook } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { ActivityFeed } from '@/components/ActivityFeed';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Table,
  THead,
  TR,
  TH,
  TD,
} from '@/components/ui/Table';
import { useActionLogs, useWebhookEvents } from '@/lib/hooks';

export default function LogsPage() {
  const [tab, setTab] = useState<'actions' | 'webhooks'>('actions');
  const actions = useActionLogs();
  const webhooks = useWebhookEvents();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Logs</h1>
        <p className="text-sm text-ink-muted">
          Decisions, GPSWOX calls, and inbound webhooks. Auto-refreshing.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'actions' | 'webhooks')} defaultValue="actions">
        <TabsList>
          <TabsTrigger value="actions" count={actions.data?.items.length}>
            <ScrollText className="size-3.5" />
            Actions
          </TabsTrigger>
          <TabsTrigger value="webhooks" count={webhooks.data?.items.length}>
            <Webhook className="size-3.5" />
            Webhooks
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="actions">
            <Card>
              <CardHeader>
                <CardTitle>Action timeline</CardTitle>
              </CardHeader>
              <CardBody>
                {actions.error ? (
                  <ErrorState
                    message={(actions.error as Error).message}
                    onRetry={() => actions.refetch()}
                  />
                ) : actions.isLoading ? (
                  <SkeletonFeed />
                ) : actions.data?.items.length === 0 ? (
                  <EmptyState
                    icon={<ScrollText className="size-5" />}
                    title="No actions yet"
                    description="Actions appear here as soon as a webhook is processed."
                  />
                ) : (
                  <ActivityFeed items={actions.data?.items ?? []} />
                )}
              </CardBody>
            </Card>
          </TabsContent>

          <TabsContent value="webhooks">
            <Card>
              <CardHeader>
                <CardTitle>Webhook events</CardTitle>
              </CardHeader>
              {webhooks.error ? (
                <CardBody>
                  <ErrorState
                    message={(webhooks.error as Error).message}
                    onRetry={() => webhooks.refetch()}
                  />
                </CardBody>
              ) : webhooks.isLoading ? (
                <CardBody>
                  <SkeletonRows rows={6} />
                </CardBody>
              ) : webhooks.data?.items.length === 0 ? (
                <EmptyState
                  icon={<Webhook className="size-5" />}
                  title="No webhooks received"
                  description="Once FreshBooks posts to /webhooks/freshbooks, events appear here."
                />
              ) : (
                <Table className="border-0 shadow-none rounded-none">
                  <THead>
                    <TR>
                      <TH>Received</TH>
                      <TH>Type</TH>
                      <TH>Source</TH>
                      <TH>Event id</TH>
                      <TH>Status</TH>
                      <TH>Error</TH>
                    </TR>
                  </THead>
                  <tbody>
                    {webhooks.data?.items.map((w) => (
                      <TR key={w.id}>
                        <TD className="text-xs text-ink-muted whitespace-nowrap">
                          {new Date(w.receivedAt).toLocaleString()}
                        </TD>
                        <TD className="font-medium">{w.eventType}</TD>
                        <TD className="text-ink-muted">{w.source}</TD>
                        <TD className="font-mono text-[11px] text-ink-faint truncate max-w-[180px]">
                          {w.eventId}
                        </TD>
                        <TD>
                          {w.failed ? (
                            <StatusBadge status="ERROR" />
                          ) : w.processed ? (
                            <StatusBadge status="SUCCEEDED" />
                          ) : (
                            <StatusBadge status="PENDING" />
                          )}
                        </TD>
                        <TD className="text-bad text-xs">
                          {w.failureReason ?? '—'}
                        </TD>
                      </TR>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function SkeletonFeed() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="size-7 rounded-full" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-2.5 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonRows({ rows }: { rows: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-9" />
      ))}
    </div>
  );
}
