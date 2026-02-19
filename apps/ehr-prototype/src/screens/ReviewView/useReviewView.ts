/**
 * useReviewView Hook
 *
 * Orchestration hook for the Review view — follows the useCaptureView pattern.
 * Provides: item selection/edit, section completeness, safety alerts,
 * scoped add, sign-off blockers, and mode switching.
 */

import { useCallback, useState, useMemo } from 'react';
import type { ChartItem, ItemCategory } from '../../types';
import type { Mode } from '../../state/types';
import type { SafetyAlert } from '../../services/safety/types';
import type { SignOffBlocker } from './SignOffSection';
import { useNavigation } from '../../navigation/NavigationContext';
import {
  useEncounterState,
  useDispatch,
  useChartItems,
  useOpenCareGaps,
  usePendingTasks,
  useItemsRequiringReview,
  useDiagnoses,
  useItemActions,
  useSafetyAlerts,
} from '../../hooks';
import { useStore } from '../../hooks/useEncounterState';
import { selectItem } from '../../state/selectors/entities';
import { selectCriticalUnacknowledgedAlerts } from '../../state/selectors/safety';

// ============================================================================
// Types
// ============================================================================

export type SectionStatus = 'documented' | 'incomplete' | 'not-documented';

export interface ReviewSectionConfig {
  id: string;
  title: string;
  categories: ItemCategory[];
}

export interface UseReviewViewResult {
  /** Grouped items by section */
  itemsBySection: Record<string, ChartItem[]>;
  /** Section completeness statuses */
  sectionStatuses: Record<string, SectionStatus>;
  /** Currently selected item ID (opens DetailsPane) */
  selectedItemId: string | null;
  /** Currently selected item (for DetailsPane) */
  selectedItem: ChartItem | null;
  /** Category for scoped add (set by "+Add" on empty section) */
  scopedAddCategory: ItemCategory | null;
  /** All safety alerts */
  safetyAlerts: SafetyAlert[];
  /** Sign-off blockers */
  signOffBlockers: SignOffBlocker[];
  /** Whether sign-off is in progress */
  isSigningOff: boolean;

  // Actions
  handleItemEdit: (itemId: string) => void;
  handleItemUpdate: (itemId: string, changes: Partial<ChartItem>) => void;
  handleItemRemove: (itemId: string) => void;
  handleCloseDetailsPane: () => void;
  handleScopedAdd: (category: ItemCategory) => void;
  handleCancelScopedAdd: () => void;
  handleSignOff: () => void;
  handleModeChange: (mode: Mode) => void;
  acknowledgeAlert: (alertId: string, itemId: string) => void;
}

// ============================================================================
// Section Config
// ============================================================================

export const REVIEW_SECTIONS: ReviewSectionConfig[] = [
  { id: 'cc-hpi', title: 'Chief Complaint / HPI', categories: ['chief-complaint', 'hpi'] },
  { id: 'ros', title: 'Review of Systems', categories: ['ros'] },
  { id: 'pe', title: 'Physical Exam', categories: ['physical-exam'] },
  { id: 'vitals', title: 'Vitals', categories: ['vitals'] },
  { id: 'assessment', title: 'Assessment', categories: ['diagnosis'] },
  { id: 'plan', title: 'Plan', categories: ['medication', 'lab', 'imaging', 'referral', 'procedure', 'instruction'] },
  { id: 'note', title: 'Visit Note', categories: ['note'] },
];

// ============================================================================
// Hook
// ============================================================================

