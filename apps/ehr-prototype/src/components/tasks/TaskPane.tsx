/**
 * TaskPane Component
 *
 * Full task pane panel that slides in from the right.
 */

import React from 'react';
import { X, Send, List } from 'lucide-react';
import type { BackgroundTask, TaskStatus } from '../../types/suggestions';
import { colors, spaceAround, spaceBetween, borderRadius, typography, shadows, transitions, zIndex } from '../../styles/foundations';
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
    backgroundColor: colors.bg.neutral.base,
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
    padding: `${spaceAround.default}px ${spaceAround.defaultPlus}px`,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
    flexShrink: 0,
  };

  const headerLeftStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 18,
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

  const sectionHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spaceAround.compact,
  };

  const sectionTitleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  };

  const emptyStateStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spaceAround.generous,
    color: colors.fg.neutral.disabled,
    textAlign: 'center',
  };

  const footerStyle: React.CSSProperties = {
    padding: `${spaceAround.default}px ${spaceAround.defaultPlus}px`,
    borderTop: `1px solid ${colors.border.neutral.low}`,
    backgroundColor: colors.bg.neutral.min,
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
            fontSize: 12,
            color: colors.fg.neutral.spotReadable,
            paddingLeft: spaceAround.tight,
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
            <List size={24} color={colors.fg.neutral.spotReadable} />
            <h2 style={titleStyle}>Tasks</h2>
            {hasActiveTasks && (
              <Badge variant="info" size="sm">{activeTasks.length} active</Badge>
            )}
          </div>
          <IconButton
            icon={<X size={20} />}
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
              <List size={48} style={{ marginBottom: spaceAround.compact }} />
              <p style={{
                fontSize: 16,
                fontWeight: typography.fontWeight.medium,
                color: colors.fg.neutral.secondary,
                margin: 0,
                marginBottom: spaceAround.tight,
              }}>
                No background tasks
              </p>
              <p style={{
                fontSize: 14,
                color: colors.fg.neutral.disabled,
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
                  leftIcon={<Send size={16} />}
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
              fontSize: 14,
              color: colors.fg.neutral.secondary,
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
