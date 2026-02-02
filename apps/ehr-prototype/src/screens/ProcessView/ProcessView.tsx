/**
 * ProcessView Screen
 *
 * The batch review interface for processing pending tasks.
 * Shows tasks grouped by status with a detail pane for the selected task.
 */

import React, { useState, useCallback } from 'react';
import {
  useEncounterState,
  useDispatch,
  useTasks,
  useTaskActions,
} from '../../hooks';
import { selectTaskPaneData } from '../../state/selectors/views';

import { AppShell } from '../../components/layout/AppShell';
import { PatientHeader } from '../../components/layout/PatientHeader';
import { ModeSelector } from '../../components/layout/ModeSelector';
import { SplitPane } from '../../components/layout/SplitPane';
import { TaskList } from '../../components/tasks/TaskList';
import { CollapsibleGroup } from '../../components/primitives/CollapsibleGroup';
import { Button } from '../../components/primitives/Button';

import { Send, List } from 'lucide-react';

import { TaskDetailPane } from './TaskDetailPane';
import { EmptyState } from '../../components/primitives/EmptyState';
import { colors, spaceAround } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

interface TaskSectionProps {
  title: string;
  count: number;
  tasks: import('../../types').BackgroundTask[];
  badgeVariant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  selectedId: string | null;
  onTaskSelect: (id: string) => void;
  batchAction?: {
    label: string;
    onClick: () => void;
  };
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason?: string) => void;
  onRetry?: (id: string) => void;
}

// ============================================================================
// TaskSection Component
// ============================================================================

