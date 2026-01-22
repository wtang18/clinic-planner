/**
 * State types for the EHR encounter state management
 */

import type {
  ChartItem,
  Suggestion,
  BackgroundTask,
  CareGapInstance,
  EncounterMeta,
  PatientContext,
  VisitMeta,
  TranscriptionState,
  CollaborationState,
  SyncStatus,
  Role,
} from '../types';

// ============================================================================
// Core State Shape
// ============================================================================

/** The main encounter state interface */
export interface EncounterState {
  /** Normalized entity collections */
  entities: {
    items: Record<string, ChartItem>;
    suggestions: Record<string, Suggestion>;
    tasks: Record<string, BackgroundTask>;
    careGaps: Record<string, CareGapInstance>;
  };
  
  /** Explicit relationships between entities */
  relationships: {
    itemOrder: string[];                        // Display order of items
    taskToItem: Record<string, string>;         // Task ID → Item ID
    suggestionToItem: Record<string, string | null>; // Suggestion ID → Item ID (null if general)
    careGapToItems: Record<string, string[]>;   // Gap ID → Item IDs addressing it
  };
  
  /** Encounter context - loaded at open, rarely mutated */
  context: {
    encounter: EncounterMeta | null;
    patient: PatientContext | null;
    visit: VisitMeta | null;
  };
  
  /** Session state - transient, not persisted */
  session: {
    mode: Mode;
    currentUser: User | null;
    transcription: TranscriptionState;
  };
  
  /** Sync state - tracks server communication */
  sync: {
    status: SyncStatus;
    queue: QueuedAction[];
    lastSyncedAt: Date | null;
  };
  
  /** Collaboration state - multi-user coordination */
  collaboration: CollaborationState;
}

// ============================================================================
// Supporting Types
// ============================================================================

/** Operational modes */
export type Mode = 'capture' | 'process' | 'review';

/** User with credentials */
export interface User {
  id: string;
  name: string;
  role: Role;
  credentials?: string[];      // "MD", "PA-C", "RN", "MA"
  npi?: string;                // National Provider Identifier
}

/** Queued action for sync */
export interface QueuedAction {
  id: string;
  action: unknown; // Will be typed as EncounterAction after action definitions
  queuedAt: Date;
  retryCount: number;
  lastError?: string;
}

/** Sync conflict */
export interface SyncConflict {
  itemId: string;
  localVersion: unknown;
  serverVersion: unknown;
  detectedAt: Date;
  resolution?: 'local' | 'server' | 'merge';
  resolvedAt?: Date;
}

/** Notification for UI feedback */
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  
  actionLabel?: string;
  actionTarget?: string;
  
  persistent?: boolean;
  dismissable?: boolean;
  
  createdAt: Date;
  expiresAt?: Date;
  dismissedAt?: Date;
}
