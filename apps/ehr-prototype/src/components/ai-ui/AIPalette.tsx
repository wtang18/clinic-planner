/**
 * AIPalette Component
 *
 * Expanded state of the AI assistant (morphs from minibar).
 * NO header - follows reference design with:
 * - Dismissible context banner at top
 * - Quick actions row
 * - Content area (scrollable)
 * - AI input area (sticky bottom)
 *
 * Uses glassmorphic dark styling to match minibar.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  FileText,
  ClipboardList,
  AlertTriangle,
  Heart,
  Check,
  SkipForward,
  ArrowRight,
  Pill,
  List,
  ListOrdered,
  Calendar,
  CornerDownRight,
  ChevronDown,
  GripHorizontal,
  Plus,
} from 'lucide-react';
import type { Alert, Suggestion } from '../../types/suggestions';
import type { AIContext, QuickAction } from '../../hooks/useAIAssistant';
import { colors, spaceAround, spaceBetween, borderRadius, typography, glass } from '../../styles/foundations';
import { AlertCard } from './AlertCard';
import { SuggestionList } from '../suggestions/SuggestionList';
import { AIInputArea } from './AIInputArea';

// ============================================================================
// Types
// ============================================================================

export interface AIPaletteProps {
  /** Whether the palette is visible (for standalone use) */
  isOpen?: boolean;
  /** Called to close the palette */
  onClose?: () => void;
  /** Called to expand to full drawer */
  onExpandToDrawer?: () => void;
  /** Current patient name */
  patientName?: string;
  /** Current visit type */
  visitType?: string;
  /** The specific element being focused on (e.g., "Lisinopril 10mg", "Diabetes Type 2") */
  contextTarget?: string;
  /** Current context */
  context?: AIContext;
  /** Quick actions for current context */
  quickActions?: QuickAction[];
  /** Active alerts */
  alerts?: Alert[];
  /** Active suggestions */
  suggestions?: Suggestion[];
  /** Called when an alert is acknowledged */
  onAlertAcknowledge?: (id: string) => void;
  /** Called when an alert action is taken */
  onAlertAction?: (alertId: string, actionId: string) => void;
  /** Called when a suggestion is accepted */
  onSuggestionAccept?: (id: string) => void;
  /** Called when a suggestion is dismissed */
  onSuggestionDismiss?: (id: string) => void;
  /** Called when a quick action is clicked */
  onQuickActionClick?: (actionId: string) => void;
  /** Called when user submits a question */
  onAskQuestion?: (question: string) => void;
  /** Whether AI is processing */
  isLoading?: boolean;
  /** Whether the context bar is dismissed */
  isContextDismissed?: boolean;
  /** Called when context is dismissed */
  onContextDismiss?: () => void;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Helper - Get icon for quick action
// ============================================================================

const getQuickActionIcon = (iconName: string, size = 16) => {
  switch (iconName) {
    case 'FileText':
      return <FileText size={size} />;
    case 'ClipboardList':
      return <ClipboardList size={size} />;
    case 'AlertTriangle':
      return <AlertTriangle size={size} />;
    case 'Heart':
      return <Heart size={size} />;
    case 'Check':
      return <Check size={size} />;
    case 'SkipForward':
      return <SkipForward size={size} />;
    case 'ArrowRight':
      return <ArrowRight size={size} />;
    case 'Pill':
      return <Pill size={size} />;
    case 'List':
      return <List size={size} />;
    case 'ListOrdered':
      return <ListOrdered size={size} />;
    case 'Calendar':
      return <Calendar size={size} />;
    default:
      return <Sparkles size={size} />;
  }
};

// ============================================================================
// Drag Handle Component
// ============================================================================

interface DragHandleProps {
  onClose?: () => void;
}

const DragHandle: React.FC<DragHandleProps> = ({ onClose }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClose}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: `${spaceAround.tight}px 0`,
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        transition: 'all 150ms ease',
      }}
      title="Close palette"
    >
      <motion.div
        animate={{ opacity: isHovered ? 0.8 : 0.4 }}
        transition={{ duration: 0.15 }}
      >
        {isHovered ? (
          <ChevronDown size={16} style={{ color: colors.fg.neutral.inversePrimary }} />
        ) : (
          <GripHorizontal size={16} style={{ color: colors.fg.neutral.inversePrimary }} />
        )}
      </motion.div>
    </button>
  );
};

