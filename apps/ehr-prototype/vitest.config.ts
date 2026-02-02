import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom for browser APIs
    environment: 'jsdom',

    // Global test setup
    setupFiles: ['./tests/setup.ts'],

    // Test file patterns
    include: [
      '**/*.test.{ts,tsx}',
      '**/*.vitest.{ts,tsx}',
    ],

    // Exclude patterns
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**', // Playwright tests handled separately
    ],

    // Enable global test APIs (describe, it, expect)
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/*.vitest.{ts,tsx}',
        '**/stories/**',
        '.storybook/**',
      ],
    },

    // Timeout for async tests
    testTimeout: 10000,

    // Reporter
    reporters: ['verbose'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
