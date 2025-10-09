'use client';
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Icon, type IconSize, type IconName } from '@/design-system/icons';

// Button variant styles using cva
const buttonVariants = cva(
  // Base styles - common to all variants
  [
    "inline-flex items-center justify-center gap-1 font-semibold transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "select-none cursor-pointer",
  ],
  {
    variants: {
      type: {
        // Primary - Dark background with white text
        primary: [
          "bg-gray-1000 text-white border border-transparent",
          "hover:bg-gray-900",
          "active:bg-gray-800",
        ],
        // Outlined - Border with transparent background
        outlined: [
          "bg-transparent text-gray-1000 border border-gray-1000",
          "hover:bg-gray-50 hover:border-gray-900",
          "active:bg-gray-100",
        ],
        // Solid - Light gray background
        solid: [
          "bg-gray-100 text-gray-1000 border border-transparent",
          "hover:bg-gray-200",
          "active:bg-gray-300",
        ],
        // Transparent - Glassmorphism with backdrop blur (exact Figma: rgba(0,0,0,0.12))
        transparent: [
          "backdrop-blur-xl backdrop-filter bg-[rgba(0,0,0,0.12)] text-gray-1000 border border-transparent",
          "hover:bg-[rgba(0,0,0,0.20)] hover:backdrop-blur-xl hover:backdrop-filter",
          "active:bg-[rgba(0,0,0,0.25)]",
        ],
        // Generative - AI/ML themed styling (exact Figma: #247450)
        generative: [
          "bg-[#247450] text-white border border-transparent",
          "hover:bg-[#174b34]",
          "active:bg-[#0d3a26]",
        ],
        // High Impact - Attention-grabbing design (exact Figma: #b33f3b)
        "high-impact": [
          "bg-[#b33f3b] text-white border border-transparent",
          "hover:bg-[#9d3530]",
          "active:bg-[#872b27]",
        ],
        // No Fill - Minimal with subtle hover
        "no-fill": [
          "bg-transparent text-gray-1000 border border-transparent",
          "hover:bg-[rgba(0,0,0,0.20)]",
          "active:bg-[rgba(0,0,0,0.25)]",
        ],
        // Subtle - Very minimal styling (exact Figma: rgba(0,0,0,0.02))
        subtle: [
          "bg-[rgba(0,0,0,0.02)] text-gray-1000 border border-transparent",
          "hover:bg-[rgba(0,0,0,0.05)] hover:text-gray-900",
          "active:bg-[rgba(0,0,0,0.08)]",
        ],
        // Carby - Brand themed (exact Figma colors)
        carby: [
          "bg-brand-carby-green text-gray-1000 border border-transparent",
          "hover:brightness-110",
          "active:brightness-90",
        ],
      },
      size: {
        "x-small": [
          "h-6 px-3 py-0.5 text-xs font-semibold leading-5 rounded-full",
          "gap-1",
        ],
        small: [
          "h-8 px-3 py-1.5 text-xs font-semibold leading-5 rounded-full",
          "gap-1",
        ],
        medium: [
          "h-10 px-4 py-2.5 text-sm font-semibold leading-5 rounded-full",
          "gap-2",
        ],
        large: [
          "h-14 px-6 py-4 text-base font-semibold leading-6 rounded-full",
          "gap-2",
        ],
        "large-floating": [
          "h-14 px-6 py-4 text-base font-semibold leading-6 rounded-full shadow-[0px_2px_8px_0px_rgba(0,0,0,0.16)]",
          "gap-2",
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

    return (
      <button
        type={htmlType}
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