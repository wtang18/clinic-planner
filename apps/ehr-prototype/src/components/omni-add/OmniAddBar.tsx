/**
 * OmniAddBar Component
 *
 * The primary input mechanism for adding chart items during encounters.
 */

import React from 'react';
import { ChevronLeft } from 'lucide-react';
import type { ChartItem, ItemCategory } from '../../types/chart-items';
import { colors, spaceAround, spaceBetween, typography } from '../../styles/foundations';
import { CategorySelector } from './CategorySelector';
import { QuickAddInput } from './QuickAddInput';
import { ItemDetailForm } from './ItemDetailForm';
import { Button } from '../primitives/Button';
import { Card } from '../primitives/Card';

// ============================================================================
// Types
// ============================================================================

export interface OmniAddBarProps {
  /** Called when an item is added */
  onItemAdd: (item: Partial<ChartItem>) => void;
  /** Recent items for quick re-add */
  recentItems?: ChartItem[];
  /** Whether the bar is disabled */
  disabled?: boolean;
  /** Custom styles */
  style?: React.CSSProperties;
  // Legacy props (kept for backwards compatibility, no longer used)
  /** @deprecated No longer displayed since OmniAdd is always open */
  activeSuggestions?: unknown[];
  /** @deprecated No longer displayed since OmniAdd is always open */
  onSuggestionAccept?: (id: string) => void;
  /** @deprecated No longer displayed since OmniAdd is always open */
  onSuggestionDismiss?: (id: string) => void;
}

type OmniAddState = 'category-select' | 'search' | 'detail-entry';

// ============================================================================
// Component
// ============================================================================

export const OmniAddBar: React.FC<OmniAddBarProps> = ({
  onItemAdd,
  recentItems = [],
  disabled = false,
  style,
}) => {
  const [state, setState] = React.useState<OmniAddState>('category-select');
  const [selectedCategory, setSelectedCategory] = React.useState<ItemCategory | null>(null);
  const [selectedItem, setSelectedItem] = React.useState<Partial<ChartItem> | null>(null);

  // Reset state (returns to category-select since OmniAdd is always open)
  const reset = () => {
    setState('category-select');
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

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    ...style,
  };

  const expandedContainerStyle: React.CSSProperties = {
    padding: spaceAround.default,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: spaceAround.compact,
  };

  const headerLeftStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
  };

  const breadcrumbStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.spotReadable,
  };

  // Always-open OmniAdd (no collapsed state)
  return (
    <div style={containerStyle} data-testid="omni-add-bar">
      <Card variant="elevated" padding="none" data-testid="omni-add-expanded">
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
                  leftIcon={<ChevronLeft size={14} />}
                  data-testid="omni-add-back"
                >
                  Back
                </Button>
              )}
              {/* Breadcrumb */}
              <div style={breadcrumbStyle}>
                <span>Add Item</span>
                {selectedCategory && (
                  <>
                    <span>&rsaquo;</span>
                    <span style={{ color: colors.fg.neutral.secondary }}>
                      {getCategoryLabel(selectedCategory)}
                    </span>
                  </>
                )}
              </div>
            </div>
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
