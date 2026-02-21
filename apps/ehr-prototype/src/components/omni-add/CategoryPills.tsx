/**
 * CategoryPills — Suggestion pills at root depth (depth 0)
 *
 * Displays category options as tappable pills. Tapping inserts a category pill
 * into the omni-input. Primary categories shown first, secondary behind "More".
 */

import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { ItemCategory } from '../../types/chart-items';
import { PRIMARY_CATEGORIES, SECONDARY_CATEGORIES, type CategoryMeta } from './omni-add-machine';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface CategoryPillsProps {
  onSelect: (category: ItemCategory) => void;
  disabled?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  onSelect,
  disabled = false,
}) => {
  const [showMore, setShowMore] = React.useState(false);

  const renderPill = (meta: CategoryMeta) => (
    <button
      key={meta.category}
      type="button"
      style={styles.pill}
      onClick={() => onSelect(meta.category)}
      disabled={disabled}
      data-testid={`cat-pill-${meta.category}`}
    >
      {meta.label}
      {meta.prefix && (
        <span style={styles.prefix}>{meta.prefix.replace(':', '')}</span>
      )}
    </button>
  );

  return (
    <div style={styles.container} data-testid="category-pills">
      <div style={styles.row}>
        {PRIMARY_CATEGORIES.map(renderPill)}
        <button
          type="button"
          style={styles.morePill}
          onClick={() => setShowMore(!showMore)}
          data-testid="cat-pills-more"
          aria-label={showMore ? 'Show less' : 'Show more'}
        >
          <ChevronDown
            size={14}
            style={{
              transition: `transform ${transitions.fast}`,
              transform: showMore ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </button>
      </div>
      {showMore && (
        <div style={styles.row}>
          {SECONDARY_CATEGORIES.map(renderPill)}
        </div>
      )}
    </div>
  );
};

CategoryPills.displayName = 'CategoryPills';

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.coupled,
  },
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spaceBetween.coupled,
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: `4px ${spaceAround.compact}px`,
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.primary,
    backgroundColor: colors.bg.neutral.subtle,
    border: `1px solid ${colors.border.neutral.low}`,
    borderRadius: borderRadius.full,
    cursor: 'pointer',
    transition: `all ${transitions.fast}`,
    whiteSpace: 'nowrap',
  },
  prefix: {
    fontSize: 10,
    color: colors.fg.neutral.spotReadable,
    fontFamily: typography.fontFamily.mono,
    opacity: 0.7,
  },
  morePill: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    padding: 0,
    color: colors.fg.neutral.spotReadable,
    backgroundColor: 'transparent',
    border: `1px dashed ${colors.border.neutral.low}`,
    borderRadius: borderRadius.full,
    cursor: 'pointer',
    transition: `all ${transitions.fast}`,
  },
};
