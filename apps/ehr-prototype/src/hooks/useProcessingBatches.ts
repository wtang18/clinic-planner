/**
 * useProcessingBatches Hook
 *
 * Provides batch summaries for the Processing Rail.
 */

import type { BatchSummary } from '../types/drafts';
import {
  selectProcessingBatches,
  selectNonEmptyBatches,
  selectTotalNeedsAttentionCount,
} from '../state/selectors/batches';
import { useSelector } from './useEncounterState';

/** Get all processing batches (including empty ones) */
export function useProcessingBatches(): BatchSummary[] {
  return useSelector(selectProcessingBatches);
}

/** Get only non-empty batches */
export function useNonEmptyBatches(): BatchSummary[] {
  return useSelector(selectNonEmptyBatches);
}

/** Get total count of items needing attention */
export function useTotalNeedsAttentionCount(): number {
  return useSelector(selectTotalNeedsAttentionCount);
}
