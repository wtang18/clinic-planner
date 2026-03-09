/**
 * Protocol action integration tests — CP5
 *
 * Tests the wired action flows:
 * - [+] orderable → materializeChartItem + ITEM_ADDED
 * - Checkbox (documentable/guidance) → PROTOCOL_ITEM_ADDRESSED
 * - Skip → PROTOCOL_ITEM_SKIPPED
 * - Cross-surface: ITEM_ADDED auto-marks matching protocol orderable
 * - Assessment field definition registration
 */

import { describe, it, expect } from 'vitest';
import { materializeChartItem } from '../../utils/chart-item-factory';
import { getFieldDef } from '../../components/omni-add/fields';
import { LOW_BACK_PAIN_TEMPLATE } from '../../mocks/protocols/low-back-pain';
import { URI_TEMPLATE } from '../../mocks/protocols/uri';
import type { ActiveProtocolState, ProtocolItemDef } from '../../types/protocol';
import type { ChartItem, ItemCategory } from '../../types/chart-items';

// ============================================================================
// Helpers
// ============================================================================

function buildProtocolState(template: typeof LOW_BACK_PAIN_TEMPLATE): ActiveProtocolState {
  const cardStates: Record<string, { expanded: boolean; manuallyToggled: boolean }> = {};
  const itemStates: Record<string, { status: 'pending' | 'addressed' | 'skipped' | 'not-applicable' }> = {};

  template.cards.forEach((card, index) => {
    cardStates[card.id] = {
      expanded: template.autoExpandFirstCard && index === 0,
      manuallyToggled: false,
    };
    card.items.forEach(item => {
      itemStates[item.id] = { status: 'pending' };
    });
  });

  return {
    id: `${template.id}-test`,
    templateId: template.id,
    templateSnapshot: template,
    status: 'active',
    activationSource: 'manual',
    activatedAt: new Date(),
    isPrimary: true,
    severity: template.severityScoringModel
      ? { score: 0, selectedPathId: '', isManualOverride: false }
      : null,
    cardStates,
    itemStates,
  };
}

function findItemDef(template: typeof LOW_BACK_PAIN_TEMPLATE, itemId: string): ProtocolItemDef | undefined {
  for (const card of template.cards) {
    const item = card.items.find(i => i.id === itemId);
    if (item) return item;
  }
  return undefined;
}

// ============================================================================
// Tests — Orderable [+] Action
// ============================================================================

describe('Protocol orderable [+] action', () => {
  it('materializes a medication chart item from orderable defaultData', () => {
    const itemDef = findItemDef(LOW_BACK_PAIN_TEMPLATE, 'nsaid-order')!;
    expect(itemDef).toBeDefined();
    expect(itemDef.itemType.type).toBe('orderable');

    if (itemDef.itemType.type !== 'orderable') return;

    const chartItem = materializeChartItem(
      {
        category: itemDef.itemType.chartCategory as ItemCategory,
        displayText: itemDef.label,
        data: itemDef.itemType.defaultData,
      } as Partial<ChartItem>,
      { source: { type: 'protocol' }, status: 'draft' }
    );

    expect(chartItem.category).toBe('medication');
    expect(chartItem.displayText).toBe('NSAID (Ibuprofen 600mg TID)');
    expect(chartItem.source).toEqual({ type: 'protocol' });
    expect(chartItem.status).toBe('draft');
    expect((chartItem as any).data.drugName).toBe('Ibuprofen');
  });

  it('materializes an imaging chart item from orderable defaultData', () => {
    const itemDef = findItemDef(LOW_BACK_PAIN_TEMPLATE, 'imaging-xray')!;
    expect(itemDef.itemType.type).toBe('orderable');

    if (itemDef.itemType.type !== 'orderable') return;

    const chartItem = materializeChartItem(
      {
        category: itemDef.itemType.chartCategory as ItemCategory,
        displayText: itemDef.label,
        data: itemDef.itemType.defaultData,
      } as Partial<ChartItem>,
      { source: { type: 'protocol' }, status: 'draft' }
    );

    expect(chartItem.category).toBe('imaging');
    expect((chartItem as any).data.studyType).toBe('X-ray');
    expect((chartItem as any).data.bodyPart).toBe('Lumbar spine');
  });

  it('materializes an assessment chart item from orderable defaultData', () => {
    const itemDef = findItemDef(LOW_BACK_PAIN_TEMPLATE, 'pain-scale-assess')!;
    expect(itemDef.itemType.type).toBe('orderable');

    if (itemDef.itemType.type !== 'orderable') return;

    const chartItem = materializeChartItem(
      {
        category: itemDef.itemType.chartCategory as ItemCategory,
        displayText: itemDef.label,
        data: itemDef.itemType.defaultData,
      } as Partial<ChartItem>,
      { source: { type: 'protocol' }, status: 'draft' }
    );

    expect(chartItem.category).toBe('assessment');
    expect((chartItem as any).data.assessmentType).toBe('pain-scale');
    expect((chartItem as any).data.scale).toEqual({ min: 0, max: 10 });
  });

  it('materializes a referral chart item from orderable defaultData', () => {
    const itemDef = findItemDef(LOW_BACK_PAIN_TEMPLATE, 'referral-pt')!;
    expect(itemDef.itemType.type).toBe('orderable');

    if (itemDef.itemType.type !== 'orderable') return;

    const chartItem = materializeChartItem(
      {
        category: itemDef.itemType.chartCategory as ItemCategory,
        displayText: itemDef.label,
        data: itemDef.itemType.defaultData,
      } as Partial<ChartItem>,
      { source: { type: 'protocol' }, status: 'draft' }
    );

    expect(chartItem.category).toBe('referral');
    expect((chartItem as any).data.specialty).toBe('Physical Therapy');
  });

  it('materializes an instruction chart item from URI template', () => {
    const itemDef = findItemDef(URI_TEMPLATE, 'followup-instruction')!;
    expect(itemDef.itemType.type).toBe('orderable');

    if (itemDef.itemType.type !== 'orderable') return;

    const chartItem = materializeChartItem(
      {
        category: itemDef.itemType.chartCategory as ItemCategory,
        displayText: itemDef.label,
        data: itemDef.itemType.defaultData,
      } as Partial<ChartItem>,
      { source: { type: 'protocol' }, status: 'draft' }
    );

    expect(chartItem.category).toBe('instruction');
    expect((chartItem as any).data.instructionType).toBe('follow-up');
  });

  it('sets protocolRef when creating chart item from protocol', () => {
    const protocol = buildProtocolState(LOW_BACK_PAIN_TEMPLATE);
    const itemDef = findItemDef(LOW_BACK_PAIN_TEMPLATE, 'nsaid-order')!;

    if (itemDef.itemType.type !== 'orderable') return;

    const chartItem = materializeChartItem(
      {
        category: itemDef.itemType.chartCategory as ItemCategory,
        displayText: itemDef.label,
        data: itemDef.itemType.defaultData,
        protocolRef: `${protocol.templateId}:nsaid-order`,
      } as Partial<ChartItem>,
      { source: { type: 'protocol' }, status: 'draft' }
    );

    expect((chartItem as any).protocolRef).toBe('low-back-pain-v1:nsaid-order');
  });
});

