/**
 * View-specific composed selectors
 */

import type { EncounterState, Mode } from '../types';
import type {
  ChartItem,
  ItemCategory,
  Suggestion,
  BackgroundTask,
  CareGapInstance,
  TranscriptionStatus,
  SyncStatus,
  PatientContext,
  EncounterMeta,
  DiagnosisItem,
  MedicationItem,
  AllergyItem,
} from '../../types';
import type { AIDraft } from '../../types';
import {
  selectAllItems,
  selectAllCareGaps,
} from './entities';
import {
  selectActiveSuggestions,
  selectTasksByStatus,
  selectOpenCareGaps,
  selectDiagnoses,
  selectMedications,
  selectAllergies,
  selectItemsGroupedByCategory,
} from './derived';
import {
  selectProcessViewBatches,
  selectProcessViewDrafts,
  selectCompletenessChecklist,
  selectMockEMLevel,
  selectOutstandingItemCount,
} from './process-view';
import type {
  ProcessBatch,
  ChecklistItem,
  EMLevel,
} from './process-view';

// ============================================================================
// Capture View
// ============================================================================

export interface CaptureViewData {
  items: ChartItem[];
  activeSuggestions: Suggestion[];
  transcriptionStatus: TranscriptionStatus;
  pendingTaskCount: number;
  mode: Mode;
}

/**
 * Select data for the capture view
 */
export const selectCaptureViewData = (state: EncounterState): CaptureViewData => ({
  items: selectAllItems(state),
  activeSuggestions: selectActiveSuggestions(state),
  transcriptionStatus: state.session.transcription.status,
  pendingTaskCount: selectTasksByStatus(state, 'pending-review').length,
  mode: state.session.mode,
});

// ============================================================================
// Task Pane
// ============================================================================

export interface TaskPaneData {
  readyToSend: BackgroundTask[];
  needsReview: BackgroundTask[];
  processing: BackgroundTask[];
  completed: BackgroundTask[];
  failed: BackgroundTask[];
}

/**
 * Select data for the task pane
 */
export const selectTaskPaneData = (state: EncounterState): TaskPaneData => ({
  readyToSend: selectTasksByStatus(state, 'ready'),
  needsReview: selectTasksByStatus(state, 'pending-review'),
  processing: selectTasksByStatus(state, 'processing'),
  completed: selectTasksByStatus(state, 'completed'),
  failed: selectTasksByStatus(state, 'failed'),
});

// ============================================================================
// Review View
// ============================================================================

export interface ReviewViewData {
  itemsByCategory: Partial<Record<ItemCategory, ChartItem[]>>;
  openCareGaps: CareGapInstance[];
  encounter: EncounterMeta | null;
}

/**
 * Select data for the review view
 */
export const selectReviewViewData = (state: EncounterState): ReviewViewData => ({
  itemsByCategory: selectItemsGroupedByCategory(state),
  openCareGaps: selectOpenCareGaps(state),
  encounter: state.context.encounter,
});

// ============================================================================
// Patient Overview
// ============================================================================

export interface PatientOverviewData {
  patient: PatientContext | null;
  problemList: DiagnosisItem[];
  medications: MedicationItem[];
  allergies: AllergyItem[];
  openCareGaps: CareGapInstance[];
}

/**
 * Select data for the patient overview
 */
export const selectPatientOverviewData = (
  state: EncounterState
): PatientOverviewData => ({
  patient: state.context.patient,
  problemList: selectDiagnoses(state).filter(
    dx => dx.data?.type === 'chronic' || dx.data?.clinicalStatus === 'active'
  ),
  medications: selectMedications(state),
  allergies: selectAllergies(state),
  openCareGaps: selectOpenCareGaps(state),
});

// ============================================================================
// Minibar
// ============================================================================

export interface MinibarData {
  pendingReviewCount: number;
  alertCount: number;
  transcriptionStatus: TranscriptionStatus;
  syncStatus: SyncStatus;
}

/**
 * Select data for the minibar
 */
export const selectMinibarData = (state: EncounterState): MinibarData => {
  const pendingReviewTasks = selectTasksByStatus(state, 'pending-review');
  const alertTasks = pendingReviewTasks.filter(t => t.priority === 'high' || t.priority === 'urgent');
  
  return {
    pendingReviewCount: pendingReviewTasks.length,
    alertCount: alertTasks.length,
    transcriptionStatus: state.session.transcription.status,
    syncStatus: state.sync.status,
  };
};

// ============================================================================
// Care Gaps Panel
// ============================================================================

export interface CareGapsPanelData {
  open: CareGapInstance[];
  pending: CareGapInstance[];
  addressedThisEncounter: CareGapInstance[];
  overdue: CareGapInstance[];
}

/**
 * Select data for the care gaps panel
 */
export const selectCareGapsPanelData = (
  state: EncounterState
): CareGapsPanelData => {
  const allGaps = selectAllCareGaps(state);
  const now = new Date();
  
  return {
    open: allGaps.filter(g => g.status === 'open'),
    pending: allGaps.filter(g => g.status === 'pending'),
    addressedThisEncounter: allGaps.filter(g => g.addressedThisEncounter),
    overdue: allGaps.filter(g => g.status === 'open' && g.dueBy && g.dueBy < now),
  };
};

// ============================================================================
// Process View
// ============================================================================

export interface ProcessViewData {
  batches: ProcessBatch[];
  drafts: AIDraft[];
  checklist: ChecklistItem[];
  emLevel: EMLevel;
  outstandingCount: number;
}

/**
 * Select data for the process view
 */
export const selectProcessViewData = (state: EncounterState): ProcessViewData => ({
  batches: selectProcessViewBatches(state),
  drafts: selectProcessViewDrafts(state),
  checklist: selectCompletenessChecklist(state),
  emLevel: selectMockEMLevel(state),
  outstandingCount: selectOutstandingItemCount(state),
});

// ============================================================================
// Session Info
// ============================================================================

export interface SessionInfo {
  mode: Mode;
  currentUser: import('../types').User | null;
  currentOwner: import('../../types').UserReference | null;
  isRecording: boolean;
  isOnline: boolean;
}

/**
 * Select session info
 */
export const selectSessionInfo = (state: EncounterState): SessionInfo => ({
  mode: state.session.mode,
  currentUser: state.session.currentUser,
  currentOwner: state.collaboration.currentOwner,
  isRecording: state.session.transcription.status === 'recording',
  isOnline: state.sync.status !== 'error',
});
