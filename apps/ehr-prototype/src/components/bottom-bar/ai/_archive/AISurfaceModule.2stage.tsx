// @ts-nocheck
/**
 * ============================================================================
 * ARCHIVED: 2-Stage Animation Approach (Feb 2026)
 * ============================================================================
 *
 * This implementation attempted a 2-stage animation with a state machine:
 * - Animation stages: stable, expanding-width, expanding-height, collapsing-height, collapsing-width
 * - CSS Grid columns coordinated with Framer Motion dimensions
 * - Content fade tied to animation stages
 *
 * ISSUES:
 * - CSS Grid and Framer Motion competed for control of dimensions
 * - Content clipping during transitions
 * - Complex state machine was brittle and hard to debug
 *
 * REPLACED BY: Simplified approach using CSS Grid transitions only.
 * See: /docs/features/bottom-bar-system/LAYOUT_SPEC.md for requirements.
 * ============================================================================
 */

/**
 * AISurfaceModule Component (ARCHIVED)
 *
 * Orchestrates rendering the correct AI view based on tier state.
 * Implements 2-stage animation for smooth transitions:
 *
 * EXPAND (minibar → palette):
 *   Stage 1: Width expands (320→432), content fades
 *   Stage 2: Height expands (48→auto), new content fades in
 *
 * COLLAPSE (palette → minibar):
 *   Stage 1: Height collapses (auto→48), content fades
 *   Stage 2: Width collapses (432→320), new content fades in
 *
 * Per spec (AI_CONTROL_SURFACE_V2.md):
 * - NO alerts (those go to dedicated alert system)
 * - Context targeting header at top
 * - Single suggestion display (not list with headers)
 * - Glassmorphic translucent background
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Sparkles,
  FileText,
  Zap,
  X,
  CornerDownRight,
  Lightbulb,
  ChevronRight,
} from 'lucide-react';

import { MiniAnchor } from '../MiniAnchor';
import { DragHandle } from '../DragHandle';
import { AIMinibar } from '../../ai-ui/AIMinibar';
import { AIInputArea } from '../../ai-ui/AIInputArea';
import type { AIMinibarContent, AIMinibarProps } from '../../ai-ui/AIMinibar';
import type { TierState } from '../../../state/bottomBar/types';
import type { AIAnimationStage } from '../BottomBarContainer';
import {
  colors,
  borderRadius,
  spaceAround,
  spaceBetween,
  typography,
  glass,
} from '../../../styles/foundations';
import type { Suggestion, Alert } from '../../../types/suggestions';

// ============================================================================
// Types
// ============================================================================

export type ContextTargetType =
  | 'encounter'
  | 'patient'
  | 'section'
  | 'item'
  | 'cohort'
  | 'global';

export interface ContextTarget {
  type: ContextTargetType;
  label: string;
  id?: string;
}

export interface AISurfaceModuleProps {
  /** Current tier state */
  tier: TierState;
  /** Content for the minibar/bar view */
  content: AIMinibarContent;
  /** Called to switch to a different tier */
  onTierChange: (tier: TierState) => void;
  /** Current animation stage from parent */
  animationStage?: AIAnimationStage;
  /** Called to update animation stage */
  onAnimationStageChange?: (stage: AIAnimationStage) => void;
  /** Patient name for context header */
  patientName?: string;
  /** Context target for scoped AI assistance */
  contextTarget?: ContextTarget;
  /** Active suggestions */
  suggestions?: Suggestion[];
  /** Active alerts - NOTE: Alerts go to dedicated system, not palette */
  alerts?: Alert[];
  /** Called when a suggestion is accepted */
  onSuggestionAccept?: (id: string) => void;
  /** Called when a suggestion is dismissed */
  onSuggestionDismiss?: (id: string) => void;
  /** Called when an alert is acknowledged - NOTE: Alerts handled separately */
  onAlertAcknowledge?: (id: string) => void;
  /** Called when context is cleared (X button in header) */
  onClearContext?: () => void;
  /** Called when generate note is clicked */
  onGenerateNote?: () => void;
  /** Called when check interactions is clicked */
  onCheckInteractions?: () => void;
  /** Called when a suggestion in minibar is clicked */
  onSuggestionClick?: (id: string) => void;
  /** Called when a care gap in minibar is clicked */
  onCareGapClick?: (id: string) => void;
  /** Count badge for mini anchor */
  badgeCount?: number;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID prefix */
  testID?: string;
}

