'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Icon, type IconSize } from '@/design-system/icons';

// SearchInput variant styles using cva
const searchInputVariants = cva(
  // Base styles - common to all variants
  [
    'backdrop-blur-xl backdrop-filter',
    'box-border flex items-center rounded-full',
    'transition-all duration-200',
    'w-full',
  ],
  {
    variants: {
      size: {
        // Match Input component sizes exactly
        small: 'h-8 px-3 py-1.5 gap-2',
        medium: 'h-10 px-2.5 py-2.5 gap-2',
        large: 'h-14 px-4 py-4 gap-2',
      },
      state: {
        default: 'bg-[rgba(0,0,0,0.12)]',
        hover: 'bg-[rgba(0,0,0,0.20)]',
        focused: 'bg-[rgba(0,0,0,0.12)]',
        disabled: 'bg-[rgba(0,0,0,0.12)] opacity-50 cursor-not-allowed',
      },
    },
    defaultVariants: {
      size: 'medium',
      state: 'default',
    },
  }
);

const searchInputFieldVariants = cva(
  [
    'flex-1 bg-transparent border-0 outline-none',
    'font-normal',
    'placeholder:text-[#424242]',
  ],
  {
    variants: {
      size: {
        // Body/Sm Regular: 14px / 20px line height
        small: 'text-[14px] leading-[20px]',
        medium: 'text-[14px] leading-[20px]',
        // Body/Md Regular: 16px / 24px line height
        large: 'text-[16px] leading-[24px]',
      },
      state: {
        default: 'text-[#181818]',
        hover: 'text-[#181818]',
        focused: 'text-[#181818]',
        disabled: 'text-[#424242] cursor-not-allowed',
      },
    },
    defaultVariants: {
      size: 'medium',
      state: 'default',
    },
  }
);

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  /**
   * Current value of the search input
   */
  value: string;

  /**
   * Change handler - receives the new value directly
   */
  onChange: (value: string) => void;

  /**
   * Placeholder text
   * @default "Search"
   */
  placeholder?: string;

  /**
   * Size variant
   * - "small": 32px height
   * - "medium": 40px height (default)
   * - "large": 56px height
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Optional clear handler - called when X button is clicked
   * If not provided, clear button will still work but just clear the value
   */
  onClear?: () => void;

  /**
   * Additional CSS classes for the container
   */
  className?: string;
}

/**
 * SearchInput component based on Figma design system
 *
 * FIGMA SPECIFICATIONS:
 * - Background Default: rgba(0,0,0,0.12) with backdrop-blur-xl
 * - Background Hover: rgba(0,0,0,0.20)
 * - Background Focused: rgba(0,0,0,0.12)
 * - Background Focused+Hover: rgba(0,0,0,0.20)
 * - Border Radius: 99px (fully rounded)
 * - Icon Size: 20px (small/medium), 24px (large)
 * - Gap between elements: 8px
 * - Clear icon: x-small
 *
 * SIZE SPECIFICATIONS (matches Input component):
 * - Small: Height 32px, Padding 6px 12px, Text 14px
 * - Medium: Height 40px, Padding 10px 10px, Text 14px
 * - Large: Height 56px, Padding 16px 16px, Text 16px
 *
 * @example
 * // Basic search input
 * <SearchInput value={query} onChange={setQuery} />
 *
 * @example
 * // With custom placeholder and clear handler
 * <SearchInput
 *   value={query}
 *   onChange={setQuery}
 *   placeholder="Search materials..."
 *   onClear={() => console.log('Cleared!')}
 * />
 */
export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      placeholder = 'Search',
      size = 'medium',
      disabled = false,
      onClear,
      className,
      ...props
    },
    ref
  ) => {
    // State management
    const [isFocused, setIsFocused] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);

    // Determine current state
    const currentState = React.useMemo(() => {
      if (disabled) return 'disabled';
      if (isFocused) return 'focused';
      if (isHovered) return 'hover';
      return 'default';
    }, [disabled, isFocused, isHovered]);

    // Icon size based on input size
    const iconSize: IconSize = size === 'large' ? 'medium' : 'small';

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    };

    // Handle clear button
    const handleClear = () => {
      onChange('');
      onClear?.();
    };

    return (
      <div
        className={cn(
          searchInputVariants({
            size,
            state: currentState,
          }),
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Search Icon */}
        <Icon name="magnifying-glass" size={iconSize} className="shrink-0 text-[#424242]" />

        {/* Input Field */}
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            searchInputFieldVariants({ size, state: currentState }),
            'min-w-0'
          )}
          {...props}
        />

        {/* Clear Button - Only show when there's a value */}
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            onMouseDown={(e) => e.preventDefault()}
            className="shrink-0 text-[#181818] hover:text-[#424242] transition-colors flex items-center justify-center"
            aria-label="Clear search"
          >
            <Icon name="x" size={iconSize} />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export { searchInputVariants, searchInputFieldVariants };
