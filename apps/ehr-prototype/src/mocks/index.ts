/**
 * Mock Data Module
 *
 * Provides generators and templates for creating test data.
 * Used for development, testing, and demo scenarios.
 *
 * @example
 * ```typescript
 * import {
 *   generateUcCoughInitialState,
 *   ITEM_TEMPLATES,
 *   ENCOUNTER_TEMPLATES
 * } from './mocks';
 *
 * // Get a complete scenario state
 * const state = generateUcCoughInitialState();
 *
 * // Or build from templates
 * const encounter = ENCOUNTER_TEMPLATES.ucCough();
 * const medication = ITEM_TEMPLATES.medications.benzonatate();
 * ```
 */

export * from './generators';
