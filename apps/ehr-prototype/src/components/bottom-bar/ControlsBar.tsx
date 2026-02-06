/**
 * ControlsBar Component
 *
 * Fixed-bottom action bar used inside palette/drawer views.
 * Provides a consistent container for action buttons with proper spacing.
 *
 * Layout:
 * - Left: Secondary actions
 * - Center: Primary status/info
 * - Right: Primary actions
 */

import React from 'react';
import {
  colors,
  borderRadius,
  spaceAround,
  spaceBetween,
  typography,
  glass,
} from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface ControlsBarProps {
  /** Left-aligned content (secondary actions) */
  left?: React.ReactNode;
  /** Center content (status info) */
  center?: React.ReactNode;
  /** Right-aligned content (primary actions) */
  right?: React.ReactNode;
  /** Visual variant */
  variant?: 'dark' | 'light';
  /** Whether to show border at top */
  showBorder?: boolean;
  /** Custom height (defaults to 56px) */
  height?: number;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_HEIGHT = 56;

// ============================================================================
// Component
// ============================================================================

export const ControlsBar: React.FC<ControlsBarProps> = ({
  left,
  center,
  right,
  variant = 'dark',
  showBorder = true,
  height = DEFAULT_HEIGHT,
  style,
  testID,
}) => {
  const isDark = variant === 'dark';

  // Use CSS Grid for true centering - center stays fixed regardless of left/right content
  const containerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',  // Equal outer columns, auto-sized center
    alignItems: 'center',
    height,
    minHeight: height,
    padding: `0 ${spaceAround.default}px`,
    borderTop: showBorder
      ? `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`
      : 'none',
    backgroundColor: isDark
      ? 'rgba(15, 15, 15, 0.5)'
      : 'rgba(255, 255, 255, 0.5)',
    ...style,
  };

  const leftSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: spaceBetween.related,
  };

  const centerSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spaceBetween.related,
  };

  const rightSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spaceBetween.related,
  };

  return (
    <div style={containerStyle} data-testid={testID}>
      <div style={leftSectionStyle}>{left}</div>
      <div style={centerSectionStyle}>{center}</div>
      <div style={rightSectionStyle}>{right}</div>
    </div>
  );
};

ControlsBar.displayName = 'ControlsBar';

// ============================================================================
// Subcomponents
// ============================================================================

export interface ControlsBarButtonProps {
  /** Button label */
  label: string;
  /** Icon (optional) */
  icon?: React.ReactNode;
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** Color variant for parent surface */
  colorScheme?: 'dark' | 'light';
  /** Button size */
  size?: 'sm' | 'md';
  /** Whether button is disabled */
  disabled?: boolean;
  /** Click handler */
  onClick: () => void;
  /** Custom styles */
  style?: React.CSSProperties;
}

const sizeStyles: Record<'sm' | 'md', { height: number; padding: string; fontSize: number }> = {
  sm: { height: 32, padding: '0 12px', fontSize: 13 },
  md: { height: 40, padding: '0 16px', fontSize: 14 },
};

const getVariantStyles = (
  variant: 'primary' | 'secondary' | 'ghost' | 'danger',
  colorScheme: 'dark' | 'light',
  isHovered: boolean
): React.CSSProperties => {
  const isDark = colorScheme === 'dark';

  switch (variant) {
    case 'primary':
      return {
        backgroundColor: isHovered
          ? colors.fg.accent.secondary
          : colors.fg.accent.primary,
        color: colors.fg.neutral.inversePrimary,
        border: 'none',
      };
    case 'secondary':
      return {
        backgroundColor: isHovered
          ? (isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)')
          : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'),
        color: isDark ? colors.fg.neutral.inversePrimary : colors.fg.neutral.primary,
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'}`,
      };
    case 'ghost':
      return {
        backgroundColor: isHovered
          ? (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)')
          : 'transparent',
        color: isDark ? colors.fg.neutral.inversePrimary : colors.fg.neutral.primary,
        border: 'none',
      };
    case 'danger':
      return {
        backgroundColor: isHovered
          ? colors.fg.alert.secondary
          : 'transparent',
        color: isHovered ? colors.fg.neutral.inversePrimary : colors.fg.alert.secondary,
        border: `1px solid ${colors.fg.alert.secondary}`,
      };
    default:
      return {};
  }
};

export const ControlsBarButton: React.FC<ControlsBarButtonProps> = ({
  label,
  icon,
  variant = 'secondary',
  colorScheme = 'dark',
  size = 'md',
  disabled = false,
  onClick,
  style,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const sizeStyle = sizeStyles[size];
  const variantStyle = getVariantStyles(variant, colorScheme, isHovered && !disabled);

  const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spaceBetween.coupled,
    height: sizeStyle.height,
    padding: sizeStyle.padding,
    borderRadius: borderRadius.md,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    fontSize: sizeStyle.fontSize,
    transition: 'all 150ms ease',
    ...variantStyle,
    ...style,
  };

  return (
    <button
      type="button"
      style={buttonStyle}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {icon && <span style={{ display: 'flex' }}>{icon}</span>}
      {label}
    </button>
  );
};

ControlsBarButton.displayName = 'ControlsBarButton';

// ============================================================================
// Status Text Component
// ============================================================================

export interface ControlsBarStatusProps {
  /** Status text */
  text: string;
  /** Icon (optional) */
  icon?: React.ReactNode;
  /** Color variant for parent surface */
  colorScheme?: 'dark' | 'light';
  /** Text color override */
  color?: string;
}

export const ControlsBarStatus: React.FC<ControlsBarStatusProps> = ({
  text,
  icon,
  colorScheme = 'dark',
  color,
}) => {
  const isDark = colorScheme === 'dark';

  const statusStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    color: color || (isDark ? 'rgba(255, 255, 255, 0.6)' : colors.fg.neutral.secondary),
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
  };

  return (
    <span style={statusStyle}>
      {icon && <span style={{ display: 'flex', opacity: 0.8 }}>{icon}</span>}
      {text}
    </span>
  );
};

ControlsBarStatus.displayName = 'ControlsBarStatus';

export default ControlsBar;
