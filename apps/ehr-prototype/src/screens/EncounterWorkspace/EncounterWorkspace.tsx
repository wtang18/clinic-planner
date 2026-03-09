/**
 * EncounterWorkspace
 *
 * Encounter-specific canvas rendering. All state comes from EncounterContext.
 * Renders chart items, triage module, processing rail, workflow/process/review canvases,
 * to-do list/detail views, details pane, and task pane overlays.
 *
 * Also exports slot-filling sub-components for AppShell's scope routing:
 * - EncounterCanvasHeader — Capture/Process/Review segmented control
 * - EncounterOverviewHeader — PatientIdentityHeader
 * - EncounterCollapsedIdentity — compact patient identity
 * - EncounterScrolledContent — scrolled canvas encounter context
 * - EncounterOverview — PatientOverviewPane wrapper
 * - EncounterAIBar — BottomBarContainer with encounter props
 */

import React from 'react';
import { useEncounterContext } from './EncounterProvider';

import { CanvasPane } from '../../components/layout/CanvasPane';
import { EncounterContextBar } from '../../components/layout/EncounterContextBar';
import { PatientIdentityHeader } from '../../components/layout/PatientIdentityHeader';
import { PatientOverviewPane } from '../../components/layout/PatientOverviewPane';
import { ProtocolView } from '../../components/protocol/ProtocolView';
import { selectActiveProtocol } from '../../state/selectors/protocol';
import { SegmentedControl, type Segment } from '../../components/primitives/SegmentedControl';
import { ChartItemCard } from '../../components/chart-items/ChartItemCard';
import { OmniAddBarV2 as OmniAddBar } from '../../components/omni-add/OmniAddBarV2';
import { BottomBarContainer } from '../../components/bottom-bar/BottomBarContainer';
import { TaskPane } from '../../components/tasks/TaskPane';
import { DetailsPane } from '../../components/details-pane';
import { ProcessingRail, RailFloatingStatus } from '../../components/processing-rail';
import { TriageModule } from '../../components/triage';
import { ToDoListView, TaskDetailView, FaxDetailView, MessageDetailView, CareDetailView } from '../../components/todo';
import { ContextBar } from '../../components/navigation/ContextBar';
import { ScopeReturnBar } from '../../components/navigation/ScopeReturnBar';
import {
  getCategoryById,
  getItemsByCategory,
  type ToDoItem,
} from '../../scenarios/todoData';

import { ClipboardList, Check } from 'lucide-react';
import { ProcessCanvas } from '../ProcessView';
import { ReviewCanvas } from '../ReviewView';
import { WorkflowCanvas } from '../WorkflowView';
import { WORKFLOW_PHASES } from '../IntakeView/intakeChecklist';
import type { Mode } from '../../state/types';
import type { WorkflowPhase } from '../IntakeView/intakeChecklist';

import { captureViewStyles, captureViewAnimations } from '../CaptureView/CaptureView.styles';
import { colors, spaceAround, spaceBetween, typography, LAYOUT } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export type ViewMode = 'patient' | 'todo-list' | 'todo-detail' | 'cohort' | 'home' | 'visits';

export interface ToDoViewState {
  categoryId: string;
  filterId: string;
  selectedItem?: ToDoItem;
}

// ============================================================================
// Props passed from AppShell
// ============================================================================

export interface EncounterWorkspaceProps {
  viewMode: ViewMode;
  todoViewState: ToDoViewState | null;
  selectedNavItem: string;
  todoSearchQuery: string;
  onSetViewMode: (mode: ViewMode) => void;
  onSetTodoViewState: (state: ToDoViewState | null) => void;
  onSetSelectedNavItem: (id: string) => void;
  onOpenPatientFromToDo: (item: ToDoItem) => void;
  onCanvasScrolledChange: (scrolled: boolean) => void;
}

// ============================================================================
// Helpers
// ============================================================================

const formatDate = (date: Date | undefined) => {
  if (!date) return 'Unknown';
  return date instanceof Date ? date.toLocaleDateString() : String(date);
};

