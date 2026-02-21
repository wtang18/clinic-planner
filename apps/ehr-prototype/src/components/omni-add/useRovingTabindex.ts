/**
 * useRovingTabindex — Shared roving tabindex for pill components
 *
 * What: Implements the WAI-ARIA roving tabindex pattern. The active item gets
 *   tabIndex={0} and `.focus()`, siblings get tabIndex={-1}. This keeps a
 *   single tab stop per group while allowing ArrowLeft/Right within-row cycling.
 *
 * Why: Without this, focus ring and selection desync — arrow keys update the
 *   visual highlight but DOM focus stays on the container. Tab users also can't
 *   navigate within a pill row efficiently.
 *
 * When to reuse: Any horizontal row of buttons/pills that should behave as a
 *   single keyboard-navigable group.
 */

import { useRef, useState, useEffect, useCallback } from 'react';

// ============================================================================
// Pure helpers (exported for testing without React)
// ============================================================================

/**
 * Compute the next index for a roving tabindex group.
 * Returns null for unhandled keys or when count is 0.
 */
export function computeNextIndex(
  key: string,
  currentIndex: number,
  count: number,
): number | null {
  if (count === 0) return null;

  switch (key) {
    case 'ArrowRight':
      return currentIndex < count - 1 ? currentIndex + 1 : 0;
    case 'ArrowLeft':
      return currentIndex > 0 ? currentIndex - 1 : count - 1;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}

/** Clamp an index to [0, count-1], returning 0 when count is 0. */
export function clampIndex(index: number, count: number): number {
  if (count === 0) return 0;
  return Math.max(0, Math.min(index, count - 1));
}

// ============================================================================
// Hook
// ============================================================================

export interface UseRovingTabindexOptions {
  /** Number of items in the group */
  count: number;
  /** Called when arrow keys move focus. Receives the new index. */
  onArrow?: (index: number) => void;
  /** Called when Enter is pressed. Receives the focused index. */
  onEnter?: (index: number) => void;
  /** Initial focused index (default 0) */
  initialIndex?: number;
}

export interface RovingProps {
  ref: (el: HTMLElement | null) => void;
  tabIndex: number;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export function useRovingTabindex({
  count,
  onArrow,
  onEnter,
  initialIndex = 0,
}: UseRovingTabindexOptions) {
  const [focusedIndex, setFocusedIndex] = useState(initialIndex);
  const refs = useRef<(HTMLElement | null)[]>([]);

  // Clamp focusedIndex when count shrinks (e.g. ItemPills filtering)
  useEffect(() => {
    setFocusedIndex(prev => clampIndex(prev, count));
  }, [count]);

  // Ensure refs array stays in sync with count
  useEffect(() => {
    refs.current.length = count;
  }, [count]);

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onEnter?.(index);
        return;
      }

      const next = computeNextIndex(e.key, index, count);
      if (next === null) return;

      e.preventDefault();
      setFocusedIndex(next);
      refs.current[next]?.focus();
      onArrow?.(next);
    },
    [count, onArrow, onEnter],
  );

  const getTabIndex = useCallback(
    (index: number): number => (index === focusedIndex ? 0 : -1),
    [focusedIndex],
  );

  const getRovingProps = useCallback(
    (index: number): RovingProps => ({
      ref: (el: HTMLElement | null) => {
        refs.current[index] = el;
      },
      tabIndex: index === focusedIndex ? 0 : -1,
      onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(index, e),
    }),
    [focusedIndex, handleKeyDown],
  );

  return {
    focusedIndex,
    setFocusedIndex,
    getTabIndex,
    getRovingProps,
    handleKeyDown,
  };
}
