export type ClientStatus =
  | 'ACTIVE'
  | 'BLOCKED'
  | 'CANCELLED'
  | 'UNKNOWN';
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
  | 'GPSWOX_MATCHED'
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
  /** Legacy — no longer written by the access engine, kept for historical display. */
  lastOutstanding: string | null;
  /** Legacy — no longer written by the access engine, kept for historical display. */
  paidThroughDate: string | null;
  accessExpiresAt: string | null;
  // Most recent successful payment we've observed for this client.
  lastPaymentAt: string | null;
  // Manual-override flag — when true, access is held ACTIVE with no
  // expiration in ABC Track regardless of payment state.
  isUnlimited: boolean;
  lastSyncedAt: string | null;
  freshbooksClientId: string;
  updatedAt: string;
}

export interface ClientDetail extends ClientListItem {
  gpswoxUserId: string | null;
  // Profile fields populated from /users/clients/<id> on client.* webhooks.
  firstName: string | null;
  lastName: string | null;
  organization: string | null;
  businessPhone: string | null;
  mobilePhone: string | null;
  homePhone: string | null;
  addressStreet: string | null;
  addressStreet2: string | null;
  addressCity: string | null;
  addressProvince: string | null;
  addressCountry: string | null;
  addressCode: string | null;
  currencyCode: string | null;
  language: string | null;
  vatName: string | null;
  vatNumber: string | null;
  notes: string | null;
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
    active: boolean;
    voidedAt: string | null;
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

export interface NotificationsResponse {
  cancelled: {
    count: number;
    sample: Array<{
      id: string;
      email: string;
      name: string | null;
      lastSyncedAt: string | null;
    }>;
  };
  webhookFailures: {
    count: number;
    sample: Array<{
      id: string;
      eventType: string;
      eventId: string;
      failureReason: string | null;
      receivedAt: string;
    }>;
  };
  failedRetries: {
    count: number;
    sample: Array<{
      id: string;
      operation: string;
      lastError: string | null;
      updatedAt: string;
      client?: { id: string; email: string } | null;
    }>;
  };
  recentSyncErrors: {
    count: number;
    sample: Array<{
      id: string;
      notes: string | null;
      startedAt: string;
      client?: { id: string; email: string } | null;
    }>;
  };
}