function buildPatientOverviewData(patient: NonNullable<ReturnType<typeof useEncounterContext>['state']['context']['patient']>) {
  const { demographics, clinicalSummary } = patient;
  return {
    name: demographics.preferredName
      ? `${demographics.preferredName} (${demographics.firstName}) ${demographics.lastName}`
      : `${demographics.firstName} ${demographics.lastName}`,
    mrn: patient.mrn,
    dob: formatDate(demographics.dateOfBirth),
    age: demographics.age,
    gender: demographics.gender,
    pronouns: demographics.pronouns,
    allergies: (clinicalSummary?.allergies || []).map((a, i) => ({
      id: `allergy-${i}`,
      allergen: a.allergen,
      reaction: a.reaction,
      severity: a.severity,
    })),
    medications: (clinicalSummary?.medications || []).map((m, i) => ({
      id: `med-${i}`,
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      status: 'active' as const,
    })),
    problems: (clinicalSummary?.problemList || []).map((c, i) => ({
      id: `problem-${i}`,
      name: c.description,
      icdCode: c.icdCode,
      status: 'active' as const,
      isPrimary: i === 0,
    })),
    vitals: [],
  };
}

// ============================================================================
// EncounterWorkspace Component
// ============================================================================

export const EncounterWorkspace: React.FC<EncounterWorkspaceProps> = ({
  viewMode,
  todoViewState,
  selectedNavItem,
  todoSearchQuery,
  onSetViewMode,
  onSetTodoViewState,
  onSetSelectedNavItem,
  onOpenPatientFromToDo,
  onCanvasScrolledChange,
}) => {
  const ctx = useEncounterContext();
  const {
    state, items, captureView, workflowState,
    encounterVitals, ccItem, hpiItem, rosItem, peItems,
    handleRailRowTap, gridRef, railTier,
    canPopScope, scopeOriginLabel, popScope, todoNav,
    workspace,
  } = ctx;

  const patient = state.context.patient;
  const encounter = state.context.encounter;

  // Empty state
  if (!patient || !encounter) {
    return (
      <div style={captureViewStyles.container}>
        <div style={captureViewStyles.chartItemsEmpty}>
          <ClipboardList size={64} color={colors.border.neutral.medium} style={{ marginBottom: spaceAround.default }} />
          <div style={captureViewStyles.emptyTitle}>No Encounter Loaded</div>
          <div style={captureViewStyles.emptyDescription}>
            Select a patient and encounter to begin charting.
          </div>
        </div>
      </div>
    );
  }

  // Sorted items
  const sortedItems = [...items].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  // Selected item for details pane
  const selectedItem = captureView.selectedItemId
    ? items.find(i => i.id === captureView.selectedItemId) ?? null
    : null;

  // Patient overview data
  const patientOverviewData = buildPatientOverviewData(patient);

  // Determine which workspace is selected
  const selectedWorkspaceId = selectedNavItem.startsWith('patient-')
    ? selectedNavItem.replace('patient-', '')
    : patient?.mrn;

  const isViewingEncounterPatient = patient && selectedWorkspaceId === patient.mrn;

  // Current category/items for to-do views
  const currentCategory = todoViewState ? getCategoryById(todoViewState.categoryId) : null;
  const todoItems = todoViewState ? getItemsByCategory(todoViewState.categoryId) : [];

  const visit = state.context.visit;
  const currentUser = state.session.currentUser;

  // To-Do handlers
  const handleToDoItemClick = (item: ToDoItem) => {
    if (todoViewState) {
      onSetViewMode('todo-detail');
      onSetTodoViewState({ ...todoViewState, selectedItem: item });
    }
  };

  const handleBackToList = () => {
    if (todoViewState) {
      onSetViewMode('todo-list');
      onSetTodoViewState({ ...todoViewState, selectedItem: undefined });
    }
  };

  // ---- Canvas content ----
  return (
    <>
      {/* Inject animations */}
      <style>{captureViewAnimations}</style>

      <CanvasPane
        headerContent={undefined}
        compactHeaderContent={undefined}
        onScrolledChange={onCanvasScrolledChange}
      >
        {/* Workflow canvas */}
        {captureView.viewContext === 'workflow' && (
          <WorkflowCanvas
            phase={workflowState.activePhase}
            workflowState={workflowState}
            encounter={encounter}
            specialty={encounter.specialty}
            chiefComplaint={visit?.chiefComplaint}
            providerName={currentUser?.name}
            providerCredentials={currentUser?.credentials?.join(', ')}
            room={encounter.room}
            payer={patient.insurance?.primary?.payerName}
            groupName={patient.insurance?.primary?.groupName}
            caseId={encounter.caseId}
            tags={encounter.tags}
            locked={encounter.locked}
          />
        )}

        {/* Process/Review canvas */}
        {captureView.viewContext === 'charting' && ctx.mode === 'process' && <ProcessCanvas />}
        {captureView.viewContext === 'charting' && ctx.mode === 'review' && <ReviewCanvas />}

        {/* To-Do List */}
        {captureView.viewContext === 'charting' && ctx.mode === 'capture' && viewMode === 'todo-list' && todoViewState && currentCategory && (
          <ToDoListView
            categoryId={todoViewState.categoryId}
            filterId={todoViewState.filterId}
            filters={currentCategory.filters}
            items={todoItems}
            searchQuery={todoSearchQuery}
            onFilterChange={(filterId) => {
              onSetTodoViewState({ ...todoViewState, filterId });
            }}
            onItemClick={handleToDoItemClick}
          />
        )}

        {/* To-Do Detail */}
        {captureView.viewContext === 'charting' && ctx.mode === 'capture' && viewMode === 'todo-detail' && todoViewState?.selectedItem && (
          <>
            <div
              style={{
                padding: `${spaceAround.compact}px ${spaceAround.default}px`,
                borderBottom: `1px solid ${colors.border.neutral.low}`,
              }}
            >
              <button
                onClick={handleBackToList}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: `${spaceAround.nudge6}px ${spaceAround.compact}px`,
                  backgroundColor: colors.bg.neutral.subtle,
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 12,
                  color: colors.fg.neutral.secondary,
                  cursor: 'pointer',
                }}
              >
                ← Back to {currentCategory?.label}
              </button>
            </div>

            {todoViewState.categoryId === 'tasks' && (
              <TaskDetailView
                item={todoViewState.selectedItem}
                onComplete={handleBackToList}
                onNavigateToPatient={() => {
                  if (todoViewState.selectedItem) onOpenPatientFromToDo(todoViewState.selectedItem);
                }}
              />
            )}
            {todoViewState.categoryId === 'inbox' && (
              <FaxDetailView
                item={todoViewState.selectedItem}
                onNavigateToPatient={() => {
                  if (todoViewState.selectedItem) onOpenPatientFromToDo(todoViewState.selectedItem);
                }}
              />
            )}
            {todoViewState.categoryId === 'messages' && (
              <MessageDetailView
                item={todoViewState.selectedItem}
                onNavigateToPatient={() => {
                  if (todoViewState.selectedItem) onOpenPatientFromToDo(todoViewState.selectedItem);
                }}
              />
            )}
            {todoViewState.categoryId === 'care' && (
              <CareDetailView
                item={todoViewState.selectedItem}
                onComplete={handleBackToList}
                onNavigateToPatient={() => {
                  if (todoViewState.selectedItem) onOpenPatientFromToDo(todoViewState.selectedItem);
                }}
              />
            )}
          </>
        )}

        {/* Patient Workspace View */}
        {captureView.viewContext === 'charting' && ctx.mode === 'capture' && viewMode === 'patient' && (() => {
          const wsId = selectedNavItem.startsWith('patient-')
            ? selectedNavItem.replace('patient-', '')
            : patient?.mrn;

          const currentWorkspace = wsId ? workspace.getWorkspace(wsId) : null;
          const activeTab = currentWorkspace
            ? currentWorkspace.tabs.find(t => t.id === currentWorkspace.activeTabId)
            : null;

          const isEncounterPatient = patient && wsId === patient.mrn;

          const contextBarFilterLabel = todoNav.sourceFilterLabel || '';

          const handleCloseActiveTab = () => {
            if (currentWorkspace && activeTab && wsId) {
              const overviewTab = currentWorkspace.tabs.find(t => t.type === 'overview');
              if (overviewTab) workspace.switchTab(wsId, overviewTab.id);
              workspace.closeTab(wsId, activeTab.id);
            }
          };

          // Scope return bar or context bar
          const contextBar = canPopScope && scopeOriginLabel ? (
            <ScopeReturnBar
              originLabel={scopeOriginLabel}
              onReturn={popScope}
              testID="scope-return-bar"
            />
          ) : todoNav.shouldShowContextBar ? (
            <ContextBar
              sourceFilter={contextBarFilterLabel}
              sourceCategoryId={todoNav.state?.categoryId || ''}
              remainingCount={todoNav.remainingCount}
              currentTaskTitle={todoNav.currentItemTitle || ''}
              hasNext={todoNav.hasNext}
              onReturn={() => {
                const result = todoNav.returnToList();
                if (result) {
                  onSetViewMode('todo-list');
                  onSetTodoViewState({ categoryId: result.categoryId, filterId: result.filterId });
                  onSetSelectedNavItem('todo');
                }
              }}
              onNext={() => {
                const nextItem = todoNav.navigateToNext();
                if (nextItem) {
                  const workspaceId = nextItem.patient.mrn;
                  workspace.openWorkspace(workspaceId, 'patient', nextItem.patient.name);
                  onSetSelectedNavItem(`patient-${workspaceId}`);
                  onSetTodoViewState(null);
                }
              }}
              onDismiss={() => todoNav.dismissContextBar()}
              testID="context-bar"
            />
          ) : null;

          // Non-encounter patient placeholder
          if (!activeTab || activeTab.type === 'overview' || activeTab.type === 'visit') {
            if (!isEncounterPatient && currentWorkspace) {
              return (
                <>
                  {contextBar}
                  <div style={captureViewStyles.contentWrapper}>
                    <div style={captureViewStyles.chartItemsEmpty}>
                      <ClipboardList size={64} color={colors.border.neutral.medium} style={{ marginBottom: spaceAround.default }} />
                      <div style={captureViewStyles.emptyTitle}>{currentWorkspace.patientName}</div>
                      <div style={captureViewStyles.emptyDescription}>
                        Select a task from the menu to view details.
                      </div>
                    </div>
                  </div>
                </>
              );
            }

            // Encounter patient — chart items + processing rail
            return (
              <>
                {contextBar}
                <div ref={gridRef} style={{
                  display: 'grid',
                  gridTemplateColumns: railTier === 'full' ? 'minmax(0, 1fr) auto' : '1fr',
                  gridTemplateRows: 'auto auto 1fr',
                  flex: 1,
                  minHeight: 0,
                  columnGap: railTier === 'full' ? spaceAround.defaultPlus : 0,
                }}>
                  <EncounterContextBar
                    encounter={encounter}
                    specialty={encounter.specialty}
                    chiefComplaint={visit?.chiefComplaint}
                    providerName={currentUser?.name}
                    providerCredentials={currentUser?.credentials?.join(', ')}
                    room={encounter.room}
                    payer={patient.insurance?.primary?.payerName}
                    groupName={patient.insurance?.primary?.groupName}
                    caseId={encounter.caseId}
                    tags={encounter.tags}
                    locked={encounter.locked}
                    style={{ paddingLeft: 0, paddingRight: 0, gridColumn: 1, gridRow: 1 }}
                  />

                  <div style={{
                    ...captureViewStyles.contentWrapper,
                    gridColumn: 1, gridRow: 2,
                    marginBottom: spaceBetween.repeating,
                  }}>
                    {railTier === 'float' && (
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: spaceBetween.repeating }}>
                        <RailFloatingStatus onTap={() => captureView.handleModeChange('process')} />
                      </div>
                    )}
                    <TriageModule
                      vitals={encounterVitals}
                      chiefComplaint={visit?.chiefComplaint}
                      ccItem={ccItem}
                      hpiItem={hpiItem}
                      rosItem={rosItem}
                      peItems={peItems}
                      onItemClick={(itemId) => captureView.handleItemSelect(itemId)}
                    />
                  </div>

                  <div style={{
                    ...captureViewStyles.contentWrapper,
                    gridColumn: 1, gridRow: 3,
                    minWidth: 0, overflowY: 'auto', paddingBottom: 80,
                  }}>
                    <div style={captureViewStyles.chartItemsList}>
                      {sortedItems.length === 0 ? (
                        <div style={captureViewStyles.chartItemsEmpty}>
                          <ClipboardList size={64} color={colors.border.neutral.medium} style={{ marginBottom: spaceAround.default }} />
                          <div style={captureViewStyles.emptyTitle}>Start Your Encounter</div>
                          <div style={captureViewStyles.emptyDescription}>
                            Choose a category below to add items to the chart.
                            AI will help with suggestions as you go.
                          </div>
                        </div>
                      ) : (
                        sortedItems.map((item) => (
                          <div key={item.id} style={captureViewStyles.chartItemCard}>
                            <ChartItemCard
                              item={item}
                              variant="compact"
                              selected={item.id === captureView.selectedItemId}
                              onSelect={() => captureView.handleItemSelect(item.id)}
                            />
                          </div>
                        ))
                      )}
                    </div>

                    <div style={{ marginTop: spaceAround.spacious }}>
                      <OmniAddBar onItemAdd={captureView.handleItemAdd} onUndo={captureView.handleUndo} />
                    </div>
                  </div>

                  {railTier === 'full' && (
                    <div style={{
                      gridColumn: 2, gridRow: '2 / -1', alignSelf: 'start',
                      position: 'sticky', top: LAYOUT.headerHeight + LAYOUT.canvasContentPadding,
                      display: 'flex', flexDirection: 'column', gap: spaceBetween.repeating,
                    }}>
                      <ProcessingRail onRowTap={handleRailRowTap} />
                    </div>
                  )}
                </div>
              </>
            );
          }

          // Tab-based content
          if (activeTab.type === 'task' && activeTab.todoItem) {
            return (
              <>
                {contextBar}
                <TaskDetailView item={activeTab.todoItem} onComplete={handleCloseActiveTab} onNavigateToPatient={() => {}} />
              </>
            );
          }
          if (activeTab.type === 'fax' && activeTab.todoItem) {
            return (
              <>
                {contextBar}
                <FaxDetailView item={activeTab.todoItem} onNavigateToPatient={() => {}} />
              </>
            );
          }
          if (activeTab.type === 'message' && activeTab.todoItem) {
            return (
              <>
                {contextBar}
                <MessageDetailView item={activeTab.todoItem} onNavigateToPatient={() => {}} />
              </>
            );
          }
          if (activeTab.type === 'care' && activeTab.todoItem) {
            return (
              <>
                {contextBar}
                <CareDetailView item={activeTab.todoItem} onComplete={handleCloseActiveTab} onNavigateToPatient={() => {}} />
              </>
            );
          }

          // Fallback — chart items + rail (same as encounter patient view above)
          return (
            <>
              {contextBar}
              <div ref={gridRef} style={{
                display: 'grid',
                gridTemplateColumns: railTier === 'full' ? 'minmax(0, 1fr) auto' : '1fr',
                gridTemplateRows: 'auto auto 1fr',
                flex: 1,
                minHeight: 0,
                columnGap: railTier === 'full' ? spaceAround.defaultPlus : 0,
              }}>
                <EncounterContextBar
                  encounter={encounter}
                  specialty={encounter.specialty}
                  chiefComplaint={visit?.chiefComplaint}
                  providerName={currentUser?.name}
                  providerCredentials={currentUser?.credentials?.join(', ')}
                  room={encounter.room}
                  payer={patient.insurance?.primary?.payerName}
                  groupName={patient.insurance?.primary?.groupName}
                  caseId={encounter.caseId}
                  tags={encounter.tags}
                  locked={encounter.locked}
                  style={{ paddingLeft: 0, paddingRight: 0, gridColumn: 1, gridRow: 1 }}
                />

                <div style={{
                  ...captureViewStyles.contentWrapper,
                  gridColumn: 1, gridRow: 2,
                  marginBottom: spaceBetween.repeating,
                }}>
                  {railTier === 'float' && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: spaceBetween.repeating }}>
                      <RailFloatingStatus onTap={() => captureView.handleModeChange('process')} />
                    </div>
                  )}
                  <TriageModule
                    vitals={encounterVitals}
                    chiefComplaint={visit?.chiefComplaint}
                    ccItem={ccItem}
                    hpiItem={hpiItem}
                    rosItem={rosItem}
                    peItems={peItems}
                    onItemClick={(itemId) => captureView.handleItemSelect(itemId)}
                  />
                </div>

                <div style={{
                  ...captureViewStyles.contentWrapper,
                  gridColumn: 1, gridRow: 3,
                  minWidth: 0, overflowY: 'auto', paddingBottom: 80,
                }}>
                  <div style={captureViewStyles.chartItemsList}>
                    {sortedItems.length === 0 ? (
                      <div style={captureViewStyles.chartItemsEmpty}>
                        <ClipboardList size={64} color={colors.border.neutral.medium} style={{ marginBottom: spaceAround.default }} />
                        <div style={captureViewStyles.emptyTitle}>Start Your Encounter</div>
                        <div style={captureViewStyles.emptyDescription}>
                          Choose a category below to add items to the chart.
                          AI will help with suggestions as you go.
                        </div>
                      </div>
                    ) : (
                      sortedItems.map((item) => (
                        <div key={item.id} style={captureViewStyles.chartItemCard}>
                          <ChartItemCard
                            item={item}
                            variant="compact"
                            selected={item.id === captureView.selectedItemId}
                            onSelect={() => captureView.handleItemSelect(item.id)}
                          />
                        </div>
                      ))
                    )}
                  </div>

                  <div style={{ marginTop: spaceAround.spacious }}>
                    <OmniAddBar onItemAdd={captureView.handleItemAdd} onUndo={captureView.handleUndo} />
                  </div>
                </div>

                {railTier === 'full' && (
                  <div style={{
                    gridColumn: 2, gridRow: '2 / -1', alignSelf: 'start',
                    position: 'sticky', top: LAYOUT.headerHeight + LAYOUT.canvasContentPadding,
                    display: 'flex', flexDirection: 'column', gap: spaceBetween.repeating,
                  }}>
                    <ProcessingRail onRowTap={handleRailRowTap} />
                  </div>
                )}
              </div>
            </>
          );
        })()}
      </CanvasPane>

      {/* Details pane overlay */}
      <DetailsPane
        item={selectedItem}
        onClose={captureView.handleCloseDetailsPane}
        onUpdate={captureView.handleItemUpdate}
        onRemove={captureView.handleItemRemove}
      />

      {/* Task pane overlay */}
      {captureView.isTaskPaneOpen && (
        <div
          style={captureViewStyles.taskPaneOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) captureView.setIsTaskPaneOpen(false);
          }}
        >
          <div style={captureViewStyles.taskPaneContainer}>
            <TaskPane
              isOpen={captureView.isTaskPaneOpen}
              onClose={() => captureView.setIsTaskPaneOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

EncounterWorkspace.displayName = 'EncounterWorkspace';

// ============================================================================
// Slot-Filling Sub-Components (consumed by AppShell scope routers)
// ============================================================================

/** Encounter canvas header — Capture/Process/Review or Workflow segmented control */
export const EncounterCanvasHeader: React.FC = () => {
  const { state, captureView, workflowState } = useEncounterContext();

  const chartSegments: Segment<Mode>[] = [
    { key: 'capture', label: 'Capture' },
    { key: 'process', label: 'Process' },
    { key: 'review', label: 'Review' },
  ];

  const workflowSegments: Segment<WorkflowPhase>[] = WORKFLOW_PHASES.map((p) => ({
    key: p.key,
    label: p.label,
    badge: workflowState.completedPhases.has(p.key)
      ? <Check size={12} color={colors.fg.positive.primary} />
      : undefined,
  }));

  if (captureView.viewContext === 'workflow') {
    return (
      <SegmentedControl<WorkflowPhase>
        segments={workflowSegments}
        value={workflowState.activePhase}
        onChange={workflowState.setActivePhase}
        variant="topBar"
      />
    );
  }

  return (
    <SegmentedControl<Mode>
      segments={chartSegments}
      value={state.session.mode}
      onChange={captureView.handleModeChange}
      variant="topBar"
    />
  );
};

EncounterCanvasHeader.displayName = 'EncounterCanvasHeader';

/** PatientIdentityHeader for overview pane header */
export const EncounterOverviewHeader: React.FC<{ selectedPatient: NonNullable<ReturnType<typeof useEncounterContext>['state']['context']['patient']> | null }> = ({ selectedPatient }) => {
  if (!selectedPatient) return null;
  const data = buildPatientOverviewData(selectedPatient);
  return (
    <PatientIdentityHeader
      name={data.name}
      mrn={selectedPatient.mrn}
      dob={data.dob}
      age={selectedPatient.demographics.age}
      gender={selectedPatient.demographics.gender}
      pronouns={selectedPatient.demographics.pronouns}
      onPatientClick={() => {}}
      onCopyMrn={() => navigator.clipboard?.writeText(selectedPatient.mrn)}
      variant="stacked"
      showMenuButton={false}
    />
  );
};

EncounterOverviewHeader.displayName = 'EncounterOverviewHeader';

/** Compact patient identity for collapsed overview */
export const EncounterCollapsedIdentity: React.FC<{ selectedPatient: NonNullable<ReturnType<typeof useEncounterContext>['state']['context']['patient']> | null }> = ({ selectedPatient }) => {
  if (!selectedPatient) return null;
  const data = buildPatientOverviewData(selectedPatient);
  return (
    <PatientIdentityHeader
      name={data.name}
      mrn={selectedPatient.mrn}
      dob={data.dob}
      age={selectedPatient.demographics.age}
      gender={selectedPatient.demographics.gender}
      pronouns={selectedPatient.demographics.pronouns}
      variant="stacked"
      showMenuButton={false}
    />
  );
};

EncounterCollapsedIdentity.displayName = 'EncounterCollapsedIdentity';

/** Scrolled encounter context content for nav row */
export const EncounterScrolledContent: React.FC<{ canvasScrolled: boolean }> = ({ canvasScrolled }) => {
  const { state } = useEncounterContext();
  const encounter = state.context.encounter;
  const visit = state.context.visit;
  const currentUser = state.session.currentUser;

  if (!canvasScrolled || !encounter) return null;

  const dateSource = encounter.scheduledAt || encounter.startedAt;
  const dateStr = dateSource
    ? `${dateSource.getMonth() + 1}/${dateSource.getDate()}/${dateSource.getFullYear()}`
    : undefined;
  const provider = currentUser?.name
    ? (currentUser.credentials ? `${currentUser.name}, ${currentUser.credentials.join(', ')}` : currentUser.name)
    : undefined;
  const statusLabel = encounter.status.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  const metaParts = [dateStr, provider, statusLabel].filter(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spaceBetween.coupled, minWidth: 0 }}>
      <div style={{
        fontSize: 15,
        fontFamily: typography.fontFamily.sans,
        fontWeight: typography.fontWeight.semibold,
        color: colors.fg.neutral.primary,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {visit?.chiefComplaint || encounter.type || 'Visit'}
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: spaceBetween.coupled,
        fontSize: 12,
        fontFamily: typography.fontFamily.sans,
        color: colors.fg.neutral.secondary,
        whiteSpace: 'nowrap',
      }}>
        {metaParts.map((part, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ color: colors.fg.neutral.disabled }}>&middot;</span>}
            <span>{part}</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

EncounterScrolledContent.displayName = 'EncounterScrolledContent';

/** Patient overview pane wrapper — wires coordination state for protocol tab. */
export const EncounterOverview: React.FC<{
  selectedPatient: NonNullable<ReturnType<typeof useEncounterContext>['state']['context']['patient']> | null;
}> = ({ selectedPatient }) => {
  if (!selectedPatient) return undefined;
  const { state, coordState, coordDispatch } = useEncounterContext();
  const data = buildPatientOverviewData(selectedPatient);

  // Bridge: sync encounter protocol state → coordination protocolTabState.
  // When a scenario dispatches PROTOCOL_LOADED/ACTIVATED, the coordination
  // state auto-updates so the tab appears without manual coordination dispatch.
  const activeProtocol = selectActiveProtocol(state);
  const prevProtocolRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const currentId = activeProtocol?.id ?? null;
    if (currentId && currentId !== prevProtocolRef.current) {
      // New protocol activated — show tab and switch to it
      if (coordState.referencePane.protocolTabState !== 'active') {
        coordDispatch({ type: 'PROTOCOL_TAB_ACTIVATED' });
      }
    }
    prevProtocolRef.current = currentId;
  }, [activeProtocol?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const { protocolTabState, activeTab } = coordState.referencePane;
  const protocolBadge = protocolTabState === 'completed' ? 'check' as const : null;

  return (
    <PatientOverviewPane
      patient={data}
      onPatientClick={() => {}}
      onCopyMrn={() => navigator.clipboard?.writeText(selectedPatient.mrn)}
      hideHeader={true}
      protocolTabState={protocolTabState}
      protocolBadge={protocolBadge}
      protocolContent={activeProtocol ? <ProtocolView testID="protocol-view" /> : undefined}
      activeTab={activeTab}
      onTabChange={(tab) => coordDispatch({ type: 'OVERVIEW_TAB_CHANGED', payload: { tab } })}
    />
  );
};

EncounterOverview.displayName = 'EncounterOverview';

/** Encounter AI bar — BottomBarContainer with encounter-specific props */
export const EncounterAIBar: React.FC<{ transcriptionEnabled?: boolean }> = ({ transcriptionEnabled = true }) => {
  const ctx = useEncounterContext();
  const patient = ctx.state.context.patient;
  const encounter = ctx.state.context.encounter;
  if (!patient || !encounter) return null;

  const patientName = patient.demographics.preferredName
    ? `${patient.demographics.preferredName} (${patient.demographics.firstName}) ${patient.demographics.lastName}`
    : `${patient.demographics.firstName} ${patient.demographics.lastName}`;

  // Enrich To-Do context content with navigation callbacks
  let enrichedContent = ctx.aiState.content;
  if (ctx.aiState.content.type === 'todo-context') {
    enrichedContent = {
      ...ctx.aiState.content,
      onPrev: () => {
        const prevItem = ctx.todoNav.navigateToPrev();
        if (prevItem) {
          ctx.workspace.openWorkspace(prevItem.patient.mrn, 'patient', prevItem.patient.name);
        }
      },
      onNext: () => {
        const nextItem = ctx.todoNav.navigateToNext();
        if (nextItem) {
          ctx.workspace.openWorkspace(nextItem.patient.mrn, 'patient', nextItem.patient.name);
        }
      },
    };
  }

  return (
    <BottomBarContainer
      aiContent={enrichedContent}
      suggestions={ctx.mergedSuggestions}
      onSuggestionAccept={ctx.handleMergedAccept}
      onSuggestionDismiss={ctx.handleMergedDismiss}
      onSuggestionAcceptWithChanges={ctx.handleMergedAcceptWithChanges}
      patientName={patientName}
      contextTarget={{ type: 'encounter', label: ctx.state.context.visit?.chiefComplaint || encounter?.type || 'Visit' }}
      availableContextLevels={['encounter', 'patient', 'section']}
      quickActions={ctx.aiActions.getQuickActions()}
      onQuickActionClick={ctx.aiConversation.handleQuickAction}
      onSend={ctx.aiConversation.sendMessage}
      paletteResponse={ctx.aiConversation.paletteResponse}
      nonChartFollowUps={ctx.aiConversation.nonChartFollowUps}
      onNonChartAction={ctx.aiConversation.handleNonChartAction}
      onClearResponse={ctx.aiConversation.clearPaletteResponse}
      cannedQueries={ctx.aiConversation.cannedQueries.map(q => q.text)}
      transcriptionEnabled={transcriptionEnabled}
    />
  );
};

EncounterAIBar.displayName = 'EncounterAIBar';
