/**
 * CompletenessChecklist Component
 *
 * Shows 8 clinical sections with documentation status:
 * checkmark (documented), warning (pending/incomplete), circle (not documented).
 */

import React from 'react';
import { CheckCircle, AlertCircle, Circle } from 'lucide-react';
import type { ChecklistItem } from '../../state/selectors/process-view';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface CompletenessChecklistProps {
  checklist: ChecklistItem[];
  onSectionTap?: (sectionId: string) => void;
  style?: React.CSSProperties;
}

// ============================================================================
// Component
// ============================================================================

const StatusIcon: React.FC<{ status: ChecklistItem['status'] }> = ({ status }) => {
  switch (status) {
    case 'documented':
      return <CheckCircle size={16} color={colors.fg.positive.secondary} />;
    case 'pending':
      return <AlertCircle size={16} color={colors.fg.attention.secondary} />;
    case 'not-documented':
      return <Circle size={16} color={colors.fg.neutral.disabled} />;
  }
};

export const CompletenessChecklist: React.FC<CompletenessChecklistProps> = ({
  checklist,
  onSectionTap,
  style,
}) => {
  const documented = checklist.filter(c => c.status === 'documented').length;
  const total = checklist.length;

  return (
    <div style={{ ...styles.container, ...style }} data-testid="completeness-checklist">
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.title}>Encounter Completeness</span>
        <span style={styles.counter}>
          {documented}/{total} documented
        </span>
      </div>

      {/* Checklist rows */}
      <div style={styles.list}>
        {checklist.map((item) => (
          <ChecklistRow
            key={item.id}
            item={item}
            onTap={onSectionTap ? () => onSectionTap(item.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// ChecklistRow
// ============================================================================

const ChecklistRow: React.FC<{
  item: ChecklistItem;
  onTap?: () => void;
}> = ({ item, onTap }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const isClickable = item.status !== 'documented' && onTap;

  return (
    <div
      style={{
        ...styles.row,
        ...(isClickable && isHovered && styles.rowHover),
        cursor: isClickable ? 'pointer' : 'default',
      }}
      onClick={isClickable ? onTap : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`checklist-${item.id}`}
    >
      <div style={styles.rowLeft}>
        <StatusIcon status={item.status} />
        <span
          style={{
            ...styles.rowLabel,
            color: item.status === 'not-documented'
              ? colors.fg.neutral.disabled
              : colors.fg.neutral.primary,
          }}
        >
          {item.label}
        </span>
      </div>
      {item.itemCount > 0 && (
        <span style={styles.rowCount}>{item.itemCount}</span>
      )}
    </div>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: colors.bg.neutral.base,
    borderRadius: borderRadius.sm,
    border: `1px solid ${colors.border.neutral.low}`,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
    backgroundColor: colors.bg.neutral.subtle,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
  },
  title: {
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.primary,
  },
  counter: {
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spaceAround.tight}px ${spaceAround.default}px`,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
    transition: `background-color ${transitions.fast}`,
  },
  rowHover: {
    backgroundColor: colors.bg.neutral.subtle,
  },
  rowLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: typography.fontWeight.regular,
  },
  rowCount: {
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
    backgroundColor: colors.bg.neutral.subtle,
    padding: `2px 6px`,
    borderRadius: borderRadius.sm,
  },
};

CompletenessChecklist.displayName = 'CompletenessChecklist';
