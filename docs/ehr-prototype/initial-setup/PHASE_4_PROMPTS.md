# Phase 4: Integration — Claude Code Prompts

This document contains Claude Code prompts for integrating all layers into working screens and flows. **These prompts modify existing files and should be run WITHOUT auto-accept.**

---

## Safety Notes — Manual Review Required

⚠️ **Operations in this phase that need review:**
- Modifying existing files from Phase 1-3
- Wiring services to store
- Context provider setup
- Router configuration
- Environment variable handling

✅ **Safer operations:**
- Creating new screen/view files
- Creating new integration test files
- Creating new configuration files

---

## Overview

| Chunk | Description | Modifies Existing? | Est. Files |
|-------|-------------|-------------------|------------|
| 4.1 | Store Provider & Context Setup | Yes (store/index.ts) | 4 |
| 4.2 | Service Initialization | Yes (services/index.ts) | 3 |
| 4.3 | Capture View Screen | No (new files) | 4 |
| 4.4 | Process View Screen | No (new files) | 3 |
| 4.5 | Review View Screen | No (new files) | 3 |
| 4.6 | Patient Overview Screen | No (new files) | 3 |
| 4.7 | App Router & Navigation | No (new files) | 4 |
| 4.8 | Scenario Runner | No (new files) | 4 |
| 4.9 | Integration Tests | No (new files) | 5 |
| 4.10 | App Entry Point | Yes (creates main App.tsx) | 3 |

---

## Chunk 4.1: Store Provider & Context Setup

### Prompt

```
Set up the React context providers for the EHR state management.

## Requirements

### 1. CREATE `/src/context/EncounterContext.tsx`

Create the encounter state context and provider:

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { createStore, Store } from '../state/store';
import { EncounterState, EncounterAction } from '../state/types';
import { createInitialState } from '../state/initialState';

interface EncounterContextValue {
  state: EncounterState;
  dispatch: (action: EncounterAction) => void;
  store: Store;
}

const EncounterContext = createContext<EncounterContextValue | null>(null);

interface EncounterProviderProps {
  children: React.ReactNode;
  initialState?: Partial<EncounterState>;
  middleware?: Middleware[];
}

export const EncounterProvider: React.FC<EncounterProviderProps> = ({
  children,
  initialState,
  middleware = [],
}) => {
  // Create store once
  // Subscribe to state changes
  // Provide state, dispatch, and store reference
};

export const useEncounterContext = (): EncounterContextValue => {
  const context = useContext(EncounterContext);
  if (!context) {
    throw new Error('useEncounterContext must be used within EncounterProvider');
  }
  return context;
};

// Convenience hooks
export const useEncounterState = () => useEncounterContext().state;
export const useEncounterDispatch = () => useEncounterContext().dispatch;
```

### 2. CREATE `/src/context/AIServicesContext.tsx`

Create the AI services context:

```typescript
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { AIManager, createAIManager } from '../services/ai/services/ai-manager';
import { useEncounterContext } from './EncounterContext';

interface AIServicesContextValue {
  aiManager: AIManager;
  isInitialized: boolean;
  enableService: (serviceId: string) => void;
  disableService: (serviceId: string) => void;
}

const AIServicesContext = createContext<AIServicesContextValue | null>(null);

interface AIServicesProviderProps {
  children: React.ReactNode;
  config?: Partial<AIServicesConfig>;
  autoInitialize?: boolean;
}

export const AIServicesProvider: React.FC<AIServicesProviderProps> = ({
  children,
  config,
  autoInitialize = true,
}) => {
  // Get store from EncounterContext
  // Initialize AI manager
  // Clean up on unmount
};

export const useAIServices = () => {
  const context = useContext(AIServicesContext);
  if (!context) {
    throw new Error('useAIServices must be used within AIServicesProvider');
  }
  return context;
};
```

### 3. CREATE `/src/context/TranscriptionContext.tsx`

Create the transcription context:

```typescript
import React, { createContext, useContext, useCallback, useState } from 'react';
import { 
  TranscriptionService, 
  createTranscriptionService,
  createMockTranscriptionService 
} from '../services/transcription';
import { useEncounterDispatch } from './EncounterContext';

interface TranscriptionContextValue {
  status: TranscriptionStatus;
  duration: number;
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<void>;
}

const TranscriptionContext = createContext<TranscriptionContextValue | null>(null);

interface TranscriptionProviderProps {
  children: React.ReactNode;
  useMock?: boolean;
  mockScenario?: 'uc-cough' | 'pc-diabetes';
}

export const TranscriptionProvider: React.FC<TranscriptionProviderProps> = ({
  children,
  useMock = false,
  mockScenario,
}) => {
  // Create transcription service (real or mock)
  // Wire segment events to dispatch TRANSCRIPTION_SEGMENT_RECEIVED
  // Expose control functions
};

export const useTranscription = () => {
  const context = useContext(TranscriptionContext);
  if (!context) {
    throw new Error('useTranscription must be used within TranscriptionProvider');
  }
  return context;
};
```

### 4. CREATE `/src/context/index.ts`

Export all contexts and a combined provider:

```typescript
export * from './EncounterContext';
export * from './AIServicesContext';
export * from './TranscriptionContext';

// Combined provider for convenience
interface AppProvidersProps {
  children: React.ReactNode;
  initialState?: Partial<EncounterState>;
  useMockTranscription?: boolean;
  mockScenario?: string;
}

export const AppProviders: React.FC<AppProvidersProps> = ({
  children,
  initialState,
  useMockTranscription = false,
  mockScenario,
}) => {
  return (
    <ThemeProvider>
      <EncounterProvider initialState={initialState}>
        <AIServicesProvider>
          <TranscriptionProvider useMock={useMockTranscription} mockScenario={mockScenario}>
            {children}
          </TranscriptionProvider>
        </AIServicesProvider>
      </EncounterProvider>
    </ThemeProvider>
  );
};
```

## Guidelines
- Providers should handle cleanup properly
- Use refs for service instances to avoid recreation
- State updates should trigger re-renders efficiently
- Error boundaries should wrap providers
```

---

## Chunk 4.2: Service Initialization

### Prompt

```
Create the service initialization layer that wires AI services to the store.

## Requirements

### 1. CREATE `/src/services/initialization.ts`

Service initialization orchestration:

