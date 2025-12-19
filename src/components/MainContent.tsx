'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import clsx from 'clsx';
import { useSidebar } from '@/lib/SidebarContext';

interface MainContentProps {
  children: ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  const pathname = usePathname();
  const { collapsed } = useSidebar();
  const isLoginPage = pathname === '/login';

  return (
    <main 
      className={clsx(
        'flex-1 transition-all duration-300',
        isLoginPage ? 'ml-0' : collapsed ? 'ml-20' : 'ml-64'
      )}
    >
      {children}
    </main>
  );
}
