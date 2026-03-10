// @ts-nocheck
'use client';
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/design-system/lib/utils";
import { Icon, type IconName, type IconSize } from "@carbon-health/design-icons";

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
  type?: "outlined" | "filled";
  size?: "small" | "medium" | "large";
  label?: string;
  helperText?: string;
  error?: boolean;
  errorMessage?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  leftSubtext?: string;
  rightSubtext?: string;
  wrapperClassName?: string;
  containerClassName?: string;
  id?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = "outlined",
      size = "medium",
      label,
      helperText,
      error = false,
      errorMessage,
      leftIcon,
      rightIcon,
      leftSubtext,
      rightSubtext,
      wrapperClassName,
      containerClassName,
      id: providedId,
      disabled = false,
      required = false,
      className,
      "aria-label": ariaLabel,
      "aria-describedby": ariaDescribedby,
      onFocus,
      onBlur,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref
  ) => {
    const reactId = React.useId();
    const inputId = providedId || `input-${reactId}`;
    const helperTextId = `input-helper-${reactId}`;
    const errorTextId = `input-error-${reactId}`;

    const [isFocused, setIsFocused] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);
    const [showFocusRing, setShowFocusRing] = React.useState(false);
    const hadKeyboardEventRef = React.useRef(false);
    const hadMouseDownRef = React.useRef(false);

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

    const currentState = React.useMemo(() => {
      if (disabled) return "disabled";
      if (error) return "error";
      if (isFocused) return "focused";
      if (isHovered) return "hover";
      return "default";
    }, [disabled, error, isFocused, isHovered]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      setShowFocusRing(hadKeyboardEventRef.current && !hadMouseDownRef.current);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
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

    const iconSize: IconSize = size === "large" ? "medium" : "small";

    const displayHelperText = error && errorMessage ? errorMessage : helperText;
    const helperTextIdToUse = error && errorMessage ? errorTextId : helperTextId;

    return (
      <div
        className={cn("flex flex-col", wrapperClassName)}
        style={{ gap: 'var(--dimension-space-between-coupled)' }}
      >
        {label && (
          <label
            htmlFor={inputId}
            className={cn(labelVariants({ state: currentState }))}
          >
            {label}
          </label>
        )}

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
            showFocusRing && 'ring-2 ring-[var(--color-a11y-primary)] ring-offset-2',
            containerClassName
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {leftIcon && (
            <Icon name={leftIcon} size={iconSize} className="shrink-0" />
          )}

          {leftSubtext && (
            <span className={cn(subtextVariants({ size, state: currentState }))}>
              {leftSubtext}
            </span>
          )}

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

          {rightSubtext && (
            <span className={cn(subtextVariants({ size, state: currentState }))}>
              {rightSubtext}
            </span>
          )}

          {rightIcon && (
            <Icon name={rightIcon} size={iconSize} className="shrink-0" />
          )}
        </div>

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
