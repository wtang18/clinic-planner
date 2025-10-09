import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Card component variants based on Figma specifications
 *
 * FIGMA SPECIFICATIONS:
 * - Background: #ffffff (white)
 * - Default Shadow: 0px 1.5px 6px 0px rgba(0,0,0,0.12)
 * - Hover Shadow: 0px 0.5px 2px 0px rgba(0,0,0,0.16)
 * - Non-interactive: No shadow
 * - Disabled: 50% opacity, no shadow
 *
 * SIZE SPECIFICATIONS:
 * - Small: Border radius 8px, Padding 12px, Gap 8px
 * - Medium: Border radius 16px, Padding 16px, Gap 16px
 */

const cardVariants = cva(
  // Base styles
  "bg-white flex flex-col items-start justify-center transition-shadow",
  {
    variants: {
      size: {
        small: "rounded-lg p-3 gap-2", // 8px radius, 12px padding, 8px gap
        medium: "rounded-2xl p-4 gap-4", // 16px radius, 16px padding, 16px gap
      },
      variant: {
        interactive: "",
        "non-interactive": "",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "interactive",
        disabled: false,
        className: "shadow-sm hover:shadow-[0px_0.5px_2px_0px_rgba(0,0,0,0.16)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
      },
    ],
    defaultVariants: {
      size: "medium",
      variant: "non-interactive",
      disabled: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /**
   * Card content
   */
  children: React.ReactNode;

  /**
   * Size of the card
   * - "small": 8px radius, 12px padding
   * - "medium": 16px radius, 16px padding (default)
   */
  size?: "small" | "medium";

  /**
   * Whether card is interactive (clickable/hoverable)
   * - "interactive": Clickable/hoverable card with shadow effects
   * - "non-interactive": Static container without shadow
   */
  variant?: "interactive" | "non-interactive";

  /**
   * Click handler (only applies to interactive variant)
   */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;

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
 * // Small non-interactive card (static container)
 * <Card size="small" variant="non-interactive">
 *   <h2>Card Title</h2>
 *   <p>Card content goes here</p>
 * </Card>
 *
 * @example
 * // Medium interactive card (clickable/hoverable) - default size
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
      size = "medium",
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

    // Handle keyboard interaction for interactive cards
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isInteractive && !isDisabled && onClick) {
        if (e.key === 'Enter' || e.key === ' ') {
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

    return (
      <Component
        ref={ref}
        className={cn(
          cardVariants({
            size,
            variant,
            disabled: isDisabled,
          }),
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

export { cardVariants };
