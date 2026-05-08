'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

export function Drawer({
  open,
  onClose,
  title,
  description,
  width = 560,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  width?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* scrim */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      {/* panel */}
      <aside
        role="dialog"
        aria-modal="true"
        style={{ width }}
        className={cn(
          'absolute right-0 top-0 bottom-0 bg-bg-panel border-l border-white/10 shadow-pop',
          'flex flex-col animate-slide-in-right',
        )}
      >
        <header className="px-5 py-4 border-b border-white/10 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {title && <div className="text-base font-semibold truncate text-ink">{title}</div>}
            {description && (
              <div className="text-sm text-ink-muted mt-0.5">{description}</div>
            )}
          </div>
          <button
            onClick={onClose}
            className="size-8 inline-flex items-center justify-center rounded-lg text-ink-muted hover:bg-white/[0.06] hover:text-ink focus-ring"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-white/10 bg-bg-subtle/40">{footer}</div>}
      </aside>
    </div>,
    document.body,
  );
}
