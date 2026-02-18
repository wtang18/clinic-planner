/**
 * AI Draft Types
 *
 * Types for the AI draft system — narrative content generated progressively
 * during the encounter and presented in the Processing Rail for provider review.
 *
 * AI Drafts are separate from ChartItems until accepted. Once accepted, they
 * are promoted to full ChartItems with source: { type: 'aiDraft', draftId }.
 */

import type { ItemCategory } from './chart-items';

// ============================================================================
// Draft Status
// ============================================================================

/** Draft lifecycle status */
export type DraftStatus =
  | 'generating'  // AI is actively producing content
  | 'pending'     // Content ready, awaiting provider review
  | 'accepted'    // Provider accepted, promoted to chart item
  | 'dismissed';  // Provider dismissed

// ============================================================================
// AI Draft Entity
// ============================================================================

/** An AI-generated narrative draft awaiting provider review */
export interface AIDraft {
  id: string;
  /** Note section this draft belongs to */
  category: ItemCategory;
  /** Full narrative text */
  content: string;
  /** Current lifecycle status */
  status: DraftStatus;
  /** When the content was generated */
  generatedAt: Date;
  /** How the content was produced */
  source: 'ambient-recording';
  /** If this draft updates existing MA-documented content, reference the original item */
  enrichesItemId?: string;
  /** Display label: "HPI Draft" or "Updated HPI" (when enriching) */
  label: string;
  /** AI confidence score (0-1) */
  confidence?: number;
}

// ============================================================================
// Batch Types
// ============================================================================

/** Operational batch types for the Processing Rail */
export type BatchType =
  | 'ai-drafts'
  | 'prescriptions'
  | 'labs'
  | 'imaging'
  | 'referrals';

/** Aggregate status for a batch */
export type BatchAggregateStatus =
  | 'idle'
  | 'needs-attention'
  | 'in-progress'
  | 'complete';

/** A unified batch item — wraps either a task or a draft for the rail UI */
export type BatchItem =
  | { kind: 'task'; taskId: string; label: string; status: string }
  | { kind: 'draft'; draftId: string; label: string; preview: string; status: DraftStatus };

/** Summary of a single batch for the Processing Rail */
export interface BatchSummary {
  type: BatchType;
  label: string;
  items: BatchItem[];
  aggregateStatus: BatchAggregateStatus;
  count: number;
}