```typescript
import { Store } from '../state/store';
import { AIManager, createAIManager } from './ai/services/ai-manager';
import { AIServicesConfig, DEFAULT_CONFIG } from './ai/services/service-config';
import { createAuditMiddleware } from '../state/middleware/audit';
import { createSideEffectsMiddleware } from '../state/middleware/sideEffects';

interface InitializationResult {
  aiManager: AIManager;
  cleanup: () => void;
}

interface InitializationConfig {
  store: Store;
  aiConfig?: Partial<AIServicesConfig>;
  enableAuditLog?: boolean;
  auditLogHandler?: (entry: AuditLogEntry) => void;
  notificationHandler?: (notifications: Notification[]) => void;
}

export function initializeServices(config: InitializationConfig): InitializationResult {
  const { store, aiConfig, enableAuditLog = true, auditLogHandler, notificationHandler } = config;
  
  // 1. Create AI manager
  const aiManager = createAIManager();
  
  // 2. Initialize with store and config
  aiManager.initialize(store, {
    ...DEFAULT_CONFIG,
    ...aiConfig,
  });
  
  // 3. Set up notification forwarding
  if (notificationHandler) {
    // Subscribe to service completions that include notifications
  }
  
  // 4. Return cleanup function
  const cleanup = () => {
    aiManager.shutdown();
  };
  
  return { aiManager, cleanup };
}
```

### 2. CREATE `/src/services/side-effect-handlers.ts`

Define side effect handlers that trigger AI services:

```typescript
import { EncounterAction, EncounterState } from '../state/types';
import { Dispatch } from '../state/store/types';

export type SideEffectHandler = (
  action: EncounterAction,
  state: EncounterState,
  dispatch: Dispatch
) => void | Promise<void>;

// Handler: When item is added, create related tasks
export const itemAddedHandler: SideEffectHandler = async (action, state, dispatch) => {
  if (action.type !== 'ITEM_ADDED') return;
  
  const item = action.payload.item;
  
  // Medications: Create drug interaction check task
  if (item.category === 'medication') {
    // Task creation is handled by AI service, but we can add additional logic here
  }
  
  // Labs/Imaging: Create prior auth check if needed
  if (['lab', 'imaging'].includes(item.category)) {
    // Additional side effects
  }
};

// Handler: When suggestion is accepted, clean up related suggestions
export const suggestionAcceptedHandler: SideEffectHandler = (action, state, dispatch) => {
  if (action.type !== 'SUGGESTION_ACCEPTED') return;
  
  // Find and expire related suggestions
  const acceptedSuggestion = state.entities.suggestions[action.payload.id];
  if (!acceptedSuggestion) return;
  
  // Mark similar suggestions as superseded
};

// Handler: When mode changes to review, trigger note generation
export const modeChangedHandler: SideEffectHandler = (action, state, dispatch) => {
  if (action.type !== 'MODE_CHANGED') return;
  if (action.payload.to !== 'review') return;
  
  // Note generation is handled by AI service
  // Additional cleanup or preparation can go here
};

// Export all handlers
export const DEFAULT_SIDE_EFFECT_HANDLERS: SideEffectHandler[] = [
  itemAddedHandler,
  suggestionAcceptedHandler,
  modeChangedHandler,
];
```

### 3. CREATE `/src/services/notification-manager.ts`

Centralized notification management:

```typescript
interface NotificationManager {
  show(notification: Notification): void;
  showMany(notifications: Notification[]): void;
  dismiss(id: string): void;
  dismissAll(): void;
  
  // Subscriptions
  onNotification(handler: (notification: Notification) => void): () => void;
  
  // State
  getActive(): Notification[];
}

export function createNotificationManager(): NotificationManager {
  const notifications: Map<string, Notification> = new Map();
  const listeners: Set<(notification: Notification) => void> = new Set();
  
  // Auto-dismiss non-persistent notifications after timeout
  // Notify listeners on new notifications
  // Support stacking and positioning
  
  return {
    show: (notification) => { /* ... */ },
    showMany: (notifications) => { /* ... */ },
    dismiss: (id) => { /* ... */ },
    dismissAll: () => { /* ... */ },
    onNotification: (handler) => { /* ... */ },
    getActive: () => Array.from(notifications.values()),
  };
}
```

## Guidelines
- Services should be initialized after store is created
- Cleanup functions must be called on app unmount
- Side effects should not block the main dispatch flow
- Notifications should support queuing and priorities
```

---

## Chunk 4.3: Capture View Screen

### Prompt

```
Create the Capture View screen - the primary charting interface during patient encounters.

## Requirements

### 1. CREATE `/src/screens/CaptureView/CaptureView.tsx`

Main capture view screen:

```typescript
import React from 'react';
import { useEncounterState, useEncounterDispatch } from '../../context';
import { useTranscription } from '../../context/TranscriptionContext';
import { useChartItems, useSuggestions, useItemActions, useSuggestionActions } from '../../hooks';
import { selectCaptureViewData } from '../../state/selectors';

import { AppShell } from '../../components/layout/AppShell';
import { PatientHeader } from '../../components/layout/PatientHeader';
import { ModeSelector } from '../../components/layout/ModeSelector';
import { ChartItemCard } from '../../components/chart-items/ChartItemCard';
import { OmniAddBar } from '../../components/omni-add/OmniAddBar';
import { Minibar } from '../../components/ai-ui/Minibar';
import { Palette } from '../../components/ai-ui/Palette';
import { TaskPane } from '../../components/tasks/TaskPane';

export const CaptureView: React.FC = () => {
  const state = useEncounterState();
  const dispatch = useEncounterDispatch();
  const { status: transcriptionStatus, start, pause, stop } = useTranscription();
  
  const viewData = selectCaptureViewData(state);
  const { addItem } = useItemActions();
  const { acceptSuggestion, dismissSuggestion } = useSuggestionActions();
  
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isTaskPaneOpen, setIsTaskPaneOpen] = useState(false);
  
  // Render:
  // 1. PatientHeader with patient context
  // 2. ModeSelector (Capture active)
  // 3. Scrollable list of ChartItemCards (chronological)
  // 4. OmniAddBar (fixed at bottom, above minibar)
  // 5. Minibar (fixed at very bottom)
  // 6. Palette (slides up from minibar when open)
  // 7. TaskPane (slides in from right when open)
  
  return (
    <AppShell
      header={
        <>
          <PatientHeader 
            patient={state.context.patient} 
            encounter={state.context.encounter}
            careGapCount={viewData.openCareGaps?.length}
          />
          <ModeSelector 
            currentMode={state.session.mode}
            onModeChange={(mode) => dispatch({ type: 'MODE_CHANGED', payload: { to: mode, trigger: 'user' }})}
          />
        </>
      }
      main={
        <div className="capture-view">
          <div className="chart-items-list">
            {viewData.items.map(item => (
              <ChartItemCard 
                key={item.id}
                item={item}
                variant="compact"
                onEdit={() => handleEditItem(item.id)}
              />
            ))}
          </div>
          
          <OmniAddBar
            onItemAdd={handleItemAdd}
            activeSuggestions={viewData.activeSuggestions}
            onSuggestionAccept={handleSuggestionAccept}
            onSuggestionDismiss={handleSuggestionDismiss}
          />
        </div>
      }
      minibar={
        <Minibar
          transcriptionStatus={transcriptionStatus}
          pendingReviewCount={viewData.pendingTaskCount}
          alertCount={viewData.alertCount || 0}
          syncStatus={state.sync.status}
          onTranscriptionToggle={handleTranscriptionToggle}
          onOpenPalette={() => setIsPaletteOpen(true)}
          onOpenTaskPane={() => setIsTaskPaneOpen(true)}
        />
      }
    />
  );
};
```

