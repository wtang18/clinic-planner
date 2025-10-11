'use client';
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Icon, type IconName, type IconSize } from "@/design-system/icons";

// Pill variant styles using cva
const pillVariants = cva(
  // Base styles - common to all types
  [
    "inline-flex items-center whitespace-nowrap",
    "transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-[var(--color-bg-accent-high)] focus:ring-offset-1",
  ],
  {
    variants: {
      // 15 pill types (12 primary + 3 deprecated aliases)
      type: {
        transparent: "bg-[var(--color-bg-transparent-low)] !text-[var(--color-fg-neutral-primary)]",
        outlined: "shadow-[inset_0_0_0_1px_var(--color-bg-neutral-medium)] !text-[var(--color-fg-neutral-primary)]",
        "subtle-outlined": "shadow-[inset_0_0_0_1px_var(--color-bg-neutral-subtle)] !text-[var(--color-fg-neutral-secondary)]",
        positive: "bg-[var(--color-bg-positive-low)] !text-[var(--color-fg-positive-primary)]",
        attention: "bg-[var(--color-bg-attention-low)] !text-[var(--color-fg-attention-primary)]",
        alert: "bg-[var(--color-bg-alert-low)] !text-[var(--color-fg-alert-primary)]",
        "alert-emphasis": "bg-[var(--color-bg-alert-high)] !text-[var(--color-fg-neutral-inverse-primary)]",
        info: "bg-[var(--color-bg-information-low)] !text-[var(--color-fg-information-primary)]",
        "info-emphasis": "bg-[var(--color-bg-information-high)] !text-[var(--color-fg-neutral-inverse-primary)]",
        accent: "bg-[var(--color-bg-accent-low)] !text-[var(--color-fg-accent-primary)]",
        "accent-emphasis": "bg-[var(--color-bg-accent-high)] !text-[var(--color-fg-neutral-inverse-primary)]",
        "no-fill": "!text-[var(--color-fg-neutral-primary)]",
        carby: "bg-[var(--color-bg-carby-default)] !text-[var(--color-fg-carby-primary)]",
        // Deprecated aliases (will be removed in future version)
        "high-alert": "bg-[var(--color-bg-alert-high)] !text-[var(--color-fg-neutral-inverse-primary)]",
        "important-info": "bg-[var(--color-bg-information-high)] !text-[var(--color-fg-neutral-inverse-primary)]",
      },
      // Size variants
      size: {
        "x-small": "h-5 px-1.5 py-0 text-label-2xs-medium", // 20px height, 6px h-padding, 0 v-padding
        small: "h-6 px-1.5 py-0.5 text-label-xs-medium", // 24px height, 6px h-padding, 2px v-padding
        medium: "h-8 px-2 py-1.5 text-label-sm-medium", // 32px height, 8px h-padding, 6px v-padding
      },
      // Icon-only variant
      iconOnly: {
        true: "aspect-square px-0 justify-center",
        false: "",
      },
      // Truncate variant
      truncate: {
        true: "overflow-hidden",
        false: "",
      },
      // Interactive state
      interactive: {
        true: "cursor-pointer",
        false: "",
      },
      // State (only applies when interactive)
      state: {
        default: "",
        hover: "",
        disabled: "cursor-not-allowed pointer-events-none !bg-[var(--color-bg-neutral-low)] !text-[var(--color-fg-neutral-disabled)] !shadow-none",
      },
    },
    // Compound variants for hover states
    compoundVariants: [
      // Hover states for interactive pills
      {
        type: "transparent",
        interactive: true,
        state: "default",
        className: "hover:bg-[var(--color-bg-transparent-low-accented)]",
      },
      {
        type: "outlined",
        interactive: true,
        state: "default",
        className: "hover:shadow-[inset_0_0_0_1px_var(--color-bg-neutral-inverse-base)]",
      },
      {
        type: "subtle-outlined",
        interactive: true,
        state: "default",
        className: "hover:shadow-[inset_0_0_0_1px_var(--color-bg-neutral-inverse-base)] hover:text-[var(--color-fg-neutral-primary)]",
      },
      {
        type: "positive",
        interactive: true,
        state: "default",
        className: "hover:bg-[var(--color-bg-positive-low-accented)]",
      },
      {
        type: "attention",
        interactive: true,
        state: "default",
        className: "hover:bg-[var(--color-bg-attention-low-accented)]",
      },
      {
        type: "alert",
        interactive: true,
        state: "default",
        className: "hover:bg-[var(--color-bg-alert-low-accented)]",
      },
      {
        type: "alert-emphasis",
        interactive: true,
        state: "default",
        className: "hover:bg-[var(--color-bg-alert-high-accented)]",
      },
      {
        type: "info",
        interactive: true,
        state: "default",
        className: "hover:bg-[var(--color-bg-information-low-accented)]",
      },
      {
        type: "info-emphasis",
        interactive: true,
        state: "default",
        className: "hover:bg-[var(--color-bg-information-high-accented)]",
      },
      {
        type: "accent",
        interactive: true,
        state: "default",
        className: "hover:bg-[var(--color-bg-accent-low-accented)]",
      },
      {
        type: "accent-emphasis",
        interactive: true,
        state: "default",
        className: "hover:bg-[var(--color-bg-accent-high-accented)]",
      },
      // Deprecated hover states (for backward compatibility)
      {
        type: "high-alert",
        interactive: true,
        state: "default",
        className: "hover:bg-[var(--color-bg-alert-high-accented)]",
      },
      {
        type: "important-info",
        interactive: true,
        state: "default",
        className: "hover:bg-[var(--color-bg-information-high-accented)]",
      },
      {
        type: "no-fill",
        interactive: true,
        state: "default",
        className: "hover:bg-[var(--color-bg-neutral-subtle)]",
      },
      {
        type: "carby",
        interactive: true,
        state: "default",
        className: "hover:brightness-110",
      },
    ],
    defaultVariants: {
      type: "transparent",
      size: "medium",
      iconOnly: false,
      truncate: false,
      interactive: false,
      state: "default",
    },
  }
);

