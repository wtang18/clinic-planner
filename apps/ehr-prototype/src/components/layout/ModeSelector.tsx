/**
 * ModeSelector Component
 *
 * Segmented control for switching between Capture, Process, and Review modes.
 */

import React from 'react';
import { Mic, Brain, FileCheck } from 'lucide-react';
import type { Mode } from '../../state/types';
import { colors, spaceAround, spaceBetween, typography, transitions, glass, GLASS_BUTTON_HEIGHT, GLASS_BUTTON_RADIUS } from '../../styles/foundations';

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
  /** Whether there are unsaved changes (shows warning before mode change) */
  hasUnsavedChanges?: boolean;
  /** Called to confirm mode change when there are unsaved changes */
  onConfirmModeChange?: (newMode: Mode) => Promise<boolean>;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Constants
// ============================================================================

const MODES: { mode: Mode; label: string; description: string }[] = [
  { mode: 'capture', label: 'Capture', description: 'Record encounter data' },
  { mode: 'process', label: 'Process', description: 'Review AI suggestions' },
  { mode: 'review', label: 'Review', description: 'Finalize documentation' },
];

// ============================================================================
// Icons
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

// ============================================================================
// Component
// ============================================================================

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onModeChange,
  disabled = false,
  hasUnsavedChanges = false,
  onConfirmModeChange,
  style,
}) => {
  const [pendingMode, setPendingMode] = React.useState<Mode | null>(null);

  const handleModeClick = async (mode: Mode) => {
    if (disabled || mode === currentMode) return;

    if (hasUnsavedChanges && onConfirmModeChange) {
      setPendingMode(mode);
      const confirmed = await onConfirmModeChange(mode);
      if (confirmed) {
        onModeChange(mode);
      }
      setPendingMode(null);
    } else {
      onModeChange(mode);
    }
  };

  // Glassmorphic pill container (44px height)
  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    height: GLASS_BUTTON_HEIGHT,
    ...glass.button,
    borderRadius: GLASS_BUTTON_RADIUS,
    padding: spaceAround.nudge4,
    ...style,
  };

  // Inner segment buttons (36px to fit within 44px container)
  const innerButtonHeight = GLASS_BUTTON_HEIGHT - 8;
  const innerButtonRadius = (GLASS_BUTTON_HEIGHT - 8) / 2;

  const buttonStyle = (mode: Mode, isActive: boolean, isHovered: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    padding: `0 ${spaceAround.default}px`,
    height: innerButtonHeight,
    backgroundColor: isActive ? colors.bg.neutral.base : 'transparent',
    border: 'none',
    borderRadius: innerButtonRadius,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 14,
    fontWeight: isActive ? typography.fontWeight.medium : typography.fontWeight.regular,
    color: isActive ? colors.fg.neutral.primary : colors.fg.neutral.secondary,
    transition: `all ${transitions.fast}`,
    boxShadow: isActive ? '0 1px 3px 0 rgb(0 0 0 / 0.1)' : 'none',
    opacity: disabled ? 0.5 : 1,
    ...(isHovered && !isActive && !disabled && {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    }),
  });

  const iconStyle: React.CSSProperties = {
    width: '16px',
    height: '16px',
    display: 'flex',
  };

  return (
    <div style={containerStyle} role="tablist" aria-label="Mode selector">
      {MODES.map(({ mode, label }) => {
        const isActive = currentMode === mode;
        const [isHovered, setIsHovered] = React.useState(false);

        return (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`${mode}-panel`}
            style={buttonStyle(mode, isActive, isHovered)}
            onClick={() => handleModeClick(mode)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={disabled}
            data-testid={`mode-${mode}`}
          >
            <span style={iconStyle}>{getModeIcon(mode, 16)}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};

ModeSelector.displayName = 'ModeSelector';
