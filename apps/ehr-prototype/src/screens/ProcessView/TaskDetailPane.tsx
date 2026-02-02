/**
 * TaskDetailPane Component
 *
 * Detail panel for viewing and acting on a selected task.
 */

import React from 'react';
import { ClipboardList, Check, X, RefreshCw } from 'lucide-react';
import type { BackgroundTask, ChartItem } from '../../types';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions } from '../../styles/foundations';
import { Card } from '../../components/primitives/Card';
import { Button } from '../../components/primitives/Button';
import { Badge } from '../../components/primitives/Badge';
import { ChartItemCard } from '../../components/chart-items/ChartItemCard';

// ============================================================================
// Types
// ============================================================================

export interface TaskDetailPaneProps {
  /** The selected task */
  task: BackgroundTask | null;
  /** Related chart item if any */
  relatedItem?: ChartItem | null;
  /** Called when approve is clicked */
  onApprove: () => void;
  /** Called when reject is clicked */
  onReject: (reason?: string) => void;
  /** Called when retry is clicked */
  onRetry?: () => void;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Component
// ============================================================================

export const TaskDetailPane: React.FC<TaskDetailPaneProps> = ({
  task,
  relatedItem,
  onApprove,
  onReject,
  onRetry,
  style,
}) => {
  const [rejectReason, setRejectReason] = React.useState('');
  const [showRejectForm, setShowRejectForm] = React.useState(false);

  // Reset state when task changes
  React.useEffect(() => {
    setRejectReason('');
    setShowRejectForm(false);
  }, [task?.id]);

  // Empty state
  if (!task) {
    return (
      <div style={{ ...styles.emptyState, ...style }}>
        <div style={styles.emptyIcon}>
          <ClipboardList size={64} />
        </div>
        <div style={styles.emptyTitle}>Select a Task</div>
        <div style={styles.emptyDescription}>
          Choose a task from the list to view details and take action.
        </div>
      </div>
    );
  }

  // Get status badge variant
  const getStatusVariant = (): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    switch (task.status) {
      case 'completed':
        return 'success';
      case 'pending-review':
        return 'warning';
      case 'failed':
        return 'error';
      case 'processing':
      case 'queued':
        return 'info';
      default:
        return 'default';
    }
  };

  // Get task type label
  const getTaskTypeLabel = () => {
    const labels: Record<string, string> = {
      'dx-association': 'Diagnosis Association',
      'drug-interaction': 'Drug Interaction Check',
      'care-gap-evaluation': 'Care Gap Evaluation',
      'note-generation': 'Note Generation',
      'prior-auth': 'Prior Authorization',
      'lab-order': 'Lab Order',
      'imaging-order': 'Imaging Order',
      'referral': 'Referral',
      'prescription': 'Prescription',
    };
    return labels[task.type] || task.type;
  };

  // Handle reject
  const handleReject = () => {
    if (showRejectForm) {
      onReject(rejectReason || undefined);
      setShowRejectForm(false);
      setRejectReason('');
    } else {
      setShowRejectForm(true);
    }
  };

  // Can take action
  const canApprove = task.status === 'ready' || task.status === 'pending-review';
  const canRetry = task.status === 'failed';
  const isProcessing = task.status === 'processing' || task.status === 'queued';

  return (
    <div style={{ ...styles.container, ...style }} data-testid="task-detail-panel">
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>{task.displayStatus}</h3>
          <div style={styles.meta}>
            <Badge variant={getStatusVariant()} size="sm">
              {task.status}
            </Badge>
            <span style={styles.taskType}>{getTaskTypeLabel()}</span>
          </div>
        </div>
      </div>

      {/* Related Item */}
      {relatedItem && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Related Item</div>
          <ChartItemCard item={relatedItem} variant="compact" />
        </div>
      )}