// ============================================================================
// Context Banner Component
// ============================================================================

interface ContextBannerProps {
  patientName?: string;
  visitType?: string;
  /** The specific element being focused on (e.g., "Lisinopril 10mg", "Diabetes Type 2") */
  contextTarget?: string;
  onDismiss?: () => void;
  onAddContext?: () => void;
  isEmpty?: boolean;
}

const ContextBanner: React.FC<ContextBannerProps> = ({
  patientName,
  visitType,
  contextTarget,
  onDismiss,
  onAddContext,
  isEmpty = false,
}) => {
  // If we have a context target, show it prominently; otherwise fall back to patient/visit
  const contextText = contextTarget || [patientName, visitType].filter(Boolean).join(' · ');

  // Show placeholder when no context
  if (isEmpty || !contextText) {
    return (
      <motion.button
        type="button"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.15 }}
        onClick={onAddContext}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px dashed rgba(255, 255, 255, 0.2)',
          borderRadius: borderRadius.md,
          margin: `0 ${spaceAround.compact}px`,
          marginBottom: spaceBetween.separatedSm,
          cursor: 'pointer',
          transition: 'all 150ms ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.3)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }}
      >
        <Plus
          size={14}
          style={{
            marginRight: spaceBetween.relatedCompact,
            color: colors.fg.neutral.inversePrimary,
            opacity: 0.5,
          }}
        />
        <span
          style={{
            fontSize: 13,
            fontFamily: typography.fontFamily.sans,
            fontWeight: typography.fontWeight.medium,
            color: colors.fg.neutral.inversePrimary,
            opacity: 0.5,
          }}
        >
          Add context...
        </span>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.15 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: borderRadius.md,
        margin: `0 ${spaceAround.compact}px`,
        marginBottom: spaceBetween.separatedSm, // 24px gap after context (between different sections)
      }}
    >
      <CornerDownRight
        size={14}
        style={{
          marginRight: spaceBetween.relatedCompact,
          color: colors.fg.neutral.inversePrimary,
          opacity: 0.6,
        }}
      />
      <span
        style={{
          flex: 1,
          fontSize: 13,
          fontFamily: typography.fontFamily.sans,
          fontWeight: typography.fontWeight.medium,
          color: colors.fg.neutral.inversePrimary,
          opacity: 0.8,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {contextText}
      </span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          title="Remove context"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            borderRadius: borderRadius.sm,
            border: 'none',
            backgroundColor: 'transparent',
            color: colors.fg.neutral.inversePrimary,
            opacity: 0.5,
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            (e.currentTarget as HTMLElement).style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
            (e.currentTarget as HTMLElement).style.opacity = '0.5';
          }}
        >
          <X size={16} />
        </button>
      )}
    </motion.div>
  );
};

// ============================================================================
// Component
// ============================================================================

