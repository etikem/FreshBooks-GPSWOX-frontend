'use client';

import { createContext, useContext, useId, useState } from 'react';
import { cn } from '@/lib/cn';

interface TabsCtx {
  value: string;
  setValue: (v: string) => void;
  baseId: string;
}
const Ctx = createContext<TabsCtx | null>(null);
function useCtx() {
  const c = useContext(Ctx);
  if (!c) throw new Error('Tabs.* must be used inside <Tabs>');
  return c;
}

export function Tabs({
  defaultValue,
  value: valueProp,
  onValueChange,
  children,
  className,
}: {
  defaultValue: string;
  value?: string;
  onValueChange?: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [internal, setInternal] = useState(defaultValue);
  const value = valueProp ?? internal;
  const setValue = (v: string) => {
    if (valueProp === undefined) setInternal(v);
    onValueChange?.(v);
  };
  const baseId = useId();
  return (
    <Ctx.Provider value={{ value, setValue, baseId }}>
      <div className={className}>{children}</div>
    </Ctx.Provider>
  );
}

export function TabsList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 p-1 bg-bg-subtle rounded-lg border border-border',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  count,
}: {
  value: string;
  children: React.ReactNode;
  count?: number;
}) {
  const ctx = useCtx();
  const active = ctx.value === value;
  return (
    <button
      role="tab"
      aria-selected={active}
      id={`${ctx.baseId}-trigger-${value}`}
      onClick={() => ctx.setValue(value)}
      className={cn(
        'inline-flex items-center gap-2 h-7 px-3 rounded-md text-sm font-medium transition-colors focus-ring',
        active
          ? 'bg-bg-panel text-ink shadow-soft border border-border'
          : 'text-ink-muted hover:text-ink',
      )}
    >
      {children}
      {typeof count === 'number' && (
        <span
          className={cn(
            'rounded-full text-[11px] px-1.5 py-0.5',
            active ? 'bg-bg-subtle text-ink-muted' : 'bg-bg-panel text-ink-muted',
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = useCtx();
  if (ctx.value !== value) return null;
  return (
    <div
      role="tabpanel"
      aria-labelledby={`${ctx.baseId}-trigger-${value}`}
      className={cn('animate-fade-in', className)}
    >
      {children}
    </div>
  );
}
