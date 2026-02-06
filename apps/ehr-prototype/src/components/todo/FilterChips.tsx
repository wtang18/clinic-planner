/**
 * FilterChips Component
 *
 * Filter controls for To-Do lists including category filters,
 * sort options, and toggle filters.
 */

import React, { useState } from 'react';
import { ChevronDown, ArrowUpDown } from 'lucide-react';
import { colors, spaceBetween, spaceAround, borderRadius, typography, transitions } from '../../styles/foundations';
import type { ToDoFilter } from '../../scenarios/todoData';
import type { SortOption, SortDirection } from './ToDoListView';

// ============================================================================
// Types
// ============================================================================

export interface FilterChipsProps {
  /** Available filters */
  filters: ToDoFilter[];
  /** Currently active filter ID */
  activeFilterId: string;
  /** Called when filter changes */
  onFilterChange?: (filterId: string) => void;
  /** Current sort field */
  sortBy: SortOption;
  /** Current sort direction */
  sortDirection: SortDirection;
  /** Called when sort changes */
  onSortChange?: (sortBy: SortOption, direction: SortDirection) => void;
  /** Whether "Mine Only" is active */
  showMineOnly: boolean;
  /** Called when "Mine Only" changes */
  onMineOnlyChange?: (value: boolean) => void;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Sort Options
// ============================================================================

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'due_date', label: 'Due Date' },
  { value: 'created_date', label: 'Created Date' },
  { value: 'patient_name', label: 'Patient Name' },
  { value: 'priority', label: 'Priority' },
];

// ============================================================================
// Component
// ============================================================================

export const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  activeFilterId,
  onFilterChange,
  sortBy,
  sortDirection,
  onSortChange,
  showMineOnly,
  onMineOnlyChange,
  style,
  testID,
}) => {
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Styles
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    ...style,
  };

  const chipStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: `${spaceAround.nudge6}px ${spaceAround.compact}px`,
    backgroundColor: isActive ? colors.bg.accent.subtle : colors.bg.neutral.subtle,
    color: isActive ? colors.fg.accent.primary : colors.fg.neutral.secondary,
    border: `1px solid ${isActive ? colors.border.accent.low : colors.border.neutral.low}`,
    borderRadius: borderRadius.full,
    fontSize: 12,
    fontWeight: isActive ? 500 : 400,
    fontFamily: typography.fontFamily.sans,
    cursor: 'pointer',
    transition: `all ${transitions.fast}`,
    whiteSpace: 'nowrap',
  });

  const dropdownChipStyle: React.CSSProperties = {
    ...chipStyle(false),
    position: 'relative',
  };

  const dropdownMenuStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: 4,
    minWidth: 140,
    backgroundColor: colors.bg.neutral.base,
    border: `1px solid ${colors.border.neutral.low}`,
    borderRadius: borderRadius.sm,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    zIndex: 100,
    overflow: 'hidden',
  };

  const dropdownItemStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: isActive ? colors.fg.accent.primary : colors.fg.neutral.primary,
    backgroundColor: isActive ? colors.bg.accent.subtle : 'transparent',
    cursor: 'pointer',
    transition: `background-color ${transitions.fast}`,
  });

  const toggleChipStyle = (isActive: boolean): React.CSSProperties => ({
    ...chipStyle(isActive),
    backgroundColor: isActive ? colors.bg.accent.low : colors.bg.neutral.subtle,
  });

  const separatorStyle: React.CSSProperties = {
    width: 1,
    height: 20,
    backgroundColor: colors.border.neutral.low,
    margin: `0 ${spaceBetween.relatedCompact}px`,
  };

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Sort';

  return (
    <div style={containerStyle} data-testid={testID}>
      {/* Filter chips */}
      {filters.map((filter) => (
        <button
          key={filter.id}
          style={chipStyle(filter.id === activeFilterId)}
          onClick={() => onFilterChange?.(filter.id)}
        >
          {filter.label}
          {filter.count > 0 && (
            <span style={{ opacity: 0.7 }}>({filter.count})</span>
          )}
        </button>
      ))}

      <div style={separatorStyle} />

      {/* Sort dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          style={dropdownChipStyle}
          onClick={() => setShowSortDropdown(!showSortDropdown)}
        >
          <ArrowUpDown size={12} />
          <span>{currentSortLabel}</span>
          <ChevronDown size={12} />
        </button>

        {showSortDropdown && (
          <>
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99,
              }}
              onClick={() => setShowSortDropdown(false)}
            />
            <div style={dropdownMenuStyle}>
              {SORT_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  style={dropdownItemStyle(option.value === sortBy)}
                  onClick={() => {
                    if (option.value === sortBy) {
                      onSortChange?.(sortBy, sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      onSortChange?.(option.value, 'asc');
                    }
                    setShowSortDropdown(false);
                  }}
                >
                  <span>{option.label}</span>
                  {option.value === sortBy && (
                    <span style={{ fontSize: 10 }}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Mine Only toggle */}
      <button
        style={toggleChipStyle(showMineOnly)}
        onClick={() => onMineOnlyChange?.(!showMineOnly)}
      >
        Mine Only
      </button>
    </div>
  );
};

FilterChips.displayName = 'FilterChips';
