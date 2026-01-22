/**
 * useCareGaps Hooks
 *
 * Hooks for accessing and managing care gaps.
 */

import React from 'react';
import type { CareGapInstance, CareGapCategory, CareGapExclusionReason } from '../types';
import {
  selectAllCareGaps,
  selectCareGap,
} from '../state/selectors/entities';
import {
  selectOpenCareGaps,
  selectPendingCareGaps,
  selectCareGapsByCategory,
  selectCareGapsAddressedThisEncounter,
  selectOverdueCareGaps,
} from '../state/selectors/derived';
import {
  careGapAddressed,
  careGapExcluded,
} from '../state/actions/creators';
import { useSelector, useDispatch } from './useEncounterState';

// ============================================================================
// Basic Care Gap Hooks
// ============================================================================

/**
 * Get all care gaps
 */
export function useCareGaps(): CareGapInstance[] {
  return useSelector(selectAllCareGaps);
}

/**
 * Get a single care gap by ID
 */
export function useCareGap(id: string): CareGapInstance | undefined {
  return useSelector((state) => selectCareGap(state, id));
}

/**
 * Get open care gaps
 */
export function useOpenCareGaps(): CareGapInstance[] {
  return useSelector(selectOpenCareGaps);
}

/**
 * Get pending care gaps (action taken, awaiting confirmation)
 */
export function usePendingCareGaps(): CareGapInstance[] {
  return useSelector(selectPendingCareGaps);
}

/**
 * Get care gaps by category
 */
export function useCareGapsByCategory(category: CareGapCategory): CareGapInstance[] {
  return useSelector((state) => selectCareGapsByCategory(state, category));
}

/**
 * Get care gaps addressed this encounter
 */
export function useCareGapsAddressedThisEncounter(): CareGapInstance[] {
  return useSelector(selectCareGapsAddressedThisEncounter);
}

/**
 * Get overdue care gaps
 */
export function useOverdueCareGaps(): CareGapInstance[] {
  return useSelector(selectOverdueCareGaps);
}

// ============================================================================
// Care Gap Actions
// ============================================================================

export interface CareGapActions {
  /** Address a care gap with a chart item */
  addressGap: (gapId: string, itemId: string) => void;
  /** Exclude a gap from tracking */
  excludeGap: (gapId: string, reason: CareGapExclusionReason) => void;
}

/**
 * Get actions for managing care gaps
 */
export function useCareGapActions(): CareGapActions {
  const dispatch = useDispatch();

  return React.useMemo(
    () => ({
      addressGap: (gapId: string, itemId: string) => {
        dispatch(careGapAddressed(gapId, itemId, 'pending'));
      },

      excludeGap: (gapId: string, reason: CareGapExclusionReason) => {
        dispatch(careGapExcluded(gapId, reason));
      },
    }),
    [dispatch]
  );
}

// ============================================================================
// Combined Hook
// ============================================================================

/**
 * Combined hook for care gaps and actions
 */
export function useCareGapsWithActions(): {
  careGaps: CareGapInstance[];
  openGaps: CareGapInstance[];
  actions: CareGapActions;
} {
  const careGaps = useCareGaps();
  const openGaps = useOpenCareGaps();
  const actions = useCareGapActions();

  return { careGaps, openGaps, actions };
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Get count of open care gaps
 */
export function useOpenCareGapCount(): number {
  return useSelector((state) => selectOpenCareGaps(state).length);
}

/**
 * Get count of overdue care gaps
 */
export function useOverdueCareGapCount(): number {
  return useSelector((state) => selectOverdueCareGaps(state).length);
}

/**
 * Get care gaps grouped by priority
 */
export function useCareGapsGroupedByPriority(): {
  critical: CareGapInstance[];
  important: CareGapInstance[];
  routine: CareGapInstance[];
} {
  return useSelector((state) => {
    const gaps = selectOpenCareGaps(state);
    const grouped = {
      critical: [] as CareGapInstance[],
      important: [] as CareGapInstance[],
      routine: [] as CareGapInstance[],
    };

    for (const gap of gaps) {
      const priority = gap._display.priority;
      grouped[priority].push(gap);
    }

    return grouped;
  });
}

/**
 * Get care gaps grouped by category
 */
export function useCareGapsGroupedByCategory(): Record<CareGapCategory, CareGapInstance[]> {
  return useSelector((state) => {
    const gaps = selectOpenCareGaps(state);
    const grouped: Partial<Record<CareGapCategory, CareGapInstance[]>> = {};

    for (const gap of gaps) {
      const category = gap._display.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category]!.push(gap);
    }

    return grouped as Record<CareGapCategory, CareGapInstance[]>;
  });
}

/**
 * Get care gap priority breakdown (for summary display)
 */
export function useCareGapPriorityBreakdown(): {
  critical: number;
  important: number;
  routine: number;
  total: number;
} {
  return useSelector((state) => {
    const gaps = selectOpenCareGaps(state);
    const breakdown = {
      critical: 0,
      important: 0,
      routine: 0,
      total: gaps.length,
    };

    for (const gap of gaps) {
      const priority = gap._display.priority;
      breakdown[priority]++;
    }

    return breakdown;
  });
}

/**
 * Check if there are any critical care gaps
 */
export function useHasCriticalCareGaps(): boolean {
  return useSelector((state) => {
    const gaps = selectOpenCareGaps(state);
    return gaps.some((gap) => gap._display.priority === 'critical');
  });
}

/**
 * Get care gaps that can be addressed by a specific item category
 */
export function useCareGapsForItemCategory(
  itemCategory: 'lab' | 'imaging' | 'immunization' | 'procedure' | 'medication'
): CareGapInstance[] {
  return useSelector((state) => {
    const gaps = selectOpenCareGaps(state);
    // This is a simplified mapping - in practice would be more sophisticated
    const categoryToGapCategories: Record<string, CareGapCategory[]> = {
      lab: ['diabetes', 'chronic-disease', 'preventive'],
      imaging: ['cancer-screening'],
      immunization: ['immunization', 'pediatric'],
      procedure: ['womens-health', 'cancer-screening'],
      medication: ['diabetes', 'hypertension', 'chronic-disease'],
    };

    const relevantCategories = categoryToGapCategories[itemCategory] || [];
    return gaps.filter((gap) =>
      relevantCategories.includes(gap._display.category)
    );
  });
}

/**
 * Check if a specific gap can be addressed this encounter
 */
export function useCanAddressGap(gapId: string): boolean {
  return useSelector((state) => {
    const gap = selectCareGap(state, gapId);
    if (!gap) return false;

    // Can address if open and not already addressed this encounter
    return gap.status === 'open' && !gap.addressedThisEncounter;
  });
}
