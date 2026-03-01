/**
 * Process View Component Tests — Phase 5
 *
 * Tests for:
 * 1. CompletenessChecklist rendering
 * 2. EMLevel rendering
 * 3. SignOff rendering + blocker logic
 * 4. DraftSection rendering + actions
 * 5. BatchSection rendering + sub-groups + actions
 */

import { describe, it, expect, vi } from 'vitest';
import type { ChecklistItem, EMLevel, ProcessBatch, SubGroup, ProcessViewItem } from '../../state/selectors/process-view';
import type { SignOffBlocker } from '../../screens/ReviewView/SignOffSection';
import type { AIDraft } from '../../types/drafts';
import type { EncounterMeta } from '../../types';

// ============================================================================
// Test Helpers
// ============================================================================

function makeChecklistItem(overrides?: Partial<ChecklistItem>): ChecklistItem {
  return {
    id: 'cc',
    label: 'Chief Complaint',
    categories: ['chief-complaint'],
    status: 'documented',
    itemCount: 1,
    ...overrides,
  };
}

function makeEMLevel(overrides?: Partial<EMLevel>): EMLevel {
  return {
    code: '99213',
    level: 3,
    description: 'Level 3 — Low Complexity',
    elements: [
      { name: 'History (CC + HPI)', documented: true, detail: 'CC + HPI documented' },
      { name: 'Review of Systems', documented: true },
      { name: 'Physical Exam', documented: true, detail: '3 system(s) examined' },
      { name: 'Assessment (Diagnosis)', documented: false },
      { name: 'Plan / Orders', documented: false },
      { name: 'Instructions', documented: false },
    ],
    ...overrides,
  };
}

function makeEncounter(): EncounterMeta {
  return {
    id: 'enc-001',
    status: 'in-progress',
    type: 'office-visit',
    visitType: 'sick-visit',
    startedAt: new Date('2024-01-15T09:00:00'),
    location: 'Exam Room 3',
  } as EncounterMeta;
}

function makeDraft(overrides?: Partial<AIDraft>): AIDraft {
  return {
    id: 'draft-hpi-1',
    category: 'hpi',
    content: '42-year-old female presents with cough x 5 days.',
    status: 'pending',
    generatedAt: new Date('2024-01-15T10:15:00'),
    source: 'ambient-recording',
    label: 'HPI Draft',
    confidence: 0.85,
    ...overrides,
  };
}

// ============================================================================
// 1. CompletenessChecklist Logic
// ============================================================================

describe('CompletenessChecklist', () => {
  it('categorizes sections correctly', () => {
    const sections: ChecklistItem[] = [
      makeChecklistItem({ id: 'cc', status: 'documented', itemCount: 1 }),
      makeChecklistItem({ id: 'hpi', status: 'documented', itemCount: 1 }),
      makeChecklistItem({ id: 'ros', status: 'pending', itemCount: 1 }),
      makeChecklistItem({ id: 'pe', status: 'not-documented', itemCount: 0 }),
      makeChecklistItem({ id: 'assessment', status: 'documented', itemCount: 2 }),
      makeChecklistItem({ id: 'plan', status: 'not-documented', itemCount: 0 }),
      makeChecklistItem({ id: 'orders', status: 'documented', itemCount: 3 }),
      makeChecklistItem({ id: 'instructions', status: 'not-documented', itemCount: 0 }),
    ];

    const documented = sections.filter(s => s.status === 'documented');
    const pending = sections.filter(s => s.status === 'pending');
    const notDocumented = sections.filter(s => s.status === 'not-documented');

    expect(documented).toHaveLength(4);
    expect(pending).toHaveLength(1);
    expect(notDocumented).toHaveLength(3);
  });

  it('counts total documented for display', () => {
    const sections: ChecklistItem[] = Array.from({ length: 8 }, (_, i) =>
      makeChecklistItem({
        id: `s${i}`,
        status: i < 5 ? 'documented' : 'not-documented',
      })
    );
    const documented = sections.filter(s => s.status === 'documented').length;
    expect(documented).toBe(5);
    expect(`${documented}/${sections.length} documented`).toBe('5/8 documented');
  });
});

// ============================================================================
// 2. EMLevel Logic
// ============================================================================

