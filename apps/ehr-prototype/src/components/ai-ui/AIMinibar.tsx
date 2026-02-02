/**
 * AIMinibar Component
 *
 * Tri-state AI hub component that displays contextual AI content.
 * States: collapsed (minibar), expanded (palette), full (drawer).
 *
 * Content types in priority order:
 * 1. error - Sync/system errors
 * 2. loading - AI processing/thinking
 * 3. todo-context - To-Do navigation context
 * 4. suggestion - AI suggestions/nudges
 * 5. care-gap - Care gap alerts
 * 6. idle - Default prompt state
 */

import React, { useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Loader2,
  Lightbulb,
  Sparkles,
  Heart,
  List,
} from 'lucide-react';
import { colors, spaceAround, spaceBetween, borderRadius, typography, shadows, transitions } from '../../styles/foundations';
import { Spinner } from '../primitives/Spinner';

// ============================================================================
// Types
// ============================================================================

export type AIMinibarContentType =
  | 'error'
  | 'loading'
  | 'todo-context'
  | 'suggestion'
  | 'care-gap'
  | 'idle';

export interface ToDoContextContent {
  type: 'todo-context';
  /** Current filter label (e.g., "Chart Review") */
  filterLabel: string;
  /** Remaining items count */
  remainingCount: number;
  /** Whether there's a previous item */
  hasPrev?: boolean;
  /** Whether there's a next item */
  hasNext?: boolean;
  /** Called when prev is clicked */
  onPrev?: () => void;
  /** Called when next is clicked */
  onNext?: () => void;
}

export interface SuggestionContent {
  type: 'suggestion';
  /** Suggestion text */
  text: string;
  /** Suggestion ID */
  id: string;
}

export interface CareGapContent {
  type: 'care-gap';
  /** Care gap description */
  text: string;
  /** Care gap ID */
  id: string;
}

export interface ErrorContent {
  type: 'error';
  /** Error message */
  message: string;
}

export interface LoadingContent {
  type: 'loading';
  /** Loading message */
  message?: string;
}

export interface IdleContent {
  type: 'idle';
}

export type AIMinibarContent =
  | ToDoContextContent
  | SuggestionContent
  | CareGapContent
  | ErrorContent
  | LoadingContent
  | IdleContent;

