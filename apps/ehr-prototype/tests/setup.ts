/**
 * Test Setup
 *
 * Global configuration and mocks for Vitest tests.
 * This file runs before each test file.
 */

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

// ============================================================================
// React Native Globals
// ============================================================================

// __DEV__ is a React Native global indicating development mode
(globalThis as unknown as Record<string, unknown>).__DEV__ = true;

// ============================================================================
// Cleanup
// ============================================================================

// Cleanup React Testing Library after each test
afterEach(() => {
  cleanup();
});

// ============================================================================
// Browser API Mocks
// ============================================================================

// Mock matchMedia (used by responsive hooks)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver (used by layout components)
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}));

// Mock requestIdleCallback
global.requestIdleCallback = vi.fn().mockImplementation((cb: IdleRequestCallback) => {
  const start = Date.now();
  return setTimeout(() => {
    cb({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
    });
  }, 1) as unknown as number;
});

global.cancelIdleCallback = vi.fn().mockImplementation((id: number) => {
  clearTimeout(id);
});

// Mock crypto.randomUUID for deterministic IDs in tests
let uuidCounter = 0;
beforeEach(() => {
  uuidCounter = 0;
});

Object.defineProperty(global.crypto, 'randomUUID', {
  value: vi.fn(() => `test-uuid-${++uuidCounter}`),
});

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
  writable: true,
});

// ============================================================================
// localStorage Mock
// ============================================================================

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Clear localStorage between tests
afterEach(() => {
  localStorageMock.clear();
});

// ============================================================================
// Console Warnings
// ============================================================================

// Suppress specific console warnings in tests (optional)
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  // Suppress React 18 act() warnings in tests
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: An update to') &&
    args[0].includes('was not wrapped in act')
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

// ============================================================================
// Date/Time Mocks (optional - uncomment if needed)
// ============================================================================

// Uncomment to use fixed dates in tests:
// beforeEach(() => {
//   vi.useFakeTimers();
//   vi.setSystemTime(new Date('2026-02-01T10:00:00'));
// });
//
// afterEach(() => {
//   vi.useRealTimers();
// });
