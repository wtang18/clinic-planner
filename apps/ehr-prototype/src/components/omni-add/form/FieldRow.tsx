/**
 * FieldRow Component
 *
 * Consistent layout wrapper for label + form control.
 * Provides label, required indicator, hint text, and error display.
 */

import React from 'react';
import { colors, spaceBetween, typography } from '../../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface FieldRowProps {
  /** Field label */
  label: string;
  /** Show required indicator */
  required?: boolean;
  /** Hint text below the control */
  hint?: string;
  /** Error message (replaces hint when present) */
  error?: string;
  /** The form control */
  children: React.ReactNode;
}

// ============================================================================
// Component
// ============================================================================

export const FieldRow: React.FC<FieldRowProps> = ({
  label,
  required = false,
  hint,
  error,
  children,
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.coupled,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
  };

  const hintStyle: React.CSSProperties = {
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    color: error ? colors.fg.alert.secondary : colors.fg.neutral.spotReadable,
  };

  return (
    <div style={containerStyle} data-testid={`field-row-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <label style={labelStyle}>
        {label}
        {required && <span style={{ color: colors.fg.alert.secondary }}> *</span>}
      </label>
      {children}
      {(error || hint) && (
        <span style={hintStyle}>{error || hint}</span>
      )}
    </div>
  );
};

FieldRow.displayName = 'FieldRow';
