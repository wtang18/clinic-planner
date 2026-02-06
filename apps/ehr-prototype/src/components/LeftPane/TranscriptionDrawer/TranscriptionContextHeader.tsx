/**
 * TranscriptionContextHeader Component
 *
 * Floating context header showing patient and encounter info.
 * Unlike AI drawer, has no scope controls - transcription is always bound to session's encounter.
 *
 * @see TRANSCRIPTION_DRAWER.md §3 for full specification
 */

import React from 'react';
import { Settings } from 'lucide-react';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface TranscriptionContextHeaderProps {
  /** Patient name */
  patientName: string;
  /** Patient initials (for avatar) */
  patientInitials: string;
  /** Encounter/visit label */
  encounterLabel?: string;
  /** Called when settings button is clicked */
  onOpenSettings?: () => void;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const TranscriptionContextHeader: React.FC<TranscriptionContextHeaderProps> = ({
  patientName,
  patientInitials,
  encounterLabel,
  onOpenSettings,
  style,
  testID,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const containerStyle: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: `1px solid ${colors.border.neutral.low}`,
    ...style,
  };

  const avatarStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.bg.accent.subtle,
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.accent.primary,
  };

  const labelStyle: React.CSSProperties = {
    flex: 1,
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.primary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    border: 'none',
    backgroundColor: isHovered ? colors.bg.neutral.subtle : 'transparent',
    color: isHovered ? colors.fg.neutral.primary : colors.fg.neutral.secondary,
    cursor: 'pointer',
    transition: 'all 150ms ease',
  };

  const contextText = encounterLabel
    ? `${patientName} · ${encounterLabel}`
    : patientName;

  return (
    <header style={containerStyle} data-testid={testID}>
      {/* Patient avatar */}
      <span style={avatarStyle}>{patientInitials}</span>

      {/* Context label */}
      <span style={labelStyle}>{contextText}</span>

      {/* Settings button */}
      {onOpenSettings && (
        <button
          type="button"
          onClick={onOpenSettings}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={buttonStyle}
          title="Transcription settings"
          aria-label="Transcription settings"
        >
          <Settings size={16} />
        </button>
      )}
    </header>
  );
};

TranscriptionContextHeader.displayName = 'TranscriptionContextHeader';
