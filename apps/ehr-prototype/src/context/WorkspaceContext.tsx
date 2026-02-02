/**
 * WorkspaceContext
 *
 * Manages workspace state including open tabs for patient and staff workspaces.
 * Supports child tabs for To-Do items within patient contexts.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { ToDoItem } from '../scenarios/todoData';

// ============================================================================
// Types
// ============================================================================

export type WorkspaceTabType = 'visit' | 'task' | 'fax' | 'message' | 'care' | 'list' | 'overview';

export interface WorkspaceTab {
  /** Unique tab ID */
  id: string;
  /** Tab type determines which view to render */
  type: WorkspaceTabType;
  /** Display label for the tab */
  label: string;
  /** Associated To-Do item (if opened from To-Do list) */
  todoItem?: ToDoItem;
  /** Source filter for context bar navigation */
  sourceFilter?: string;
  /** Source category ID */
  sourceCategoryId?: string;
}

export interface Workspace {
  /** Workspace ID (patient MRN or 'staff') */
  id: string;
  /** Workspace type */
  type: 'patient' | 'staff';
  /** Patient name (if patient workspace) */
  patientName?: string;
  /** Open tabs in this workspace */
  tabs: WorkspaceTab[];
  /** Currently active tab ID */
  activeTabId: string;
  /** Context bar state for this workspace */
  contextBar?: {
    sourceFilter: string;
    sourceCategoryId: string;
    currentIndex: number;
    totalCount: number;
    dismissed: boolean;
  };
}

export interface WorkspaceContextValue {
  /** All open workspaces */
  workspaces: Workspace[];
  /** Currently active workspace ID */
  activeWorkspaceId: string | null;
  /** Get workspace by ID */
  getWorkspace: (id: string) => Workspace | undefined;
  /** Get active workspace */
  getActiveWorkspace: () => Workspace | undefined;
  /** Open or switch to a workspace */
  openWorkspace: (id: string, type: 'patient' | 'staff', patientName?: string) => void;
  /** Close a workspace */
  closeWorkspace: (id: string) => void;
  /** Open a tab in a workspace */
  openTab: (workspaceId: string, tab: Omit<WorkspaceTab, 'id'>) => string;
  /** Close a tab */
  closeTab: (workspaceId: string, tabId: string) => void;
  /** Switch to a tab */
  switchTab: (workspaceId: string, tabId: string) => void;
  /** Get active tab for a workspace */
  getActiveTab: (workspaceId: string) => WorkspaceTab | undefined;
  /** Set context bar state */
  setContextBar: (workspaceId: string, contextBar: Workspace['contextBar']) => void;
  /** Dismiss context bar */
  dismissContextBar: (workspaceId: string) => void;
}

// ============================================================================
// Context
// ============================================================================

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

interface WorkspaceProviderProps {
  children: ReactNode;
}

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);

  const getWorkspace = useCallback(
    (id: string) => workspaces.find((w) => w.id === id),
    [workspaces]
  );

  const getActiveWorkspace = useCallback(
    () => (activeWorkspaceId ? getWorkspace(activeWorkspaceId) : undefined),
    [activeWorkspaceId, getWorkspace]
  );

  const openWorkspace = useCallback(
    (id: string, type: 'patient' | 'staff', patientName?: string) => {
      setWorkspaces((prev) => {
        const existing = prev.find((w) => w.id === id);
        if (existing) {
          return prev;
        }
        // Create new workspace with default "overview" tab
        const defaultTab: WorkspaceTab = {
          id: `${id}-overview`,
          type: 'overview',
          label: type === 'patient' ? 'Overview' : 'Dashboard',
        };
        return [
          ...prev,
          {
            id,
            type,
            patientName,
            tabs: [defaultTab],
            activeTabId: defaultTab.id,
          },
        ];
      });
      setActiveWorkspaceId(id);
    },
    []
  );

  const closeWorkspace = useCallback((id: string) => {
    setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    setActiveWorkspaceId((prev) => (prev === id ? null : prev));
  }, []);

  const openTab = useCallback(
    (workspaceId: string, tabData: Omit<WorkspaceTab, 'id'>): string => {
      const tabId = `${workspaceId}-${tabData.type}-${Date.now()}`;
      const tab: WorkspaceTab = { ...tabData, id: tabId };

      setWorkspaces((prev) =>
        prev.map((w) => {
          if (w.id !== workspaceId) return w;
          // Check if tab for same item already exists
          if (tabData.todoItem) {
            const existingTab = w.tabs.find(
              (t) => t.todoItem?.id === tabData.todoItem?.id
            );
            if (existingTab) {
              return { ...w, activeTabId: existingTab.id };
            }
          }
          return {
            ...w,
            tabs: [...w.tabs, tab],
            activeTabId: tabId,
          };
        })
      );

      return tabId;
    },
    []
  );

  const closeTab = useCallback((workspaceId: string, tabId: string) => {
    setWorkspaces((prev) =>
      prev.map((w) => {
        if (w.id !== workspaceId) return w;
        const newTabs = w.tabs.filter((t) => t.id !== tabId);
        // If closing active tab, switch to previous tab or first tab
        let newActiveId = w.activeTabId;
        if (w.activeTabId === tabId) {
          const closedIndex = w.tabs.findIndex((t) => t.id === tabId);
          newActiveId = newTabs[Math.max(0, closedIndex - 1)]?.id ?? '';
        }
        return {
          ...w,
          tabs: newTabs,
          activeTabId: newActiveId,
        };
      })
    );
  }, []);

  const switchTab = useCallback((workspaceId: string, tabId: string) => {
    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === workspaceId ? { ...w, activeTabId: tabId } : w
      )
    );
  }, []);

  const getActiveTab = useCallback(
    (workspaceId: string) => {
      const workspace = getWorkspace(workspaceId);
      return workspace?.tabs.find((t) => t.id === workspace.activeTabId);
    },
    [getWorkspace]
  );

  const setContextBar = useCallback(
    (workspaceId: string, contextBar: Workspace['contextBar']) => {
      setWorkspaces((prev) =>
        prev.map((w) =>
          w.id === workspaceId ? { ...w, contextBar } : w
        )
      );
    },
    []
  );

  const dismissContextBar = useCallback((workspaceId: string) => {
    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === workspaceId && w.contextBar
          ? { ...w, contextBar: { ...w.contextBar, dismissed: true } }
          : w
      )
    );
  }, []);

  const value: WorkspaceContextValue = {
    workspaces,
    activeWorkspaceId,
    getWorkspace,
    getActiveWorkspace,
    openWorkspace,
    closeWorkspace,
    openTab,
    closeTab,
    switchTab,
    getActiveTab,
    setContextBar,
    dismissContextBar,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

// ============================================================================
// Hook
// ============================================================================

export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

export default WorkspaceContext;
