/**
 * PriorityCard Component
 *
 * Interactive card for a single PriorityItem in the Priorities View.
 * Supports expansion to reveal a quick action row (Defer, Assign, Flag, Details),
 * functional checkboxes, and inline pickers for defer/assign options.
 * PV2: Card Expansion + Quick Actions.
 */

import React, { useState, useCallback } from 'react';
import { Clock, Check, ChevronRight } from 'lucide-react';
import { colors, typography, spaceAround, borderRadius, transitions, glass } from '../../styles/foundations';
import type { PriorityItem, PriorityBadge } from '../../types/population-health';

// ============================================================================
// Badge Color Mapping
// ============================================================================

const BADGE_COLORS: Record<PriorityBadge, { bg: string; fg: string }> = {
  URGENT: { bg: colors.bg.alert.low, fg: colors.fg.alert.primary },
  REVIEW: { bg: colors.bg.attention.low, fg: colors.fg.attention.primary },
  ACTION: { bg: colors.bg.accent.low, fg: colors.fg.accent.primary },
  MONITOR: { bg: colors.bg.neutral.low, fg: colors.fg.neutral.secondary },
};

// ============================================================================
// Picker Options
// ============================================================================

const DEFER_OPTIONS = ['1hr', '4hr', 'Tomorrow', '1 wk'] as const;
const ASSIGN_OPTIONS = ['AI ✨', 'MA Chen', 'Dr. Park'] as const;

type PickerMode = 'default' | 'defer' | 'assign';

// ============================================================================
// Component
// ============================================================================

interface PriorityCardProps {
  item: PriorityItem;
  expanded?: boolean;
  checked?: boolean;
  flagged?: boolean;
  onToggleExpand?: () => void;
  onCheck?: () => void;
  onFlag?: () => void;
  onDefer?: () => void;
  onAssign?: () => void;
  onDetails?: () => void;
}

