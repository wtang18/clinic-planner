/**
 * Note Generation Service
 *
 * Exports all note generation components.
 */

// Types
export type {
  NoteSection,
  NoteGenerationConfig,
  NoteSectionContent,
  GeneratedNote,
  NoteTemplate,
} from './types';

export { DEFAULT_NOTE_GENERATION_CONFIG, SOAP_TEMPLATE } from './types';

// Generator
export {
  generateVisitNote,
  generateHPI,
  generateROS,
  generatePhysicalExam,
  generateAssessment,
  generatePlan,
  groupItemsByCategory,
  formatMedicationList,
  formatDiagnosisList,
} from './note-generator';

// AI Service
export { noteGenerationService } from './note-generation-service';
