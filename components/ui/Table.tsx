import { cn } from '@/lib/cn';

export function Table({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'surface overflow-hidden shadow-soft',
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm tabular border-separate border-spacing-0">
          {children}
        </table>
      </div>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-white/[0.03] text-ink-faint text-xs uppercase tracking-wide">
      {children}
    </thead>
  );
}

export function TR({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'group',
        onClick && 'cursor-pointer hover:bg-white/[0.04] transition-colors',
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function TH({
  children,
  className,
  align = 'left',
}: {
  children?: React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}) {
  return (
    <th
      className={cn(
        'px-4 py-2.5 font-medium border-b border-white/10 text-ink-faint',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        align === 'left' && 'text-left',
        className,
      )}
    >
      {children}
    </th>
  );
}

export function TD({
  children,
  className,
  align = 'left',
}: {
  children?: React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}) {
  return (
    <td
      className={cn(
        'px-4 py-3 border-b border-white/[0.06] text-ink',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        align === 'left' && 'text-left',
        className,
      )}
    >
      {children}
    </td>
  );
}