export interface PillProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pillVariants> {
  // Core variant props
  /**
   * The pill type (combines visual style and semantic meaning)
   * - "transparent": Semi-transparent gray background
   * - "outlined": Border with transparent background
   * - "subtle-outlined": Lighter border with transparent background
   * - "positive": Green for success states
   * - "attention": Yellow for warnings
   * - "alert": Red for errors/alerts
   * - "alert-emphasis": High-contrast red for critical alerts
   * - "info": Blue for information
   * - "info-emphasis": High-contrast blue for important information
   * - "accent": Purple for accent/special states
   * - "accent-emphasis": High-contrast purple for emphasized accents
   * - "no-fill": No background or border (text only)
   * - "carby": Brand green color
   * @deprecated "high-alert" - Use "alert-emphasis" instead
   * @deprecated "important-info" - Use "info-emphasis" instead
   */
  type?:
    | "transparent"
    | "outlined"
    | "subtle-outlined"
    | "positive"
    | "attention"
    | "alert"
    | "alert-emphasis"
    | "info"
    | "info-emphasis"
    | "accent"
    | "accent-emphasis"
    | "no-fill"
    | "carby"
    | "high-alert" // @deprecated - Use "alert-emphasis"
    | "important-info"; // @deprecated - Use "info-emphasis"

  /**
   * Size variant
   * - "x-small": Extra small (20px height, 12px text, no icons)
   * - "small": Small (24px height, 12px text, supports icons)
   * - "medium": Medium (32px height, 14px text, supports icons)
   */
  size?: "x-small" | "small" | "medium";

  /**
   * Icon-only mode - shows only left icon, hides all text and right icon
   * Only supported for small/medium sizes
   */
  iconOnly?: boolean;

  /**
   * Truncate text with ellipsis when it overflows
   * Use with max-width constraints (e.g., className="max-w-[200px]")
   * @default false
   */
  truncate?: boolean;

  // Content props
  /**
   * Main label text
   */
  label?: string;

  // Icon props
  /**
   * Left icon name from Icon system
   * Can be used alone for icon-only pills (sm/md only)
   */
  iconL?: IconName;

  /**
   * Custom left icon (React element or component)
   * Alternative to iconL
   */
  leftIcon?: React.ReactNode;

  /**
   * Right icon name from Icon system
   * Hidden when iconOnly is true
   */
  iconR?: IconName;

  /**
   * Custom right icon (React element or component)
   * Alternative to iconR
   */
  rightIcon?: React.ReactNode;

  // Subtext props
  /**
   * Left subtext content
   */
  subtextL?: string;

  /**
   * Show left subtext (only applies if subtextL is provided)
   * @default true if subtextL is provided
   */
  showSubtextL?: boolean;

  /**
   * Right subtext content
   */
  subtextR?: string;

  /**
   * Show right subtext (only applies if subtextR is provided)
   * @default true if subtextR is provided
   */
  showSubtextR?: boolean;

  // Interaction props
  /**
   * Whether the pill is interactive (clickable)
   */
  interactive?: boolean;

  /**
   * Visual state (only applies when interactive)
   */
  state?: "default" | "hover" | "disabled";

  /**
   * Disabled state (alias for state="disabled")
   */
  disabled?: boolean;

