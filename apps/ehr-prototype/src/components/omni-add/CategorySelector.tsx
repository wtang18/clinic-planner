/**
 * CategorySelector Component
 *
 * Category button row for selecting chart item type.
 */

import React from 'react';
import type { ItemCategory } from '../../types/chart-items';
import { colors, spacing, typography, radii, transitions } from '../../styles/tokens';
import { getCategoryColor } from '../../styles/utils';

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
  const iconStyle = { width: '100%', height: '100%' };

  switch (category) {
    case 'medication':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.5 20.5L3.5 13.5a4.95 4.95 0 0 1 7-7l7 7a4.95 4.95 0 0 1-7 7z" />
          <path d="M8.5 8.5l7 7" />
        </svg>
      );
    case 'lab':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 3h6v5.5l3 5.5v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-4l3-5.5V3z" />
        </svg>
      );
    case 'diagnosis':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      );
    case 'imaging':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      );
    case 'procedure':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4l3 3" />
        </svg>
      );
    default:
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      );
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
    gap: spacing[2],
    ...style,
  };

  const primaryRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: spacing[2],
    flexWrap: 'wrap',
  };

  const secondaryRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: spacing[2],
    flexWrap: 'wrap',
    paddingTop: spacing[2],
    borderTop: `1px solid ${colors.neutral[200]}`,
  };

  const buttonStyle = (category: ItemCategory, isHovered: boolean, isSelected: boolean): React.CSSProperties => {
    const categoryColors = getCategoryColor(category);

    return {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      padding: `${spacing[2]} ${spacing[3]}`,
      backgroundColor: isSelected ? categoryColors.bg : isHovered ? colors.neutral[100] : colors.neutral[0],
      border: `1px solid ${isSelected ? categoryColors.border : colors.neutral[200]}`,
      borderRadius: radii.lg,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: `all ${transitions.fast}`,
      opacity: disabled ? 0.5 : 1,
      fontSize: typography.fontSize.sm[0],
      fontWeight: typography.fontWeight.medium,
      color: isSelected ? categoryColors.text : colors.neutral[700],
    };
  };

  const iconStyle: React.CSSProperties = {
    width: '18px',
    height: '18px',
    display: 'flex',
  };

  const shortcutStyle: React.CSSProperties = {
    fontSize: typography.fontSize.xs[0],
    color: colors.neutral[400],
    marginLeft: spacing[1],
  };

  const moreButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[1],
    padding: `${spacing[2]} ${spacing[3]}`,
    backgroundColor: colors.neutral[0],
    border: `1px solid ${colors.neutral[200]}`,
    borderRadius: radii.lg,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: `all ${transitions.fast}`,
    opacity: disabled ? 0.5 : 1,
    fontSize: typography.fontSize.sm[0],
    color: colors.neutral[500],
  };

  return (
    <div style={containerStyle}>
      {/* Primary categories */}
      <div style={primaryRowStyle}>
        {PRIMARY_CATEGORIES.map(({ category, label, shortcut }) => {
          const isHovered = hoveredCategory === category;
          const isSelected = selected === category;
          const categoryColors = getCategoryColor(category);

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
            >
              <span style={{ ...iconStyle, color: isSelected ? categoryColors.icon : colors.neutral[500] }}>
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
        >
          {showMore ? 'Less' : 'More'}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              transform: showMore ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: `transform ${transitions.fast}`,
            }}
          >
            <polyline points="6,9 12,15 18,9" />
          </svg>
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