export function useReviewView(): UseReviewViewResult {
  const state = useEncounterState();
  const dispatch = useDispatch();
  const store = useStore();
  const { setMode: setNavigationMode } = useNavigation();
  const allItems = useChartItems();
  const openCareGaps = useOpenCareGaps();
  const pendingTasks = usePendingTasks();
  const itemsRequiringReview = useItemsRequiringReview();
  const diagnoses = useDiagnoses();
  const { updateItem, deleteItem } = useItemActions();
  const { alerts: safetyAlerts, acknowledgeAlert } = useSafetyAlerts();

  // Local state
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isSigningOff, setIsSigningOff] = useState(false);
  const [scopedAddCategory, setScopedAddCategory] = useState<ItemCategory | null>(null);

  // Group items by section
  const itemsBySection = useMemo(() => {
    const grouped: Record<string, ChartItem[]> = {};
    for (const section of REVIEW_SECTIONS) {
      grouped[section.id] = allItems.filter((item) =>
        section.categories.includes(item.category)
      );
    }
    return grouped;
  }, [allItems]);

  // Compute section statuses
  const sectionStatuses = useMemo(() => {
    const statuses: Record<string, SectionStatus> = {};
    for (const section of REVIEW_SECTIONS) {
      const items = itemsBySection[section.id];
      if (items.length === 0) {
        statuses[section.id] = 'not-documented';
      } else if (items.some(i => i.status === 'pending-review' || i.status === 'draft')) {
        statuses[section.id] = 'incomplete';
      } else {
        statuses[section.id] = 'documented';
      }
    }
    return statuses;
  }, [itemsBySection]);

  // Selected item object
  const selectedItem = useMemo(() => {
    if (!selectedItemId) return null;
    return state.entities.items[selectedItemId] ?? null;
  }, [selectedItemId, state.entities.items]);

  // Sign-off blockers
  const signOffBlockers = useMemo((): SignOffBlocker[] => {
    const blockers: SignOffBlocker[] = [];

    // Unreviewed AI content
    if (itemsRequiringReview.length > 0) {
      blockers.push({
        type: 'unreviewed-ai',
        message: `${itemsRequiringReview.length} AI-generated item${itemsRequiringReview.length !== 1 ? 's' : ''} require${itemsRequiringReview.length === 1 ? 's' : ''} review`,
        severity: 'error',
      });
    }

    // Pending tasks
    if (pendingTasks.length > 0) {
      blockers.push({
        type: 'pending-task',
        message: `${pendingTasks.length} task${pendingTasks.length !== 1 ? 's' : ''} still pending`,
        severity: 'error',
      });
    }

    // Critical unacknowledged safety alerts
    const criticalAlerts = selectCriticalUnacknowledgedAlerts(state);
    if (criticalAlerts.length > 0) {
      blockers.push({
        type: 'safety-critical',
        message: `${criticalAlerts.length} critical safety alert${criticalAlerts.length !== 1 ? 's' : ''} require acknowledgment`,
        severity: 'error',
      });
    }

    // Missing diagnosis
    if (diagnoses.length === 0) {
      blockers.push({
        type: 'missing-dx',
        message: 'No diagnosis documented',
        severity: 'warning',
      });
    }

    // Missing visit note
    if (allItems.filter((i) => i.category === 'note').length === 0) {
      blockers.push({
        type: 'missing-note',
        message: 'No visit note generated',
        severity: 'warning',
      });
    }

    // Incomplete items
    const incompleteItems = allItems.filter(
      (item) => item.status === 'pending-review'
    );
    if (incompleteItems.length > 0) {
      blockers.push({
        type: 'incomplete-item',
        message: `${incompleteItems.length} item${incompleteItems.length !== 1 ? 's' : ''} pending review`,
        severity: 'warning',
      });
    }

    return blockers;
  }, [itemsRequiringReview, pendingTasks, diagnoses, allItems, state]);

  // ── Actions ──

  const handleItemEdit = useCallback((itemId: string) => {
    setSelectedItemId(itemId);

    // If the item is unreviewed (MA handoff), auto-mark as reviewed
    const currentState = store.getState();
    const item = selectItem(currentState, itemId);
    if (item && !item._meta.reviewed) {
      dispatch({
        type: 'ITEM_UPDATED',
        payload: {
          id: itemId,
          changes: {
            _meta: { ...item._meta, reviewed: true },
          } as Record<string, unknown>,
          reason: 'user-edit',
          actor: 'Provider',
        },
      });
    }
  }, [store, dispatch]);

  const handleItemUpdate = useCallback((itemId: string, changes: Partial<ChartItem>) => {
    updateItem(itemId, changes);
  }, [updateItem]);

  const handleItemRemove = useCallback((itemId: string) => {
    deleteItem(itemId);
    setSelectedItemId(null);
  }, [deleteItem]);

  const handleCloseDetailsPane = useCallback(() => {
    setSelectedItemId(null);
  }, []);

  const handleScopedAdd = useCallback((category: ItemCategory) => {
    setScopedAddCategory(category);
  }, []);

  const handleCancelScopedAdd = useCallback(() => {
    setScopedAddCategory(null);
  }, []);

  const handleSignOff = useCallback(async () => {
    setIsSigningOff(true);
    try {
      dispatch({
        type: 'ENCOUNTER_SIGNED',
        payload: { signedAt: new Date() },
      });
    } catch (error) {
      console.error('Sign-off failed:', error);
    } finally {
      setIsSigningOff(false);
    }
  }, [dispatch]);

  const handleModeChange = useCallback((mode: Mode) => {
    dispatch({
      type: 'MODE_CHANGED',
      payload: { to: mode, trigger: 'user' },
    });
    setNavigationMode(mode);
  }, [dispatch, setNavigationMode]);

  return {
    itemsBySection,
    sectionStatuses,
    selectedItemId,
    selectedItem,
    scopedAddCategory,
    safetyAlerts,
    signOffBlockers,
    isSigningOff,
    handleItemEdit,
    handleItemUpdate,
    handleItemRemove,
    handleCloseDetailsPane,
    handleScopedAdd,
    handleCancelScopedAdd,
    handleSignOff,
    handleModeChange,
    acknowledgeAlert,
  };
}
