/**
 * AISurfaceModule Component
 *
 * Single animated container that transitions between mini, bar, and palette states.
 * NO component swapping - one motion.div animates dimensions, content changes inside.
 *
 * CSS Grid drives horizontal sizing (width: 100%), framer-motion drives vertical:
 * - EXPAND: height animates 48→auto (grid handles width)
 * - COLLAPSE: height animates auto→48, then dispatches tier change
 * - Anchor (48×48 pill) keeps explicit 48px width in its 48px grid cell.
 *
 * See: /docs/features/bottom-bar-system/LAYOUT_SPEC.md
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  FileText,
  Zap,
  X,
  CornerDownRight,
  Lightbulb,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Check,
  Loader2,
  AlertTriangle,
  Heart,
  List,
} from 'lucide-react';

import { DragHandle } from '../DragHandle';
import { AIInputArea } from '../../ai-ui/AIInputArea';
import type { AIMinibarContent } from '../../ai-ui/AIMinibar';
import type { TierState } from '../../../state/bottomBar/types';
import {
  colors,
  borderRadius,
  spaceAround,
  spaceBetween,
  typography,
  glass,
  shadows,
} from '../../../styles/foundations';
import type { Suggestion, Alert } from '../../../types/suggestions';

// ============================================================================
// Constants
// ============================================================================

const MICRO_SIZE = 48;
const BAR_HEIGHT = 48;

const STAGE_DURATION = 0.2; // 200ms per stage

// ============================================================================
// Types
// ============================================================================

export type ContextTargetType = 'encounter' | 'patient' | 'section' | 'item' | 'cohort' | 'global';

export interface ContextTarget {
  type: ContextTargetType;
  label: string;
  id?: string;
}

/**
 * Animation Phases — CSS Grid handles width, framer-motion handles height only.
 */
type AnimationPhase =
  | 'idle-mini'             // Resting at anchor size (48×48)
  | 'idle-bar'              // Resting at bar size (width:100% × 48)
  | 'expanding-height'      // Height 48→auto (grid already allocated width)
  | 'idle-palette'          // Resting at palette size (width:100% × auto)
  | 'collapsing-height';    // Height auto→48

export interface AISurfaceModuleProps {
  tier: TierState;
  content: AIMinibarContent;
  onTierChange: (tier: TierState) => void;
  patientName?: string;
  contextTarget?: ContextTarget;
  /** Available context levels for switching */
  availableContextLevels?: ContextTargetType[];
  /** Called when user selects a different context level */
  onContextLevelChange?: (level: ContextTargetType) => void;
  suggestions?: Suggestion[];
  alerts?: Alert[];
  onSuggestionAccept?: (id: string) => void;
  onSuggestionDismiss?: (id: string) => void;
  onAlertAcknowledge?: (id: string) => void;
  onClearContext?: () => void;
  onGenerateNote?: () => void;
  onCheckInteractions?: () => void;
  onSuggestionClick?: (id: string) => void;
  onCareGapClick?: (id: string) => void;
  badgeCount?: number;
  style?: React.CSSProperties;
  testID?: string;
}

// ============================================================================
// Shared Icon Mapping (consistent across mini and minibar modes)
// ============================================================================

type ContentIconType = AIMinibarContent['type'];

const getContentIcon = (type: ContentIconType, size: number = 20) => {
  switch (type) {
    case 'error':
      return <AlertTriangle size={size} />;
    case 'loading':
      return <Loader2 size={size} style={{ animation: 'spin 1s linear infinite' }} />;
    case 'recording-complete':
    case 'paused-prompt':
      return <FileText size={size} />;
    case 'todo-context':
      return <List size={size} />;
    case 'suggestion':
      return <Lightbulb size={size} />;
    case 'care-gap':
      return <Heart size={size} />;
    case 'idle':
    default:
      return <Sparkles size={size} />;
  }
};

// ============================================================================
// Mini Content (shown when visually mini - 48×48)
// ============================================================================

interface MiniContentProps {
  content: AIMinibarContent;
  alerts: Alert[];
  badgeCount?: number;
  isVisible: boolean;
}

