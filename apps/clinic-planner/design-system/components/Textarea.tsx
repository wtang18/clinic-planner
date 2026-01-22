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
    "box-border flex items-start transition-all duration-200",
    "outline-none",
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
      state: "default",
    },
  }
);

const textareaFieldVariants = cva(
  [
    "w-full bg-transparent border-0 outline-none",
    "placeholder:transition-colors placeholder:duration-200",
    // Body/Sm Regular: 14px / 20px line height (matches medium Input)
    "text-body-sm-regular",
    // Padding: matches medium Input (10px vertical, 12px horizontal)
    "px-3 py-2.5",
  ],
  {
    variants: {
      state: {
        default: "!text-[var(--color-fg-neutral-primary)] placeholder:!text-[var(--color-fg-transparent-strong)]",
        hover: "!text-[var(--color-fg-neutral-primary)] placeholder:!text-[var(--color-fg-transparent-strong)]",
        focused: "!text-[var(--color-fg-neutral-primary)] placeholder:!text-[var(--color-fg-transparent-strong)]",
        error: "!text-[var(--color-fg-neutral-primary)] placeholder:!text-[var(--color-fg-transparent-strong)]",
        disabled: "!text-[var(--color-fg-neutral-secondary)] placeholder:!text-[var(--color-fg-transparent-strong)] cursor-not-allowed",
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

  /**
   * Auto-resize height based on content
   * When true, textarea grows/shrinks based on content
   * @default false
   */
  autoResize?: boolean;

  /**
   * Minimum height in pixels when autoResize is enabled
   * @default undefined (uses rows prop)
   */
  minHeight?: number;

  /**
   * Maximum height in pixels when autoResize is enabled
   * @default undefined (no limit)
   */
  maxHeight?: number;

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
      autoResize = false,
      minHeight,
      maxHeight,

      // Container props
      wrapperClassName,
      containerClassName,

      // Textarea props
      id: providedId,
      disabled = false,
      required = false,
      className,
      value,
      onChange,

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

    // Internal ref for auto-resize
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

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
      if (disabled) return "disabled";
      if (error) return "error";
      if (isFocused) return "focused";
      if (isHovered) return "hover";
      return "default";
    }, [disabled, error, isFocused, isHovered]);

    // Event handlers
    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      // Show focus ring only if last interaction was keyboard (Tab key)
      setShowFocusRing(hadKeyboardEventRef.current && !hadMouseDownRef.current);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      setShowFocusRing(false);
      onBlur?.(e);
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      setIsHovered(true);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      setIsHovered(false);
    };

    // Auto-resize functionality
    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea || !autoResize) return;

      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';

      // Calculate new height
      let newHeight = textarea.scrollHeight;

      // Apply min/max constraints
      if (minHeight !== undefined && newHeight < minHeight) {
        newHeight = minHeight;
      }
      if (maxHeight !== undefined && newHeight > maxHeight) {
        newHeight = maxHeight;
      }

      textarea.style.height = `${newHeight}px`;
    }, [autoResize, minHeight, maxHeight]);

    // Adjust height when value changes
    React.useEffect(() => {
      if (autoResize) {
        adjustHeight();
      }
    }, [value, autoResize, adjustHeight]);

    // Adjust height on mount
    React.useEffect(() => {
      if (autoResize) {
        adjustHeight();
      }
    }, [autoResize, adjustHeight]);

    // Combined ref handler
    const handleRef = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node;

        // Handle forwarded ref
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        adjustHeight();
      }
      onChange?.(e);
    };

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
            htmlFor={textareaId}
            className={cn(labelVariants({ state: currentState }))}
          >
            {label}
          </label>
        )}

        {/* Textarea Container */}
        <div
          style={{ borderRadius: 'var(--dimension-radius-sm)' }}
          className={cn(
            textareaContainerVariants({
              type,
              state: currentState,
            }),
            showFocusRing && 'ring-2 ring-[var(--color-a11y-primary)] ring-offset-2',
            containerClassName
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Textarea Field */}
          <textarea
            ref={handleRef}
            id={textareaId}
            rows={autoResize ? undefined : rows}
            disabled={disabled}
            required={required}
            value={value}
            onChange={handleChange}
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
              textareaFieldVariants({
                state: currentState,
                resize: autoResize ? "none" : resize
              }),
              autoResize && 'overflow-hidden',
              className
            )}
            style={{
              minHeight: autoResize && minHeight ? `${minHeight}px` : undefined,
              maxHeight: autoResize && maxHeight ? `${maxHeight}px` : undefined,
            }}
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