const TaskSection: React.FC<TaskSectionProps> = ({
  title,
  count,
  tasks,
  badgeVariant = 'default',
  selectedId,
  onTaskSelect,
  batchAction,
  collapsible = false,
  defaultCollapsed = false,
  onApprove,
  onReject,
  onRetry,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  if (count === 0) return null;

  const batchActionButton = batchAction && !isCollapsed ? (
    <div onClick={(e) => e.stopPropagation()}>
      <Button
        variant="primary"
        size="sm"
        leftIcon={<Send size={14} />}
        onClick={batchAction.onClick}
        data-testid="batch-send-btn"
      >
        {batchAction.label}
      </Button>
    </div>
  ) : undefined;

  const sectionTestId = `task-section-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div style={styles.section} data-testid={sectionTestId}>
      <CollapsibleGroup
        title={title}
        isCollapsed={collapsible ? isCollapsed : false}
        onToggle={collapsible ? () => setIsCollapsed(!isCollapsed) : () => {}}
        badge={{ label: count, variant: badgeVariant }}
        trailing={batchActionButton}
        style={styles.sectionHeader}
      >
        <TaskList
          tasks={tasks}
          groupBy="none"
          onApprove={onApprove ?? (() => {})}
          onReject={onReject ?? (() => {})}
          onRetry={onRetry}
        />
      </CollapsibleGroup>
    </div>
  );
};

// ============================================================================
// ProcessView Component
// ============================================================================

export const ProcessView: React.FC = () => {
  const state = useEncounterState();
  const dispatch = useDispatch();
  const allTasks = useTasks();
  const { approveTask, rejectTask, batchApprove } = useTaskActions();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Get task pane data (grouped by status)
  const taskData = selectTaskPaneData(state);

  // Patient and encounter context
  const patient = state.context.patient;
  const encounter = state.context.encounter;

  // Get selected task and related item
  const selectedTask = selectedTaskId
    ? state.entities.tasks[selectedTaskId]
    : null;
  const relatedItem =
    selectedTask?.trigger.itemId
      ? state.entities.items[selectedTask.trigger.itemId]
      : null;

  // Handle mode change
  const handleModeChange = useCallback(
    (mode: import('../../state/types').Mode) => {
      dispatch({
        type: 'MODE_CHANGED',
        payload: { to: mode, trigger: 'user' },
      });
    },
    [dispatch]
  );

  // Handle batch send
  const handleBatchSend = useCallback(
    (ids: string[]) => {
      batchApprove(ids);
    },
    [batchApprove]
  );

  // Handle task approve
  const handleApprove = useCallback(
    (id: string) => {
      approveTask(id);
    },
    [approveTask]
  );

  // Handle task reject
  const handleReject = useCallback(
    (id: string, reason?: string) => {
      rejectTask(id, reason);
    },
    [rejectTask]
  );

  // Handle task retry (re-approve the failed task)
  const handleRetry = useCallback(
    (id: string) => {
      approveTask(id);
    },
    [approveTask]
  );

  // If no patient/encounter loaded, show empty state
  if (!patient || !encounter) {
    return (
      <EmptyState
        icon={<List size={64} />}
        title="No Encounter Loaded"
        description="Select a patient and encounter to view tasks."
        size="lg"
        style={styles.emptyContainer}
      />
    );
  }

  // Calculate open care gap count for header
  const openCareGaps = Object.values(state.entities.careGaps).filter(
    (g) => g.status === 'open'
  );

  return (
    <AppShell
      testID="process-view"
      header={
        <div style={styles.headerContainer}>
          <PatientHeader
            patient={patient}
            encounter={encounter}
            careGapCount={openCareGaps.length}
          />
          <div style={styles.modeSelectorContainer}>
            <ModeSelector
              currentMode={state.session.mode}
              onModeChange={handleModeChange}
            />
          </div>
        </div>
      }
      main={
        <SplitPane
          left={
            <div style={styles.taskListContainer}>
              {/* Needs Review */}
              <TaskSection
                title="Needs Review"
                count={taskData.needsReview.length}
                tasks={taskData.needsReview}
                badgeVariant="warning"
                selectedId={selectedTaskId}
                onTaskSelect={setSelectedTaskId}
                onApprove={handleApprove}
                onReject={handleReject}
              />

              {/* Ready to Send */}
              <TaskSection
                title="Ready to Send"
                count={taskData.readyToSend.length}
                tasks={taskData.readyToSend}
                badgeVariant="success"
                selectedId={selectedTaskId}
                onTaskSelect={setSelectedTaskId}
                batchAction={
                  taskData.readyToSend.length > 1
                    ? {
                        label: 'Send All',
                        onClick: () =>
                          handleBatchSend(
                            taskData.readyToSend.map((t) => t.id)
                          ),
                      }
                    : undefined
                }
                onApprove={handleApprove}
              />

              {/* Processing */}
              <TaskSection
                title="Processing"
                count={taskData.processing.length}
                tasks={taskData.processing}
                badgeVariant="info"
                selectedId={selectedTaskId}
                onTaskSelect={setSelectedTaskId}
                collapsible
              />

              {/* Failed */}
              <TaskSection
                title="Failed"
                count={taskData.failed.length}
                tasks={taskData.failed}
                badgeVariant="error"
                selectedId={selectedTaskId}
                onTaskSelect={setSelectedTaskId}
                onRetry={handleRetry}
              />

              {/* Completed */}
              <TaskSection
                title="Completed"
                count={taskData.completed.length}
                tasks={taskData.completed}
                badgeVariant="default"
                selectedId={selectedTaskId}
                onTaskSelect={setSelectedTaskId}
                collapsible
                defaultCollapsed
              />

              {/* Empty state */}
              {allTasks.length === 0 && (
                <EmptyState
                  icon={<List size={64} />}
                  title="No Tasks"
                  description="Tasks will appear here as you chart in Capture mode."
                  size="lg"
                  style={styles.taskListEmpty}
                />
              )}
            </div>
          }
          right={
            <TaskDetailPane
              task={selectedTask}
              relatedItem={relatedItem}
              onApprove={() => selectedTaskId && handleApprove(selectedTaskId)}
              onReject={(reason) =>
                selectedTaskId && handleReject(selectedTaskId, reason)
              }
              onRetry={() => selectedTaskId && handleRetry(selectedTaskId)}
            />
          }
          defaultSplit={40}
          minLeft={25}
          minRight={30}
        />
      }
    />
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  headerContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  modeSelectorContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: `${spaceAround.tight}px ${spaceAround.default}px`,
    backgroundColor: colors.bg.neutral.base,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
  },
  taskListContainer: {
    height: '100%',
    overflow: 'auto',
    padding: spaceAround.default,
    backgroundColor: colors.bg.neutral.min,
  },
  taskListEmpty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spaceAround.generous,
    color: colors.fg.neutral.spotReadable,
    textAlign: 'center',
  },
  section: {
    marginBottom: spaceAround.defaultPlus,
  },
  sectionHeader: {
    marginBottom: spaceAround.compact,
    backgroundColor: colors.bg.neutral.subtle,
  },
  emptyContainer: {
    height: '100%',
    backgroundColor: colors.bg.neutral.min,
  },
};

ProcessView.displayName = 'ProcessView';
