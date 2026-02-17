/**
 * SuggestionList Component
 *
 * List container for multiple suggestions with animation and batch actions.
 */

import React from 'react';
import { Ban, Sparkles } from 'lucide-react';
import type { Suggestion } from '../../types/suggestions';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions } from '../../styles/foundations';
import { getSuggestionCategoryLabel } from '../../utils/suggestions';
import { SuggestionChip } from './SuggestionChip';
import { Button } from '../primitives/Button';
import { IconButton } from '../primitives/IconButton';
import { EmptyState } from '../primitives/EmptyState';

// ============================================================================
// Types
// ============================================================================

export interface SuggestionListProps {
  /** The suggestions to display */
  suggestions: Suggestion[];
  /** Maximum number of suggestions to show before "N more" */
  maxVisible?: number;
  /** Called when a suggestion is accepted */
  onAccept: (id: string) => void;
  /** Called when a suggestion is dismissed */
  onDismiss: (id: string) => void;
  /** Called when a suggestion is clicked for modification */
  onModify?: (id: string) => void;
  /** Called when clear all is clicked */
  onClearAll?: () => void;
  /** Whether to display as chips or cards */
  variant?: 'chips' | 'compact';
  /** Whether to show the built-in header (Sparkles + count). Default true. */
  showHeader?: boolean;
  /** Color theme: 'light' for pane, 'dark' for palette overlay. Default 'light'. */
  theme?: 'light' | 'dark';
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Component
// ============================================================================

export const SuggestionList: React.FC<SuggestionListProps> = ({
  suggestions,
  maxVisible = 5,
  onAccept,
  onDismiss,
  onModify,
  onClearAll,
  variant = 'chips',
  showHeader = true,
  theme = 'light',
  style,
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const [exitingIds, setExitingIds] = React.useState<Set<string>>(new Set());

  // Filter active suggestions
  const activeSuggestions = suggestions.filter(s => s.status === 'active');
  // When header is hidden, parent controls slicing — show all active
  const visibleSuggestions = !showHeader
    ? activeSuggestions
    : expanded
      ? activeSuggestions
      : activeSuggestions.slice(0, maxVisible);
  const hiddenCount = activeSuggestions.length - maxVisible;

  // Handle accept with exit animation
  const handleAccept = (id: string) => {
    setExitingIds(new Set([...exitingIds, id]));
    setTimeout(() => {
      onAccept(id);
      setExitingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 200);
  };

  // Handle dismiss with exit animation
  const handleDismiss = (id: string) => {
    setExitingIds(new Set([...exitingIds, id]));
    setTimeout(() => {
      onDismiss(id);
      setExitingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 200);
  };

  // Empty state
  if (activeSuggestions.length === 0) {
    return (
      <EmptyState
        icon={<Sparkles size={32} />}
        title="No suggestions"
        size="sm"
        style={style}
      />
    );
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.repeating,
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spaceAround.tight,
  };

  const titleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.generative.spotReadable,
  };

  const chipsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spaceBetween.repeating,
  };

  const compactListStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.coupled,
  };

  const isDark = theme === 'dark';

  const compactItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.bg.positive.subtle,
    borderRadius: borderRadius.sm,
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    transition: `all ${transitions.fast}`,
  };

  const exitingStyle: React.CSSProperties = {
    opacity: 0,
    transform: 'translateX(-10px)',
    transition: `all ${transitions.fast}`,
  };

  const moreIndicatorStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${spaceAround.nudge6}px ${spaceAround.compact}px`,
    backgroundColor: colors.bg.neutral.subtle,
    borderRadius: borderRadius.sm,
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    cursor: 'pointer',
    transition: `all ${transitions.fast}`,
  };

  return (
    <div data-testid="suggestion-list" style={containerStyle}>
      {/* Header */}
      {showHeader && (
        <div style={headerStyle}>
          <div style={titleStyle}>
            <Sparkles size={16} />
            {activeSuggestions.length} suggestion{activeSuggestions.length !== 1 ? 's' : ''}
          </div>
          {onClearAll && activeSuggestions.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              style={{ color: colors.fg.neutral.spotReadable }}
            >
              Clear all
            </Button>
          )}
        </div>
      )}

      {/* Chips variant */}
      {variant === 'chips' && (
        <div style={chipsContainerStyle}>
          {visibleSuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              style={exitingIds.has(suggestion.id) ? exitingStyle : {}}
            >
              <SuggestionChip
                suggestion={suggestion}
                onAccept={() => handleAccept(suggestion.id)}
                onDismiss={() => handleDismiss(suggestion.id)}
                onModify={onModify ? () => onModify(suggestion.id) : undefined}
              />
            </div>
          ))}

          {/* More indicator */}
          {showHeader && !expanded && hiddenCount > 0 && (
            <div
              data-testid="show-more-btn"
              style={moreIndicatorStyle}
              onClick={() => setExpanded(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setExpanded(true)}
            >
              +{hiddenCount} more
            </div>
          )}

          {/* Collapse button */}
          {showHeader && expanded && hiddenCount > 0 && (
            <div
              style={moreIndicatorStyle}
              onClick={() => setExpanded(false)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setExpanded(false)}
            >
              Show less
            </div>
          )}
        </div>
      )}

      {/* Compact list variant */}
      {variant === 'compact' && (
        <div style={compactListStyle}>
          {visibleSuggestions.map((suggestion) => {
            const categoryLabel = getSuggestionCategoryLabel(suggestion);
            const labelColor = isDark ? 'rgba(255, 255, 255, 0.5)' : colors.fg.neutral.spotReadable;
            const textColor = isDark ? colors.fg.neutral.inversePrimary : colors.fg.neutral.secondary;
            return (
            <div
              key={suggestion.id}
              style={{
                ...compactItemStyle,
                ...(exitingIds.has(suggestion.id) ? exitingStyle : {}),
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 6,
                minWidth: 0,
                flex: 1,
              }}>
                <span style={{
                  fontSize: 13,
                  fontWeight: typography.fontWeight.semibold,
                  color: labelColor,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  lineHeight: '28px',
                  minHeight: 28,
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  {categoryLabel}
                </span>
                <span style={{
                  fontSize: 14,
                  color: textColor,
                  lineHeight: '28px',
                  minHeight: 28,
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  {suggestion.displayText}
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: spaceBetween.coupled,
                flexShrink: 0,
                minHeight: 28,
              }}>
                <IconButton
                  icon={<Ban size={14} />}
                  label="Dismiss"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDismiss(suggestion.id)}
                  style={{ color: isDark ? 'rgba(255,255,255,0.5)' : colors.fg.neutral.spotReadable }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAccept(suggestion.id)}
                  style={isDark
                    ? { backgroundColor: colors.fg.positive.secondary, color: '#fff', borderRadius: 4, height: 28, padding: '0 10px' }
                    : { color: colors.fg.positive.secondary, height: 28, padding: '0 10px' }
                  }
                >
                  Add
                </Button>
              </div>
            </div>
            );
          })}

          {/* More indicator */}
          {showHeader && !expanded && hiddenCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(true)}
              style={{
                alignSelf: 'flex-start',
                color: colors.fg.neutral.spotReadable,
              }}
            >
              Show {hiddenCount} more
            </Button>
          )}

          {/* Collapse button */}
          {showHeader && expanded && hiddenCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(false)}
              style={{
                alignSelf: 'flex-start',
                color: colors.fg.neutral.spotReadable,
              }}
            >
              Show less
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

SuggestionList.displayName = 'SuggestionList';
