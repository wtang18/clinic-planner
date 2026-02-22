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
import { useRovingTabindex } from './useRovingTabindex';

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
  /** Color theme: 'light' (default) or 'dark' for palette overlay */
  theme?: 'light' | 'dark';
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
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
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

  // Roving tabindex: ArrowLeft/Right moves focus AND fires onSelect
  const roving = useRovingTabindex({
    count: options.length,
    onArrow: (i) => {
      if (!disabled && !customMode) onSelect(options[i].value);
    },
  });

  // Sync focusedIndex to externally-set `selected` (e.g. [Edit] sets defaults)
  React.useEffect(() => {
    if (selected !== null) {
      const idx = options.findIndex(o => o.value === selected);
      if (idx >= 0) roving.setFocusedIndex(idx);
    }
  }, [selected, options]);

  return (
    <div
      style={styles.container}
      role="radiogroup"
      data-testid="field-option-pills"
    >
      {options.map((option, index) => {
        const isActive = selected === option.value;
        const stateStyles = isDark
          ? (selected === null
            ? darkStyles.pillUnselected
            : isActive ? darkStyles.pillActive : darkStyles.pillInactive)
          : (selected === null
            ? styles.pillUnselected
            : isActive ? styles.pillActive : styles.pillInactive);
        return (
          <button
            key={option.value}
            type="button"
            style={{
              ...styles.pill,
              ...stateStyles,
            }}
            onClick={() => handlePillClick(option.value)}
            disabled={disabled}
            data-testid={`field-pill-${option.value}`}
            {...roving.getRovingProps(index)}
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
            ...(isDark
              ? (selected === null
                ? darkStyles.pillUnselected
                : isCustomValue ? darkStyles.pillActive : darkStyles.pillInactive)
              : (selected === null
                ? styles.pillUnselected
                : isCustomValue ? styles.pillActive : styles.pillInactive)),
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
    backgroundColor: colors.bg.neutral.low,
    border: `1px solid ${colors.border.neutral.low}`,
  },
  // Active: highlighted in the pre-selected state
  pillActive: {
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.accent.primary,
    backgroundColor: colors.bg.accent.medium,
    border: `1px solid ${colors.border.accent.medium}`,
  },
  // Inactive: non-selected siblings in the pre-selected state
  pillInactive: {
    fontWeight: typography.fontWeight.regular,
    color: colors.fg.neutral.secondary,
    backgroundColor: colors.bg.neutral.subtle,
    border: `1px solid ${colors.border.neutral.low}`,
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

// Dark theme pill overrides — used when theme='dark' (AI palette)
const darkStyles: Record<string, React.CSSProperties> = {
  pillUnselected: {
    fontWeight: typography.fontWeight.regular,
    color: 'rgba(255,255,255,0.7)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  pillActive: {
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.accent.primary,
    backgroundColor: colors.bg.accent.medium,
    border: `1px solid ${colors.border.accent.medium}`,
  },
  pillInactive: {
    fontWeight: typography.fontWeight.regular,
    color: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
};
