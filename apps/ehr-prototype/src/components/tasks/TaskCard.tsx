/**
 * TaskCard Component
 *
 * Individual background task display with status and actions.
 */

import React from 'react';
import type { BackgroundTask } from '../../types/suggestions';
import { colors, spacing, typography, radii, transitions } from '../../styles/tokens';
import { Card } from '../primitives/Card';
import { Badge } from '../primitives/Badge';
import { Button } from '../primitives/Button';
import { Spinner } from '../primitives/Spinner';

// ============================================================================
// Types
// ============================================================================

export interface TaskCardProps {
  /** The task to display */
  task: BackgroundTask;
  /** Called when approved */
  onApprove?: () => void;
  /** Called when rejected */
  onReject?: (reason?: string) => void;
  /** Called when retry is clicked */
  onRetry?: () => void;
  /** Called when cancel is clicked */
  onCancel?: () => void;
  /** Compact display mode */
  compact?: boolean;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Icons
// ============================================================================

const CheckIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

const XIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23,4 23,10 17,10" />
    <polyline points="1,20 1,14 7,14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const SendIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22,2 15,22 11,13 2,9" />
  </svg>
);

const AlertIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const ClockIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);

// Task type icons
const getTaskTypeIcon = (type: BackgroundTask['type']): React.ReactNode => {
  switch (type) {
    case 'dx-association':
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      );
    case 'drug-interaction':
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case 'rx-send':
      return <SendIcon />;
    case 'lab-send':
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 3h6v5.5l3 5.5v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-4l3-5.5V3z" />
          <path d="M9 3h6" />
        </svg>
      );
    case 'note-generation':
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    default:
      return <ClockIcon />;
  }
};

