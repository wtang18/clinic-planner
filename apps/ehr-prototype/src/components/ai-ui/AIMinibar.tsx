/**
 * AIMinibar Component
 *
 * Tri-state AI hub component that displays contextual AI content.
 * States: collapsed (minibar), expanded (palette), full (drawer).
 *
 * Content types in priority order:
 * 1. error - Sync/system errors
 * 2. loading - AI processing/thinking
 * 3. recording-complete - Post-recording action
 * 4. todo-context - To-Do navigation context
 * 5. suggestion - AI suggestions/nudges
 * 6. care-gap - Care gap alerts
 * 7. idle - Default prompt state
 *
 * Features glassmorphic dark styling and concentric action pill slot.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  FileText,
  ArrowRight,
} from 'lucide-react';
import { colors, spaceAround, spaceBetween, borderRadius, typography, shadows, transitions, glass } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export type AIMinibarContentType =
  | 'error'
  | 'loading'
  | 'recording-complete'
  | 'paused-prompt'
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

export interface RecordingCompleteContent {
  type: 'recording-complete';
  /** Recording duration in seconds */
  duration: number;
  /** Action label */
  actionLabel?: string;
  /** Called when action is clicked */
  onAction?: () => void;
}

export interface PausedPromptContent {
  type: 'paused-prompt';
  /** Prompt message (e.g., "Recording paused") */
  message: string;
  /** Action label (e.g., "Summarize now") */
  actionLabel: string;
  /** Called when action is clicked */
  onAction?: () => void;
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
  | RecordingCompleteContent
  | PausedPromptContent
  | IdleContent;

export interface ActionPill {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

/** Animation stage type (imported from BottomBarContainer) */
export type AIAnimationStageForMinibar =
  | 'stable'
  | 'expanding-width'
  | 'expanding-height'
  | 'collapsing-height'
  | 'collapsing-width';

export interface AIMinibarProps {
  /** Content to display */
  content: AIMinibarContent;
  /** Whether palette is currently open */
  isPaletteOpen?: boolean;
  /** Action pill (appears on right edge when AI/context triggered) */
  actionPill?: ActionPill;
  /** Called when expand to palette is clicked */
  onExpandPalette: () => void;
  /** Called when expand to drawer is clicked */
  onExpandDrawer?: () => void;
  /** Called when a suggestion is clicked */
  onSuggestionClick?: (id: string) => void;
  /** Called when a care gap is clicked */
  onCareGapClick?: (id: string) => void;
  /** Current animation stage - minibar fades out during expanding-width */
  animationStage?: AIAnimationStageForMinibar;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    case 'recording-complete':
      return <FileText size={16} />;
    case 'paused-prompt':
      return <FileText size={16} />;
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
    case 'recording-complete':
      return colors.fg.positive.secondary;
    case 'paused-prompt':
      return colors.fg.attention.secondary;
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
// Action Pill Component
// ============================================================================

interface ActionPillButtonProps {
  pill: ActionPill;
}

const ActionPillButton: React.FC<ActionPillButtonProps> = ({ pill }) => {
  const [isHovered, setIsHovered] = useState(false);

  const pillStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    backgroundColor: isHovered
      ? colors.fg.accent.primary
      : 'rgba(255, 255, 255, 0.12)',
    borderRadius: borderRadius.md,
    border: 'none',
    cursor: 'pointer',
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.inversePrimary,
    transition: `all 150ms cubic-bezier(0.4, 0, 0.2, 1)`,
    whiteSpace: 'nowrap',
  };

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, scale: 0.9, x: 10 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: 10 }}
      transition={{ duration: 0.2 }}
      style={pillStyle}
      onClick={pill.onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={pill.label}
    >
      {pill.label}
      {pill.icon || <ArrowRight size={14} />}
    </motion.button>
  );
};

// ============================================================================
// Component
// ============================================================================

