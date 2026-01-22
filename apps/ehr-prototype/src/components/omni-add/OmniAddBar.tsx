/**
 * OmniAddBar Component
 *
 * The primary input mechanism for adding chart items during encounters.
 */

import React from 'react';
import type { ChartItem, ItemCategory } from '../../types/chart-items';
import type { Suggestion } from '../../types/suggestions';
import { colors, spacing, typography, radii, shadows, transitions } from '../../styles/tokens';
import { CategorySelector } from './CategorySelector';
import { QuickAddInput } from './QuickAddInput';
import { ItemDetailForm } from './ItemDetailForm';
import { SuggestionList } from '../suggestions/SuggestionList';
import { Button } from '../primitives/Button';
import { Card } from '../primitives/Card';

// ============================================================================
// Types
// ============================================================================

export interface OmniAddBarProps {
  /** Called when an item is added */
  onItemAdd: (item: Partial<ChartItem>) => void;
  /** Active suggestions to display */
  activeSuggestions?: Suggestion[];
  /** Called when a suggestion is accepted */
  onSuggestionAccept?: (id: string) => void;
  /** Called when a suggestion is dismissed */
  onSuggestionDismiss?: (id: string) => void;
  /** Recent items for quick re-add */
  recentItems?: ChartItem[];
  /** Whether the bar is disabled */
  disabled?: boolean;
  /** Custom styles */
  style?: React.CSSProperties;
}

type OmniAddState = 'collapsed' | 'category-select' | 'search' | 'detail-entry';

// ============================================================================
// Icons
// ============================================================================

const PlusIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const XIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15,18 9,12 15,6" />
  </svg>
);

// ============================================================================
// Component
// ============================================================================

