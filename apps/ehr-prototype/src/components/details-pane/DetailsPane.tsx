/**
 * DetailsPane Component
 *
 * Right-side overlay drawer for viewing and editing any chart item.
 * Sections: Header → Details (editable) → Actions → Activity Log.
 * Closes via: Escape key, close button, or backdrop click.
 *
 * Pattern: follows TaskPane (fixed-position right panel with backdrop overlay).
 */

import React, { useEffect, useCallback } from 'react';
import type { ChartItem } from '../../types/chart-items';
import { colors, spaceAround, spaceBetween, typography, shadows, transitions, zIndex } from '../../styles/foundations';
import { DetailsPaneHeader } from './DetailsPaneHeader';
import { DetailsPaneContent } from './DetailsPaneContent';
import { DetailsPaneActions } from './DetailsPaneActions';
import { ActivityLog } from './ActivityLog';

// ============================================================================
// Types
// ============================================================================

export interface DetailsPaneProps {
  /** The item to display/edit, or null when closed */
  item: ChartItem | null;
  /** Called to close the pane */
  onClose: () => void;
  /** Called when a field is edited in the pane */
  onUpdate: (id: string, changes: Partial<ChartItem>) => void;
  /** Called when "Remove from Chart" is clicked */
  onRemove: (id: string) => void;
  /** Width of the pane */
  width?: number;
}

// ============================================================================
// Component
// ============================================================================

export const DetailsPane: React.FC<DetailsPaneProps> = ({
  item,
  onClose,
  onUpdate,
  onRemove,
  width = 380,
}) => {
  const isOpen = item !== null;

  // ── Escape key handler ──
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      e.stopPropagation();
      onClose();
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  // ── Styles ──
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
    zIndex: zIndex.overlay,
  };

  const paneStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width,
    backgroundColor: colors.bg.neutral.base,
    boxShadow: shadows.xl,
    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
    transition: `transform ${transitions.slow}`,
    zIndex: zIndex.modal,
    display: 'flex',
    flexDirection: 'column',
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: spaceAround.default,
    display: 'flex',
    flexDirection: 'column',
    gap: spaceAround.spacious,
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    margin: 0,
    marginBottom: spaceBetween.repeating,
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div style={overlayStyle} onClick={onClose} />

      {/* Pane */}
      <div style={paneStyle} data-testid="details-pane">
        {item && (
          <>
            {/* Header */}
            <DetailsPaneHeader item={item} onClose={onClose} />

            {/* Scrollable content */}
            <div style={contentStyle}>
              {/* Details section */}
              <section>
                <h4 style={sectionTitleStyle}>Details</h4>
                <DetailsPaneContent
                  item={item}
                  onUpdate={(changes) => onUpdate(item.id, changes)}
                />
              </section>

              {/* Actions section */}
              <section>
                <DetailsPaneActions
                  item={item}
                  onRemove={() => onRemove(item.id)}
                />
              </section>

              {/* Activity Log section */}
              <section>
                <h4 style={sectionTitleStyle}>Activity Log</h4>
                <ActivityLog entries={item.activityLog} />
              </section>
            </div>
          </>
        )}
      </div>
    </>
  );
};

DetailsPane.displayName = 'DetailsPane';