### 2. CREATE `/src/screens/CaptureView/CaptureView.styles.ts`

Styles for capture view:

```typescript
import { css } from '../../styles/utils';

export const captureViewStyles = {
  container: css`
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  `,
  
  chartItemsList: css`
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-4);
    padding-bottom: var(--spacing-32); /* Space for OmniAdd */
  `,
  
  omniAddContainer: css`
    position: fixed;
    bottom: var(--minibar-height);
    left: 0;
    right: 0;
    padding: var(--spacing-4);
    background: var(--color-neutral-0);
    border-top: 1px solid var(--color-neutral-200);
    z-index: var(--z-sticky);
  `,
};
```

### 3. CREATE `/src/screens/CaptureView/useCaptureView.ts`

Custom hook for capture view logic:

```typescript
import { useCallback, useState } from 'react';
import { useEncounterDispatch } from '../../context';
import { useItemActions, useSuggestionActions } from '../../hooks';
import { useTranscription } from '../../context/TranscriptionContext';
import { ChartItem, ItemSource, Suggestion } from '../../types';

export function useCaptureView() {
  const dispatch = useEncounterDispatch();
  const { addItem } = useItemActions();
  const { acceptSuggestion, dismissSuggestion } = useSuggestionActions();
  const transcription = useTranscription();
  
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  
  const handleItemAdd = useCallback((item: Partial<ChartItem>, source: ItemSource = { type: 'manual' }) => {
    addItem(item, source);
  }, [addItem]);
  
  const handleSuggestionAccept = useCallback((suggestionId: string) => {
    acceptSuggestion(suggestionId);
  }, [acceptSuggestion]);
  
  const handleSuggestionDismiss = useCallback((suggestionId: string, reason?: string) => {
    dismissSuggestion(suggestionId, reason);
  }, [dismissSuggestion]);
  
  const handleTranscriptionToggle = useCallback(() => {
    if (transcription.status === 'recording') {
      transcription.pause();
    } else if (transcription.status === 'paused') {
      transcription.resume();
    } else {
      transcription.start();
    }
  }, [transcription]);
  
  const handleModeChange = useCallback((mode: Mode) => {
    // Check for unsaved changes
    // Dispatch mode change
    dispatch({ type: 'MODE_CHANGED', payload: { to: mode, trigger: 'user' } });
  }, [dispatch]);
  
  return {
    editingItemId,
    setEditingItemId,
    handleItemAdd,
    handleSuggestionAccept,
    handleSuggestionDismiss,
    handleTranscriptionToggle,
    handleModeChange,
  };
}
```

### 4. CREATE `/src/screens/CaptureView/index.ts`

Export capture view:

```typescript
export { CaptureView } from './CaptureView';
export { useCaptureView } from './useCaptureView';
```

## Guidelines
- Items should appear in chronological order (newest at bottom)
- OmniAdd should always be visible and accessible
- Suggestions should animate in/out smoothly
- Transcription status should be clearly visible
- Support keyboard shortcuts for common actions
```

---

## Chunk 4.4: Process View Screen

### Prompt

```
Create the Process View screen - the batch review interface for pending tasks.

## Requirements

### 1. CREATE `/src/screens/ProcessView/ProcessView.tsx`

Main process view screen:

```typescript
import React, { useState } from 'react';
import { useEncounterState, useEncounterDispatch } from '../../context';
import { useTasks, useTaskActions } from '../../hooks';
import { selectTaskPaneData } from '../../state/selectors';

import { AppShell } from '../../components/layout/AppShell';
import { PatientHeader } from '../../components/layout/PatientHeader';
import { ModeSelector } from '../../components/layout/ModeSelector';
import { SplitPane } from '../../components/layout/SplitPane';
import { TaskList } from '../../components/tasks/TaskList';
import { ChartItemCard } from '../../components/chart-items/ChartItemCard';

export const ProcessView: React.FC = () => {
  const state = useEncounterState();
  const dispatch = useEncounterDispatch();
  const taskData = selectTaskPaneData(state);
  const { approveTask, rejectTask, batchApprove } = useTaskActions();
  
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  // Layout:
  // Left pane: Task list grouped by status
  // Right pane: Selected task detail / related item
  
  // Sections in left pane:
  // 1. Needs Review (pending-review) - requires individual action
  // 2. Ready to Send (ready) - can batch send
  // 3. Processing (processing) - in progress
  // 4. Completed (completed) - collapsible
  
  return (
    <AppShell
      header={
        <>
          <PatientHeader 
            patient={state.context.patient} 
            encounter={state.context.encounter}
          />
          <ModeSelector 
            currentMode={state.session.mode}
            onModeChange={(mode) => dispatch({ type: 'MODE_CHANGED', payload: { to: mode, trigger: 'user' }})}
          />
        </>
      }
      main={
        <SplitPane
          left={
            <div className="task-list-container">
              <TaskListSection
                title="Needs Review"
                tasks={taskData.needsReview}
                onTaskSelect={setSelectedTaskId}
                selectedId={selectedTaskId}
              />
              
              <TaskListSection
                title="Ready to Send"
                tasks={taskData.readyToSend}
                onTaskSelect={setSelectedTaskId}
                selectedId={selectedTaskId}
                batchAction={{
                  label: 'Send All',
                  onClick: () => handleBatchSend(taskData.readyToSend.map(t => t.id)),
                }}
              />
              
              <TaskListSection
                title="Processing"
                tasks={taskData.processing}
                onTaskSelect={setSelectedTaskId}
                selectedId={selectedTaskId}
                collapsible
              />
              
              <TaskListSection
                title="Completed"
                tasks={taskData.completed}
                onTaskSelect={setSelectedTaskId}
                selectedId={selectedTaskId}
                collapsible
                defaultCollapsed
              />
            </div>
          }
          right={
            <TaskDetailPane
              task={selectedTaskId ? state.entities.tasks[selectedTaskId] : null}
              relatedItem={getRelatedItem(selectedTaskId)}
              onApprove={() => selectedTaskId && approveTask(selectedTaskId)}
              onReject={(reason) => selectedTaskId && rejectTask(selectedTaskId, reason)}
            />
          }
          defaultSplit={40}
        />
      }
    />
  );
};
```

