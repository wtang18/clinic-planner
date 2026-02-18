/**
 * Safety Selectors
 *
 * Compute safety alerts from current state. Alerts are ephemeral —
 * recomputed on each selector call (no persistence).
 *
 * Checks: allergy conflicts, drug interactions (via findInteractions),
 * duplicate items, and dosage ranges.
 */

import type { EncounterState } from '../types';
import type { SafetyAlert } from '../../services/safety/types';
import type { MedicationItem } from '../../types/chart-items';
import { selectAllItems } from './entities';
import { checkAllergyConflicts } from '../../services/safety/allergy-checker';
import { checkDuplicates } from '../../services/safety/duplicate-detector';
import { checkDosageRange } from '../../services/safety/dosage-checker';
import { findInteractions, normalizeDrugName } from '../../services/ai/drug-interaction/interaction-checker';

// ============================================================================
// Selectors
// ============================================================================

/**
 * Compute all safety alerts for the current encounter state.
 */
export function selectSafetyAlerts(state: EncounterState): SafetyAlert[] {
  const allItems = selectAllItems(state);
  const allergies = state.context.patient?.clinicalSummary?.allergies ?? [];
  const alerts: SafetyAlert[] = [];

  const medications = allItems.filter(
    (i): i is MedicationItem => i.category === 'medication' && i.status !== 'cancelled'
  );

  for (const item of allItems) {
    // Skip cancelled items
    if (item.status === 'cancelled') continue;

    // 1. Duplicate detection (all categories)
    const dupAlert = checkDuplicates(item, allItems);
    if (dupAlert) {
      alerts.push(markIfAcknowledged(dupAlert, item.activityLog));
    }

    // Medication-specific checks
    if (item.category === 'medication') {
      const med = item as MedicationItem;

      // 2. Allergy conflicts
      const allergyAlerts = checkAllergyConflicts(
        med.data.drugName,
        allergies,
        med.id,
      );
      for (const alert of allergyAlerts) {
        alerts.push(markIfAcknowledged(alert, med.activityLog));
      }

      // 3. Drug interactions (synchronous findInteractions)
      for (const otherMed of medications) {
        if (otherMed.id === med.id) continue;
        // Only check each pair once (compare IDs to avoid duplication)
        if (otherMed.id < med.id) continue;

        const interaction = findInteractions(
          normalizeDrugName(med.data.drugName),
          normalizeDrugName(otherMed.data.drugName),
        );

        if (interaction) {
          const severity = interaction.severity === 'contraindicated' || interaction.severity === 'severe'
            ? 'critical' as const
            : interaction.severity === 'moderate'
              ? 'warning' as const
              : 'info' as const;

          const alert: SafetyAlert = {
            id: `drug-interaction:${med.id}:${otherMed.id}`,
            type: 'drug-interaction',
            severity,
            message: `Drug interaction: ${med.data.drugName} + ${otherMed.data.drugName}`,
            details: `${interaction.description}. ${interaction.recommendation}`,
            relatedItemId: med.id,
            dismissible: severity !== 'critical',
            acknowledged: false,
          };
          alerts.push(markIfAcknowledged(alert, med.activityLog));

          // Also add a reference alert for the other medication
          const otherAlert: SafetyAlert = {
            ...alert,
            id: `drug-interaction:${otherMed.id}:${med.id}`,
            relatedItemId: otherMed.id,
          };
          alerts.push(markIfAcknowledged(otherAlert, otherMed.activityLog));
        }
      }

      // 4. Dosage range
      const dosageAlert = checkDosageRange(med);
      if (dosageAlert) {
        alerts.push(markIfAcknowledged(dosageAlert, med.activityLog));
      }
    }
  }

  return alerts;
}

/**
 * Get safety alerts for a specific item.
 */
export function selectSafetyAlertsForItem(
  state: EncounterState,
  itemId: string,
): SafetyAlert[] {
  return selectSafetyAlerts(state).filter(a => a.relatedItemId === itemId);
}

/**
 * Get only critical unacknowledged alerts (used for sign-off blocking).
 */
export function selectCriticalUnacknowledgedAlerts(
  state: EncounterState,
): SafetyAlert[] {
  return selectSafetyAlerts(state).filter(
    a => a.severity === 'critical' && !a.acknowledged
  );
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Check the item's activity log for an acknowledgment of this alert.
 * Convention: `action === 'safety-acknowledged'` with `details` containing the alert ID.
 */
function markIfAcknowledged(
  alert: SafetyAlert,
  activityLog: { action: string; details?: string }[],
): SafetyAlert {
  const isAcknowledged = activityLog.some(
    entry => entry.action === 'safety-acknowledged' && entry.details?.includes(alert.id)
  );

  return isAcknowledged ? { ...alert, acknowledged: true } : alert;
}
