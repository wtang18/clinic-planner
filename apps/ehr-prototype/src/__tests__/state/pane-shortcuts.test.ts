/**
 * Pane Cycling Shortcut Tests
 *
 * Tests the pure cycling algorithm from usePaneShortcuts.
 * Mocks react-native since the module transitively imports it.
 */

import { describe, it, expect, vi } from 'vitest';

vi.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

import { nextPaneView } from '../../shortcuts/usePaneShortcuts';

// ============================================================================
// nextPaneView — forward cycling
// ============================================================================

describe('nextPaneView (forward)', () => {
  it('menu → ai', () => {
    expect(nextPaneView('menu', true, 1)).toBe('ai');
  });

  it('ai → transcript (when eligible)', () => {
    expect(nextPaneView('ai', true, 1)).toBe('transcript');
  });

  it('transcript → menu (wrap)', () => {
    expect(nextPaneView('transcript', true, 1)).toBe('menu');
  });

  it('ai → menu (skips transcript when !txEligible)', () => {
    expect(nextPaneView('ai', false, 1)).toBe('menu');
  });

  it('menu → ai (even when !txEligible)', () => {
    expect(nextPaneView('menu', false, 1)).toBe('ai');
  });
});

// ============================================================================
// nextPaneView — backward cycling
// ============================================================================

describe('nextPaneView (backward)', () => {
  it('ai → menu', () => {
    expect(nextPaneView('ai', true, -1)).toBe('menu');
  });

  it('menu → transcript (wrap, when eligible)', () => {
    expect(nextPaneView('menu', true, -1)).toBe('transcript');
  });

  it('transcript → ai', () => {
    expect(nextPaneView('transcript', true, -1)).toBe('ai');
  });

  it('menu → ai (wrap, skips transcript when !txEligible)', () => {
    expect(nextPaneView('menu', false, -1)).toBe('ai');
  });
});
