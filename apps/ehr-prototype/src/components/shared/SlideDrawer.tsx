/**
 * SlideDrawer Component
 *
 * Reusable slide-in drawer with view stack navigation.
 * Used by population health workspace; encounter detail pane can adopt later.
 *
 * Features:
 * - No scrim overlay — elevation-only separation (transparent click-catcher for dismiss)
 * - Glass header with 44px buttons + gradient blur fade
 * - Optional sticky footer slot with inverted gradient blur
 * - Named width variants: narrow (360px), standard (45%), wide (55%)
 */

import React, { useEffect, useCallback } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import {
  colors,
  spaceAround,
  spaceBetween,
  typography,
  transitions,
  borderRadius,
  zIndex as zIndexTokens,
  glass,
  GLASS_BUTTON_HEIGHT,
  GLASS_BUTTON_RADIUS,
} from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export type DrawerSize = 'narrow' | 'standard' | 'wide';

const SIZE_MAP: Record<DrawerSize, string> = {
  narrow: '360px',
  standard: '45%',
  wide: '55%',
};

export interface SlideDrawerProps {
  /** Whether the drawer is open */
  open: boolean;
  /** Called when the drawer should close */
  onClose: () => void;
  /** Named width variant. Default 'standard' */
  size?: DrawerSize;
  /** Drawer width (number = px, string = CSS value). Overrides `size` if provided. */
  width?: number | string;
  /** Slide-in direction. Default 'right' */
  position?: 'right' | 'left';
  /** Drawer content */
  children: React.ReactNode;
  /** Configurable header content (title, breadcrumbs, etc.) */
  header?: React.ReactNode;
  /** Show back button in header */
  showBack?: boolean;
  /** Called when back button is clicked */
  onBack?: () => void;
  /** Optional sticky footer content (action bar) */
  footer?: React.ReactNode;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const SlideDrawer: React.FC<SlideDrawerProps> = ({
  open,
  onClose,
  size = 'standard',
  width,
  position = 'right',
  children,
  header,
  showBack = false,
  onBack,
  footer,
  testID,
}) => {
  // Escape key dismisses
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    },
    [open, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Width resolution: explicit width prop > size variant
  const resolvedWidth = width != null
    ? (typeof width === 'number' ? `${width}px` : width)
    : SIZE_MAP[size];

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    zIndex: zIndexTokens.modal - 1,
    backgroundColor: 'transparent',
    opacity: open ? 1 : 0,
    pointerEvents: open ? 'auto' : 'none',
    transition: `opacity ${transitions.base}`,
  };

  const drawerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    [position]: 0,
    width: resolvedWidth,
    maxWidth: '90%',
    backgroundColor: colors.bg.neutral.base,
    borderLeft: position === 'right' ? `1px solid ${colors.border.neutral.low}` : 'none',
    borderRight: position === 'left' ? `1px solid ${colors.border.neutral.low}` : 'none',
    zIndex: zIndexTokens.modal,
    display: 'flex',
    flexDirection: 'column',
    transform: open
      ? 'translateX(0)'
      : position === 'right'
        ? 'translateX(100%)'
        : 'translateX(-100%)',
    transition: `transform ${transitions.base}`,
    boxShadow: open ? '-8px 0 24px rgba(0, 0, 0, 0.12)' : 'none',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.related,
    padding: `${spaceAround.tight}px ${spaceAround.default}px`,
    flexShrink: 0,
    minHeight: 60,
    position: 'relative',
    backdropFilter: 'blur(32px)',
    WebkitBackdropFilter: 'blur(32px)',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  };

  const headerFadeStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -16,
    height: 16,
    background: 'linear-gradient(to bottom, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 40%, transparent 100%)',
    pointerEvents: 'none',
    zIndex: 1,
  };

  const headerContentStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
  };

  const glassButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: GLASS_BUTTON_HEIGHT,
    height: GLASS_BUTTON_HEIGHT,
    borderRadius: GLASS_BUTTON_RADIUS,
    cursor: 'pointer',
    color: colors.fg.neutral.secondary,
    flexShrink: 0,
    transition: `background-color ${transitions.fast}`,
    ...glass.button,
  };

  const bodyStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'auto',
  };

  const footerContainerStyle: React.CSSProperties = {
    flexShrink: 0,
    position: 'relative',
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
    backdropFilter: 'blur(32px)',
    WebkitBackdropFilter: 'blur(32px)',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const footerFadeStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -16,
    height: 16,
    background: 'linear-gradient(to top, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 40%, transparent 100%)',
    pointerEvents: 'none',
  };

  return (
    <>
      {/* Transparent click-catcher (no scrim) */}
      <div
        style={overlayStyle}
        onClick={onClose}
        aria-hidden="true"
        data-testid={testID ? `${testID}-overlay` : undefined}
      />

      {/* Drawer */}
      <div
        style={drawerStyle}
        role="dialog"
        aria-modal="true"
        data-testid={testID}
      >
        {/* Glass header with gradient fade */}
        {(header || showBack) && (
          <div style={headerStyle}>
            {showBack && (
              <button
                type="button"
                style={glassButtonStyle}
                onClick={onBack}
                aria-label="Go back"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <div style={headerContentStyle}>
              {header}
            </div>
            <button
              type="button"
              style={glassButtonStyle}
              onClick={onClose}
              aria-label="Close drawer"
            >
              <X size={18} />
            </button>
            {/* Gradient blur fade below header */}
            <div style={headerFadeStyle} />
          </div>
        )}

        {/* Body */}
        <div style={bodyStyle}>
          {children}
        </div>

        {/* Sticky footer slot */}
        {footer && (
          <div style={footerContainerStyle}>
            {/* Gradient blur fade above footer */}
            <div style={footerFadeStyle} />
            {footer}
          </div>
        )}
      </div>
    </>
  );
};

SlideDrawer.displayName = 'SlideDrawer';