### 2. CREATE `/src/screens/ProcessView/TaskDetailPane.tsx`

Detail pane for selected task:

```typescript
interface TaskDetailPaneProps {
  task: BackgroundTask | null;
  relatedItem: ChartItem | null;
  onApprove: () => void;
  onReject: (reason?: string) => void;
}

export const TaskDetailPane: React.FC<TaskDetailPaneProps> = ({
  task,
  relatedItem,
  onApprove,
  onReject,
}) => {
  if (!task) {
    return <EmptyState message="Select a task to view details" />;
  }
  
  // Render based on task type:
  // - dx-association: Show suggested diagnoses, allow selection
  // - drug-interaction: Show interaction details, severity
  // - note-generation: Show generated note preview
  // - etc.
  
  return (
    <div className="task-detail-pane">
      <TaskHeader task={task} />
      
      {relatedItem && (
        <div className="related-item">
          <h4>Related Item</h4>
          <ChartItemCard item={relatedItem} variant="expanded" />
        </div>
      )}
      
      <TaskResultDisplay task={task} />
      
      <TaskActions
        task={task}
        onApprove={onApprove}
        onReject={onReject}
      />
    </div>
  );
};
```

### 3. CREATE `/src/screens/ProcessView/index.ts`

Export process view:

```typescript
export { ProcessView } from './ProcessView';
export { TaskDetailPane } from './TaskDetailPane';
```

## Guidelines
- Tasks should be clearly grouped by required action
- Batch operations should show confirmation
- Selected task should highlight in list
- Show progress for processing tasks
- Keyboard navigation between tasks
```

---

## Chunk 4.5: Review View Screen

### Prompt

```
Create the Review View screen - the final review interface before signing.

## Requirements

### 1. CREATE `/src/screens/ReviewView/ReviewView.tsx`

Main review view screen:

```typescript
import React, { useState } from 'react';
import { useEncounterState, useEncounterDispatch } from '../../context';
import { selectReviewViewData } from '../../state/selectors';

import { AppShell } from '../../components/layout/AppShell';
import { PatientHeader } from '../../components/layout/PatientHeader';
import { ModeSelector } from '../../components/layout/ModeSelector';
import { ChartItemCard } from '../../components/chart-items/ChartItemCard';
import { CareGapList } from '../../components/care-gaps/CareGapList';

export const ReviewView: React.FC = () => {
  const state = useEncounterState();
  const dispatch = useEncounterDispatch();
  const viewData = selectReviewViewData(state);
  
  // Layout:
  // Organized by category sections (not chronological)
  // - Chief Complaint / HPI
  // - Review of Systems
  // - Physical Exam
  // - Vitals
  // - Assessment (Diagnoses)
  // - Plan (Medications, Labs, Imaging, Referrals, Instructions)
  // - Visit Note
  // - Care Gaps Summary
  
  // Sign-off button at bottom
  
  const handleSignOff = () => {
    // Check for incomplete items
    // Check for unreviewed AI content
    // Confirm and sign
  };
  
  return (
    <AppShell
      header={
        <>
          <PatientHeader 
            patient={state.context.patient} 
            encounter={state.context.encounter}
          />
          <ModeSelector 
            currentMode={state.session.mode}
            onModeChange={(mode) => dispatch({ type: 'MODE_CHANGED', payload: { to: mode, trigger: 'user' }})}
          />
        </>
      }
      main={
        <div className="review-view">
          <ReviewSection title="Chief Complaint / HPI">
            {viewData.itemsByCategory['chief-complaint']?.map(renderItem)}
            {viewData.itemsByCategory['hpi']?.map(renderItem)}
          </ReviewSection>
          
          <ReviewSection title="Review of Systems">
            {viewData.itemsByCategory['ros']?.map(renderItem)}
          </ReviewSection>
          
          <ReviewSection title="Physical Exam">
            {viewData.itemsByCategory['physical-exam']?.map(renderItem)}
          </ReviewSection>
          
          <ReviewSection title="Vitals">
            {viewData.itemsByCategory['vitals']?.map(renderItem)}
          </ReviewSection>
          
          <ReviewSection title="Assessment">
            {viewData.itemsByCategory['diagnosis']?.map(renderItem)}
          </ReviewSection>
          
          <ReviewSection title="Plan">
            {viewData.itemsByCategory['medication']?.map(renderItem)}
            {viewData.itemsByCategory['lab']?.map(renderItem)}
            {viewData.itemsByCategory['imaging']?.map(renderItem)}
            {viewData.itemsByCategory['referral']?.map(renderItem)}
            {viewData.itemsByCategory['procedure']?.map(renderItem)}
            {viewData.itemsByCategory['instruction']?.map(renderItem)}
          </ReviewSection>
          
          <ReviewSection title="Visit Note">
            {viewData.itemsByCategory['note']?.map(renderItem)}
          </ReviewSection>
          
          {viewData.openCareGaps.length > 0 && (
            <ReviewSection title="Care Gaps">
              <CareGapList gaps={viewData.openCareGaps} groupBy="status" />
            </ReviewSection>
          )}
          
          <SignOffSection
            encounter={state.context.encounter}
            onSignOff={handleSignOff}
            blockers={getSignOffBlockers(state)}
          />
        </div>
      }
    />
  );
};
```

