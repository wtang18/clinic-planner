/**
 * AlertCard Component
 *
 * Display component for AI-generated alerts.
 */

import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import type { Alert } from '../../types/suggestions';
import { colors, spaceAround, spaceBetween, typography, transitions } from '../../styles/foundations';
import { formatTimeAgo } from '../../utils/formatTimeAgo';
import { Card } from '../primitives/Card';
import { Button } from '../primitives/Button';
import { CardIconContainer, type CardIconColor } from '../primitives/CardIconContainer';
import { ActionGroup } from '../primitives/ActionGroup';

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

  const severityToColor: CardIconColor = alert.severity === 'critical' ? 'alert'
    : alert.severity === 'warning' ? 'attention'
    : 'default';

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.relatedCompact,
    padding: spaceAround.default,
    backgroundColor: severityConfig.bgColor,
    opacity: isAcknowledged ? 0.7 : 1,
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spaceBetween.relatedCompact,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
    color: severityConfig.titleColor,
    margin: 0,
    marginBottom: spaceAround.nudge4,
  };

  const messageStyle: React.CSSProperties = {
    fontSize: 14,
    color: colors.fg.neutral.secondary,
    margin: 0,
    lineHeight: '20px',
  };

  const timeStyle: React.CSSProperties = {
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
    marginTop: spaceAround.tight,
  };


  const getSeverityIcon = () => {
    switch (alert.severity) {
      case 'critical':
        return <AlertTriangle size={18} />;
      case 'warning':
        return <AlertCircle size={18} />;
      case 'info':
      default:
        return <Info size={18} />;
    }
  };

  return (
    <Card variant="default" padding="none">
      <div style={containerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <CardIconContainer color={severityToColor} filled={false} size="md">
            {getSeverityIcon()}
          </CardIconContainer>
          <div style={contentStyle}>
            <p style={titleStyle}>{alert.title}</p>
            <p style={messageStyle}>{alert.message}</p>
            <span style={timeStyle}>{formatTimeAgo(alert.createdAt)}</span>
          </div>
        </div>

        {/* Actions */}
        {alert.actions.length > 0 && !isAcknowledged && (
          <ActionGroup style={{ flexWrap: 'wrap', paddingTop: spaceAround.compact }}>
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
          </ActionGroup>
        )}

        {/* Acknowledged state */}
        {isAcknowledged && (
          <div style={{
            fontSize: 12,
            color: colors.fg.neutral.spotReadable,
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
  iconColor: string;
  titleColor: string;
  bgColor: string;
}

function getSeverityConfig(severity: Alert['severity']): SeverityConfig {
  switch (severity) {
    case 'critical':
      return {
        iconColor: colors.fg.alert.secondary,
        titleColor: colors.fg.neutral.primary,
        bgColor: colors.bg.alert.subtle,
      };
    case 'warning':
      return {
        iconColor: colors.fg.attention.secondary,
        titleColor: colors.fg.attention.secondary,
        bgColor: colors.bg.neutral.base,
      };
    case 'info':
    default:
      return {
        iconColor: colors.fg.information.secondary,
        titleColor: colors.fg.neutral.primary,
        bgColor: colors.bg.neutral.base,
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

AlertCard.displayName = 'AlertCard';
