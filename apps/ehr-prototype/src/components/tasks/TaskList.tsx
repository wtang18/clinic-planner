/**
 * TaskList Component
 *
 * Grouped list of background tasks with batch actions.
 */

import React from 'react';
import { Check, Inbox } from 'lucide-react';
import type { BackgroundTask, TaskStatus } from '../../types/suggestions';
import { colors, spaceAround, spaceBetween } from '../../styles/foundations';
import { TaskCard } from './TaskCard';
import { Button } from '../primitives/Button';
import { CollapsibleGroup } from '../primitives/CollapsibleGroup';
import { EmptyState } from '../primitives/EmptyState';

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
      <EmptyState
        icon={<Inbox size={48} />}
        title="No background tasks"
        size="lg"
        style={style}
      />
    );
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.related,
    ...style,
  };

  const taskListStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.repeating,
    paddingLeft: spaceAround.tight,
  };

  return (
    <div style={containerStyle}>
      {groups.map((group) => {
        // Get tasks ready for batch approve
        const readyTasks = group.tasks.filter(t => t.status === 'ready');
        const showBatchApprove = onBatchApprove && readyTasks.length > 1;

        const batchApproveButton = showBatchApprove && !group.collapsed ? (
          <div onClick={(e) => e.stopPropagation()}>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Check size={16} />}
              onClick={() => onBatchApprove(readyTasks.map(t => t.id))}
            >
              Send All ({readyTasks.length})
            </Button>
          </div>
        ) : undefined;

        if (groupBy === 'none') {
          return (
            <div key={group.key}>
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
            </div>
          );
        }

        return (
          <CollapsibleGroup
            key={group.key}
            title={group.label}
            isCollapsed={group.collapsed}
            onToggle={() => toggleGroup(group.key)}
            badge={{ label: group.tasks.length, variant: group.badgeVariant }}
            trailing={batchApproveButton}
          >
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

            {/* Empty group state */}
            {group.tasks.length === 0 && (
              <div style={{
                padding: spaceAround.default,
                textAlign: 'center',
                color: colors.fg.neutral.disabled,
                fontSize: 12,
              }}>
                No tasks in this group
              </div>
            )}
          </CollapsibleGroup>
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
