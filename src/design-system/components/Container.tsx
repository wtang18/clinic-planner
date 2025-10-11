import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Container component variants based on Figma specifications
 *
 * FIGMA SPECIFICATIONS:
 * - Background: rgba(0,0,0,0.06) - bg/transparent/subtle
 * - Hover Background: rgba(0,0,0,0.12) - bg/transparent/subtle-accented
 * - Border Radius: 16px
 * - Padding: 16px (all sides)
 * - Default Gap: 16px between children
 * - Disabled: 50% opacity
 */

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Container content (typically Card components)
   */
  children: React.ReactNode;

  /**
   * Spacing between child elements
   * - "sm": 8px gap
   * - "md": 16px gap (default)
   * - "lg": 24px gap
   */
  gap?: "sm" | "md" | "lg";

  /**
   * Whether container is interactive (clickable/hoverable)
   * - "interactive": Clickable/hoverable container with background color change on hover
   * - "non-interactive": Static container (default)
   */
  variant?: "interactive" | "non-interactive";

  /**
   * Click handler (only applies to interactive variant)
   */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;

  /**
   * Whether the container is disabled (interactive variant only)
   * Disabled containers have 50% opacity and cannot be interacted with
   */
  disabled?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Accessible label
   */
  "aria-label"?: string;

  /**
   * Use as semantic element
   */
  as?: "div" | "section" | "article" | "aside";
}

/**
 * Container component with Figma design system integration
 *
 * A wrapper component that provides consistent spacing and layout for child components,
 * typically used to contain Card components or other content.
 *
 * GAP VARIANTS:
 * - sm: 8px (gap-2)
 * - md: 16px (gap-4) - default
 * - lg: 24px (gap-6)
 *
 * INTERACTIVE BEHAVIOR:
 * - Default: bg-[rgba(0,0,0,0.06)]
 * - Hover: bg-[rgba(0,0,0,0.12)]
 * - Disabled: 50% opacity
 *
 * @example
 * // Non-interactive container (default)
 * <Container>
 *   <Card>Card 1</Card>
 *   <Card>Card 2</Card>
 * </Container>
 *
 * @example
 * // Interactive container (clickable/hoverable)
 * <Container variant="interactive" onClick={() => console.log('clicked')}>
 *   <Card>Card 1</Card>
 *   <Card>Card 2</Card>
 * </Container>
 *
 * @example
 * // With custom gap
 * <Container gap="sm">
 *   <Card>Card 1</Card>
 *   <Card>Card 2</Card>
 * </Container>
 */
export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      children,
      gap = "md",
      variant = "non-interactive",
      onClick,
      disabled = false,
      className,
      as: Component = "div",
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const isInteractive = variant === "interactive";
    const isDisabled = isInteractive && disabled;

    // Gap styles using semantic tokens
    const gapStyles = {
      sm: { gap: 'var(--dimension-space-between-related-sm)' }, // 8px
      md: { gap: 'var(--dimension-space-between-related-md)' }, // 16px
      lg: { gap: 'var(--dimension-space-between-separated-sm)' }, // 24px
    };

    // Base styles - Figma specs: 16px radius, 16px padding
    const baseStyles = "box-border flex flex-col items-start";
    const baseInlineStyles = {
      borderRadius: 'var(--dimension-radius-md)',
      padding: 'var(--dimension-space-around-md)',
    };

    // Background color based on state
    const backgroundStyles = isInteractive
      ? isDisabled
        ? "bg-[rgba(0,0,0,0.06)]" // Disabled: default background
        : isHovered
        ? "bg-[rgba(0,0,0,0.12)]" // Hover: darker background
        : "bg-[rgba(0,0,0,0.06)]" // Default: subtle background
      : "bg-[rgba(0,0,0,0.06)]"; // Non-interactive: default background

    // Variant-specific styles based on Figma
    const variantStyles = isInteractive
      ? isDisabled
        ? "opacity-50 cursor-not-allowed" // Disabled: 50% opacity
        : "cursor-pointer transition-colors duration-200" // Interactive: cursor and transition
      : ""; // Non-interactive: no interactive styles

    // Focus styles for accessibility
    const focusStyles =
      isInteractive && !isDisabled
        ? "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        : "";

    // Handle keyboard interaction for interactive containers
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isInteractive && !isDisabled && onClick) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          // Cast keyboard event to mouse event for onClick handler
          onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
        }
      }
      props.onKeyDown?.(e);
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDisabled) {
        e.preventDefault();
        return;
      }
      if (isInteractive && onClick) {
        onClick(e);
      }
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      if (isInteractive && !isDisabled) {
        setIsHovered(true);
      }
      props.onMouseEnter?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      setIsHovered(false);
      props.onMouseLeave?.(e);
    };

    return (
      <Component
        ref={ref}
        className={cn(
          baseStyles,
          backgroundStyles,
          variantStyles,
          focusStyles,
          className
        )}
        style={{
          ...baseInlineStyles,
          ...gapStyles[gap],
          ...props.style,
        }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        tabIndex={isInteractive && !isDisabled ? 0 : undefined}
        role={isInteractive ? "button" : undefined}
        aria-label={ariaLabel}
        aria-disabled={isDisabled}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Container.displayName = "Container";
