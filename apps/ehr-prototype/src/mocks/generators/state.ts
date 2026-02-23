/**
 * Full State Generators
 * Creates complete mock EncounterState for testing scenarios
 */

import type { ChartItem, Suggestion, BackgroundTask } from '../../types';
import type { EncounterState, Mode } from '../../state/types';
import { createInitialState } from '../../state';
import { generateId } from './ids';
import { PATIENT_TEMPLATES } from './patients';
import {
  ITEM_TEMPLATES,
  generateVitalsItem,
  generatePhysicalExamItem,
} from './items';
import { CARE_GAP_TEMPLATES } from './careGaps';
import { SUGGESTION_TEMPLATES } from './suggestions';
import { TASK_TEMPLATES, generateDxAssociationTask } from './tasks';
import { ENCOUNTER_TEMPLATES, EncounterContext } from './encounters';

// ============================================================================
// Full State Generators
// ============================================================================

export interface GenerateStateOptions {
  mode?: Mode;
  withItems?: boolean;
  withSuggestions?: boolean;
  withTasks?: boolean;
  withCareGaps?: boolean;
}

/**
 * Generate a complete encounter state for testing
 */
export function generateEncounterState(
  encounterContext: EncounterContext,
  options: GenerateStateOptions = {}
): EncounterState {
  const { mode = 'capture' } = options;

  const state = createInitialState();

  // Set context
  state.context.patient = encounterContext.patient;
  state.context.encounter = encounterContext.encounter;
  state.context.visit = encounterContext.visit;

  // Set session
  state.session.currentUser = {
    id: encounterContext.provider.id,
    name: encounterContext.provider.name,
    role: encounterContext.provider.role || 'provider',
  };
  state.session.mode = mode;

  return state;
}

// ============================================================================
// Scenario-Specific State Generators
// ============================================================================

/**
 * UC Cough Scenario - Initial state when encounter begins
 */
export function generateUcCoughInitialState(): EncounterState {
  const context = ENCOUNTER_TEMPLATES.ucCough();
  const state = generateEncounterState(context, { mode: 'capture' });

  // Add initial vitals from MA
  const vitals = generateVitalsItem({
    displayText: 'Vitals: BP 118/76, HR 72, Temp 98.4°F',
    data: {
      measurements: [
        { type: 'bp-systolic', value: 118, unit: 'mmHg' },
        { type: 'bp-diastolic', value: 76, unit: 'mmHg' },
        { type: 'pulse', value: 72, unit: 'bpm' },
        { type: 'temp', value: 98.4, unit: '°F' },
        { type: 'resp', value: 16, unit: '/min' },
        { type: 'spo2', value: 98, unit: '%' },
      ],
      capturedAt: new Date(),
      position: 'sitting',
    },
  });
  state.entities.items[vitals.id] = vitals;

  // Add care gaps
  const careGaps = CARE_GAP_TEMPLATES.ucCoughPatient;
  careGaps.forEach(gap => {
    state.entities.careGaps[gap.id] = {
      ...gap,
      patientId: context.patient.id,
    };
  });

  return state;
}

/**
 * UC Cough Scenario - Mid-encounter with items added
 */
export function generateUcCoughMidEncounterState(): EncounterState {
  const state = generateUcCoughInitialState();

  // Add chief complaint (captured via transcription)
  const chiefComplaint: ChartItem = {
    id: generateId('item'),
    category: 'chief-complaint',
    createdAt: new Date(),
    createdBy: { id: state.session.currentUser!.id, name: state.session.currentUser!.name },
    modifiedAt: new Date(),
    modifiedBy: { id: state.session.currentUser!.id, name: state.session.currentUser!.name },
    source: { type: 'aiDraft' },
    status: 'confirmed',
    displayText: 'Cough x 5 days',
    displaySubtext: 'Productive, worse at night',
    tags: [{ label: 'Transcribed', type: 'source' }],
    linkedDiagnoses: [],
    linkedEncounters: [state.context.encounter!.id],
    activityLog: [{
      timestamp: new Date(),
      action: 'created',
      actor: 'AI Assistant',
      details: 'Captured from ambient recording',
    }],
    _meta: { syncStatus: 'synced', aiGenerated: true, aiConfidence: 0.95, requiresReview: false, reviewed: true },
    data: {
      text: 'Productive cough for 5 days, worse at night with mild congestion',
      format: 'plain',
    },
  };
  state.entities.items[chiefComplaint.id] = chiefComplaint;

  // Add physical exam findings
  const lungExam = generatePhysicalExamItem('respiratory', {
    id: generateId('item'),
    displayText: 'Lungs: Clear bilaterally',
    data: {
      system: 'respiratory',
      finding: 'Clear to auscultation bilaterally, no wheezes/rhonchi/rales',
      isNormal: true,
    },
  });
  state.entities.items[lungExam.id] = lungExam;

  // Add active suggestions from transcription
  const suggestions = SUGGESTION_TEMPLATES.ucCoughTranscription;
  suggestions.forEach(sug => {
    state.entities.suggestions[sug.id] = sug;
  });

  // Add narrative draft suggestions
  const narrativeDrafts = SUGGESTION_TEMPLATES.ucCoughNarrativeDrafts;
  narrativeDrafts.forEach(sug => {
    state.entities.suggestions[sug.id] = sug;
  });

  return state;
}

