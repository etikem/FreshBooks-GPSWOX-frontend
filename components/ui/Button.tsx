import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

const variants: Record<Variant, string> = {
  primary:
    'bg-info text-white hover:bg-info/90 active:bg-info border border-info shadow-glow',
  secondary:
    'bg-bg-subtle text-ink border border-border hover:border-info/40 hover-overlay-1 active:bg-bg-subtle',
  ghost:
    'bg-transparent text-ink-muted hover:text-ink hover-overlay-1 border border-transparent',
  danger:
    'bg-bad text-white hover:bg-bad/90 border border-bad shadow-soft',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-9 px-3.5 text-sm gap-2 rounded-lg',
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    loading,
    disabled,
    className,
    children,
    iconLeft,
    iconRight,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors focus-ring select-none whitespace-nowrap',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        iconLeft ?? null
      )}
      {children}
      {!loading && iconRight ? iconRight : null}
    </button>
  );
});
