'use client';

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Icon, type IconName, type IconSize } from "@/design-system/icons";

/**
 * TogglePill component based on Figma specifications
 *
 * Interactive pill that toggles between selected/unselected states
 *
 * FIGMA SPECIFICATIONS:
 * - Unselected: Inset shadow rgba(0,0,0,0.12), text #424242 (fg-neutral-secondary)
 * - Selected: Background #c9e6f0 (bg-input-low), text #181818 (fg-neutral-primary), NO border
 * - Unselected Hover: Inset shadow #181818 (fg-neutral-primary), text same
 * - Selected Hover: Background #b9dfea (bg-input-low-accented), text same, NO border
 * - Disabled Unselected: Inset shadow rgba(0,0,0,0.12), text #a4a4a4 (fg-neutral-disabled)
 * - Disabled Selected: Background rgba(0,0,0,0.06), text #a4a4a4 (fg-neutral-disabled), NO border
 *
 * NOTE: Uses inset box-shadow instead of border to prevent layout shift when toggling states
 * - Sizes: x-small (20px), small (24px), medium (32px), large (40px)
 * - Gap: 4px between elements
 * - Border radius: 4px (x-small), 8px (small/medium/large)
 */

const togglePillVariants = cva(
  // Base styles
  [
    "inline-flex items-center whitespace-nowrap",
    "text-label-sm-medium",
    "transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-a11y-primary)] focus-visible:ring-offset-1",
    "cursor-pointer",
  ],
  {
    variants: {
      // Size variants
      size: {
        "x-small": "h-5 px-1.5 py-0 text-xs leading-5", // 20px height, 6px h-padding, 0 v-padding
        small: "h-6 px-1.5 py-0.5 text-xs leading-5", // 24px height, 6px h-padding, 2px v-padding
        medium: "h-8 px-2 py-1.5 text-sm leading-5", // 32px height, 8px h-padding, 6px v-padding
        large: "h-10 px-3 py-2.5 text-sm leading-5", // 40px height, 12px h-padding, 10px v-padding
      },
      // Selected state
      selected: {
        false: "shadow-[inset_0_0_0_1px_var(--color-fg-transparent-soft)] !text-[var(--color-fg-neutral-secondary)] hover:shadow-[inset_0_0_0_1px_var(--color-fg-transparent-medium)]",
        true: "bg-[var(--color-bg-input-low)] !text-[var(--color-fg-neutral-primary)] hover:bg-[var(--color-bg-input-low-accented)]",
      },
      // Disabled state
      disabled: {
        false: "",
        true: "cursor-not-allowed pointer-events-none",
      },
    },
    // Compound variants for disabled states
    compoundVariants: [
      {
        disabled: true,
        selected: false,
        className: "!shadow-[inset_0_0_0_1px_var(--color-fg-transparent-soft)] !text-[var(--color-fg-neutral-disabled)] hover:!shadow-[inset_0_0_0_1px_var(--color-fg-transparent-soft)]",
      },
      {
        disabled: true,
        selected: true,
        className: "!bg-[var(--color-bg-neutral-subtle)] !text-[var(--color-fg-neutral-disabled)] hover:!bg-[var(--color-bg-neutral-subtle)]",
      },
    ],
    defaultVariants: {
      size: "medium",
      selected: false,
      disabled: false,
    },
  }
);