      {/* Task Result */}
      {task.result != null && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Result</div>
          <Card variant="default" padding="md">
            <pre style={styles.resultPre}>
              {typeof task.result === 'string'
                ? task.result
                : JSON.stringify(task.result, null, 2)}
            </pre>
          </Card>
        </div>
      )}

      {/* Error Info */}
      {task.error && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Error</div>
          <Card variant="elevated" padding="md" style={{ backgroundColor: colors.bg.alert.subtle }}>
            <div style={styles.errorMessage}>{task.error}</div>
          </Card>
        </div>
      )}

      {/* Progress */}
      {isProcessing && task.progress !== undefined && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Progress</div>
          <div style={styles.progressContainer}>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${task.progress}%`,
                }}
              />
            </div>
            <span style={styles.progressText}>{task.progress}%</span>
          </div>
        </div>
      )}

      {/* Reject Form */}
      {showRejectForm && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Rejection Reason (optional)</div>
          <textarea
            style={styles.rejectTextarea}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter reason for rejection..."
            rows={3}
          />
        </div>
      )}

      {/* Actions */}
      <div style={styles.actions}>
        {canRetry && onRetry && (
          <Button
            variant="secondary"
            onClick={onRetry}
            leftIcon={<RefreshCw size={16} />}
          >
            Retry
          </Button>
        )}

        {canApprove && (
          <>
            <Button
              variant="secondary"
              onClick={handleReject}
              leftIcon={showRejectForm ? undefined : <X size={16} />}
            >
              {showRejectForm ? 'Confirm Reject' : 'Reject'}
            </Button>

            {showRejectForm && (
              <Button
                variant="ghost"
                onClick={() => setShowRejectForm(false)}
              >
                Cancel
              </Button>
            )}

            {!showRejectForm && (
              <Button
                variant="primary"
                onClick={onApprove}
                leftIcon={<Check size={16} />}
                data-testid="task-detail-approve-btn"
              >
                Approve
              </Button>
            )}
          </>
        )}

        {isProcessing && (
          <div style={styles.processingNote}>
            Task is currently processing...
          </div>
        )}
      </div>

      {/* Timestamps */}
      <div style={styles.timestamps}>
        <div style={styles.timestamp}>
          <span style={styles.timestampLabel}>Created:</span>
          <span>{task.createdAt.toLocaleString()}</span>
        </div>
        {task.completedAt && (
          <div style={styles.timestamp}>
            <span style={styles.timestampLabel}>Completed:</span>
            <span>{task.completedAt.toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'auto',
    padding: spaceAround.defaultPlus,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: colors.fg.neutral.spotReadable,
    textAlign: 'center',
    padding: spaceAround.generous,
  },
  emptyIcon: {
    width: '64px',
    height: '64px',
    marginBottom: spaceAround.default,
    color: colors.border.neutral.medium,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.secondary,
    marginBottom: spaceAround.tight,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.fg.neutral.spotReadable,
    maxWidth: '280px',
  },
  header: {
    marginBottom: spaceAround.defaultPlus,
  },
  title: {
    fontSize: 20,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.primary,
    margin: 0,
    marginBottom: spaceAround.tight,
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
  },
  taskType: {
    fontSize: 14,
    color: colors.fg.neutral.spotReadable,
  },
  section: {
    marginBottom: spaceAround.defaultPlus,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.secondary,
    marginBottom: spaceAround.tight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultPre: {
    fontSize: 12,
    fontFamily: typography.fontFamily.mono,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    margin: 0,
    color: colors.fg.neutral.secondary,
    maxHeight: '300px',
    overflow: 'auto',
  },
  errorMessage: {
    fontSize: 14,
    color: colors.fg.alert.secondary,
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
  },
  progressBar: {
    flex: 1,
    height: '8px',
    backgroundColor: colors.border.neutral.low,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.fg.accent.primary,
    borderRadius: borderRadius.full,
    transition: `width ${transitions.fast}`,
  },
  progressText: {
    fontSize: 14,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.secondary,
  },
  rejectTextarea: {
    width: '100%',
    padding: spaceAround.compact,
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    border: `1px solid ${colors.border.neutral.medium}`,
    borderRadius: borderRadius.sm,
    resize: 'vertical',
    outline: 'none',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    marginTop: 'auto',
    paddingTop: spaceAround.defaultPlus,
    borderTop: `1px solid ${colors.border.neutral.low}`,
  },
  processingNote: {
    fontSize: 14,
    color: colors.fg.neutral.spotReadable,
    fontStyle: 'italic',
  },
  timestamps: {
    marginTop: spaceAround.defaultPlus,
    paddingTop: spaceAround.default,
    borderTop: `1px solid ${colors.bg.neutral.subtle}`,
  },
  timestamp: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
    marginBottom: spaceAround.nudge4,
  },
  timestampLabel: {
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.secondary,
  },
};

TaskDetailPane.displayName = 'TaskDetailPane';
