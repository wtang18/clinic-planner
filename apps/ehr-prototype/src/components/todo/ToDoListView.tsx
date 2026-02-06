/**
 * ToDoListView Component
 *
 * Container for displaying To-Do lists with filtering and pagination.
 * Renders appropriate row components based on item category.
 */

import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { colors, spaceBetween, spaceAround, borderRadius, typography, transitions } from '../../styles/foundations';
import { FilterChips } from './FilterChips';
import { ToDoRow } from './ToDoRow';
import { EmptyState } from './EmptyState';
import type { ToDoItem, ToDoFilter } from '../../scenarios/todoData';

// ============================================================================
// Types
// ============================================================================

export type SortOption = 'due_date' | 'created_date' | 'patient_name' | 'priority';
export type SortDirection = 'asc' | 'desc';

export interface ToDoListViewProps {
  /** Category ID (tasks, inbox, messages, care) */
  categoryId: string;
  /** Current filter ID */
  filterId: string;
  /** Available filters for this category */
  filters: ToDoFilter[];
  /** Items to display */
  items: ToDoItem[];
  /** External search query (from nav row) */
  searchQuery?: string;
  /** Called when a filter is selected */
  onFilterChange?: (filterId: string) => void;
  /** Called when an item is clicked */
  onItemClick?: (item: ToDoItem) => void;
  /** Called when add action is triggered */
  onAddClick?: () => void;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const ToDoListView: React.FC<ToDoListViewProps> = ({
  categoryId,
  filterId,
  filters,
  items,
  searchQuery = '',
  onFilterChange,
  onItemClick,
  onAddClick,
  style,
  testID,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('due_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showMineOnly, setShowMineOnly] = useState(false);

  // Filter and sort items
  const displayItems = useMemo(() => {
    let result = items.filter((item) => item.filterId === filterId || filterId.startsWith('all'));

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.patient.name.toLowerCase().includes(query)
      );
    }

    // Apply "Mine Only" filter (simplified - would use current user in real app)
    if (showMineOnly) {
      result = result.filter((item) => item.owner?.includes('Paige'));
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'due_date':
          comparison = (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999');
          break;
        case 'created_date':
          comparison = a.createdDate.localeCompare(b.createdDate);
          break;
        case 'patient_name':
          comparison = a.patient.name.localeCompare(b.patient.name);
          break;
        case 'priority':
          const priorityOrder = { stat: 0, urgent: 1, normal: 2 };
          comparison = (priorityOrder[a.priority ?? 'normal']) - (priorityOrder[b.priority ?? 'normal']);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [items, filterId, searchQuery, showMineOnly, sortBy, sortDirection]);

  // Styles
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.related,
    paddingBottom: spaceAround.default,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
  };

  const actionButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    backgroundColor: colors.bg.accent.subtle,
    color: colors.fg.accent.primary,
    border: 'none',
    borderRadius: borderRadius.sm,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: `background-color ${transitions.fast}`,
  };

  const listStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    paddingTop: spaceAround.default,
  };

  return (
    <div style={containerStyle} data-testid={testID}>
      {/* Header with filters and action buttons */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <FilterChips
            filters={filters}
            activeFilterId={filterId}
            onFilterChange={onFilterChange}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={(sort, dir) => {
              setSortBy(sort);
              setSortDirection(dir);
            }}
            showMineOnly={showMineOnly}
            onMineOnlyChange={setShowMineOnly}
          />
          {onAddClick && (
            <button style={actionButtonStyle} onClick={onAddClick}>
              <Plus size={14} />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>

      {/* List or empty state */}
      <div style={listStyle}>
        {displayItems.length === 0 ? (
          <EmptyState
            categoryId={categoryId}
            filterId={filterId}
            hasSearch={!!searchQuery}
          />
        ) : (
          displayItems.map((item) => (
            <ToDoRow
              key={item.id}
              item={item}
              onClick={() => onItemClick?.(item)}
            />
          ))
        )}
      </div>
    </div>
  );
};

ToDoListView.displayName = 'ToDoListView';
