'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  toggleCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

const SIDEBAR_COLLAPSED_KEY = 'sidebar-collapsed';

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsedState] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Charger l'état depuis localStorage au montage
  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (saved !== null) {
      setCollapsedState(saved === 'true');
    }
    setMounted(true);
  }, []);

  // Sauvegarder l'état dans localStorage
  const setCollapsed = (value: boolean) => {
    setCollapsedState(value);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(value));
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <SidebarContext.Provider value={{ collapsed: mounted ? collapsed : false, setCollapsed, toggleCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  
  // Retourner des valeurs par défaut si le contexte n'est pas disponible (SSR)
  if (context === null) {
    return {
      collapsed: false,
      setCollapsed: () => {},
      toggleCollapsed: () => {},
    };
  }
  
  return context;
}
