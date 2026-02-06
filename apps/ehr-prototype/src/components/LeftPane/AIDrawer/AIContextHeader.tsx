/**
 * AIContextHeader Component
 *
 * Floating context header for the AI drawer with blur backdrop.
 * Shows current context scope, activity log button, and dismiss/broaden scope button.
 *
 * @see AI_DRAWER.md §3 for full specification
 */

import React from 'react';
import { RefreshCw, ClipboardList, X } from 'lucide-react';
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
// Component
// ============================================================================

export const AIContextHeader: React.FC<AIContextHeaderProps> = ({
  scope,
  patientName,
  encounterLabel,
  itemLabel,
  onOpenActivityLog,
  onBroadenScope,
  style,
  testID,
}) => {
  const [isHoveredLog, setIsHoveredLog] = React.useState(false);
  const [isHoveredDismiss, setIsHoveredDismiss] = React.useState(false);

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
        <RefreshCw size={16} />
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
