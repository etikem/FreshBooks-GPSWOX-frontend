'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';

type ToastTone = 'success' | 'error' | 'info';
interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
}
interface ToastCtxValue {
  push: (t: Omit<Toast, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const Ctx = createContext<ToastCtxValue | null>(null);

export function useToast(): ToastCtxValue {
  const c = useContext(Ctx);
  if (!c) throw new Error('useToast must be used inside <ToastProvider>');
  return c;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const remove = useCallback((id: string) => {
    setItems((cur) => cur.filter((t) => t.id !== id));
    const handle = timers.current.get(id);
    if (handle) clearTimeout(handle);
    timers.current.delete(id);
  }, []);

  const push = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = crypto.randomUUID();
      setItems((cur) => [...cur, { ...t, id }]);
      const handle = setTimeout(() => remove(id), 4500);
      timers.current.set(id, handle);
    },
    [remove],
  );

  const value: ToastCtxValue = {
    push,
    success: (title, description) => push({ tone: 'success', title, description }),
    error: (title, description) => push({ tone: 'error', title, description }),
    info: (title, description) => push({ tone: 'info', title, description }),
  };

  useEffect(() => {
    return () => {
      timers.current.forEach((h) => clearTimeout(h));
      timers.current.clear();
    };
  }, []);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 w-80 p-3 pr-4 rounded-lg border shadow-pop animate-slide-in-up',
              t.tone === 'success' && 'bg-bg-panel border-ok-ring/60',
              t.tone === 'error' && 'bg-bg-panel border-bad-ring/60',
              t.tone === 'info' && 'bg-bg-panel border-info-ring/60',
            )}
          >
            <ToneIcon tone={t.tone} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-ink truncate">{t.title}</div>
              {t.description && (
                <div className="text-xs text-ink-muted mt-0.5">{t.description}</div>
              )}
            </div>
            <button
              onClick={() => remove(t.id)}
              className="text-ink-faint hover:text-ink"
              aria-label="Dismiss"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

function ToneIcon({ tone }: { tone: ToastTone }) {
  const cls = 'size-5 shrink-0 mt-0.5';
  if (tone === 'success') return <CheckCircle2 className={cn(cls, 'text-ok')} />;
  if (tone === 'error') return <AlertTriangle className={cn(cls, 'text-bad')} />;
  return <Info className={cn(cls, 'text-info')} />;
}
