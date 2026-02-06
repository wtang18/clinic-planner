/**
 * CategorySelector Component
 *
 * Category button row for selecting chart item type.
 */

import React from 'react';
import { Pill, FlaskConical, Activity, ScanLine, CircleDot, Plus, ChevronDown } from 'lucide-react';
import type { ItemCategory } from '../../types/chart-items';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface CategorySelectorProps {
  /** Called when a category is selected */
  onSelect: (category: ItemCategory) => void;
  /** Recently used categories (shown first) */
  recentCategories?: ItemCategory[];
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Currently selected category */
  selected?: ItemCategory | null;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Constants
// ============================================================================

const PRIMARY_CATEGORIES: { category: ItemCategory; label: string; shortcut: string }[] = [
  { category: 'medication', label: 'Rx', shortcut: 'M' },
  { category: 'lab', label: 'Lab', shortcut: 'L' },
  { category: 'diagnosis', label: 'Dx', shortcut: 'D' },
  { category: 'imaging', label: 'Imaging', shortcut: 'I' },
  { category: 'procedure', label: 'Proc', shortcut: 'P' },
];

const SECONDARY_CATEGORIES: { category: ItemCategory; label: string }[] = [
  { category: 'vitals', label: 'Vitals' },
  { category: 'allergy', label: 'Allergy' },
  { category: 'referral', label: 'Referral' },
  { category: 'instruction', label: 'Instruction' },
  { category: 'note', label: 'Note' },
  { category: 'chief-complaint', label: 'Chief Complaint' },
  { category: 'hpi', label: 'HPI' },
  { category: 'ros', label: 'ROS' },
  { category: 'physical-exam', label: 'Physical Exam' },
  { category: 'plan', label: 'Plan' },
];

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
  recentCategories = [],
  disabled = false,
  selected,
  style,
}) => {
  const [showMore, setShowMore] = React.useState(false);
  const [hoveredCategory, setHoveredCategory] = React.useState<ItemCategory | null>(null);

  // Keyboard shortcuts
  React.useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toUpperCase();
      const category = PRIMARY_CATEGORIES.find(c => c.shortcut === key);
      if (category) {
        e.preventDefault();
        onSelect(category.category);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, onSelect]);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.repeating,
    ...style,
  };

  const primaryRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: spaceBetween.repeating,
    flexWrap: 'wrap',
  };

  const secondaryRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: spaceBetween.repeating,
    flexWrap: 'wrap',
    paddingTop: spaceAround.tight,
  };

  const buttonStyle = (category: ItemCategory, isHovered: boolean, isSelected: boolean): React.CSSProperties => {
    return {
      display: 'flex',
      alignItems: 'center',
      gap: spaceBetween.repeating,
      padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
      backgroundColor: isSelected
        ? colors.bg.neutral.subtle
        : isHovered
        ? 'rgba(128, 128, 128, 0.12)'
        : 'rgba(128, 128, 128, 0.06)',
      backdropFilter: isSelected ? 'none' : 'blur(12px)',
      WebkitBackdropFilter: isSelected ? 'none' : 'blur(12px)',
      border: `1px solid ${isSelected ? colors.border.neutral.medium : colors.border.neutral.low}`,
      borderRadius: borderRadius.sm,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: `all ${transitions.fast}`,
      opacity: disabled ? 0.5 : 1,
      fontSize: 14,
      fontFamily: typography.fontFamily.sans,
      fontWeight: typography.fontWeight.medium,
      color: isSelected ? colors.fg.neutral.primary : colors.fg.neutral.secondary,
    };
  };

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
      <div style={primaryRowStyle}>
        {PRIMARY_CATEGORIES.map(({ category, label, shortcut }) => {
          const isHovered = hoveredCategory === category;
          const isSelected = selected === category;

          return (
            <button
              key={category}
              type="button"
              style={buttonStyle(category, isHovered, isSelected)}
              onMouseEnter={() => setHoveredCategory(category)}
              onMouseLeave={() => setHoveredCategory(null)}
              onClick={() => !disabled && onSelect(category)}
              disabled={disabled}
              aria-label={`Add ${label}`}
              data-testid={`category-${category}`}
            >
              <span style={{ display: 'flex', color: colors.fg.neutral.spotReadable }}>
                {getCategoryIcon(category)}
              </span>
              <span>{label}</span>
              <span style={shortcutStyle}>{shortcut}</span>
            </button>
          );
        })}

        {/* More button */}
        <button
          type="button"
          style={moreButtonStyle}
          onClick={() => setShowMore(!showMore)}
          disabled={disabled}
          data-testid="category-more"
        >
          {showMore ? 'Less' : 'More'}
          <span style={{
            display: 'flex',
            transform: showMore ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: `transform ${transitions.fast}`,
          }}>
            <ChevronDown size={14} />
          </span>
        </button>
      </div>

      {/* Secondary categories (expandable) */}
      {showMore && (
        <div style={secondaryRowStyle}>
          {SECONDARY_CATEGORIES.map(({ category, label }) => {
            const isHovered = hoveredCategory === category;
            const isSelected = selected === category;

            return (
              <button
                key={category}
                type="button"
                style={buttonStyle(category, isHovered, isSelected)}
                onMouseEnter={() => setHoveredCategory(category)}
                onMouseLeave={() => setHoveredCategory(null)}
                onClick={() => !disabled && onSelect(category)}
                disabled={disabled}
                aria-label={`Add ${label}`}
                data-testid={`category-${category}`}
              >
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

CategorySelector.displayName = 'CategorySelector';
