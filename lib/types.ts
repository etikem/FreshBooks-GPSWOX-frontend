export type ClientStatus = 'ACTIVE' | 'BLOCKED' | 'CANCELLED' | 'UNKNOWN';
export type RetryStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELLED';
export type SyncOutcome = 'RESTORED' | 'BLOCKED' | 'NO_CHANGE' | 'ERROR';
export type ActionKind =
  | 'DECISION_BLOCK'
  | 'DECISION_RESTORE'
  | 'GPSWOX_ENABLE'
  | 'GPSWOX_DISABLE'
  | 'GPSWOX_UPDATE_EXPIRATION'
  | 'ERROR'
  | 'MANUAL_SYNC';

export interface Stats {
  totals: { totalClients: number; active: number; blocked: number };
  retries: { pending: number; failed: number };
  recentSyncs: Array<{
    id: string;
    trigger: string;
    outcome: SyncOutcome | null;
    outstanding: string | null;
    startedAt: string;
    notes: string | null;
    client?: { id: string; email: string } | null;
  }>;
}

export interface ClientListItem {
  id: string;
  email: string;
  name: string | null;
  status: ClientStatus;
  lastOutstanding: string | null;
  paidThroughDate: string | null;
  accessExpiresAt: string | null;
  freshbooksClientId: string;
  updatedAt: string;
}

export interface ClientDetail extends ClientListItem {
  gpswoxUserId: string | null;
  contractStartDate: string;
  contractEndDate: string;
  invoices: Array<{
    id: string;
    invoiceNumber: string | null;
    amount: string;
    paid: string;
    balance: string;
    currency: string;
    status: string;
    dueDate: string | null;
    issuedDate: string | null;
  }>;
  actionLogs: Array<{
    id: string;
    kind: ActionKind;
    message: string;
    createdAt: string;
    details: unknown;
  }>;
  syncRuns: Array<{
    id: string;
    trigger: string;
    outcome: SyncOutcome | null;
    outstanding: string | null;
    startedAt: string;
    notes: string | null;
  }>;
  retryJobs: Array<{
    id: string;
    operation: string;
    status: RetryStatus;
    attempts: number;
    maxAttempts: number;
    nextAttemptAt: string;
    lastError: string | null;
  }>;
}

export interface ActionLogItem {
  id: string;
  kind: ActionKind;
  message: string;
  createdAt: string;
  client?: { id: string; email: string } | null;
}

export interface WebhookEventItem {
  id: string;
  source: string;
  eventId: string;
  eventType: string;
  receivedAt: string;
  processed: boolean;
  failed: boolean;
  failureReason: string | null;
}

export interface RetryJobItem {
  id: string;
  operation: string;
  status: RetryStatus;
  attempts: number;
  maxAttempts: number;
  nextAttemptAt: string;
  lastError: string | null;
  client?: { id: string; email: string } | null;
}
