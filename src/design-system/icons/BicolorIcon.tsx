'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import { smallBicolorIconMap, mediumBicolorIconMap } from './bicolor-icon-map';

export type BicolorIconSize = 'small' | 'medium';

/**
 * Semantic bicolor icon names with default color schemes
 */
export type BicolorIconName =
  | 'positive'
  | 'positive-bold'
  | 'alert'
  | 'alert-bold'
  | 'attention'
  | 'info'
  | 'info-bold'
  | 'question'
  | 'plus'
  | 'minus'
  | 'arrow-up'
  | 'arrow-down'
  | 'arrow-left'
  | 'arrow-right'
  | 'chevron-up'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right';

export interface BicolorIconProps {
  /** Semantic icon name with default colors */
  name: BicolorIconName;
  /** Icon size: small (20px) or medium (24px) */
  size?: BicolorIconSize;
  /** Override signifier (inner element) color */
  signifierColor?: string;
  /** Override container (outer element) color */
  containerColor?: string;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label (if icon is not decorative) */
  'aria-label'?: string;
  /** Whether icon is decorative (default: true) */
  'aria-hidden'?: boolean;
}

/**
 * Get CSS variable value at runtime
 */
function getCssVar(varName: string): string {
  if (typeof window === 'undefined') return varName; // SSR fallback
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

/**
 * Default color schemes for semantic bicolor icons
 * Uses semantic tokens that resolve at runtime to support theming
 */
const defaultColors: Record<BicolorIconName, { signifier: () => string; container: () => string }> = {
  'positive': {
    signifier: () => getCssVar('--color-fg-neutral-primary') || '#181818',
    container: () => getCssVar('--color-bg-positive-low') || '#A9E2B3'
  },
  'positive-bold': {
    signifier: () => getCssVar('--color-fg-neutral-inverse-primary') || '#FFFFFF',
    container: () => getCssVar('--color-bg-positive-high') || '#247450'
  },
  'alert': {
    signifier: () => getCssVar('--color-fg-alert-high') || '#712C28',
    container: () => getCssVar('--color-bg-alert-low') || '#F5CBC5'
  },
  'alert-bold': {
    signifier: () => getCssVar('--color-fg-neutral-inverse-primary') || '#FFFFFF',
    container: () => getCssVar('--color-bg-alert-high') || '#B33F3B'
  },
  'attention': {
    signifier: () => getCssVar('--color-fg-neutral-primary') || '#181818',
    container: () => getCssVar('--color-bg-attention-medium') || '#EED366'
  },
  'info': {
    signifier: () => getCssVar('--color-fg-neutral-primary') || '#181818',
    container: () => getCssVar('--color-bg-input-low') || '#B9DFEA'
  },
  'info-bold': {
    signifier: () => getCssVar('--color-fg-neutral-inverse-primary') || '#FFFFFF',
    container: () => getCssVar('--color-bg-input-high') || '#376C89'
  },
  'question': {
    signifier: () => getCssVar('--color-fg-neutral-primary') || '#181818',
    container: () => getCssVar('--color-bg-neutral-low') || '#E0E0E0'
  },
  'plus': {
    signifier: () => getCssVar('--color-fg-neutral-primary') || '#181818',
    container: () => getCssVar('--color-bg-neutral-low') || '#E0E0E0'
  },
  'minus': {
    signifier: () => getCssVar('--color-fg-neutral-primary') || '#181818',
    container: () => getCssVar('--color-bg-neutral-low') || '#E0E0E0'
  },
  'arrow-up': {
    signifier: () => getCssVar('--color-fg-neutral-primary') || '#181818',
    container: () => getCssVar('--color-bg-neutral-low') || '#E0E0E0'
  },
  'arrow-down': {
    signifier: () => getCssVar('--color-fg-neutral-primary') || '#181818',
    container: () => getCssVar('--color-bg-neutral-low') || '#E0E0E0'
  },
  'arrow-left': {
    signifier: () => getCssVar('--color-fg-neutral-primary') || '#181818',
    container: () => getCssVar('--color-bg-neutral-low') || '#E0E0E0'
  },
  'arrow-right': {
    signifier: () => getCssVar('--color-fg-neutral-primary') || '#181818',
    container: () => getCssVar('--color-bg-neutral-low') || '#E0E0E0'
  },
  'chevron-up': {
    signifier: () => getCssVar('--color-fg-neutral-primary') || '#181818',
    container: () => getCssVar('--color-bg-neutral-low') || '#E0E0E0'
  },
  'chevron-down': {
    signifier: () => getCssVar('--color-fg-neutral-primary') || '#181818',
    container: () => getCssVar('--color-bg-neutral-low') || '#E0E0E0'
  },
  'chevron-left': {
    signifier: () => getCssVar('--color-fg-neutral-primary') || '#181818',
    container: () => getCssVar('--color-bg-neutral-low') || '#E0E0E0'
  },
  'chevron-right': {
    signifier: () => getCssVar('--color-fg-neutral-primary') || '#181818',
    container: () => getCssVar('--color-bg-neutral-low') || '#E0E0E0'
  },
};

/**
 * Map semantic names to file names
 */
const nameToFileMap: Record<BicolorIconName, { small: string; medium: string }> = {
  'positive': {
    small: 'checkmark-circle-small-bicolor-light.svg',
    medium: 'checkmark-circle-bicolor-light.svg',
  },
  'positive-bold': {
    small: 'checkmark-circle-small-bicolor-bold.svg',
    medium: 'checkmark-circle-bicolor-bold.svg',
  },
  'alert': {
    small: 'exclamation-circle-small-bicolor-light.svg',
    medium: 'exclamation-circle-bicolor-light.svg',
  },
  'alert-bold': {
    small: 'exclamation-circle-small-bicolor-bold.svg',
    medium: 'exclamation-circle-bicolor-bold.svg',
  },
  'attention': {
    small: 'exclamation-triangle-small-bicolor.svg',
    medium: 'exclamation-triangle-bicolor.svg',
  },
  'info': {
    small: 'info-circle-small-bicolor-light.svg',
    medium: 'info-circle-bicolor-light.svg',
  },
  'info-bold': {
    small: 'info-circle-small-bicolor-bold.svg',
    medium: 'info-circle-bicolor-bold.svg',
  },
  'question': {
    small: 'question-circle-small-bicolor.svg',
    medium: 'question-circle-bicolor.svg',
  },
  'plus': {
    small: 'plus-circle-small-bicolor.svg',
    medium: 'plus-circle-bicolor.svg',
  },
  'minus': {
    small: 'minus-circle-small-bicolor.svg',
    medium: 'minus-circle-bicolor.svg',
  },
  'arrow-up': {
    small: 'arrow-up-circle-small-bicolor.svg',
    medium: 'arrow-up-circle-bicolor.svg',
  },
  'arrow-down': {
    small: 'arrow-down-circle-small-bicolor.svg',
    medium: 'arrow-down-circle-bicolor.svg',
  },
  'arrow-left': {
    small: 'arrow-left-circle-small-bicolor.svg',
    medium: 'arrow-left-circle-bicolor.svg',
  },
  'arrow-right': {
    small: 'arrow-right-circle-small-bicolor.svg',
    medium: 'arrow-right-circle-bicolor.svg',
  },
  'chevron-up': {
    small: 'chevron-up-circle-small-bicolor.svg',
    medium: 'chevron-up-circle-bicolor.svg',
  },
  'chevron-down': {
    small: 'chevron-down-circle-small-bicolor.svg',
    medium: 'chevron-down-circle-bicolor.svg',
  },
  'chevron-left': {
    small: 'chevron-left-circle-small-bicolor.svg',
    medium: 'chevron-left-circle-bicolor.svg',
  },
  'chevron-right': {
    small: 'chevron-right-circle-small-bicolor.svg',
    medium: 'chevron-right-circle-bicolor.svg',
  },
};

/**
 * Get SVG string for a bicolor icon
 */
function getBicolorIconSvg(name: BicolorIconName, size: BicolorIconSize): string | null {
  const fileMapping = nameToFileMap[name];
  if (!fileMapping) {
    console.error(`No file mapping found for bicolor icon: ${name}`);
    return null;
  }

  const fileName = size === 'small' ? fileMapping.small : fileMapping.medium;
  const key = `./${fileName}`;

  // Try to get from appropriate size
  const icons = size === 'small' ? smallBicolorIconMap : mediumBicolorIconMap;
  let svgContent = icons[key];

  if (!svgContent) {
    // Try fallback to other size
    const fallbackSize = size === 'small' ? 'medium' : 'small';
    const fallbackFileName = fallbackSize === 'small' ? fileMapping.small : fileMapping.medium;
    const fallbackKey = `./${fallbackFileName}`;
    const fallbackIcons = fallbackSize === 'small' ? smallBicolorIconMap : mediumBicolorIconMap;

    svgContent = fallbackIcons[fallbackKey];

    if (svgContent) {
      console.warn(
        `BicolorIcon "${name}" not found in ${size} size, using ${fallbackSize} size as fallback`
      );
    }
  }

  return svgContent || null;
}

/**
 * Replace fill colors in SVG
 * First fill = container (circle/triangle/square)
 * Second+ fills = signifier (checkmark/exclamation/etc)
 * All signifier fills get the same color
 */
function replaceColors(
  svgContent: string,
  containerColor: string,
  signifierColor: string
): string {
  // Strategy: Replace fill attributes only on path/circle/rect/polygon elements
  // Skip fill='none' or fill="none" as those are typically on the SVG element itself

  let colorIndex = 0;

  // Replace fill attributes on path elements (most common)
  let modifiedSvg = svgContent.replace(/<path([^>]*?)fill=(['"])([^'"]+)\2/g, (match, beforeFill, quote, fillValue) => {
    // Skip fill='none' or fill="none"
    if (fillValue === 'none') {
      return match;
    }

    const newColor = colorIndex === 0 ? containerColor : signifierColor;
    colorIndex++;
    return `<path${beforeFill}fill=${quote}${newColor}${quote}`;
  });

  // Also handle other shape elements
  const shapeElements = ['circle', 'rect', 'polygon', 'ellipse', 'polyline'];
  shapeElements.forEach(element => {
    modifiedSvg = modifiedSvg.replace(
      new RegExp(`<${element}([^>]*?)fill=(['"])([^'"]+)\\2`, 'g'),
      (match, beforeFill, quote, fillValue) => {
        if (fillValue === 'none') {
          return match;
        }
        const newColor = colorIndex === 0 ? containerColor : signifierColor;
        colorIndex++;
        return `<${element}${beforeFill}fill=${quote}${newColor}${quote}`;
      }
    );
  });

  return modifiedSvg;
}

/**
 * BicolorIcon component for semantic status and directional icons
 *
 * Icon sizing:
 * - small: 20x20px (w-5 h-5)
 * - medium: 24x24px (w-6 h-6)
 *
 * Colors are customizable per icon:
 * - Container: outer shape (circle, triangle, square)
 * - Signifier: inner element (checkmark, exclamation, arrow, etc.)
 *
 * @example
 * <BicolorIcon name="positive" size="small" />
 * <BicolorIcon name="alert" size="medium" />
 * <BicolorIcon name="info" containerColor="#FFD700" signifierColor="#000" />
 */
export const BicolorIcon = React.forwardRef<HTMLSpanElement, BicolorIconProps>(
  (
    {
      name,
      size = 'small',
      signifierColor,
      containerColor,
      className,
      'aria-label': ariaLabel,
      'aria-hidden': ariaHidden = true,
    },
    ref
  ) => {
    // Compute size classes
    const sizeClasses = size === 'small' ? 'w-5 h-5' : 'w-6 h-6';

    // Get default colors for this icon (call functions to resolve CSS variables)
    const colors = defaultColors[name] || {
      signifier: () => getCssVar('--color-fg-neutral-primary') || '#181818',
      container: () => getCssVar('--color-bg-positive-low') || '#A9E2B3'
    };
    const finalSignifierColor = signifierColor || colors.signifier();
    const finalContainerColor = containerColor || colors.container();

    // Get SVG string
    let rawSvgContent = getBicolorIconSvg(name, size);
    let svgContent = rawSvgContent;

    // Normalize SVG content
    if (!svgContent) {
      console.error(`BicolorIcon "${name}" not found in any size`);
      svgContent = '';
    } else if (typeof svgContent !== 'string') {
      // Handle module exports (similar to Icon component)
      if (svgContent && typeof svgContent === 'object') {
        // Try default export first (most common with ?raw in Vite)
        if ((svgContent as any).default && typeof (svgContent as any).default === 'string') {
          svgContent = (svgContent as any).default;
        }
        // Try src property (Next.js/webpack pattern with data URLs)
        else if ((svgContent as any).src && typeof (svgContent as any).src === 'string') {
          const srcValue = (svgContent as any).src;
          if (srcValue.startsWith('data:image/svg+xml,')) {
            const encodedSvg = srcValue.replace('data:image/svg+xml,', '');
            const decodedSvg = decodeURIComponent(encodedSvg);
            svgContent = decodedSvg;
          }
        }
        // Try href property
        else if ((svgContent as any).href && typeof (svgContent as any).href === 'string') {
          svgContent = (svgContent as any).href;
        }
      }

      if (typeof svgContent !== 'string') {
        console.error(`BicolorIcon "${name}" returned non-string content:`, typeof svgContent);
        svgContent = '';
      }
    }

    // Replace colors in SVG - use useMemo to ensure re-computation when colors change
    const finalHtml = React.useMemo(() => {
      // Fallback if no valid SVG content
      if (!svgContent || typeof svgContent !== 'string') {
        return `<svg class="${cn(sizeClasses, 'shrink-0', className)}" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="${ariaHidden}" aria-label="${ariaLabel || ''}" role="${ariaLabel ? 'img' : ''}">
          <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" stroke-width="1.5"/>
          <path d="M10 14V14.5M10 11C10 10.5 10 10 10.5 9.5C11 9 12 8.5 12 7.5C12 6.5 11.5 6 10 6C8.5 6 8 6.5 8 7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>`;
      }

      let modifiedSvg = replaceColors(svgContent, finalContainerColor, finalSignifierColor);

      // Parse SVG and inject classes/attributes
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

      return modifiedSvg;
    }, [name, size, svgContent, finalContainerColor, finalSignifierColor, className, ariaLabel, ariaHidden, sizeClasses]);

    return (
      <span
        ref={ref}
        dangerouslySetInnerHTML={{ __html: finalHtml }}
        className="inline-flex items-center justify-center"
      />
    );
  }
);

BicolorIcon.displayName = 'BicolorIcon';
