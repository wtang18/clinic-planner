/**
 * Palette Component
 *
 * Expanded AI interaction panel that slides up from the minibar.
 */

import React from 'react';
import { X, FileText, Sparkles, Zap, AlertTriangle } from 'lucide-react';
import type { Alert, Suggestion } from '../../types/suggestions';
import { colors, spaceAround, spaceBetween, typography } from '../../styles/foundations';
import { AlertCard } from './AlertCard';
import { SuggestionList } from '../suggestions/SuggestionList';
import { Button } from '../primitives/Button';
import { EmptyState } from '../primitives/EmptyState';
import { IconButton } from '../primitives/IconButton';
import { SectionTitle } from '../primitives/SectionTitle';
import { Modal } from '../primitives/Modal';

// ============================================================================
// Types
// ============================================================================

export interface PaletteProps {
  /** Whether the palette is open */
  isOpen: boolean;
  /** Called when close is requested */
  onClose: () => void;
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
  /** Called when generate note is clicked */
  onGenerateNote?: () => void;
  /** Called when check interactions is clicked */
  onCheckInteractions?: () => void;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Component
// ============================================================================

export const Palette: React.FC<PaletteProps> = ({
  isOpen,
  onClose,
  alerts = [],
  suggestions = [],
  onAlertAcknowledge,
  onAlertAction,
  onSuggestionAccept,
  onSuggestionDismiss,
  onGenerateNote,
  onCheckInteractions,
  style,
}) => {
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledgedAt);
  const criticalAlerts = unacknowledgedAlerts.filter(a => a.severity === 'critical');
  const activeSuggestions = suggestions.filter(s => s.status === 'active');

  // Container styles
  const modalContentStyle: React.CSSProperties = {
    bottom: 64,
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spaceAround.default}px ${spaceAround.defaultPlus}px`,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
    flexShrink: 0,
  };

  const titleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    fontSize: 16,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.primary,
    margin: 0,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: spaceAround.default,
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: spaceAround.spacious,
  };

  const quickActionsStyle: React.CSSProperties = {
    display: 'flex',
    gap: spaceBetween.relatedCompact,
    flexWrap: 'wrap',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      position="bottom"
      size="md"
      closeOnBackdropClick={true}
      style={modalContentStyle}
    >
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={titleStyle}>
            <span style={{ display: 'flex', color: colors.fg.generative.spotReadable }}>
              <Sparkles size={20} />
            </span>
            AI Assistant
          </h2>
          <IconButton
            icon={<X size={18} />}
            label="Close palette"
            variant="ghost"
            size="md"
            onClick={onClose}
          />
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {/* Critical Alerts (always shown first) */}
          {criticalAlerts.length > 0 && (
            <div style={sectionStyle}>
              <SectionTitle
                title="Critical Alerts"
                icon={<AlertTriangle size={16} />}
                iconColor={colors.fg.alert.secondary}
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

          {/* Other Alerts */}
          {unacknowledgedAlerts.filter(a => a.severity !== 'critical').length > 0 && (
            <div style={sectionStyle}>
              <SectionTitle
                title="Alerts"
                icon={<AlertTriangle size={16} />}
                iconColor={colors.fg.attention.secondary}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: spaceBetween.repeating }}>
                {unacknowledgedAlerts
                  .filter(a => a.severity !== 'critical')
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

          {/* Suggestions */}
          {activeSuggestions.length > 0 && onSuggestionAccept && onSuggestionDismiss && (
            <div style={sectionStyle}>
              <SectionTitle
                title="Suggestions"
                icon={<Sparkles size={16} />}
                iconColor={colors.fg.generative.spotReadable}
              />
              <SuggestionList
                suggestions={activeSuggestions}
                maxVisible={10}
                onAccept={onSuggestionAccept}
                onDismiss={onSuggestionDismiss}
                variant="compact"
              />
            </div>
          )}

          {/* Quick Actions */}
          {(onGenerateNote || onCheckInteractions) && (
            <div style={sectionStyle}>
              <SectionTitle
                title="Quick Actions"
                icon={<Zap size={16} />}
                iconColor={colors.fg.accent.primary}
              />
              <div style={quickActionsStyle}>
                {onGenerateNote && (
                  <Button
                    variant="secondary"
                    size="md"
                    leftIcon={<FileText size={16} />}
                    onClick={onGenerateNote}
                  >
                    Generate Note
                  </Button>
                )}
                {onCheckInteractions && (
                  <Button
                    variant="secondary"
                    size="md"
                    leftIcon={<AlertTriangle size={16} />}
                    onClick={onCheckInteractions}
                  >
                    Check Interactions
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Empty state */}
          {unacknowledgedAlerts.length === 0 &&
            activeSuggestions.length === 0 &&
            !onGenerateNote &&
            !onCheckInteractions && (
              <EmptyState
                icon={<Sparkles size={48} />}
                title="No alerts or suggestions right now."
                description="AI assistance will appear here as you work."
                size="lg"
              />
            )}
        </div>
    </Modal>
  );
};

Palette.displayName = 'Palette';
