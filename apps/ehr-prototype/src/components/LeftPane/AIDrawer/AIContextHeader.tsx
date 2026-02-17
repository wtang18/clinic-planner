/**
 * AIContextHeader Component
 *
 * Floating context header for the AI drawer with blur backdrop.
 * Shows current context scope, activity log button, and dismiss/broaden scope button.
 *
 * @see AI_DRAWER.md §3 for full specification
 */

import React, { useState, useRef, useEffect } from 'react';
import { CornerDownRight, ClipboardList, X, ChevronsUpDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export type ContextScope = 'item' | 'section' | 'encounter' | 'patient' | 'global';

export interface AIContextHeaderProps {
  /** Current context scope level */
  scope: ContextScope;
  /** Patient name (for encounter/patient scope) */
  patientName?: string;
  /** Encounter/visit description */
  encounterLabel?: string;
  /** Specific item being focused on (for item scope) */
  itemLabel?: string;
  /** Called when activity log button is clicked */
  onOpenActivityLog?: () => void;
  /** Called when dismiss/broaden scope button is clicked */
  onBroadenScope?: () => void;
  /** Available context levels for switching */
  availableContextLevels?: ContextScope[];
  /** Called when user selects a different context level */
  onContextLevelChange?: (level: ContextScope) => void;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Helpers
// ============================================================================

const getScopeLabel = (
  scope: ContextScope,
  patientName?: string,
  encounterLabel?: string,
  itemLabel?: string
): string => {
  switch (scope) {
    case 'item':
      return itemLabel || 'Selected item';
    case 'section':
      return encounterLabel ? `${patientName} · ${encounterLabel}` : patientName || 'Section';
    case 'encounter':
      return encounterLabel ? `${patientName} · ${encounterLabel}` : patientName || 'Encounter';
    case 'patient':
      return patientName || 'Patient';
    case 'global':
      return 'Global';
    default:
      return 'Global';
  }
};

// ============================================================================
// Scope Labels
// ============================================================================

const SCOPE_LABELS: Record<ContextScope, string> = {
  item: 'Item',
  section: 'Section',
  encounter: 'Encounter',
  patient: 'Patient',
  global: 'Global',
};

// ============================================================================
// Light Context Level Popover
// ============================================================================

interface LightContextLevelPopoverProps {
  currentLevel?: ContextScope;
  availableLevels: ContextScope[];
  onSelect: (level: ContextScope) => void;
  anchorEl: HTMLButtonElement | null;
  open: boolean;
  onClose: () => void;
}

const LightContextLevelPopover: React.FC<LightContextLevelPopoverProps> = ({
  currentLevel,
  availableLevels,
  onSelect,
  anchorEl,
  open,
  onClose,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        anchorEl &&
        !anchorEl.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, anchorEl, onClose]);

  if (!open || !anchorEl) return null;

  const rect = anchorEl.getBoundingClientRect();

  return (
    <motion.div
      ref={popoverRef}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'fixed',
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
        minWidth: 140,
        padding: spaceAround.nudge4,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: borderRadius.md,
        border: '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
        zIndex: 1000,
      }}
    >
      {availableLevels.map((level) => {
        const isActive = level === currentLevel;
        return (
          <button
            key={level}
            type="button"
            onClick={() => onSelect(level)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: `${spaceAround.nudge4}px ${spaceAround.tight}px`,
              backgroundColor: isActive ? colors.bg.neutral.subtle : 'transparent',
              border: 'none',
              borderRadius: borderRadius.sm,
              color: isActive ? colors.fg.neutral.primary : colors.fg.neutral.secondary,
              fontSize: 13,
              fontFamily: typography.fontFamily.sans,
              fontWeight: isActive ? typography.fontWeight.medium : typography.fontWeight.regular,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            {SCOPE_LABELS[level]}
            {isActive && <Check size={14} style={{ opacity: 0.7 }} />}
          </button>
        );
      })}
    </motion.div>
  );
};

