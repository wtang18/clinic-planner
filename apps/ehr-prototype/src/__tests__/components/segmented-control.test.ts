/**
 * SegmentedControl Tests
 *
 * Tests for the generic SegmentedControl component's data structures and logic.
 * Component rendering is tested via runtime (not JSDOM) since TSX imports
 * trigger react-native resolution errors in test environment.
 *
 * Tests cover: segment structure, type safety, and scenario config.
 */

import { describe, it, expect } from 'vitest';
import { WORKFLOW_PHASES } from '../../screens/IntakeView/intakeChecklist';
import type { Segment } from '../../components/primitives/SegmentedControl';
import type { WorkflowPhase } from '../../screens/IntakeView/intakeChecklist';

// ============================================================================
// Segment type validation
// ============================================================================

describe('Segment type structure', () => {
  it('accepts key, label, and optional fields', () => {
    const segment: Segment<'a' | 'b'> = {
      key: 'a',
      label: 'Alpha',
      icon: undefined,
      badge: undefined,
      disabled: false,
    };
    expect(segment.key).toBe('a');
    expect(segment.label).toBe('Alpha');
  });

  it('supports badge as ReactNode (including undefined)', () => {
    const seg: Segment = { key: 'x', label: 'X', badge: undefined };
    expect(seg.badge).toBeUndefined();
  });
});

// ============================================================================
// Workflow phase segments
// ============================================================================

describe('Workflow phase segments', () => {
  const phaseSegments: Segment<WorkflowPhase>[] = WORKFLOW_PHASES.map((p) => ({
    key: p.key,
    label: p.label,
  }));

  it('produces 3 segments for 3 phases', () => {
    expect(phaseSegments).toHaveLength(3);
  });

  it('segments have correct keys', () => {
    expect(phaseSegments.map((s) => s.key)).toEqual(['check-in', 'triage', 'checkout']);
  });

  it('segments have correct labels', () => {
    expect(phaseSegments.map((s) => s.label)).toEqual(['Check-in', 'Triage', 'Checkout']);
  });
});

// ============================================================================
// Mode segments (charting)
// ============================================================================

describe('Charting mode segments', () => {
  type Mode = 'capture' | 'process' | 'review';
  const modeSegments: Segment<Mode>[] = [
    { key: 'capture', label: 'Capture' },
    { key: 'process', label: 'Process' },
    { key: 'review', label: 'Review' },
  ];

  it('produces 3 segments', () => {
    expect(modeSegments).toHaveLength(3);
  });

  it('keys match Mode union', () => {
    const keys = modeSegments.map((s) => s.key);
    expect(keys).toEqual(['capture', 'process', 'review']);
  });
});

// ============================================================================
// Disabled state
// ============================================================================

describe('Segment disabled state', () => {
  it('disabled segment can be created', () => {
    const seg: Segment = { key: 'x', label: 'Disabled', disabled: true };
    expect(seg.disabled).toBe(true);
  });

  it('enabled by default when not specified', () => {
    const seg: Segment = { key: 'x', label: 'Normal' };
    expect(seg.disabled).toBeUndefined();
  });
});
