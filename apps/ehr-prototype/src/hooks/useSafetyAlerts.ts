/**
 * useSafetyAlerts Hook
 *
 * Provides computed safety alerts and an acknowledge action.
 * Acknowledging an alert records in the item's activity log
 * (via ITEM_UPDATED with actor: 'Safety Override').
 */

import { useCallback, useMemo } from 'react';
import { useEncounterState, useDispatch } from './useEncounterState';
import { useStore } from './useEncounterState';
import { selectSafetyAlerts, selectSafetyAlertsForItem } from '../state/selectors/safety';
import type { SafetyAlert } from '../services/safety/types';
import { selectItem } from '../state/selectors/entities';

// ============================================================================
// Types
// ============================================================================

export interface UseSafetyAlertsResult {
  /** All computed safety alerts */
  alerts: SafetyAlert[];
  /** Get alerts for a specific item */
  alertsForItem: (itemId: string) => SafetyAlert[];
  /** Acknowledge a safety alert (records in item's activity log) */
  acknowledgeAlert: (alertId: string, itemId: string) => void;
  /** Whether there are any critical unacknowledged alerts */
  hasCriticalUnacknowledged: boolean;
}

// ============================================================================
// Hook
// ============================================================================

export function useSafetyAlerts(): UseSafetyAlertsResult {
  const state = useEncounterState();
  const dispatch = useDispatch();
  const store = useStore();

  const alerts = useMemo(() => selectSafetyAlerts(state), [state]);

  const alertsForItem = useCallback(
    (itemId: string): SafetyAlert[] => {
      return selectSafetyAlertsForItem(store.getState(), itemId);
    },
    [store]
  );

  const acknowledgeAlert = useCallback(
    (alertId: string, itemId: string) => {
      const currentState = store.getState();
      const item = selectItem(currentState, itemId);
      if (!item) return;

      dispatch({
        type: 'ITEM_UPDATED',
        payload: {
          id: itemId,
          changes: {
            activityLog: [
              ...item.activityLog,
              {
                timestamp: new Date(),
                action: 'safety-acknowledged',
                actor: 'Safety Override',
                details: `Acknowledged alert: ${alertId}`,
              },
            ],
          } as Record<string, unknown>,
          reason: 'user-edit',
          actor: 'Safety Override',
        },
      });
    },
    [store, dispatch]
  );

  const hasCriticalUnacknowledged = useMemo(
    () => alerts.some(a => a.severity === 'critical' && !a.acknowledged),
    [alerts]
  );

  return {
    alerts,
    alertsForItem,
    acknowledgeAlert,
    hasCriticalUnacknowledged,
  };
}
