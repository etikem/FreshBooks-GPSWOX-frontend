'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Topbar } from './Topbar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Login is a fullscreen page — no chrome.
  if (path === '/login' || path === '/') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-bg">
      <Sidebar />
      <MobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 px-4 sm:px-5 py-6 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
