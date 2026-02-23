/**
 * ShortcutManager Tests
 *
 * Tests key normalization, chord support, event bus, and input guards.
 * Mocks react-native Platform since ShortcutManager imports it.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock react-native before importing ShortcutManager
vi.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

import {
  ShortcutManager,
  eventToKeyCombo,
  normalizeKey,
  isGlobalShortcut,
  categoryToLegendTab,
} from '../../shortcuts/ShortcutManager';
import type { Shortcut, ChordShortcut, ShortcutEvent } from '../../shortcuts/ShortcutManager';

// ============================================================================
// Helpers
// ============================================================================

/** Build a minimal KeyboardEvent-like object for testing eventToKeyCombo. */
function makeKeyEvent(overrides: Partial<KeyboardEvent> = {}): KeyboardEvent {
  return {
    key: 'a',
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    altKey: false,
    ...overrides,
  } as KeyboardEvent;
}

function makeShortcut(overrides: Partial<Shortcut> = {}): Shortcut {
  return {
    id: `test-${Math.random().toString(36).slice(2, 6)}`,
    key: 'a',
    description: 'Test shortcut',
    category: 'actions',
    handler: vi.fn(),
    ...overrides,
  };
}

function makeChord(overrides: Partial<ChordShortcut> = {}): ChordShortcut {
  return {
    id: `chord-${Math.random().toString(36).slice(2, 6)}`,
    leader: 'g',
    follower: 'h',
    description: 'Test chord',
    category: 'navigation',
    handler: vi.fn(),
    ...overrides,
  };
}

// ============================================================================
// eventToKeyCombo — key normalization
// ============================================================================

describe('eventToKeyCombo', () => {
  it('plain letter key', () => {
    expect(eventToKeyCombo(makeKeyEvent({ key: 'a' }))).toBe('a');
  });

  it('shift+letter includes shift', () => {
    expect(eventToKeyCombo(makeKeyEvent({ key: 'A', shiftKey: true }))).toBe('shift+a');
  });

  it('? key (Shift+/) omits shift — produces just "?"', () => {
    const combo = eventToKeyCombo(makeKeyEvent({ key: '?', shiftKey: true }));
    expect(combo).toBe('?');
  });

  it('! key (Shift+1) omits shift', () => {
    expect(eventToKeyCombo(makeKeyEvent({ key: '!', shiftKey: true }))).toBe('!');
  });

  it('mod+shift+t includes both modifiers', () => {
    const combo = eventToKeyCombo(makeKeyEvent({
      key: 't',
      metaKey: true,
      shiftKey: true,
    }));
    expect(combo).toBe('mod+shift+t');
  });

  it('mod+s with meta key', () => {
    expect(eventToKeyCombo(makeKeyEvent({ key: 's', metaKey: true }))).toBe('mod+s');
  });

  it('mod+s with ctrl key', () => {
    expect(eventToKeyCombo(makeKeyEvent({ key: 's', ctrlKey: true }))).toBe('mod+s');
  });

  it('Escape key', () => {
    expect(eventToKeyCombo(makeKeyEvent({ key: 'Escape' }))).toBe('escape');
  });

  it('modifier-only event produces empty string', () => {
    expect(eventToKeyCombo(makeKeyEvent({ key: 'Shift', shiftKey: true }))).toBe('');
  });

  it('alt+a', () => {
    expect(eventToKeyCombo(makeKeyEvent({ key: 'a', altKey: true }))).toBe('alt+a');
  });

  it('mod+shift+backslash', () => {
    const combo = eventToKeyCombo(makeKeyEvent({
      key: '\\',
      metaKey: true,
      shiftKey: true,
    }));
    expect(combo).toBe('mod+shift+\\');
  });
});

// ============================================================================
// normalizeKey
// ============================================================================

describe('normalizeKey', () => {
  it('lowercases', () => {
    expect(normalizeKey('A')).toBe('a');
  });

  it('maps ctrl to mod', () => {
    expect(normalizeKey('ctrl+s')).toBe('mod+s');
  });

  it('maps cmd to mod', () => {
    expect(normalizeKey('cmd+k')).toBe('mod+k');
  });

  it('maps command to mod', () => {
    expect(normalizeKey('command+s')).toBe('mod+s');
  });

  it('passes mod through unchanged', () => {
    expect(normalizeKey('mod+shift+t')).toBe('mod+shift+t');
  });
});

// ============================================================================
// isGlobalShortcut
// ============================================================================

describe('isGlobalShortcut', () => {
  it('Escape is global', () => {
    expect(isGlobalShortcut(makeKeyEvent({ key: 'Escape' }))).toBe(true);
  });

  it('cmd combo is global', () => {
    expect(isGlobalShortcut(makeKeyEvent({ key: 's', metaKey: true }))).toBe(true);
  });

  it('ctrl combo is global', () => {
    expect(isGlobalShortcut(makeKeyEvent({ key: 's', ctrlKey: true }))).toBe(true);
  });

  it('plain letter is NOT global', () => {
    expect(isGlobalShortcut(makeKeyEvent({ key: 'a' }))).toBe(false);
  });

  it('? is NOT global', () => {
    expect(isGlobalShortcut(makeKeyEvent({ key: '?', shiftKey: true }))).toBe(false);
  });
});

