/**
 * SuggestionList Component
 *
 * List container for multiple suggestions with animation and batch actions.
 */

import React from 'react';
import type { Suggestion } from '../../types/suggestions';
import { colors, spacing, typography, radii, transitions } from '../../styles/tokens';
import { SuggestionChip } from './SuggestionChip';
import { Button } from '../primitives/Button';

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
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Icons
// ============================================================================

const XIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SparklesIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
    <circle cx="12" cy="12" r="4" />
  </svg>
);

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
  style,
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const [exitingIds, setExitingIds] = React.useState<Set<string>>(new Set());

  // Filter active suggestions
  const activeSuggestions = suggestions.filter(s => s.status === 'active');
  const visibleSuggestions = expanded
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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing[4],
        color: colors.neutral[400],
        fontSize: typography.fontSize.sm[0],
        ...style,
      }}>
        <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2],
        }}>
          <span style={{ width: '16px', height: '16px', display: 'flex' }}>
            <SparklesIcon />
          </span>
          No suggestions
        </span>
      </div>
    );
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[2],
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  };

  const titleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    fontSize: typography.fontSize.sm[0],
    fontWeight: typography.fontWeight.medium,
    color: colors.ai.suggestion,
  };

  const chipsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing[2],
  };

  const compactListStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[1],
  };

  const compactItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing[2]} ${spacing[3]}`,
    backgroundColor: colors.ai.suggestionLight,
    borderRadius: radii.md,
    fontSize: typography.fontSize.sm[0],
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
    padding: `${spacing[1.5]} ${spacing[3]}`,
    backgroundColor: colors.neutral[100],
    borderRadius: radii.full,
    fontSize: typography.fontSize.xs[0],
    color: colors.neutral[600],
    cursor: 'pointer',
    transition: `all ${transitions.fast}`,
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleStyle}>
          <span style={{ width: '16px', height: '16px', display: 'flex' }}>
            <SparklesIcon />
          </span>
          {activeSuggestions.length} suggestion{activeSuggestions.length !== 1 ? 's' : ''}
        </div>
        {onClearAll && activeSuggestions.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            style={{ color: colors.neutral[500] }}
          >
            Clear all
          </Button>
        )}
      </div>

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
          {!expanded && hiddenCount > 0 && (
            <div
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
          {expanded && hiddenCount > 0 && (
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
          {visibleSuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              style={{
                ...compactItemStyle,
                ...(exitingIds.has(suggestion.id) ? exitingStyle : {}),
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                minWidth: 0,
                flex: 1,
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: radii.full,
                  backgroundColor: colors.ai.suggestion,
                  flexShrink: 0,
                }} />
                <span style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: colors.neutral[700],
                }}>
                  {suggestion.displayText}
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[1],
                flexShrink: 0,
              }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAccept(suggestion.id)}
                  style={{ color: colors.status.success }}
                >
                  Accept
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDismiss(suggestion.id)}
                  style={{ color: colors.neutral[500] }}
                >
                  <span style={{ width: '14px', height: '14px', display: 'flex' }}>
                    <XIcon />
                  </span>
                </Button>
              </div>
            </div>
          ))}

          {/* More indicator */}
          {!expanded && hiddenCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(true)}
              style={{
                alignSelf: 'flex-start',
                color: colors.neutral[500],
              }}
            >
              Show {hiddenCount} more
            </Button>
          )}

          {/* Collapse button */}
          {expanded && hiddenCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(false)}
              style={{
                alignSelf: 'flex-start',
                color: colors.neutral[500],
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
