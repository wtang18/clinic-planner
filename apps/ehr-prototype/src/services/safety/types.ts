/**
 * Safety Check Types
 *
 * Types for clinical safety alerts computed by selectors.
 * Alerts are ephemeral (computed, not persisted) to avoid
 * synchronization issues with the chart item state.
 */

// ============================================================================
// Alert Types
// ============================================================================

export type SafetyAlertSeverity = 'info' | 'warning' | 'critical';

export type SafetyAlertType =
  | 'allergy'
  | 'drug-interaction'
  | 'duplicate'
  | 'dosage-range';

export interface SafetyAlert {
  /** Deterministic ID: `{type}:{relatedItemId}:{detail}` */
  id: string;
  /** The kind of safety check that produced this alert */
  type: SafetyAlertType;
  /** Clinical severity */
  severity: SafetyAlertSeverity;
  /** Human-readable summary */
  message: string;
  /** Extended detail (interaction description, dosage range, etc.) */
  details?: string;
  /** The chart item this alert pertains to */
  relatedItemId: string;
  /** Whether the clinician can dismiss/acknowledge this alert */
  dismissible: boolean;
  /** Whether this alert has been acknowledged (tracked via activity log) */
  acknowledged: boolean;
}
