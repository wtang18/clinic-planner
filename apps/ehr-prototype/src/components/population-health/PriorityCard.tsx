/**
 * PriorityCard Component
 *
 * Display-only card for a single PriorityItem in the Priorities View.
 * Shows patient name, badge pill, days at stage, escalation marker,
 * pathway name, and context line. Follows CohortCard inline styling pattern.
 */

import React from 'react';
import { Clock } from 'lucide-react';
import { colors, typography, spaceAround, borderRadius } from '../../styles/foundations';
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
// Component
// ============================================================================

interface PriorityCardProps {
  item: PriorityItem;
}

export const PriorityCard: React.FC<PriorityCardProps> = ({ item }) => {
  const badgeColor = BADGE_COLORS[item.badge];

  const cardStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: `${spaceAround.tight}px ${spaceAround.default}px`,
    borderRadius: borderRadius.sm,
    border: `1px solid ${colors.border.neutral.low}`,
    cursor: 'default',
  };

  const row1Style: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const checkboxPlaceholderStyle: React.CSSProperties = {
    width: 16,
    height: 16,
    borderRadius: '50%',
    border: `1.5px solid ${colors.border.neutral.medium}`,
    flexShrink: 0,
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

  const escalationStyle: React.CSSProperties = {
    fontSize: 14,
    flexShrink: 0,
  };

  const row2Style: React.CSSProperties = {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    paddingLeft: 24, // align with name (16px circle + 8px gap)
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

  return (
    <div
      style={cardStyle}
      data-testid={`priority-card-${item.id}`}
    >
      {/* Row 1: checkbox placeholder + name + badge + days + escalation */}
      <div style={row1Style}>
        <div style={checkboxPlaceholderStyle} />
        <span style={nameStyle}>{item.patientName}</span>
        <span style={badgeStyle}>{item.badge}</span>
        <span style={daysStyle}>
          {item.isStale && <Clock size={12} />}
          {item.daysAtStage}d
        </span>
        {item.isEscalated && <span style={escalationStyle} title={item.escalationReason}>🔺</span>}
      </div>

      {/* Row 2: pathway name */}
      <div style={row2Style}>{item.pathwayName}</div>

      {/* Row 3: context line */}
      {item.contextLine && <div style={row3Style}>{item.contextLine}</div>}
    </div>
  );
};

PriorityCard.displayName = 'PriorityCard';
