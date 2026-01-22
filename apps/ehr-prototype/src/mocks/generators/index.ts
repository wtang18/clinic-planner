/**
 * Mock Data Generators
 * Re-exports all generators for easy access
 */

// ID Generators
export {
  generateId,
  generateMRN,
  generateNPI,
  generateRequisitionId,
  generateEncounterId,
  generatePatientId,
  generateItemId,
  generateSuggestionId,
  generateTaskId,
  generateCareGapId,
  generateUserId,
} from './ids';

// Patient Generators
export {
  generatePatient,
  generateDemographics,
  generateProblemList,
  generateMedicationList,
  generateAllergyList,
  PATIENT_TEMPLATES,
  PATIENT_UC_COUGH,
  PATIENT_PC_DIABETES,
  PATIENT_HEALTHY_ADULT,
  PATIENT_GERIATRIC,
} from './patients';

// Chart Item Generators
export {
  generateMedicationItem,
  generateLabItem,
  generateDiagnosisItem,
  generateVitalsItem,
  generatePhysicalExamItem,
  ITEM_TEMPLATES,
} from './items';

// Care Gap Generators
export {
  generateCareGapDefinition,
  generateCareGapInstance,
  generateCareGapsForPatient,
  createClosureAttempt,
  CARE_GAP_DEFINITIONS,
  CARE_GAP_TEMPLATES,
} from './careGaps';

// Suggestion Generators
export {
  generateSuggestion,
  generateDxSuggestion,
  generateNewItemSuggestion,
  generateCorrectionSuggestion,
  generateCareGapActionSuggestion,
  generateSuggestionsForScenario,
  expireSuggestion,
  acceptSuggestion,
  dismissSuggestion,
  SUGGESTION_TEMPLATES,
} from './suggestions';

// Task Generators
export {
  generateTask,
  generateDxAssociationTask,
  generateDrugInteractionTask,
  generateFormularyCheckTask,
  generatePriorAuthTask,
  generateNoteGenerationTask,
  generateValidationTask,
  generateAlert,
  generateDrugInteractionAlert,
  generatePriorAuthRequiredAlert,
  generateFormularyAlert,
  startTask,
  completeTask,
  failTask,
  updateTaskProgress,
  TASK_TEMPLATES,
  SAMPLE_TASK_RESULTS,
} from './tasks';

// Encounter Generators
export {
  generateEncounterMeta,
  generateVisitMeta,
  generateProvider,
  generateFacility,
  generateEncounterContext,
  checkInEncounter,
  startEncounter,
  completeEncounter,
  signEncounter,
  cancelEncounter,
  ENCOUNTER_TEMPLATES,
  STAFF_TEMPLATES,
  FACILITY_TEMPLATES,
  type EncounterContext,
} from './encounters';

// Full State Generators
export {
  generateEncounterState,
  generateUcCoughInitialState,
  generateUcCoughMidEncounterState,
  generateUcCoughCompleteState,
  generatePcDiabetesInitialState,
  generatePcDiabetesMidEncounterState,
  generateEmptyEncounterState,
  generateOfflineState,
  generateConflictState,
  addItemToState,
  addSuggestionToState,
  addTaskToState,
  setModeInState,
  STATE_SCENARIOS,
  type GenerateStateOptions,
} from './state';
