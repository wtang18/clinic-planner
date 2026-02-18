/**
 * ToggleSwitch Component
 *
 * Simple on/off toggle for boolean fields.
 * Used for DAW (Rx) and Fasting Required (Lab).
 */

import React from 'react';
import { colors, spaceBetween, typography, transitions } from '../../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface ToggleSwitchProps {
  /** Whether the toggle is on */
  checked: boolean;
  /** Called when toggled */
  onChange: (checked: boolean) => void;
  /** Inline label */
  label?: string;
  /** Disable interaction */
  disabled?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
}) => {
  const handleClick = () => {
    if (!disabled) onChange(!checked);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };

  const trackStyle: React.CSSProperties = {
    position: 'relative',
    width: 36,
    height: 20,
    backgroundColor: checked ? colors.bg.accent.high : colors.bg.neutral.low,
    borderRadius: 10,
    transition: `background-color ${transitions.fast}`,
  };

  const thumbStyle: React.CSSProperties = {
    position: 'absolute',
    top: 2,
    left: checked ? 18 : 2,
    width: 16,
    height: 16,
    backgroundColor: colors.bg.neutral.base,
    borderRadius: 8,
    transition: `left ${transitions.fast}`,
    boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
  };

  return (
    <div
      style={containerStyle}
      role="switch"
      aria-checked={checked}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-testid="toggle-switch"
    >
      <div style={trackStyle}>
        <div style={thumbStyle} />
      </div>
      {label && <span style={labelStyle}>{label}</span>}
    </div>
  );
};

ToggleSwitch.displayName = 'ToggleSwitch';
