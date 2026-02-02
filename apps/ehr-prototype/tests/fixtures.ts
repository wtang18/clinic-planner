/**
 * Test Fixtures
 *
 * Factory functions for creating consistent test data.
 * Use these instead of manually constructing test objects.
 */

import type { ChartItem, DiagnosisItem, MedicationItem } from '../src/types/chart-items';
import type { Suggestion } from '../src/types/suggestions';
import type { PatientContext, EncounterContext, VisitContext } from '../src/types';
import type { EncounterState } from '../src/state/store/types';
import type { ToDoItem, ToDoCategory } from '../src/scenarios/todoData';

// ============================================================================
// ID Generation
// ============================================================================

let idCounter = 0;

export function resetIdCounter(): void {
  idCounter = 0;
}

export function generateId(prefix = 'test'): string {
  return `${prefix}-${++idCounter}`;
}

// ============================================================================
// Date Helpers
// ============================================================================

/**
 * Get a date N days from today (local time)
 */
export function dateFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get a timestamp N days ago
 */
export function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function today(): string {
  return dateFromNow(0);
}

// ============================================================================
// Patient Fixtures
// ============================================================================

export function createTestPatient(overrides: Partial<PatientContext> = {}): PatientContext {
  const id = generateId('patient');
  return {
    id,
    mrn: generateId('mrn'),
    demographics: {
      firstName: 'Test',
      lastName: 'Patient',
      dateOfBirth: new Date('1980-01-15'),
      age: 44,
      gender: 'female',
      ...overrides.demographics,
    },
    insurance: {
      primary: {
        payerId: 'TEST',
        payerName: 'Test Insurance',
        memberId: 'TEST123',
      },
      ...overrides.insurance,
    },
    clinicalSummary: {
      problemList: [],
      medications: [],
      allergies: [],
      recentEncounters: [],
      ...overrides.clinicalSummary,
    },
    ...overrides,
  };
}

export function createTestEncounter(overrides: Partial<EncounterContext> = {}): EncounterContext {
  return {
    id: generateId('encounter'),
    type: 'Urgent Care',
    status: 'in-progress',
    startTime: new Date(),
    ...overrides,
  };
}

export function createTestVisit(overrides: Partial<VisitContext> = {}): VisitContext {
  return {
    chiefComplaint: 'Test complaint',
    appointmentType: 'urgent-care',
    scheduledTime: new Date(),
    ...overrides,
  };
}

// ============================================================================
// Chart Item Fixtures
// ============================================================================

export function createTestChartItem(overrides: Partial<ChartItem> = {}): ChartItem {
  const id = generateId('item');
  const now = new Date();
  return {
    id,
    category: 'chief-complaint',
    status: 'pending-review',
    displayText: 'Test chart item',
    createdAt: now,
    createdBy: { id: 'user-1', name: 'Test User' },
    modifiedAt: now,
    modifiedBy: { id: 'user-1', name: 'Test User' },
    source: { type: 'manual' },
    tags: [],
    linkedDiagnoses: [],
    linkedEncounters: [],
    _meta: { syncStatus: 'local', aiGenerated: false, requiresReview: false },
    data: { text: 'Test item', format: 'plain' as const },
    ...overrides,
  } as ChartItem;
}

export function createTestDiagnosis(overrides: Partial<DiagnosisItem> = {}): DiagnosisItem {
  return createTestChartItem({
    category: 'diagnosis',
    displayText: 'Test Diagnosis',
    data: {
      description: 'Test Diagnosis',
      icdCode: 'Z00.00',
      type: 'encounter' as const,
      clinicalStatus: 'active' as const,
    },
    ...overrides,
  }) as DiagnosisItem;
}

export function createTestMedication(overrides: Partial<MedicationItem> = {}): MedicationItem {
  return createTestChartItem({
    category: 'medication',
    displayText: 'Test Medication 100mg',
    data: {
      drugName: 'Test Medication',
      dosage: '100mg',
      route: 'PO',
      frequency: 'daily',
      isControlled: false,
      prescriptionType: 'new' as const,
    },
    ...overrides,
  }) as MedicationItem;
}

// ============================================================================
// Suggestion Fixtures
// ============================================================================

export function createTestSuggestion(overrides: Partial<Suggestion> = {}): Suggestion {
  const id = generateId('suggestion');
  return {
    id,
    type: 'chart-item',
    status: 'active',
    content: {
      type: 'new-item',
      category: 'diagnosis',
      itemTemplate: {
        displayText: 'Suggested diagnosis',
      },
    },
    source: 'ai-analysis',
    confidence: 0.85,
    createdAt: new Date(),
    displayText: 'Test suggestion',
    ...overrides,
  } as Suggestion;
}

// ============================================================================
// To-Do Fixtures
// ============================================================================

export function createTestToDoItem(overrides: Partial<ToDoItem> = {}): ToDoItem {
  const id = generateId('todo');
  return {
    id,
    categoryId: 'tasks',
    filterId: 'my-pending',
    title: 'Test To-Do Item',
    patient: {
      id: generateId('patient'),
      name: 'Test Patient',
      age: 45,
      gender: 'F',
      mrn: generateId('mrn'),
    },
    createdDate: today(),
    status: 'pending',
    ...overrides,
  };
}

// ============================================================================
// State Fixtures
// ============================================================================

export function createMinimalEncounterState(
  overrides: Partial<EncounterState> = {}
): EncounterState {
  const patient = createTestPatient();
  const encounter = createTestEncounter();
  const visit = createTestVisit();

  return {
    context: {
      patient,
      encounter,
      visit,
    },
    entities: {
      items: {},
      suggestions: {},
      tasks: {},
      careGaps: {},
      alerts: {},
    },
    session: {
      mode: 'capture',
      transcription: {
        status: 'idle',
        totalDuration: 0,
        segmentCount: 0,
      },
      currentUser: {
        id: 'user-1',
        name: 'Test Provider',
        role: 'provider',
      },
    },
    sync: {
      status: 'idle',
      lastSyncAt: null,
      pendingChanges: [],
    },
    ...overrides,
  } as EncounterState;
}

// ============================================================================
// Render Helpers
// ============================================================================

/**
 * Create a wrapper component with providers for testing
 * Usage: render(<Component />, { wrapper: createTestWrapper() })
 */
export function createTestWrapper() {
  // Import providers here to avoid circular dependencies
  // This is a placeholder - implement based on your provider structure
  return ({ children }: { children: React.ReactNode }) => children;
}
