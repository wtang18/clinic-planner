/**
 * TaskCard Component
 *
 * Individual background task display with status and actions.
 */

import React from 'react';
import { Check, X, RefreshCw, Send, AlertCircle, Clock, Link, AlertTriangle, FlaskConical, FileText, CircleDot } from 'lucide-react';
import type { BackgroundTask } from '../../types/suggestions';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions } from '../../styles/foundations';
import { formatTimeAgo } from '../../utils/formatTimeAgo';
import { Card } from '../primitives/Card';
import { StatusBadge } from '../primitives/StatusBadge';
import { Button } from '../primitives/Button';
import { Spinner } from '../primitives/Spinner';
import { CardIconContainer } from '../primitives/CardIconContainer';
import { ActionGroup } from '../primitives/ActionGroup';

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

// Task type icons
const getTaskTypeIcon = (type: BackgroundTask['type'], size: number): React.ReactNode => {
  switch (type) {
    case 'dx-association':
      return <Link size={size} />;
    case 'drug-interaction':
      return <AlertTriangle size={size} />;
    case 'rx-send':
      return <Send size={size} />;
    case 'lab-send':
      return <FlaskConical size={size} />;
    case 'note-generation':
      return <FileText size={size} />;
    default:
      return <CircleDot size={size} />;
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
  const isProcessing = task.status === 'processing';
  const hasFailed = task.status === 'failed';
  const needsReview = task.status === 'pending-review';
  const isReady = task.status === 'ready';

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: compact ? 'row' : 'column',
    gap: spaceBetween.relatedCompact,
    padding: compact ? spaceAround.compact : spaceAround.default,
    backgroundColor: hasFailed ? colors.bg.alert.subtle : colors.bg.neutral.base,
    transition: `all ${transitions.fast}`,
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: compact ? 'center' : 'flex-start',
    gap: spaceBetween.relatedCompact,
    flex: 1,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.coupled,
  };

  const titleRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spaceBetween.repeating,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: compact ? 14 : 16,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.primary,
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const statusTextStyle: React.CSSProperties = {
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
  };

  const progressContainerStyle: React.CSSProperties = {
    marginTop: spaceAround.tight,
  };

  const progressBarBgStyle: React.CSSProperties = {
    height: '4px',
    backgroundColor: colors.border.neutral.low,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  };

  const progressBarFillStyle: React.CSSProperties = {
    height: '100%',
    backgroundColor: colors.fg.neutral.secondary,
    borderRadius: borderRadius.full,
    width: `${task.progress || 0}%`,
    transition: `width ${transitions.base}`,
  };

  const errorStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    padding: spaceAround.tight,
    backgroundColor: colors.bg.alert.subtle,
    borderRadius: borderRadius.sm,
    fontSize: 12,
    color: colors.fg.alert.secondary,
    marginTop: spaceAround.tight,
  };

  const resultPreviewStyle: React.CSSProperties = {
    padding: spaceAround.tight,
    backgroundColor: colors.bg.neutral.min,
    borderRadius: borderRadius.sm,
    fontSize: 12,
    color: colors.fg.neutral.secondary,
    marginTop: spaceAround.tight,
    maxHeight: '60px',
    overflow: 'hidden',
  };


  const timeStyle: React.CSSProperties = {
    fontSize: 12,
    color: colors.fg.neutral.disabled,
  };

  return (
    <Card variant="default" padding="none" data-testid={`task-card-${task.id}`}>
      <div style={containerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          {/* Icon */}
          <CardIconContainer color={hasFailed ? 'alert' : 'default'} size={compact ? 'sm' : 'lg'}>
            {isProcessing ? (
              <Spinner size="sm" color={colors.fg.neutral.secondary} />
            ) : (
              getTaskTypeIcon(task.type, compact ? 14 : 18)
            )}
          </CardIconContainer>

          {/* Content */}
          <div style={contentStyle}>
            <div style={titleRowStyle}>
              <p style={titleStyle}>{task.displayTitle}</p>
              <StatusBadge status={task.status} label={task.displayStatus} />
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
                <AlertCircle size={14} />
                <span>{String(task.error)}</span>
              </div>
            )}

            {/* Result preview */}
            {(needsReview || isReady) && task.result != null && !compact && (
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
        <ActionGroup style={{ flexShrink: 0, marginTop: compact ? 0 : spaceAround.compact }}>
          {/* Ready/Needs Review: Approve/Reject */}
          {(needsReview || isReady) && (
            <>
              {onApprove && (
                <Button
                  variant={isReady ? 'primary' : 'secondary'}
                  size="sm"
                  leftIcon={isReady ? <Send size={14} /> : <Check size={14} />}
                  onClick={onApprove}
                  data-testid={`task-approve-${task.id}`}
                >
                  {isReady ? 'Send' : 'Approve'}
                </Button>
              )}
              {onReject && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReject()}
                  data-testid={`task-reject-${task.id}`}
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
              leftIcon={<RefreshCw size={14} />}
              onClick={onRetry}
              data-testid={`task-retry-${task.id}`}
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
        </ActionGroup>
      </div>
    </Card>
  );
};

// ============================================================================
// Helpers
// ============================================================================

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

TaskCard.displayName = 'TaskCard';
