/**
 * CaptureView — Backward-Compatibility Re-export
 *
 * CaptureView has been decomposed into:
 *   - EncounterProvider (encounter hook context)
 *   - AppShell (layout shell + scope routing)
 *   - EncounterWorkspace (encounter canvas rendering)
 *   - CohortWorkspace (cohort canvas rendering)
 *
 * This file re-exports AppShell as CaptureView so that existing imports
 * (lazy-loading, screens barrel) continue to work without changes.
 *
 * New code should import from the appropriate new module:
 *   import { EncounterProvider } from '../EncounterWorkspace';
 *   import { AppShell } from '../AppShell';
 */

export { AppShell as CaptureView } from '../AppShell';
