/**
 * Context module exports
 *
 * Provides React contexts for state management, AI services, and transcription.
 */

// Re-export all context exports
export * from './EncounterContext';
export * from './AIServicesContext';
export * from './TranscriptionContext';

// Population health context
export { PopHealthProvider, usePopHealth } from './PopHealthContext';
export type { PopHealthAction, PopHealthProviderProps } from './PopHealthContext';

// Combined provider
export { AppProviders } from './AppProviders';
export type { AppProvidersProps } from './AppProviders';
