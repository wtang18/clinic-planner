/**
 * QuickAddInput Component
 *
 * Searchable input with autocomplete for quick item entry.
 */

import React from 'react';
import type { ChartItem, ItemCategory } from '../../types/chart-items';
import { colors, spacing, typography, radii, shadows, transitions, zIndex } from '../../styles/tokens';
import { getCategoryColor } from '../../styles/utils';
import { Input } from '../primitives/Input';
import { Spinner } from '../primitives/Spinner';

// ============================================================================
// Types
// ============================================================================

export interface QuickAddInputProps {
  /** The category to search within */
  category: ItemCategory;
  /** Called when an item is selected */
  onSelect: (template: Partial<ChartItem>) => void;
  /** Called when cancelled */
  onCancel: () => void;
  /** Placeholder text */
  placeholder?: string;
  /** Recent selections for quick access */
  recentItems?: Partial<ChartItem>[];
  /** Auto-focus the input */
  autoFocus?: boolean;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Mock search results (would be replaced with actual API)
// ============================================================================

interface SearchResult {
  id: string;
  displayText: string;
  displaySubtext?: string;
  template: Partial<ChartItem>;
}

const MOCK_SEARCH_RESULTS: Record<ItemCategory, SearchResult[]> = {
  medication: [
    { id: 'med-1', displayText: 'Lisinopril 10mg', displaySubtext: 'ACE inhibitor', template: { displayText: 'Lisinopril 10mg', category: 'medication' } },
    { id: 'med-2', displayText: 'Metformin 500mg', displaySubtext: 'Antidiabetic', template: { displayText: 'Metformin 500mg', category: 'medication' } },
    { id: 'med-3', displayText: 'Atorvastatin 20mg', displaySubtext: 'Statin', template: { displayText: 'Atorvastatin 20mg', category: 'medication' } },
    { id: 'med-4', displayText: 'Amlodipine 5mg', displaySubtext: 'Calcium channel blocker', template: { displayText: 'Amlodipine 5mg', category: 'medication' } },
    { id: 'med-5', displayText: 'Omeprazole 20mg', displaySubtext: 'PPI', template: { displayText: 'Omeprazole 20mg', category: 'medication' } },
  ],
  lab: [
    { id: 'lab-1', displayText: 'CBC with Differential', displaySubtext: 'Complete blood count', template: { displayText: 'CBC with Differential', category: 'lab' } },
    { id: 'lab-2', displayText: 'BMP', displaySubtext: 'Basic metabolic panel', template: { displayText: 'BMP', category: 'lab' } },
    { id: 'lab-3', displayText: 'CMP', displaySubtext: 'Comprehensive metabolic panel', template: { displayText: 'CMP', category: 'lab' } },
    { id: 'lab-4', displayText: 'Lipid Panel', displaySubtext: 'Cholesterol, HDL, LDL, Triglycerides', template: { displayText: 'Lipid Panel', category: 'lab' } },
    { id: 'lab-5', displayText: 'HbA1c', displaySubtext: 'Glycated hemoglobin', template: { displayText: 'HbA1c', category: 'lab' } },
  ],
  diagnosis: [
    { id: 'dx-1', displayText: 'Essential hypertension', displaySubtext: 'I10', template: { displayText: 'Essential hypertension', category: 'diagnosis' } },
    { id: 'dx-2', displayText: 'Type 2 diabetes mellitus', displaySubtext: 'E11.9', template: { displayText: 'Type 2 diabetes mellitus', category: 'diagnosis' } },
    { id: 'dx-3', displayText: 'Hyperlipidemia', displaySubtext: 'E78.5', template: { displayText: 'Hyperlipidemia', category: 'diagnosis' } },
    { id: 'dx-4', displayText: 'Acute upper respiratory infection', displaySubtext: 'J06.9', template: { displayText: 'Acute upper respiratory infection', category: 'diagnosis' } },
    { id: 'dx-5', displayText: 'Low back pain', displaySubtext: 'M54.5', template: { displayText: 'Low back pain', category: 'diagnosis' } },
  ],
  imaging: [
    { id: 'img-1', displayText: 'Chest X-ray', displaySubtext: 'PA and Lateral', template: { displayText: 'Chest X-ray', category: 'imaging' } },
    { id: 'img-2', displayText: 'CT Abdomen/Pelvis', displaySubtext: 'With contrast', template: { displayText: 'CT Abdomen/Pelvis', category: 'imaging' } },
    { id: 'img-3', displayText: 'MRI Brain', displaySubtext: 'Without contrast', template: { displayText: 'MRI Brain', category: 'imaging' } },
    { id: 'img-4', displayText: 'Ultrasound Abdomen', displaySubtext: 'Complete', template: { displayText: 'Ultrasound Abdomen', category: 'imaging' } },
  ],
  procedure: [
    { id: 'proc-1', displayText: 'Injection, joint', displaySubtext: 'Therapeutic', template: { displayText: 'Joint injection', category: 'procedure' } },
    { id: 'proc-2', displayText: 'Skin biopsy', displaySubtext: 'Punch', template: { displayText: 'Skin biopsy', category: 'procedure' } },
    { id: 'proc-3', displayText: 'Laceration repair', displaySubtext: 'Simple', template: { displayText: 'Laceration repair', category: 'procedure' } },
  ],
  vitals: [],
  allergy: [],
  referral: [],
  'chief-complaint': [],
  hpi: [],
  ros: [],
  'physical-exam': [],
  plan: [],
  instruction: [],
  note: [],
};

// Simple search function
const searchItems = async (query: string, category: ItemCategory): Promise<SearchResult[]> => {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate API delay
  const items = MOCK_SEARCH_RESULTS[category] || [];
  if (!query) return items.slice(0, 5);
  const lowerQuery = query.toLowerCase();
  return items.filter(item =>
    item.displayText.toLowerCase().includes(lowerQuery) ||
    item.displaySubtext?.toLowerCase().includes(lowerQuery)
  );
};

// ============================================================================
// Component
// ============================================================================

export const QuickAddInput: React.FC<QuickAddInputProps> = ({
  category,
  onSelect,
  onCancel,
  placeholder,
  recentItems = [],
  autoFocus = true,
  style,
}) => {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const categoryColors = getCategoryColor(category);
  const defaultPlaceholder = `Search ${getCategoryLabel(category)}...`;

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(async () => {
      setIsLoading(true);
      const searchResults = await searchItems(query, category);
      setResults(searchResults);
      setSelectedIndex(0);
      setIsLoading(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [query, category]);

  // Auto-focus
  React.useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = results.length + recentItems.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex < recentItems.length) {
          onSelect(recentItems[selectedIndex]);
        } else if (results[selectedIndex - recentItems.length]) {
          onSelect(results[selectedIndex - recentItems.length].template);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onCancel();
        break;
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    ...style,
  };

  const dropdownStyle: React.CSSProperties = {
    marginTop: spacing[2],
    backgroundColor: colors.neutral[0],
    border: `1px solid ${colors.neutral[200]}`,
    borderRadius: radii.lg,
    boxShadow: shadows.lg,
    maxHeight: '300px',
    overflowY: 'auto',
  };

  const sectionTitleStyle: React.CSSProperties = {
    padding: `${spacing[2]} ${spacing[3]}`,
    fontSize: typography.fontSize.xs[0],
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
    backgroundColor: colors.neutral[50],
    borderBottom: `1px solid ${colors.neutral[200]}`,
  };

  const resultItemStyle = (isSelected: boolean): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    padding: `${spacing[2]} ${spacing[3]}`,
    cursor: 'pointer',
    backgroundColor: isSelected ? colors.neutral[100] : 'transparent',
    transition: `background-color ${transitions.fast}`,
  });

