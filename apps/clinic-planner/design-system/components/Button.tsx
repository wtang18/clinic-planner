'use client';
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Icon, type IconSize, type IconName } from '@carbon-health/design-icons';

// Button variant styles using cva
const buttonVariants = cva(
  // Base styles - common to all variants
  [
    "inline-flex items-center justify-center transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-a11y-primary)] focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "select-none cursor-pointer",
  ],
  {
    variants: {
      type: {
        // Primary - Dark background with white text (uses neutral inverse tokens)
        primary: [
          "bg-[var(--color-bg-neutral-inverse-base)] !text-[var(--color-fg-neutral-inverse-primary)] border border-transparent",
          "hover:bg-[var(--color-bg-neutral-inverse-low)]",
          "active:bg-[var(--color-bg-neutral-medium)]",
        ],
        // Outlined - Border with transparent background
        outlined: [
          "bg-transparent !text-[var(--color-fg-neutral-primary)] border border-[var(--color-bg-neutral-inverse-base)]",
          "hover:bg-[var(--color-bg-neutral-subtle)] hover:border-[var(--color-bg-neutral-inverse-low)]",
          "active:bg-[var(--color-bg-neutral-low)]",
        ],
        // Solid - Light gray background
        solid: [
          "bg-[var(--color-bg-neutral-low)] !text-[var(--color-fg-neutral-primary)] border border-transparent",
          "hover:bg-[var(--color-bg-neutral-medium)]",
          "active:bg-[var(--color-bg-neutral-mid)]",
        ],
        // Transparent - Glassmorphism with backdrop blur
        transparent: [
          "backdrop-blur-xl backdrop-filter bg-[var(--color-bg-transparent-low)] !text-[var(--color-fg-neutral-primary)] border border-transparent",
          "hover:bg-[var(--color-bg-transparent-low-accented)] hover:backdrop-blur-xl hover:backdrop-filter",
          "active:bg-[var(--color-bg-transparent-medium)]",
        ],
        // Generative - AI/ML themed styling (uses positive/success tokens)
        generative: [
          "bg-[var(--color-bg-positive-high)] !text-[var(--color-fg-neutral-inverse-primary)] border border-transparent",
          "hover:bg-[var(--color-bg-positive-high-accented)]",
          "active:bg-[var(--color-bg-positive-medium)]",
        ],
        // High Impact - Attention-grabbing design (uses alert tokens)
        "high-impact": [
          "bg-[var(--color-bg-alert-high)] !text-[var(--color-fg-neutral-inverse-primary)] border border-transparent",
          "hover:bg-[var(--color-bg-alert-high-accented)]",
          "active:bg-[var(--color-bg-alert-medium)]",
        ],
        // No Fill - Minimal with subtle hover
        "no-fill": [
          "bg-transparent !text-[var(--color-fg-neutral-primary)] border border-transparent",
          "hover:bg-[var(--color-bg-neutral-low)]",
          "active:bg-[var(--color-bg-neutral-medium)]",
        ],
        // Subtle - Very minimal styling
        subtle: [
          "bg-[var(--color-bg-neutral-subtle)] !text-[var(--color-fg-neutral-primary)] border border-transparent",
          "hover:bg-[var(--color-bg-neutral-low)] hover:!text-[var(--color-fg-neutral-secondary)]",
          "active:bg-[var(--color-bg-neutral-medium)]",
        ],
        // Carby - Brand themed (uses carby semantic tokens)
        carby: [
          "bg-[var(--color-bg-carby-default)] !text-[var(--color-fg-carby-primary)] border border-transparent",
          "hover:bg-[var(--color-bg-carby-default-accent)]",
          "active:bg-[var(--color-bg-carby-high-contrast)] active:!text-[var(--color-fg-carby-accent)]",
        ],
      },
      size: {
        "x-small": [
          "h-6 px-3 py-0.5 rounded-full",
          "text-label-xs-medium",
        ],
        small: [
          "h-8 px-3 py-1.5 rounded-full",
          "text-label-xs-medium",
        ],
        medium: [
          "h-10 px-4 py-2.5 rounded-full",
          "text-label-sm-medium",
        ],
        large: [
          "h-14 px-6 py-4 rounded-full",
          "text-label-md-medium",
        ],
        "large-floating": [
          "h-14 px-6 py-4 rounded-full elevation-md",
          "text-label-md-medium",
        ],
      },
      iconOnly: {
        true: "aspect-square px-0",
        false: "",
      },
      state: {
        default: "",
        hover: "hover:brightness-110",
        disabled: "opacity-50 cursor-not-allowed pointer-events-none",
      },
    },
    defaultVariants: {
      type: "primary",
      size: "small",
      iconOnly: false,
      state: "default",
    },
  }
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'>,
    VariantProps<typeof buttonVariants> {
  // Content props
  label?: string;
  subtext?: string;

  // Icon props
  iconL?: IconName;
  iconR?: IconName;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  // Display props
  showSubtext?: boolean;

  // Accessibility
  'aria-label'?: string;
  'aria-describedby'?: string;

  // HTML button type (optional override)
  htmlType?: 'button' | 'submit' | 'reset';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      // Core variant props
      type = "primary",
      size = "small",
      iconOnly = false,

      // Text content
      label = "Label",

      // Icon props
      iconL,
      leftIcon,
      iconR,
      rightIcon,

      // Subtext props
      showSubtext = false,
      subtext = "Subtext",

      // Accessibility
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedby,

      // State props
      disabled,
      state = "default",

      // HTML type
      htmlType = "button",

      // Other props
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Determine if button should be disabled based on state or disabled prop
    const isDisabled = disabled || state === "disabled";

    // For icon-only buttons, we need an accessible label
    const accessibleLabel = ariaLabel || (iconOnly ? label : undefined);

    // Compute icon size based on button size
    // Small icons (20px) for xSmall/small/medium, Medium icons (24px) for large/largeFloating
    const iconSize: IconSize =
      size === 'large' || size === 'large-floating' ? 'medium' : 'small';

    // Render icons with correct size
    const renderedLeftIcon = iconL ? (
      <Icon name={iconL} size={iconSize} />
    ) : leftIcon;
    const renderedRightIcon = iconR ? (
      <Icon name={iconR} size={iconSize} />
    ) : rightIcon;

    // Dimension token styles based on size
    const dimensionStyles: React.CSSProperties = {
      gap: (size === 'x-small' || size === 'small')
        ? 'var(--dimension-space-between-coupled)'
        : 'var(--dimension-space-between-related-sm)',
    };

    return (
      <button
        type={htmlType}
        style={dimensionStyles}
        className={cn(
          buttonVariants({
            type,
            size,
            iconOnly,
            state: isDisabled ? "disabled" : state,
          }),
          className
        )}
        ref={ref}
        disabled={isDisabled}
        aria-label={accessibleLabel}
        aria-describedby={ariaDescribedby}
        {...props}
      >
        {/* Left Icon */}
        {(iconL || leftIcon) && renderedLeftIcon}

        {/* Text Content */}
        {!iconOnly && (
          <span className="leading-tight">
            {children || label}
            {showSubtext && subtext && (
              <span className="ml-1 font-normal opacity-60">
                {subtext}
              </span>
            )}
          </span>
        )}

        {/* Right Icon */}
        {(iconR || rightIcon) && renderedRightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };