/**
 * Shortcut Progress Tracking Tests
 *
 * Tests localStorage-based "tried" state for keyboard shortcuts.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { getTriedShortcuts, markShortcutTried } from '../../shortcuts/shortcutProgress';

describe('shortcutProgress', () => {
  beforeEach(() => {
    // localStorage is mocked and cleared between tests by setup.ts
  });

  it('getTriedShortcuts returns empty set initially', () => {
    const tried = getTriedShortcuts();
    expect(tried.size).toBe(0);
  });

  it('markShortcutTried persists and retrieves', () => {
    markShortcutTried('nav-home');
    markShortcutTried('save');

    const tried = getTriedShortcuts();
    expect(tried.has('nav-home')).toBe(true);
    expect(tried.has('save')).toBe(true);
    expect(tried.size).toBe(2);
  });

  it('markShortcutTried is idempotent', () => {
    markShortcutTried('nav-home');
    markShortcutTried('nav-home');
    markShortcutTried('nav-home');

    const tried = getTriedShortcuts();
    expect(tried.size).toBe(1);
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem('ehr-shortcut-progress', 'not-valid-json{{{');

    const tried = getTriedShortcuts();
    expect(tried.size).toBe(0);
  });

  it('handles non-array JSON in localStorage', () => {
    localStorage.setItem('ehr-shortcut-progress', '{"foo": "bar"}');

    const tried = getTriedShortcuts();
    expect(tried.size).toBe(0);
  });
});