  /**
   * Click handler (only applies if interactive)
   */
  onClick?: (e?: React.MouseEvent<HTMLDivElement>) => void;

  // Accessibility props
  /**
   * Accessible label (required for icon-only pills)
   */
  "aria-label"?: string;

  /**
   * ID of element describing the pill
   */
  "aria-describedby"?: string;
}

/**
 * Pill/Badge component based on Figma design system
 *
 * FIGMA SPECIFICATIONS:
 * - Border Radius: 8px (sm/md), 4px (xs)
 * - Icon Size: 20px (sm/md only - xs does not support icons)
 * - Gap between elements: 4px
 *
 * SIZE SPECIFICATIONS:
 * - X-SMALL: Height 20px, Padding 0px 6px, Text 12px, Border radius 4px, NO ICONS
 * - SMALL: Height 24px, Padding 2px 6px, Text 12px, Border radius 8px
 * - MEDIUM: Height 32px, Padding 6px 8px, Text 14px, Border radius 8px
 *
 * VISIBILITY HIERARCHY:
 * Content is shown/hidden based on a clear hierarchy of rules:
 *
 * Icons (iconL/iconR):
 *   1. Must have icon content (iconL/leftIcon or iconR/rightIcon)
 *   2. Size must support icons (not xs)
 *   3. showIcon flag defaults to TRUE when icon exists (can be explicitly set to false)
 *   4. Right icon additionally requires: iconOnly must be false
 *
 * Subtexts (subtextL/subtextR):
 *   1. Must have subtext content (subtextL or subtextR)
 *   2. iconOnly must be false (text hidden in icon-only mode)
 *   3. showSubtext flag defaults to TRUE when subtext exists (can be explicitly set to false)
 *
 * State/Disabled:
 *   - Only applies when interactive is true
 *   - disabled prop is an alias for state="disabled"
 *
 * @example
 * // Basic pill with label
 * <Pill type="positive" size="medium" label="Success" />
 *
 * @example
 * // Icon-only pill (small/medium only)
 * <Pill type="outlined" size="medium" iconOnly iconL="star" aria-label="Favorite" />
 *
 * @example
 * // Icons and subtexts shown by default when provided
 * <Pill type="attention" size="medium" label="Alert" iconL="alert" subtextR="2" />
 *
 * @example
 * // Explicitly hide icons/subtexts with show flags
 * <Pill type="info" label="Hidden Icon" iconL="info" showIconL={false} />
 * <Pill type="info" label="Hidden Subtext" subtextR="new" showSubtextR={false} />
 *
 * @example
 * // Interactive pill
 * <Pill type="outlined" interactive onClick={() => console.log('clicked')} label="Clickable" />
 */
