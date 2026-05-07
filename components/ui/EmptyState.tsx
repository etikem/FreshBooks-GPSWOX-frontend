import { cn } from '@/lib/cn';

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-14 px-6',
        className,
      )}
    >
      {icon && (
        <div className="size-10 rounded-xl bg-bg-subtle text-ink-muted flex items-center justify-center mb-3">
          {icon}
        </div>
      )}
      <div className="text-sm font-semibold text-ink">{title}</div>
      {description && (
        <div className="text-sm text-ink-muted mt-1 max-w-sm">{description}</div>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="size-10 rounded-xl bg-bad-surface text-bad flex items-center justify-center mb-3">
        !
      </div>
      <div className="text-sm font-semibold text-ink">Something went wrong</div>
      <div className="text-sm text-ink-muted mt-1 max-w-md">{message}</div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center h-8 px-3 rounded-lg bg-ink text-white text-xs font-medium hover:bg-ink/90 focus-ring"
        >
          Try again
        </button>
      )}
    </div>
  );
}
