/**
 * Application Routes
 *
 * Route definitions and navigation helpers.
 */

import type { Mode } from '../state/types';

// ============================================================================
// Route Definitions
// ============================================================================

export const ROUTES = {
  HOME: '/',
  DEMO: '/demo',
  ENCOUNTER: '/encounter/:encounterId',
  CAPTURE: '/encounter/:encounterId/capture',
  PROCESS: '/encounter/:encounterId/process',
  REVIEW: '/encounter/:encounterId/review',
  PATIENT: '/patient/:patientId',
  SETTINGS: '/settings',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

// ============================================================================
// Route Building Helpers
// ============================================================================

/**
 * Build an encounter route URL
 */
export function buildEncounterRoute(
  encounterId: string,
  mode?: Mode
): string {
  const base = `/encounter/${encounterId}`;
  if (mode) {
    return `${base}/${mode}`;
  }
  return base;
}

/**
 * Build a patient route URL
 */
export function buildPatientRoute(patientId: string): string {
  return `/patient/${patientId}`;
}

/**
 * Parse encounter ID from a route path
 */
export function parseEncounterId(path: string): string | null {
  const match = path.match(/\/encounter\/([^/]+)/);
  return match ? match[1] : null;
}

/**
 * Parse patient ID from a route path
 */
export function parsePatientId(path: string): string | null {
  const match = path.match(/\/patient\/([^/]+)/);
  return match ? match[1] : null;
}

/**
 * Get mode from a route path
 */
export function parseModeFromPath(path: string): Mode | null {
  if (path.includes('/capture')) return 'capture';
  if (path.includes('/process')) return 'process';
  if (path.includes('/review')) return 'review';
  return null;
}

// ============================================================================
// Demo Routes
// ============================================================================

export const DEMO_ENCOUNTERS = {
  UC_COUGH: 'demo-uc',
  PC_DIABETES: 'demo-pc',
  HEALTHY_ADULT: 'demo-healthy',
} as const;

export type DemoEncounterId = (typeof DEMO_ENCOUNTERS)[keyof typeof DEMO_ENCOUNTERS];

/**
 * Get demo encounter route
 */
export function getDemoRoute(
  scenario: DemoEncounterId = DEMO_ENCOUNTERS.UC_COUGH,
  mode: Mode = 'capture'
): string {
  return buildEncounterRoute(scenario, mode);
}
