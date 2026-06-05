'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from './api';
import type {
  Stats,
  ClientListItem,
  ClientDetail,
  ActionLogItem,
  WebhookEventItem,
  RetryJobItem,
  ClientStatus,
  NotificationsResponse,
  ReconciliationSnapshot,
} from './types';

export const qk = {
  stats: ['stats'] as const,
  notifications: ['notifications'] as const,
  clients: (q?: string, status?: string, page?: number, pageSize?: number) =>
    ['clients', { q, status, page, pageSize }] as const,
  client: (id: string) => ['client', id] as const,
  actionLogs: (page?: number, pageSize?: number) =>
    ['logs', 'actions', { page, pageSize }] as const,
  webhookEvents: (page?: number, pageSize?: number) =>
    ['logs', 'webhooks', { page, pageSize }] as const,
  retries: (status?: string) => ['retries', { status }] as const,
  reconciliation: ['reconciliation'] as const,
};

export function useStats() {
  return useQuery({
    queryKey: qk.stats,
    queryFn: () => api<Stats>('/stats'),
    refetchInterval: 30_000,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: qk.notifications,
    queryFn: () => api<NotificationsResponse>('/notifications'),
    refetchInterval: 30_000,
  });
}

export function useClients(
  q: string = '',
  status: string = '',
  page: number = 1,
  pageSize: number = 50,
) {
  return useQuery({
    queryKey: qk.clients(q, status, page, pageSize),
    queryFn: () => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (status) params.set('status', status);
      params.set('take', String(pageSize));
      params.set('skip', String((page - 1) * pageSize));
      return api<{ items: ClientListItem[]; total: number }>(`/clients?${params}`);
    },
    placeholderData: (prev) => prev,
    // Poll so changes propagated by the FreshBooks webhook handler show up
    // in the UI without a manual refresh.
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });
}

export function useClient(id: string | null) {
  return useQuery({
    queryKey: id ? qk.client(id) : ['client', 'none'],
    queryFn: () => api<ClientDetail>(`/clients/${id}`),
    enabled: !!id,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });
}

export function useManualSync() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (clientId: string) =>
      api(`/clients/${clientId}/sync`, { method: 'POST' }),
    onSuccess: (_, clientId) => {
      qc.invalidateQueries({ queryKey: qk.client(clientId) });
      qc.invalidateQueries({ queryKey: qk.stats });
      qc.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export interface PatchClientInput {
  status?: ClientStatus;
  isUnlimited?: boolean;
}

export function usePatchClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: PatchClientInput }) =>
      api(`/clients/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: qk.client(id) });
      qc.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useReconciliation() {
  return useQuery({
    queryKey: qk.reconciliation,
    queryFn: () => api<ReconciliationSnapshot>('/reconciliation'),
    // Poll quickly while a sweep is in flight so the table fills in as soon
    // as it finishes; idle otherwise.
    refetchInterval: (query) =>
      query.state.data?.status === 'running' ? 3_000 : false,
  });
}

export function useRefreshReconciliation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api<ReconciliationSnapshot>('/reconciliation/refresh', { method: 'POST' }),
    onSuccess: (data) => {
      qc.setQueryData(qk.reconciliation, data);
    },
  });
}

export function useActionLogs(page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: qk.actionLogs(page, pageSize),
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('take', String(pageSize));
      params.set('skip', String((page - 1) * pageSize));
      return api<{ items: ActionLogItem[]; total: number }>(
        `/logs/actions?${params}`,
      );
    },
    placeholderData: (prev) => prev,
    refetchInterval: 20_000,
  });
}

export function useWebhookEvents(page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: qk.webhookEvents(page, pageSize),
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('take', String(pageSize));
      params.set('skip', String((page - 1) * pageSize));
      return api<{ items: WebhookEventItem[]; total: number }>(
        `/logs/webhooks?${params}`,
      );
    },
    placeholderData: (prev) => prev,
    refetchInterval: 20_000,
  });
}

export function useRetries(status: string = '') {
  return useQuery({
    queryKey: qk.retries(status),
    queryFn: () => {
      const q = status ? `?status=${status}` : '';
      return api<{ items: RetryJobItem[] }>(`/retries${q}`);
    },
    refetchInterval: 15_000,
  });
}

export function useReplayRetry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api(`/retries/${id}/replay`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['retries'] });
      qc.invalidateQueries({ queryKey: qk.stats });
    },
  });
}

export function useCancelRetry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api(`/retries/${id}/cancel`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['retries'] });
    },
  });
}