const MiniContent: React.FC<MiniContentProps> = ({ content, alerts, badgeCount, isVisible }) => {
  const unackedAlerts = alerts.filter((a) => !a.acknowledgedAt);
  const hasCriticalAlert = unackedAlerts.some((a) => a.severity === 'critical');
  const showCount = badgeCount && badgeCount > 0;

  return (
    <motion.div
      initial={false}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.1 }}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Icon container (32px centered in 48px) - uses content-appropriate icon */}
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          color: colors.fg.generative.spotReadable,
        }}
      >
        {getContentIcon(content.type, 20)}
      </span>

      {/* Critical alert badge (red dot) */}
      {hasCriticalAlert && (
        <span
          style={{
            position: 'absolute',
            top: 2,
            right: 2,
            width: 8,
            height: 8,
            backgroundColor: colors.fg.accent.primary,
            borderRadius: borderRadius.full,
            border: '2px solid rgba(20, 20, 20, 0.9)',
          }}
        />
      )}

      {/* Count badge */}
      {!hasCriticalAlert && showCount && (
        <span
          style={{
            position: 'absolute',
            top: 2,
            right: 2,
            minWidth: 18,
            height: 16,
            padding: '0 4px',
            backgroundColor: colors.fg.accent.primary,
            borderRadius: borderRadius.full,
            border: '2px solid rgba(20, 20, 20, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.fg.neutral.inversePrimary,
            fontSize: 10,
            fontFamily: typography.fontFamily.sans,
            fontWeight: typography.fontWeight.semibold,
            lineHeight: 1,
          }}
        >
          {badgeCount! > 99 ? '99+' : badgeCount}
        </span>
      )}
    </motion.div>
  );
};

// ============================================================================
// Minibar Content (shown when tier='bar' or during collapse)
// ============================================================================

interface MinibarContentProps {
  content: AIMinibarContent;
  onExpand: () => void;
  isVisible: boolean;
}

// ============================================================================
// Context Level Labels
// ============================================================================

const CONTEXT_LEVEL_LABELS: Record<ContextTargetType, string> = {
  item: 'Item',
  section: 'Section',
  encounter: 'Encounter',
  patient: 'Patient',
  cohort: 'Cohort',
  global: 'Global',
};

// ============================================================================
// Context Level Popover
// ============================================================================

interface ContextLevelPopoverProps {
  currentLevel?: ContextTargetType;
  availableLevels: ContextTargetType[];
  onSelect: (level: ContextTargetType) => void;
  anchorEl: HTMLButtonElement | null;
  open: boolean;
  onClose: () => void;
}

const ContextLevelPopover: React.FC<ContextLevelPopoverProps> = ({
  currentLevel,
  availableLevels,
  onSelect,
  anchorEl,
  open,
  onClose,
}) => {
  const popoverRef = React.useRef<HTMLDivElement>(null);

  // Close on click outside
  React.useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        anchorEl &&
        !anchorEl.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, anchorEl, onClose]);

  if (!open || !anchorEl) return null;

  // Position below anchor
  const rect = anchorEl.getBoundingClientRect();

  return (
    <motion.div
      ref={popoverRef}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'fixed',
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
        minWidth: 140,
        padding: spaceAround.nudge4,
        backgroundColor: 'rgba(30, 30, 30, 0.95)',
        backdropFilter: 'blur(12px)',
        borderRadius: borderRadius.md,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
        zIndex: 1000,
      }}
    >
      {availableLevels.map((level) => {
        const isActive = level === currentLevel;
        return (
          <button
            key={level}
            type="button"
            onClick={() => onSelect(level)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: `${spaceAround.nudge4}px ${spaceAround.tight}px`,
              backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              border: 'none',
              borderRadius: borderRadius.sm,
              color: isActive ? colors.fg.neutral.inversePrimary : 'rgba(255, 255, 255, 0.7)',
              fontSize: 13,
              fontFamily: typography.fontFamily.sans,
              fontWeight: isActive ? typography.fontWeight.medium : typography.fontWeight.regular,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            {CONTEXT_LEVEL_LABELS[level]}
            {isActive && <Check size={14} style={{ opacity: 0.7 }} />}
          </button>
        );
      })}
    </motion.div>
  );
};

// ============================================================================
// Minibar Content (shown when tier='bar' or during collapse)
// ============================================================================

