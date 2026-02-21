/**
 * FieldRow (V2) — Label + FieldOptionPills
 *
 * What: A label-and-pills wrapper for omni-input depth-2 field editing.
 * Why: Different from `form/FieldRow.tsx` (which wraps arbitrary children).
 *   This version integrates directly with FieldOptionPills for the V2
 *   browse/edit pattern where field rows show pill options.
 * When to reuse: Any depth-2 field row in the omni-input detail area.
 *
 * Note: `form/FieldRow.tsx` remains for the old detail forms. Both coexist
 * until Phase 4 cleanup.
 */

import React from 'react';
import { FieldOptionPills, type FieldOption } from './FieldOptionPills';
import { colors, spaceBetween, typography } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface FieldRowProps {
  /** Field label displayed to the left of pills */
  label: string;
  /** Available options */
  options: FieldOption[];
  /** null = unselected mode, string = pre-selected value */
  selected: string | null;
  /** Called when user taps a pill */
  onSelect: (value: string) => void;
  /** Show "Other" pill for custom entry */
  allowOther?: boolean;
  disabled?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const FieldRow: React.FC<FieldRowProps> = ({
  label,
  options,
  selected,
  onSelect,
  allowOther = false,
  disabled = false,
}) => {
  return (
    <div
      style={styles.container}
      data-testid={`v2-field-row-${label.toLowerCase().replace(/\s+/g, '-')}`}
      data-omni-section
    >
      <span style={styles.label}>{label}</span>
      <FieldOptionPills
        options={options}
        selected={selected}
        onSelect={onSelect}
        allowOther={allowOther}
        disabled={disabled}
      />
    </div>
  );
};

FieldRow.displayName = 'FieldRow';

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    minHeight: 28,
  },
  label: {
    fontSize: 12,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    minWidth: 72,
    flexShrink: 0,
  },
};
