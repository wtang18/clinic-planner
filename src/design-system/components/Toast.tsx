'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import { BicolorIcon, type BicolorIconName } from '@/design-system/icons';
import { Icon, type IconName } from '@/design-system/icons';
import { Button } from './Button';

export type ToastType = 'positive' | 'alert' | 'attention' | 'info' | 'icon' | 'no-icon';

export interface ToastProps {
  /** Toast variant type */
  type: ToastType;
  /** Main notification title */
  title: string;
  /** Whether to show subtext */
  showSubtext?: boolean;
  /** Subtext content (only shown if showSubtext=true) */
  subtext?: string;
  /** Whether to show CTA button */
  showCta?: boolean;
  /** CTA button label */
  ctaLabel?: string;
  /** CTA button click handler */
  onCtaClick?: () => void;
  /** Whether to show close button */
  showClose?: boolean;
  /** Auto-dismiss after timeout (default: true) */
  autoDismiss?: boolean;
  /** Close handler */
  onClose: () => void;
  /** Custom icon name (required when type="icon") */
  customIcon?: IconName;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label for the toast */
  'aria-label'?: string;
  /** ARIA live region politeness level (default: 'polite') */
  'aria-live'?: 'polite' | 'assertive' | 'off';
}

/**
 * Map toast types to BicolorIcon names
 * Uses bold variants for positive, alert, and info (as per design)
 */
const typeToIconMap: Record<Exclude<ToastType, 'icon' | 'no-icon'>, BicolorIconName> = {
  positive: 'positive-bold',
  alert: 'alert-bold',
  attention: 'attention',
  info: 'info-bold',
};

/**
 * Toast component for displaying notifications
 *
 * Exact Figma Design Specs:
 * - Container: bg-white, px-[16px], py-[12px], rounded-[16px], gap-[16px]
 * - Min height: 72px (ensures proper height for title + subtext)
 * - Shadow: 0px 4px 16px 0px rgba(0,0,0,0.16)
 * - Icon: 32x32px BicolorIcon or 24x24px regular Icon
 * - Title: font-medium text-[16px] leading-[24px] text-[#181818] (Body/Md Medium)
 * - Subtext: font-normal text-[14px] leading-[20px] text-[#424242] (Body/Sm Regular)
 * - CTA Button: Button component with type="transparent", size="medium"
 * - Close icon: 24x24px x icon
 * - Right section gap: gap-[12px]
 * - Layout: Icon (32px) + gap-[16px] + Text + gap-[16px] + Right (CTA + Close)
 *
 * @example
 * <Toast
 *   type="positive"
 *   title="Success!"
 *   showSubtext
 *   subtext="Your changes have been saved."
 *   showCta
 *   ctaLabel="View"
 *   onCtaClick={() => {}}
 *   showClose
 *   onClose={() => {}}
 * />
 */
export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      type,
      title,
      showSubtext = false,
      subtext,
      showCta = false,
      ctaLabel = 'Label',
      onCtaClick,
      showClose = true,
      autoDismiss = true,
      onClose,
      customIcon,
      className,
      'aria-label': ariaLabel,
      'aria-live': ariaLive = 'polite',
    },
    ref
  ) => {
    // Validation: if autoDismiss is false, showClose must be true
    React.useEffect(() => {
      if (!autoDismiss && !showClose) {
        console.warn('Toast: autoDismiss=false requires showClose=true to allow user to dismiss');
      }
    }, [autoDismiss, showClose]);

    // Validation: if type="icon", customIcon is required
    React.useEffect(() => {
      if (type === 'icon' && !customIcon) {
        console.warn('Toast: type="icon" requires customIcon prop');
      }
    }, [type, customIcon]);

    // Validation: if showSubtext is true, subtext should be provided
    React.useEffect(() => {
      if (showSubtext && !subtext) {
        console.warn('Toast: showSubtext=true but no subtext provided');
      }
    }, [showSubtext, subtext]);

    // Note: Auto-dismiss is handled by ToastProvider, not here
    // This component just renders the toast UI

    // Render icon based on type (32x32px for both BicolorIcon and regular Icon)
    const renderIcon = () => {
      if (type === 'no-icon') {
        return null;
      }

      if (type === 'icon') {
        if (customIcon) {
          return (
            <div className="flex items-end shrink-0">
              {/* Regular Icon scaled to 32x32px to match BicolorIcon dimensions */}
              <div className="w-8 h-8 flex items-center justify-center">
                <Icon name={customIcon} size="medium" className="!w-8 !h-8 !text-[var(--color-fg-neutral-primary)]" />
              </div>
            </div>
          );
        }
        return null;
      }

      // For 'positive' | 'alert' | 'attention' | 'info' types
      const iconName = typeToIconMap[type];
      return (
        <div className="flex items-end shrink-0">
          {/* BicolorIcon: 32x32px as per Figma */}
          <div className="w-8 h-8">
            <BicolorIcon name={iconName} size="medium" className="!w-8 !h-8" />
          </div>
        </div>
      );
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Exact Figma container specs
          'bg-[var(--color-bg-neutral-base)] box-border flex gap-[16px] items-center px-[16px] py-[12px] rounded-[16px]',
          'elevation-lg',
          'min-h-[72px]', // Ensures proper height for title + subtext
          // Width: 480px default, responsive to container
          'w-[480px] max-w-full',
          className
        )}
        role="alert"
        aria-live={ariaLive}
        aria-label={ariaLabel}
      >
        {/* Left section: Icon + Text (gap-[16px] between icon and text) */}
        <div className="flex gap-[16px] items-center grow min-w-0">
          {renderIcon()}

          {/* Text section */}
          <div className="flex flex-col items-start grow min-w-0">
            {/* Title - Exact Figma: Body/Md Medium (16px/24px, font-medium) */}
            <div className="flex items-start w-full">
              <p className="text-body-md-medium !text-[var(--color-fg-neutral-primary)] grow min-w-0">
                {title}
              </p>
            </div>

            {/* Subtext - Exact Figma: Body/Sm Regular (14px/20px, font-normal) */}
            {showSubtext && subtext && (
              <div className="flex items-start w-full">
                <p className="text-body-sm-regular !text-[var(--color-fg-neutral-secondary)] grow min-w-0">
                  {subtext}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right section: CTA + Close (gap-[12px] between buttons) */}
        <div className="flex gap-[12px] items-center justify-end shrink-0">
          {/* CTA button using Button component with transparent type */}
          {showCta && (
            <Button
              type="transparent"
              size="medium"
              label={ctaLabel}
              onClick={onCtaClick}
              className="min-w-[40px]"
            />
          )}

          {/* Close button - 24x24px icon */}
          {showClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex items-end shrink-0 hover:opacity-70 transition-opacity"
              aria-label="Close notification"
            >
              <Icon name="x" size="medium" className="!text-[var(--color-fg-neutral-primary)]" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

Toast.displayName = 'Toast';
