'use client';

import { SessionProvider } from 'next-auth/react';
import { SidebarProvider } from '@/lib/SidebarContext';
import { ClientProvider } from '@/lib/ClientContext';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <SidebarProvider>
        <ClientProvider>
          {children}
        </ClientProvider>
      </SidebarProvider>
    </SessionProvider>
  );
}

