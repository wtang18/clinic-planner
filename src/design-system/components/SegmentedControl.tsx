'use client';
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Segment variant styles using cva
const segmentVariants = cva(
  [
    "box-border flex flex-col items-center justify-center px-3 py-1.5",
    "rounded-full transition-all duration-200",
    "cursor-pointer select-none",
    "flex-1 min-w-0", // Allow segments to grow equally and prevent overflow
  ],
  {
    variants: {
      selected: {
        true: [
          "bg-[var(--color-bg-neutral-base)]",
          // No shadow here - will be added separately to avoid conflicts
        ],
        false: [
          "bg-transparent",
        ],
      },
      disabled: {
        true: "cursor-not-allowed",
        false: "",
      },
      hover: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      // Hover state for unselected, non-disabled segments
      {
        selected: false,
        disabled: false,
        hover: true,
        className: "bg-[var(--color-bg-transparent-inverse-low)]",
      },
      // Selected state always has shadow
      {
        selected: true,
        className: "elevation-sm",
      },
    ],
    defaultVariants: {
      selected: false,
      disabled: false,
      hover: false,
    },
  }
);

const segmentLabelVariants = cva(
  [
    "text-center whitespace-nowrap",
    "transition-all duration-200",
    "text-body-sm-medium", // 14px / 20px line height
  ],
  {
    variants: {
      selected: {
        true: "font-semibold !text-[var(--color-fg-neutral-primary)]", // Body/Sm Bold
        false: "font-medium !text-[var(--color-fg-neutral-secondary)]", // Body/Sm Medium
      },
      disabled: {
        true: "!text-[var(--color-fg-neutral-disabled)]",
        false: "",
      },
      hover: {
        true: "!text-[var(--color-fg-neutral-primary)]", // Hover state changes text to primary
        false: "",
      },
    },
    compoundVariants: [
      // Disabled overrides selected state
      {
        disabled: true,
        selected: true,
        className: "!text-[var(--color-fg-neutral-disabled)]",
      },
    ],
    defaultVariants: {
      selected: false,
      disabled: false,
      hover: false,
    },
  }
);

export interface SegmentOption {
  value: string;
  label: string;
  subtext?: string;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  /**
   * Array of segment options
   */
  options: SegmentOption[];

  /**
   * Currently selected value
   */
  value: string;

  /**
   * Callback when selection changes
   */
  onChange: (value: string) => void;

  /**
   * Disable all segments
   */
  disabled?: boolean;

  /**
   * Class name for the container
   */
  className?: string;

  /**
   * aria-label for the segmented control
   */
  "aria-label"?: string;
}

/**
 * SegmentedControl component based on Figma design system
 *
 * FIGMA SPECIFICATIONS:
 * - Container: 4px padding, rounded-full (99px), bg-[rgba(0,0,0,0.06)]
 * - Segments: 8px horizontal padding, 6px vertical padding, rounded-full
 * - Selected: White background with shadow-[0px_1px_4px_0px_rgba(0,0,0,0.16)]
 * - Typography: Body/Sm Bold (selected), Body/Sm Medium (unselected)
 * - Gap: 0 (segments are adjacent)
 *
 * STATE SPECIFICATIONS:
 * - Default (unselected): Transparent background, #424242 text, Medium weight
 * - Hover (unselected): bg-[rgba(255,255,255,0.68)], #181818 text
 * - Selected: White background with shadow, #181818 text, Bold weight
 * - Disabled: No background, #a4a4a4 text
 *
 * ACCESSIBILITY:
 * - Uses role="radiogroup" for the container
 * - Each segment has role="radio" with proper aria-checked
 * - Keyboard navigation with arrow keys
 * - Proper focus management
 *
 * @example
 * // Basic usage
 * <SegmentedControl
 *   options={[
 *     { value: 'day', label: 'Day' },
 *     { value: 'week', label: 'Week' },
 *     { value: 'month', label: 'Month' },
 *   ]}
 *   value={selectedView}
 *   onChange={setSelectedView}
 * />
 *
 * @example
 * // With subtext
 * <SegmentedControl
 *   options={[
 *     { value: 'all', label: 'All', subtext: '24' },
 *     { value: 'active', label: 'Active', subtext: '12' },
 *     { value: 'completed', label: 'Completed', subtext: '12' },
 *   ]}
 *   value={filter}
 *   onChange={setFilter}
 * />
 */
export const SegmentedControl = React.forwardRef<
  HTMLDivElement,
  SegmentedControlProps
>(
  (
    {
      options,
      value,
      onChange,
      disabled = false,
      className,
      "aria-label": ariaLabel,
    },
    ref
  ) => {
    const [hoveredValue, setHoveredValue] = React.useState<string | null>(null);

    const handleKeyDown = (e: React.KeyboardEvent, currentValue: string) => {
      const currentIndex = options.findIndex((opt) => opt.value === currentValue);
      let newIndex = currentIndex;

      switch (e.key) {
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          // Find previous non-disabled option
          for (let i = currentIndex - 1; i >= 0; i--) {
            if (!options[i].disabled && !disabled) {
              newIndex = i;
              break;
            }
          }
          break;
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          // Find next non-disabled option
          for (let i = currentIndex + 1; i < options.length; i++) {
            if (!options[i].disabled && !disabled) {
              newIndex = i;
              break;
            }
          }
          break;
        case " ":
        case "Enter":
          e.preventDefault();
          if (!disabled && !options[currentIndex].disabled) {
            onChange(currentValue);
          }
          return;
      }

      if (newIndex !== currentIndex) {
        onChange(options[newIndex].value);
      }
    };

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-label={ariaLabel}
        className={cn(
          "flex items-start p-1 bg-[var(--color-bg-transparent-subtle)] rounded-full",
          className
        )}
      >
        {options.map((option) => {
          const isSelected = value === option.value;
          const isDisabled = disabled || option.disabled;
          const isHovered = hoveredValue === option.value && !isSelected && !isDisabled;

          return (
            <div
              key={option.value}
              role="radio"
              aria-checked={isSelected}
              aria-disabled={isDisabled}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => {
                if (!isDisabled) {
                  onChange(option.value);
                }
              }}
              onKeyDown={(e) => handleKeyDown(e, option.value)}
              onMouseEnter={() => setHoveredValue(option.value)}
              onMouseLeave={() => setHoveredValue(null)}
              className={cn(
                segmentVariants({
                  selected: isSelected,
                  disabled: isDisabled,
                  hover: isHovered,
                })
              )}
            >
              <div className="flex gap-1 items-center justify-center w-full">
                <span
                  className={cn(
                    segmentLabelVariants({
                      selected: isSelected,
                      disabled: isDisabled,
                      hover: isHovered,
                    })
                  )}
                >
                  {option.label}
                </span>
                {option.subtext && (
                  <span
                    className={cn(
                      segmentLabelVariants({
                        selected: isSelected,
                        disabled: isDisabled,
                        hover: isHovered,
                      }),
                      "font-normal opacity-60"
                    )}
                  >
                    {option.subtext}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);

SegmentedControl.displayName = "SegmentedControl";

export { segmentVariants };
