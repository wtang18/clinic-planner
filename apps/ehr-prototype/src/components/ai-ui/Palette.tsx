/**
 * Palette Component
 *
 * Expanded AI interaction panel that slides up from the minibar.
 */

import React from 'react';
import type { Alert, Suggestion } from '../../types/suggestions';
import { colors, spacing, typography, radii, shadows, transitions, zIndex } from '../../styles/tokens';
import { AlertCard } from './AlertCard';
import { SuggestionList } from '../suggestions/SuggestionList';
import { Button } from '../primitives/Button';
import { IconButton } from '../primitives/IconButton';
import { Card } from '../primitives/Card';

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
// Icons
// ============================================================================

const XIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const FileTextIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const SparklesIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
    <circle cx="12" cy="12" r="4" />
  </svg>
);

const ZapIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
  </svg>
);

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
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? 'visible' : 'hidden',
    transition: `opacity ${transitions.base}, visibility ${transitions.base}`,
    zIndex: zIndex.overlay,
  };

  const paletteStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: spacing[16],
    left: '50%',
    transform: isOpen ? 'translate(-50%, 0)' : 'translate(-50%, 100%)',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '70vh',
    backgroundColor: colors.neutral[0],
    borderRadius: `${radii.xl} ${radii.xl} 0 0`,
    boxShadow: shadows.xl,
    transition: `transform ${transitions.slow}`,
    zIndex: zIndex.modal,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing[4]} ${spacing[5]}`,
    borderBottom: `1px solid ${colors.neutral[200]}`,
    flexShrink: 0,
  };

  const titleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    fontSize: typography.fontSize.base[0],
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[900],
    margin: 0,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: spacing[4],
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: spacing[6],
  };

  const sectionTitleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    fontSize: typography.fontSize.sm[0],
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[700],
    marginBottom: spacing[3],
  };

  const quickActionsStyle: React.CSSProperties = {
    display: 'flex',
    gap: spacing[3],
    flexWrap: 'wrap',
  };

  const emptyStateStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: spacing[6],
    color: colors.neutral[500],
    fontSize: typography.fontSize.sm[0],
  };

  return (
    <>
      {/* Overlay */}
      <div style={overlayStyle} onClick={onClose} />

      {/* Palette panel */}
      <div style={paletteStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={titleStyle}>
            <span style={{ width: '20px', height: '20px', display: 'flex', color: colors.ai.suggestion }}>
              <SparklesIcon />
            </span>
            AI Assistant
          </h2>
          <IconButton
            icon={<XIcon />}
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
              <div style={sectionTitleStyle}>
                <span style={{ width: '16px', height: '16px', display: 'flex', color: colors.status.error }}>
                  <AlertTriangleIcon />
                </span>
                Critical Alerts
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
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
              <div style={sectionTitleStyle}>
                <span style={{ width: '16px', height: '16px', display: 'flex', color: colors.status.warning }}>
                  <AlertTriangleIcon />
                </span>
                Alerts
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
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
              <div style={sectionTitleStyle}>
                <span style={{ width: '16px', height: '16px', display: 'flex', color: colors.ai.suggestion }}>
                  <SparklesIcon />
                </span>
                Suggestions
              </div>
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
              <div style={sectionTitleStyle}>
                <span style={{ width: '16px', height: '16px', display: 'flex', color: colors.primary[600] }}>
                  <ZapIcon />
                </span>
                Quick Actions
              </div>
              <div style={quickActionsStyle}>
                {onGenerateNote && (
                  <Button
                    variant="secondary"
                    size="md"
                    leftIcon={<FileTextIcon />}
                    onClick={onGenerateNote}
                  >
                    Generate Note
                  </Button>
                )}
                {onCheckInteractions && (
                  <Button
                    variant="secondary"
                    size="md"
                    leftIcon={<AlertTriangleIcon />}
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
              <div style={emptyStateStyle}>
                <span style={{
                  display: 'block',
                  width: '48px',
                  height: '48px',
                  margin: '0 auto',
                  marginBottom: spacing[3],
                  color: colors.neutral[300],
                }}>
                  <SparklesIcon />
                </span>
                <p style={{ margin: 0 }}>
                  No alerts or suggestions right now.
                </p>
                <p style={{ margin: 0, marginTop: spacing[1], color: colors.neutral[400] }}>
                  AI assistance will appear here as you work.
                </p>
              </div>
            )}
        </div>
      </div>
    </>
  );
};

Palette.displayName = 'Palette';