export const OmniAddBar: React.FC<OmniAddBarProps> = ({
  onItemAdd,
  activeSuggestions = [],
  onSuggestionAccept,
  onSuggestionDismiss,
  recentItems = [],
  disabled = false,
  style,
}) => {
  const [state, setState] = React.useState<OmniAddState>('collapsed');
  const [selectedCategory, setSelectedCategory] = React.useState<ItemCategory | null>(null);
  const [selectedItem, setSelectedItem] = React.useState<Partial<ChartItem> | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Reset state
  const reset = () => {
    setState('collapsed');
    setSelectedCategory(null);
    setSelectedItem(null);
  };

  // Handle category selection
  const handleCategorySelect = (category: ItemCategory) => {
    setSelectedCategory(category);
    setState('search');
  };

  // Handle item selection from search
  const handleItemSelect = (template: Partial<ChartItem>) => {
    setSelectedItem(template);
    setState('detail-entry');
  };

  // Handle final item submission
  const handleSubmit = (item: Partial<ChartItem>) => {
    onItemAdd(item);
    reset();
  };

  // Handle suggestion accept
  const handleSuggestionAccept = (id: string) => {
    onSuggestionAccept?.(id);
  };

  // Click outside to close (when expanded)
  React.useEffect(() => {
    if (state === 'collapsed') return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        reset();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [state]);

  // Keyboard shortcut to open
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.key === '+' && !e.metaKey && !e.ctrlKey && state === 'collapsed') {
        e.preventDefault();
        setState('category-select');
      }
      if (e.key === 'Escape' && state !== 'collapsed') {
        e.preventDefault();
        reset();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [disabled, state]);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    ...style,
  };

  const collapsedStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
  };

  const addButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    padding: `${spacing[3]} ${spacing[4]}`,
    backgroundColor: colors.primary[600],
    color: colors.neutral[0],
    border: 'none',
    borderRadius: radii.lg,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: typography.fontSize.sm[0],
    fontWeight: typography.fontWeight.medium,
    transition: `all ${transitions.fast}`,
    opacity: disabled ? 0.5 : 1,
  };

  const expandedContainerStyle: React.CSSProperties = {
    padding: spacing[4],
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  };

  const headerLeftStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
  };

  const titleStyle: React.CSSProperties = {
    fontSize: typography.fontSize.sm[0],
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[700],
  };

  const breadcrumbStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[1],
    fontSize: typography.fontSize.xs[0],
    color: colors.neutral[500],
  };

  // Collapsed state
  if (state === 'collapsed') {
    return (
      <div style={containerStyle} ref={containerRef}>
        <div style={collapsedStyle}>
          {/* Add button */}
          <button
            type="button"
            style={addButtonStyle}
            onClick={() => !disabled && setState('category-select')}
            disabled={disabled}
          >
            <span style={{ width: '18px', height: '18px', display: 'flex' }}>
              <PlusIcon />
            </span>
            Add
            <span style={{
              fontSize: typography.fontSize.xs[0],
              opacity: 0.7,
              marginLeft: spacing[1],
            }}>
              +
            </span>
          </button>

          {/* Suggestions (inline when collapsed) */}
          {activeSuggestions.length > 0 && onSuggestionAccept && onSuggestionDismiss && (
            <SuggestionList
              suggestions={activeSuggestions}
              maxVisible={3}
              onAccept={handleSuggestionAccept}
              onDismiss={onSuggestionDismiss}
              variant="chips"
            />
          )}
        </div>
      </div>
    );
  }

  // Expanded states
  return (
    <div style={containerStyle} ref={containerRef}>
      <Card variant="elevated" padding="none">
        <div style={expandedContainerStyle}>
          {/* Header */}
          <div style={headerStyle}>
            <div style={headerLeftStyle}>
              {state !== 'category-select' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (state === 'detail-entry') {
                      setState('search');
                      setSelectedItem(null);
                    } else {
                      setState('category-select');
                      setSelectedCategory(null);
                    }
                  }}
                  leftIcon={<ChevronLeftIcon />}
                >
                  Back
                </Button>
              )}
              {/* Breadcrumb */}
              <div style={breadcrumbStyle}>
                <span>Add Item</span>
                {selectedCategory && (
                  <>
                    <span>›</span>
                    <span style={{ color: colors.neutral[700] }}>
                      {getCategoryLabel(selectedCategory)}
                    </span>
                  </>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              leftIcon={<XIcon />}
            >
              Cancel
            </Button>
          </div>

          {/* Category selection */}
          {state === 'category-select' && (
            <CategorySelector
              onSelect={handleCategorySelect}
              disabled={disabled}
            />
          )}

          {/* Search input */}
          {state === 'search' && selectedCategory && (
            <QuickAddInput
              category={selectedCategory}
              onSelect={handleItemSelect}
              onCancel={() => {
                setState('category-select');
                setSelectedCategory(null);
              }}
              recentItems={recentItems
                .filter(item => item.category === selectedCategory)
                .slice(0, 3)
              }
            />
          )}

          {/* Detail form */}
          {state === 'detail-entry' && selectedCategory && selectedItem && (
            <ItemDetailForm
              category={selectedCategory}
              initialData={selectedItem}
              onSubmit={handleSubmit}
              onCancel={() => {
                setState('search');
                setSelectedItem(null);
              }}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// Helpers
// ============================================================================

function getCategoryLabel(category: ItemCategory): string {
  const labels: Record<ItemCategory, string> = {
    'chief-complaint': 'Chief Complaint',
    'hpi': 'HPI',
    'ros': 'ROS',
    'physical-exam': 'Physical Exam',
    'vitals': 'Vitals',
    'medication': 'Medication',
    'allergy': 'Allergy',
    'lab': 'Lab',
    'imaging': 'Imaging',
    'procedure': 'Procedure',
    'diagnosis': 'Diagnosis',
    'plan': 'Plan',
    'instruction': 'Instruction',
    'note': 'Note',
    'referral': 'Referral',
  };
  return labels[category] || category;
}

OmniAddBar.displayName = 'OmniAddBar';
