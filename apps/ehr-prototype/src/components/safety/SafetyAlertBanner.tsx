/**
 * SafetyAlertBanner Component
 *
 * Inline colored banner displayed below medication ChartItemCards when
 * a safety alert is present. Color-coded by severity:
 * - critical: red
 * - warning: amber
 * - info: blue
 *
 * Includes an "Acknowledge" button for dismissible alerts.
 */

import React from 'react';
import { AlertTriangle, Info, ShieldAlert, Check } from 'lucide-react';
import type { SafetyAlert } from '../../services/safety/types';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface SafetyAlertBannerProps {
  alert: SafetyAlert;
  onAcknowledge?: () => void;
  style?: React.CSSProperties;
}

// ============================================================================
// Component
// ============================================================================

export const SafetyAlertBanner: React.FC<SafetyAlertBannerProps> = ({
  alert,
  onAcknowledge,
  style,
}) => {
  const severityConfig = getSeverityConfig(alert.severity);

  if (alert.acknowledged) {
    return (
      <div
        style={{
          ...styles.container,
          backgroundColor: colors.bg.neutral.subtle,
          borderLeftColor: colors.fg.neutral.disabled,
          ...style,
        }}
        data-testid={`safety-alert-${alert.id}`}
      >
        <div style={styles.content}>
          <span style={{ ...styles.icon, color: colors.fg.neutral.disabled }}>
            <Check size={14} />
          </span>
          <span style={{ ...styles.message, color: colors.fg.neutral.spotReadable }}>
            {alert.message} — Acknowledged
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        ...styles.container,
        backgroundColor: severityConfig.bgColor,
        borderLeftColor: severityConfig.borderColor,
        ...style,
      }}
      data-testid={`safety-alert-${alert.id}`}
    >
      <div style={styles.content}>
        <span style={{ ...styles.icon, color: severityConfig.iconColor }}>
          {severityConfig.icon}
        </span>
        <div style={styles.textContainer}>
          <span style={{ ...styles.message, color: severityConfig.textColor }}>
            {alert.message}
          </span>
          {alert.details && (
            <span style={{ ...styles.details, color: severityConfig.detailColor }}>
              {alert.details}
            </span>
          )}
        </div>
      </div>
      {alert.dismissible && onAcknowledge && (
        <button
          type="button"
          style={{
            ...styles.acknowledgeButton,
            color: severityConfig.iconColor,
            borderColor: severityConfig.borderColor,
          }}
          onClick={onAcknowledge}
          data-testid={`acknowledge-alert-${alert.id}`}
        >
          Acknowledge
        </button>
      )}
    </div>
  );
};

// ============================================================================
// Helpers
// ============================================================================

interface SeverityConfig {
  bgColor: string;
  borderColor: string;
  iconColor: string;
  textColor: string;
  detailColor: string;
  icon: React.ReactNode;
}

function getSeverityConfig(severity: SafetyAlert['severity']): SeverityConfig {
  switch (severity) {
    case 'critical':
      return {
        bgColor: colors.bg.alert.subtle,
        borderColor: colors.fg.alert.secondary,
        iconColor: colors.fg.alert.secondary,
        textColor: colors.fg.alert.primary,
        detailColor: colors.fg.alert.secondary,
        icon: <ShieldAlert size={14} />,
      };
    case 'warning':
      return {
        bgColor: colors.bg.attention.subtle,
        borderColor: colors.fg.attention.secondary,
        iconColor: colors.fg.attention.secondary,
        textColor: colors.fg.attention.primary,
        detailColor: colors.fg.attention.secondary,
        icon: <AlertTriangle size={14} />,
      };
    case 'info':
    default:
      return {
        bgColor: colors.bg.information.subtle,
        borderColor: colors.fg.information.secondary,
        iconColor: colors.fg.information.secondary,
        textColor: colors.fg.information.primary,
        detailColor: colors.fg.information.secondary,
        icon: <Info size={14} />,
      };
  }
}

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
    borderLeft: '3px solid',
    borderRadius: `0 ${borderRadius.xs}px ${borderRadius.xs}px 0`,
    marginTop: spaceAround.nudge4,
    gap: spaceBetween.related,
  },
  content: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spaceBetween.repeating,
    flex: 1,
    minWidth: 0,
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.coupled,
  },
  message: {
    fontSize: 13,
    fontWeight: typography.fontWeight.medium,
    lineHeight: '18px',
  },
  details: {
    fontSize: 12,
    lineHeight: '16px',
  },
  acknowledgeButton: {
    flexShrink: 0,
    padding: `${spaceAround.nudge4}px ${spaceAround.compact}px`,
    fontSize: 12,
    fontWeight: typography.fontWeight.medium,
    backgroundColor: 'transparent',
    border: '1px solid',
    borderRadius: borderRadius.xs,
    cursor: 'pointer',
    transition: `opacity ${transitions.fast}`,
    whiteSpace: 'nowrap',
  },
};

SafetyAlertBanner.displayName = 'SafetyAlertBanner';
