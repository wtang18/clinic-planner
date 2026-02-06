import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { colors } from '../../styles/foundations';
import { ChartItemCard } from '../../components/chart-items/ChartItemCard';
import { MedicationCard } from '../../components/chart-items/MedicationCard';
import { LabCard } from '../../components/chart-items/LabCard';
import { VitalsCard } from '../../components/chart-items/VitalsCard';
import { DiagnosisCard } from '../../components/chart-items/DiagnosisCard';
import { CareGapCard } from '../../components/care-gaps/CareGapCard';
import { SuggestionChip } from '../../components/suggestions/SuggestionChip';
import { TaskCard } from '../../components/tasks/TaskCard';
import { Badge } from '../../components/primitives/Badge';
import { Button } from '../../components/primitives/Button';
import type { MedicationItem, LabItem, VitalsItem, DiagnosisItem } from '../../types/chart-items';
import type { CareGapInstance } from '../../types/care-gaps';
import type { Suggestion, BackgroundTask } from '../../types/suggestions';
import { fn } from 'storybook/test';

// ============================================================================
// Mock Data - Full Encounter
// ============================================================================

const baseMeta = { syncStatus: 'synced' as const, aiGenerated: false, requiresReview: false };
const baseItem = {
  createdAt: new Date('2024-01-15T10:30:00'),
  createdBy: { id: 'dr-1', name: 'Dr. Smith', role: 'physician' as const },
  modifiedAt: new Date('2024-01-15T10:30:00'),
  modifiedBy: { id: 'dr-1', name: 'Dr. Smith', role: 'physician' as const },
  source: { type: 'manual' as const },
  linkedDiagnoses: ['dx-1'],
  linkedEncounters: ['enc-1'],
  tags: [] as any[],
};

const mockVitals: VitalsItem = {
  ...baseItem,
  id: 'vitals-1',
  category: 'vitals',
  status: 'confirmed',
  displayText: 'Vitals',
  _meta: baseMeta,
  data: {
    capturedAt: new Date('2024-01-15T10:15:00'),
    position: 'sitting',
    measurements: [
      { type: 'bp-systolic', value: 142, unit: 'mmHg', flag: 'high' },
      { type: 'bp-diastolic', value: 92, unit: 'mmHg', flag: 'high' },
      { type: 'pulse', value: 78, unit: 'bpm', flag: 'normal' },
      { type: 'temp', value: 100.2, unit: '°F', flag: 'high' },
      { type: 'resp', value: 18, unit: '/min', flag: 'normal' },
      { type: 'spo2', value: 97, unit: '%', flag: 'normal' },
    ],
  },
};

const mockDiagnosis: DiagnosisItem = {
  ...baseItem,
  id: 'dx-1',
  category: 'diagnosis',
  status: 'confirmed',
  displayText: 'Acute Upper Respiratory Infection',
  _meta: baseMeta,
  data: {
    description: 'Acute Upper Respiratory Infection',
    icdCode: 'J06.9',
    type: 'encounter',
    ranking: 'primary',
    clinicalStatus: 'active',
    onsetDate: new Date('2024-01-12'),
  },
};

const mockMedication: MedicationItem = {
  ...baseItem,
  id: 'med-1',
  category: 'medication',
  status: 'confirmed',
  displayText: 'Amoxicillin 500mg',
  displaySubtext: '1 cap PO TID x 10 days',
  _meta: baseMeta,
  data: {
    drugName: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin',
    dosage: '500mg',
    route: 'PO',
    frequency: 'TID',
    duration: '10 days',
    quantity: 30,
    refills: 0,
    isControlled: false,
    prescriptionType: 'new',
    pharmacy: { id: 'pharm-1', name: 'CVS Pharmacy' },
  },
  actions: ['e-prescribe', 'modify', 'cancel'],
};

const mockLab: LabItem = {
  ...baseItem,
  id: 'lab-1',
  category: 'lab',
  status: 'confirmed',
  displayText: 'CBC with Differential',
  _meta: baseMeta,
  data: {
    testName: 'Complete Blood Count',
    panelName: 'CBC with Differential',
    priority: 'routine',
    collectionType: 'send-out',
    labVendor: 'Quest Diagnostics',
    orderStatus: 'ordered',
  },
};

