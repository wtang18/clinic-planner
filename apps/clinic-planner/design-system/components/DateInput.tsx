'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Icon, type IconSize } from '@carbon-health/design-icons';

// DateInput variant styles using cva (matches Input component)
const dateInputContainerVariants = cva(
  // Base styles - common to all variants
  [
    'box-border flex items-center transition-all duration-200',
    'outline-none',
    'w-full',
    'relative',
  ],
  {
    variants: {
      type: {
        outlined: [
          'border border-solid border-transparent',
          'bg-transparent',
        ],
        filled: [
          'border-0',
          'bg-[var(--color-bg-transparent-subtle)]',
        ],
      },
      size: {
        small: 'h-8',
        medium: 'h-10',
        large: 'h-14',
      },
      state: {
        default: '',
        hover: '',
        focused: '',
        error: '',
        disabled: '',
      },
    },
    compoundVariants: [
      // Outlined type states
      {
        type: 'outlined',
        state: 'default',
        className: 'shadow-[0_0_0_1px_var(--color-bg-neutral-low)]',
      },
      {
        type: 'outlined',
        state: 'hover',
        className: 'shadow-[0_0_0_1px_var(--color-bg-neutral-medium)]',
      },
      {
        type: 'outlined',
        state: 'focused',
        className: 'shadow-[0_0_0_2px_var(--color-bg-input-high)]',
      },
      {
        type: 'outlined',
        state: 'error',
        className: 'shadow-[0_0_0_1px_var(--color-bg-alert-high)]',
      },
      {
        type: 'outlined',
        state: 'disabled',
        className: 'shadow-[0_0_0_1px_var(--color-bg-transparent-low)]',
      },
      // Filled type states
      {
        type: 'filled',
        state: 'hover',
        className: 'bg-[var(--color-bg-transparent-low)]',
      },
      {
        type: 'filled',
        state: 'focused',
        className: 'bg-[var(--color-bg-input-low)]',
      },
      {
        type: 'filled',
        state: 'error',
        className: 'bg-[var(--color-bg-alert-low)]',
      },
      {
        type: 'filled',
        state: 'disabled',
        className: 'bg-[var(--color-bg-neutral-disabled)]',
      },
    ],
    defaultVariants: {
      type: 'outlined',
      size: 'medium',
      state: 'default',
    },
  }
);

const dateInputFieldVariants = cva(
  [
    'w-full bg-transparent border-0 outline-none',
    'font-normal appearance-none',
    'pr-10', // Reserve space for calendar icon
    // Hide native calendar icon
    '[&::-webkit-calendar-picker-indicator]:opacity-0',
    '[&::-webkit-calendar-picker-indicator]:absolute',
    '[&::-webkit-calendar-picker-indicator]:inset-0',
    '[&::-webkit-calendar-picker-indicator]:w-full',
    '[&::-webkit-calendar-picker-indicator]:h-full',
    '[&::-webkit-calendar-picker-indicator]:cursor-pointer',
  ],
  {
    variants: {
      size: {
        small: 'text-body-sm-regular px-3 py-1.5',
        medium: 'text-body-sm-regular px-3 py-2.5',
        large: 'text-body-md-regular px-4 py-4',
      },
      state: {
        default: '!text-[var(--color-fg-neutral-primary)]',
        hover: '!text-[var(--color-fg-neutral-primary)]',
        focused: '!text-[var(--color-fg-neutral-primary)]',
        error: '!text-[var(--color-fg-neutral-primary)]',
        disabled: '!text-[var(--color-fg-neutral-secondary)] cursor-not-allowed',
      },
    },
    defaultVariants: {
      size: 'medium',
      state: 'default',
    },
  }
);

