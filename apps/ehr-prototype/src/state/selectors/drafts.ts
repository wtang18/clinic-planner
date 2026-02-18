/**
 * Draft Selectors
 *
 * Primitive and derived selectors for AI drafts.
 */

import type { EncounterState } from '../types';
import type { AIDraft, DraftStatus } from '../../types/drafts';
import type { ItemCategory } from '../../types/chart-items';

// ============================================================================
// Primitive Selectors
// ============================================================================

/** Select a single draft by ID */
export const selectDraft = (
  state: EncounterState,
  id: string
): AIDraft | undefined => state.entities.drafts[id];

/** Select all drafts */
export const selectAllDrafts = (state: EncounterState): AIDraft[] =>
  Object.values(state.entities.drafts);

/** Select draft IDs */
export const selectDraftIds = (state: EncounterState): string[] =>
  Object.keys(state.entities.drafts);

// ============================================================================
// Derived Selectors
// ============================================================================

/** Select drafts by status */
export const selectDraftsByStatus = (
  state: EncounterState,
  status: DraftStatus
): AIDraft[] => selectAllDrafts(state).filter(d => d.status === status);

/** Select pending drafts (ready for review) */
export const selectPendingDrafts = (state: EncounterState): AIDraft[] =>
  selectDraftsByStatus(state, 'pending');

/** Select generating drafts (still being produced) */
export const selectGeneratingDrafts = (state: EncounterState): AIDraft[] =>
  selectDraftsByStatus(state, 'generating');

/** Select drafts by category */
export const selectDraftsByCategory = (
  state: EncounterState,
  category: ItemCategory
): AIDraft[] => selectAllDrafts(state).filter(d => d.category === category);

/** Count of pending drafts */
export const selectPendingDraftCount = (state: EncounterState): number =>
  selectPendingDrafts(state).length;

/** Select active drafts (pending or generating — visible in the rail) */
export const selectActiveDrafts = (state: EncounterState): AIDraft[] =>
  selectAllDrafts(state).filter(d => d.status === 'pending' || d.status === 'generating');

/** Check if a draft exists for a given category (prevents duplicate generation) */
export const selectHasDraftForCategory = (
  state: EncounterState,
  category: ItemCategory
): boolean =>
  selectAllDrafts(state).some(
    d => d.category === category && (d.status === 'pending' || d.status === 'generating')
  );
