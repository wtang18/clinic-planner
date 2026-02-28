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

import { Button } from '../../primitives/Button';
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
import type { QuickAction } from '../../../hooks/useAIAssistant';
import type { ConversationMessage } from '../../LeftPane/AIDrawer/ConversationHistory';
import { SUGGESTION_ACTION_TYPES } from '../../../utils/suggestions';
import { LightMarkdown } from '../../../utils/lightweight-markdown';
import { SuggestionList } from '../../suggestions/SuggestionList';
import { SuggestionModule } from '../../suggestions/SuggestionModule';
import { SuggestionEditPanel } from '../../suggestions/SuggestionEditPanel';

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
  onSuggestionAcceptWithChanges?: (id: string, data: Record<string, unknown>) => void;
  onAlertAcknowledge?: (id: string) => void;
  onClearContext?: () => void;
  quickActions?: QuickAction[];
  onQuickActionClick?: (actionId: string) => void;
  onSuggestionClick?: (id: string) => void;
  onCareGapClick?: (id: string) => void;
  badgeCount?: number;
  /** Called when user sends a message from the palette input */
  onSend?: (value: string) => void;
  /** Ephemeral AI response for palette single-turn display */
  paletteResponse?: ConversationMessage | null;
  /** Non-chart follow-up actions (e.g., Copy to clipboard) */
  nonChartFollowUps?: Array<{ id: string; label: string }>;
  /** Handle non-chart follow-up action */
  onNonChartAction?: (actionId: string) => void;
  /** Called when user clears/dismisses the palette response */
  onClearResponse?: () => void;
  /** Canned query texts for ArrowUp/Down cycling */
  cannedQueries?: string[];
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
  onSuggestionAcceptWithChanges?: (id: string, data: Record<string, unknown>) => void;
  quickActions?: QuickAction[];
  onQuickActionClick?: (actionId: string) => void;
  onClearContext?: () => void;
  onSend?: (value: string) => void;
  paletteResponse?: ConversationMessage | null;
  nonChartFollowUps?: Array<{ id: string; label: string }>;
  onNonChartAction?: (actionId: string) => void;
  onClearResponse?: () => void;
  cannedQueries?: string[];
  isVisible: boolean;
}

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
  onSuggestionAcceptWithChanges,
  quickActions,
  onQuickActionClick,
  onClearContext,
  onSend,
  paletteResponse,
  nonChartFollowUps = [],
  onNonChartAction,
  onClearResponse,
  cannedQueries,
  isVisible,
}) => {
  const activeSuggestions = suggestions.filter((s) => s.status === 'active');
  const actionSuggestions = activeSuggestions.filter((s) =>
    SUGGESTION_ACTION_TYPES.includes(s.type as typeof SUGGESTION_ACTION_TYPES[number])
  );

  // Context level popover state
  const [popoverOpen, setPopoverOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  // Scroll state for gradient fade on response content
  const responseScrollRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);

  const handleContentScroll = useCallback(() => {
    if (!responseScrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = responseScrollRef.current;
    setIsScrolledToBottom(scrollHeight - scrollTop - clientHeight < 10);
  }, []);

  // Check overflow on mount/content change
  useEffect(() => {
    if (!paletteResponse || !responseScrollRef.current) return;
    const el = responseScrollRef.current;
    setIsScrolledToBottom(el.scrollHeight - el.clientHeight < 10);
  }, [paletteResponse, nonChartFollowUps]);

  // Suggestion module collapse state
  const [moduleCollapsed, setModuleCollapsed] = useState(false);

  // Auto-expand when suggestion count increases
  const prevActionCountRef = useRef(actionSuggestions.length);
  useEffect(() => {
    if (actionSuggestions.length > prevActionCountRef.current) {
      setModuleCollapsed(false);
    }
    prevActionCountRef.current = actionSuggestions.length;
  }, [actionSuggestions.length]);

  // Edit-before-accept state
  const [editingSuggestionId, setEditingSuggestionId] = useState<string | null>(null);
  const editingSuggestion = editingSuggestionId
    ? (suggestions.find(s => s.id === editingSuggestionId) ?? null)
    : null;

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
        maxHeight: 400,
        // Explicit height needed when response content uses absolute positioning:
        // flex-grow won't distribute space in a min/max-only container (no definite height)
        ...(paletteResponse ? { height: 400 } : {}),
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

      {editingSuggestion && onSuggestionAcceptWithChanges ? (
        /* Edit mode: just the edit panel, nothing else */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: `${spaceAround.default}px 0 0 ${spaceAround.default}px`, minHeight: 0 }}>
          <SuggestionEditPanel
            suggestion={editingSuggestion}
            theme="dark"
            stickyHeader
            onAccept={(id, data) => {
              onSuggestionAcceptWithChanges(id, data);
              setEditingSuggestionId(null);
            }}
            onCancel={() => setEditingSuggestionId(null)}
          />
        </div>
      ) : (
        <>
          {/* Content Area */}
          {paletteResponse ? (
            /* AI Response — wrapper with scroll inner + gradient + floating Clear */
            <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
              {/* Scroll inner */}
              <div
                ref={responseScrollRef}
                onScroll={handleContentScroll}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  overflowY: 'auto',
                  padding: spaceAround.default,
                  paddingBottom: 48,
                  // Fade content to transparent at bottom edge when more content below
                  // Gradient fade zone matches paddingBottom (48px) so content
                  // above the padding stays fully opaque — only the empty pad fades.
                  maskImage: isScrolledToBottom
                    ? undefined
                    : 'linear-gradient(to bottom, black calc(100% - 48px), transparent 100%)',
                  WebkitMaskImage: isScrolledToBottom
                    ? undefined
                    : 'linear-gradient(to bottom, black calc(100% - 48px), transparent 100%)',
                }}
              >
                <LightMarkdown
                  content={paletteResponse.content}
                  theme="dark"
                  style={{ fontFamily: typography.fontFamily.sans }}
                />
                {/* Chart-item suggestions inline with response */}
                {actionSuggestions.length > 0 && onSuggestionAccept && onSuggestionDismiss && (
                  <div style={{ marginTop: 12 }}>
                    <SuggestionList
                      suggestions={actionSuggestions}
                      onAccept={onSuggestionAccept}
                      onDismiss={onSuggestionDismiss}
                      onEdit={(id) => setEditingSuggestionId(id)}
                      variant="compact"
                      theme="dark"
                      showHeader={false}
                    />
                  </div>
                )}
                {/* Non-chart follow-ups as action buttons */}
                {nonChartFollowUps.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                    {nonChartFollowUps.map((action) => (
                      <Button
                        key={action.id}
                        variant="secondary"
                        size="sm"
                        shape="rounded"
                        onClick={() => onNonChartAction?.(action.id)}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          color: colors.fg.generative.spotReadable,
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                          backdropFilter: 'none',
                          WebkitBackdropFilter: 'none',
                        }}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              {/* Floating Clear button */}
              {onClearResponse && (
                <button
                  type="button"
                  onClick={onClearResponse}
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '4px 16px',
                    borderRadius: borderRadius.full,
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    background: 'rgba(30, 30, 30, 0.85)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    fontSize: 12,
                    fontFamily: typography.fontFamily.sans,
                    fontWeight: typography.fontWeight.medium,
                    color: 'rgba(255, 255, 255, 0.6)',
                    cursor: 'pointer',
                    transition: 'background 150ms ease, color 150ms ease',
                    zIndex: 1,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(50, 50, 50, 0.9)';
                    (e.currentTarget as HTMLElement).style.color = 'rgba(255, 255, 255, 0.85)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(30, 30, 30, 0.85)';
                    (e.currentTarget as HTMLElement).style.color = 'rgba(255, 255, 255, 0.6)';
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          ) : (
          <div style={{ flex: 1, overflow: 'auto', padding: spaceAround.default }}>
            {/* Quick Actions or Empty State (no response, no suggestions inline) */}
            {quickActions && quickActions.length > 0 && onQuickActionClick ? (
              <div
                className="ai-palette-actions"
                style={{
                  display: 'flex',
                  gap: 8,
                  overflowX: 'auto',
                  margin: `0 -${spaceAround.default}px`,
                  padding: `0 ${spaceAround.default}px`,
                  scrollbarWidth: 'none',
                }}
              >
                <style>{`.ai-palette-actions::-webkit-scrollbar { display: none; }`}</style>
                {quickActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="secondary"
                    size="sm"
                    shape="rounded"
                    onClick={() => onQuickActionClick(action.id)}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: colors.fg.neutral.inversePrimary,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      backdropFilter: 'none',
                      WebkitBackdropFilter: 'none',
                    }}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            ) : (
              activeSuggestions.length === 0 && (
                <div style={{ textAlign: 'center', padding: 24, width: '100%' }}>
                  <Sparkles size={32} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: 12 }} />
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0 }}>AI assistance available</p>
                </div>
              )
            )}
          </div>
          )}
          {/* Suggestion Module — between content and input, only when no response (idle moment) */}
          {!paletteResponse && actionSuggestions.length > 0 && onSuggestionAccept && onSuggestionDismiss && (
            <SuggestionModule
              suggestions={suggestions}
              onAccept={onSuggestionAccept}
              onDismiss={onSuggestionDismiss}
              onEdit={(id) => setEditingSuggestionId(id)}
              theme="dark"
              collapsed={moduleCollapsed}
              onToggleCollapse={() => setModuleCollapsed(!moduleCollapsed)}
            />
          )}
          {/* Input Area */}
          <AIInputArea
            placeholder="Ask AI…"
            onSend={onSend}
            onOpenDrawer={onOpenDrawer}
            showDrawerButton={true}
            maxHeight={120}
            cannedQueries={cannedQueries}
          />
        </>
      )}
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
  onSuggestionAcceptWithChanges,
  onAlertAcknowledge,
  onClearContext,
  quickActions,
  onQuickActionClick,
  onSuggestionClick,
  onCareGapClick,
  badgeCount,
  onSend,
  paletteResponse,
  nonChartFollowUps,
  onNonChartAction,
  onClearResponse,
  cannedQueries,
  style,
  testID = 'ai-surface-module',
}) => {
  // Initialize phase based on tier
  const getInitialPhase = (): AnimationPhase => {
    if (tier === 'anchor') return 'idle-mini';
    if (tier === 'palette') return 'idle-palette';
    return 'idle-bar';
  };
  const [phase, setPhase] = useState<AnimationPhase>(getInitialPhase);
  const [measuredHeight, setMeasuredHeight] = useState<number>(300); // Default palette height
  const contentRef = useRef<HTMLDivElement>(null);

  // Track where we're collapsing TO (bar or mini) - set when collapse starts
  const collapseTargetRef = useRef<'bar' | 'anchor'>('bar');

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
    if (tier === 'anchor' && phase !== 'idle-mini') {
      if (prevTier === 'palette' && phase === 'idle-palette') {
        collapseTargetRef.current = 'anchor';
        setPhase('collapsing-height');
      } else {
        setPhase('idle-mini');
      }
    } else if (tier === 'palette' && phase !== 'idle-palette') {
      if (prevTier === 'anchor' || prevTier === 'bar') {
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

  // Measure palette content height (capped at 400px)
  useEffect(() => {
    if (contentRef.current && (phase === 'idle-palette' || phase === 'expanding-height')) {
      const height = contentRef.current.scrollHeight;
      if (height > 0) setMeasuredHeight(Math.min(height, 400));
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
        if (collapseTargetRef.current === 'anchor') {
          onTierChange('anchor');
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
          onSuggestionAcceptWithChanges={onSuggestionAcceptWithChanges}
          quickActions={quickActions}
          onQuickActionClick={onQuickActionClick}
          onClearContext={onClearContext}
          onSend={onSend}
          paletteResponse={paletteResponse}
          nonChartFollowUps={nonChartFollowUps}
          onNonChartAction={onNonChartAction}
          onClearResponse={onClearResponse}
          cannedQueries={cannedQueries}
          isVisible={isVisuallyPalette}
        />
      )}
    </motion.div>
  );
};

AISurfaceModule.displayName = 'AISurfaceModule';

export default AISurfaceModule;