/**
 * UC Cough Scenario - End of encounter with orders ready
 */
export function generateUcCoughCompleteState(): EncounterState {
  const state = generateUcCoughMidEncounterState();
  state.session.mode = 'review';

  // Add diagnosis
  const diagnosis = { ...ITEM_TEMPLATES.acuteBronchitis, id: generateId('item') };
  state.entities.items[diagnosis.id] = diagnosis;

  // Add medication with linked diagnosis
  const medication = { ...ITEM_TEMPLATES.benzonatate, id: generateId('item') };
  medication.linkedDiagnoses = [diagnosis.id];
  medication.status = 'ordered';
  state.entities.items[medication.id] = medication;

  // Relationships are tracked via linkedDiagnoses on items

  // Add completed task
  const dxTask = generateDxAssociationTask(medication.id, 'Benzonatate');
  dxTask.status = 'completed';
  dxTask.completedAt = new Date();
  dxTask.result = {
    autoLinked: diagnosis.id,
    suggestions: [],
  };
  state.entities.tasks[dxTask.id] = dxTask;

  // Clear suggestions (accepted)
  state.entities.suggestions = {};

  return state;
}

/**
 * PC Diabetes Scenario - Initial state
 */
export function generatePcDiabetesInitialState(): EncounterState {
  const context = ENCOUNTER_TEMPLATES.pcDiabetes();
  const state = generateEncounterState(context, { mode: 'capture' });

  // Add vitals with elevated BP
  const vitals = generateVitalsItem({
    displayText: 'Vitals: BP 142/88, HR 76, Weight 198 lbs',
    data: {
      measurements: [
        { type: 'bp-systolic', value: 142, unit: 'mmHg', flag: 'high' },
        { type: 'bp-diastolic', value: 88, unit: 'mmHg', flag: 'high' },
        { type: 'pulse', value: 76, unit: 'bpm' },
        { type: 'temp', value: 98.2, unit: '°F' },
        { type: 'weight', value: 198, unit: 'lbs' },
        { type: 'height', value: 70, unit: 'in' },
        { type: 'bmi', value: 28.4, unit: 'kg/m²', flag: 'high' },
      ],
      capturedAt: new Date(),
      position: 'sitting',
    },
  });
  state.entities.items[vitals.id] = vitals;

  // Add care gaps (multiple for diabetic patient)
  const careGaps = CARE_GAP_TEMPLATES.pcDiabetesPatient;
  careGaps.forEach(gap => {
    state.entities.careGaps[gap.id] = {
      ...gap,
      patientId: context.patient.id,
    };
  });

  // Add care gap suggestions
  const suggestions = SUGGESTION_TEMPLATES.pcDiabetesCareGaps;
  suggestions.forEach(sug => {
    state.entities.suggestions[sug.id] = sug;
  });

  return state;
}

/**
 * PC Diabetes Scenario - Mid-encounter with labs ordered
 */