// ============================================================================
// Context Target Header Component
// ============================================================================

interface ContextTargetHeaderProps {
  /** Patient name to display */
  patientName: string;
  /** Optional context target */
  target?: ContextTarget;
  /** Called when X is clicked - clears context only, does NOT dismiss palette */
  onClearContext?: () => void;
}

const ContextTargetHeader: React.FC<ContextTargetHeaderProps> = ({
  patientName,
  target,
  onClearContext,
}) => {
  // Transparent background - no backgroundColor
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    // Less top padding, more bottom padding for visual balance
    padding: `${spaceAround.nudge4}px ${spaceAround.compact}px ${spaceAround.compact}px`,
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    // NO background color - transparent
  };

  const iconStyle: React.CSSProperties = {
    color: 'rgba(255, 255, 255, 0.5)',
    flexShrink: 0,
  };

  const labelStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    fontSize: 13,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.inversePrimary,
  };

  const contextStyle: React.CSSProperties = {
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: typography.fontWeight.regular,
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    border: 'none',
    backgroundColor: 'transparent',
    color: 'rgba(255, 255, 255, 0.6)',
    cursor: 'pointer',
    transition: 'all 150ms ease',
  };

  return (
    <div style={headerStyle}>
      {/* Angled arrow icon (↳) */}
      <CornerDownRight size={14} style={iconStyle} />

      {/* Patient name + context label */}
      <span style={labelStyle}>
        <span>{patientName}</span>
        {target?.label && (
          <span style={contextStyle}> · {target.label}</span>
        )}
      </span>

      {/* X clears context only (doesn't dismiss palette) */}
      {onClearContext && (
        <button
          type="button"
          onClick={onClearContext}
          title="Clear context"
          style={buttonStyle}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            (e.currentTarget as HTMLElement).style.color = 'rgba(255, 255, 255, 0.9)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'rgba(255, 255, 255, 0.6)';
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

// ============================================================================
// Quick Action Chips
// ============================================================================

interface QuickActionProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ label, icon, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spaceBetween.coupled,
        padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
        backgroundColor: isHovered
          ? 'rgba(255, 255, 255, 0.15)'
          : 'rgba(255, 255, 255, 0.08)',
        borderRadius: borderRadius.md,
        border: 'none',
        cursor: 'pointer',
        color: colors.fg.neutral.inversePrimary,
        fontSize: 13,
        fontWeight: typography.fontWeight.medium,
        transition: 'all 150ms ease',
      }}
    >
      {icon}
      {label}
    </button>
  );
};

// ============================================================================
// Single Suggestion Row Component
// ============================================================================

interface SuggestionRowProps {
  suggestion: Suggestion;
  /** Override display label (e.g., actionLabel for definitive labels) */
  label?: string;
  totalCount?: number;
  onAccept: (id: string) => void;
  onDismiss: (id: string) => void;
  onViewMore?: () => void;
}

