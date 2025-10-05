import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Card component variants based on Figma specifications
 *
 * FIGMA SPECIFICATIONS:
 * - Background: #ffffff (white)
 * - Border Radius: 8px
 * - Padding: 12px (all sides)
 * - Default Shadow: 0px 1.5px 6px 0px rgba(0,0,0,0.12)
 * - Hover Shadow: 0px 0.5px 2px 0px rgba(0,0,0,0.16)
 * - Non-interactive: No shadow
 * - Disabled: 50% opacity, no shadow
 */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Card content
   */
  children: React.ReactNode;

  /**
   * Whether card is interactive (clickable/hoverable)
   * - "interactive": Clickable/hoverable card with shadow effects
   * - "non-interactive": Static container without shadow
   */
  variant?: "interactive" | "non-interactive";

  /**
   * Click handler (only applies to interactive variant)
   */
  onClick?: () => void;

  /**
   * Whether the card is disabled (interactive variant only)
   * Disabled cards have 50% opacity and cannot be interacted with
   */
  disabled?: boolean;

  /**
   * Accessible label
   */
  'aria-label'?: string;

  /**
   * Use as semantic element
   */
  as?: 'div' | 'article' | 'section';
}

/**
 * Card component with Figma design system integration
 *
 * @example
 * // Non-interactive card (static container)
 * <Card variant="non-interactive">
 *   <h2>Card Title</h2>
 *   <p>Card content goes here</p>
 * </Card>
 *
 * @example
 * // Interactive card (clickable/hoverable)
 * <Card variant="interactive" onClick={() => console.log('clicked')}>
 *   <h2>Clickable Card</h2>
 *   <p>Click me!</p>
 * </Card>
 *
 * @example
 * // Disabled interactive card
 * <Card variant="interactive" disabled>
 *   <h2>Disabled Card</h2>
 *   <p>This card cannot be clicked</p>
 * </Card>
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = "non-interactive",
      onClick,
      disabled = false,
      className,
      as: Component = "div",
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const isInteractive = variant === "interactive";
    const isDisabled = isInteractive && disabled;

    // Base styles - Figma specs: white bg, 8px radius, 12px padding, 8px gap
    const baseStyles = "bg-white rounded-lg p-3 flex flex-col gap-2 items-start justify-center";

    // Variant-specific styles based on Figma
    const variantStyles = isInteractive
      ? isDisabled
        ? "opacity-50 cursor-not-allowed" // Disabled: 50% opacity, no shadow
        : "shadow-sm hover:shadow-[0px_0.5px_2px_0px_rgba(0,0,0,0.16)] cursor-pointer transition-shadow" // Interactive: default shadow + hover shadow
      : ""; // Non-interactive: no shadow

    // Focus styles for accessibility
    const focusStyles = isInteractive && !isDisabled
      ? "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      : "";

    // Handle keyboard interaction for interactive cards
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isInteractive && !isDisabled && onClick) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
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
        onClick();
      }
      props.onClick?.(e);
    };

    return (
      <Component
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles,
          focusStyles,
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
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

Card.displayName = "Card";
