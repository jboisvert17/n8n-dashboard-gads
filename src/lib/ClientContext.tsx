'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { ClientConfiguration } from '@/types';

interface ClientContextType {
  selectedClient: ClientConfiguration | null;
  setSelectedClient: (client: ClientConfiguration | null) => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientProvider({ children }: { children: ReactNode }) {
  const [selectedClient, setSelectedClient] = useState<ClientConfiguration | null>(null);

  return (
    <ClientContext.Provider value={{ selectedClient, setSelectedClient }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient doit être utilisé dans un ClientProvider');
  }
  return context;
}