export const PriorityCard: React.FC<PriorityCardProps> = ({
  item,
  expanded = false,
  checked = false,
  flagged = false,
  onToggleExpand,
  onCheck,
  onFlag,
  onDefer,
  onAssign,
  onDetails,
}) => {
  const badgeColor = BADGE_COLORS[item.badge];
  const [hovered, setHovered] = useState(false);
  const [pickerMode, setPickerMode] = useState<PickerMode>('default');

  // Reset picker when card collapses
  const prevExpanded = React.useRef(expanded);
  if (!expanded && prevExpanded.current) {
    // Collapsed — reset picker synchronously during render
    if (pickerMode !== 'default') setPickerMode('default');
  }
  prevExpanded.current = expanded;

  const handleCheckClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onCheck?.();
  }, [onCheck]);

  const handleDeferSelect = useCallback(() => {
    onDefer?.();
  }, [onDefer]);

  const handleAssignSelect = useCallback(() => {
    onAssign?.();
  }, [onAssign]);

  const handleDetailsClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDetails?.();
  }, [onDetails]);

  const handleFlagClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onFlag?.();
  }, [onFlag]);

  // ---- Styles ----

  const cardStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: `${spaceAround.tight}px ${spaceAround.default}px`,
    borderRadius: borderRadius.sm,
    border: `1px solid ${colors.border.neutral.low}`,
    cursor: 'pointer',
    background: hovered ? colors.bg.neutral.low : 'transparent',
    transition: `background ${transitions.fast}`,
  };

  const row1Style: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const checkboxStyle: React.CSSProperties = {
    width: 16,
    height: 16,
    borderRadius: '50%',
    border: checked ? 'none' : `1.5px solid ${colors.border.neutral.medium}`,
    background: checked ? colors.bg.accent.medium : 'transparent',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
    transition: `all ${transitions.fast}`,
  };

  const nameStyle: React.CSSProperties = {
    flex: 1,
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const badgeStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.sans,
    color: badgeColor.fg,
    background: badgeColor.bg,
    padding: '2px 8px',
    borderRadius: borderRadius.full,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flexShrink: 0,
  };

  const daysStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: item.isStale ? colors.fg.attention.primary : colors.fg.neutral.secondary,
    flexShrink: 0,
  };

  const markerStyle: React.CSSProperties = {
    fontSize: 14,
    flexShrink: 0,
  };

  const row2Style: React.CSSProperties = {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    paddingLeft: 24,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const row3Style: React.CSSProperties = {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.spotReadable,
    paddingLeft: 24,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  // Quick action row wrapper — animated expand/collapse
  const actionRowWrapperStyle: React.CSSProperties = {
    overflow: 'hidden',
    maxHeight: expanded ? 48 : 0,
    opacity: expanded ? 1 : 0,
    transition: `max-height ${transitions.fast}, opacity ${transitions.fast}`,
  };

  const actionRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingTop: 6,
    borderTop: `1px dashed ${colors.border.neutral.low}`,
  };

  const actionBtnStyle: React.CSSProperties = {
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    height: 26,
    padding: '0 10px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    whiteSpace: 'nowrap',
    ...glass.secondary,
    borderRadius: borderRadius.full,
    color: colors.fg.neutral.primary,
    transition: `background ${transitions.fast}`,
  };

  const cancelBtnStyle: React.CSSProperties = {
    ...actionBtnStyle,
    color: colors.fg.neutral.secondary,
  };

  return (
    <div
      style={cardStyle}
      data-testid={`priority-card-${item.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onToggleExpand}
    >
      {/* Row 1: checkbox + name + badge + days + markers */}
      <div style={row1Style}>
        <button
          style={checkboxStyle}
          onClick={handleCheckClick}
          aria-label={checked ? 'Uncheck item' : 'Check item'}
          data-testid={`priority-checkbox-${item.id}`}
        >
          {checked && <Check size={10} color={colors.fg.neutral.inversePrimary} strokeWidth={3} />}
        </button>
        <span style={nameStyle}>{item.patientName}</span>
        <span style={badgeStyle}>{item.badge}</span>
        <span style={daysStyle}>
          {item.isStale && <Clock size={12} />}
          {item.daysAtStage}d
        </span>
        {item.isEscalated && <span style={markerStyle} title={item.escalationReason}>🔺</span>}
        {flagged && <span style={markerStyle} title="Flagged">🚩</span>}
      </div>

      {/* Row 2: pathway name */}
      <div style={row2Style}>{item.pathwayName}</div>

      {/* Row 3: context line */}
      {item.contextLine && <div style={row3Style}>{item.contextLine}</div>}

      {/* Quick action row — visible when expanded */}
      <div style={actionRowWrapperStyle}>
        <div style={actionRowStyle}>
          {pickerMode === 'default' && (
            <>
              <button
                style={actionBtnStyle}
                onClick={(e) => { e.stopPropagation(); setPickerMode('defer'); }}
                data-testid={`priority-defer-${item.id}`}
              >
                ⏱ Defer
              </button>
              <button
                style={actionBtnStyle}
                onClick={(e) => { e.stopPropagation(); setPickerMode('assign'); }}
                data-testid={`priority-assign-${item.id}`}
              >
                → Assign
              </button>
              <button
                style={actionBtnStyle}
                onClick={handleFlagClick}
                data-testid={`priority-flag-${item.id}`}
              >
                🚩 Flag
              </button>
              <div style={{ flex: 1 }} />
              <button
                style={actionBtnStyle}
                onClick={handleDetailsClick}
                data-testid={`priority-details-${item.id}`}
              >
                Details <ChevronRight size={12} />
              </button>
            </>
          )}

          {pickerMode === 'defer' && (
            <>
              {DEFER_OPTIONS.map((option) => (
                <button
                  key={option}
                  style={actionBtnStyle}
                  onClick={(e) => { e.stopPropagation(); handleDeferSelect(); }}
                  data-testid={`priority-defer-option-${option}`}
                >
                  {option}
                </button>
              ))}
              <button
                style={cancelBtnStyle}
                onClick={(e) => { e.stopPropagation(); setPickerMode('default'); }}
              >
                Cancel
              </button>
            </>
          )}

          {pickerMode === 'assign' && (
            <>
              {ASSIGN_OPTIONS.map((option) => (
                <button
                  key={option}
                  style={actionBtnStyle}
                  onClick={(e) => { e.stopPropagation(); handleAssignSelect(); }}
                  data-testid={`priority-assign-option-${option}`}
                >
                  {option}
                </button>
              ))}
              <button
                style={cancelBtnStyle}
                onClick={(e) => { e.stopPropagation(); setPickerMode('default'); }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

PriorityCard.displayName = 'PriorityCard';
