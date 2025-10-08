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
    "box-border flex items-center gap-2 rounded-lg transition-all duration-200",
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
          "bg-[rgba(0,0,0,0.06)]",
        ],
      },
      size: {
        small: "h-8 px-3 py-1.5 gap-2",
        medium: "h-10 px-3 py-2.5 gap-2",
        large: "h-14 px-4 py-4 gap-2",
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
        className: "shadow-[0_0_0_1px_rgba(0,0,0,0.24)]",
      },
      {
        type: "outlined",
        state: "hover",
        className: "shadow-[0_0_0_1px_rgba(0,0,0,0.36)]",
      },
      {
        type: "outlined",
        state: "focused",
        className: "shadow-[0_0_0_2px_#6ab0ca]",
      },
      {
        type: "outlined",
        state: "error",
        className: "shadow-[0_0_0_1px_#b33f3b]",
      },
      {
        type: "outlined",
        state: "disabled",
        className: "shadow-[0_0_0_1px_rgba(0,0,0,0.12)]",
      },
      // Filled type states (no borders)
      {
        type: "filled",
        state: "hover",
        className: "bg-[rgba(0,0,0,0.08)]",
      },
      {
        type: "filled",
        state: "focused",
        className: "bg-[#c9e6f0]", // bg/input/low
      },
      {
        type: "filled",
        state: "error",
        className: "bg-[#f8dad6]", // bg/alert/low
      },
      {
        type: "filled",
        state: "disabled",
        className: "bg-[rgba(0,0,0,0.04)]",
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
        small: "text-[14px] leading-[20px]",
        medium: "text-[14px] leading-[20px]",
        // Body/Md Regular: 16px / 24px line height
        large: "text-[16px] leading-[24px]",
      },
      state: {
        default: "text-[#181818] placeholder:text-[#a4a4a4]",
        hover: "text-[#181818] placeholder:text-[#a4a4a4]",
        focused: "text-[#181818] placeholder:text-[#a4a4a4]",
        error: "text-[#181818] placeholder:text-[#a4a4a4]",
        disabled: "text-[#424242] placeholder:text-[#a4a4a4] cursor-not-allowed",
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
    "font-medium text-[14px] leading-[20px]",
    "transition-colors duration-200",
  ],
  {
    variants: {
      state: {
        default: "text-[#676767]",
        hover: "text-[#181818]",
        focused: "text-[#676767]",
        error: "text-[#b33f3b]",
        disabled: "text-[#a4a4a4]",
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
    "font-normal text-[14px] leading-[20px]",
    "transition-colors duration-200",
  ],
  {
    variants: {
      state: {
        default: "text-[#676767]",
        hover: "text-[#676767]",
        focused: "text-[#676767]",
        error: "text-[#b33f3b]",
        disabled: "text-[#a4a4a4]",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
);

const subtextVariants = cva(
  [
    "font-normal shrink-0 whitespace-nowrap",
  ],
  {
    variants: {
      size: {
        // Body/Sm Regular: 14px / 20px line height
        small: "text-[14px] leading-[20px]",
        medium: "text-[14px] leading-[20px]",
        // Body/Md Regular: 16px / 24px line height
        large: "text-[16px] leading-[24px]",
      },
      state: {
        default: "text-[#676767]",
        hover: "text-[#676767]",
        focused: "text-[#676767]",
        error: "text-[#676767]",
        disabled: "text-[#a4a4a4]",
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
      onMouseEnter?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      setIsHovered(false);
      onMouseLeave?.(e);
    };

    // Icon size based on input size:
    // - Small/Medium inputs: 20px (small icons)
    // - Large inputs: 24px (medium icons)
    const iconSize: IconSize = size === "large" ? "medium" : "small";

    // Determine helper/error text to display
    const displayHelperText = error && errorMessage ? errorMessage : helperText;
    const helperTextIdToUse = error && errorMessage ? errorTextId : helperTextId;

    return (
      <div className={cn("flex flex-col gap-1", wrapperClassName)}>
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