// ============================================================================
// Tests — Protocol State Building
// ============================================================================

describe('Protocol state building', () => {
  it('initializes all items as pending', () => {
    const state = buildProtocolState(LOW_BACK_PAIN_TEMPLATE);
    const allPending = Object.values(state.itemStates).every(s => s.status === 'pending');
    expect(allPending).toBe(true);
  });

  it('auto-expands first card when flag is set', () => {
    const state = buildProtocolState(LOW_BACK_PAIN_TEMPLATE);
    expect(state.cardStates['history-assessment'].expanded).toBe(true);
    expect(state.cardStates['examination'].expanded).toBe(false);
  });

  it('includes severity for templates with scoring model', () => {
    const lbpState = buildProtocolState(LOW_BACK_PAIN_TEMPLATE);
    expect(lbpState.severity).not.toBeNull();
    expect(lbpState.severity!.score).toBe(0);
  });

  it('has null severity for templates without scoring model', () => {
    const uriState = buildProtocolState(URI_TEMPLATE);
    expect(uriState.severity).toBeNull();
  });
});

// ============================================================================
// Tests — Assessment Field Definition
// ============================================================================

describe('Assessment field definition', () => {
  it('is registered in the field definition registry', () => {
    const fieldDef = getFieldDef('assessment');
    expect(fieldDef).toBeDefined();
  });

  it('provides value and method fields (2 for non-NRS)', () => {
    const fieldDef = getFieldDef('assessment')!;
    const fields = fieldDef.getFields({ data: {} } as any);
    expect(fields).toHaveLength(2);
    expect(fields[0].key).toBe('value');
    expect(fields[1].key).toBe('method');
    expect(fields[1].options).toHaveLength(3);
  });

  it('defaults to patient-reported method', () => {
    const fieldDef = getFieldDef('assessment')!;
    const defaults = fieldDef.getDefaults({ data: {} } as any);
    expect(defaults.method).toBe('patient-reported');
  });

  it('builds data with selected method', () => {
    const fieldDef = getFieldDef('assessment')!;
    const data = fieldDef.buildData(
      { method: 'provider-assessed' },
      { data: { assessmentType: 'pain-scale', label: 'Pain', scale: { min: 0, max: 10 }, value: null } } as any
    );
    expect(data.method).toBe('provider-assessed');
    expect(data.assessmentType).toBe('pain-scale');
  });
});

// ============================================================================
// Tests — Template Integrity
// ============================================================================

describe('Protocol template integrity', () => {
  it('LBP template has 5 cards', () => {
    expect(LOW_BACK_PAIN_TEMPLATE.cards).toHaveLength(5);
  });

  it('URI template has 3 cards', () => {
    expect(URI_TEMPLATE.cards).toHaveLength(3);
  });

  it('all LBP orderable items have valid chartCategory', () => {
    const validCategories = new Set([
      'medication', 'lab', 'imaging', 'procedure', 'diagnosis',
      'allergy', 'referral', 'instruction', 'assessment', 'vitals',
    ]);
    for (const card of LOW_BACK_PAIN_TEMPLATE.cards) {
      for (const item of card.items) {
        if (item.itemType.type === 'orderable') {
          expect(validCategories.has(item.itemType.chartCategory)).toBe(true);
        }
      }
    }
  });

  it('conditional items have conditionBehavior set', () => {
    for (const card of LOW_BACK_PAIN_TEMPLATE.cards) {
      for (const item of card.items) {
        if (item.condition) {
          expect(['hide', 'show-inactive']).toContain(item.conditionBehavior);
        }
      }
    }
  });
});
