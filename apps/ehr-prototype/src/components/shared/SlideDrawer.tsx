/**
 * SlideDrawer Component
 *
 * Reusable slide-in drawer with view stack navigation.
 * Used by population health workspace; encounter detail pane can adopt later.
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
} from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface SlideDrawerProps {
  /** Whether the drawer is open */
  open: boolean;
  /** Called when the drawer should close */
  onClose: () => void;
  /** Drawer width (number = px, string = CSS value). Default ~45% */
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
  /** Dim content behind drawer. Default true */
  overlayDim?: boolean;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const SlideDrawer: React.FC<SlideDrawerProps> = ({
  open,
  onClose,
  width = '45%',
  position = 'right',
  children,
  header,
  showBack = false,
  onBack,
  overlayDim = true,
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

  const widthValue = typeof width === 'number' ? `${width}px` : width;

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    zIndex: zIndexTokens.modal - 1,
    backgroundColor: overlayDim ? 'rgba(0, 0, 0, 0.15)' : 'transparent',
    opacity: open ? 1 : 0,
    pointerEvents: open ? 'auto' : 'none',
    transition: `opacity ${transitions.base}`,
  };

  const drawerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    [position]: 0,
    width: widthValue,
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
    boxShadow: open ? '-4px 0 16px rgba(0, 0, 0, 0.08)' : 'none',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.related,
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
    flexShrink: 0,
    minHeight: 48,
  };

  const headerContentStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
  };

  const closeButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    border: 'none',
    borderRadius: borderRadius.sm,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: colors.fg.neutral.secondary,
    flexShrink: 0,
    transition: `background-color ${transitions.fast}`,
  };

  const backButtonStyle: React.CSSProperties = {
    ...closeButtonStyle,
  };

  const bodyStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'auto',
  };

  return (
    <>
      {/* Overlay */}
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
        {/* Header */}
        {(header || showBack) && (
          <div style={headerStyle}>
            {showBack && (
              <button
                type="button"
                style={backButtonStyle}
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
              style={closeButtonStyle}
              onClick={onClose}
              aria-label="Close drawer"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Body */}
        <div style={bodyStyle}>
          {children}
        </div>
      </div>
    </>
  );
};

SlideDrawer.displayName = 'SlideDrawer';
