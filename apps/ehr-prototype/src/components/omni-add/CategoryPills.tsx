/**
 * CategoryPills — Suggestion pills at root depth (depth 0)
 *
 * Displays category options as tappable pills. Tapping inserts a category pill
 * into the omni-input. Primary categories shown first, secondary behind "More".
 */

import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { ItemCategory, ItemIntent } from '../../types/chart-items';
import { PRIMARY_CATEGORIES, SECONDARY_CATEGORIES, type CategoryMeta } from './omni-add-machine';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions } from '../../styles/foundations';
import { useRovingTabindex, type RovingProps } from './useRovingTabindex';

// ============================================================================
// Types
// ============================================================================

export interface CategoryPillsProps {
  onSelect: (category: ItemCategory, intent?: ItemIntent) => void;
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

  // Primary row: categories + "More" chevron
  const primaryRoving = useRovingTabindex({
    count: PRIMARY_CATEGORIES.length + 1, // +1 for "More" chevron
    onEnter: (i) => {
      if (disabled) return;
      if (i < PRIMARY_CATEGORIES.length) {
        onSelect(PRIMARY_CATEGORIES[i].category, PRIMARY_CATEGORIES[i].intent);
      } else {
        setShowMore(prev => !prev);
      }
    },
  });

  // Secondary row: only active when showMore is true
  const secondaryRoving = useRovingTabindex({
    count: showMore ? SECONDARY_CATEGORIES.length : 0,
    onEnter: (i) => {
      if (disabled) return;
      onSelect(SECONDARY_CATEGORIES[i].category, SECONDARY_CATEGORIES[i].intent);
    },
  });

  const renderPill = (
    meta: CategoryMeta,
    index: number,
    rovingProps: RovingProps,
  ) => (
    <button
      key={meta.category}
      type="button"
      style={styles.pill}
      onClick={() => onSelect(meta.category, meta.intent)}
      disabled={disabled}
      data-testid={`cat-pill-${meta.category}`}
      {...rovingProps}
    >
      {meta.label}
      {meta.prefix && (
        <span style={styles.prefix}>{meta.prefix.replace(':', '')}</span>
      )}
    </button>
  );

  return (
    <div style={styles.container} data-testid="category-pills">
      <div style={styles.row} role="toolbar" data-omni-section>
        {PRIMARY_CATEGORIES.map((meta, i) =>
          renderPill(meta, i, primaryRoving.getRovingProps(i)),
        )}
        <button
          type="button"
          style={styles.morePill}
          onClick={() => setShowMore(!showMore)}
          data-testid="cat-pills-more"
          aria-label={showMore ? 'Show less' : 'Show more'}
          {...primaryRoving.getRovingProps(PRIMARY_CATEGORIES.length)}
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
        <div style={styles.row} role="toolbar" data-omni-section>
          {SECONDARY_CATEGORIES.map((meta, i) =>
            renderPill(meta, i, secondaryRoving.getRovingProps(i)),
          )}
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
