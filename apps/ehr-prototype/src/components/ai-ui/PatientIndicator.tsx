/**
 * PatientIndicator Component
 *
 * Patient avatar and name display for the minibar.
 * Shows which patient is being recorded with recording pulse animation.
 */

import React from 'react';
import { User } from 'lucide-react';
import { colors, borderRadius, spaceAround, spaceBetween, typography, transitions } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface PatientIndicatorProps {
  /** Patient name */
  name: string;
  /** Patient initials (for avatar) */
  initials?: string;
  /** Avatar color */
  avatarColor?: string;
  /** Whether recording is active for this patient */
  isRecording?: boolean;
  /** Whether there's a mismatch (viewing different patient than recording) */
  hasMismatch?: boolean;
  /** Mismatch warning text */
  mismatchText?: string;
  /** Called when the indicator is clicked */
  onClick?: () => void;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const PatientIndicator: React.FC<PatientIndicatorProps> = ({
  name,
  initials,
  avatarColor = colors.fg.accent.primary,
  isRecording = false,
  hasMismatch = false,
  mismatchText,
  onClick,
  style,
  testID,
}) => {
  const displayInitials = initials || name.split(' ').map(n => n[0]).join('').slice(0, 2);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.nudge4}px ${spaceAround.tight}px`,
    backgroundColor: hasMismatch ? colors.bg.attention.subtle : 'transparent',
    borderRadius: borderRadius.sm,
    cursor: onClick ? 'pointer' : 'default',
    transition: `background-color ${transitions.fast}`,
    position: 'relative' as const,
    ...style,
  };

  const avatarContainerStyle: React.CSSProperties = {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const avatarStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    backgroundColor: avatarColor,
    borderRadius: borderRadius.full,
    color: colors.fg.neutral.inversePrimary,
    fontSize: 10,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    flexShrink: 0,
  };

  const pulseRingStyle: React.CSSProperties = {
    position: 'absolute' as const,
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: borderRadius.full,
    border: `2px solid ${colors.fg.alert.secondary}`,
    animation: isRecording ? 'patientIndicatorPulse 1.5s ease-in-out infinite' : 'none',
    opacity: isRecording ? 1 : 0,
  };

  const nameStyle: React.CSSProperties = {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: hasMismatch ? colors.fg.attention.primary : colors.fg.neutral.inversePrimary,
    maxWidth: 100,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const mismatchBadgeStyle: React.CSSProperties = {
    position: 'absolute' as const,
    top: -8,
    right: -8,
    width: 16,
    height: 16,
    backgroundColor: colors.bg.attention.medium,
    color: colors.fg.neutral.inversePrimary,
    borderRadius: borderRadius.full,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <>
      <style>{`
        @keyframes patientIndicatorPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.15);
          }
        }
      `}</style>

      <div
        style={containerStyle}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={(e) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
          }
        }}
        title={hasMismatch ? mismatchText || 'Recording patient differs from viewed patient' : name}
        data-testid={testID}
      >
        <div style={avatarContainerStyle}>
          <span style={pulseRingStyle} />
          <span style={avatarStyle}>{displayInitials}</span>
        </div>

        <span style={nameStyle}>{name}</span>

        {hasMismatch && (
          <span style={mismatchBadgeStyle}>!</span>
        )}
      </div>
    </>
  );
};

PatientIndicator.displayName = 'PatientIndicator';