export const AIPalette: React.FC<AIPaletteProps> = ({
  isOpen = true,
  onClose,
  onExpandToDrawer,
  patientName,
  visitType,
  contextTarget,
  context = 'none',
  quickActions = [],
  alerts = [],
  suggestions = [],
  onAlertAcknowledge,
  onAlertAction,
  onSuggestionAccept,
  onSuggestionDismiss,
  onQuickActionClick,
  onAskQuestion,
  isLoading = false,
  isContextDismissed = false,
  onContextDismiss,
  style,
  testID,
}) => {
  const [inputValue, setInputValue] = useState('');

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledgedAt);
  const criticalAlerts = unacknowledgedAlerts.filter(a => a.severity === 'critical');
  // Use suggestions directly - already filtered by useActiveSuggestions() in parent
  const activeSuggestions = suggestions;

  const handleSubmit = (value: string) => {
    if (value.trim() && onAskQuestion) {
      onAskQuestion(value.trim());
      setInputValue('');
    }
  };

  if (!isOpen) return null;

  // Show context only if we have context info and it isn't dismissed
  const showContext = (patientName || visitType || contextTarget) && !isContextDismissed;

  // Container uses glassmorphic dark styling (same as minibar)
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...style,
  };

  const contentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.relatedCompact,
    padding: spaceAround.compact,
    paddingTop: showContext ? 0 : spaceAround.compact,
    paddingBottom: spaceBetween.repeating, // Reduce gap before input (8px instead of 12px)
    // No scroll - content hugs. Individual text blocks scroll internally if needed.
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: spaceBetween.separatedSm, // 24px between different sections
  };

  const quickActionsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'nowrap',
    gap: spaceBetween.relatedCompact,
    marginBottom: spaceBetween.separatedSm, // 24px to next section
    // Extend to edges for full-bleed scrolling
    marginLeft: -spaceAround.compact,
    marginRight: -spaceAround.compact,
    paddingLeft: spaceAround.compact,
    paddingRight: spaceAround.compact,
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollbarWidth: 'none', // Firefox
    msOverflowStyle: 'none', // IE/Edge
  };

  const quickActionButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.md,
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.inversePrimary,
    cursor: 'pointer',
    transition: 'all 150ms ease',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.inversePrimary,
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: spaceBetween.relatedCompact,
  };

  return (
    <div style={containerStyle} data-testid={testID}>
      {/* Drag Handle at top */}
      <DragHandle onClose={onClose} />

      {/* Context Banner (dismissible, or placeholder if none) */}
      <AnimatePresence>
        {isContextDismissed ? (
          <ContextBanner
            isEmpty={true}
            onAddContext={() => {
              // In a real app, this would open a context picker
              // For now, just dismiss to restore original context
              onContextDismiss?.();
            }}
          />
        ) : (
          <ContextBanner
            patientName={patientName}
            visitType={visitType}
            contextTarget={contextTarget}
            onDismiss={onContextDismiss}
          />
        )}
      </AnimatePresence>

      {/* Content */}
      <div style={contentStyle}>
        {/* Quick Actions - hidden when showing more suggestions */}
        {quickActions.length > 0 && !showMoreSuggestions && (
          <div
            style={quickActionsContainerStyle}
            className="ai-palette-quick-actions"
          >
            {quickActions.slice(0, 5).map((action) => (
              <button
                key={action.id}
                type="button"
                style={{ ...quickActionButtonStyle, flexShrink: 0 }}
                onClick={() => onQuickActionClick?.(action.id)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <span style={{ display: 'flex', color: colors.fg.neutral.inversePrimary }}>
                  {getQuickActionIcon(action.icon)}
                </span>
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Critical Alerts - no section header */}
        {criticalAlerts.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spaceBetween.repeating }}>
            {criticalAlerts.map(alert => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onAcknowledge={() => onAlertAcknowledge?.(alert.id)}
                onAction={(actionId) => onAlertAction?.(alert.id, actionId)}
              />
            ))}
          </div>
        )}

        {/* Suggestions - show 1 at a time, with section header */}
        {activeSuggestions.length > 0 && onSuggestionAccept && onSuggestionDismiss && (
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>Suggestions</div>
            <SuggestionList
              suggestions={activeSuggestions.slice(0, 1)}
              maxVisible={1}
              onAccept={onSuggestionAccept}
              onDismiss={onSuggestionDismiss}
              variant="compact"
            />
            {activeSuggestions.length > 1 && (
              <span
                style={{
                  display: 'block',
                  paddingTop: spaceBetween.repeating,
                  fontSize: 12,
                  fontFamily: typography.fontFamily.sans,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.fg.neutral.inversePrimary,
                  opacity: 0.5,
                  textAlign: 'center',
                }}
              >
                +{activeSuggestions.length - 1} more
              </span>
            )}
          </div>
        )}

        {/* Other Alerts - no section header */}
        {unacknowledgedAlerts.filter(a => a.severity !== 'critical').length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spaceBetween.repeating }}>
            {unacknowledgedAlerts
              .filter(a => a.severity !== 'critical')
              .slice(0, 2)
              .map(alert => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={() => onAlertAcknowledge?.(alert.id)}
                  onAction={(actionId) => onAlertAction?.(alert.id, actionId)}
                />
              ))}
          </div>
        )}
      </div>

      {/* Input Area (sticky bottom) */}
      {onAskQuestion && (
        <AIInputArea
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSubmit}
          onOpenDrawer={onExpandToDrawer}
          disabled={isLoading}
          showDrawerButton={!!onExpandToDrawer}
        />
      )}

      {/* Hide scrollbar for webkit browsers */}
      <style>{`
        .ai-palette-quick-actions::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

AIPalette.displayName = 'AIPalette';
