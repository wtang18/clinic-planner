/**
 * FieldOptionPills — Tappable pill options for a field
 *
 * What: A horizontal row of pill-shaped buttons for selecting field values.
 * Why: Replaces ChipSelect for the V2 omni-input depth-2 view. Supports
 *   both "unselected" (nothing highlighted, pills just visible) and
 *   "pre-selected" (one pill highlighted after [Edit]) states.
 * When to reuse: Any omni-input field row that needs pill-based selection.
 */

import React from 'react';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldOptionPillsProps {
  options: FieldOption[];
  /** null = unselected (nothing highlighted), string = the highlighted value */
  selected: string | null;
  onSelect: (value: string) => void;
  /** Show an "Other" pill with custom text input */
  allowOther?: boolean;
  disabled?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const FieldOptionPills: React.FC<FieldOptionPillsProps> = ({
  options,
  selected,
  onSelect,
  allowOther = false,
  disabled = false,
}) => {
  const [customMode, setCustomMode] = React.useState(false);
  const [customValue, setCustomValue] = React.useState('');
  const customInputRef = React.useRef<HTMLInputElement>(null);

  const isCustomValue = selected !== null && selected !== '' && !options.some(o => o.value === selected);

  React.useEffect(() => {
    if (customMode && customInputRef.current) {
      customInputRef.current.focus();
    }
  }, [customMode]);

  const handlePillClick = (value: string) => {
    if (disabled) return;
    setCustomMode(false);
    setCustomValue('');
    onSelect(value);
  };

  const handleOtherClick = () => {
    if (disabled) return;
    setCustomMode(true);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomValue(val);
    onSelect(val);
  };

  const handleCustomKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setCustomMode(false);
      setCustomValue('');
    }
  };

  // Keyboard navigation across pills
  const handleContainerKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || customMode || selected === null) return;

    const allValues = options.map(o => o.value);
    const currentIndex = allValues.indexOf(selected);

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = currentIndex < allValues.length - 1 ? currentIndex + 1 : 0;
      onSelect(allValues[next]);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = currentIndex > 0 ? currentIndex - 1 : allValues.length - 1;
      onSelect(allValues[prev]);
    }
  };

  return (
    <div
      style={styles.container}
      onKeyDown={handleContainerKeyDown}
      data-testid="field-option-pills"
    >
      {options.map(option => {
        const isActive = selected === option.value;
        return (
          <button
            key={option.value}
            type="button"
            style={{
              ...styles.pill,
              ...(selected === null
                ? styles.pillUnselected
                : isActive
                  ? styles.pillActive
                  : styles.pillInactive),
            }}
            onClick={() => handlePillClick(option.value)}
            disabled={disabled}
            data-testid={`field-pill-${option.value}`}
          >
            {option.label}
          </button>
        );
      })}

      {allowOther && !customMode && (
        <button
          type="button"
          style={{
            ...styles.pill,
            ...(selected === null
              ? styles.pillUnselected
              : isCustomValue
                ? styles.pillActive
                : styles.pillInactive),
            borderStyle: 'dashed',
          }}
          onClick={handleOtherClick}
          disabled={disabled}
          data-testid="field-pill-other"
        >
          Other
        </button>
      )}

      {allowOther && customMode && (
        <input
          ref={customInputRef}
          type="text"
          value={customValue}
          onChange={handleCustomChange}
          onKeyDown={handleCustomKeyDown}
          placeholder="Enter..."
          style={styles.customInput}
          disabled={disabled}
          data-testid="field-pill-custom-input"
        />
      )}
    </div>
  );
};

FieldOptionPills.displayName = 'FieldOptionPills';

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spaceBetween.coupled,
    alignItems: 'center',
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: `${spaceAround.nudge4}px ${spaceAround.tight}px`,
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    borderRadius: borderRadius.full,
    cursor: 'pointer',
    transition: `all ${transitions.fast}`,
    whiteSpace: 'nowrap' as const,
  },
  // Unselected: visible but nothing highlighted — neutral appearance
  pillUnselected: {
    fontWeight: typography.fontWeight.regular,
    color: colors.fg.neutral.secondary,
    backgroundColor: colors.bg.neutral.subtle,
    border: `1px solid ${colors.border.neutral.subtle}`,
  },
  // Active: highlighted in the pre-selected state
  pillActive: {
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.accent.primary,
    backgroundColor: colors.bg.accent.subtle,
    border: `1px solid ${colors.border.accent.low}`,
  },
  // Inactive: dimmed in the pre-selected state (non-selected siblings)
  pillInactive: {
    fontWeight: typography.fontWeight.regular,
    color: colors.fg.neutral.spotReadable,
    backgroundColor: colors.bg.neutral.subtle,
    border: `1px solid ${colors.border.neutral.subtle}`,
    opacity: 0.7,
  },
  customInput: {
    padding: `${spaceAround.nudge4}px ${spaceAround.tight}px`,
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
    backgroundColor: colors.bg.neutral.base,
    border: `1px solid ${colors.border.accent.low}`,
    borderRadius: borderRadius.full,
    outline: 'none',
    width: 120,
  },
};
