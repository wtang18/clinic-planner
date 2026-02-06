/**
 * Modal Component
 *
 * Overlay container for dialogs, bottom sheets, and centered modals.
 */

import React from 'react';
import { colors, borderRadius, transitions, spaceAround } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Called when close is requested (backdrop click) */
  onClose?: () => void;
  /** Position of the modal content */
  position?: 'center' | 'bottom';
  /** Size constraint for the modal */
  size?: 'sm' | 'md' | 'lg';
  /** Modal content */
  children: React.ReactNode;
  /** Whether to show backdrop overlay */
  hasBackdrop?: boolean;
  /** Whether clicking backdrop closes the modal */
  closeOnBackdropClick?: boolean;
  /** Custom styles for the content container */
  style?: React.CSSProperties;
}

// ============================================================================
// Constants
// ============================================================================

const sizeMaxWidths: Record<string, string> = {
  sm: '400px',
  md: '600px',
  lg: '800px',
};

// ============================================================================
// Component
// ============================================================================

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  position = 'bottom',
  size = 'md',
  children,
  hasBackdrop = true,
  closeOnBackdropClick = true,
  style,
}) => {
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? 'visible' : 'hidden',
    transition: `opacity ${transitions.base}, visibility ${transitions.base}`,
    zIndex: 100,
  };

  const getContentPosition = (): React.CSSProperties => {
    if (position === 'center') {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: isOpen ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.95)',
        borderRadius: borderRadius.md,
      };
    }
    // bottom
    return {
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: isOpen ? 'translate(-50%, 0)' : 'translate(-50%, 100%)',
      borderRadius: `${borderRadius.md}px ${borderRadius.md}px 0 0`,
    };
  };

  const contentStyle: React.CSSProperties = {
    ...getContentPosition(),
    width: '100%',
    maxWidth: sizeMaxWidths[size],
    maxHeight: position === 'bottom' ? '70vh' : '80vh',
    backgroundColor: colors.bg.neutral.base,
    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    transition: `transform ${transitions.slow}, opacity ${transitions.base}`,
    opacity: isOpen ? 1 : 0,
    zIndex: 101,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    ...style,
  };

  const handleBackdropClick = () => {
    if (closeOnBackdropClick && onClose) {
      onClose();
    }
  };

  return (
    <>
      {hasBackdrop && <div style={overlayStyle} onClick={handleBackdropClick} />}
      <div style={contentStyle}>
        {children}
      </div>
    </>
  );
};

Modal.displayName = 'Modal';
