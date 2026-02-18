/**
 * ReviewSectionHeader Component
 *
 * Section header with completeness indicator and "+Add" button.
 * Status indicators:
 * - documented: green checkmark
 * - incomplete: amber warning
 * - not-documented: gray circle
 */

import React from 'react';
import { Check, AlertTriangle, Circle, Plus } from 'lucide-react';
import type { SectionStatus } from './useReviewView';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../../styles/foundations';
import { Button } from '../../components/primitives/Button';

// ============================================================================
// Types
// ============================================================================

export interface ReviewSectionHeaderProps {
  title: string;
  status: SectionStatus;
  itemCount: number;
  onAdd?: () => void;
  style?: React.CSSProperties;
}

// ============================================================================
// Component
// ============================================================================

export const ReviewSectionHeader: React.FC<ReviewSectionHeaderProps> = ({
  title,
  status,
  itemCount,
  onAdd,
  style,
}) => {
  const StatusIcon = () => {
    switch (status) {
      case 'documented':
        return (
          <span style={{ ...styles.statusIcon, color: colors.fg.positive.secondary }}>
            <Check size={16} />
          </span>
        );
      case 'incomplete':
        return (
          <span style={{ ...styles.statusIcon, color: colors.fg.attention.secondary }}>
            <AlertTriangle size={16} />
          </span>
        );
      case 'not-documented':
        return (
          <span style={{ ...styles.statusIcon, color: colors.fg.neutral.disabled }}>
            <Circle size={16} />
          </span>
        );
    }
  };

  const countLabel = itemCount > 0
    ? `${itemCount} item${itemCount !== 1 ? 's' : ''}`
    : 'Not documented';

  return (
    <div style={{ ...styles.container, ...style }} data-testid={`review-section-header-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div style={styles.left}>
        <StatusIcon />
        <span style={styles.title}>{title}</span>
        <span style={styles.count}>{countLabel}</span>
      </div>
      {onAdd && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onAdd}
          data-testid={`add-to-section-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <Plus size={14} />
          <span style={{ marginLeft: 4 }}>Add</span>
        </Button>
      )}
    </div>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
    backgroundColor: colors.bg.neutral.subtle,
    borderRadius: `${borderRadius.sm}px ${borderRadius.sm}px 0 0`,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
  },
  statusIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.primary,
  },
  count: {
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
  },
};

ReviewSectionHeader.displayName = 'ReviewSectionHeader';
