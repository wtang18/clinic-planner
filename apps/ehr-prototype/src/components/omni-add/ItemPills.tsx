/**
 * ItemPills — Suggestion pills at category depth (depth 1)
 *
 * Displays item options for a committed category as tappable pills.
 * Tapping inserts an item pill and moves to depth 2.
 */

import React from 'react';
import type { QuickPickItem } from '../../data/mock-quick-picks';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions } from '../../styles/foundations';
import { useRovingTabindex } from './useRovingTabindex';

// ============================================================================
// Types
// ============================================================================

export interface ItemPillsProps {
  items: QuickPickItem[];
  onSelect: (item: QuickPickItem) => void;
  disabled?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const ItemPills: React.FC<ItemPillsProps> = ({
  items,
  onSelect,
  disabled = false,
}) => {
  const roving = useRovingTabindex({
    count: items.length,
    onEnter: (i) => {
      if (!disabled) onSelect(items[i]);
    },
  });

  if (items.length === 0) {
    return (
      <div style={styles.empty} data-testid="item-pills-empty">
        No items found. Keep typing to search.
      </div>
    );
  }

  return (
    <div style={styles.container} role="toolbar" data-testid="item-pills" data-omni-section>
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          style={styles.pill}
          onClick={() => onSelect(item)}
          disabled={disabled}
          data-testid={`item-pill-${item.id}`}
          {...roving.getRovingProps(index)}
        >
          {item.chipLabel}
        </button>
      ))}
    </div>
  );
};

ItemPills.displayName = 'ItemPills';

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spaceBetween.coupled,
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: `4px ${spaceAround.compact}px`,
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.regular,
    color: colors.fg.neutral.primary,
    backgroundColor: colors.bg.neutral.base,
    border: `1px solid ${colors.border.neutral.low}`,
    borderRadius: borderRadius.full,
    cursor: 'pointer',
    transition: `all ${transitions.fast}`,
    whiteSpace: 'nowrap',
  },
  empty: {
    fontSize: 13,
    color: colors.fg.neutral.spotReadable,
    fontFamily: typography.fontFamily.sans,
    padding: `${spaceAround.tight}px 0`,
  },
};
