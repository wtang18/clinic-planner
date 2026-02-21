/**
 * ChipSelect Component
 *
 * Horizontal chip row for selecting from predefined options.
 * Supports optional custom "Other" entry via inline text input.
 * Used across all detail forms (Rx route/frequency, Lab priority, Dx designation, etc.).
 */

import React from 'react';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions } from '../../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface ChipOption {
  value: string;
  label: string;
}

export interface ChipSelectProps {
  /** Currently selected value */
  value: string;
  /** Available options */
  options: ChipOption[];
  /** Called when selection changes */
  onSelect: (value: string) => void;
  /** Show "Other" chip with custom text input */
  allowCustom?: boolean;
  /** Placeholder for custom input */
  customPlaceholder?: string;
  /** Disable all interaction */
  disabled?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const ChipSelect: React.FC<ChipSelectProps> = ({
  value,
  options,
  onSelect,
  allowCustom = false,
  customPlaceholder = 'Enter value...',
  disabled = false,
}) => {
  const [customMode, setCustomMode] = React.useState(false);
  const [customValue, setCustomValue] = React.useState('');
  const customInputRef = React.useRef<HTMLInputElement>(null);

  // Check if current value is a custom (non-predefined) value
  const isCustomValue = value !== '' && !options.some(o => o.value === value);

  // Initialize custom mode if we start with a custom value
  React.useEffect(() => {
    if (isCustomValue && allowCustom) {
      setCustomMode(true);
      setCustomValue(value);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Focus custom input when entering custom mode
  React.useEffect(() => {
    if (customMode && customInputRef.current) {
      customInputRef.current.focus();
    }
  }, [customMode]);

  const handleChipClick = (optionValue: string) => {
    if (disabled) return;
    setCustomMode(false);
    setCustomValue('');
    onSelect(optionValue);
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
      // Revert to first option
      if (options.length > 0) {
        onSelect(options[0].value);
      }
    }
  };

  // ── Keyboard navigation across chips ──

  const handleContainerKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || customMode) return;

    const allValues = options.map(o => o.value);
    const currentIndex = allValues.indexOf(value);

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = currentIndex < allValues.length - 1 ? currentIndex + 1 : 0;
      onSelect(allValues[next]);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = currentIndex > 0 ? currentIndex - 1 : allValues.length - 1;
      onSelect(allValues[prev]);
    }
  };

  // ── Styles ──

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spaceBetween.coupled,
    alignItems: 'center',
  };

  const chipStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: `${spaceAround.nudge4}px ${spaceAround.tight}px`,
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    fontWeight: isActive ? typography.fontWeight.medium : typography.fontWeight.regular,
    color: isActive ? colors.fg.accent.primary : colors.fg.neutral.secondary,
    backgroundColor: isActive ? colors.bg.accent.medium : colors.bg.neutral.subtle,
    border: `1px solid ${isActive ? colors.border.accent.medium : colors.border.neutral.low}`,
    borderRadius: borderRadius.full,
    cursor: disabled ? 'default' : 'pointer',
    transition: `all ${transitions.fast}`,
    whiteSpace: 'nowrap',
    opacity: disabled ? 0.5 : 1,
  });

  const customInputStyle: React.CSSProperties = {
    padding: `${spaceAround.nudge4}px ${spaceAround.tight}px`,
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
    backgroundColor: colors.bg.neutral.base,
    border: `1px solid ${colors.border.accent.low}`,
    borderRadius: borderRadius.full,
    outline: 'none',
    width: 120,
  };

  return (
    <div
      style={containerStyle}
      role="listbox"
      aria-label="Options"
      onKeyDown={handleContainerKeyDown}
      data-testid="chip-select"
    >
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          role="option"
          aria-selected={value === option.value && !customMode}
          style={chipStyle(value === option.value && !customMode)}
          onClick={() => handleChipClick(option.value)}
          disabled={disabled}
          data-testid={`chip-${option.value}`}
        >
          {option.label}
        </button>
      ))}

      {allowCustom && !customMode && (
        <button
          type="button"
          role="option"
          aria-selected={isCustomValue}
          style={{
            ...chipStyle(isCustomValue),
            borderStyle: 'dashed',
          }}
          onClick={handleOtherClick}
          disabled={disabled}
          data-testid="chip-other"
        >
          Other
        </button>
      )}

      {allowCustom && customMode && (
        <input
          ref={customInputRef}
          type="text"
          value={customValue}
          onChange={handleCustomChange}
          onKeyDown={handleCustomKeyDown}
          placeholder={customPlaceholder}
          style={customInputStyle}
          disabled={disabled}
          data-testid="chip-custom-input"
        />
      )}
    </div>
  );
};

ChipSelect.displayName = 'ChipSelect';
