/**
 * Scenarios Module Exports
 */

// Scenario Runner
export {
  createScenarioRunner,
  type Scenario,
  type ScenarioEvent,
  type ScenarioStatus,
  type ScenarioRunner,
} from './ScenarioRunner';

// Scenario Definitions
export { UC_COUGH_SCENARIO } from './definitions/uc-cough';
export { PC_DIABETES_SCENARIO } from './definitions/pc-diabetes';
export { LBP_PROTOCOL_SCENARIO } from './definitions/lbp-protocol';
export { URI_PROTOCOL_SCENARIO } from './definitions/uri-protocol';

// To-Do Mock Data
export {
  TODO_CATEGORIES,
  MOCK_TASKS,
  MOCK_FAXES,
  MOCK_MESSAGES,
  MOCK_CARE,
  getCategoryBadgeCount,
  getTotalPendingCount,
  getItemsByCategory,
  getItemsByFilter,
  getCategoryById,
  getFilterById,
  type ToDoCategory,
  type ToDoFilter,
  type ToDoItem,
} from './todoData';

// Patient Data Registry
export {
  PATIENT_REGISTRY,
  getPatientByMrn,
  getPatientById,
  getAllPatients,
  createToDoPatientRef,
  TODO_PATIENTS,
  PATIENT_LAUREN_SVENDSEN,
  PATIENT_ROBERT_MARTINEZ,
  PATIENT_DANTE_P,
  PATIENT_BARBARA_K,
  PATIENT_CARLOS_E,
  PATIENT_DIANA_L,
  PATIENT_EDWARD_M,
  PATIENT_ADAM_R,
  PATIENT_HELEN_W,
  PATIENT_IVAN_T,
  PATIENT_JULIA_S,
  PATIENT_KEVIN_R,
  type ToDoPatientRef,
} from './patientData';

// All scenarios
import { UC_COUGH_SCENARIO } from './definitions/uc-cough';
import { PC_DIABETES_SCENARIO } from './definitions/pc-diabetes';
import { LBP_PROTOCOL_SCENARIO } from './definitions/lbp-protocol';
import { URI_PROTOCOL_SCENARIO } from './definitions/uri-protocol';
import type { Scenario } from './ScenarioRunner';

export const ALL_SCENARIOS: Scenario[] = [
  UC_COUGH_SCENARIO,
  PC_DIABETES_SCENARIO,
  LBP_PROTOCOL_SCENARIO,
  URI_PROTOCOL_SCENARIO,
];

/**
 * Get scenario by ID
 */
export function getScenarioById(id: string): Scenario | undefined {
  return ALL_SCENARIOS.find((s) => s.id === id);
}
