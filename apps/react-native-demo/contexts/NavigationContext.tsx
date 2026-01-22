/**
 * Navigation Context
 * Provides screen-specific navigation handlers to the persistent FloatingHeader
 * This allows the header to stay mounted while handlers change based on active screen
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface NavigationHandlers {
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  previousLabel: string;
  nextLabel: string;
  currentTitle: string;
}

interface NavigationContextType {
  handlers: NavigationHandlers | null;
  setHandlers: (handlers: NavigationHandlers) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [handlers, setHandlers] = useState<NavigationHandlers | null>(null);

  return (
    <NavigationContext.Provider value={{ handlers, setHandlers }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigationHandlers() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigationHandlers must be used within NavigationProvider');
  }
  return context;
}
