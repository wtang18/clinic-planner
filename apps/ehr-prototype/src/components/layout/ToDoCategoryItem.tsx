/**
 * ToDoCategoryItem Component
 *
 * Expandable To-Do category in the menu with nested filters.
 * Clicking the category expands and navigates to default filter.
 */

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Inbox,
  MessageSquare,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { colors, spaceBetween, spaceAround, borderRadius, typography, transitions } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface ToDoFilter {
  id: string;
  label: string;
  count: number;
}

export interface ToDoCategoryItemProps {
  /** Category ID */
  id: string;
  /** Category label */
  label: string;
  /** Icon name (CheckSquare, Inbox, MessageSquare, Heart) */
  icon: string;
  /** Badge count (typically default filter count) */
  badge?: number;
  /** Default filter ID (navigated to on category click) */
  defaultFilterId: string;
  /** Available filters */
  filters: ToDoFilter[];
  /** Currently selected filter ID */
  selectedFilterId?: string;
  /** Whether category is expanded */
  isExpanded?: boolean;
  /** Called when category is clicked (expand + navigate) */
  onCategoryClick?: () => void;
  /** Called when a filter is clicked */
  onFilterClick?: (filterId: string) => void;
  /** Called when expand state changes */
  onExpandChange?: (expanded: boolean) => void;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Icon Mapping
// ============================================================================

const ICONS: Record<string, React.FC<{ size: number }>> = {
  CheckSquare,
  Inbox,
  MessageSquare,
  Heart,
};

// ============================================================================
// Component
// ============================================================================

export const ToDoCategoryItem: React.FC<ToDoCategoryItemProps> = ({
  id,
  label,
  icon,
  badge,
  defaultFilterId,
  filters,
  selectedFilterId,
  isExpanded: controlledExpanded,
  onCategoryClick,
  onFilterClick,
  onExpandChange,
  testID,
}) => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = controlledExpanded ?? internalExpanded;

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Auto-expand if a filter in this category is selected
  useEffect(() => {
    if (selectedFilterId && filters.some((f) => f.id === selectedFilterId)) {
      if (!controlledExpanded) {
        setInternalExpanded(true);
      }
      onExpandChange?.(true);
    }
  }, [selectedFilterId, filters, controlledExpanded, onExpandChange]);

  const IconComponent = ICONS[icon] || CheckSquare;

  const handleCategoryClick = () => {
    const newExpanded = !isExpanded;
    if (!controlledExpanded) {
      setInternalExpanded(newExpanded);
    }
    onExpandChange?.(newExpanded);

    // If expanding, also navigate to default filter
    if (newExpanded) {
      onCategoryClick?.();
      onFilterClick?.(defaultFilterId);
    }
  };

  const handleFilterClick = (filterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onFilterClick?.(filterId);
  };

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = !isExpanded;
    if (!controlledExpanded) {
      setInternalExpanded(newExpanded);
    }
    onExpandChange?.(newExpanded);
  };

  // Styles
  const categoryRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    borderRadius: borderRadius.sm,
    cursor: 'pointer',
    transition: `background-color ${transitions.fast}`,
    backgroundColor: hoveredId === id ? colors.bg.neutral.subtle : 'transparent',
  };

  const chevronStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
    color: colors.fg.neutral.spotReadable,
    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
    transition: `transform ${transitions.fast}`,
    flexShrink: 0,
    marginLeft: 'auto', // Push chevron to right
  };

  const iconStyle: React.CSSProperties = {
    color: colors.fg.neutral.secondary,
    flexShrink: 0,
  };

  const labelStyle: React.CSSProperties = {
    flex: 1,
    fontSize: 13,
    fontWeight: 500,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
  };

  const badgeStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 18,
    height: 18,
    padding: '0 5px',
    borderRadius: borderRadius.full,
    backgroundColor: colors.bg.accent.subtle,
    color: colors.fg.accent.primary,
    fontSize: 11,
    fontWeight: 500,
    flexShrink: 0,
  };

  const filtersContainerStyle: React.CSSProperties = {
    overflow: 'hidden',
    maxHeight: isExpanded ? filters.length * 32 + 8 : 0,
    opacity: isExpanded ? 1 : 0,
    transition: `max-height ${transitions.base}, opacity ${transitions.fast}`,
    paddingLeft: 28, // Align with category label
  };

  const filterRowStyle = (filterId: string): React.CSSProperties => {
    const isSelected = filterId === selectedFilterId;
    const isHovered = hoveredId === filterId;
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${spaceAround.nudge6}px ${spaceAround.compact}px`,
      borderRadius: borderRadius.sm,
      cursor: 'pointer',
      backgroundColor: isSelected
        ? colors.bg.accent.subtle
        : isHovered
        ? colors.bg.neutral.subtle
        : 'transparent',
      transition: `background-color ${transitions.fast}`,
    };
  };

  const filterLabelStyle = (filterId: string): React.CSSProperties => {
    const isSelected = filterId === selectedFilterId;
    return {
      fontSize: 13,
      fontFamily: typography.fontFamily.sans,
      fontWeight: isSelected ? 500 : 400,
      color: isSelected ? colors.fg.accent.primary : colors.fg.neutral.secondary,
    };
  };

  const filterCountStyle = (filterId: string): React.CSSProperties => {
    const isSelected = filterId === selectedFilterId;
    return {
      fontSize: 11,
      fontFamily: typography.fontFamily.sans,
      color: isSelected ? colors.fg.accent.primary : colors.fg.neutral.spotReadable,
    };
  };

  return (
    <div data-testid={testID}>
      {/* Category row */}
      <div
        style={categoryRowStyle}
        onClick={handleCategoryClick}
        onMouseEnter={() => setHoveredId(id)}
        onMouseLeave={() => setHoveredId(null)}
      >
        <span style={iconStyle}>
          <IconComponent size={16} />
        </span>
        <span style={labelStyle}>{label}</span>
        {badge !== undefined && badge > 0 && (
          <span style={badgeStyle}>{badge}</span>
        )}
        <div style={chevronStyle} onClick={handleChevronClick}>
          <ChevronRight size={14} />
        </div>
      </div>

      {/* Filters */}
      <div style={filtersContainerStyle}>
        {filters.map((filter) => (
          <div
            key={filter.id}
            style={filterRowStyle(filter.id)}
            onClick={(e) => handleFilterClick(filter.id, e)}
            onMouseEnter={() => setHoveredId(filter.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <span style={filterLabelStyle(filter.id)}>{filter.label}</span>
            {filter.count > 0 && (
              <span style={filterCountStyle(filter.id)}>{filter.count}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

ToDoCategoryItem.displayName = 'ToDoCategoryItem';