const MinibarContent: React.FC<MinibarContentProps> = ({ content, onExpand, isVisible }) => {

  const getText = () => {
    switch (content.type) {
      case 'suggestion': return content.text;
      case 'loading': return content.message || 'Thinking...';
      case 'idle': return 'Need help?';
      default: return 'AI Assistant';
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.1 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spaceBetween.relatedCompact,
        padding: `0 ${spaceAround.tight}px`,
        height: BAR_HEIGHT,
        cursor: 'pointer',
        overflow: 'hidden',
      }}
      onClick={onExpand}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          borderRadius: borderRadius.full,
          backgroundColor: `${colors.fg.generative.spotReadable}30`,
          color: colors.fg.generative.spotReadable,
          flexShrink: 0,
        }}
      >
        {getContentIcon(content.type, 16)}
      </span>
      <span
        style={{
          flex: 1,
          fontSize: 13,
          fontWeight: typography.fontWeight.medium,
          color: colors.fg.neutral.inversePrimary,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {getText()}
      </span>
      <ChevronUp size={16} style={{ color: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />
    </motion.div>
  );
};

// ============================================================================
// Palette Content (shown when tier='palette' or during expand)
// ============================================================================

interface PaletteContentProps {
  patientName: string;
  contextTarget?: ContextTarget;
  availableContextLevels?: ContextTargetType[];
  onContextLevelChange?: (level: ContextTargetType) => void;
  suggestions: Suggestion[];
  onCollapse: () => void;
  onOpenDrawer: () => void;
  onSuggestionAccept?: (id: string) => void;
  onSuggestionDismiss?: (id: string) => void;
  onGenerateNote?: () => void;
  onCheckInteractions?: () => void;
  onClearContext?: () => void;
  isVisible: boolean;
}

const ACTION_TYPES = ['chart-item', 'care-gap-action'] as const;

const PaletteContent: React.FC<PaletteContentProps> = ({
  patientName,
  contextTarget,
  availableContextLevels,
  onContextLevelChange,
  suggestions,
  onCollapse,
  onOpenDrawer,
  onSuggestionAccept,
  onSuggestionDismiss,
  onGenerateNote,
  onCheckInteractions,
  onClearContext,
  isVisible,
}) => {
  const activeSuggestions = suggestions.filter((s) => s.status === 'active');
  const actionSuggestions = activeSuggestions.filter((s) =>
    ACTION_TYPES.includes(s.type as typeof ACTION_TYPES[number])
  );

  // Context level popover state
  const [popoverOpen, setPopoverOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const showContextLevelSelector = onContextLevelChange && availableContextLevels && availableContextLevels.length > 0;

  return (
    <motion.div
      initial={false}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.15 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 200,
      }}
    >
      {/* Drag Handle */}
      <DragHandle onCollapse={onCollapse} variant="dark" />

      {/* Context Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spaceBetween.relatedCompact,
          padding: `${spaceAround.nudge4}px ${spaceAround.compact}px ${spaceAround.compact}px`,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <CornerDownRight size={14} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
        <span style={{ flex: 1, fontSize: 13, fontWeight: typography.fontWeight.medium, color: colors.fg.neutral.inversePrimary }}>
          {patientName}
          {contextTarget?.label && (
            <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: typography.fontWeight.regular }}> · {contextTarget.label}</span>
          )}
        </span>

        {/* Context level selector */}
        {showContextLevelSelector && (
          <>
            <button
              ref={anchorRef}
              type="button"
              onClick={() => setPopoverOpen(!popoverOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 24,
                height: 24,
                borderRadius: borderRadius.sm,
                border: 'none',
                backgroundColor: popoverOpen ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
              }}
              title="Change context level"
            >
              <ChevronsUpDown size={14} />
            </button>
            <AnimatePresence>
              {popoverOpen && (
                <ContextLevelPopover
                  currentLevel={contextTarget?.type}
                  availableLevels={availableContextLevels}
                  onSelect={(level) => {
                    onContextLevelChange(level);
                    setPopoverOpen(false);
                  }}
                  anchorEl={anchorRef.current}
                  open={popoverOpen}
                  onClose={() => setPopoverOpen(false)}
                />
              )}
            </AnimatePresence>
          </>
        )}

        {/* Clear context button */}
        {onClearContext && (
          <button
            type="button"
            onClick={onClearContext}
            style={{
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
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflow: 'auto', padding: spaceAround.default }}>
        {/* Suggestions */}
        {actionSuggestions.length > 0 && onSuggestionAccept && onSuggestionDismiss ? (
          <div>
            <div style={{ fontSize: 11, fontWeight: typography.fontWeight.semibold, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Suggested Actions
            </div>
            {actionSuggestions.slice(0, 3).map((s) => (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: 12,
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  borderRadius: borderRadius.md,
                  marginBottom: 8,
                }}
              >
                <Lightbulb size={14} style={{ color: colors.fg.generative.spotReadable }} />
                <span style={{ flex: 1, fontSize: 13, color: colors.fg.neutral.inversePrimary }}>{s.actionLabel || s.displayText}</span>
                <button onClick={() => onSuggestionAccept(s.id)} style={{ fontSize: 12, padding: '4px 10px', backgroundColor: colors.fg.positive.secondary, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Add</button>
                <button onClick={() => onSuggestionDismiss(s.id)} style={{ fontSize: 12, padding: '4px 10px', backgroundColor: 'transparent', color: 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer' }}>Dismiss</button>
              </div>
            ))}
          </div>
        ) : (
          /* Quick Actions or Empty State */
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {onGenerateNote && (
              <button onClick={onGenerateNote} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: borderRadius.md, color: colors.fg.neutral.inversePrimary, fontSize: 13, cursor: 'pointer' }}>
                <FileText size={14} /> Generate Note
              </button>
            )}
            {onCheckInteractions && (
              <button onClick={onCheckInteractions} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: borderRadius.md, color: colors.fg.neutral.inversePrimary, fontSize: 13, cursor: 'pointer' }}>
                <Zap size={14} /> Check Interactions
              </button>
            )}
            {!onGenerateNote && !onCheckInteractions && activeSuggestions.length === 0 && (
              <div style={{ textAlign: 'center', padding: 24, width: '100%' }}>
                <Sparkles size={32} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: 12 }} />
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0 }}>AI assistance available</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <AIInputArea
        placeholder="Ask AI…"
        onOpenDrawer={onOpenDrawer}
        showDrawerButton={true}
        maxHeight={120}
      />
    </motion.div>
  );
};

// ============================================================================
// Main Component - Single Animated Container
// ============================================================================

export const AISurfaceModule: React.FC<AISurfaceModuleProps> = ({
  tier,
  content,
  onTierChange,
  patientName = 'Patient',
  contextTarget,
  availableContextLevels,
  onContextLevelChange,
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
  // Initialize phase based on tier
  const getInitialPhase = (): AnimationPhase => {
    if (tier === 'mini') return 'idle-mini';
    if (tier === 'palette') return 'idle-palette';
    return 'idle-bar';
  };
  const [phase, setPhase] = useState<AnimationPhase>(getInitialPhase);
  const [measuredHeight, setMeasuredHeight] = useState<number>(300); // Default palette height
  const contentRef = useRef<HTMLDivElement>(null);

  // Track where we're collapsing TO (bar or mini) - set when collapse starts
  const collapseTargetRef = useRef<'bar' | 'mini'>('bar');

  // Sync phase with external tier changes
  const prevTierRef = useRef(tier);
  useEffect(() => {
    const prevTier = prevTierRef.current;
    prevTierRef.current = tier;

    if (tier === 'drawer') return; // Drawer handled separately

    // Skip if phase is already animating
    const isAnimating = phase.includes('expanding') || phase.includes('collapsing');
    if (isAnimating) return;

    // Handle external tier changes
    if (tier === 'mini' && phase !== 'idle-mini') {
      if (prevTier === 'palette' && phase === 'idle-palette') {
        collapseTargetRef.current = 'mini';
        setPhase('collapsing-height');
      } else {
        setPhase('idle-mini');
      }
    } else if (tier === 'palette' && phase !== 'idle-palette') {
      if (prevTier === 'mini' || prevTier === 'bar') {
        setPhase('expanding-height');
      } else {
        setPhase('idle-palette');
      }
    } else if (tier === 'bar' && phase !== 'idle-bar') {
      if (prevTier === 'palette' && phase === 'idle-palette') {
        collapseTargetRef.current = 'bar';
        setPhase('collapsing-height');
      } else {
        setPhase('idle-bar');
      }
    }
  }, [tier, phase]);

  // Measure palette content height
  useEffect(() => {
    if (contentRef.current && (phase === 'idle-palette' || phase === 'expanding-height')) {
      const height = contentRef.current.scrollHeight;
      if (height > 0) setMeasuredHeight(height);
    }
  }, [phase, suggestions]);


  // Handle mini click - expand to palette
  const handleMiniClick = useCallback(() => {
    if (phase === 'idle-mini') {
      onTierChange('palette');
      setPhase('expanding-height');
    }
  }, [phase, onTierChange]);

  // Handle bar expand request
  const handleExpand = useCallback(() => {
    if (phase === 'idle-bar') {
      onTierChange('palette');
      setPhase('expanding-height');
    }
  }, [phase, onTierChange]);

  // Handle collapse request
  const handleCollapse = useCallback(() => {
    if (phase === 'idle-palette') {
      collapseTargetRef.current = 'bar';
      setPhase('collapsing-height');
    }
  }, [phase]);

  // Handle animation complete
  const handleAnimationComplete = useCallback(() => {
    switch (phase) {
      case 'expanding-height':
        setPhase('idle-palette');
        break;

      case 'collapsing-height':
        if (collapseTargetRef.current === 'mini') {
          onTierChange('mini');
          setPhase('idle-mini');
        } else {
          onTierChange('bar');
          setPhase('idle-bar');
        }
        break;
    }
  }, [phase, onTierChange]);

  // Calculate current dimensions based on phase
  // CSS Grid drives width; modules use 100% to fill their cell.
  // Only anchor (48×48 pill) uses explicit width.
  const getDimensions = () => {
    switch (phase) {
      case 'idle-mini':
        return { width: MICRO_SIZE, height: MICRO_SIZE };
      case 'idle-bar':
        return { width: '100%' as const, height: BAR_HEIGHT };
      case 'expanding-height':
        return { width: '100%' as const, height: measuredHeight };
      case 'idle-palette':
        return { width: '100%' as const, height: 'auto' as const };
      case 'collapsing-height':
        return { width: '100%' as const, height: BAR_HEIGHT };
    }
  };

  // Determine visual state based on animation phase
  const isVisuallyMini = phase === 'idle-mini';
  const isVisuallyBar = phase === 'idle-bar';
  const isVisuallyPalette = phase === 'idle-palette' || phase === 'expanding-height' || phase === 'collapsing-height';

  const dimensions = getDimensions();

  // Border radius: full (999) for mini, 24px for bar and palette (consistent)
  const getBorderRadius = () => {
    if (isVisuallyMini) return borderRadius.full;
    return 24;  // Consistent 24px for bar and palette
  };

  // Click handler
  const handleClick = () => {
    if (isVisuallyMini) {
      handleMiniClick();
    }
    // Bar click handled by MinibarContent's onClick
  };

  return (
    <motion.div
      ref={contentRef}
      layout={false}
      initial={false}
      animate={{
        width: dimensions.width,
        height: dimensions.height,
        borderRadius: getBorderRadius(),
      }}
      transition={{
        height: { duration: STAGE_DURATION, ease: [0.4, 0, 0.2, 1] },
        borderRadius: { duration: STAGE_DURATION, ease: [0.4, 0, 0.2, 1] },
        width: { duration: 0 },
      }}
      onAnimationComplete={handleAnimationComplete}
      onClick={isVisuallyMini ? handleClick : undefined}
      whileHover={isVisuallyMini ? { scale: 1.05 } : undefined}
      whileTap={isVisuallyMini ? { scale: 0.95 } : undefined}
      style={{
        position: 'relative',
        ...glass.glassDark,
        boxShadow: isVisuallyMini ? shadows.lg : undefined,
        // Allow badge to extend outside in mini state, clip content in other states
        overflow: isVisuallyMini ? 'visible' : 'hidden',
        cursor: isVisuallyMini ? 'pointer' : 'default',
        ...style,
      }}
      data-testid={testID}
    >
      {/* Mini Content - shown when visually mini */}
      {isVisuallyMini && (
        <MiniContent
          content={content}
          alerts={alerts}
          badgeCount={badgeCount}
          isVisible={isVisuallyMini}
        />
      )}

      {/* Minibar Content - shown when visually bar */}
      {!isVisuallyMini && isVisuallyBar && (
        <MinibarContent
          content={content}
          onExpand={handleExpand}
          isVisible={isVisuallyBar}
        />
      )}

      {/* Palette Content - shown when visually palette */}
      {!isVisuallyMini && isVisuallyPalette && (
        <PaletteContent
          patientName={patientName}
          contextTarget={contextTarget}
          availableContextLevels={availableContextLevels}
          onContextLevelChange={onContextLevelChange}
          suggestions={suggestions}
          onCollapse={handleCollapse}
          onOpenDrawer={() => onTierChange('drawer')}
          onSuggestionAccept={onSuggestionAccept}
          onSuggestionDismiss={onSuggestionDismiss}
          onGenerateNote={onGenerateNote}
          onCheckInteractions={onCheckInteractions}
          onClearContext={onClearContext}
          isVisible={isVisuallyPalette}
        />
      )}
    </motion.div>
  );
};

AISurfaceModule.displayName = 'AISurfaceModule';

export default AISurfaceModule;