export const AIMinibar: React.FC<AIMinibarProps> = ({
  content,
  isPaletteOpen = false,
  actionPill,
  onExpandPalette,
  onExpandDrawer,
  onSuggestionClick,
  onCareGapClick,
  animationStage = 'stable',
  style,
  testID,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const contentColor = getContentColor(content.type);

  // Minibar content should fade out during expanding-width stage
  const shouldFadeOut = animationStage === 'expanding-width';

  // Render content text based on type
  const renderContentText = () => {
    switch (content.type) {
      case 'error':
        return (content as ErrorContent).message;

      case 'loading':
        return (content as LoadingContent).message || 'Thinking...';

      case 'recording-complete': {
        const ctx = content as RecordingCompleteContent;
        return `Recording complete (${formatDuration(ctx.duration)})`;
      }

      case 'paused-prompt': {
        const ctx = content as PausedPromptContent;
        return ctx.message;
      }

      case 'todo-context': {
        const ctx = content as ToDoContextContent;
        const remaining = ctx.remainingCount;
        return remaining > 0
          ? `${ctx.filterLabel} · ${remaining} more`
          : ctx.filterLabel;
      }

      case 'suggestion':
        return (content as SuggestionContent).text;

      case 'care-gap':
        return (content as CareGapContent).text;

      case 'idle':
      default:
        return 'Need help?';
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
      case 'recording-complete':
        (content as RecordingCompleteContent).onAction?.();
        break;
      case 'paused-prompt':
        (content as PausedPromptContent).onAction?.();
        break;
      default:
        onExpandPalette();
    }
  };

  // Derive action pill from recording-complete or paused-prompt content
  const derivedActionPill: ActionPill | undefined = (() => {
    if (content.type === 'recording-complete') {
      const ctx = content as RecordingCompleteContent;
      return {
        id: 'summarize',
        label: ctx.actionLabel || 'Summarize',
        onClick: ctx.onAction,
      };
    }
    if (content.type === 'paused-prompt') {
      const ctx = content as PausedPromptContent;
      return {
        id: 'summarize-paused',
        label: ctx.actionLabel,
        onClick: ctx.onAction,
      };
    }
    return actionPill;
  })();

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: `0 ${spaceAround.tight}px`, // Reduced padding (8px) for concentric fit
    ...glass.glassDark,
    borderRadius: borderRadius.full, // Pill shape to match spec
    boxShadow: shadows.lg,
    width: 320, // Coordinate with TranscriptionPill (160+8+320=488 total bottom bar width)
    height: 48, // Explicit height to match TranscriptionPill
    cursor: 'pointer', // Entire bar is tappable
    transition: `all 200ms cubic-bezier(0.4, 0, 0.2, 1)`,
    ...style,
  };

  // Concentric: 32px circles inside 48px pill (8px padding each side)
  const iconContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: borderRadius.full, // Circular, concentric with pill
    backgroundColor: `${contentColor}30`,
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

  // Concentric nav buttons (32px circles)
  const navButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: borderRadius.full, // Circular, concentric
    border: 'none',
    backgroundColor: 'transparent',
    color: colors.fg.neutral.inversePrimary,
    cursor: 'pointer',
    opacity: 0.6,
    transition: `all 150ms cubic-bezier(0.4, 0, 0.2, 1)`,
  };

  // Chevron indicator style (visual only, not a separate button)
  const chevronIndicatorStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    color: colors.fg.neutral.inversePrimary,
    opacity: isHovered ? 0.8 : 0.5,
    transition: `all 150ms cubic-bezier(0.4, 0, 0.2, 1)`,
    flexShrink: 0,
  };

  // Special rendering for To-Do context with navigation
  if (content.type === 'todo-context') {
    const ctx = content as ToDoContextContent;

    return (
      <motion.div
        layout
        initial={false}
        animate={{ opacity: shouldFadeOut ? 0 : 1 }}
        transition={{ duration: 0.1, ease: 'easeOut' }}
        style={containerStyle}
        data-testid={testID}
        onClick={onExpandPalette}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={isPaletteOpen ? 'Collapse' : 'Expand AI assistant'}
      >
        {/* Icon - no pointer events, clicks pass to container */}
        <span style={{ ...iconContainerStyle, pointerEvents: 'none' }}>
          <ContentIcon type={content.type} />
        </span>

        {/* Content - no pointer events, clicks pass to container */}
        <div style={{ ...contentContainerStyle, pointerEvents: 'none' }}>
          <span style={textStyle}>{renderContentText()}</span>
        </div>

        {/* Navigation arrows (contextual actions - these are buttons, need their own clicks) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button
            type="button"
            style={{
              ...navButtonStyle,
              opacity: ctx.hasPrev ? 0.6 : 0.2,
              cursor: ctx.hasPrev ? 'pointer' : 'not-allowed',
            }}
            onClick={(e) => { e.stopPropagation(); ctx.onPrev?.(); }}
            disabled={!ctx.hasPrev}
            title="Previous item"
            onMouseEnter={(e) => {
              if (ctx.hasPrev) {
                (e.currentTarget as HTMLElement).style.opacity = '1';
                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = ctx.hasPrev ? '0.6' : '0.2';
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            style={{
              ...navButtonStyle,
              opacity: ctx.hasNext ? 0.6 : 0.2,
              cursor: ctx.hasNext ? 'pointer' : 'not-allowed',
            }}
            onClick={(e) => { e.stopPropagation(); ctx.onNext?.(); }}
            disabled={!ctx.hasNext}
            title="Next item"
            onMouseEnter={(e) => {
              if (ctx.hasNext) {
                (e.currentTarget as HTMLElement).style.opacity = '1';
                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = ctx.hasNext ? '0.6' : '0.2';
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Chevron indicator (visual only) */}
        <span style={chevronIndicatorStyle}>
          {isPaletteOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </span>

        {/* CSS for spinner */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </motion.div>
    );
  }

  // Standard content rendering
  return (
    <motion.div
      layout
      initial={false}
      animate={{ opacity: shouldFadeOut ? 0 : 1 }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
      style={containerStyle}
      data-testid={testID}
      onClick={onExpandPalette}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={isPaletteOpen ? 'Collapse' : 'Expand AI assistant'}
    >
      {/* Icon - no pointer events, clicks pass to container */}
      <span style={{ ...iconContainerStyle, pointerEvents: 'none' }}>
        <ContentIcon type={content.type} />
      </span>

      {/* Content - pointerEvents none so clicks pass to container */}
      <div style={{ ...contentContainerStyle, pointerEvents: 'none' }}>
        <span style={textStyle}>{renderContentText()}</span>
      </div>

      {/* Action Pill (contextual actions - these are buttons, need their own clicks) */}
      <AnimatePresence>
        {derivedActionPill && (
          <div onClick={(e) => e.stopPropagation()} style={{ pointerEvents: 'auto' }}>
            <ActionPillButton pill={derivedActionPill} />
          </div>
        )}
      </AnimatePresence>

      {/* Chevron indicator (visual only, no pointer events) */}
      <span style={{ ...chevronIndicatorStyle, pointerEvents: 'none' }}>
        {isPaletteOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </span>

      {/* CSS for spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
};

AIMinibar.displayName = 'AIMinibar';