  const resultTextStyle: React.CSSProperties = {
    fontSize: typography.fontSize.sm[0],
    color: colors.neutral[900],
  };

  const resultSubtextStyle: React.CSSProperties = {
    fontSize: typography.fontSize.xs[0],
    color: colors.neutral[500],
  };

  const emptyStateStyle: React.CSSProperties = {
    padding: spacing[4],
    textAlign: 'center',
    color: colors.neutral[500],
    fontSize: typography.fontSize.sm[0],
  };

  const loadingStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
  };

  return (
    <div style={containerStyle}>
      {/* Search input */}
      <Input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder || defaultPlaceholder}
        size="md"
        leftIcon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        }
        rightIcon={isLoading ? <Spinner size="sm" /> : undefined}
        onKeyDown={handleKeyDown}
        style={{ borderColor: categoryColors.border }}
      />

      {/* Results dropdown */}
      <div style={dropdownStyle}>
        {/* Recent items */}
        {recentItems.length > 0 && !query && (
          <>
            <div style={sectionTitleStyle}>Recent</div>
            {recentItems.map((item, index) => (
              <div
                key={`recent-${index}`}
                style={resultItemStyle(selectedIndex === index)}
                onClick={() => onSelect(item)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span style={resultTextStyle}>{item.displayText}</span>
              </div>
            ))}
          </>
        )}

        {/* Search results */}
        {results.length > 0 && (
          <>
            {recentItems.length > 0 && !query && (
              <div style={sectionTitleStyle}>Suggestions</div>
            )}
            {results.map((result, index) => {
              const actualIndex = recentItems.length + index;
              return (
                <div
                  key={result.id}
                  style={resultItemStyle(selectedIndex === actualIndex)}
                  onClick={() => onSelect(result.template)}
                  onMouseEnter={() => setSelectedIndex(actualIndex)}
                >
                  <span style={resultTextStyle}>{result.displayText}</span>
                  {result.displaySubtext && (
                    <span style={resultSubtextStyle}>{result.displaySubtext}</span>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* Loading state */}
        {isLoading && results.length === 0 && (
          <div style={loadingStyle}>
            <Spinner size="sm" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && query && results.length === 0 && (
          <div style={emptyStateStyle}>
            No results for "{query}"
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Helpers
// ============================================================================

function getCategoryLabel(category: ItemCategory): string {
  const labels: Record<ItemCategory, string> = {
    'chief-complaint': 'chief complaints',
    'hpi': 'HPI',
    'ros': 'ROS',
    'physical-exam': 'physical exams',
    'vitals': 'vitals',
    'medication': 'medications',
    'allergy': 'allergies',
    'lab': 'labs',
    'imaging': 'imaging',
    'procedure': 'procedures',
    'diagnosis': 'diagnoses',
    'plan': 'plans',
    'instruction': 'instructions',
    'note': 'notes',
    'referral': 'referrals',
  };
  return labels[category] || category;
}

QuickAddInput.displayName = 'QuickAddInput';
