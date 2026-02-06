/**
 * RecoveryManager
 *
 * Manages state snapshots for crash recovery and undo functionality.
 * Persists snapshots to storage for recovery after unexpected app closures.
 */

import { Platform } from 'react-native';
import type { EncounterState } from '../state/types';

// ============================================================================
// Types
// ============================================================================

export interface RecoverySnapshot {
  state: EncounterState;
  timestamp: number;
  trigger: string;
}

export interface RecoveryManagerConfig {
  getState: () => EncounterState;
  restoreState: (state: EncounterState) => void;
  maxSnapshots?: number;
  autoSaveInterval?: number;
}

// ============================================================================
// Storage Helpers (platform-agnostic)
// ============================================================================

const STORAGE_KEY = 'ehr-recovery-snapshots';

async function loadFromStorage(): Promise<RecoverySnapshot[]> {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    // For native, would use AsyncStorage
    return [];
  } catch {
    return [];
  }
}

async function saveToStorage(snapshots: RecoverySnapshot[]): Promise<void> {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
    }
    // For native, would use AsyncStorage
  } catch (e) {
    console.warn('Failed to persist recovery snapshots:', e);
  }
}

async function clearStorage(): Promise<void> {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    // For native, would use AsyncStorage
  } catch {
    // Ignore
  }
}

// ============================================================================
// RecoveryManager
// ============================================================================

export class RecoveryManager {
  private config: Required<RecoveryManagerConfig>;
  private snapshots: RecoverySnapshot[] = [];
  private autoSaveTimer: ReturnType<typeof setInterval> | null = null;
  private isInitialized = false;

  constructor(config: RecoveryManagerConfig) {
    this.config = {
      maxSnapshots: 10,
      autoSaveInterval: 30000,
      ...config,
    };

    this.loadFromStorage();
    this.startAutoSave();
  }

  /**
   * Check if recovery data is available
   */
  hasRecoveryData(): boolean {
    return this.snapshots.length > 0;
  }

  /**
   * Save current state as a snapshot
   */
  saveSnapshot(trigger: string = 'manual'): void {
    try {
      const state = this.config.getState();
      const snapshot: RecoverySnapshot = {
        state: JSON.parse(JSON.stringify(state)),
        timestamp: Date.now(),
        trigger,
      };

      this.snapshots.push(snapshot);

      // Keep only the latest N snapshots
      if (this.snapshots.length > this.config.maxSnapshots) {
        this.snapshots.shift();
      }

      this.persistToStorage();
    } catch (e) {
      console.warn('Failed to save recovery snapshot:', e);
    }
  }

  /**
   * Get all available snapshots
   */
  getSnapshots(): RecoverySnapshot[] {
    return [...this.snapshots];
  }

  /**
   * Get the most recent snapshot
   */
  getLatestSnapshot(): RecoverySnapshot | null {
    return this.snapshots[this.snapshots.length - 1] || null;
  }

  /**
   * Restore state from a specific snapshot index
   */
  restoreSnapshot(index: number): boolean {
    const snapshot = this.snapshots[index];
    if (!snapshot) return false;

    try {
      this.config.restoreState(snapshot.state);
      return true;
    } catch (e) {
      console.warn('Failed to restore snapshot:', e);
      return false;
    }
  }

  /**
   * Restore the most recent snapshot
   */
  restoreLatest(): boolean {
    if (this.snapshots.length === 0) return false;
    return this.restoreSnapshot(this.snapshots.length - 1);
  }

  /**
   * Clear all snapshots
   */
  clearSnapshots(): void {
    this.snapshots = [];
    clearStorage();
  }

  /**
   * Stop auto-save and cleanup
   */
  destroy(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /**
   * Pause auto-saving temporarily
   */
  pauseAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /**
   * Resume auto-saving
   */
  resumeAutoSave(): void {
    if (!this.autoSaveTimer) {
      this.startAutoSave();
    }
  }

  // Private methods
  private startAutoSave(): void {
    this.autoSaveTimer = setInterval(() => {
      this.saveSnapshot('auto');
    }, this.config.autoSaveInterval);
  }

  private async persistToStorage(): Promise<void> {
    // Only persist the last 3 snapshots to storage
    const toSave = this.snapshots.slice(-3);
    await saveToStorage(toSave);
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const stored = await loadFromStorage();
      if (stored.length > 0) {
        this.snapshots = stored;
      }
      this.isInitialized = true;
    } catch (e) {
      console.warn('Failed to load recovery snapshots:', e);
      this.isInitialized = true;
    }
  }
}

/**
 * Create a recovery manager instance
 */
export function createRecoveryManager(
  config: RecoveryManagerConfig
): RecoveryManager {
  return new RecoveryManager(config);
}