// ============================================================================
// Component
// ============================================================================

export const AIContextHeader: React.FC<AIContextHeaderProps> = ({
  scope,
  patientName,
  encounterLabel,
  itemLabel,
  onOpenActivityLog,
  onBroadenScope,
  availableContextLevels,
  onContextLevelChange,
  style,
  testID,
}) => {
  const [isHoveredLog, setIsHoveredLog] = React.useState(false);
  const [isHoveredDismiss, setIsHoveredDismiss] = React.useState(false);
  const [isHoveredContext, setIsHoveredContext] = React.useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const contextAnchorRef = useRef<HTMLButtonElement>(null);

  const showContextLevelSelector = availableContextLevels && availableContextLevels.length > 0 && onContextLevelChange;

  const contextLabel = getScopeLabel(scope, patientName, encounterLabel, itemLabel);
  const showDismiss = scope !== 'global';

  const containerStyle: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
    backgroundColor: `rgba(255, 255, 255, 0.85)`,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: `1px solid ${colors.border.neutral.low}`,
    ...style,
  };

  const scopeIndicatorStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.fg.accent.primary,
  };

  const labelStyle: React.CSSProperties = {
    flex: 1,
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.primary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    border: 'none',
    backgroundColor: 'transparent',
    color: colors.fg.neutral.secondary,
    cursor: 'pointer',
    transition: 'all 150ms ease',
  };

  const buttonHoverStyle: React.CSSProperties = {
    backgroundColor: colors.bg.neutral.subtle,
    color: colors.fg.neutral.primary,
  };

  return (
    <header style={containerStyle} data-testid={testID}>
      {/* Scope indicator */}
      <span style={scopeIndicatorStyle}>
        <CornerDownRight size={16} />
      </span>

      {/* Context label */}
      <span style={labelStyle}>{contextLabel}</span>

      {/* Activity log button */}
      {onOpenActivityLog && (
        <button
          type="button"
          onClick={onOpenActivityLog}
          onMouseEnter={() => setIsHoveredLog(true)}
          onMouseLeave={() => setIsHoveredLog(false)}
          style={{
            ...buttonStyle,
            ...(isHoveredLog ? buttonHoverStyle : {}),
          }}
          title="View activity log"
          aria-label="View activity log"
        >
          <ClipboardList size={16} />
        </button>
      )}

      {/* Context level selector */}
      {showContextLevelSelector && (
        <>
          <button
            ref={contextAnchorRef}
            type="button"
            onClick={() => setPopoverOpen(!popoverOpen)}
            onMouseEnter={() => setIsHoveredContext(true)}
            onMouseLeave={() => setIsHoveredContext(false)}
            style={{
              ...buttonStyle,
              ...(isHoveredContext || popoverOpen ? buttonHoverStyle : {}),
            }}
            title="Change context level"
            aria-label="Change context level"
          >
            <ChevronsUpDown size={16} />
          </button>
          <AnimatePresence>
            {popoverOpen && (
              <LightContextLevelPopover
                currentLevel={scope}
                availableLevels={availableContextLevels}
                onSelect={(level) => {
                  onContextLevelChange(level);
                  setPopoverOpen(false);
                }}
                anchorEl={contextAnchorRef.current}
                open={popoverOpen}
                onClose={() => setPopoverOpen(false)}
              />
            )}
          </AnimatePresence>
        </>
      )}

      {/* Dismiss / broaden scope button */}
      {showDismiss && onBroadenScope && (
        <button
          type="button"
          onClick={onBroadenScope}
          onMouseEnter={() => setIsHoveredDismiss(true)}
          onMouseLeave={() => setIsHoveredDismiss(false)}
          style={{
            ...buttonStyle,
            ...(isHoveredDismiss ? buttonHoverStyle : {}),
          }}
          title="Broaden context scope"
          aria-label="Broaden context scope"
        >
          <X size={16} />
        </button>
      )}
    </header>
  );
};

AIContextHeader.displayName = 'AIContextHeader';