// ============================================================================
// categoryToLegendTab
// ============================================================================

describe('categoryToLegendTab', () => {
  it('navigation → navigate', () => {
    expect(categoryToLegendTab('navigation')).toBe('navigate');
  });

  it('panes → panes', () => {
    expect(categoryToLegendTab('panes')).toBe('panes');
  });

  it('charting → charting', () => {
    expect(categoryToLegendTab('charting')).toBe('charting');
  });

  it('actions → charting', () => {
    expect(categoryToLegendTab('actions')).toBe('charting');
  });

  it('editing → charting', () => {
    expect(categoryToLegendTab('editing')).toBe('charting');
  });

  it('ai → charting', () => {
    expect(categoryToLegendTab('ai')).toBe('charting');
  });
});

// ============================================================================
// ShortcutManager — register / unregister / basic
// ============================================================================

describe('ShortcutManager', () => {
  let manager: ShortcutManager;

  beforeEach(() => {
    manager = new ShortcutManager();
  });

  afterEach(() => {
    manager.destroy();
  });

  it('registers and retrieves a shortcut', () => {
    const s = makeShortcut({ id: 'test-1', key: 'a' });
    manager.register(s);
    expect(manager.get('test-1')).toBe(s);
  });

  it('getAll returns all registered shortcuts', () => {
    manager.register(makeShortcut({ id: 's1' }));
    manager.register(makeShortcut({ id: 's2' }));
    expect(manager.getAll()).toHaveLength(2);
  });

  it('unregister removes shortcut', () => {
    manager.register(makeShortcut({ id: 's1', key: 'x' }));
    manager.unregister('s1');
    expect(manager.get('s1')).toBeUndefined();
  });

  it('getByCategory filters correctly', () => {
    manager.register(makeShortcut({ id: 's1', category: 'navigation' }));
    manager.register(makeShortcut({ id: 's2', category: 'actions' }));
    expect(manager.getByCategory('navigation')).toHaveLength(1);
    expect(manager.getByCategory('actions')).toHaveLength(1);
  });

  it('enable/disable toggles', () => {
    expect(manager.isEnabled()).toBe(true);
    manager.disable();
    expect(manager.isEnabled()).toBe(false);
    manager.enable();
    expect(manager.isEnabled()).toBe(true);
  });

  it('destroy clears all shortcuts and chords', () => {
    manager.register(makeShortcut({ id: 's1' }));
    manager.registerChord(makeChord({ id: 'c1' }));
    manager.destroy();
    expect(manager.getAll()).toHaveLength(0);
    expect(manager.getAllChords()).toHaveLength(0);
  });
});

// ============================================================================
// Chord support
// ============================================================================

describe('ShortcutManager — chords', () => {
  let manager: ShortcutManager;

  beforeEach(() => {
    vi.useFakeTimers();
    manager = new ShortcutManager();
  });

  afterEach(() => {
    manager.destroy();
    vi.useRealTimers();
  });

  it('registerChord stores and retrieves chord', () => {
    const chord = makeChord({ id: 'nav-home', leader: 'g', follower: 'h' });
    manager.registerChord(chord);
    expect(manager.getAllChords()).toHaveLength(1);
    expect(manager.getAllChords()[0].id).toBe('nav-home');
  });

  it('unregisterChord removes chord', () => {
    manager.registerChord(makeChord({ id: 'c1' }));
    manager.unregisterChord('c1');
    expect(manager.getAllChords()).toHaveLength(0);
  });

  it('leader key enters pending chord state', () => {
    manager.registerChord(makeChord({ leader: 'g', follower: 'h' }));
    expect(manager.getChordState()).toBeNull();

    // Simulate pressing 'g' by dispatching to document
    const event = new KeyboardEvent('keydown', { key: 'g', bubbles: true });
    document.dispatchEvent(event);

    expect(manager.getChordState()).toBe('g');
  });

  it('valid follower fires chord handler', () => {
    const handler = vi.fn();
    manager.registerChord(makeChord({ leader: 'g', follower: 'h', handler }));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'h', bubbles: true }));

    expect(handler).toHaveBeenCalledOnce();
    expect(manager.getChordState()).toBeNull();
  });

  it('invalid follower cancels chord', () => {
    const handler = vi.fn();
    manager.registerChord(makeChord({ leader: 'g', follower: 'h', handler }));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'x', bubbles: true }));

    expect(handler).not.toHaveBeenCalled();
    expect(manager.getChordState()).toBeNull();
  });

  it('Escape cancels chord', () => {
    const handler = vi.fn();
    manager.registerChord(makeChord({ leader: 'g', follower: 'h', handler }));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(handler).not.toHaveBeenCalled();
    expect(manager.getChordState()).toBeNull();
  });

  it('timeout cancels chord after 1.5s', () => {
    manager.registerChord(makeChord({ leader: 'g', follower: 'h' }));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }));
    expect(manager.getChordState()).toBe('g');

    vi.advanceTimersByTime(1500);
    expect(manager.getChordState()).toBeNull();
  });

  it('multiple chords with same leader work', () => {
    const homeHandler = vi.fn();
    const visitHandler = vi.fn();
    manager.registerChord(makeChord({ id: 'go-home', leader: 'g', follower: 'h', handler: homeHandler }));
    manager.registerChord(makeChord({ id: 'go-visit', leader: 'g', follower: 'v', handler: visitHandler }));

    // G→V fires visit handler
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'v', bubbles: true }));
    expect(visitHandler).toHaveBeenCalledOnce();
    expect(homeHandler).not.toHaveBeenCalled();
  });

  it('chord with when() guard prevents firing when false', () => {
    const handler = vi.fn();
    manager.registerChord(makeChord({ leader: 'g', follower: 'h', handler, when: () => false }));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'h', bubbles: true }));

    expect(handler).not.toHaveBeenCalled();
    expect(manager.getChordState()).toBeNull();
  });
});