const SuggestionRow: React.FC<SuggestionRowProps> = ({
  suggestion,
  label,
  totalCount = 1,
  onAccept,
  onDismiss,
  onViewMore,
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: spaceAround.compact,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: borderRadius.md,
    border: '1px solid rgba(255, 255, 255, 0.08)',
  };

  const iconStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: `${colors.fg.generative.spotReadable}20`,
    color: colors.fg.generative.spotReadable,
    flexShrink: 0,
  };

  const textStyle: React.CSSProperties = {
    flex: 1,
    fontSize: 13,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.inversePrimary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const actionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    flexShrink: 0,
  };

  const buttonStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: typography.fontWeight.medium,
    border: 'none',
    borderRadius: borderRadius.sm,
    padding: '4px 10px',
    cursor: 'pointer',
    transition: 'all 150ms ease',
  };

  // Use provided label or fallback to displayText
  const displayLabel = label || suggestion.displayText;

  return (
    <div style={containerStyle}>
      <span style={iconStyle}>
        <Lightbulb size={14} />
      </span>
      <span style={textStyle}>{displayLabel}</span>
      <div style={actionStyle}>
        <button
          type="button"
          onClick={() => onAccept(suggestion.id)}
          style={{
            ...buttonStyle,
            backgroundColor: colors.fg.positive.secondary,
            color: colors.fg.neutral.inversePrimary,
          }}
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => onDismiss(suggestion.id)}
          style={{
            ...buttonStyle,
            backgroundColor: 'transparent',
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          Dismiss
        </button>
        {totalCount > 1 && (
          <button
            type="button"
            onClick={onViewMore}
            style={{
              ...buttonStyle,
              backgroundColor: 'transparent',
              color: 'rgba(255, 255, 255, 0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            +{totalCount - 1}
            <ChevronRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// AI Palette Component (Inline)
// ============================================================================

interface AIPaletteInlineProps {
  /** Patient name for context header */
  patientName?: string;
  suggestions?: Suggestion[];
  contextTarget?: ContextTarget;
  /** Current animation stage from parent */
  animationStage: AIAnimationStage;
  /** Called to update animation stage */
  onAnimationStageChange: (stage: AIAnimationStage) => void;
  /** Called when collapse completes (tier change to bar) */
  onCollapse: () => void;
  /** Called when expand completes (tier change to palette) */
  onExpandComplete?: () => void;
  onOpenDrawer: () => void;
  onSuggestionAccept?: (id: string) => void;
  onSuggestionDismiss?: (id: string) => void;
  onGenerateNote?: () => void;
  onCheckInteractions?: () => void;
  /** Called when X in header is clicked - clears context only */
  onClearContext?: () => void;
  onSendMessage?: (message: string) => void;
}

// Action suggestion types that get a section header
const ACTION_TYPES = ['chart-item', 'care-gap-action'] as const;

// Animation constants - coordinate with BottomBarContainer WIDTHS
const BAR_HEIGHT = 48;
const BAR_WIDTH = 320; // Target width when collapsing to bar tier
const EXPANDED_WIDTH = 432; // Width when palette is open

// Animation timing
const STAGE_1_DURATION = 0.15; // Width animations (150ms)
const STAGE_2_DURATION = 0.2;  // Height animations (200ms)
const CONTENT_FADE_DURATION = 0.1; // Content fade (100ms)

const AIPaletteInline: React.FC<AIPaletteInlineProps> = ({
  patientName = 'Patient',
  suggestions = [],
  contextTarget,
  animationStage,
  onAnimationStageChange,
  onCollapse,
  onExpandComplete,
  onOpenDrawer,
  onSuggestionAccept,
  onSuggestionDismiss,
  onGenerateNote,
  onCheckInteractions,
  onClearContext,
  onSendMessage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter and group suggestions
  const activeSuggestions = suggestions.filter((s) => s.status === 'active');
  const actionSuggestions = activeSuggestions.filter((s) =>
    ACTION_TYPES.includes(s.type as typeof ACTION_TYPES[number])
  );
  const otherSuggestions = activeSuggestions.filter(
    (s) => !ACTION_TYPES.includes(s.type as typeof ACTION_TYPES[number])
  );

  // Trigger collapse: start height collapse (Stage 1 of collapse)
  const handleCollapse = useCallback(() => {
    onAnimationStageChange('collapsing-height');
  }, [onAnimationStageChange]);

  // Get animate props based on animation stage
  const getAnimateProps = () => {
    switch (animationStage) {
      case 'expanding-width':
        // Stage 1 of expand: width expands, height stays small
        return { width: EXPANDED_WIDTH, height: BAR_HEIGHT };
      case 'expanding-height':
        // Stage 2 of expand: height expands
        return { width: EXPANDED_WIDTH, height: 'auto' };
      case 'collapsing-height':
        // Stage 1 of collapse: height collapses, width stays expanded
        return { width: EXPANDED_WIDTH, height: BAR_HEIGHT };
      case 'collapsing-width':
        // Stage 2 of collapse: width collapses
        return { width: BAR_WIDTH, height: BAR_HEIGHT };
      case 'stable':
      default:
        // Stable state: fully expanded
        return { width: EXPANDED_WIDTH, height: 'auto' };
    }
  };

  // Get border radius based on stage
  const getBorderRadius = () => {
    // Fully collapsed (minibar shape) only at end of width collapse
    if (animationStage === 'collapsing-width') {
      return borderRadius.full;
    }
    // During height collapse, start rounding
    if (animationStage === 'collapsing-height') {
      return borderRadius.lg;
    }
    return borderRadius.lg;
  };

  // Get transition timing based on what's animating
  const getTransitionDuration = () => {
    if (animationStage === 'expanding-width' || animationStage === 'collapsing-width') {
      return STAGE_1_DURATION;
    }
    return STAGE_2_DURATION;
  };

  // Content visible during stable and ALL expand stages, hidden during collapse
  const isContentVisible = animationStage === 'stable' || animationStage === 'expanding-width' || animationStage === 'expanding-height';

  // Handle animation complete - progress to next stage
  const handleAnimationComplete = useCallback(() => {
    switch (animationStage) {
      case 'expanding-width':
        // Width done → start height expand
        onAnimationStageChange('expanding-height');
        break;
      case 'expanding-height':
        // Height done → stable, tier change to palette
        onAnimationStageChange('stable');
        onExpandComplete?.();
        break;
      case 'collapsing-height':
        // Height done → start width collapse
        onAnimationStageChange('collapsing-width');
        break;
      case 'collapsing-width':
        // Width done → tier change to bar
        onCollapse();
        break;
    }
  }, [animationStage, onAnimationStageChange, onCollapse, onExpandComplete]);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    ...glass.glassDark,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  };

  const contentStyle: React.CSSProperties = {
    overflow: 'auto',
    padding: spaceAround.default,
    display: 'flex',
    flexDirection: 'column',
    gap: spaceAround.compact,
  };

  const sectionHeaderStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: spaceAround.tight,
  };

  const animateProps = getAnimateProps();

  return (
    <motion.div
      ref={containerRef}
      initial={false}
      animate={{
        ...animateProps,
        borderRadius: getBorderRadius(),
      }}
      transition={{
        duration: getTransitionDuration(),
        ease: [0.4, 0, 0.2, 1], // Material ease-out
      }}
      onAnimationComplete={handleAnimationComplete}
      style={{
        ...containerStyle,
        overflow: 'hidden',
      }}
    >
      {/* Content wrapper - fades only during collapse stages */}
      <motion.div
        initial={false}
        animate={{
          opacity: (animationStage === 'collapsing-height' || animationStage === 'collapsing-width') ? 0 : 1
        }}
        transition={{ duration: CONTENT_FADE_DURATION, ease: 'easeOut' }}
      >
        {/* DragHandle - collapse trigger */}
        <DragHandle onCollapse={handleCollapse} variant="dark" />

        {/* Context Target Header - transparent background */}
        <ContextTargetHeader
          patientName={patientName}
          target={contextTarget}
          onClearContext={onClearContext}
        />

        {/* Content */}
        <div style={contentStyle}>
        {/* Suggested Actions (with section header) */}
        {actionSuggestions.length > 0 && onSuggestionAccept && onSuggestionDismiss && (
          <div>
            <div style={sectionHeaderStyle}>Suggested Actions</div>
            {actionSuggestions.slice(0, 3).map((suggestion) => (
              <SuggestionRow
                key={suggestion.id}
                suggestion={suggestion}
                // Use actionLabel for definitive label, fallback to displayText
                label={suggestion.actionLabel || suggestion.displayText}
                onAccept={onSuggestionAccept}
                onDismiss={onSuggestionDismiss}
              />
            ))}
          </div>
        )}

        {/* Other suggestions (no header, single row with +N indicator) */}
        {otherSuggestions.length > 0 && onSuggestionAccept && onSuggestionDismiss && (
          <SuggestionRow
            suggestion={otherSuggestions[0]}
            totalCount={otherSuggestions.length}
            onAccept={onSuggestionAccept}
            onDismiss={onSuggestionDismiss}
            onViewMore={onOpenDrawer}
          />
        )}

        {/* Quick Actions (only when no suggestions) */}
        {activeSuggestions.length === 0 && (onGenerateNote || onCheckInteractions) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spaceBetween.coupled }}>
            {onGenerateNote && (
              <QuickAction
                label="Generate Note"
                icon={<FileText size={14} />}
                onClick={onGenerateNote}
              />
            )}
            {onCheckInteractions && (
              <QuickAction
                label="Check Interactions"
                icon={<Zap size={14} />}
                onClick={onCheckInteractions}
              />
            )}
          </div>
        )}

        {/* Empty state */}
        {activeSuggestions.length === 0 && !onGenerateNote && !onCheckInteractions && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: spaceAround.default,
              textAlign: 'center',
            }}
          >
            <Sparkles
              size={32}
              style={{ color: 'rgba(255, 255, 255, 0.2)', marginBottom: 12 }}
            />
            <p style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.5)' }}>
              AI assistance available
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.3)' }}>
              Ask a question or wait for suggestions
            </p>
          </div>
        )}
      </div>

        {/* Input Area */}
        <AIInputArea
          placeholder="Ask AI…"
          onSend={onSendMessage}
          onOpenDrawer={onOpenDrawer}
          showDrawerButton={true}
          maxHeight={120}
        />
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// Component
// ============================================================================

