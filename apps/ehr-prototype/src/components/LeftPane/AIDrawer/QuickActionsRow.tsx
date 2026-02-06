/**
 * QuickActionsRow Component
 *
 * Horizontal scrollable row of contextual quick action chips.
 * Tapping a chip submits the corresponding pre-composed query.
 *
 * @see AI_DRAWER.md §7 for full specification
 */

import React from 'react';
import {
  FileText,
  ClipboardList,
  AlertTriangle,
  Heart,
  Check,
  SkipForward,
  ArrowRight,
  Pill,
  List,
  ListOrdered,
  Calendar,
  Sparkles,
  Search,
  Edit3,
  BarChart3,
} from 'lucide-react';
import type { QuickAction } from '../../../hooks/useAIAssistant';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface QuickActionsRowProps {
  /** Quick actions to display */
  actions: QuickAction[];
  /** Called when an action is clicked */
  onActionClick: (actionId: string) => void;
  /** Whether actions are disabled */
  disabled?: boolean;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Helper - Get icon for quick action
// ============================================================================

const getQuickActionIcon = (iconName: string, size = 14) => {
  switch (iconName) {
    case 'FileText':
      return <FileText size={size} />;
    case 'ClipboardList':
      return <ClipboardList size={size} />;
    case 'AlertTriangle':
      return <AlertTriangle size={size} />;
    case 'Heart':
      return <Heart size={size} />;
    case 'Check':
      return <Check size={size} />;
    case 'SkipForward':
      return <SkipForward size={size} />;
    case 'ArrowRight':
      return <ArrowRight size={size} />;
    case 'Pill':
      return <Pill size={size} />;
    case 'List':
      return <List size={size} />;
    case 'ListOrdered':
      return <ListOrdered size={size} />;
    case 'Calendar':
      return <Calendar size={size} />;
    case 'Search':
      return <Search size={size} />;
    case 'Edit3':
      return <Edit3 size={size} />;
    case 'BarChart3':
      return <BarChart3 size={size} />;
    default:
      return <Sparkles size={size} />;
  }
};

// ============================================================================
// Component
// ============================================================================

export const QuickActionsRow: React.FC<QuickActionsRowProps> = ({
  actions,
  onActionClick,
  disabled = false,
  style,
  testID,
}) => {
  if (actions.length === 0) {
    return null;
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollbarWidth: 'none', // Firefox
    msOverflowStyle: 'none', // IE/Edge
    ...style,
  };

  const chipStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    backgroundColor: colors.bg.neutral.subtle,
    border: `1px solid ${colors.border.neutral.default}`,
    borderRadius: borderRadius.md,
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.primary,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 150ms ease',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  };

  const chipHoverStyle: React.CSSProperties = {
    backgroundColor: colors.bg.accent.subtle,
    borderColor: colors.fg.accent.primary,
    color: colors.fg.accent.primary,
  };

  return (
    <div
      style={containerStyle}
      data-testid={testID}
      className="quick-actions-row"
    >
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          style={chipStyle}
          onClick={() => !disabled && onActionClick(action.id)}
          disabled={disabled}
          onMouseEnter={(e) => {
            if (!disabled) {
              Object.assign(e.currentTarget.style, chipHoverStyle);
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled) {
              e.currentTarget.style.backgroundColor = colors.bg.neutral.subtle;
              e.currentTarget.style.borderColor = colors.border.neutral.default;
              e.currentTarget.style.color = colors.fg.neutral.primary;
            }
          }}
        >
          <span style={{ display: 'flex', color: 'inherit' }}>
            {getQuickActionIcon(action.icon)}
          </span>
          {action.label}
        </button>
      ))}

      {/* Hide scrollbar for webkit browsers */}
      <style>{`
        .quick-actions-row::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

QuickActionsRow.displayName = 'QuickActionsRow';
