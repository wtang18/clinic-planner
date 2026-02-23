/**
 * usePaneShortcuts Hook
 *
 * Registers pane toggle + cycling shortcuts via ShortcutManager.
 * Uses coordination state via ref to avoid re-registration on every state change.
 *
 * Shortcuts:
 *   ⌘\     — Toggle left pane
 *   ⌘⇧\    — Toggle overview pane
 *   ⌘]     — Cycle left pane view forward  (auto-expands if collapsed)
 *   ⌘[     — Cycle left pane view backward (auto-expands if collapsed)
 *   ⌘⇧]    — Cycle overview tab forward  (auto-expands if collapsed)
 *   ⌘⇧[    — Cycle overview tab backward (auto-expands if collapsed)
 */

import { useEffect, useRef } from 'react';
import { shortcutManager } from './ShortcutManager';
import type { Shortcut } from './ShortcutManager';
import type { CoordinationState, CoordinationAction, PaneView } from '../state/coordination';

// ============================================================================
// Pure cycling logic (exported for testing)
// ============================================================================

const PANE_VIEWS: PaneView[] = ['menu', 'ai', 'transcript'];

/**
 * Get the next pane view in the cycle, skipping 'transcript' if not eligible.
 */
export function nextPaneView(
  current: PaneView,
  txEligible: boolean,
  direction: 1 | -1 = 1,
): PaneView {
  const views = txEligible ? PANE_VIEWS : PANE_VIEWS.filter((v) => v !== 'transcript');
  const idx = views.indexOf(current);
  const nextIdx = (idx + direction + views.length) % views.length;
  return views[nextIdx];
}

// ============================================================================
// Hook
// ============================================================================

export function usePaneShortcuts(
  state: CoordinationState,
  dispatch: React.Dispatch<CoordinationAction>,
): void {
  // Keep state in ref so shortcut handlers always read latest state
  // without causing shortcut re-registration on every state change.
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const shortcuts: Shortcut[] = [
      // --- Left pane toggle ---
      {
        id: 'pane-toggle',
        key: 'mod+\\',
        description: 'Toggle left pane',
        category: 'panes',
        handler: () => {
          const s = stateRef.current;
          dispatch({ type: s.paneExpanded ? 'PANE_COLLAPSED' : 'PANE_EXPANDED' });
        },
      },
      // --- Overview pane toggle ---
      {
        id: 'overview-toggle',
        key: 'mod+shift+\\',
        description: 'Toggle overview pane',
        category: 'panes',
        handler: () => {
          const s = stateRef.current;
          dispatch({ type: s.overviewExpanded ? 'OVERVIEW_COLLAPSED' : 'OVERVIEW_EXPANDED' });
        },
      },
      // --- Left pane cycle forward ---
      {
        id: 'pane-cycle-fwd',
        key: 'mod+]',
        description: 'Next left pane view',
        category: 'panes',
        handler: () => {
          const s = stateRef.current;
          if (!s.paneExpanded) {
            dispatch({ type: 'PANE_EXPANDED' });
            return;
          }
          dispatch({
            type: 'PANE_VIEW_CHANGED',
            payload: { to: nextPaneView(s.paneView, s.txEligible, 1) },
          });
        },
      },
      // --- Left pane cycle backward ---
      {
        id: 'pane-cycle-back',
        key: 'mod+[',
        description: 'Previous left pane view',
        category: 'panes',
        handler: () => {
          const s = stateRef.current;
          if (!s.paneExpanded) {
            dispatch({ type: 'PANE_EXPANDED' });
            return;
          }
          dispatch({
            type: 'PANE_VIEW_CHANGED',
            payload: { to: nextPaneView(s.paneView, s.txEligible, -1) },
          });
        },
      },
      // --- Overview cycle forward ---
      {
        id: 'overview-cycle-fwd',
        key: 'mod+shift+]',
        description: 'Next overview tab',
        category: 'panes',
        handler: () => {
          const s = stateRef.current;
          if (!s.overviewExpanded) {
            dispatch({ type: 'OVERVIEW_EXPANDED' });
            return;
          }
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('ehr:cycle-overview-tab', { detail: { direction: 1 } }));
          }
        },
      },
      // --- Overview cycle backward ---
      {
        id: 'overview-cycle-back',
        key: 'mod+shift+[',
        description: 'Previous overview tab',
        category: 'panes',
        handler: () => {
          const s = stateRef.current;
          if (!s.overviewExpanded) {
            dispatch({ type: 'OVERVIEW_EXPANDED' });
            return;
          }
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('ehr:cycle-overview-tab', { detail: { direction: -1 } }));
          }
        },
      },
    ];

    shortcuts.forEach((s) => shortcutManager.register(s));
    return () => {
      shortcuts.forEach((s) => shortcutManager.unregister(s.id));
    };
  }, [dispatch]);
}
