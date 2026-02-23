/**
 * Shortcut Progress Tracking
 *
 * Tracks which shortcuts the user has tried, persisting to localStorage.
 * Used by the legend panel to show "tried" checkmarks.
 */

const STORAGE_KEY = 'ehr-shortcut-progress';

/**
 * Get the set of shortcut IDs the user has previously used.
 */
export function getTriedShortcuts(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return new Set(parsed);
    return new Set();
  } catch {
    return new Set();
  }
}

/**
 * Mark a shortcut as tried (persists immediately).
 */
/**
 * Clear all tried shortcuts (called on page load so progress resets per session).
 */
export function clearTriedShortcuts(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage unavailable — silently ignore
  }
}

/**
 * Mark a shortcut as tried (persists immediately).
 */
export function markShortcutTried(id: string): void {
  try {
    const current = getTriedShortcuts();
    if (current.has(id)) return; // already tracked
    current.add(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...current]));
  } catch {
    // localStorage quota exceeded or unavailable — silently ignore
  }
}