### 2. CREATE `/src/screens/ReviewView/SignOffSection.tsx`

Sign-off section with validation:

```typescript
interface SignOffSectionProps {
  encounter: EncounterMeta;
  onSignOff: () => void;
  blockers: SignOffBlocker[];
}

interface SignOffBlocker {
  type: 'unreviewed-ai' | 'incomplete-item' | 'missing-dx' | 'pending-task';
  message: string;
  itemId?: string;
}

export const SignOffSection: React.FC<SignOffSectionProps> = ({
  encounter,
  onSignOff,
  blockers,
}) => {
  const hasBlockers = blockers.length > 0;
  
  return (
    <div className="sign-off-section">
      {hasBlockers && (
        <div className="blockers">
          <h4>Items requiring attention before sign-off:</h4>
          <ul>
            {blockers.map((blocker, i) => (
              <li key={i} className={`blocker blocker-${blocker.type}`}>
                {blocker.message}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <Button
        variant="primary"
        size="lg"
        disabled={hasBlockers}
        onClick={onSignOff}
      >
        Sign Encounter
      </Button>
      
      {!hasBlockers && (
        <p className="sign-off-note">
          By signing, you confirm that all documentation is accurate and complete.
        </p>
      )}
    </div>
  );
};
```

### 3. CREATE `/src/screens/ReviewView/index.ts`

Export review view:

```typescript
export { ReviewView } from './ReviewView';
export { SignOffSection } from './SignOffSection';
```

## Guidelines
- Show items organized by clinical sections
- Highlight AI-generated content requiring review
- Show clear blockers preventing sign-off
- Visit note should be editable inline
- Care gaps should show final status
```

---

## Chunk 4.6: Patient Overview Screen

### Prompt

```
Create the Patient Overview screen - displays patient context and care gaps.

## Requirements

### 1. CREATE `/src/screens/PatientOverview/PatientOverview.tsx`

Patient overview screen:

```typescript
import React from 'react';
import { useEncounterState } from '../../context';
import { selectPatientOverviewData } from '../../state/selectors';

export const PatientOverview: React.FC = () => {
  const state = useEncounterState();
  const viewData = selectPatientOverviewData(state);
  
  if (!viewData.patient) {
    return <EmptyState message="No patient selected" />;
  }
  
  return (
    <div className="patient-overview">
      {/* Demographics Card */}
      <DemographicsCard patient={viewData.patient} />
      
      {/* Allergies Card - prominent if any */}
      <AllergiesCard allergies={viewData.allergies} />
      
      {/* Problem List */}
      <ProblemListCard problems={viewData.problemList} />
      
      {/* Current Medications */}
      <MedicationsCard medications={viewData.medications} />
      
      {/* Care Gaps */}
      <CareGapsCard gaps={viewData.openCareGaps} />
      
      {/* Recent Encounters */}
      <RecentEncountersCard encounters={viewData.patient.clinicalSummary?.recentEncounters} />
    </div>
  );
};
```

### 2. CREATE `/src/screens/PatientOverview/PatientCards.tsx`

Individual card components:

```typescript
// Demographics Card
export const DemographicsCard: React.FC<{ patient: PatientContext }> = ({ patient }) => {
  const { demographics, mrn, contact, insurance } = patient;
  
  return (
    <Card variant="default" padding="md">
      <h2>{demographics.firstName} {demographics.lastName}</h2>
      <div className="demographics-grid">
        <div>DOB: {formatDate(demographics.dateOfBirth)} ({demographics.age}yo)</div>
        <div>Gender: {demographics.gender}</div>
        <div>MRN: {mrn}</div>
        {demographics.preferredName && <div>Preferred: {demographics.preferredName}</div>}
        {insurance?.primary && <div>Insurance: {insurance.primary.payerName}</div>}
      </div>
    </Card>
  );
};

// Allergies Card
export const AllergiesCard: React.FC<{ allergies: AllergyItem[] }> = ({ allergies }) => {
  const severeAllergies = allergies.filter(a => a.data.severity === 'severe');
  
  return (
    <Card 
      variant={severeAllergies.length > 0 ? 'elevated' : 'default'} 
      padding="md"
      className={severeAllergies.length > 0 ? 'allergy-alert' : ''}
    >
      <h3>Allergies {allergies.length === 0 && '(NKDA)'}</h3>
      {allergies.map(allergy => (
        <div key={allergy.id} className={`allergy allergy-${allergy.data.severity}`}>
          <strong>{allergy.data.allergen}</strong>
          {allergy.data.reaction && <span> - {allergy.data.reaction}</span>}
          <Badge variant={allergy.data.severity === 'severe' ? 'error' : 'warning'} size="sm">
            {allergy.data.severity}
          </Badge>
        </div>
      ))}
    </Card>
  );
};

// Problem List Card
export const ProblemListCard: React.FC<{ problems: DiagnosisItem[] }> = ({ problems }) => {
  const activeProblems = problems.filter(p => p.data.clinicalStatus === 'active');
  
  return (
    <Card variant="default" padding="md">
      <h3>Problem List ({activeProblems.length} active)</h3>
      {activeProblems.map(problem => (
        <div key={problem.id} className="problem-item">
          <span>{problem.data.description}</span>
          <code>{problem.data.icdCode}</code>
        </div>
      ))}
    </Card>
  );
};

// Continue with MedicationsCard, CareGapsCard, RecentEncountersCard...
```

### 3. CREATE `/src/screens/PatientOverview/index.ts`

Export patient overview:

```typescript
export { PatientOverview } from './PatientOverview';
export * from './PatientCards';
```

## Guidelines
- Allergies should be prominently displayed
- Severe allergies should have visual alert
- Care gaps should show actionable status
- Problem list should distinguish active vs resolved
```

---

## Chunk 4.7: App Router & Navigation

### Prompt

```
Create the application router and navigation structure.

## Requirements

### 1. CREATE `/src/navigation/routes.ts`

Define application routes:

