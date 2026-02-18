/**
 * QuickPickChips Component
 *
 * Horizontal chip grid for quick-pick items in structured categories.
 * Shows context-aware suggestions (e.g., cough → Benzonatate, Dextromethorphan)
 * with an "Other" chip that opens the search flow.
 */

import React from 'react';
import { Search } from 'lucide-react';
import type { QuickPickItem } from '../../data/mock-quick-picks';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions } from '../../styles/foundations';

export interface QuickPickChipsProps {
  items: QuickPickItem[];
  onSelect: (item: QuickPickItem) => void;
  onOpenSearch: () => void;
  /** Category label for the "Other" chip */
  categoryLabel?: string;
  disabled?: boolean;
}

export const QuickPickChips: React.FC<QuickPickChipsProps> = ({
  items,
  onSelect,
  onOpenSearch,
  categoryLabel = 'Other',
  disabled = false,
}) => {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spaceBetween.repeating,
  };

  const chipStyle = (isHovered: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    backgroundColor: isHovered ? 'rgba(128, 128, 128, 0.14)' : 'rgba(128, 128, 128, 0.06)',
    border: `1px solid ${isHovered ? colors.border.neutral.medium : colors.border.neutral.low}`,
    borderRadius: borderRadius.full,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: `all ${transitions.fast}`,
    opacity: disabled ? 0.5 : 1,
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.secondary,
    whiteSpace: 'nowrap',
  });

  const otherChipStyle = (isHovered: boolean): React.CSSProperties => ({
    ...chipStyle(isHovered),
    color: colors.fg.neutral.spotReadable,
    backgroundColor: isHovered ? 'rgba(128, 128, 128, 0.14)' : 'transparent',
    borderStyle: 'dashed',
  });

  return (
    <div style={containerStyle} data-testid="quick-pick-chips">
      {items.map((item) => {
        const isHovered = hoveredId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            style={chipStyle(isHovered)}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => !disabled && onSelect(item)}
            disabled={disabled}
            aria-label={item.label}
            data-testid={`quick-pick-${item.id}`}
          >
            {item.chipLabel}
          </button>
        );
      })}
      <button
        type="button"
        style={otherChipStyle(hoveredId === '__other')}
        onMouseEnter={() => setHoveredId('__other')}
        onMouseLeave={() => setHoveredId(null)}
        onClick={() => !disabled && onOpenSearch()}
        disabled={disabled}
        aria-label={`Search ${categoryLabel}`}
        data-testid="quick-pick-other"
      >
        <Search size={12} />
        {categoryLabel}
      </button>
    </div>
  );
};

QuickPickChips.displayName = 'QuickPickChips';