export interface AIMinibarProps {
  /** Content to display */
  content: AIMinibarContent;
  /** Whether palette is currently open */
  isPaletteOpen?: boolean;
  /** Called when expand to palette is clicked */
  onExpandPalette: () => void;
  /** Called when expand to drawer is clicked */
  onExpandDrawer?: () => void;
  /** Called when a suggestion is clicked */
  onSuggestionClick?: (id: string) => void;
  /** Called when a care gap is clicked */
  onCareGapClick?: (id: string) => void;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Subcomponents
// ============================================================================

const ContentIcon: React.FC<{ type: AIMinibarContentType }> = ({ type }) => {
  switch (type) {
    case 'error':
      return <AlertTriangle size={16} />;
    case 'loading':
      return <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />;
    case 'todo-context':
      return <List size={16} />;
    case 'suggestion':
      return <Lightbulb size={16} />;
    case 'care-gap':
      return <Heart size={16} />;
    case 'idle':
    default:
      return <Sparkles size={16} />;
  }
};

const getContentColor = (type: AIMinibarContentType): string => {
  switch (type) {
    case 'error':
      return colors.fg.alert.secondary;
    case 'loading':
      return colors.fg.information.secondary;
    case 'todo-context':
      return colors.fg.accent.primary;
    case 'suggestion':
      return colors.fg.generative.spotReadable;
    case 'care-gap':
      return colors.fg.attention.secondary;
    case 'idle':
    default:
      return colors.fg.generative.spotReadable;
  }
};

// ============================================================================
// Component
// ============================================================================

export const AIMinibar: React.FC<AIMinibarProps> = ({
  content,
  isPaletteOpen = false,
  onExpandPalette,
  onExpandDrawer,
  onSuggestionClick,
  onCareGapClick,
  style,
  testID,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const contentColor = getContentColor(content.type);

  // Render content text based on type
  const renderContentText = () => {
    switch (content.type) {
      case 'error':
        return (content as ErrorContent).message;

      case 'loading':
        return (content as LoadingContent).message || 'Thinking...';

      case 'todo-context': {
        const ctx = content as ToDoContextContent;
        return `${ctx.filterLabel} (${ctx.remainingCount})`;
      }

      case 'suggestion':
        return (content as SuggestionContent).text;

      case 'care-gap':
        return (content as CareGapContent).text;

      case 'idle':
      default:
        return 'Ask AI for help...';
    }
  };

  // Handle content click
  const handleContentClick = () => {
    switch (content.type) {
      case 'suggestion':
        onSuggestionClick?.((content as SuggestionContent).id);
        break;
      case 'care-gap':
        onCareGapClick?.((content as CareGapContent).id);
        break;
      default:
        onExpandPalette();
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.nudge6}px ${spaceAround.compact}px`,
    backgroundColor: colors.fg.neutral.primary,
    borderRadius: borderRadius.lg,
    boxShadow: shadows.lg,
    minWidth: 200,
    maxWidth: 500,
    transition: `all 200ms cubic-bezier(0.4, 0, 0.2, 1)`,
    transform: isHovered ? 'scale(1.01)' : 'scale(1)',
    ...style,
  };

  const iconContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: `${contentColor}20`,
    color: contentColor,
    flexShrink: 0,
  };

  const contentContainerStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    cursor: 'pointer',
    padding: `${spaceAround.nudge4}px 0`,
    overflow: 'hidden',
  };

  const textStyle: React.CSSProperties = {
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.inversePrimary,
    flex: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const dividerStyle: React.CSSProperties = {
    width: 1,
    height: 20,
    backgroundColor: colors.fg.neutral.secondary,
    opacity: 0.3,
  };

  const navButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    border: 'none',
    backgroundColor: 'transparent',
    color: colors.fg.neutral.inversePrimary,
    cursor: 'pointer',
    opacity: 0.6,
    transition: `all 150ms cubic-bezier(0.4, 0, 0.2, 1)`,
  };

  const expandButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    border: 'none',
    backgroundColor: isHovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
    color: colors.fg.neutral.inversePrimary,
    cursor: 'pointer',
    opacity: isHovered ? 1 : 0.8,
    transition: `all 150ms cubic-bezier(0.4, 0, 0.2, 1)`,
  };

  // Special rendering for To-Do context with navigation
  if (content.type === 'todo-context') {
    const ctx = content as ToDoContextContent;

    return (
      <div
        style={containerStyle}
        data-testid={testID}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Prev button */}
        {ctx.hasPrev && (
          <button
            type="button"
            style={navButtonStyle}
            onClick={ctx.onPrev}
            title="Previous item"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = '1';
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.1)';
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = '0.6';
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            }}
          >
            <ChevronLeft size={16} />
          </button>
        )}

        {/* Content */}
        <div style={contentContainerStyle} onClick={handleContentClick}>
          <span style={iconContainerStyle}>
            <ContentIcon type={content.type} />
          </span>
          <span style={textStyle}>{renderContentText()}</span>
        </div>

        {/* Next button */}
        {ctx.hasNext && (
          <button
            type="button"
            style={navButtonStyle}
            onClick={ctx.onNext}
            title="Next item"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = '1';
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.1)';
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = '0.6';
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            }}
          >
            <ChevronRight size={16} />
          </button>
        )}

        {/* Expand button */}
        <div style={dividerStyle} />
        <button
          type="button"
          style={expandButtonStyle}
          onClick={onExpandPalette}
          title={isPaletteOpen ? 'Collapse' : 'Expand AI assistant'}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = '1';
            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.2)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = '0.8';
            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.05)';
          }}
        >
          {isPaletteOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>

        {/* CSS for spinner */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Standard content rendering
  return (
    <div
      style={containerStyle}
      data-testid={testID}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon */}
      <span style={iconContainerStyle}>
        <ContentIcon type={content.type} />
      </span>

      {/* Content */}
      <div style={contentContainerStyle} onClick={handleContentClick}>
        <span style={textStyle}>{renderContentText()}</span>
      </div>

      {/* Expand button */}
      <button
        type="button"
        style={expandButtonStyle}
        onClick={onExpandPalette}
        title={isPaletteOpen ? 'Collapse' : 'Expand AI assistant'}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = '1';
          (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.2)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = '0.8';
          (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.05)';
        }}
      >
        {isPaletteOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </button>

      {/* CSS for spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

AIMinibar.displayName = 'AIMinibar';