// ============================================================================
// Component
// ============================================================================

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onApprove,
  onReject,
  onRetry,
  onCancel,
  compact = false,
  style,
}) => {
  const statusColor = getStatusColor(task.status);
  const statusBgColor = getStatusBgColor(task.status);
  const isProcessing = task.status === 'processing';
  const hasFailed = task.status === 'failed';
  const needsReview = task.status === 'pending-review';
  const isReady = task.status === 'ready';

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: compact ? 'row' : 'column',
    gap: compact ? spacing[3] : spacing[3],
    padding: compact ? spacing[3] : spacing[4],
    borderLeft: `3px solid ${statusColor}`,
    transition: `all ${transitions.fast}`,
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: compact ? 'center' : 'flex-start',
    gap: spacing[3],
    flex: 1,
  };

  const iconContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: compact ? '28px' : '36px',
    height: compact ? '28px' : '36px',
    backgroundColor: statusBgColor,
    borderRadius: radii.lg,
    color: statusColor,
    flexShrink: 0,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[1],
  };

  const titleRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
  };

  const titleStyle: React.CSSProperties = {
    fontSize: compact ? typography.fontSize.sm[0] : typography.fontSize.base[0],
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[900],
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const statusTextStyle: React.CSSProperties = {
    fontSize: typography.fontSize.xs[0],
    color: colors.neutral[500],
  };

  const progressContainerStyle: React.CSSProperties = {
    marginTop: spacing[2],
  };

  const progressBarBgStyle: React.CSSProperties = {
    height: '4px',
    backgroundColor: colors.neutral[200],
    borderRadius: radii.full,
    overflow: 'hidden',
  };

  const progressBarFillStyle: React.CSSProperties = {
    height: '100%',
    backgroundColor: statusColor,
    borderRadius: radii.full,
    width: `${task.progress || 0}%`,
    transition: `width ${transitions.base}`,
  };

  const errorStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    padding: spacing[2],
    backgroundColor: colors.status.errorLight,
    borderRadius: radii.md,
    fontSize: typography.fontSize.xs[0],
    color: colors.status.error,
    marginTop: spacing[2],
  };

  const resultPreviewStyle: React.CSSProperties = {
    padding: spacing[2],
    backgroundColor: colors.neutral[50],
    borderRadius: radii.md,
    fontSize: typography.fontSize.xs[0],
    color: colors.neutral[600],
    marginTop: spacing[2],
    maxHeight: '60px',
    overflow: 'hidden',
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    flexShrink: 0,
    marginTop: compact ? 0 : spacing[3],
  };

  const timeStyle: React.CSSProperties = {
    fontSize: typography.fontSize.xs[0],
    color: colors.neutral[400],
  };

  return (
    <Card variant="default" padding="none">
      <div style={containerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          {/* Icon */}
          <div style={iconContainerStyle}>
            <div style={{ width: compact ? '14px' : '18px', height: compact ? '14px' : '18px' }}>
              {isProcessing ? (
                <Spinner size="sm" color={statusColor} />
              ) : (
                getTaskTypeIcon(task.type)
              )}
            </div>
          </div>

          {/* Content */}
          <div style={contentStyle}>
            <div style={titleRowStyle}>
              <p style={titleStyle}>{task.displayTitle}</p>
              <Badge variant={getStatusVariant(task.status)} size="sm">
                {task.displayStatus}
              </Badge>
            </div>

            {!compact && (
              <>
                <span style={statusTextStyle}>
                  {task.progressMessage || getTaskTypeLabel(task.type)}
                </span>
                {task.createdAt && (
                  <span style={timeStyle}>{formatTimeAgo(task.createdAt)}</span>
                )}
              </>
            )}

            {/* Progress bar (processing) */}
            {isProcessing && !compact && task.progress !== undefined && (
              <div style={progressContainerStyle}>
                <div style={progressBarBgStyle}>
                  <div style={progressBarFillStyle} />
                </div>
              </div>
            )}

            {/* Error message */}
            {hasFailed && task.error && !compact && (
              <div style={errorStyle}>
                <span style={{ width: '14px', height: '14px', display: 'flex', flexShrink: 0 }}>
                  <AlertIcon />
                </span>
                <span>{String(task.error)}</span>
              </div>
            )}

            {/* Result preview */}
            {(needsReview || isReady) && task.result && !compact && (
              <div style={resultPreviewStyle}>
                {String(
                  typeof task.result === 'string'
                    ? task.result
                    : JSON.stringify(task.result).slice(0, 100) + '...'
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={actionsStyle}>
          {/* Ready/Needs Review: Approve/Reject */}
          {(needsReview || isReady) && (
            <>
              {onApprove && (
                <Button
                  variant={isReady ? 'primary' : 'secondary'}
                  size="sm"
                  leftIcon={isReady ? <SendIcon /> : <CheckIcon />}
                  onClick={onApprove}
                >
                  {isReady ? 'Send' : 'Approve'}
                </Button>
              )}
              {onReject && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReject()}
                >
                  Reject
                </Button>
              )}
            </>
          )}

          {/* Failed: Retry */}
          {hasFailed && onRetry && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshIcon />}
              onClick={onRetry}
            >
              Retry
            </Button>
          )}

          {/* Processing: Cancel */}
          {isProcessing && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// Helpers
// ============================================================================

function getStatusColor(status: BackgroundTask['status']): string {
  switch (status) {
    case 'queued':
      return colors.neutral[400];
    case 'processing':
      return colors.status.info;
    case 'pending-review':
      return colors.status.warning;
    case 'ready':
      return colors.status.success;
    case 'completed':
      return colors.status.success;
    case 'failed':
      return colors.status.error;
    case 'cancelled':
      return colors.neutral[400];
    default:
      return colors.neutral[500];
  }
}

function getStatusBgColor(status: BackgroundTask['status']): string {
  switch (status) {
    case 'queued':
      return colors.neutral[100];
    case 'processing':
      return colors.status.infoLight;
    case 'pending-review':
      return colors.status.warningLight;
    case 'ready':
      return colors.status.successLight;
    case 'completed':
      return colors.status.successLight;
    case 'failed':
      return colors.status.errorLight;
    case 'cancelled':
      return colors.neutral[100];
    default:
      return colors.neutral[100];
  }
}

function getStatusVariant(status: BackgroundTask['status']): 'default' | 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case 'queued':
      return 'default';
    case 'processing':
      return 'info';
    case 'pending-review':
      return 'warning';
    case 'ready':
      return 'success';
    case 'completed':
      return 'success';
    case 'failed':
      return 'error';
    case 'cancelled':
      return 'default';
    default:
      return 'default';
  }
}

function getTaskTypeLabel(type: BackgroundTask['type']): string {
  const labels: Record<string, string> = {
    'dx-association': 'Diagnosis association',
    'drug-interaction': 'Drug interaction check',
    'formulary-check': 'Formulary check',
    'prior-auth-check': 'Prior auth check',
    'note-generation': 'Note generation',
    'care-gap-evaluation': 'Care gap evaluation',
    'lab-send': 'Lab order',
    'rx-send': 'E-prescribe',
    'validation': 'Validation',
  };
  return labels[type] || type;
}

function formatTimeAgo(date: Date): string {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  return date.toLocaleTimeString();
}

TaskCard.displayName = 'TaskCard';
