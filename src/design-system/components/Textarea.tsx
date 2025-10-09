import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Generate unique IDs for accessibility
let textareaIdCounter = 0;
const generateId = (prefix: string) => {
  textareaIdCounter += 1;
  return `${prefix}-${textareaIdCounter}`;
};

// Textarea variant styles using cva
const textareaContainerVariants = cva(
  // Base styles - common to all variants
  [
    "box-border flex items-start rounded-lg transition-all duration-200",
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
      state: "default",
    },
  }
);

const textareaFieldVariants = cva(
  [
    "w-full bg-transparent border-0 outline-none",
    "font-normal",
    "placeholder:transition-colors placeholder:duration-200",
    // Body/Sm Regular: 14px / 20px line height (matches medium Input)
    "text-[14px] leading-[20px]",
    // Padding: matches medium Input (10px vertical, 12px horizontal)
    "px-3 py-2.5",
  ],
  {
    variants: {
      state: {
        default: "text-[#181818] placeholder:text-[#a4a4a4]",
        hover: "text-[#181818] placeholder:text-[#a4a4a4]",
        focused: "text-[#181818] placeholder:text-[#a4a4a4]",
        error: "text-[#181818] placeholder:text-[#a4a4a4]",
        disabled: "text-[#424242] placeholder:text-[#a4a4a4] cursor-not-allowed",
      },
      resize: {
        none: "resize-none",
        vertical: "resize-y",
        both: "resize",
      },
    },
    defaultVariants: {
      state: "default",
      resize: "vertical",
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

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    VariantProps<typeof textareaContainerVariants> {
  // Core variant props
  /**
   * Visual type of the textarea
   * - "outlined": Border with transparent background
   * - "filled": Filled background with no border (adds border on focus/error)
   */
  type?: "outlined" | "filled";

  // Label and helper text
  /**
   * Label text displayed above the textarea
   */
  label?: string;

  /**
   * Helper text displayed below the textarea
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

  // Textarea-specific props
  /**
   * Number of visible text rows (controls initial height)
   * @default 3
   */
  rows?: number;

  /**
   * Resize behavior
   * - "none": Not resizable
   * - "vertical": Resizable vertically only
   * - "both": Resizable in both directions
   * @default "vertical"
   */
  resize?: "none" | "vertical" | "both";

  // Container props
  /**
   * Class name for the wrapper div
   */
  wrapperClassName?: string;

  /**
   * Class name for the textarea container
   */
  containerClassName?: string;

  // Accessibility
  /**
   * ID for the textarea element
   */
  id?: string;

  /**
   * aria-label for the textarea
   */
  "aria-label"?: string;

  /**
   * aria-describedby for the textarea
   */
  "aria-describedby"?: string;

  /**
   * Required field
   */
  required?: boolean;
}

/**
 * Textarea component based on Figma design system
 *
 * FIGMA SPECIFICATIONS:
 * - Border Radius: 8px
 * - Typography: Body/Sm Regular (14px / 20px line height)
 * - Padding: 10px 12px (matches medium Input)
 * - Focus border: 2px solid #6ab0ca
 * - Error border: 1px solid #b33f3b (outlined), 2px solid #b33f3b (filled on focus)
 *
 * DIMENSIONS:
 * - Height: Auto-grows based on content
 * - Min-height: Based on rows prop (default 3 rows)
 * - Padding: 10px 12px (vertical, horizontal)
 * - Text: 14px / 20px line height
 *
 * STATE SPECIFICATIONS:
 * - Default: Border rgba(0,0,0,0.24), Label #676767
 * - Hover: Border rgba(0,0,0,0.36), Label #181818
 * - Focused: Border 2px #6ab0ca
 * - Error: Border #b33f3b, Label/Helper #b33f3b
 * - Disabled: Border rgba(0,0,0,0.12), Label #a4a4a4, Text #424242
 *
 * @example
 * // Basic textarea
 * <Textarea label="Description" placeholder="Enter description" />
 *
 * @example
 * // Textarea with error
 * <Textarea label="Comments" error errorMessage="This field is required" />
 *
 * @example
 * // Textarea with custom rows and resize
 * <Textarea label="Notes" rows={5} resize="none" />
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      // Core variant props
      type = "outlined",

      // Label and helper text
      label,
      helperText,
      error = false,
      errorMessage,

      // Textarea-specific props
      rows = 3,
      resize = "vertical",

      // Container props
      wrapperClassName,
      containerClassName,

      // Textarea props
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
    // Generate unique IDs for accessibility
    const textareaId = React.useMemo(
      () => providedId || generateId("textarea"),
      [providedId]
    );
    const helperTextId = React.useMemo(
      () => generateId("textarea-helper"),
      []
    );
    const errorTextId = React.useMemo(
      () => generateId("textarea-error"),
      []
    );

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
    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      setIsHovered(true);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      setIsHovered(false);
    };

    // Determine helper/error text to display
    const displayHelperText = error && errorMessage ? errorMessage : helperText;
    const helperTextIdToUse = error && errorMessage ? errorTextId : helperTextId;

    return (
      <div className={cn("flex flex-col gap-1", wrapperClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(labelVariants({ state: currentState }))}
          >
            {label}
          </label>
        )}

        {/* Textarea Container */}
        <div
          className={cn(
            textareaContainerVariants({
              type,
              state: currentState,
            }),
            containerClassName
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Textarea Field */}
          <textarea
            ref={ref}
            id={textareaId}
            rows={rows}
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
              textareaFieldVariants({ state: currentState, resize }),
              className
            )}
            {...props}
          />
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

Textarea.displayName = "Textarea";

export { textareaContainerVariants, textareaFieldVariants };