export function generatePcDiabetesMidEncounterState(): EncounterState {
  const state = generatePcDiabetesInitialState();

  // Add diagnoses
  const dm = { ...ITEM_TEMPLATES.typetwoDiabetes, id: generateId('item') };
  const htn = { ...ITEM_TEMPLATES.essentialHypertension, id: generateId('item') };
  state.entities.items[dm.id] = dm;
  state.entities.items[htn.id] = htn;

  // Add A1C lab order (closing care gap)
  const a1c = { ...ITEM_TEMPLATES.a1c, id: generateId('item') };
  a1c.linkedDiagnoses = [dm.id];
  a1c.status = 'ordered';
  state.entities.items[a1c.id] = a1c;

  // Update care gap to pending
  const a1cGap = state.entities.careGaps['gap-a1c-001'];
  if (a1cGap) {
    a1cGap.status = 'pending';
    a1cGap.addressedThisEncounter = true;
    a1cGap.encounterActions = [a1c.id];
    a1cGap.closureAttempts = [{
      attemptedAt: new Date(),
      itemId: a1c.id,
      itemType: 'lab',
      result: 'pending',
    }];
  }

  // Add medication refills
  const metformin = { ...ITEM_TEMPLATES.metformin, id: generateId('item') };
  metformin.linkedDiagnoses = [dm.id];
  state.entities.items[metformin.id] = metformin;

  const lisinopril = { ...ITEM_TEMPLATES.lisinopril, id: generateId('item') };
  lisinopril.linkedDiagnoses = [htn.id];
  state.entities.items[lisinopril.id] = lisinopril;

  // Relationships are tracked via linkedDiagnoses on items themselves

  // Add pending tasks
  const tasks = TASK_TEMPLATES.labAdded(a1c.id, 'A1C');
  tasks.forEach(task => {
    state.entities.tasks[task.id] = task;
  });

  return state;
}

/**
 * Generate empty state for a new encounter
 */
export function generateEmptyEncounterState(): EncounterState {
  return createInitialState();
}

/**
 * Generate state with offline queue items
 */
export function generateOfflineState(): EncounterState {
  const state = generateUcCoughMidEncounterState();

  state.sync.status = 'error';
  state.sync.queue = [
    {
      id: generateId('action'),
      action: {
        type: 'ITEM_ADDED',
        payload: { item: { ...ITEM_TEMPLATES.benzonatate, id: generateId('item') } },
      },
      queuedAt: new Date(Date.now() - 5 * 60 * 1000),
      retryCount: 0,
    },
    {
      id: generateId('action'),
      action: {
        type: 'ITEM_ADDED',
        payload: { item: { ...ITEM_TEMPLATES.acuteBronchitis, id: generateId('item') } },
      },
      queuedAt: new Date(Date.now() - 4 * 60 * 1000),
      retryCount: 0,
    },
  ];

  return state;
}

/**
 * Generate state with sync conflict
 */
export function generateConflictState(): EncounterState {
  const state = generateUcCoughMidEncounterState();

  state.sync.status = 'error';

  return state;
}

// ============================================================================
// State Manipulation Helpers
// ============================================================================

export function addItemToState(
  state: EncounterState,
  item: ChartItem
): EncounterState {
  return {
    ...state,
    entities: {
      ...state.entities,
      items: {
        ...state.entities.items,
        [item.id]: item,
      },
    },
  };
}

export function addSuggestionToState(
  state: EncounterState,
  suggestion: Suggestion
): EncounterState {
  return {
    ...state,
    entities: {
      ...state.entities,
      suggestions: {
        ...state.entities.suggestions,
        [suggestion.id]: suggestion,
      },
    },
  };
}

export function addTaskToState(
  state: EncounterState,
  task: BackgroundTask
): EncounterState {
  return {
    ...state,
    entities: {
      ...state.entities,
      tasks: {
        ...state.entities.tasks,
        [task.id]: task,
      },
    },
  };
}

export function setModeInState(
  state: EncounterState,
  mode: Mode
): EncounterState {
  return {
    ...state,
    session: {
      ...state.session,
      mode,
    },
  };
}

// ============================================================================
// Exports for Common Scenarios
// ============================================================================

export const STATE_SCENARIOS = {
  empty: generateEmptyEncounterState,
  ucCoughInitial: generateUcCoughInitialState,
  ucCoughMid: generateUcCoughMidEncounterState,
  ucCoughComplete: generateUcCoughCompleteState,
  pcDiabetesInitial: generatePcDiabetesInitialState,
  pcDiabetesMid: generatePcDiabetesMidEncounterState,
  offline: generateOfflineState,
  conflict: generateConflictState,
};