```typescript
export const ROUTES = {
  HOME: '/',
  ENCOUNTER: '/encounter/:encounterId',
  CAPTURE: '/encounter/:encounterId/capture',
  PROCESS: '/encounter/:encounterId/process',
  REVIEW: '/encounter/:encounterId/review',
  PATIENT: '/patient/:patientId',
  SETTINGS: '/settings',
} as const;

export type RoutePath = typeof ROUTES[keyof typeof ROUTES];

export function buildEncounterRoute(encounterId: string, mode?: Mode): string {
  const base = `/encounter/${encounterId}`;
  if (mode) {
    return `${base}/${mode}`;
  }
  return base;
}

export function buildPatientRoute(patientId: string): string {
  return `/patient/${patientId}`;
}
```

### 2. CREATE `/src/navigation/AppRouter.tsx`

Main application router:

```typescript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './routes';

import { CaptureView } from '../screens/CaptureView';
import { ProcessView } from '../screens/ProcessView';
import { ReviewView } from '../screens/ReviewView';
import { PatientOverview } from '../screens/PatientOverview';
import { EncounterLoader } from './EncounterLoader';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home - redirect to demo or login */}
        <Route path={ROUTES.HOME} element={<Navigate to="/demo" />} />
        
        {/* Encounter routes - wrapped in loader */}
        <Route path="/encounter/:encounterId" element={<EncounterLoader />}>
          <Route index element={<Navigate to="capture" replace />} />
          <Route path="capture" element={<CaptureView />} />
          <Route path="process" element={<ProcessView />} />
          <Route path="review" element={<ReviewView />} />
        </Route>
        
        {/* Patient overview */}
        <Route path="/patient/:patientId" element={<PatientOverview />} />
        
        {/* Demo route for testing */}
        <Route path="/demo" element={<DemoLauncher />} />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};
```

### 3. CREATE `/src/navigation/EncounterLoader.tsx`

Encounter data loader wrapper:

```typescript
import React, { useEffect, useState } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { useEncounterDispatch } from '../context';
import { generateEncounterState } from '../mocks/generators/state';
import { PATIENT_TEMPLATES, ENCOUNTER_TEMPLATES } from '../mocks';

export const EncounterLoader: React.FC = () => {
  const { encounterId } = useParams<{ encounterId: string }>();
  const dispatch = useEncounterDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadEncounter() {
      try {
        setIsLoading(true);
        
        // In production, this would fetch from API
        // For demo, use mock data based on encounterId
        const mockData = getMockDataForEncounter(encounterId);
        
        dispatch({
          type: 'ENCOUNTER_OPENED',
          payload: {
            encounterId: mockData.encounter.id,
            patient: mockData.patient,
            encounter: mockData.encounter,
            visit: mockData.visit,
          },
        });
        
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    }
    
    loadEncounter();
    
    return () => {
      dispatch({ type: 'ENCOUNTER_CLOSED', payload: { save: false } });
    };
  }, [encounterId, dispatch]);
  
  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;
  
  return <Outlet />;
};

function getMockDataForEncounter(encounterId: string) {
  // Map encounter IDs to mock scenarios
  if (encounterId === 'uc-cough' || encounterId === 'demo-uc') {
    return {
      patient: PATIENT_TEMPLATES.ucCough,
      ...ENCOUNTER_TEMPLATES.urgentCareCough,
    };
  }
  if (encounterId === 'pc-diabetes' || encounterId === 'demo-pc') {
    return {
      patient: PATIENT_TEMPLATES.pcDiabetes,
      ...ENCOUNTER_TEMPLATES.diabetesFollowUp,
    };
  }
  // Default
  return {
    patient: PATIENT_TEMPLATES.healthyAdult,
    ...ENCOUNTER_TEMPLATES.urgentCareCough,
  };
}
```

### 4. CREATE `/src/navigation/index.ts`

Export navigation:

```typescript
export { AppRouter } from './AppRouter';
export { EncounterLoader } from './EncounterLoader';
export * from './routes';
```

## Guidelines
- Mode changes should update URL
- Back button should work intuitively
- Encounter data should load before rendering views
- Support deep linking to specific modes
```

---

## Chunk 4.8: Scenario Runner

### Prompt

```
Create a scenario runner for testing and demos that replays timed events.

## Requirements

### 1. CREATE `/src/scenarios/ScenarioRunner.ts`

Scenario execution engine:

```typescript
import { EncounterAction, EncounterState } from '../types';
import { Store } from '../state/store';

interface ScenarioEvent {
  delayMs: number;              // Delay from previous event
  action: EncounterAction;
  description: string;
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  initialState: Partial<EncounterState>;
  events: ScenarioEvent[];
}

interface ScenarioRunner {
  // Load scenario
  load(scenario: Scenario): void;
  
  // Playback control
  start(): void;
  pause(): void;
  resume(): void;
  stop(): void;
  
  // Step through
  stepForward(): void;
  stepBackward(): void;
  goToEvent(index: number): void;
  
  // Speed control
  setSpeed(multiplier: number): void; // 0.5x, 1x, 2x, etc.
  
  // Status
  getStatus(): ScenarioStatus;
  getCurrentEventIndex(): number;
  
  // Events
  onEventExecuted(handler: (event: ScenarioEvent, index: number) => void): () => void;
  onComplete(handler: () => void): () => void;
}

interface ScenarioStatus {
  isLoaded: boolean;
  isRunning: boolean;
  isPaused: boolean;
  currentIndex: number;
  totalEvents: number;
  elapsedMs: number;
}

export function createScenarioRunner(store: Store): ScenarioRunner {
  let scenario: Scenario | null = null;
  let currentIndex = 0;
  let isRunning = false;
  let isPaused = false;
  let speed = 1;
  let timeoutId: NodeJS.Timeout | null = null;
  
  // Implementation...
  
  return {
    load,
    start,
    pause,
    resume,
    stop,
    stepForward,
    stepBackward,
    goToEvent,
    setSpeed,
    getStatus,
    getCurrentEventIndex,
    onEventExecuted,
    onComplete,
  };
}
```

### 2. CREATE `/src/scenarios/definitions/uc-cough.ts`

UC Cough scenario definition:

