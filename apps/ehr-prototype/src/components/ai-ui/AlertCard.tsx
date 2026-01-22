/**
 * AlertCard Component
 *
 * Display component for AI-generated alerts.
 */

import React from 'react';
import type { Alert } from '../../types/suggestions';
import { colors, spacing, typography, radii, transitions } from '../../styles/tokens';
import { Card } from '../primitives/Card';
import { Button } from '../primitives/Button';

// ============================================================================
// Types
// ============================================================================

export interface AlertCardProps {
  /** The alert to display */
  alert: Alert;
  /** Called when acknowledged */
  onAcknowledge: () => void;
  /** Called when an action is taken */
  onAction: (actionId: string) => void;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Icons
// ============================================================================

const getSeverityIcon = (severity: Alert['severity']): React.ReactNode => {
  const iconStyle = { width: '100%', height: '100%' };

  switch (severity) {
    case 'critical':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case 'warning':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case 'info':
    default:
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
  }
};

// ============================================================================
// Component
// ============================================================================

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onAcknowledge,
  onAction,
  style,
}) => {
  const severityConfig = getSeverityConfig(alert.severity);
  const isAcknowledged = !!alert.acknowledgedAt;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[3],
    padding: spacing[4],
    borderLeft: `4px solid ${severityConfig.color}`,
    backgroundColor: severityConfig.bgColor,
    opacity: isAcknowledged ? 0.7 : 1,
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing[3],
  };

  const iconContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    backgroundColor: severityConfig.color,
    borderRadius: radii.full,
    color: colors.neutral[0],
    flexShrink: 0,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: typography.fontSize.sm[0],
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[900],
    margin: 0,
    marginBottom: spacing[1],
  };

  const messageStyle: React.CSSProperties = {
    fontSize: typography.fontSize.sm[0],
    color: colors.neutral[700],
    margin: 0,
    lineHeight: typography.fontSize.sm[1].lineHeight,
  };

  const timeStyle: React.CSSProperties = {
    fontSize: typography.fontSize.xs[0],
    color: colors.neutral[500],
    marginTop: spacing[2],
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing[2],
    paddingTop: spacing[3],
    borderTop: `1px solid ${colors.neutral[200]}`,
  };

  return (
    <Card variant="default" padding="none">
      <div style={containerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={iconContainerStyle}>
            <span style={{ width: '18px', height: '18px', display: 'flex' }}>
              {getSeverityIcon(alert.severity)}
            </span>
          </div>
          <div style={contentStyle}>
            <p style={titleStyle}>{alert.title}</p>
            <p style={messageStyle}>{alert.message}</p>
            <span style={timeStyle}>{formatTimeAgo(alert.createdAt)}</span>
          </div>
        </div>

        {/* Actions */}
        {alert.actions.length > 0 && !isAcknowledged && (
          <div style={actionsStyle}>
            {alert.actions.map((action, index) => (
              <Button
                key={index}
                variant={getButtonVariant(action.style)}
                size="sm"
                onClick={() => onAction(action.action)}
              >
                {action.label}
              </Button>
            ))}
            {alert.requiresAcknowledgment && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onAcknowledge}
              >
                Acknowledge
              </Button>
            )}
          </div>
        )}

        {/* Acknowledged state */}
        {isAcknowledged && (
          <div style={{
            fontSize: typography.fontSize.xs[0],
            color: colors.neutral[500],
          }}>
            Acknowledged{' '}
            {alert.acknowledgedAt && formatTimeAgo(alert.acknowledgedAt)}
          </div>
        )}
      </div>
    </Card>
  );
};

// ============================================================================
// Helpers
// ============================================================================

interface SeverityConfig {
  color: string;
  bgColor: string;
}

function getSeverityConfig(severity: Alert['severity']): SeverityConfig {
  switch (severity) {
    case 'critical':
      return {
        color: colors.status.error,
        bgColor: colors.status.errorLight,
      };
    case 'warning':
      return {
        color: colors.status.warning,
        bgColor: colors.status.warningLight,
      };
    case 'info':
    default:
      return {
        color: colors.status.info,
        bgColor: colors.status.infoLight,
      };
  }
}

function getButtonVariant(style: 'primary' | 'secondary' | 'danger'): 'primary' | 'secondary' | 'danger' {
  switch (style) {
    case 'primary':
      return 'primary';
    case 'danger':
      return 'danger';
    default:
      return 'secondary';
  }
}

function formatTimeAgo(date: Date): string {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

AlertCard.displayName = 'AlertCard';