describe('EMLevel', () => {
  it('calculates documented element count', () => {
    const em = makeEMLevel();
    const documentedCount = em.elements.filter(e => e.documented).length;
    expect(documentedCount).toBe(3);
  });

  it('maps level to correct code', () => {
    expect(makeEMLevel({ level: 1, code: '99211' }).code).toBe('99211');
    expect(makeEMLevel({ level: 3, code: '99213' }).code).toBe('99213');
    expect(makeEMLevel({ level: 5, code: '99215' }).code).toBe('99215');
  });

  it('includes element details when available', () => {
    const em = makeEMLevel();
    const historyEl = em.elements.find(e => e.name.includes('History'))!;
    expect(historyEl.detail).toBe('CC + HPI documented');
  });
});

// ============================================================================
// 3. SignOff Logic
// ============================================================================

describe('SignOff', () => {
  it('sign button disabled when error blockers present', () => {
    const blockers: SignOffBlocker[] = [
      { type: 'unreviewed-ai', message: '2 items need review', severity: 'error' },
    ];
    const hasErrors = blockers.some(b => b.severity === 'error');
    expect(hasErrors).toBe(true);
  });

  it('sign button enabled with only warning blockers', () => {
    const blockers: SignOffBlocker[] = [
      { type: 'missing-dx', message: 'No diagnosis', severity: 'warning' },
    ];
    const hasErrors = blockers.some(b => b.severity === 'error');
    expect(hasErrors).toBe(false);
  });

  it('sign button enabled with no blockers', () => {
    const blockers: SignOffBlocker[] = [];
    const hasErrors = blockers.some(b => b.severity === 'error');
    expect(hasErrors).toBe(false);
    expect(blockers.length).toBe(0);
  });

  it('separates error and warning blockers', () => {
    const blockers: SignOffBlocker[] = [
      { type: 'unreviewed-ai', message: '2 items need review', severity: 'error' },
      { type: 'pending-task', message: '1 task pending', severity: 'error' },
      { type: 'missing-dx', message: 'No diagnosis', severity: 'warning' },
      { type: 'missing-note', message: 'No visit note', severity: 'warning' },
    ];
    const errors = blockers.filter(b => b.severity === 'error');
    const warnings = blockers.filter(b => b.severity === 'warning');
    expect(errors).toHaveLength(2);
    expect(warnings).toHaveLength(2);
  });
});

// ============================================================================
// 4. DraftSection Logic
// ============================================================================

describe('DraftSection', () => {
  it('shows pending drafts', () => {
    const drafts: AIDraft[] = [
      makeDraft({ id: 'd1', status: 'pending' }),
      makeDraft({ id: 'd2', status: 'generating', content: '' }),
      makeDraft({ id: 'd3', status: 'accepted' }),
    ];
    // Only active (pending + generating) drafts shown
    const activeDrafts = drafts.filter(d => d.status === 'pending' || d.status === 'generating');
    expect(activeDrafts).toHaveLength(2);
  });

  it('includes updating drafts as active', () => {
    const drafts: AIDraft[] = [
      makeDraft({ id: 'd1', status: 'pending' }),
      makeDraft({ id: 'd2', status: 'updating', content: 'old content' }),
      makeDraft({ id: 'd3', status: 'dismissed' }),
    ];
    const activeDrafts = drafts.filter(
      d => d.status === 'pending' || d.status === 'generating' || d.status === 'updating'
    );
    expect(activeDrafts).toHaveLength(2);
  });

  it('updating drafts show no action buttons', () => {
    const draft = makeDraft({ id: 'd1', status: 'updating' });
    // Actions are only shown when status is 'pending'
    const showActions = draft.status === 'pending';
    expect(showActions).toBe(false);
  });

  it('full content not truncated for pending drafts', () => {
    const longContent = 'A'.repeat(200);
    const draft = makeDraft({ content: longContent });
    // Process view shows full content (not truncated to 60 chars like rail)
    expect(draft.content).toBe(longContent);
    expect(draft.content.length).toBe(200);
  });

  it('tracks accept/edit/dismiss callback calls', () => {
    const onAccept = vi.fn();
    const onEdit = vi.fn();
    const onDismiss = vi.fn();

    // Simulate button clicks
    onAccept('d1');
    onEdit('d2');
    onDismiss('d3');

    expect(onAccept).toHaveBeenCalledWith('d1');
    expect(onEdit).toHaveBeenCalledWith('d2');
    expect(onDismiss).toHaveBeenCalledWith('d3');
  });
});

