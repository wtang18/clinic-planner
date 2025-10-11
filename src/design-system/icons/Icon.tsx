'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import type { IconName } from './icon-names';
import { smallIconMap, mediumIconMap } from './icon-map';

export type IconSize = 'small' | 'medium';

export interface IconProps {
  /** Icon name (without size suffix) */
  name: IconName;
  /** Icon size: small (20px) or medium (24px) */
  size?: IconSize;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label (if icon is not decorative) */
  'aria-label'?: string;
  /** Whether icon is decorative (default: true) */
  'aria-hidden'?: boolean;
}

/**
 * Get SVG string for an icon
 */
function getIconSvg(name: IconName, size: IconSize): string | null {
  const fileName = size === 'small' ? `${name}-small.svg` : `${name}.svg`;
  const key = `./${fileName}`;

  // Try to get from appropriate size
  const icons = size === 'small' ? smallIconMap : mediumIconMap;
  let svgContent = icons[key];

  if (!svgContent) {
    // Try fallback to other size
    const fallbackSize = size === 'small' ? 'medium' : 'small';
    const fallbackFileName = fallbackSize === 'small' ? `${name}-small.svg` : `${name}.svg`;
    const fallbackKey = `./${fallbackFileName}`;
    const fallbackIcons = fallbackSize === 'small' ? smallIconMap : mediumIconMap;

    svgContent = fallbackIcons[fallbackKey];

    if (svgContent) {
      console.warn(
        `Icon "${name}" not found in ${size} size, using ${fallbackSize} size as fallback`
      );
    }
  }

  return svgContent || null;
}

/**
 * Icon component that dynamically renders SVG icons based on name and size
 *
 * Icon sizing:
 * - small: 20x20px (w-5 h-5) - for xSmall, small, medium buttons
 * - medium: 24x24px (w-6 h-6) - for large, largeFloating buttons
 *
 * Icons automatically inherit color via currentColor
 *
 * @example
 * <Icon name="star" size="small" />
 * <Icon name="chevron-down" size="medium" className="text-blue-500" />
 * <Icon name="checkmark" size="small" aria-label="Completed" aria-hidden={false} />
 */
export const Icon = React.forwardRef<HTMLSpanElement, IconProps>(
  (
    {
      name,
      size = 'small',
      className,
      'aria-label': ariaLabel,
      'aria-hidden': ariaHidden = true,
    },
    ref
  ) => {
    // Compute size classes
    const sizeClasses = size === 'small' ? 'w-5 h-5' : 'w-6 h-6';

    // Get SVG string - use let so we can reassign if needed
    let svgContent = getIconSvg(name, size);

    // Show fallback if not found
    if (!svgContent) {
      console.error(`Icon "${name}" not found in any size`);
      return (
        <svg
          className={cn(sizeClasses, 'shrink-0', className)}
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden={ariaHidden}
          aria-label={ariaLabel}
          role={ariaLabel ? 'img' : undefined}
        >
          {/* Fallback: question mark icon */}
          <path
            d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M10 14V14.5M10 11C10 10.5 10 10 10.5 9.5C11 9 12 8.5 12 7.5C12 6.5 11.5 6 10 6C8.5 6 8 6.5 8 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    }

    // Ensure svgContent is a string
    if (typeof svgContent !== 'string') {
      // Check if it's a module with a default export (Vite might be doing this)
      if (svgContent && typeof svgContent === 'object') {
        // Handle Next.js/Storybook image imports with data URLs
        if ((svgContent as any).src && typeof (svgContent as any).src === 'string') {
          const srcValue = (svgContent as any).src;

          // Check if it's a data URL
          if (srcValue.startsWith('data:image/svg+xml,')) {
            // Decode the data URL to get the actual SVG content
            const encodedSvg = srcValue.replace('data:image/svg+xml,', '');
            const decodedSvg = decodeURIComponent(encodedSvg);
            svgContent = decodedSvg;
          } else {
            console.warn(`Icon "${name}" got URL/path instead of SVG content:`, srcValue);
          }
        } else {
          // Try other common module export patterns
          const possibleExports = [
            (svgContent as any).default,
            (svgContent as any).href,
          ];

          for (const exportValue of possibleExports) {
            if (typeof exportValue === 'string' && exportValue.trim().startsWith('<svg')) {
              svgContent = exportValue;
              break;
            }
          }
        }
      }

      // If still not a string after attempts, log error and show fallback
      if (typeof svgContent !== 'string') {
        console.error(`Icon "${name}" could not be loaded - invalid format:`, typeof svgContent);
        return (
          <svg
            className={cn(sizeClasses, 'shrink-0', className)}
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
            aria-label={ariaLabel}
            role={ariaLabel ? 'img' : undefined}
          >
            {/* Fallback: question mark icon */}
            <path
              d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M10 14V14.5M10 11C10 10.5 10 10 10.5 9.5C11 9 12 8.5 12 7.5C12 6.5 11.5 6 10 6C8.5 6 8 6.5 8 7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        );
      }
    }

    // Parse SVG and inject classes/attributes
    let modifiedSvg = svgContent;
    const svgMatch = modifiedSvg.match(/<svg([^>]*)>/);

    if (svgMatch) {
      const existingAttrs = svgMatch[1];
      const classMatch = existingAttrs.match(/class="([^"]*)"/);
      const existingClasses = classMatch ? classMatch[1] : '';

      let newAttrs = existingAttrs;

      // Add/update class
      if (classMatch) {
        newAttrs = newAttrs.replace(
          /class="[^"]*"/,
          `class="${cn(sizeClasses, 'shrink-0', existingClasses, className)}"`
        );
      } else {
        newAttrs += ` class="${cn(sizeClasses, 'shrink-0', className)}"`;
      }

      // Add aria attributes
      if (ariaLabel) {
        newAttrs += ` aria-label="${ariaLabel}" role="img"`;
      }
      if (ariaHidden !== undefined) {
        if (!newAttrs.includes('aria-hidden')) {
          newAttrs += ` aria-hidden="${ariaHidden}"`;
        }
      }

      modifiedSvg = modifiedSvg.replace(/<svg[^>]*>/, `<svg${newAttrs}>`);
    }

    return (
      <span
        ref={ref}
        dangerouslySetInnerHTML={{ __html: modifiedSvg }}
        className="inline-flex items-center justify-center"
      />
    );
  }
);

Icon.displayName = 'Icon';
