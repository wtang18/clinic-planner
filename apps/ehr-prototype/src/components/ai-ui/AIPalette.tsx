/**
 * AIPalette Component
 *
 * Expanded state of the AI assistant with:
 * - Patient context header
 * - Quick actions (context-aware)
 * - Suggestions/alerts
 * - AI input for questions
 */

import React, { useState, useRef, useEffect } from 'react';
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
  Send,
  Maximize2,
} from 'lucide-react';
import type { Alert, Suggestion } from '../../types/suggestions';
import type { AIContext, QuickAction } from '../../hooks/useAIAssistant';
import { colors, spaceAround, spaceBetween, borderRadius, typography, shadows, transitions } from '../../styles/foundations';
import { AlertCard } from './AlertCard';
import { SuggestionList } from '../suggestions/SuggestionList';
import { Button } from '../primitives/Button';
import { IconButton } from '../primitives/IconButton';
import { SectionTitle } from '../primitives/SectionTitle';

// ============================================================================
// Types
// ============================================================================

export interface AIPaletteProps {
  /** Whether the palette is visible */
  isOpen: boolean;
  /** Called to close the palette */
  onClose: () => void;
  /** Called to expand to full drawer */
  onExpandToDrawer?: () => void;
  /** Current patient name */
  patientName?: string;
  /** Current visit type */
  visitType?: string;
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
// Component
// ============================================================================

export const AIPalette: React.FC<AIPaletteProps> = ({
  isOpen,
  onClose,
  onExpandToDrawer,
  patientName,
  visitType,
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
  style,
  testID,
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledgedAt);
  const criticalAlerts = unacknowledgedAlerts.filter(a => a.severity === 'critical');
  const activeSuggestions = suggestions.filter(s => s.status === 'active');

  // Focus input when palette opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && onAskQuestion) {
      onAskQuestion(inputValue.trim());
      setInputValue('');
    }
  };

  if (!isOpen) return null;

  // Styles
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 80, // Above the minibar
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'min(480px, calc(100% - 32px))',
    maxHeight: 'min(400px, 60vh)',
    backgroundColor: colors.bg.neutral.base,
    borderRadius: borderRadius.lg,
    boxShadow: shadows.xl,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 1000,
    animation: 'paletteSlideIn 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
    flexShrink: 0,
  };

  const headerLeftStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
  };

  const headerRightStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
  };

  const titleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.primary,
    margin: 0,
  };

  const contextStyle: React.CSSProperties = {
    fontSize: 12,
    color: colors.fg.neutral.secondary,
    marginLeft: spaceBetween.repeating,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: spaceAround.default,
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: spaceAround.default,
  };

  const quickActionsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spaceBetween.relatedCompact,
  };

  const quickActionButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    backgroundColor: colors.bg.neutral.subtle,
    border: `1px solid ${colors.border.neutral.low}`,
    borderRadius: borderRadius.md,
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.primary,
    cursor: 'pointer',
    transition: `all 150ms cubic-bezier(0.4, 0, 0.2, 1)`,
  };

  const inputContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
    borderTop: `1px solid ${colors.border.neutral.low}`,
    backgroundColor: colors.bg.neutral.subtle,
    flexShrink: 0,
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    backgroundColor: colors.bg.neutral.base,
    border: `1px solid ${colors.border.neutral.low}`,
    borderRadius: borderRadius.md,
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
    outline: 'none',
    transition: `all 150ms cubic-bezier(0.4, 0, 0.2, 1)`,
  };

  return (
    <div style={containerStyle} data-testid={testID}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={headerLeftStyle}>
          <h3 style={titleStyle}>
            <span style={{ display: 'flex', color: colors.fg.generative.spotReadable }}>
              <Sparkles size={18} />
            </span>
            AI Assistant
          </h3>
          {patientName && (
            <span style={contextStyle}>
              {patientName}
              {visitType && ` · ${visitType}`}
            </span>
          )}
        </div>
        <div style={headerRightStyle}>
          {onExpandToDrawer && (
            <IconButton
              icon={<Maximize2 size={16} />}
              label="Expand to full view"
              variant="ghost"
              size="sm"
              onClick={onExpandToDrawer}
            />
          )}
          <IconButton
            icon={<X size={18} />}
            label="Close"
            variant="ghost"
            size="sm"
            onClick={onClose}
          />
        </div>
      </div>

      {/* Content */}
      <div style={contentStyle}>
        {/* Critical Alerts (always first) */}
        {criticalAlerts.length > 0 && (
          <div style={sectionStyle}>
            <SectionTitle
              title="Critical Alerts"
              icon={<AlertTriangle size={14} />}
              iconColor={colors.fg.alert.secondary}
              size="sm"
            />
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
          </div>
        )}

        {/* Quick Actions */}
        {quickActions.length > 0 && (
          <div style={sectionStyle}>
            <SectionTitle
              title="Quick Actions"
              size="sm"
            />
            <div style={quickActionsContainerStyle}>
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  style={quickActionButtonStyle}
                  onClick={() => onQuickActionClick?.(action.id)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = colors.bg.neutral.medium;
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = colors.bg.neutral.subtle;
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  <span style={{ display: 'flex', color: colors.fg.accent.primary }}>
                    {getQuickActionIcon(action.icon)}
                  </span>
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {activeSuggestions.length > 0 && onSuggestionAccept && onSuggestionDismiss && (
          <div style={sectionStyle}>
            <SectionTitle
              title="Suggestions"
              icon={<Sparkles size={14} />}
              iconColor={colors.fg.generative.spotReadable}
              size="sm"
            />
            <SuggestionList
              suggestions={activeSuggestions.slice(0, 3)}
              maxVisible={3}
              onAccept={onSuggestionAccept}
              onDismiss={onSuggestionDismiss}
              variant="compact"
            />
          </div>
        )}

        {/* Other Alerts */}
        {unacknowledgedAlerts.filter(a => a.severity !== 'critical').length > 0 && (
          <div style={sectionStyle}>
            <SectionTitle
              title="Alerts"
              icon={<AlertTriangle size={14} />}
              iconColor={colors.fg.attention.secondary}
              size="sm"
            />
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
          </div>
        )}
      </div>

      {/* Input */}
      {onAskQuestion && (
        <form style={inputContainerStyle} onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask AI..."
            style={inputStyle}
            disabled={isLoading}
            onFocus={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = colors.border.accent.low;
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 3px ${colors.border.accent.low}20`;
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = colors.border.neutral.low;
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          />
          <IconButton
            icon={<Send size={16} />}
            label="Send"
            variant="ghost"
            size="sm"
            onClick={() => handleSubmit(new Event('submit') as any)}
            disabled={!inputValue.trim() || isLoading}
          />
        </form>
      )}

      {/* Animations */}
      <style>{`
        @keyframes paletteSlideIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

AIPalette.displayName = 'AIPalette';