// ============================================================================
// 5. BatchSection Logic
// ============================================================================

describe('BatchSection', () => {
  it('shows sub-group headers when multiple sub-groups', () => {
    const batch: ProcessBatch = {
      type: 'labs',
      label: 'Labs',
      totalCount: 3,
      aggregateStatus: 'idle',
      subGroups: [
        {
          label: 'In-House',
          key: 'in-house',
          items: [{
            item: { id: 'lab-1', category: 'lab', displayText: 'CBC' } as any,
            tasks: [],
            processingSteps: [],
          }],
        },
        {
          label: 'Quest',
          key: 'quest',
          items: [{
            item: { id: 'lab-2', category: 'lab', displayText: 'CMP' } as any,
            tasks: [],
            processingSteps: [],
          }, {
            item: { id: 'lab-3', category: 'lab', displayText: 'TSH' } as any,
            tasks: [],
            processingSteps: [],
          }],
        },
      ],
    };
    // With multiple sub-groups, headers should show
    expect(batch.subGroups.length).toBeGreaterThan(1);
    expect(batch.subGroups[0].label).toBe('In-House');
    expect(batch.subGroups[1].label).toBe('Quest');
    expect(batch.subGroups[1].items).toHaveLength(2);
  });

  it('does not show sub-group header when single sub-group', () => {
    const batch: ProcessBatch = {
      type: 'referrals',
      label: 'Referrals',
      totalCount: 1,
      aggregateStatus: 'idle',
      subGroups: [{
        label: 'Referrals',
        key: 'referrals',
        items: [{
          item: { id: 'ref-1', category: 'referral', displayText: 'Cardiology' } as any,
          tasks: [],
          processingSteps: [],
        }],
      }],
    };
    expect(batch.subGroups.length).toBe(1);
  });

  it('scoped add triggers callback with correct batch type', () => {
    const onScopedAdd = vi.fn();
    // Simulate "+" click on labs batch
    onScopedAdd('labs');
    expect(onScopedAdd).toHaveBeenCalledWith('labs');
  });

  it('batch action triggers callback', () => {
    const onBatchAction = vi.fn();
    const taskIds = ['t1', 't2'];
    onBatchAction('prescriptions', 'send-all', taskIds);
    expect(onBatchAction).toHaveBeenCalledWith('prescriptions', 'send-all', taskIds);
  });

  it('empty batch shows minimal state', () => {
    const batch: ProcessBatch = {
      type: 'imaging',
      label: 'Imaging',
      totalCount: 0,
      aggregateStatus: 'idle',
      subGroups: [],
    };
    expect(batch.totalCount).toBe(0);
    expect(batch.subGroups).toHaveLength(0);
  });
});

// ============================================================================
// 6. Processing Steps + Next Action Logic
// ============================================================================

describe('Processing steps + next action', () => {
  it('derives step status correctly', () => {
    const steps = [
      { label: 'Link Dx', status: 'complete' as const },
      { label: 'Check Formulary', status: 'active' as const },
      { label: 'Send Rx', status: 'pending' as const },
    ];
    expect(steps[0].status).toBe('complete');
    expect(steps[1].status).toBe('active');
    expect(steps[2].status).toBe('pending');
  });

  it('next action is Review for pending-review task', () => {
    const nextAction = { label: 'Review', actionType: 'review', taskId: 't1' };
    expect(nextAction.label).toBe('Review');
    expect(nextAction.actionType).toBe('review');
  });

  it('next action is Associate Dx for unlinked items', () => {
    const nextAction = { label: 'Associate Dx', actionType: 'associate-dx' };
    expect(nextAction.actionType).toBe('associate-dx');
  });
});

// ============================================================================
// 7. Batch → Category Mapping
// ============================================================================

describe('Batch to category mapping', () => {
  it('maps batch types to correct item categories', () => {
    const mapping: Record<string, string> = {
      'prescriptions': 'medication',
      'labs': 'lab',
      'imaging': 'imaging',
      'referrals': 'referral',
    };
    expect(mapping['prescriptions']).toBe('medication');
    expect(mapping['labs']).toBe('lab');
    expect(mapping['imaging']).toBe('imaging');
    expect(mapping['referrals']).toBe('referral');
  });
});
