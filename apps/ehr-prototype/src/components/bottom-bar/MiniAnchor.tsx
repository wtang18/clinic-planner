/**
 * MiniAnchor Component
 *
 * 48px circular button used as collapsed/mini state for bottom bar modules.
 * Shows an icon with optional state badge (recording, paused, count, etc.).
 *
 * Design: Concentric circles - 32px icon container inside 48px tap target.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, borderRadius, typography, shadows, transitions, glass } from '../../styles/foundations';
import type { RecordingStatus } from '../../state/bottomBar/types';

// ============================================================================
// Types
// ============================================================================

export type BadgeType =
  | 'none'
  | 'recording'    // Pulsing red dot
  | 'paused'       // Amber dot
  | 'processing'   // Spinner
  | 'count'        // Number badge
  | 'dot';         // Simple indicator dot

export interface MiniAnchorProps {
  /** Icon to display */
  icon: React.ReactNode;
  /** Accessible label */
  label: string;
  /** Badge type to display */
  badge?: BadgeType;
  /** Count for badge (when badge='count') */
  badgeCount?: number;
  /** Custom badge color */
  badgeColor?: string;
  /** Visual variant */
  variant?: 'dark' | 'light';
  /** Whether currently active/focused */
  isActive?: boolean;
  /** Called when anchor is clicked */
  onClick: () => void;
  /** Whether the anchor is disabled */
  disabled?: boolean;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Constants
// ============================================================================

const ANCHOR_SIZE = 48;
const ICON_CONTAINER_SIZE = 32;
const BADGE_SIZE = 14;
const COUNT_BADGE_MIN_WIDTH = 18;

// ============================================================================
// Badge Component
// ============================================================================

interface BadgeDisplayProps {
  type: BadgeType;
  count?: number;
  color?: string;
  variant: 'dark' | 'light';
}

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ type, count, color, variant }) => {
  const isDark = variant === 'dark';

  // Common badge position styles
  const positionStyle: React.CSSProperties = {
    position: 'absolute',
    top: -2,
    right: -2,
    zIndex: 1,
  };

  if (type === 'none') {
    return null;
  }

  if (type === 'recording') {
    return (
      <motion.span
        style={{
          ...positionStyle,
          width: BADGE_SIZE,
          height: BADGE_SIZE,
          backgroundColor: colors.fg.alert.secondary,
          borderRadius: borderRadius.full,
          border: `2px solid ${isDark ? 'rgba(20, 20, 20, 0.9)' : colors.bg.neutral.base}`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.8, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    );
  }

  if (type === 'paused') {
    return (
      <span
        style={{
          ...positionStyle,
          width: BADGE_SIZE,
          height: BADGE_SIZE,
          backgroundColor: colors.fg.attention.primary,
          borderRadius: borderRadius.full,
          border: `2px solid ${isDark ? 'rgba(20, 20, 20, 0.9)' : colors.bg.neutral.base}`,
        }}
      />
    );
  }

  if (type === 'processing') {
    return (
      <motion.span
        style={{
          ...positionStyle,
          width: BADGE_SIZE,
          height: BADGE_SIZE,
          borderTop: `2px solid ${colors.fg.accent.primary}`,
          borderRight: '2px solid transparent',
          borderBottom: '2px solid transparent',
          borderLeft: '2px solid transparent',
          borderRadius: borderRadius.full,
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    );
  }

  if (type === 'count' && count !== undefined && count > 0) {
    const displayCount = count > 99 ? '99+' : String(count);
    return (
      <span
        style={{
          ...positionStyle,
          minWidth: COUNT_BADGE_MIN_WIDTH,
          height: BADGE_SIZE + 2,
          padding: '0 4px',
          backgroundColor: color || colors.fg.accent.primary,
          borderRadius: borderRadius.full,
          border: `2px solid ${isDark ? 'rgba(20, 20, 20, 0.9)' : colors.bg.neutral.base}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.fg.neutral.inversePrimary,
          fontSize: 10,
          fontFamily: typography.fontFamily.sans,
          fontWeight: typography.fontWeight.semibold,
          lineHeight: 1,
        }}
      >
        {displayCount}
      </span>
    );
  }

  if (type === 'dot') {
    return (
      <span
        style={{
          ...positionStyle,
          width: 8,
          height: 8,
          backgroundColor: color || colors.fg.accent.primary,
          borderRadius: borderRadius.full,
          border: `2px solid ${isDark ? 'rgba(20, 20, 20, 0.9)' : colors.bg.neutral.base}`,
        }}
      />
    );
  }

  return null;
};

// ============================================================================
// Component
// ============================================================================

export const MiniAnchor: React.FC<MiniAnchorProps> = ({
  icon,
  label,
  badge = 'none',
  badgeCount,
  badgeColor,
  variant = 'dark',
  isActive = false,
  onClick,
  disabled = false,
  style,
  testID,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isDark = variant === 'dark';

  const getGlassStyle = () => {
    if (isDark) {
      if (isHovered && !disabled) {
        return glass.glassDarkHover;
      }
      return glass.glassDark;
    }
    // Light variant
    if (isHovered && !disabled) {
      return glass.buttonHover;
    }
    return glass.button;
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: ANCHOR_SIZE,
    height: ANCHOR_SIZE,
    borderRadius: borderRadius.full,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    boxShadow: shadows.lg,
    padding: 0,
    transition: `all ${transitions.fast}`,
    ...getGlassStyle(),
    ...style,
  };

  const iconContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: ICON_CONTAINER_SIZE,
    height: ICON_CONTAINER_SIZE,
    color: isDark ? colors.fg.neutral.inversePrimary : colors.fg.neutral.primary,
  };

  return (
    <motion.button
      type="button"
      style={containerStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      disabled={disabled}
      aria-label={label}
      data-testid={testID}
    >
      <span style={iconContainerStyle}>{icon}</span>

      <AnimatePresence>
        <BadgeDisplay
          type={badge}
          count={badgeCount}
          color={badgeColor}
          variant={variant}
        />
      </AnimatePresence>
    </motion.button>
  );
};

MiniAnchor.displayName = 'MiniAnchor';

export default MiniAnchor;
