/**
 * CommandPalette Component
 *
 * Keyboard-driven input mode for OmniAdd. Supports:
 * - Type-to-search at root level (searches all categories)
 * - Category prefix shortcuts (rx:, lab:, dx:, img:, proc:, etc.)
 * - Single-key shortcuts when input is empty (M, L, D, I, P)
 *
 * This is the keyboard counterpart to the touch-driven chip/category flow.
 */

import React from 'react';
import { Command, Search } from 'lucide-react';
import type { ItemCategory } from '../../types/chart-items';
import type { QuickPickItem } from '../../data/mock-quick-picks';
import { searchAllCategories, searchCategory } from '../../data/mock-quick-picks';
import { findCategoryByPrefix, findCategoryByShortcut, getCategoryMeta } from './omni-add-machine';
import { colors, spaceAround, spaceBetween, borderRadius, typography, shadows, transitions } from '../../styles/foundations';

export interface CommandPaletteProps {
  /** Current category (null if at root) */
  category: ItemCategory | null;
  /** Called when an item is selected from results */
  onSelectItem: (item: QuickPickItem) => void;
  /** Called when a category is selected (from prefix or shortcut) */
  onSelectCategory: (category: ItemCategory) => void;
  /** Called when text is submitted (for narrative categories) */
  onSubmitText: (text: string) => void;
  /** Called on escape */
  onEscape: () => void;
  /** Whether in a narrative category */
  isNarrative: boolean;
  autoFocus?: boolean;
}

interface PaletteResult {
  item: QuickPickItem;
  categoryLabel: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  category,
  onSelectItem,
  onSelectCategory,
  onSubmitText,
  onEscape,
  isNarrative,
  autoFocus = true,
}) => {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<PaletteResult[]>([]);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const placeholder = category
    ? `Search ${getCategoryMeta(category).label}... (Esc to go back)`
    : 'Type to search, or use prefix (rx:, lab:, dx:)...';

  // Search as user types
  React.useEffect(() => {
    if (isNarrative) {
      setResults([]);
      return;
    }

    // Check for category prefix
    if (!category) {
      const prefixMatch = findCategoryByPrefix(query);
      if (prefixMatch) {
        // If there's a query after the prefix, search that category
        if (prefixMatch.query) {
          const items = searchCategory(prefixMatch.category, prefixMatch.query);
          setResults(items.map(item => ({
            item,
            categoryLabel: getCategoryMeta(item.category).label,
          })));
        } else {
          // Just the prefix — select the category
          onSelectCategory(prefixMatch.category);
          setQuery('');
          return;
        }
        setSelectedIndex(0);
        return;
      }

      // Cross-category search
      const items = searchAllCategories(query);
      setResults(items.map(item => ({
        item,
        categoryLabel: getCategoryMeta(item.category).label,
      })));
    } else {
      // Within a category
      const items = searchCategory(category, query);
      setResults(items.map(item => ({
        item,
        categoryLabel: getCategoryMeta(item.category).label,
      })));
    }
    setSelectedIndex(0);
  }, [query, category, isNarrative, onSelectCategory]);

  // Auto-focus
  React.useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Single-key shortcuts when at root with empty input
    if (!category && !query && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const cat = findCategoryByShortcut(e.key);
      if (cat) {
        e.preventDefault();
        onSelectCategory(cat);
        return;
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (results.length > 0) {
          setSelectedIndex(prev => (prev + 1) % results.length);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (results.length > 0) {
          setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (isNarrative && query.trim()) {
          onSubmitText(query.trim());
        } else if (results[selectedIndex]) {
          onSelectItem(results[selectedIndex].item);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onEscape();
        break;
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
  };

  const inputRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    backgroundColor: colors.bg.neutral.base,
    border: `1px solid ${colors.border.neutral.medium}`,
    borderRadius: results.length > 0 ? `${borderRadius.sm} ${borderRadius.sm} 0 0` : borderRadius.sm,
    transition: `border-color ${transitions.fast}`,
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
    backgroundColor: 'transparent',
  };

  const resultsStyle: React.CSSProperties = {
    maxHeight: 240,
    overflowY: 'auto',
    backgroundColor: colors.bg.neutral.base,
    border: `1px solid ${colors.border.neutral.medium}`,
    borderTop: 'none',
    borderRadius: `0 0 ${borderRadius.sm} ${borderRadius.sm}`,
    boxShadow: shadows.lg,
  };

  const resultStyle = (isSelected: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    cursor: 'pointer',
    backgroundColor: isSelected ? colors.bg.neutral.subtle : 'transparent',
    transition: `background-color ${transitions.fast}`,
  });

  const resultLabelStyle: React.CSSProperties = {
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
  };

  const resultCategoryStyle: React.CSSProperties = {
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.spotReadable,
    backgroundColor: colors.bg.neutral.min,
    padding: `2px ${spaceAround.nudge4}px`,
    borderRadius: borderRadius.xs,
  };

  return (
    <div style={containerStyle} data-testid="command-palette">
      <div style={inputRowStyle}>
        {category ? (
          <Search size={14} color={colors.fg.neutral.spotReadable} />
        ) : (
          <Command size={14} color={colors.fg.neutral.spotReadable} />
        )}
        <input
          ref={inputRef}
          type="text"
          style={inputStyle}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          data-testid="command-palette-input"
        />
      </div>

      {results.length > 0 && (
        <div style={resultsStyle} data-testid="command-palette-results">
          {results.map((result, index) => (
            <div
              key={result.item.id}
              style={resultStyle(selectedIndex === index)}
              onClick={() => onSelectItem(result.item)}
              onMouseEnter={() => setSelectedIndex(index)}
              data-testid={`palette-result-${index}`}
            >
              <span style={resultLabelStyle}>{result.item.label}</span>
              {!category && (
                <span style={resultCategoryStyle}>{result.categoryLabel}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

CommandPalette.displayName = 'CommandPalette';
