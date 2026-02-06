/**
 * MobileSheet Component
 *
 * Bottom sheet component for mobile responsive layouts.
 * Can be half-height or full-height, supports swipe-to-dismiss.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { colors, borderRadius, shadows, transitions, zIndex as zIndexTokens } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export type SheetHeight = 'half' | 'full' | 'auto';
export type SheetPosition = 'bottom' | 'left' | 'right';

export interface MobileSheetProps {
  /** Whether the sheet is open */
  isOpen: boolean;
  /** Called when the sheet should close */
  onClose: () => void;
  /** Sheet content */
  children: React.ReactNode;
  /** Sheet height mode */
  height?: SheetHeight;
  /** Sheet position */
  position?: SheetPosition;
  /** Whether to show the backdrop */
  showBackdrop?: boolean;
  /** Whether to allow swipe-to-dismiss */
  swipeToDismiss?: boolean;
  /** Accessible title */
  title?: string;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const MobileSheet: React.FC<MobileSheetProps> = ({
  isOpen,
  onClose,
  children,
  height = 'half',
  position = 'bottom',
  showBackdrop = true,
  swipeToDismiss = true,
  title,
  style,
  testID,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || Platform.OS !== 'web') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle touch/swipe for dismissal
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (!swipeToDismiss || position !== 'bottom') return;
    setIsDragging(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startY.current = clientY;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || position !== 'bottom') return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const delta = clientY - startY.current;
    if (delta > 0) {
      setDragOffset(delta);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // If dragged more than 100px, close the sheet
    if (dragOffset > 100) {
      onClose();
    }
    setDragOffset(0);
  };

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const getSheetHeight = () => {
    switch (height) {
      case 'full':
        return '100%';
      case 'half':
        return '50%';
      case 'auto':
        return 'auto';
      default:
        return '50%';
    }
  };

  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    opacity: isOpen ? 1 : 0,
    pointerEvents: isOpen ? 'auto' : 'none',
    transition: `opacity ${transitions.base}`,
    zIndex: zIndexTokens.overlay - 1,
  };

  const getTransform = () => {
    const offset = isDragging ? dragOffset : 0;

    if (position === 'bottom') {
      return isOpen ? `translateY(${offset}px)` : 'translateY(100%)';
    }
    if (position === 'left') {
      return isOpen ? 'translateX(0)' : 'translateX(-100%)';
    }
    if (position === 'right') {
      return isOpen ? 'translateX(0)' : 'translateX(100%)';
    }
    return 'none';
  };

  const sheetStyle: React.CSSProperties = {
    position: 'fixed',
    backgroundColor: colors.bg.neutral.base,
    boxShadow: shadows.xl,
    zIndex: zIndexTokens.overlay,
    transition: isDragging ? 'none' : `transform ${transitions.slow}`,
    transform: getTransform(),
    display: 'flex',
    flexDirection: 'column',
    ...(position === 'bottom' && {
      bottom: 0,
      left: 0,
      right: 0,
      height: getSheetHeight(),
      maxHeight: height === 'full' ? '100%' : '90%',
      borderTopLeftRadius: borderRadius.lg,
      borderTopRightRadius: borderRadius.lg,
    }),
    ...(position === 'left' && {
      top: 0,
      left: 0,
      bottom: 0,
      width: 280,
      maxWidth: '80%',
    }),
    ...(position === 'right' && {
      top: 0,
      right: 0,
      bottom: 0,
      width: 280,
      maxWidth: '80%',
    }),
    ...style,
  };

  const handleStyle: React.CSSProperties = {
    display: position === 'bottom' ? 'flex' : 'none',
    justifyContent: 'center',
    padding: '12px 0 8px',
    cursor: swipeToDismiss ? 'grab' : 'default',
    touchAction: 'none',
  };

  const handleBarStyle: React.CSSProperties = {
    width: 36,
    height: 4,
    backgroundColor: colors.border.neutral.medium,
    borderRadius: borderRadius.full,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'auto',
  };

  if (Platform.OS !== 'web') {
    // TODO: Implement native bottom sheet using react-native-gesture-handler
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      {showBackdrop && (
        <div
          style={backdropStyle}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sheet */}
      <div
        ref={sheetRef}
        style={sheetStyle}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-testid={testID}
      >
        {/* Drag handle for bottom sheets */}
        {position === 'bottom' && (
          <div
            style={handleStyle}
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div style={handleBarStyle} />
          </div>
        )}

        {/* Content */}
        <div style={contentStyle}>
          {children}
        </div>
      </div>
    </>
  );
};

MobileSheet.displayName = 'MobileSheet';