export const Pill = React.forwardRef<HTMLDivElement, PillProps>(
  (
    {
      // Core variant props
      type = "transparent",
      size = "medium",
      iconOnly = false,
      truncate = false,
      interactive = false,
      state = "default",
      disabled,

      // Text content
      label,

      // Icon props
      iconL,
      leftIcon,
      iconR,
      rightIcon,

      // Subtext props
      subtextL,
      showSubtextL,
      subtextR,
      showSubtextR,

      // Accessibility
      "aria-label": ariaLabel,
      "aria-describedby": ariaDescribedby,

      // Event handlers
      onClick,
      className,
      ...props
    },
    ref
  ) => {
    // Determine if pill should be disabled based on state or disabled prop
    const isDisabled = disabled || state === "disabled";

    // For icon-only pills, we need an accessible label
    const accessibleLabel = ariaLabel || (iconOnly ? label : undefined);

    // Deprecation warnings
    if (type === "high-alert") {
      console.warn("Pill: 'high-alert' type is deprecated. Use 'alert-emphasis' instead.");
    }
    if (type === "important-info") {
      console.warn("Pill: 'important-info' type is deprecated. Use 'info-emphasis' instead.");
    }

    // Validation: Icon-only requires an accessible label
    if (iconOnly && !accessibleLabel) {
      console.warn("Pill: iconOnly pills require an 'aria-label' or 'label' prop for accessibility");
    }

    // Validation: Icons only supported for small/medium sizes
    if (size === "x-small" && iconOnly) {
      console.warn("Pill: iconOnly is not supported for 'x-small' size");
    }

    // Icon size is always small (20px) for pills
    const iconSize: IconSize = "small";

    // Render icons with correct size
    const renderedLeftIcon = iconL ? <Icon name={iconL} size={iconSize} /> : leftIcon;
    const renderedRightIcon = iconR ? <Icon name={iconR} size={iconSize} /> : rightIcon;

    // Icon visibility logic with proper hierarchy:
    // 1. Must have icon content (iconL/leftIcon or iconR/rightIcon)
    // 2. Size must support icons (not xs)
    // 3. For right icon: iconOnly must be false
    const hasLeftIcon = !!(iconL || leftIcon);
    const hasRightIcon = !!(iconR || rightIcon);

    const shouldShowLeftIcon = hasLeftIcon && size !== "x-small";

    const shouldShowRightIcon = hasRightIcon && size !== "x-small" && !iconOnly;

    // Subtext visibility logic with proper hierarchy:
    // 1. Must have subtext content (subtextL or subtextR)
    // 2. iconOnly must be false (text hidden in icon-only mode)
    // 3. showSubtext flag must be true (defaults to true if subtext exists)
    const hasSubtextL = !!subtextL;
    const hasSubtextR = !!subtextR;

    const shouldShowSubtextL =
      hasSubtextL &&
      !iconOnly &&
      (showSubtextL !== false); // Show by default if subtext exists, unless explicitly set to false

    const shouldShowSubtextR =
      hasSubtextR &&
      !iconOnly &&
      (showSubtextR !== false); // Show by default if subtext exists, unless explicitly set to false

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDisabled) {
        e.preventDefault();
        return;
      }
      if (interactive && onClick) {
        onClick(e);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isDisabled) {
        e.preventDefault();
        return;
      }

      // Handle Enter and Space for interactive pills
      if (interactive && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        // Cast keyboard event to mouse event for onClick handler
        onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
      }

      props.onKeyDown?.(e);
    };

    // Get secondary color for subtexts based on type
    const getSubtextColor = () => {
      switch (type) {
        case "transparent":
        case "outlined":
        case "subtle-outlined":
        case "no-fill":
          return "text-[var(--color-fg-neutral-secondary)]";
        case "positive":
        case "carby":
          return "text-[var(--color-fg-positive-secondary)]";
        case "alert":
          return "text-[var(--color-fg-alert-secondary)]";
        case "alert-emphasis":
        case "high-alert": // deprecated
          return "text-[var(--color-fg-neutral-inverse-primary)]";
        case "attention":
          return "text-[var(--color-fg-attention-secondary)]";
        case "info":
          return "text-[var(--color-fg-information-secondary)]";
        case "info-emphasis":
        case "important-info": // deprecated
          return "text-[var(--color-fg-neutral-inverse-primary)]";
        case "accent":
          return "text-[var(--color-fg-accent-secondary)]";
        case "accent-emphasis":
          return "text-[var(--color-fg-neutral-inverse-primary)]";
        default:
          return "text-[var(--color-fg-neutral-secondary)]";
      }
    };

    const subtextColorClass = getSubtextColor();

    // Dimension token styles based on size
    const dimensionStyles: React.CSSProperties = {
      gap: 'var(--dimension-space-between-coupled)',
      borderRadius: size === "x-small"
        ? 'var(--dimension-radius-xs)'
        : 'var(--dimension-radius-sm)',
    };

    return (
      <div
        ref={ref}
        role={interactive ? "button" : undefined}
        tabIndex={interactive && !isDisabled ? 0 : undefined}
        aria-disabled={isDisabled ? true : undefined}
        aria-label={accessibleLabel}
        aria-describedby={ariaDescribedby}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        style={dimensionStyles}
        className={cn(
          pillVariants({
            type,
            size,
            iconOnly,
            truncate,
            interactive,
            state: isDisabled ? "disabled" : state,
          }),
          className
        )}
        {...props}
      >
        {/* Left icon - shown based on shouldShowLeftIcon logic */}
        {shouldShowLeftIcon && renderedLeftIcon}

        {/* Text content - hidden when iconOnly */}
        {!iconOnly && (
          <>
            {/* Left subtext - shown based on shouldShowSubtextL logic */}
            {shouldShowSubtextL && (
              <span className={cn("font-normal shrink-0", subtextColorClass, isDisabled && "opacity-50")}>
                {subtextL}
              </span>
            )}

            {/* Main label */}
            {label && (
              <span className={cn(truncate && "truncate min-w-0")}>
                {label}
              </span>
            )}

            {/* Right subtext - shown based on shouldShowSubtextR logic */}
            {shouldShowSubtextR && (
              <span className={cn("font-normal shrink-0", subtextColorClass, isDisabled && "opacity-50")}>
                {subtextR}
              </span>
            )}
          </>
        )}

        {/* Right icon - shown based on shouldShowRightIcon logic */}
        {shouldShowRightIcon && renderedRightIcon}
      </div>
    );
  }
);

Pill.displayName = "Pill";

export { pillVariants };
