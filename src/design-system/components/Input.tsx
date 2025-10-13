'use client';
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Icon, type IconName, type IconSize } from "@/design-system/icons";

// Generate unique IDs for accessibility
let inputIdCounter = 0;
const generateId = (prefix: string) => {
  inputIdCounter += 1;
  return `${prefix}-${inputIdCounter}`;
};

// Input variant styles using cva
const inputContainerVariants = cva(
  // Base styles - common to all variants
  [
    "box-border flex items-center transition-all duration-200",
    "outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--color-a11y-primary)] has-[:focus-visible]:ring-offset-2",
    "w-full",
  ],
  {
    variants: {
      type: {
        outlined: [
          // Use transparent border + box-shadow to prevent size jumping
          "border border-solid border-transparent",
          "bg-transparent",
        ],
        filled: [
          "border-0",
          "bg-[var(--color-bg-transparent-subtle)]",
        ],
      },
      size: {
        small: "h-8 px-3 py-1.5",
        medium: "h-10 px-3 py-2.5",
        large: "h-14 px-4 py-4",
      },
      state: {
        default: "",
        hover: "",
        focused: "",
        error: "",
        disabled: "",
      },
    },
    compoundVariants: [
      // Outlined type states (using box-shadow to prevent size jumping)
      {
        type: "outlined",
        state: "default",
        className: "shadow-[0_0_0_1px_var(--color-bg-neutral-low)]",
      },
      {
        type: "outlined",
        state: "hover",
        className: "shadow-[0_0_0_1px_var(--color-bg-neutral-medium)]",
      },
      {
        type: "outlined",
        state: "focused",
        className: "shadow-[0_0_0_2px_var(--color-bg-input-high)]",
      },
      {
        type: "outlined",
        state: "error",
        className: "shadow-[0_0_0_1px_var(--color-bg-alert-high)]",
      },
      {
        type: "outlined",
        state: "disabled",
        className: "shadow-[0_0_0_1px_var(--color-bg-transparent-low)]",
      },
      // Filled type states (no borders)
      {
        type: "filled",
        state: "hover",
        className: "bg-[var(--color-bg-transparent-low)]",
      },
      {
        type: "filled",
        state: "focused",
        className: "bg-[var(--color-bg-input-low)]",
      },
      {
        type: "filled",
        state: "error",
        className: "bg-[var(--color-bg-alert-low)]",
      },
      {
        type: "filled",
        state: "disabled",
        className: "bg-[var(--color-bg-neutral-disabled)]",
      },
    ],
    defaultVariants: {
      type: "outlined",
      size: "medium",
      state: "default",
    },
  }
);

const inputFieldVariants = cva(
  [
    "w-full bg-transparent border-0 outline-none",
    "font-normal",
    "placeholder:transition-colors placeholder:duration-200",
  ],
  {
    variants: {
      size: {
        // Body/Sm Regular: 14px / 20px line height
        small: "text-body-sm-regular",
        medium: "text-body-sm-regular",
        // Body/Md Regular: 16px / 24px line height
        large: "text-body-md-regular",
      },
      state: {
        default: "!text-[var(--color-fg-neutral-primary)] placeholder:!text-[var(--color-fg-transparent-strong)]",
        hover: "!text-[var(--color-fg-neutral-primary)] placeholder:!text-[var(--color-fg-transparent-strong)]",
        focused: "!text-[var(--color-fg-neutral-primary)] placeholder:!text-[var(--color-fg-transparent-strong)]",
        error: "!text-[var(--color-fg-neutral-primary)] placeholder:!text-[var(--color-fg-transparent-strong)]",
        disabled: "!text-[var(--color-fg-neutral-secondary)] placeholder:!text-[var(--color-fg-transparent-strong)] cursor-not-allowed",
      },
    },
    defaultVariants: {
      size: "medium",
      state: "default",
    },
  }
);

