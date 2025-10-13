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
    'outline-none',
    'w-full',
  ],
  {
    variants: {
      size: {
        // Match Input component sizes exactly
        small: 'h-8 px-3 py-1.5',
        medium: 'h-10 px-2.5 py-2.5',
        large: 'h-14 px-4 py-4',
      },
      state: {
        default: 'bg-[var(--color-bg-transparent-low)]',
        hover: 'bg-[var(--color-bg-transparent-medium)]',
        focused: 'bg-[var(--color-bg-transparent-low)]',
        disabled: 'bg-[var(--color-bg-transparent-low)] opacity-50 cursor-not-allowed',
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
    'placeholder:!text-[var(--color-fg-neutral-secondary)]',
  ],
  {
    variants: {
      size: {
        // Body/Sm Regular: 14px / 20px line height
        small: 'text-body-sm-regular',
        medium: 'text-body-sm-regular',
        // Body/Md Regular: 16px / 24px line height
        large: 'text-body-md-regular',
      },
      state: {
        default: '!text-[var(--color-fg-neutral-primary)]',
        hover: '!text-[var(--color-fg-neutral-primary)]',
        focused: '!text-[var(--color-fg-neutral-primary)]',
        disabled: '!text-[var(--color-fg-neutral-secondary)] cursor-not-allowed',
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
        style={{ gap: 'var(--dimension-space-between-related-sm)' }}
        className={cn(
          searchInputVariants({
            size,
            state: currentState,
          }),
          showFocusRing && 'ring-2 ring-[var(--color-a11y-primary)] ring-offset-2',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Search Icon */}
        <Icon name="magnifying-glass" size={iconSize} className="shrink-0 !text-[var(--color-fg-neutral-secondary)]" />

        {/* Input Field */}
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={(e) => {
            setIsFocused(true);
            // Show focus ring only if last interaction was keyboard (Tab key)
            setShowFocusRing(hadKeyboardEventRef.current && !hadMouseDownRef.current);
          }}
          onBlur={() => {
            setIsFocused(false);
            setShowFocusRing(false);
          }}
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
            className="shrink-0 !text-[var(--color-fg-neutral-primary)] hover:!text-[var(--color-fg-neutral-secondary)] transition-colors flex items-center justify-center"
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
