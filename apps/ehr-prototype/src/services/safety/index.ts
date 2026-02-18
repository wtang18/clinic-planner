/**
 * Safety Check Services
 *
 * Re-exports all safety check utilities:
 * - Allergy checker: cross-references drugs against patient allergies
 * - Duplicate detector: flags same-text items within a category
 * - Dosage checker: validates against known max dosage ranges
 * - Types: SafetyAlert, SafetyAlertType, SafetyAlertSeverity
 */

export type { SafetyAlert, SafetyAlertType, SafetyAlertSeverity } from './types';

export { checkAllergyConflicts } from './allergy-checker';
export { checkDuplicates } from './duplicate-detector';
export { checkDosageRange, parseDosageMg, getFrequencyMultiplier } from './dosage-checker';
