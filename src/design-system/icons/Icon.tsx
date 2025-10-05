import React from 'react';
import { cn } from '@/lib/utils';
import type { IconName } from './icon-names';

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

// Eager-load all icons using dynamic imports
// Use ?raw query to get actual SVG strings
const smallIcons = import.meta.glob<string>('./small/*.svg', {
  query: '?raw',
  eager: true,
  import: 'default',
});

const mediumIcons = import.meta.glob<string>('./medium/*.svg', {
  query: '?raw',
  eager: true,
  import: 'default',
});

/**
 * Decode data URL to get SVG string
 */
function decodeDataUrl(dataUrl: string): string | null {
  try {
    // Data URL format: data:image/svg+xml,<svg...> or data:image/svg+xml;base64,<base64>
    if (dataUrl.startsWith('data:image/svg+xml,')) {
      // URL-encoded SVG
      const encoded = dataUrl.substring('data:image/svg+xml,'.length);
      return decodeURIComponent(encoded);
    } else if (dataUrl.startsWith('data:image/svg+xml;base64,')) {
      // Base64-encoded SVG
      const base64 = dataUrl.substring('data:image/svg+xml;base64,'.length);
      return atob(base64);
    }
  } catch (error) {
    console.error('Failed to decode data URL:', error);
  }
  return null;
}

/**
 * Get SVG string for an icon
 */
function getIconSvg(name: IconName, size: IconSize): string | null {
  const fileName = size === 'small' ? `${name}-small.svg` : `${name}.svg`;
  const path = size === 'small' ? `./small/${fileName}` : `./medium/${fileName}`;

  // Try to get from appropriate size
  const icons = size === 'small' ? smallIcons : mediumIcons;
  let svgData: any = icons[path];

  // Handle different formats
  let svg: string | null = null;

  if (svgData) {
    if (typeof svgData === 'string') {
      // Already a string (raw SVG)
      svg = svgData;
    } else if (typeof svgData === 'object') {
      // Object format with src property (data URL)
      if (svgData.src && typeof svgData.src === 'string') {
        svg = decodeDataUrl(svgData.src);
      } else if (svgData.default && typeof svgData.default === 'string') {
        svg = svgData.default;
      }
    }
  }

  if (!svg) {
    // Try fallback to other size
    const fallbackSize = size === 'small' ? 'medium' : 'small';
    const fallbackFileName = fallbackSize === 'small' ? `${name}-small.svg` : `${name}.svg`;
    const fallbackPath = fallbackSize === 'small' ? `./small/${fallbackFileName}` : `./medium/${fallbackFileName}`;
    const fallbackIcons = fallbackSize === 'small' ? smallIcons : mediumIcons;

    let fallbackData: any = fallbackIcons[fallbackPath];

    if (fallbackData) {
      if (typeof fallbackData === 'string') {
        svg = fallbackData;
      } else if (typeof fallbackData === 'object') {
        if (fallbackData.src && typeof fallbackData.src === 'string') {
          svg = decodeDataUrl(fallbackData.src);
        } else if (fallbackData.default && typeof fallbackData.default === 'string') {
          svg = fallbackData.default;
        }
      }

      if (svg) {
        console.warn(
          `Icon "${name}" not found in ${size} size, using ${fallbackSize} size as fallback`
        );
      }
    }
  }

  return svg;
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

    // Get SVG string
    const svgContent = getIconSvg(name, size);

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

    // Parse SVG and inject classes/attributes
    // Use DOMParser to parse SVG string
    if (typeof window !== 'undefined') {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;

      // Apply classes and attributes
      const existingClasses = svgElement.getAttribute('class') || '';
      svgElement.setAttribute('class', cn(sizeClasses, 'shrink-0', existingClasses, className));

      if (ariaLabel) {
        svgElement.setAttribute('aria-label', ariaLabel);
        svgElement.setAttribute('role', 'img');
      }
      if (ariaHidden !== undefined) {
        svgElement.setAttribute('aria-hidden', String(ariaHidden));
      }

      return (
        <span
          ref={ref}
          dangerouslySetInnerHTML={{ __html: svgElement.outerHTML }}
          className="inline-flex items-center justify-center"
        />
      );
    }

    // SSR fallback: inject classes via string manipulation
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
