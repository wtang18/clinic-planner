/**
 * TaskPane Component
 *
 * Full task pane panel that slides in from the right.
 */

import React from 'react';
import type { BackgroundTask, TaskStatus } from '../../types/suggestions';
import { colors, spacing, typography, radii, shadows, transitions, zIndex } from '../../styles/tokens';
import { TaskList } from './TaskList';
import { Button } from '../primitives/Button';
import { Badge } from '../primitives/Badge';
import { IconButton } from '../primitives/IconButton';

// ============================================================================
// Types
// ============================================================================

export interface TaskPaneProps {
  /** Whether the pane is open */
  isOpen: boolean;
  /** Called when close is clicked */
  onClose: () => void;
  /** The tasks to display */
  tasks?: BackgroundTask[];
  /** Called when a task is approved */
  onApprove?: (id: string) => void;
  /** Called when a task is rejected */
  onReject?: (id: string, reason?: string) => void;
  /** Called when batch approve is clicked */
  onBatchApprove?: (ids: string[]) => void;
  /** Called when retry is clicked */
  onRetry?: (id: string) => void;
  /** Called when cancel is clicked */
  onCancel?: (id: string) => void;
  /** Width of the pane */
  width?: string;
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

const SendIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22,2 15,22 11,13 2,9" />
  </svg>
);

const ListIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

// ============================================================================
// Component
// ============================================================================

export const TaskPane: React.FC<TaskPaneProps> = ({
  isOpen,
  onClose,
  tasks = [],
  onApprove = () => {},
  onReject = () => {},
  onBatchApprove,
  onRetry,
  onCancel,
  width = '400px',
  style,
}) => {
  const [showCompleted, setShowCompleted] = React.useState(false);

  // Categorize tasks
  const readyTasks = tasks.filter(t => t.status === 'ready');
  const reviewTasks = tasks.filter(t => t.status === 'pending-review');
  const processingTasks = tasks.filter(t => t.status === 'processing' || t.status === 'queued');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const failedTasks = tasks.filter(t => t.status === 'failed');

  const activeTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
  const hasActiveTasks = activeTasks.length > 0;

  // Overlay styles
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

  // Pane styles
  const paneStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width,
    backgroundColor: colors.neutral[0],
    boxShadow: shadows.xl,
    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
    transition: `transform ${transitions.slow}`,
    zIndex: zIndex.modal,
    display: 'flex',
    flexDirection: 'column',
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

  const headerLeftStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
  };

  const titleStyle: React.CSSProperties = {
    fontSize: typography.fontSize.lg[0],
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

  const sectionHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  };

  const sectionTitleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    fontSize: typography.fontSize.sm[0],
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[700],
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
  };

  const emptyStateStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[8],
    color: colors.neutral[400],
    textAlign: 'center',
  };

  const footerStyle: React.CSSProperties = {
    padding: `${spacing[4]} ${spacing[5]}`,
    borderTop: `1px solid ${colors.neutral[200]}`,
    backgroundColor: colors.neutral[50],
    flexShrink: 0,
  };

  // Section component
  const Section: React.FC<{
    title: string;
    count: number;
    tasks: BackgroundTask[];
    badgeVariant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    action?: React.ReactNode;
    collapsible?: boolean;
  }> = ({ title, count, tasks, badgeVariant = 'default', action, collapsible }) => {
    const [collapsed, setCollapsed] = React.useState(collapsible);

    if (count === 0) return null;

    return (
      <div style={sectionStyle}>
        <div
          style={{
            ...sectionHeaderStyle,
            cursor: collapsible ? 'pointer' : 'default',
          }}
          onClick={collapsible ? () => setCollapsed(!collapsed) : undefined}
        >
          <div style={sectionTitleStyle}>
            {title}
            <Badge variant={badgeVariant} size="sm">{count}</Badge>
          </div>
          {action}
        </div>
        {!collapsed && (
          <TaskList
            tasks={tasks}
            groupBy="none"
            onApprove={onApprove}
            onReject={onReject}
            onRetry={onRetry}
            onCancel={onCancel}
          />
        )}
        {collapsed && (
          <div style={{
            fontSize: typography.fontSize.xs[0],
            color: colors.neutral[500],
            paddingLeft: spacing[2],
          }}>
            Click to expand
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Overlay */}
      <div style={overlayStyle} onClick={onClose} />

      {/* Pane */}
      <div style={paneStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={headerLeftStyle}>
            <span style={{ width: '24px', height: '24px', display: 'flex', color: colors.neutral[500] }}>
              <ListIcon />
            </span>
            <h2 style={titleStyle}>Tasks</h2>
            {hasActiveTasks && (
              <Badge variant="info" size="sm">{activeTasks.length} active</Badge>
            )}
          </div>
          <IconButton
            icon={<XIcon />}
            label="Close task pane"
            variant="ghost"
            size="md"
            onClick={onClose}
          />
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {/* Empty state */}
          {tasks.length === 0 && (
            <div style={emptyStateStyle}>
              <span style={{
                width: '48px',
                height: '48px',
                display: 'flex',
                marginBottom: spacing[3],
              }}>
                <ListIcon />
              </span>
              <p style={{
                fontSize: typography.fontSize.base[0],
                fontWeight: typography.fontWeight.medium,
                color: colors.neutral[600],
                margin: 0,
                marginBottom: spacing[2],
              }}>
                No background tasks
              </p>
              <p style={{
                fontSize: typography.fontSize.sm[0],
                color: colors.neutral[400],
                margin: 0,
              }}>
                Tasks will appear here as you work
              </p>
            </div>
          )}

          {/* Ready to Send */}
          <Section
            title="Ready to Send"
            count={readyTasks.length}
            tasks={readyTasks}
            badgeVariant="success"
            action={
              readyTasks.length > 1 && onBatchApprove && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<SendIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onBatchApprove(readyTasks.map(t => t.id));
                  }}
                >
                  Send All
                </Button>
              )
            }
          />

          {/* Needs Review */}
          <Section
            title="Needs Review"
            count={reviewTasks.length}
            tasks={reviewTasks}
            badgeVariant="warning"
          />

          {/* Processing */}
          <Section
            title="Processing"
            count={processingTasks.length}
            tasks={processingTasks}
            badgeVariant="info"
          />

          {/* Failed */}
          <Section
            title="Failed"
            count={failedTasks.length}
            tasks={failedTasks}
            badgeVariant="error"
          />

          {/* Completed */}
          <Section
            title="Completed"
            count={completedTasks.length}
            tasks={completedTasks}
            badgeVariant="default"
            collapsible
          />
        </div>

        {/* Footer with summary */}
        {hasActiveTasks && (
          <div style={footerStyle}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: typography.fontSize.sm[0],
              color: colors.neutral[600],
            }}>
              <span>
                {processingTasks.length > 0 && `${processingTasks.length} processing`}
                {processingTasks.length > 0 && readyTasks.length > 0 && ' · '}
                {readyTasks.length > 0 && `${readyTasks.length} ready`}
                {(processingTasks.length > 0 || readyTasks.length > 0) && reviewTasks.length > 0 && ' · '}
                {reviewTasks.length > 0 && `${reviewTasks.length} need review`}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

TaskPane.displayName = 'TaskPane';
