/**
 * TaskList Component
 *
 * Grouped list of background tasks with batch actions.
 */

import React from 'react';
import type { BackgroundTask, TaskStatus } from '../../types/suggestions';
import { colors, spacing, typography, radii, transitions } from '../../styles/tokens';
import { TaskCard } from './TaskCard';
import { Button } from '../primitives/Button';
import { Badge } from '../primitives/Badge';

// ============================================================================
// Types
// ============================================================================

export interface TaskListProps {
  /** The tasks to display */
  tasks: BackgroundTask[];
  /** How to group tasks */
  groupBy?: 'status' | 'type' | 'none';
  /** Called when a task is approved */
  onApprove: (id: string) => void;
  /** Called when a task is rejected */
  onReject: (id: string, reason?: string) => void;
  /** Called when batch approve is clicked */
  onBatchApprove?: (ids: string[]) => void;
  /** Called when retry is clicked */
  onRetry?: (id: string) => void;
  /** Called when cancel is clicked */
  onCancel?: (id: string) => void;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Icons
// ============================================================================

const ChevronDownIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9,18 15,12 9,6" />
  </svg>
);

const CheckIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

const InboxIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22,12 16,12 14,15 10,15 8,12 2,12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

// ============================================================================
// Types for grouping
// ============================================================================

interface TaskGroup {
  key: string;
  label: string;
  tasks: BackgroundTask[];
  collapsed: boolean;
  badgeVariant: 'default' | 'success' | 'warning' | 'error' | 'info';
}

// ============================================================================
// Component
// ============================================================================

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  groupBy = 'status',
  onApprove,
  onReject,
  onBatchApprove,
  onRetry,
  onCancel,
  style,
}) => {
  const [collapsedGroups, setCollapsedGroups] = React.useState<Set<string>>(new Set());

  // Toggle group collapse
  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Group tasks
  const groups = React.useMemo<TaskGroup[]>(() => {
    if (groupBy === 'none') {
      return [{
        key: 'all',
        label: 'All Tasks',
        tasks,
        collapsed: false,
        badgeVariant: 'default',
      }];
    }

    if (groupBy === 'status') {
      const statusOrder: TaskStatus[] = ['ready', 'pending-review', 'processing', 'queued', 'completed', 'failed', 'cancelled'];
      const grouped = new Map<TaskStatus, BackgroundTask[]>();

      tasks.forEach((task) => {
        const existing = grouped.get(task.status) || [];
        grouped.set(task.status, [...existing, task]);
      });

      return statusOrder
        .filter((status) => grouped.has(status))
        .map((status) => ({
          key: status,
          label: getStatusLabel(status),
          tasks: grouped.get(status) || [],
          collapsed: collapsedGroups.has(status),
          badgeVariant: getStatusBadgeVariant(status),
        }));
    }

    if (groupBy === 'type') {
      const grouped = new Map<string, BackgroundTask[]>();

      tasks.forEach((task) => {
        const existing = grouped.get(task.type) || [];
        grouped.set(task.type, [...existing, task]);
      });

      return Array.from(grouped.entries()).map(([type, typeTasks]) => ({
        key: type,
        label: getTaskTypeLabel(type),
        tasks: typeTasks,
        collapsed: collapsedGroups.has(type),
        badgeVariant: 'default' as const,
      }));
    }

    return [];
  }, [tasks, groupBy, collapsedGroups]);

  // Empty state
  if (tasks.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing[8],
        color: colors.neutral[400],
        ...style,
      }}>
        <span style={{
          width: '48px',
          height: '48px',
          display: 'flex',
          marginBottom: spacing[3],
        }}>
          <InboxIcon />
        </span>
        <span style={{
          fontSize: typography.fontSize.sm[0],
          textAlign: 'center',
        }}>
          No background tasks
        </span>
      </div>
    );
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[4],
    ...style,
  };

  const groupHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing[2]} ${spacing[3]}`,
    backgroundColor: colors.neutral[50],
    borderRadius: radii.md,
    cursor: 'pointer',
    userSelect: 'none',
    transition: `background-color ${transitions.fast}`,
  };

  const groupTitleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    fontSize: typography.fontSize.sm[0],
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[700],
  };

  const groupActionsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
  };

  const taskListStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[2],
    paddingLeft: spacing[2],
  };

  return (
    <div style={containerStyle}>
      {groups.map((group) => {
        // Get tasks ready for batch approve
        const readyTasks = group.tasks.filter(t => t.status === 'ready');
        const showBatchApprove = onBatchApprove && readyTasks.length > 1;

        return (
          <div key={group.key}>
            {/* Group Header */}
            {groupBy !== 'none' && (
              <div
                style={groupHeaderStyle}
                onClick={() => toggleGroup(group.key)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && toggleGroup(group.key)}
              >
                <div style={groupTitleStyle}>
                  <span style={{
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    color: colors.neutral[500],
                    transform: group.collapsed ? 'rotate(0deg)' : 'rotate(0deg)',
                    transition: `transform ${transitions.fast}`,
                  }}>
                    {group.collapsed ? <ChevronRightIcon /> : <ChevronDownIcon />}
                  </span>
                  <span>{group.label}</span>
                  <Badge variant={group.badgeVariant} size="sm">
                    {group.tasks.length}
                  </Badge>
                </div>

                <div style={groupActionsStyle} onClick={(e) => e.stopPropagation()}>
                  {showBatchApprove && !group.collapsed && (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<CheckIcon />}
                      onClick={() => onBatchApprove(readyTasks.map(t => t.id))}
                    >
                      Send All ({readyTasks.length})
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Task List */}
            {!group.collapsed && (
              <div style={taskListStyle}>
                {group.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    compact
                    onApprove={() => onApprove(task.id)}
                    onReject={(reason) => onReject(task.id, reason)}
                    onRetry={onRetry ? () => onRetry(task.id) : undefined}
                    onCancel={onCancel ? () => onCancel(task.id) : undefined}
                  />
                ))}
              </div>
            )}

            {/* Empty group state */}
            {!group.collapsed && group.tasks.length === 0 && (
              <div style={{
                padding: spacing[4],
                textAlign: 'center',
                color: colors.neutral[400],
                fontSize: typography.fontSize.xs[0],
              }}>
                No tasks in this group
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// Helpers
// ============================================================================

function getStatusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    'queued': 'Queued',
    'processing': 'Processing',
    'pending-review': 'Needs Review',
    'ready': 'Ready to Send',
    'completed': 'Completed',
    'failed': 'Failed',
    'cancelled': 'Cancelled',
  };
  return labels[status] || status;
}

function getStatusBadgeVariant(status: TaskStatus): 'default' | 'success' | 'warning' | 'error' | 'info' {
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

function getTaskTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'dx-association': 'Diagnosis Association',
    'drug-interaction': 'Drug Interaction',
    'formulary-check': 'Formulary Check',
    'prior-auth-check': 'Prior Auth',
    'note-generation': 'Note Generation',
    'care-gap-evaluation': 'Care Gap Evaluation',
    'lab-send': 'Lab Orders',
    'rx-send': 'E-Prescriptions',
    'validation': 'Validation',
  };
  return labels[type] || type;
}

TaskList.displayName = 'TaskList';
