/**
 * CategorySelector Component
 *
 * Category button row for selecting chart item type.
 * Sources metadata from the OmniAdd state machine (PRIMARY_CATEGORIES, SECONDARY_CATEGORIES).
 * Controlled: moreExpanded and onToggleMore are driven by the parent state machine.
 */

import React from 'react';
import { Pill, FlaskConical, Activity, ScanLine, CircleDot, Plus, ChevronDown } from 'lucide-react';
import type { ItemCategory } from '../../types/chart-items';
import { PRIMARY_CATEGORIES, SECONDARY_CATEGORIES } from './omni-add-machine';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface CategorySelectorProps {
  /** Called when a category is selected */
  onSelect: (category: ItemCategory) => void;
  /** Whether the "More" row is expanded (controlled) */
  moreExpanded: boolean;
  /** Toggle the "More" row (controlled) */
  onToggleMore: () => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
}

// ============================================================================
// Icons
// ============================================================================

const getCategoryIcon = (category: ItemCategory): React.ReactNode => {
  switch (category) {
    case 'medication':
      return <Pill size={18} />;
    case 'lab':
      return <FlaskConical size={18} />;
    case 'diagnosis':
      return <Activity size={18} />;
    case 'imaging':
      return <ScanLine size={18} />;
    case 'procedure':
      return <CircleDot size={18} />;
    default:
      return <Plus size={18} />;
  }
};

// ============================================================================
// Component
// ============================================================================

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  onSelect,
  moreExpanded,
  onToggleMore,
  disabled = false,
}) => {
  const [hoveredCategory, setHoveredCategory] = React.useState<ItemCategory | null>(null);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.repeating,
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    gap: spaceBetween.repeating,
    flexWrap: 'wrap',
  };

  const secondaryRowStyle: React.CSSProperties = {
    ...rowStyle,
    paddingTop: spaceAround.tight,
  };

  const buttonStyle = (isHovered: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    backgroundColor: isHovered ? 'rgba(128, 128, 128, 0.12)' : 'rgba(128, 128, 128, 0.06)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: `1px solid ${colors.border.neutral.low}`,
    borderRadius: borderRadius.sm,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: `all ${transitions.fast}`,
    opacity: disabled ? 0.5 : 1,
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.secondary,
  });

  const shortcutStyle: React.CSSProperties = {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.disabled,
    marginLeft: spaceAround.nudge4,
  };

  const moreButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    backgroundColor: colors.bg.neutral.base,
    border: `1px solid ${colors.border.neutral.low}`,
    borderRadius: borderRadius.sm,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: `all ${transitions.fast}`,
    opacity: disabled ? 0.5 : 1,
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.spotReadable,
  };

  return (
    <div style={containerStyle} data-testid="category-selector">
      {/* Primary categories */}
      <div style={rowStyle}>
        {PRIMARY_CATEGORIES.map((meta) => {
          const isHovered = hoveredCategory === meta.category;
          return (
            <button
              key={meta.category}
              type="button"
              style={buttonStyle(isHovered)}
              onMouseEnter={() => setHoveredCategory(meta.category)}
              onMouseLeave={() => setHoveredCategory(null)}
              onClick={() => !disabled && onSelect(meta.category)}
              disabled={disabled}
              aria-label={`Add ${meta.label}`}
              data-testid={`category-${meta.category}`}
            >
              <span style={{ display: 'flex', color: colors.fg.neutral.spotReadable }}>
                {getCategoryIcon(meta.category)}
              </span>
              <span>{meta.label}</span>
              {meta.shortcut && <span style={shortcutStyle}>{meta.shortcut}</span>}
            </button>
          );
        })}

        {/* More toggle */}
        <button
          type="button"
          style={moreButtonStyle}
          onClick={() => !disabled && onToggleMore()}
          disabled={disabled}
          data-testid="category-more"
        >
          {moreExpanded ? 'Less' : 'More'}
          <span style={{
            display: 'flex',
            transform: moreExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: `transform ${transitions.fast}`,
          }}>
            <ChevronDown size={14} />
          </span>
        </button>
      </div>

      {/* Secondary categories */}
      {moreExpanded && (
        <div style={secondaryRowStyle}>
          {SECONDARY_CATEGORIES.map((meta) => {
            const isHovered = hoveredCategory === meta.category;
            return (
              <button
                key={meta.category}
                type="button"
                style={buttonStyle(isHovered)}
                onMouseEnter={() => setHoveredCategory(meta.category)}
                onMouseLeave={() => setHoveredCategory(null)}
                onClick={() => !disabled && onSelect(meta.category)}
                disabled={disabled}
                aria-label={`Add ${meta.label}`}
                data-testid={`category-${meta.category}`}
              >
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

CategorySelector.displayName = 'CategorySelector';
