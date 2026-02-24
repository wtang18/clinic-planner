/**
 * ModeSelector Component
 *
 * Thin wrapper around SegmentedControl for switching between
 * Capture, Process, and Review modes. Preserves the existing
 * API (currentMode/onModeChange) while using the generic component.
 */

import React from 'react';
import { Mic, Brain, FileCheck } from 'lucide-react';
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

const getModeIcon = (mode: Mode, size: number): React.ReactNode => {
  switch (mode) {
    case 'capture':
      return <Mic size={size} />;
    case 'process':
      return <Brain size={size} />;
    case 'review':
      return <FileCheck size={size} />;
    default:
      return null;
  }
};

const MODE_SEGMENTS: Segment<Mode>[] = [
  { key: 'capture', label: 'Capture', icon: getModeIcon('capture', 16) },
  { key: 'process', label: 'Process', icon: getModeIcon('process', 16) },
  { key: 'review', label: 'Review', icon: getModeIcon('review', 16) },
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
