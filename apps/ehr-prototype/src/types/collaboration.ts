/**
 * Collaboration types
 */

import type { UserReference } from './common';

/** Handoff record between users */
export interface Handoff {
  from: UserReference;
  to: UserReference;
  at: Date;
  note?: string;
}

/** Collaboration state */
export interface CollaborationState {
  currentOwner: UserReference | null;
  handoffHistory: Handoff[];
}

/** Item lock for concurrent editing */
export interface ItemLock {
  itemId: string;
  userId: string;
  acquiredAt: Date;
  expiresAt: Date;
}

/** User presence for real-time collaboration */
export interface UserPresence {
  userId: string;
  activeSection?: string;
  cursorPosition?: { x: number; y: number };
  lastActiveAt: Date;
}
