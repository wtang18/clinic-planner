'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Toggle/Switch component based on Figma specifications
 *
 * FIGMA SPECIFICATIONS:
 * - Medium: Track 48x28px, Thumb 24x24px, 2px padding
 * - Small: Track 32x18px, Thumb 14x14px, 2px padding
 * - Track border radius: 999px (fully rounded)
 * - Thumb border radius: 999px (fully rounded)
 * - Off state: Track bg-[rgba(0,0,0,0.12)], Thumb white
 * - On state: Track bg-[#376c89] (bg-input-high), Thumb white
 * - Disabled: 50% opacity
 * - Smooth transition on state change
 */

const toggleTrackVariants = cva(
  // Base styles for track
  [
    'relative inline-flex shrink-0 rounded-full cursor-pointer',
    'transition-colors duration-200 ease-in-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-a11y-primary)] focus-visible:ring-offset-2',
  ],
  {
    variants: {
      size: {
        small: 'w-8 h-[18px] min-w-[32px]', // 32x18px
        medium: 'w-12 h-7 min-w-[48px]', // 48x28px
      },
      checked: {
        true: 'bg-[var(--color-bg-input-high)] justify-end', // thumb aligned to right
        false: 'bg-[var(--color-bg-transparent-low)] justify-start', // thumb aligned to left
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed',
        false: '',
      },
    },
    compoundVariants: [
      // Hover states for non-disabled toggles
      {
        checked: false,
        disabled: false,
        className: 'hover:bg-[var(--color-bg-transparent-low-accented)]',
      },
      {
        checked: true,
        disabled: false,
        className: 'hover:bg-[var(--color-bg-input-high-accented)]',
      },
    ],
    defaultVariants: {
      size: 'medium',
      checked: false,
      disabled: false,
    },
  }
);

const toggleThumbVariants = cva(
  // Base styles for thumb
  [
    'bg-white rounded-full shadow-sm shrink-0',
  ],
  {
    variants: {
      size: {
        small: 'w-[14px] h-[14px] min-w-[14px]', // 14x14px
        medium: 'w-6 h-6 min-w-[24px]', // 24x24px
      },
    },
    defaultVariants: {
      size: 'medium',
    },
  }
);

export interface ToggleProps
  extends Omit<React.HTMLAttributes<HTMLButtonElement>, 'onChange'>,
    VariantProps<typeof toggleTrackVariants> {
  /**
   * Whether the toggle is checked/on
   */
  checked: boolean;

  /**
   * Callback when toggle state changes
   */
  onChange: (checked: boolean) => void;

  /**
   * Size variant
   * - "small": 32x18px track, 14x14px thumb
   * - "medium": 48x28px track, 24x24px thumb (default)
   */
  size?: 'small' | 'medium';

  /**
   * Whether the toggle is disabled
   */
  disabled?: boolean;

  /**
   * Optional label text
   */
  label?: string;

  /**
   * Label position relative to toggle
   * @default 'right'
   */
  labelPosition?: 'left' | 'right';

  /**
   * Additional CSS classes for the wrapper
   */
  className?: string;

  /**
   * Accessible label (required if no label prop provided)
   */
  'aria-label'?: string;

  /**
   * ID of element describing the toggle
   */
  'aria-describedby'?: string;
}

/**
 * Toggle/Switch component with Figma design system integration
 *
 * @example
 * // Basic toggle
 * const [checked, setChecked] = useState(false);
 * <Toggle checked={checked} onChange={setChecked} label="Enable notifications" />
 *
 * @example
 * // Small toggle without label
 * <Toggle size="small" checked={true} onChange={setChecked} aria-label="Toggle setting" />
 *
 * @example
 * // Disabled toggle
 * <Toggle checked={true} onChange={setChecked} disabled label="Cannot change" />
 */
export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      checked,
      onChange,
      size = 'medium',
      disabled = false,
      label,
      labelPosition = 'right',
      className,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedby,
      ...props
    },
    ref
  ) => {
    // Validation: Toggle requires either label or aria-label
    if (!label && !ariaLabel) {
      console.warn('Toggle: Either "label" or "aria-label" prop is required for accessibility');
    }

    const handleClick = () => {
      if (!disabled) {
        onChange(!checked);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;

      // Handle Space and Enter keys
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onChange(!checked);
      }

      props.onKeyDown?.(e);
    };

    const toggleElement = (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel || label}
        aria-describedby={ariaDescribedby}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        style={{ padding: 'var(--dimension-space-around-4xs)' }}
        className={cn(
          toggleTrackVariants({ size, checked, disabled }),
          !label && className
        )}
        {...props}
      >
        <span
          className={cn(toggleThumbVariants({ size }))}
          aria-hidden="true"
        />
      </button>
    );

    // If no label, return just the toggle
    if (!label) {
      return toggleElement;
    }

    // With label, wrap in container
    return (
      <label
        className={cn(
          'inline-flex items-center gap-2 cursor-pointer',
          disabled && 'cursor-not-allowed',
          className
        )}
      >
        {labelPosition === 'left' && (
          <span className={cn('text-label-sm-medium !text-[var(--color-fg-neutral-primary)]', disabled && 'opacity-50')}>
            {label}
          </span>
        )}
        {toggleElement}
        {labelPosition === 'right' && (
          <span className={cn('text-label-sm-medium !text-[var(--color-fg-neutral-primary)]', disabled && 'opacity-50')}>
            {label}
          </span>
        )}
      </label>
    );
  }
);

Toggle.displayName = 'Toggle';

export { toggleTrackVariants, toggleThumbVariants };
