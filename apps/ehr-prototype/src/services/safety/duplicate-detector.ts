/**
 * Duplicate Detector
 *
 * Detects duplicate chart items within the same category by comparing
 * displayText (case-insensitive). Returns a SafetyAlert if a duplicate
 * is found.
 */

import type { ChartItem } from '../../types/chart-items';
import type { SafetyAlert } from './types';

/**
 * Check if newItem duplicates any item in existingItems (same category, same text).
 */
export function checkDuplicates(
  newItem: ChartItem,
  existingItems: ChartItem[],
): SafetyAlert | null {
  const normalizedText = newItem.displayText.toLowerCase().trim();

  for (const existing of existingItems) {
    // Must be same category
    if (existing.category !== newItem.category) continue;
    // Skip self
    if (existing.id === newItem.id) continue;
    // Skip cancelled items
    if (existing.status === 'cancelled') continue;

    if (existing.displayText.toLowerCase().trim() === normalizedText) {
      return {
        id: `duplicate:${newItem.id}:${existing.id}`,
        type: 'duplicate',
        severity: 'warning',
        message: `Possible duplicate: "${newItem.displayText}" already exists`,
        details: `An item with the same name already exists in ${newItem.category} (ID: ${existing.id})`,
        relatedItemId: newItem.id,
        dismissible: true,
        acknowledged: false,
      };
    }
  }

  return null;
}
