/**
 * SegmentedControl Component
 *
 * Generic segmented control with two visual variants:
 * - `topBar` (default): Glassmorphic pill, 44px height — used in the nav row.
 * - `inline`: Solid background, 32px height — used inside panels/forms.
 *
 * Replaces the bespoke ModeSelector with a reusable, type-safe component.
 */

import React, { useState } from 'react';
import {
  colors,
  spaceAround,
  spaceBetween,
  typography,
  transitions,
  borderRadius,
  glass,
  GLASS_BUTTON_HEIGHT,
  GLASS_BUTTON_RADIUS,
} from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface Segment<T extends string = string> {
  key: T;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string = string> {
  segments: Segment<T>[];
  value: T;
  onChange: (key: T) => void;
  variant?: 'topBar' | 'inline';
  size?: 'sm' | 'md';
  disabled?: boolean;
  style?: React.CSSProperties;
  testID?: string;
}

// ============================================================================
// Constants
// ============================================================================

const INLINE_HEIGHT_MD = 32;
const INLINE_HEIGHT_SM = 28;

// ============================================================================
// Component
// ============================================================================

export function SegmentedControl<T extends string = string>({
  segments,
  value,
  onChange,
  variant = 'topBar',
  size = 'md',
  disabled = false,
  style,
  testID,
}: SegmentedControlProps<T>) {
  const isTopBar = variant === 'topBar';
  const isSmall = size === 'sm';

  const containerHeight = isTopBar
    ? GLASS_BUTTON_HEIGHT
    : isSmall ? INLINE_HEIGHT_SM : INLINE_HEIGHT_MD;
  const containerRadius = isTopBar ? GLASS_BUTTON_RADIUS : containerHeight / 2;
  const innerHeight = containerHeight - (isTopBar ? 8 : 4);
  const innerRadius = innerHeight / 2;

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    height: containerHeight,
    borderRadius: isTopBar ? containerRadius : borderRadius.sm,
    padding: isTopBar ? spaceAround.nudge4 : 2,
    gap: isTopBar ? 0 : 2,
    ...(isTopBar
      ? glass.button
      : { backgroundColor: colors.bg.neutral.subtle }),
    ...style,
  };

  return (
    <div style={containerStyle} role="tablist" aria-label="Segmented control" data-testid={testID}>
      {segments.map((segment) => (
        <SegmentButton
          key={segment.key}
          segment={segment}
          isActive={value === segment.key}
          innerHeight={innerHeight}
          innerRadius={innerRadius}
          isTopBar={isTopBar}
          isSmall={isSmall}
          disabled={disabled || segment.disabled}
          testID={testID}
          onClick={() => {
            if (!disabled && !segment.disabled && segment.key !== value) {
              onChange(segment.key);
            }
          }}
        />
      ))}
    </div>
  );
}

SegmentedControl.displayName = 'SegmentedControl';

// ============================================================================
// Segment Button (inner)
// ============================================================================

interface SegmentButtonProps<T extends string> {
  segment: Segment<T>;
  isActive: boolean;
  innerHeight: number;
  innerRadius: number;
  isTopBar: boolean;
  isSmall: boolean;
  disabled?: boolean;
  testID?: string;
  onClick: () => void;
}

function SegmentButton<T extends string>({
  segment,
  isActive,
  innerHeight,
  innerRadius,
  isTopBar,
  isSmall,
  disabled = false,
  testID,
  onClick,
}: SegmentButtonProps<T>) {
  const [isHovered, setIsHovered] = useState(false);

  const buttonStyle: React.CSSProperties = isTopBar
    ? {
        display: 'flex',
        alignItems: 'center',
        gap: spaceBetween.repeating,
        padding: `0 ${spaceAround.default}px`,
        height: innerHeight,
        border: 'none',
        borderRadius: innerRadius,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 14,
        fontFamily: typography.fontFamily.sans,
        fontWeight: isActive ? typography.fontWeight.medium : typography.fontWeight.regular,
        transition: `all ${transitions.fast}`,
        opacity: disabled ? 0.5 : 1,
        backgroundColor: isActive ? 'rgba(0, 0, 0, 0.07)' : 'transparent',
        color: isActive ? colors.fg.neutral.primary : colors.fg.neutral.secondary,
        boxShadow: 'none',
        ...(isHovered && !isActive && !disabled && {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        }),
      }
    : {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: isSmall ? '4px 10px' : '6px 14px',
        borderRadius: borderRadius.sm - 2,
        backgroundColor: isActive ? colors.bg.neutral.base : 'transparent',
        color: isActive ? colors.fg.neutral.primary : colors.fg.neutral.secondary,
        fontSize: isSmall ? 12 : 13,
        fontWeight: isActive ? typography.fontWeight.medium : typography.fontWeight.regular,
        fontFamily: typography.fontFamily.sans,
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: 'none',
        outline: 'none',
        transition: `all ${transitions.fast}`,
        boxShadow: isActive ? '0 1px 2px rgba(0, 0, 0, 0.06)' : 'none',
        whiteSpace: 'nowrap' as const,
        opacity: disabled ? 0.5 : 1,
      };

  const iconStyle: React.CSSProperties = {
    width: 16,
    height: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      style={buttonStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled}
      data-testid={testID ? `${testID}-${segment.key}` : `segment-${segment.key}`}
    >
      {segment.icon && <span style={iconStyle}>{segment.icon}</span>}
      <span>{segment.label}</span>
      {segment.badge !== undefined && segment.badge !== null && (
        <span style={{ display: 'flex', alignItems: 'center', marginLeft: 2 }}>
          {segment.badge}
        </span>
      )}
    </button>
  );
}
