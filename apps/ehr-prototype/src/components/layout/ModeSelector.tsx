/**
 * ModeSelector Component
 *
 * Segmented control for switching between Capture, Process, and Review modes.
 */

import React from 'react';
import type { Mode } from '../../state/types';
import { colors, spacing, typography, radii, transitions } from '../../styles/tokens';

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

const getModeIcon = (mode: Mode): React.ReactNode => {
  const iconStyle = { width: '100%', height: '100%' };

  switch (mode) {
    case 'capture':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      );
    case 'process':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case 'review':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10,9 9,9 8,9" />
        </svg>
      );
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

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: radii.lg,
    padding: spacing[1],
    ...style,
  };

  const buttonStyle = (mode: Mode, isActive: boolean, isHovered: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    padding: `${spacing[2]} ${spacing[4]}`,
    backgroundColor: isActive ? colors.neutral[0] : 'transparent',
    border: 'none',
    borderRadius: radii.md,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: typography.fontSize.sm[0],
    fontWeight: isActive ? typography.fontWeight.medium : typography.fontWeight.normal,
    color: isActive ? colors.neutral[900] : colors.neutral[600],
    transition: `all ${transitions.fast}`,
    boxShadow: isActive ? '0 1px 3px 0 rgb(0 0 0 / 0.1)' : 'none',
    opacity: disabled ? 0.5 : 1,
    ...(isHovered && !isActive && !disabled && {
      backgroundColor: colors.neutral[200],
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
          >
            <span style={iconStyle}>{getModeIcon(mode)}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};

ModeSelector.displayName = 'ModeSelector';
