/**
 * Suggestion and background task types
 */

import type { Priority } from './common';
import type { ChartItem, ItemCategory } from './chart-items';

// ============================================================================
// Suggestions
// ============================================================================

/** Suggestion types */
export type SuggestionType =
  | 'chart-item'        // Suggests adding a new chart item
  | 'dx-association'    // Suggests linking item to diagnosis
  | 'correction'        // Suggests correcting existing item
  | 'care-gap-action'   // Suggests action to close care gap
  | 'follow-up';        // Suggests follow-up action

/** Suggestion status */
export type SuggestionStatus =
  | 'active'            // Visible, can be acted on
  | 'accepted'          // User accepted
  | 'accepted-modified' // User accepted with changes
  | 'dismissed'         // User explicitly dismissed
  | 'expired'           // TTL exceeded
  | 'superseded';       // Replaced by newer suggestion

/** Suggestion source */
export type SuggestionSource =
  | 'transcription'     // From speech-to-text + entity extraction
  | 'ai-analysis'       // From AI analyzing chart context
  | 'care-gap'          // From care gap engine
  | 'cds'               // Clinical Decision Support rules
  | 'import';           // From external system data

/** Diagnosis suggestion for dx-association */
export interface DiagnosisSuggestion {
  description: string;
  icdCode: string;
  confidence: number;
  reasoning?: string;
}

/** Suggestion content discriminated union */
export type SuggestionContent =
  | {
      type: 'new-item';
      itemTemplate: Partial<ChartItem>;
      category: ItemCategory;
    }
  | {
      type: 'dx-link';
      targetItemId: string;
      suggestedDx: DiagnosisSuggestion[];
    }
  | {
      type: 'correction';
      targetItemId: string;
      field: string;
      currentValue: unknown;
      suggestedValue: unknown;
    }
  | {
      type: 'care-gap-action';
      careGapId: string;
      actionTemplate: Partial<ChartItem>;
    };

/** Suggestion entity */
export interface Suggestion {
  id: string;
  type: SuggestionType;
  status: SuggestionStatus;

  content: SuggestionContent;

  source: SuggestionSource;
  relatedItemId?: string;      // If suggestion relates to existing item
  sourceSegmentId?: string;    // If from transcription

  confidence: number;          // 0-1
  reasoning?: string;          // Why AI suggested this

  createdAt: Date;
  expiresAt?: Date;            // TTL for ephemeral suggestions
  actedAt?: Date;              // When accepted/dismissed

  displayText: string;
  displaySubtext?: string;
  /** Definitive short label for actions (e.g., "CBC" instead of "Order CBC with differential") */
  actionLabel?: string;
}

// ============================================================================
// Background Tasks
// ============================================================================

/** Task types */
export type TaskType =
  | 'dx-association'      // Link item to diagnosis
  | 'drug-interaction'    // Check for interactions
  | 'formulary-check'     // Check insurance coverage
  | 'prior-auth-check'    // Check auth requirements
  | 'note-generation'     // Generate visit note
  | 'care-gap-evaluation' // Evaluate care gap closure
  | 'lab-send'            // Send lab order
  | 'rx-send'             // E-prescribe medication
  | 'validation';         // Validate item data

/** Task status */
export type TaskStatus =
  | 'queued'          // Waiting to start
  | 'processing'      // Currently running
  | 'pending-review'  // Complete, needs user action
  | 'ready'           // Ready to send/finalize
  | 'completed'       // Successfully finished
  | 'failed'          // Error occurred
  | 'cancelled';      // User cancelled

/** Task priority */
export type TaskPriority = Priority;

/** Background task entity */
export interface BackgroundTask {
  id: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  
  // What triggered this task
  trigger: {
    action: string;           // Action type that triggered
    itemId?: string;          // Related item
  };
  
  // Result
  result?: unknown;           // Type depends on task type
  error?: string;
  
  // Progress
  progress?: number;          // 0-100
  progressMessage?: string;
  
  // Lifecycle
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  
  // For UI
  displayTitle: string;
  displayStatus: string;
}

// ============================================================================
// Task Result Types
// ============================================================================

/** Dx association task result */
export interface DxAssociationResult {
  suggestions: {
    dxId: string;
    description: string;
    icdCode: string;
    confidence: number;
    reasoning: string;
  }[];
  autoLinked?: string;  // If confidence high enough, auto-linked this Dx
}

/** Drug interaction task result */
export interface DrugInteractionResult {
  interactions: {
    drug1: string;
    drug2: string;
    severity: 'mild' | 'moderate' | 'severe';
    description: string;
    recommendation: string;
  }[];
}

/** Formulary check task result */
export interface FormularyCheckResult {
  covered: boolean;
  tier?: number;
  copay?: number;
  alternatives?: {
    drugName: string;
    tier: number;
    copay: number;
  }[];
  priorAuthRequired: boolean;
}

/** Note generation task result */
export interface NoteGenerationResult {
  text: string;
  format: 'plain' | 'structured';
  confidence: number;
  sections: {
    name: string;
    content: string;
  }[];
}

// ============================================================================
// Alerts
// ============================================================================

/** Alert action */
export interface AlertAction {
  label: string;
  action: string;  // Action type to dispatch
  payload?: unknown;
  style: 'primary' | 'secondary' | 'danger';
}

/** Alert entity */
export interface Alert {
  id: string;
  taskId: string;
  severity: 'info' | 'warning' | 'critical';
  
  title: string;
  message: string;
  
  actions: AlertAction[];
  requiresAcknowledgment: boolean;
  
  createdAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: import('./common').UserReference;
}