const labelVariants = cva(
  [
    'text-label-sm-medium',
    'transition-colors duration-200',
  ],
  {
    variants: {
      state: {
        default: '!text-[var(--color-fg-neutral-tertiary)]',
        hover: '!text-[var(--color-fg-neutral-primary)]',
        focused: '!text-[var(--color-fg-neutral-tertiary)]',
        error: '!text-[var(--color-fg-alert-high)]',
        disabled: '!text-[var(--color-fg-neutral-disabled)]',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  }
);

const helperTextVariants = cva(
  [
    'text-body-sm-regular',
    'transition-colors duration-200',
  ],
  {
    variants: {
      state: {
        default: '!text-[var(--color-fg-neutral-tertiary)]',
        hover: '!text-[var(--color-fg-neutral-tertiary)]',
        focused: '!text-[var(--color-fg-neutral-tertiary)]',
        error: '!text-[var(--color-fg-alert-high)]',
        disabled: '!text-[var(--color-fg-neutral-disabled)]',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  }
);

export interface DateInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>,
    VariantProps<typeof dateInputContainerVariants> {
  /**
   * Visual type of the date input
   * - "outlined": Border with transparent background
   * - "filled": Filled background with no border
   */
  type?: 'outlined' | 'filled';

  /**
   * Size variant
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Label text displayed above the date input
   */
  label?: string;

  /**
   * Helper text displayed below the date input
   */
  helperText?: string;

  /**
   * Error state
   */
  error?: boolean;

  /**
   * Error message (replaces helperText when error=true)
   */
  errorMessage?: string;

  /**
   * Class name for the wrapper div
   */
  wrapperClassName?: string;

  /**
   * Class name for the date input container
   */
  containerClassName?: string;

  /**
   * ID for the date input element
   */
  id?: string;

  /**
   * aria-label for the date input
   */
  'aria-label'?: string;

  /**
   * aria-describedby for the date input
   */
  'aria-describedby'?: string;

  /**
   * Required field
   */
  required?: boolean;
}

/**
 * DateInput component based on Input design system
 *
 * Uses native HTML5 date picker with custom design system styling.
 * Matches Input component styling and behavior for consistency.
 *
 * @example
 * // Basic date input
 * <DateInput
 *   label="Event Date"
 *   value={date}
 *   onChange={(e) => setDate(e.target.value)}
 * />
 *
 * @example
 * // With error
 * <DateInput
 *   label="Start Date"
 *   value={startDate}
 *   onChange={(e) => setStartDate(e.target.value)}
 *   error
 *   errorMessage="Please select a valid date"
 * />
 */
export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  (
    {
      // Core variant props
      type = 'outlined',
      size = 'medium',

      // Label and helper text
      label,
      helperText,
      error = false,
      errorMessage,

      // Container props
      wrapperClassName,
      containerClassName,

      // Input props
      id: providedId,
      disabled = false,
      required = false,
      className,

      // Accessibility
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedby,

      // Event handlers
      onFocus,
      onBlur,

      ...props
    },
    ref
  ) => {
    // Generate unique IDs for accessibility
    const reactId = React.useId();
    const inputId = providedId || `date-input-${reactId}`;
    const helperTextId = `date-input-helper-${reactId}`;
    const errorTextId = `date-input-error-${reactId}`;

    // State management
    const [isFocused, setIsFocused] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);
    const [showFocusRing, setShowFocusRing] = React.useState(false);
    const hadKeyboardEventRef = React.useRef(false);
    const hadMouseDownRef = React.useRef(false);

    // Track keyboard/mouse interaction to determine focus-visible
    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          hadKeyboardEventRef.current = true;
          hadMouseDownRef.current = false;
        }
      };

      const handleMouseDown = () => {
        hadMouseDownRef.current = true;
        hadKeyboardEventRef.current = false;
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('mousedown', handleMouseDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('mousedown', handleMouseDown);
      };
    }, []);

    // Determine current state
    const currentState = React.useMemo(() => {
      if (disabled) return 'disabled';
      if (error) return 'error';
      if (isFocused) return 'focused';
      if (isHovered) return 'hover';
      return 'default';
    }, [disabled, error, isFocused, isHovered]);

    // Event handlers
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      // Show focus ring only if last interaction was keyboard (Tab key)
      setShowFocusRing(hadKeyboardEventRef.current && !hadMouseDownRef.current);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setShowFocusRing(false);
      onBlur?.(e);
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
    };

    // Icon size based on input size
    const iconSize: IconSize = size === 'large' ? 'medium' : 'small';

    // Determine helper/error text to display
    const displayHelperText = error && errorMessage ? errorMessage : helperText;
    const helperTextIdToUse = error && errorMessage ? errorTextId : helperTextId;

    return (
      <div
        className={cn('flex flex-col', wrapperClassName)}
        style={{ gap: 'var(--dimension-space-between-coupled)' }}
      >
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(labelVariants({ state: currentState }))}
          >
            {label}
          </label>
        )}

        {/* DateInput Container */}
        <div
          style={{
            borderRadius: 'var(--dimension-radius-sm)',
          }}
          className={cn(
            dateInputContainerVariants({
              type,
              size,
              state: currentState,
            }),
            showFocusRing && 'ring-2 ring-[var(--color-a11y-primary)] ring-offset-2',
            containerClassName
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* DateInput Field */}
          <input
            ref={ref}
            type="date"
            id={inputId}
            disabled={disabled}
            required={required}
            aria-label={ariaLabel}
            aria-describedby={
              displayHelperText
                ? cn(ariaDescribedby, helperTextIdToUse)
                : ariaDescribedby
            }
            aria-invalid={error ? true : undefined}
            aria-required={required ? true : undefined}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
              dateInputFieldVariants({ size, state: currentState }),
              className
            )}
            {...props}
          />

          {/* Calendar Icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
            <Icon name="calendar" size={iconSize} />
          </div>
        </div>

        {/* Helper Text / Error Message */}
        {displayHelperText && (
          <p
            id={helperTextIdToUse}
            className={cn(helperTextVariants({ state: currentState }))}
          >
            {displayHelperText}
          </p>
        )}
      </div>
    );
  }
);

DateInput.displayName = 'DateInput';

export { dateInputContainerVariants, dateInputFieldVariants };
