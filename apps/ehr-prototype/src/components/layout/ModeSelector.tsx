/**
 * ModeSelector Component
 *
 * Thin wrapper around SegmentedControl for switching between
 * Capture, Process, and Review modes. Preserves the existing
 * API (currentMode/onModeChange) while using the generic component.
 */

import React from 'react';
import type { Mode } from '../../state/types';
import { SegmentedControl, type Segment } from '../primitives/SegmentedControl';

// ============================================================================
// Types
// ============================================================================

export interface ModeSelectorProps {
  /** Current mode */
  currentMode: Mode;
  /** Called when mode changes */
  onModeChange: (mode: Mode) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Constants
// ============================================================================

const MODE_SEGMENTS: Segment<Mode>[] = [
  { key: 'capture', label: 'Capture' },
  { key: 'process', label: 'Process' },
  { key: 'review', label: 'Review' },
];

// ============================================================================
// Component
// ============================================================================

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onModeChange,
  disabled = false,
  style,
}) => {
  return (
    <SegmentedControl<Mode>
      segments={MODE_SEGMENTS}
      value={currentMode}
      onChange={onModeChange}
      variant="topBar"
      disabled={disabled}
      style={style}
    />
  );
};

ModeSelector.displayName = 'ModeSelector';
