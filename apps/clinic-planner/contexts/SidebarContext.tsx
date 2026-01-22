'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Load initial state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('sidebarOpen');
    if (stored !== null) {
      setIsOpen(stored === 'true');
    }
    setMounted(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebarOpen', String(isOpen));
    }
  }, [isOpen, mounted]);

  const toggle = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <SidebarContext.Provider value={{ isOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
