'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  // Login is a fullscreen page — no chrome.
  if (path === '/login' || path === '/') {
    return <>{children}</>;
  }
  return (
    <div className="min-h-screen flex bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 px-5 py-6 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