```typescript
import { Scenario } from '../ScenarioRunner';
import { PATIENT_TEMPLATES, ENCOUNTER_TEMPLATES, ITEM_TEMPLATES } from '../../mocks';

export const UC_COUGH_SCENARIO: Scenario = {
  id: 'uc-cough',
  name: 'Urgent Care - Cough',
  description: '42yo female presenting with cough x 5 days',
  
  initialState: {
    context: {
      patient: PATIENT_TEMPLATES.ucCough,
      encounter: ENCOUNTER_TEMPLATES.urgentCareCough.encounter,
      visit: ENCOUNTER_TEMPLATES.urgentCareCough.visit,
    },
  },
  
  events: [
    {
      delayMs: 1000,
      action: {
        type: 'ITEM_ADDED',
        payload: {
          item: generateVitalsItem({
            measurements: [
              { type: 'bp-systolic', value: 128, unit: 'mmHg' },
              { type: 'bp-diastolic', value: 82, unit: 'mmHg' },
              { type: 'pulse', value: 78, unit: 'bpm' },
              { type: 'temp', value: 98.6, unit: '°F' },
              { type: 'spo2', value: 98, unit: '%' },
            ],
          }),
          source: { type: 'manual' },
        },
      },
      description: 'MA records vitals',
    },
    {
      delayMs: 2000,
      action: { type: 'TRANSCRIPTION_STARTED', payload: {} },
      description: 'MA starts transcription',
    },
    {
      delayMs: 2000,
      action: {
        type: 'TRANSCRIPTION_SEGMENT_RECEIVED',
        payload: {
          segment: {
            id: generateId('seg'),
            text: 'Patient reports cough for 5 days, worse at night',
            startTime: 0,
            endTime: 3,
            confidence: 0.92,
            speaker: 'patient',
          },
        },
      },
      description: 'Transcription: chief complaint',
    },
    // Continue with more events...
  ],
};
```

### 3. CREATE `/src/scenarios/definitions/pc-diabetes.ts`

PC Diabetes scenario definition:

```typescript
import { Scenario } from '../ScenarioRunner';

export const PC_DIABETES_SCENARIO: Scenario = {
  id: 'pc-diabetes',
  name: 'Primary Care - Diabetes Follow-up',
  description: '58yo male with DM, HTN for quarterly follow-up',
  
  // Similar structure to UC_COUGH_SCENARIO
  // Include care gap events
};
```

### 4. CREATE `/src/scenarios/index.ts`

Export scenarios:

```typescript
export { createScenarioRunner, ScenarioRunner, Scenario, ScenarioEvent } from './ScenarioRunner';
export { UC_COUGH_SCENARIO } from './definitions/uc-cough';
export { PC_DIABETES_SCENARIO } from './definitions/pc-diabetes';

export const ALL_SCENARIOS = [
  UC_COUGH_SCENARIO,
  PC_DIABETES_SCENARIO,
];
```

## Guidelines
- Events should replay at realistic timing
- Support speed adjustment for demos
- Allow stepping through events manually
- Provide clear event descriptions for narration
```

---

## Chunk 4.9: Integration Tests

### Prompt

```
Create integration tests for the complete system.

## Requirements

### 1. CREATE `/src/__tests__/integration/capture-flow.test.ts`

Test capture mode workflows:

```typescript
import { createStore } from '../../state/store';
import { createInitialState } from '../../state/initialState';
import { initializeServices } from '../../services/initialization';
import { PATIENT_TEMPLATES, ITEM_TEMPLATES } from '../../mocks';

describe('Capture Flow Integration', () => {
  let store: Store;
  let services: ReturnType<typeof initializeServices>;
  
  beforeEach(() => {
    store = createStore({ initialState: createInitialState() });
    services = initializeServices({ store });
    
    // Open encounter
    store.dispatch({
      type: 'ENCOUNTER_OPENED',
      payload: {
        encounterId: 'test-001',
        patient: PATIENT_TEMPLATES.ucCough,
        encounter: { id: 'test-001', status: 'in-progress', type: 'urgent-care' },
      },
    });
  });
  
  afterEach(() => {
    services.cleanup();
  });
  
  test('adding medication creates dx-association task', async () => {
    // Add medication
    store.dispatch({
      type: 'ITEM_ADDED',
      payload: {
        item: ITEM_TEMPLATES.benzonatate,
        source: { type: 'manual' },
      },
    });
    
    // Wait for AI service
    await waitFor(() => {
      const tasks = Object.values(store.getState().entities.tasks);
      return tasks.some(t => t.type === 'dx-association');
    });
    
    // Verify task was created
    const tasks = Object.values(store.getState().entities.tasks);
    expect(tasks.find(t => t.type === 'dx-association')).toBeDefined();
  });
  
  test('accepting suggestion creates chart item', () => {
    // Create suggestion
    const suggestionId = 'sug-001';
    store.dispatch({
      type: 'SUGGESTION_RECEIVED',
      payload: {
        suggestion: {
          id: suggestionId,
          type: 'chart-item',
          status: 'active',
          content: {
            type: 'new-item',
            category: 'diagnosis',
            itemTemplate: { displayText: 'Acute bronchitis', data: { icdCode: 'J20.9' } },
          },
          source: 'transcription',
          confidence: 0.85,
          createdAt: new Date(),
          displayText: 'Acute bronchitis J20.9',
        },
        source: 'transcription',
      },
    });
    
    // Accept suggestion
    store.dispatch({
      type: 'SUGGESTION_ACCEPTED',
      payload: { id: suggestionId },
    });
    
    // Verify item created
    const items = Object.values(store.getState().entities.items);
    expect(items.find(i => i.displayText === 'Acute bronchitis')).toBeDefined();
    
    // Verify suggestion status
    expect(store.getState().entities.suggestions[suggestionId].status).toBe('accepted');
  });
  
  // More tests...
});
```

### 2. CREATE `/src/__tests__/integration/care-gap-flow.test.ts`

Test care gap workflows:

```typescript
describe('Care Gap Flow Integration', () => {
  test('ordering lab addresses diabetes A1C gap', async () => {
    // Setup with diabetes patient and open A1C gap
    // Order A1C lab
    // Verify gap status changes to 'pending'
  });
  
  test('excluding gap updates status and records reason', () => {
    // Setup with open gap
    // Exclude with reason
    // Verify status and exclusion reason
  });
  
  test('care gaps refresh on encounter open', async () => {
    // Open encounter for patient with gaps
    // Verify gaps are populated
  });
});
```