const labelVariants = cva(
  [
    // Label/Sm Medium: 14px / 20px line height, Medium weight 500
    "text-label-sm-medium",
    "transition-colors duration-200",
  ],
  {
    variants: {
      state: {
        default: "!text-[var(--color-fg-neutral-tertiary)]",
        hover: "!text-[var(--color-fg-neutral-primary)]",
        focused: "!text-[var(--color-fg-neutral-tertiary)]",
        error: "!text-[var(--color-fg-alert-high)]",
        disabled: "!text-[var(--color-fg-neutral-disabled)]",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
);

const helperTextVariants = cva(
  [
    // Body/Sm Regular: 14px / 20px line height
    "text-body-sm-regular",
    "transition-colors duration-200",
  ],
  {
    variants: {
      state: {
        default: "!text-[var(--color-fg-neutral-tertiary)]",
        hover: "!text-[var(--color-fg-neutral-tertiary)]",
        focused: "!text-[var(--color-fg-neutral-tertiary)]",
        error: "!text-[var(--color-fg-alert-high)]",
        disabled: "!text-[var(--color-fg-neutral-disabled)]",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
);

const subtextVariants = cva(
  [
    "shrink-0 whitespace-nowrap",
  ],
  {
    variants: {
      size: {
        // Body/Sm Regular: 14px / 20px line height
        small: "text-body-sm-regular",
        medium: "text-body-sm-regular",
        // Body/Md Regular: 16px / 24px line height
        large: "text-body-md-regular",
      },
      state: {
        default: "!text-[var(--color-fg-neutral-tertiary)]",
        hover: "!text-[var(--color-fg-neutral-tertiary)]",
        focused: "!text-[var(--color-fg-neutral-tertiary)]",
        error: "!text-[var(--color-fg-neutral-tertiary)]",
        disabled: "!text-[var(--color-fg-neutral-disabled)]",
      },
    },
    defaultVariants: {
      size: "medium",
      state: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputContainerVariants> {
  // Core variant props
  /**
   * Visual type of the input
   * - "outlined": Border with transparent background
   * - "filled": Filled background with no border (adds border on focus/error)
   */
  type?: "outlined" | "filled";

  /**
   * Size variant
   * - "small": 32px height, 12px h-padding, 6px v-padding
   * - "medium": 40px height, 12px h-padding, 10px v-padding
   * - "large": 56px height, 16px h-padding, 16px v-padding
   */
  size?: "small" | "medium" | "large";

  // Label and helper text
  /**
   * Label text displayed above the input
   */
  label?: string;

  /**
   * Helper text displayed below the input
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

  // Icons
  /**
   * Left icon name from Icon system
   */
  leftIcon?: IconName;

  /**
   * Right icon name from Icon system
   */
  rightIcon?: IconName;

  // Subtext (inside field)
  /**
   * Left subtext (small text inside field, e.g., "$")
   */
  leftSubtext?: string;

  /**
   * Right subtext (small text inside field, e.g., "%")
   */
  rightSubtext?: string;

  // Container props
  /**
   * Class name for the wrapper div
   */
  wrapperClassName?: string;

  /**
   * Class name for the input container
   */
  containerClassName?: string;

  // Accessibility
  /**
   * ID for the input element
   */
  id?: string;

  /**
   * aria-label for the input
   */
  "aria-label"?: string;

  /**
   * aria-describedby for the input
   */
  "aria-describedby"?: string;

  /**
   * Required field
   */
  required?: boolean;
}

/**
 * Input component based on Figma design system
 *
 * FIGMA SPECIFICATIONS:
 * - Border Radius: 8px
 * - Icon Size: 20px (small/medium), 24px (large)
 * - Gap between elements: 8px
 * - Focus border: 2px solid #6ab0ca
 * - Error border: 1px solid #b33f3b (outlined), 2px solid #b33f3b (filled on focus)
 *
 * SIZE SPECIFICATIONS:
 * - Small: Height 32px, Padding 6px 12px, Text 14px
 * - Medium: Height 40px, Padding 10px 12px, Text 14px
 * - Large: Height 56px, Padding 16px 16px, Text 16px
 *
 * STATE SPECIFICATIONS:
 * - Default: Border rgba(0,0,0,0.24), Label #676767
 * - Hover: Border rgba(0,0,0,0.36), Label #181818
 * - Focused: Border 2px #6ab0ca
 * - Error: Border #b33f3b, Label/Helper #b33f3b
 * - Disabled: Border rgba(0,0,0,0.12), Label #a4a4a4, Text #424242
 *
 * @example
 * // Basic input
 * <Input label="Email" placeholder="Enter email" />
 *
 * @example
 * // Input with error
 * <Input label="Password" error errorMessage="Password is required" />
 *
 * @example
 * // Input with icons
 * <Input label="Search" leftIcon="search" rightIcon="close" />
 *
 * @example
 * // Input with subtext
 * <Input label="Price" leftSubtext="$" rightSubtext="USD" />
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      // Core variant props
      type = "outlined",
      size = "medium",

      // Label and helper text
      label,
      helperText,
      error = false,
      errorMessage,

      // Icons
      leftIcon,
      rightIcon,

      // Subtext
      leftSubtext,
      rightSubtext,

      // Container props
      wrapperClassName,
      containerClassName,

      // Input props
      id: providedId,
      disabled = false,
      required = false,
      className,

      // Accessibility
      "aria-label": ariaLabel,
      "aria-describedby": ariaDescribedby,

      // Event handlers
      onFocus,
      onBlur,
      onMouseEnter,
      onMouseLeave,

      ...props
    },
    ref
  ) => {
    // Generate unique IDs for accessibility using React.useId for SSR compatibility
    const reactId = React.useId();
    const inputId = providedId || `input-${reactId}`;
    const helperTextId = `input-helper-${reactId}`;
    const errorTextId = `input-error-${reactId}`;

    // State management
    const [isFocused, setIsFocused] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);

    // Determine current state
    const currentState = React.useMemo(() => {
      if (disabled) return "disabled";
      if (error) return "error";
      if (isFocused) return "focused";
      if (isHovered) return "hover";
      return "default";
    }, [disabled, error, isFocused, isHovered]);

    // Event handlers
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      setIsHovered(true);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      setIsHovered(false);
    };

    // Icon size based on input size:
    // - Small/Medium inputs: 20px (small icons)
    // - Large inputs: 24px (medium icons)
    const iconSize: IconSize = size === "large" ? "medium" : "small";

    // Determine helper/error text to display
    const displayHelperText = error && errorMessage ? errorMessage : helperText;
    const helperTextIdToUse = error && errorMessage ? errorTextId : helperTextId;

    return (
      <div
        className={cn("flex flex-col", wrapperClassName)}
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

        {/* Input Container */}
        <div
          style={{
            gap: 'var(--dimension-space-between-related-sm)',
            borderRadius: 'var(--dimension-radius-sm)',
          }}
          className={cn(
            inputContainerVariants({
              type,
              size,
              state: currentState,
            }),
            containerClassName
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Left Icon */}
          {leftIcon && (
            <Icon name={leftIcon} size={iconSize} className="shrink-0" />
          )}

          {/* Left Subtext */}
          {leftSubtext && (
            <span className={cn(subtextVariants({ size, state: currentState }))}>
              {leftSubtext}
            </span>
          )}

          {/* Input Field */}
          <input
            ref={ref}
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
              inputFieldVariants({ size, state: currentState }),
              className
            )}
            {...props}
          />

          {/* Right Subtext */}
          {rightSubtext && (
            <span className={cn(subtextVariants({ size, state: currentState }))}>
              {rightSubtext}
            </span>
          )}

          {/* Right Icon */}
          {rightIcon && (
            <Icon name={rightIcon} size={iconSize} className="shrink-0" />
          )}
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

Input.displayName = "Input";

export { inputContainerVariants, inputFieldVariants };