const mockCareGap: CareGapInstance = {
  id: 'cg-1',
  definitionId: 'def-a1c',
  patientId: 'pt-1',
  status: 'open',
  openedAt: new Date('2023-06-01'),
  dueBy: new Date('2023-12-01'),
  closureAttempts: [],
  excluded: false,
  addressedThisEncounter: false,
  encounterActions: [],
  _display: {
    name: 'Hemoglobin A1c',
    category: 'diabetes',
    priority: 'critical',
    actionLabel: 'Order A1c',
    dueLabel: 'Overdue by 45 days',
  },
};

const mockSuggestions: Suggestion[] = [
  {
    id: 'sug-1',
    type: 'chart-item',
    status: 'active',
    source: 'transcription',
    confidence: 0.88,
    createdAt: new Date(),
    displayText: 'Add: Guaifenesin PRN',
    content: { type: 'new-item', category: 'medication', itemTemplate: { displayText: 'Guaifenesin 400mg PRN' } },
  },
  {
    id: 'sug-2',
    type: 'care-gap-action',
    status: 'active',
    source: 'care-gap',
    confidence: 0.95,
    createdAt: new Date(),
    displayText: 'Order A1c (Overdue)',
    content: { type: 'care-gap-action', careGapId: 'cg-1', actionTemplate: { displayText: 'Order A1c' } },
  },
];

const mockTask: BackgroundTask = {
  id: 'task-1',
  type: 'rx-send',
  status: 'ready',
  priority: 'high',
  trigger: { action: 'prescribe', itemId: 'med-1' },
  result: 'Ready to send to CVS Pharmacy',
  createdAt: new Date(Date.now() - 60 * 1000),
  displayTitle: 'E-Prescribe: Amoxicillin 500mg',
  displayStatus: 'Ready',
};

// ============================================================================
// Composite Component
// ============================================================================

const EncounterView: React.FC = () => (
  <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
    {/* Header */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 600, color: colors.fg.neutral.primary }}>
          John Smith
        </h2>
        <span style={{ fontSize: '14px', color: colors.fg.neutral.spotReadable }}>
          DOB: 03/15/1985 (38y) | MRN: 12345678
        </span>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <Badge variant="warning">In Progress</Badge>
        <Badge variant="info">Capture Mode</Badge>
      </div>
    </div>

    {/* Care Gaps */}
    <div>
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: colors.fg.neutral.spotReadable, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
        Care Gaps
      </h3>
      <CareGapCard gap={mockCareGap} compact onAction={fn()} onExclude={fn()} />
    </div>

    {/* Vitals */}
    <div>
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: colors.fg.neutral.spotReadable, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
        Vitals
      </h3>
      <VitalsCard vitals={mockVitals} variant="compact" />
    </div>

    {/* Chart Items */}
    <div>
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: colors.fg.neutral.spotReadable, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
        Chart Items
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <DiagnosisCard diagnosis={mockDiagnosis} variant="compact" />
        <MedicationCard medication={mockMedication} variant="compact" onEdit={fn()} />
        <LabCard lab={mockLab} variant="compact" />
      </div>
    </div>

    {/* AI Suggestions */}
    <div>
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: colors.fg.neutral.spotReadable, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
        Suggestions
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {mockSuggestions.map((s) => (
          <SuggestionChip key={s.id} suggestion={s} onAccept={fn()} onDismiss={fn()} onModify={fn()} />
        ))}
      </div>
    </div>

    {/* Background Tasks */}
    <div>
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: colors.fg.neutral.spotReadable, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
        Pending Actions
      </h3>
      <TaskCard task={mockTask} onApprove={fn()} onReject={fn()} compact />
    </div>

    {/* Footer Actions */}
    <div style={{ display: 'flex', gap: '8px', borderTop: `1px solid ${colors.border.neutral.subtle}`, paddingTop: '16px' }}>
      <Button variant="primary" onPress={fn()}>Sign & Close</Button>
      <Button variant="secondary" onPress={fn()}>Save Draft</Button>
      <Button variant="ghost" onPress={fn()}>Review</Button>
    </div>
  </div>
);

// ============================================================================
// Storybook Meta
// ============================================================================

const meta: Meta = {
  title: 'Composites/Encounter Chart',
  component: EncounterView,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Full encounter view composing multiple components together, demonstrating how they work in context.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const FullEncounter: Story = {
  name: 'Full Encounter View',
};
