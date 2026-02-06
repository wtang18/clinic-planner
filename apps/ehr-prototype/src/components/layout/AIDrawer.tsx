/**
 * AIDrawer Component
 *
 * Slide-in drawer for AI features.
 * 320px width, overlay mode, slides from right edge.
 */

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { colors, borderRadius, spaceAround, spaceBetween, typography, transitions, shadows } from '../../styles/foundations';
import { AIDrawerContent, AIDrawerMode } from '../ai-ui/AIDrawerContent';

// ============================================================================
// Types
// ============================================================================

export interface AIDrawerProps {
  /** Whether the drawer is open */
  isOpen: boolean;
  /** Called when the drawer should close */
  onClose: () => void;
  /** Current drawer mode */
  mode?: AIDrawerMode;
  /** Title override */
  title?: string;
  /** Custom content */
  children?: React.ReactNode;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const AIDrawer: React.FC<AIDrawerProps> = ({
  isOpen,
  onClose,
  mode = 'suggestions',
  title,
  children,
  style,
  testID,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus close button when opened
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: colors.bg.neutral.base,
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
    flexShrink: 0,
  };

  const closeButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: borderRadius.sm,
    cursor: 'pointer',
    color: colors.fg.neutral.secondary,
    transition: `all ${transitions.fast}`,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'hidden',
  };

  return (
    <div style={containerStyle} data-testid={testID} role="dialog" aria-modal="true" aria-label="AI Assistant">
      {/* Close button header */}
      <header style={headerStyle}>
        <button
          ref={closeButtonRef}
          type="button"
          style={closeButtonStyle}
          onClick={onClose}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.bg.neutral.subtle;
            e.currentTarget.style.color = colors.fg.neutral.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = colors.fg.neutral.secondary;
          }}
          aria-label="Close drawer"
        >
          <X size={18} />
        </button>
      </header>

      {/* Content */}
      <div style={contentStyle}>
        {children || (
          <AIDrawerContent mode={mode} title={title} />
        )}
      </div>
    </div>
  );
};

AIDrawer.displayName = 'AIDrawer';