export const AISurfaceModule: React.FC<AISurfaceModuleProps> = ({
  tier,
  content,
  onTierChange,
  animationStage = 'stable',
  onAnimationStageChange,
  patientName = 'Patient',
  contextTarget,
  suggestions = [],
  alerts = [],
  onSuggestionAccept,
  onSuggestionDismiss,
  onAlertAcknowledge,
  onClearContext,
  onGenerateNote,
  onCheckInteractions,
  onSuggestionClick,
  onCareGapClick,
  badgeCount,
  style,
  testID = 'ai-surface-module',
}) => {
  // Handle animation stage changes
  const handleAnimationStageChange = useCallback((stage: AIAnimationStage) => {
    onAnimationStageChange?.(stage);
  }, [onAnimationStageChange]);

  // Handle expand from minibar - start width expansion (Stage 1)
  const handleExpandFromBar = useCallback(() => {
    handleAnimationStageChange('expanding-width');
    // Tier change happens after animation completes
  }, [handleAnimationStageChange]);

  // Determine badge for mini anchor
  const getBadgeType = () => {
    const unackedAlerts = alerts.filter((a) => !a.acknowledgedAt);
    if (unackedAlerts.some((a) => a.severity === 'critical')) return 'dot' as const;
    if (badgeCount && badgeCount > 0) return 'count' as const;
    return 'none' as const;
  };

  // Determine what to render based on tier and animation stage
  // During expansion, we show palette even though tier is still 'bar'
  const isExpanding = animationStage === 'expanding-width' || animationStage === 'expanding-height';
  const isCollapsing = animationStage === 'collapsing-height' || animationStage === 'collapsing-width';
  const showPalette = tier === 'palette' || tier === 'drawer' || isExpanding || isCollapsing;

  const renderContent = () => {
    // Mini anchor - clicking expands directly to palette
    if (tier === 'mini' && !showPalette) {
      return (
        <MiniAnchor
          icon={<Sparkles size={20} />}
          label="Expand AI assistant"
          badge={getBadgeType()}
          badgeCount={badgeCount}
          badgeColor={
            alerts.some((a) => !a.acknowledgedAt && a.severity === 'critical')
              ? colors.fg.alert.secondary
              : undefined
          }
          variant="dark"
          onClick={() => onTierChange('palette')}
          testID={`${testID}-mini`}
        />
      );
    }

    // Minibar - clicking starts 2-stage expand animation
    if (tier === 'bar' && !showPalette) {
      return (
        <AIMinibar
          content={content}
          isPaletteOpen={false}
          onExpandPalette={handleExpandFromBar}
          onExpandDrawer={() => onTierChange('drawer')}
          onSuggestionClick={onSuggestionClick}
          onCareGapClick={onCareGapClick}
          animationStage={animationStage}
          testID={`${testID}-bar`}
        />
      );
    }

    // Palette (or during expand/collapse animations)
    if (showPalette) {
      return (
        <AIPaletteInline
          patientName={patientName}
          contextTarget={contextTarget}
          suggestions={suggestions}
          animationStage={animationStage}
          onAnimationStageChange={handleAnimationStageChange}
          onCollapse={() => onTierChange('bar')}
          onExpandComplete={() => onTierChange('palette')}
          onOpenDrawer={() => onTierChange('drawer')}
          onSuggestionAccept={onSuggestionAccept}
          onSuggestionDismiss={onSuggestionDismiss}
          onClearContext={onClearContext}
          onGenerateNote={onGenerateNote}
          onCheckInteractions={onCheckInteractions}
        />
      );
    }

    return null;
  };

  // Use a stable key during animations to prevent AnimatePresence from
  // unmounting the component during 2-stage transitions
  const contentKey = showPalette ? 'palette' : tier;

  return (
    <div
      style={{
        position: 'relative',
        ...style,
      }}
      data-testid={testID}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={contentKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{}}
          transition={{ duration: 0.15 }}
          style={{ width: '100%' }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

AISurfaceModule.displayName = 'AISurfaceModule';

export default AISurfaceModule;