export interface TogglePillProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'>,
    VariantProps<typeof togglePillVariants> {
  /**
   * Size variant
   * - "x-small": 20px height, 12px text, no icons recommended
   * - "small": 24px height, 12px text
   * - "medium": 32px height, 14px text (default)
   * - "large": 40px height, 14px text
   */
  size?: 'x-small' | 'small' | 'medium' | 'large';

  /**
   * Main label text
   */
  label: string;

  /**
   * Left icon name from Icon system
   */
  iconL?: IconName;

  /**
   * Custom left icon (React element or component)
   * Alternative to iconL
   */
  leftIcon?: React.ReactNode;

  /**
   * Right icon name from Icon system
   */
  iconR?: IconName;

  /**
   * Custom right icon (React element or component)
   * Alternative to iconR
   */
  rightIcon?: React.ReactNode;

  /**
   * Left subtext content
   */
  leftSubtext?: string;

  /**
   * Right subtext content
   */
  rightSubtext?: string;

  /**
   * Whether the pill is selected
   */
  selected: boolean;

  /**
   * Callback when selection state changes
   */
  onChange?: (selected: boolean) => void;

  /**
   * Whether the pill is disabled
   */
  disabled?: boolean;

  /**
   * Accessible label
   */
  'aria-label'?: string;

  /**
   * ID of element describing the pill
   */
  'aria-describedby'?: string;
}

/**
 * TogglePill component - Interactive pill with toggle functionality
 *
 * Similar to Pill component but renders as a button with selectable state.
 * Supports icons and subtexts like regular Pill.
 *
 * @example
 * // Basic toggle pill
 * const [selected, setSelected] = useState(false);
 * <TogglePill
 *   label="Filter"
 *   selected={selected}
 *   onChange={setSelected}
 * />
 *
 * @example
 * // With icons
 * <TogglePill
 *   iconL="checkmark"
 *   label="Active"
 *   selected={true}
 *   onChange={setSelected}
 * />
 *
 * @example
 * // Filter group
 * <TogglePill label="All" selected={filter === 'all'} onChange={() => setFilter('all')} />
 * <TogglePill label="Active" selected={filter === 'active'} onChange={() => setFilter('active')} />
 */
export const TogglePill = React.forwardRef<HTMLButtonElement, TogglePillProps>(
  (
    {
      size = "medium",
      label,
      iconL,
      leftIcon,
      iconR,
      rightIcon,
      leftSubtext,
      rightSubtext,
      selected,
      onChange,
      disabled = false,
      className,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedby,
      onClick,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    // Icon size is always small (20px) for pills
    const iconSize: IconSize = "small";

    // Render icons with correct size
    const renderedLeftIcon = iconL ? <Icon name={iconL} size={iconSize} /> : leftIcon;
    const renderedRightIcon = iconR ? <Icon name={iconR} size={iconSize} /> : rightIcon;

    // Icon visibility logic
    const hasLeftIcon = !!(iconL || leftIcon);
    const hasRightIcon = !!(iconR || rightIcon);
    const shouldShowLeftIcon = hasLeftIcon && size !== "x-small";
    const shouldShowRightIcon = hasRightIcon && size !== "x-small";

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && onChange) {
        onChange(!selected);
      }
      onClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (!disabled && onChange) {
        // Handle Space and Enter for toggle
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onChange(!selected);
        }
      }
      onKeyDown?.(e);
    };

    // Dimension token styles based on size
    const dimensionStyles: React.CSSProperties = {
      gap: 'var(--dimension-space-between-coupled)',
      borderRadius: size === "x-small"
        ? 'var(--dimension-radius-xs)'
        : 'var(--dimension-radius-sm)',
    };

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={selected}
        aria-label={ariaLabel || label}
        aria-describedby={ariaDescribedby}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        style={dimensionStyles}
        className={cn(
          togglePillVariants({
            size,
            selected,
            disabled,
          }),
          className
        )}
        {...props}
      >
        {/* Left icon */}
        {shouldShowLeftIcon && renderedLeftIcon}

        {/* Left subtext */}
        {leftSubtext && (
          <span className="font-normal shrink-0">
            {leftSubtext}
          </span>
        )}

        {/* Main label */}
        <span>{label}</span>

        {/* Right subtext */}
        {rightSubtext && (
          <span className="font-normal shrink-0">
            {rightSubtext}
          </span>
        )}

        {/* Right icon */}
        {shouldShowRightIcon && renderedRightIcon}
      </button>
    );
  }
);

TogglePill.displayName = "TogglePill";

export { togglePillVariants };
