'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { SidebarBody } from './Sidebar';

export function MobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const path = usePathname();
  // Defer the portal until after hydration so SSR + first client render
  // both produce null (matching tree), avoiding a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Close on route change (covers Next.js Link clicks even if onNavigate isn't fired).
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  // Esc to close + body scroll lock while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`md:hidden fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      {/* Scrim */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className={`absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-bg-sidebar text-ink-onSidebar shadow-pop transition-transform duration-200 ease-out flex flex-col ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={onClose}
          aria-label="Close navigation"
          className="absolute top-3 right-3 size-8 inline-flex items-center justify-center rounded-lg text-ink-onSidebarMuted hover:text-ink-onSidebar hover:bg-white/[0.06] focus-ring"
        >
          <X className="size-4" />
        </button>
        <SidebarBody onNavigate={onClose} />
      </aside>
    </div>,
    document.body,
  );
}
