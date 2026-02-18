/**
 * Activity Log Utilities
 *
 * Pure functions for creating, formatting, and describing activity log entries.
 * Used by the reducer to auto-append entries on item mutations.
 */

import type { ActivityLogEntry } from '../types/chart-items';

// ============================================================================
// Entry Creation
// ============================================================================

/**
 * Create an activity log entry with the current timestamp.
 */
export function createLogEntry(
  action: string,
  actor: string,
  details?: string
): ActivityLogEntry {
  return {
    timestamp: new Date(),
    action,
    actor,
    ...(details !== undefined && { details }),
  };
}

// ============================================================================
// Timestamp Formatting
// ============================================================================

/**
 * Format a Date to the compact clinical timestamp: "10:02a", "2:15p".
 * Uses 12-hour format without leading zero, lowercase am/pm abbreviated to a/p.
 */
export function formatLogTimestamp(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours < 12 ? 'a' : 'p';
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHour}:${displayMinutes}${period}`;
}

// ============================================================================
// Field Change Description
// ============================================================================

/** Fields to skip when generating change descriptions */
const SKIP_FIELDS = new Set([
  'modifiedAt',
  'modifiedBy',
  'activityLog',
  '_meta',
]);

/** Default human-readable labels for common fields */
const DEFAULT_LABELS: Record<string, string> = {
  displayText: 'name',
  displaySubtext: 'description',
  drugName: 'drug name',
  dosage: 'dosage',
  route: 'route',
  frequency: 'frequency',
  sig: 'sig',
  daw: 'DAW',
  quantity: 'quantity',
  refills: 'refills',
  duration: 'duration',
  testName: 'test name',
  priority: 'priority',
  collectionType: 'collection type',
  fastingRequired: 'fasting required',
  specialInstructions: 'special instructions',
  icdCode: 'ICD-10 code',
  clinicalStatus: 'clinical status',
  status: 'status',
};

/**
 * Describe field-level changes between an existing item and incoming changes.
 * Returns a human-readable string like "Changed dosage from '100mg' to '200mg'".
 *
 * @param existing - The current field values (can be a flat item or nested data object)
 * @param changes - The incoming changes (same shape as existing)
 * @param labelMap - Optional override for field labels
 */
export function describeFieldChanges(
  existing: Record<string, unknown>,
  changes: Record<string, unknown>,
  labelMap?: Record<string, string>
): string {
  const labels = { ...DEFAULT_LABELS, ...labelMap };
  const descriptions: string[] = [];

  for (const key of Object.keys(changes)) {
    if (SKIP_FIELDS.has(key)) continue;

    const oldVal = existing[key];
    const newVal = changes[key];

    // Skip unchanged values
    if (oldVal === newVal) continue;

    // Skip objects/arrays (handle nested `data` separately)
    if (typeof newVal === 'object' && newVal !== null && !Array.isArray(newVal)) {
      // Recurse into nested `data` object
      if (key === 'data' && typeof oldVal === 'object' && oldVal !== null) {
        const nested = describeFieldChanges(
          oldVal as Record<string, unknown>,
          newVal as Record<string, unknown>,
          labelMap
        );
        if (nested) descriptions.push(nested);
      }
      continue;
    }

    const label = labels[key] || key;
    const formatVal = (v: unknown): string => {
      if (v === undefined || v === null) return 'none';
      if (typeof v === 'boolean') return v ? 'yes' : 'no';
      return String(v);
    };

    descriptions.push(
      `Changed ${label} from '${formatVal(oldVal)}' to '${formatVal(newVal)}'`
    );
  }

  return descriptions.join(', ');
}