// ============================================================================
// Event bus
// ============================================================================

describe('ShortcutManager — event bus', () => {
  let manager: ShortcutManager;

  beforeEach(() => {
    vi.useFakeTimers();
    manager = new ShortcutManager();
  });

  afterEach(() => {
    manager.destroy();
    vi.useRealTimers();
  });

  it('subscribe receives fired events for flat shortcuts', () => {
    const events: ShortcutEvent[] = [];
    manager.subscribe((e) => events.push(e));
    manager.register(makeShortcut({ id: 'test-a', key: 'x' }));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'x', bubbles: true }));

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('fired');
    expect(events[0].shortcutId).toBe('test-a');
  });

  it('subscribe receives chord-start, chord-complete events', () => {
    const events: ShortcutEvent[] = [];
    manager.subscribe((e) => events.push(e));
    manager.registerChord(makeChord({ id: 'nav-home', leader: 'g', follower: 'h' }));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }));
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('chord-start');
    expect(events[0].leader).toBe('g');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'h', bubbles: true }));
    expect(events).toHaveLength(2);
    expect(events[1].type).toBe('chord-complete');
    expect(events[1].shortcutId).toBe('nav-home');
    expect(events[1].leader).toBe('g');
    expect(events[1].follower).toBe('h');
  });

  it('subscribe receives chord-cancel on timeout', () => {
    const events: ShortcutEvent[] = [];
    manager.subscribe((e) => events.push(e));
    manager.registerChord(makeChord({ leader: 'g', follower: 'h' }));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }));
    vi.advanceTimersByTime(1500);

    expect(events).toHaveLength(2);
    expect(events[1].type).toBe('chord-cancel');
    expect(events[1].leader).toBe('g');
  });

  it('subscribe receives chord-cancel on Escape', () => {
    const events: ShortcutEvent[] = [];
    manager.subscribe((e) => events.push(e));
    manager.registerChord(makeChord({ leader: 'g', follower: 'h' }));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(events).toHaveLength(2);
    expect(events[1].type).toBe('chord-cancel');
  });

  it('unsubscribe stops events', () => {
    const events: ShortcutEvent[] = [];
    const unsub = manager.subscribe((e) => events.push(e));
    manager.register(makeShortcut({ id: 'test-a', key: 'x' }));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'x', bubbles: true }));
    expect(events).toHaveLength(1);

    unsub();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'x', bubbles: true }));
    expect(events).toHaveLength(1); // no new event
  });
});

// ============================================================================
// G-chord navigation (integration-style tests)
// ============================================================================

describe('G-chord navigation', () => {
  let manager: ShortcutManager;

  beforeEach(() => {
    vi.useFakeTimers();
    manager = new ShortcutManager();
  });

  afterEach(() => {
    manager.destroy();
    vi.useRealTimers();
  });

  it('G→H fires navigateHome', () => {
    const handler = vi.fn();
    manager.registerChord(makeChord({ id: 'nav-home', leader: 'g', follower: 'h', handler }));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'h', bubbles: true }));

    expect(handler).toHaveBeenCalledOnce();
  });

  it('G→1 through G→9 fire navigateWorkspace with correct slot', () => {
    const handlers = Array.from({ length: 9 }, () => vi.fn());
    handlers.forEach((handler, i) => {
      manager.registerChord(makeChord({
        id: `nav-ws-${i + 1}`,
        leader: 'g',
        follower: String(i + 1),
        handler,
      }));
    });

    // Fire G→3
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '3', bubbles: true }));

    expect(handlers[2]).toHaveBeenCalledOnce();
    // Others should not fire
    handlers.forEach((h, i) => {
      if (i !== 2) expect(h).not.toHaveBeenCalled();
    });
  });

  it('bare G after timeout does nothing', () => {
    const handler = vi.fn();
    manager.registerChord(makeChord({ id: 'nav-home', leader: 'g', follower: 'h', handler }));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }));
    vi.advanceTimersByTime(1500);

    // No handler should have fired
    expect(handler).not.toHaveBeenCalled();
    expect(manager.getChordState()).toBeNull();
  });
});
