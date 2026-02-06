/**
 * AvatarWithBadge Component
 *
 * Composite component combining patient initials avatar with status badge.
 *
 * Design Principles:
 * - Avatar circle color = Patient's assigned color (constant across all states)
 * - Status badge = Small indicator anchored to upper-right of avatar
 * - This pattern provides visual continuity when transitioning to mini mode
 */

import React from 'react';
import {
  colors,
  borderRadius,
  typography,
  transitions,
} from '../../../styles/foundations';
import { StatusBadge, type BadgeStatus } from './StatusBadge';

// ============================================================================
// Types
// ============================================================================

export interface AvatarWithBadgeProps {
  /** Patient initials to display */
  initials: string;
  /** Patient's assigned color (constant, not status-dependent) */
  color?: string;
  /** Current recording status for badge */
  status: BadgeStatus;
  /** Avatar size in pixels (default: 32) */
  size?: number;
  /** Whether to show the status badge (default: true) */
  showBadge?: boolean;
  /** Whether the badge should animate (default: false for bar, true for micro) */
  badgeAnimate?: boolean;
  /** Override badge size (default: auto-calculated from avatar size) */
  badgeSize?: number;
  /** Intensity of the badge pulse animation (default: 'normal') */
  badgeIntensity?: 'normal' | 'glow';
  /** Test ID for testing */
  testID?: string;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_AVATAR_SIZE = 32;

// Default patient colors (can be assigned based on patient ID or other logic)
export const PATIENT_COLORS = {
  blue: colors.fg.accent.primary,
  teal: colors.fg.information.primary,
  purple: colors.fg.generative.spotReadable,
  green: colors.fg.positive.primary,
} as const;

// ============================================================================
// Component
// ============================================================================

export const AvatarWithBadge: React.FC<AvatarWithBadgeProps> = ({
  initials,
  color = PATIENT_COLORS.blue,
  status,
  size = DEFAULT_AVATAR_SIZE,
  showBadge = true,
  badgeAnimate = false,
  badgeSize: badgeSizeOverride,
  badgeIntensity = 'normal',
  testID,
}) => {
  // Container styles - relative positioning for badge
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: size,
    height: size,
    flexShrink: 0,
  };

  // Avatar circle styles
  const avatarStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: size,
    height: size,
    backgroundColor: color,
    borderRadius: borderRadius.full,
    color: colors.fg.neutral.inversePrimary,
    fontSize: size <= 32 ? 11 : 14,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    transition: `background-color ${transitions.fast}`,
  };

  // Badge size: use override if provided, otherwise scale with avatar
  const computedBadgeSize = badgeSizeOverride ?? Math.max(10, Math.floor(size * 0.4));

  return (
    <div style={containerStyle} data-testid={testID}>
      {/* Avatar circle */}
      <div style={avatarStyle}>
        {initials}
      </div>

      {/* Status badge (positioned absolute at upper-right) */}
      {showBadge && (
        <StatusBadge
          status={status}
          size={computedBadgeSize}
          animate={badgeAnimate}
          intensity={badgeIntensity}
          testID={testID ? `${testID}-badge` : undefined}
        />
      )}
    </div>
  );
};

AvatarWithBadge.displayName = 'AvatarWithBadge';

export default AvatarWithBadge;
