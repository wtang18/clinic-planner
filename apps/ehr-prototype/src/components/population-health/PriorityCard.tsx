/**
 * PriorityCard Component
 *
 * Compact card for a single PriorityItem in the Priorities View.
 * Action row is always visible (no expand/collapse). Clicking the card
 * opens the priority-detail drawer. Inline pickers for defer/assign
 * allow quick triage without leaving the list.
 *
 * PV4 additions:
 * - `batchMode`: When true, shows checkbox. When false, no checkbox (more compact).
 * - `readOnly`: When true, hides defer/flag actions, shows responsibility indicator,
 *   uses subtle background. Assign + Details still work for reassignment/audit.
 */

import React, { useState, useCallback } from 'react';
import { Clock, Check, AlertTriangle, Flag, Timer, ArrowRight } from 'lucide-react';
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
// Responsibility Labels
// ============================================================================

const RESPONSIBILITY_LABELS: Record<string, string> = {
  ai: 'AI handling',
  team: 'Assigned to team',
};

// ============================================================================
// Picker Options
// ============================================================================

const DEFER_OPTIONS = ['1hr', '4hr', 'Tomorrow', '1 wk'] as const;
const ASSIGN_OPTIONS = ['AI', 'MA Chen', 'Dr. Park'] as const;

type PickerMode = 'default' | 'defer' | 'assign';

// ============================================================================
// Component
// ============================================================================

interface PriorityCardProps {
  item: PriorityItem;
  checked?: boolean;
  flagged?: boolean;
  batchMode?: boolean;
  readOnly?: boolean;
  onCheck?: () => void;
  onFlag?: () => void;
  onDefer?: () => void;
  onAssign?: () => void;
  onDetails?: () => void;
}

export const PriorityCard: React.FC<PriorityCardProps> = ({
  item,
  checked = false,
  flagged = false,
  batchMode = false,
  readOnly = false,
  onCheck,
  onFlag,
  onDefer,
  onAssign,
  onDetails,
}) => {
  const badgeColor = BADGE_COLORS[item.badge];
  const [hovered, setHovered] = useState(false);
  const [pickerMode, setPickerMode] = useState<PickerMode>('default');

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

  const handleFlagClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onFlag?.();
  }, [onFlag]);

  // Left padding for rows 2-4 — aligns with name text after checkbox
  const contentIndent = batchMode ? 24 : 0;

  // ---- Styles ----

  const cardStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: `${spaceAround.tight}px ${spaceAround.default}px`,
    borderRadius: borderRadius.sm,
    border: `1px solid ${colors.border.neutral.low}`,
    cursor: 'pointer',
    background: readOnly
      ? (hovered ? 'rgba(0,0,0,0.04)' : colors.bg.neutral.subtle)
      : (hovered ? 'rgba(0,0,0,0.03)' : 'transparent'),
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
    color: readOnly ? colors.fg.neutral.secondary : colors.fg.neutral.primary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const daysStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: readOnly
      ? colors.fg.neutral.secondary
      : (item.isStale ? colors.fg.attention.primary : colors.fg.neutral.secondary),
    flexShrink: 0,
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

  const row2Style: React.CSSProperties = {
    fontSize: 12,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    paddingLeft: contentIndent,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const row3Style: React.CSSProperties = {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: readOnly ? colors.fg.neutral.secondary : colors.fg.neutral.spotReadable,
    paddingLeft: contentIndent,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const actionRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
    paddingLeft: contentIndent,
  };

  const actionBtnStyle: React.CSSProperties = {
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    height: 24,
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

  // ---- Row 2 content: responsibility indicator for read-only, node label otherwise ----
  const row2Content = readOnly
    ? (RESPONSIBILITY_LABELS[item.responsibility] ?? item.nodeLabel)
    : item.nodeLabel;

  return (
    <div
      style={cardStyle}
      data-testid={`priority-card-${item.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onDetails}
    >
      {/* Row 1: [checkbox if batchMode] + name + days + markers + badge */}
      <div style={row1Style}>
        {batchMode && (
          <button
            style={checkboxStyle}
            onClick={handleCheckClick}
            aria-label={checked ? 'Uncheck item' : 'Check item'}
            data-testid={`priority-checkbox-${item.id}`}
          >
            {checked && <Check size={10} color={colors.fg.neutral.inversePrimary} strokeWidth={3} />}
          </button>
        )}
        <span style={nameStyle}>{item.patientName}</span>
        <span style={daysStyle}>
          {item.isStale && <Clock size={12} />}
          {item.daysAtStage}d
        </span>
        {item.isEscalated && <span title={item.escalationReason} style={{ flexShrink: 0, display: 'inline-flex' }}><AlertTriangle size={14} color={colors.fg.alert.primary} /></span>}
        {flagged && <span title="Flagged" style={{ flexShrink: 0, display: 'inline-flex' }}><Flag size={14} color={colors.fg.attention.primary} /></span>}
        <span style={badgeStyle}>{item.badge}</span>
      </div>

      {/* Row 2: responsibility indicator (read-only) or node action label */}
      <div style={row2Style}>{row2Content}</div>

      {/* Row 3: context line (clinical detail) */}
      {item.contextLine && <div style={row3Style}>{item.contextLine}</div>}

      {/* Action row */}
      <div style={actionRowStyle}>
        {readOnly ? (
          /* Read-only: only Assign (reassign) and Details remain */
          <>
            <button
              style={actionBtnStyle}
              onClick={(e) => { e.stopPropagation(); setPickerMode('assign'); }}
              data-testid={`priority-assign-${item.id}`}
            >
              <ArrowRight size={12} /> Assign
            </button>
          </>
        ) : (
          /* Full action row for "mine" items */
          <>
            {pickerMode === 'default' && (
              <>
                <button
                  style={actionBtnStyle}
                  onClick={(e) => { e.stopPropagation(); setPickerMode('defer'); }}
                  data-testid={`priority-defer-${item.id}`}
                >
                  <Timer size={12} /> Defer
                </button>
                <button
                  style={actionBtnStyle}
                  onClick={(e) => { e.stopPropagation(); setPickerMode('assign'); }}
                  data-testid={`priority-assign-${item.id}`}
                >
                  <ArrowRight size={12} /> Assign
                </button>
                <button
                  style={actionBtnStyle}
                  onClick={handleFlagClick}
                  data-testid={`priority-flag-${item.id}`}
                >
                  <Flag size={12} /> Flag
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
          </>
        )}

        {/* Assign picker — works for both readOnly and mine */}
        {pickerMode === 'assign' && !readOnly && (
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

        {/* Read-only assign picker */}
        {pickerMode === 'assign' && readOnly && (
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
  );
};

PriorityCard.displayName = 'PriorityCard';
