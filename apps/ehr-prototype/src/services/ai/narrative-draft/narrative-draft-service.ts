/**
 * Narrative Draft Service — stub interface for AI-generated narrative drafts.
 *
 * What: Defines the contract for generating narrative chart sections (HPI, Plan,
 *   Instructions) from encounter context.
 * Why: Separated from entity extraction because narrative generation requires
 *   LLM summarization rather than regex extraction. This stub establishes the
 *   interface so mock templates and UI can be built against it.
 * When to wire: When an LLM endpoint is available for encounter summarization.
 */

import type { ItemCategory } from '../../../types/chart-items';

// ============================================================================
// Types
// ============================================================================

export type NarrativeCategory = Extract<ItemCategory, 'hpi' | 'plan' | 'instruction'>;

export interface NarrativeDraftRequest {
  category: NarrativeCategory;
  encounterContext: {
    encounterId: string;
    patientId: string;
    transcriptSegments?: string[];
    existingItems?: Array<{ category: string; displayText: string }>;
  };
}

export interface NarrativeDraftResult {
  text: string;
  confidence: number;
  reasoning: string;
}

// ============================================================================
// Service
// ============================================================================

/** Placeholder -- would call LLM in production */
export async function generateNarrativeDraft(
  _request: NarrativeDraftRequest,
): Promise<NarrativeDraftResult> {
  // TODO: Wire to LLM endpoint
  throw new Error('Narrative draft generation not yet implemented');
}
