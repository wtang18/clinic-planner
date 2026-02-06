/**
 * Integration Tests Index
 *
 * Central export point for integration test utilities.
 */

// Test files are auto-discovered by Jest, this file provides
// shared utilities and setup if needed.

export const TEST_PATIENT_ID = 'test-patient-001';
export const TEST_ENCOUNTER_ID = 'test-encounter-001';
export const TEST_PROVIDER_ID = 'test-provider-001';

/**
 * Common test setup utilities
 */
export const testUtils = {
  /**
   * Create a test provider identity
   */
  createTestProvider: (overrides: Partial<{ id: string; name: string; role: string }> = {}) => ({
    id: overrides.id ?? TEST_PROVIDER_ID,
    name: overrides.name ?? 'Dr. Test Provider',
    role: overrides.role ?? 'physician',
  }),

  /**
   * Create a timestamp for testing
   */
  createTestTimestamp: (offsetMs: number = 0) => new Date(Date.now() + offsetMs),

  /**
   * Wait for async operations to settle
   */
  waitForSettled: (ms: number = 0) => new Promise((resolve) => setTimeout(resolve, ms)),
};
