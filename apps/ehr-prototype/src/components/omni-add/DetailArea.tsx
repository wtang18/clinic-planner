/**
 * DetailArea — Depth-adaptive container
 *
 * Renders different content based on the current depth (pill count):
 * - Depth 0 (root): CategoryPills — pick a category
 * - Depth 1 (category): ItemPills + SuggestionCards — pick an item
 * - Depth 2 (item): SuggestionCard (shell) — field rows come in Phase 2
 *
 * For narrative/vitals categories, depth 1 shows the appropriate input
 * instead of item pills.
 */

import React from 'react';
import type { ItemCategory, ChartItem } from '../../types/chart-items';
import type { QuickPickItem } from '../../data/mock-quick-picks';
import { getQuickPicks } from '../../data/mock-quick-picks';
import { getCategoryVariant, type CategoryVariant } from './omni-add-machine';
import { CategoryPills } from './CategoryPills';
import { ItemPills } from './ItemPills';
import { SuggestionCard } from './SuggestionCard';
import { searchInCategory } from '../../services/input-recognizer';
import { spaceBetween } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface DetailAreaProps {
  depth: number;
  category: ItemCategory | null;
  text: string;
  /** The selected QuickPickItem at depth 2 */
  selectedItem: QuickPickItem | null;
  /** Grouped results from ambiguity grouping */
  ambiguousGroups?: { category: ItemCategory; label: string; items: QuickPickItem[] }[];
  onCategorySelect: (category: ItemCategory) => void;
  onItemSelect: (item: QuickPickItem) => void;
  /** Quick-add: accepts item with defaults */
  onItemAdd: (item: QuickPickItem) => void;
  /** Edit: opens depth 3 (Phase 2 will implement field rows) */
  onItemEdit: (item: QuickPickItem) => void;
  /** For narrative categories */
  onNarrativeSubmit?: (text: string) => void;
  /** For vitals */
  onVitalsSubmit?: (data: any) => void;
  onCancel?: () => void;
}

// ============================================================================
// Component
// ============================================================================

export const DetailArea: React.FC<DetailAreaProps> = ({
  depth,
  category,
  text,
  selectedItem,
  ambiguousGroups,
  onCategorySelect,
  onItemSelect,
  onItemAdd,
  onItemEdit,
}) => {
  // Depth 0: Root — show category pills
  if (depth === 0) {
    // If there are ambiguous groups from typing, show grouped results
    if (ambiguousGroups && ambiguousGroups.length > 0) {
      return (
        <div style={styles.container} data-testid="detail-area-ambiguous">
          {ambiguousGroups.map((group) => (
            <div key={group.category} style={styles.group}>
              <span style={styles.groupLabel}>{group.label}</span>
              <ItemPills
                items={group.items}
                onSelect={onItemSelect}
              />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div style={styles.container} data-testid="detail-area-root">
        <CategoryPills onSelect={onCategorySelect} />
      </div>
    );
  }

  // Depth 1: Category committed — show item pills
  if (depth === 1 && category) {
    const variant = getCategoryVariant(category);

    // Narrative categories at depth 1: handled by parent (OmniAddBarV2)
    // Data-entry (vitals) at depth 1: also handled by parent
    if (variant !== 'structured') {
      return null;
    }

    // Get items — filtered by text or all quick picks
    const items = text.length >= 1
      ? searchInCategory(category, text)
      : getQuickPicks(category);

    return (
      <div style={styles.container} data-testid="detail-area-category">
        <ItemPills items={items} onSelect={onItemSelect} />
        {/* Show suggestion cards for top items when no text filter */}
        {!text && items.slice(0, 3).map((item) => (
          <SuggestionCard
            key={item.id}
            item={item}
            onAdd={onItemAdd}
            onEdit={onItemEdit}
          />
        ))}
      </div>
    );
  }

  // Depth 2: Item committed — show suggestion card (shell; Phase 2 adds field rows)
  if (depth === 2 && selectedItem) {
    return (
      <div style={styles.container} data-testid="detail-area-item">
        <SuggestionCard
          item={selectedItem}
          onAdd={onItemAdd}
          onEdit={onItemEdit}
        />
      </div>
    );
  }

  return null;
};

DetailArea.displayName = 'DetailArea';

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.related,
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.coupled,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    opacity: 0.6,
  },
};
