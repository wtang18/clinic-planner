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
  | 'updating'    // Content being refreshed with new transcript data
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
  /** Version number — increments when content is refreshed */
  version?: number;
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
  | 'referrals'
  | 'visit-note'
  | 'charge-nav';

/** Aggregate status for a batch */
export type BatchAggregateStatus =
  | 'idle'
  | 'needs-attention'
  | 'in-progress'
  | 'complete';

/** Per-status counts for a batch, used for inline display in the rail */
export interface StatusBreakdown {
  inProgress: number;
  needsAttention: number;
  complete: number;
}

/** A unified batch item — wraps either a task or a draft for the rail UI */
export type BatchItem =
  | { kind: 'task'; taskId: string; label: string; status: string;
      deepLink?: { mode: 'review' | 'process'; sectionId: string } }
  | { kind: 'draft'; draftId: string; label: string; preview: string; status: DraftStatus;
      deepLink?: { mode: 'review' | 'process'; sectionId: string } };

/** Summary of a single batch for the Processing Rail */
export interface BatchSummary {
  type: BatchType;
  label: string;
  items: BatchItem[];
  aggregateStatus: BatchAggregateStatus;
  statusBreakdown: StatusBreakdown;
  count: number;
}

// ============================================================================
// Unified Rail Types
// ============================================================================

/**
 * Row groups in the unified rail — separated by spacing gaps (no headers).
 * Groups create visual chunking: History, Clinical Reasoning, Orders,
 * Documentation, Closure.
 */
export type RailGroup = 'history' | 'reasoning' | 'orders' | 'documentation' | 'closure';

/**
 * A single row in the unified processing rail.
 *
 * Merges the completeness dimension (left icon: "is this present in the chart?")
 * with the processing dimension (right side: "what's the operational status?")
 * into one scannable row per clinical section/category.
 *
 * Left slot shows either a presence icon (✓/○) for documentation rows,
 * or a chevron (▸/▾) for rows with expandable processing items.
 * Right slot shows item counts, processing status chips, special labels, or "—".
 */
export interface RailRow {
  id: string;
  label: string;
  group: RailGroup;
  /** Left icon: 'present' = ✓ dark, 'not-present' = ○ gray, null = no icon */
  presence: 'present' | 'not-present' | null;
  /** Number of documented items (shown on right for documentation rows) */
  itemCount: number;
  /** Processing status for order/processing rows (null = no processing dimension) */
  processing: {
    chips: StatusBreakdown;
    items: BatchItem[];
  } | null;
  /** Navigation target on row tap */
  deepLink: { mode: 'review' | 'process'; sectionId: string };
  /** Special right-side label (e.g., "99214" for Charge Nav) */
  specialLabel?: string;
  /** Sign-off blocker count */
  blockerCount?: number;
}