### 3. CREATE `/src/__tests__/integration/task-flow.test.ts`

Test task workflows:

```typescript
describe('Task Flow Integration', () => {
  test('batch approve sends multiple items', () => {
    // Create multiple ready tasks
    // Batch approve
    // Verify all items sent
  });
  
  test('drug interaction creates alert for severe interaction', async () => {
    // Add medication with known interaction
    // Wait for service
    // Verify alert created
  });
});
```

### 4. CREATE `/src/__tests__/integration/mode-transitions.test.ts`

Test mode switching:

```typescript
describe('Mode Transitions', () => {
  test('switching to review generates note', async () => {
    // Add items in capture mode
    // Switch to review
    // Verify note generation triggered
  });
  
  test('sign-off blocked with unreviewed AI content', () => {
    // Add AI-generated item with requiresReview
    // Attempt sign-off
    // Verify blocker returned
  });
});
```

### 5. CREATE `/src/__tests__/integration/scenario-replay.test.ts`

Test scenario replay:

```typescript
import { createScenarioRunner } from '../../scenarios';
import { UC_COUGH_SCENARIO } from '../../scenarios/definitions/uc-cough';

describe('Scenario Replay', () => {
  test('UC Cough scenario completes successfully', async () => {
    const store = createStore();
    const runner = createScenarioRunner(store);
    
    runner.load(UC_COUGH_SCENARIO);
    runner.setSpeed(10); // 10x speed for testing
    
    const completionPromise = new Promise(resolve => {
      runner.onComplete(resolve);
    });
    
    runner.start();
    await completionPromise;
    
    // Verify final state
    const state = store.getState();
    expect(Object.keys(state.entities.items).length).toBeGreaterThan(5);
    expect(state.context.encounter.status).toBe('in-progress');
  });
});
```

## Guidelines
- Use realistic test data from mocks
- Test async service flows with proper waits
- Verify state changes after each action
- Test error cases and edge conditions
```

---

## Chunk 4.10: App Entry Point

### Prompt

```
Create the main application entry point that ties everything together.

## Requirements

### 1. CREATE `/src/App.tsx`

Main application component:

```typescript
import React from 'react';
import { AppProviders } from './context';
import { AppRouter } from './navigation';
import { ErrorBoundary } from './components/ErrorBoundary';

import './styles/global.css';

interface AppProps {
  useMockServices?: boolean;
  mockScenario?: string;
  initialState?: Partial<EncounterState>;
}

export const App: React.FC<AppProps> = ({
  useMockServices = true,  // Default to mock for development
  mockScenario,
  initialState,
}) => {
  return (
    <ErrorBoundary>
      <AppProviders
        initialState={initialState}
        useMockTranscription={useMockServices}
        mockScenario={mockScenario}
      >
        <AppRouter />
      </AppProviders>
    </ErrorBoundary>
  );
};

export default App;
```

### 2. CREATE `/src/index.tsx`

Application entry point:

```typescript
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);

// Get configuration from environment or query params
const urlParams = new URLSearchParams(window.location.search);
const scenario = urlParams.get('scenario');
const useMock = urlParams.get('mock') !== 'false';

root.render(
  <React.StrictMode>
    <App 
      useMockServices={useMock}
      mockScenario={scenario || undefined}
    />
  </React.StrictMode>
);
```

### 3. CREATE `/src/styles/global.css`

Global styles:

```css
/* CSS Reset */
*, *::before, *::after {
  box-sizing: border-box;
}

* {
  margin: 0;
}

html, body, #root {
  height: 100%;
}

body {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  background-color: var(--color-neutral-50);
  color: var(--color-neutral-900);
}

/* CSS Variables from tokens */
:root {
  /* Colors */
  --color-primary-500: #6366F1;
  --color-primary-600: #4F46E5;
  /* ... import from tokens */
  
  /* Spacing */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-4: 1rem;
  /* ... */
  
  /* Typography */
  --font-family-sans: Inter, system-ui, -apple-system, sans-serif;
  --font-size-base: 1rem;
  /* ... */
  
  /* Layout */
  --minibar-height: 48px;
  --header-height: 64px;
  --sidebar-width: 280px;
}

/* Focus styles for accessibility */
:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-neutral-100);
}

::-webkit-scrollbar-thumb {
  background: var(--color-neutral-300);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-neutral-400);
}
```

## Guidelines
- Support configuration via URL params for demos
- Include proper error boundaries
- Set up CSS custom properties from tokens
- Enable React strict mode for development
```

---

## Execution Order

Run these prompts in sequence, **reviewing each change**:

1. **4.1 Store Provider & Context** → Foundation for React integration
2. **4.2 Service Initialization** → Wire AI services to store
3. **4.3 Capture View** → Primary charting screen
4. **4.4 Process View** → Task review screen
5. **4.5 Review View** → Final review screen
6. **4.6 Patient Overview** → Patient context screen
7. **4.7 App Router** → Navigation setup
8. **4.8 Scenario Runner** → Demo/test tooling
9. **4.9 Integration Tests** → Verify everything works
10. **4.10 App Entry Point** → Final assembly

---

## Verification Checklist

After completing Phase 4:

- [ ] App compiles and runs without errors
- [ ] Can navigate between all routes
- [ ] Capture view shows items and suggestions
- [ ] Process view shows tasks grouped by status
- [ ] Review view shows items by category
- [ ] Mode switching updates URL and view
- [ ] Transcription toggle works
- [ ] Adding items triggers AI services
- [ ] Scenario runner can replay events
- [ ] All integration tests pass

---

## Demo URLs

After completing integration:

```
# Default capture view with mock data
http://localhost:3000/encounter/demo-uc/capture

# Diabetes scenario
http://localhost:3000/encounter/demo-pc/capture

# With scenario auto-play
http://localhost:3000/encounter/demo-uc/capture?scenario=uc-cough

# Disable mocks (requires real backend)
http://localhost:3000/encounter/123/capture?mock=false
```

---

## Related Documents

- [Phase 1: Foundation](./PHASE_1_PROMPTS.md) — Types, state, actions
- [Phase 2: AI Services](./PHASE_2_PROMPTS.md) — Service layer
- [Phase 3: UI Components](./PHASE_3_PROMPTS.md) — Components
- [Visit Scenarios](./VISIT_SCENARIOS.md) — Test scenarios
