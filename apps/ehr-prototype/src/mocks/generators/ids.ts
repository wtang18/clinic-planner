/**
 * ID generation utilities
 */

import { nanoid } from 'nanoid';

/**
 * Generate a unique ID with optional prefix
 */
export function generateId(prefix?: string): string {
  const id = nanoid(12);
  return prefix ? `${prefix}-${id}` : id;
}

/**
 * Generate a Medical Record Number
 */
export function generateMRN(): string {
  const num = Math.floor(10000000 + Math.random() * 90000000);
  return num.toString();
}

/**
 * Generate a National Provider Identifier (NPI)
 */
export function generateNPI(): string {
  const num = Math.floor(1000000000 + Math.random() * 9000000000);
  return num.toString();
}

/**
 * Generate a requisition ID
 */
export function generateRequisitionId(): string {
  const prefix = 'REQ';
  const num = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${num}`;
}

/**
 * Generate an encounter ID
 */
export function generateEncounterId(): string {
  return generateId('enc');
}

/**
 * Generate a patient ID
 */
export function generatePatientId(): string {
  return generateId('pt');
}

/**
 * Generate an item ID
 */
export function generateItemId(): string {
  return generateId('item');
}

/**
 * Generate a suggestion ID
 */
export function generateSuggestionId(): string {
  return generateId('sug');
}

/**
 * Generate a task ID
 */
export function generateTaskId(): string {
  return generateId('task');
}

/**
 * Generate a care gap ID
 */
export function generateCareGapId(): string {
  return generateId('gap');
}

/**
 * Generate a user ID
 */
export function generateUserId(): string {
  return generateId('user');
}
