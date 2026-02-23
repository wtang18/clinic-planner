/**
 * Tests for suggestion-helpers utilities.
 *
 * Tests buildItemSummary, getCategoryBadge, suggestionToEditableItem,
 * and buildSuggestionSummary.
 */

import { describe, it, expect } from 'vitest';
import {
  buildItemSummary,
  getCategoryBadge,
  suggestionToEditableItem,
  buildSuggestionSummary,
} from '../../utils/suggestion-helpers';
import type { Suggestion } from '../../types/suggestions';

// ============================================================================
// buildItemSummary
// ============================================================================

describe('buildItemSummary', () => {
  it('formats medication summary', () => {
    const item = {
      id: 'rx1',
      label: 'Amoxicillin',
      chipLabel: 'Amoxicillin',
      category: 'medication' as const,
      data: { dosage: '500mg', route: 'PO', frequency: 'TID', quantity: 21, refills: 0 },
    };
    expect(buildItemSummary(item)).toBe('500mg PO TID #21 0RF');
  });

  it('formats lab summary with non-routine priority', () => {
    const item = {
      id: 'lab1',
      label: 'CBC',
      chipLabel: 'CBC',
      category: 'lab' as const,
      data: { priority: 'stat', collectionType: 'venipuncture', fastingRequired: false },
    };
    expect(buildItemSummary(item)).toBe('STAT \u00B7 venipuncture');
  });

  it('formats allergy summary', () => {
    const item = {
      id: 'a1',
      label: 'Penicillin',
      chipLabel: 'Penicillin',
      category: 'allergy' as const,
      data: { allergenType: 'drug', severity: 'moderate', reaction: 'rash' },
    };
    expect(buildItemSummary(item)).toBe('drug \u00B7 moderate \u00B7 rash');
  });

  it('returns label for unsupported categories', () => {
    const item = {
      id: 'n1',
      label: 'Free text note',
      chipLabel: 'Note',
      category: 'note' as const,
      data: {},
    };
    expect(buildItemSummary(item)).toBe('Free text note');
  });
});

// ============================================================================
// getCategoryBadge
// ============================================================================

describe('getCategoryBadge', () => {
  it('maps medication to Rx', () => {
    expect(getCategoryBadge('medication')).toBe('Rx');
  });

  it('maps lab to Lab', () => {
    expect(getCategoryBadge('lab')).toBe('Lab');
  });

  it('maps diagnosis to Dx', () => {
    expect(getCategoryBadge('diagnosis')).toBe('Dx');
  });

  it('maps hpi to HPI', () => {
    expect(getCategoryBadge('hpi')).toBe('HPI');
  });

  it('maps plan to Plan', () => {
    expect(getCategoryBadge('plan')).toBe('Plan');
  });

  it('maps instruction to Instr', () => {
    expect(getCategoryBadge('instruction')).toBe('Instr');
  });

  it('returns category name for unmapped categories', () => {
    expect(getCategoryBadge('vitals')).toBe('vitals');
  });

  // Intent-aware overrides
  it('maps medication + report intent to Med', () => {
    expect(getCategoryBadge('medication', 'report')).toBe('Med');
  });

  it('maps medication + prescribe intent to Rx', () => {
    expect(getCategoryBadge('medication', 'prescribe')).toBe('Rx');
  });

  it('maps medication with no intent to Rx (backward compat)', () => {
    expect(getCategoryBadge('medication')).toBe('Rx');
  });

  it('maps diagnosis + rule-out intent to R/O', () => {
    expect(getCategoryBadge('diagnosis', 'rule-out')).toBe('R/O');
  });

  it('maps diagnosis + assess intent to Dx', () => {
    expect(getCategoryBadge('diagnosis', 'assess')).toBe('Dx');
  });
});

// ============================================================================
// suggestionToEditableItem
// ============================================================================

describe('suggestionToEditableItem', () => {
  const makeNewItemSuggestion = (overrides?: Partial<Suggestion>): Suggestion => ({
    id: 'sug-1',
    type: 'chart-item',
    status: 'active',
    content: {
      type: 'new-item',
      itemTemplate: {
        category: 'medication',
        data: { drugName: 'Amoxicillin', dosage: '500mg', route: 'PO', frequency: 'TID' },
      } as any,
      category: 'medication',
    },
    source: 'ai-analysis',
    confidence: 0.9,
    createdAt: new Date(),
    displayText: 'Add Amoxicillin 500mg PO TID',
    actionLabel: 'Amoxicillin',
    ...overrides,
  });

  it('converts new-item suggestion to QuickPickItem shape', () => {
    const suggestion = makeNewItemSuggestion();
    const result = suggestionToEditableItem(suggestion);
    expect(result).not.toBeNull();
    expect(result!.id).toBe('suggestion-sug-1');
    expect(result!.label).toBe('Amoxicillin');
    expect(result!.chipLabel).toBe('Amoxicillin');
    expect(result!.category).toBe('medication');
    expect(result!.data.drugName).toBe('Amoxicillin');
  });

  it('uses displayText when actionLabel is missing', () => {
    const suggestion = makeNewItemSuggestion({ actionLabel: undefined });
    const result = suggestionToEditableItem(suggestion);
    expect(result!.label).toBe('Add Amoxicillin 500mg PO TID');
  });

  it('converts care-gap-action suggestion', () => {
    const suggestion: Suggestion = {
      id: 'sug-2',
      type: 'care-gap-action',
      status: 'active',
      content: {
        type: 'care-gap-action',
        careGapId: 'cg-1',
        actionTemplate: {
          category: 'lab',
          data: { testName: 'HbA1c' },
        } as any,
      },
      source: 'care-gap',
      confidence: 0.95,
      createdAt: new Date(),
      displayText: 'Order HbA1c',
    };
    const result = suggestionToEditableItem(suggestion);
    expect(result).not.toBeNull();
    expect(result!.category).toBe('lab');
    expect(result!.data.testName).toBe('HbA1c');
  });

  it('returns null for dx-link suggestions', () => {
    const suggestion: Suggestion = {
      id: 'sug-3',
      type: 'dx-association',
      status: 'active',
      content: {
        type: 'dx-link',
        targetItemId: 'item-1',
        suggestedDx: [],
      },
      source: 'ai-analysis',
      confidence: 0.8,
      createdAt: new Date(),
      displayText: 'Link to diagnosis',
    };
    expect(suggestionToEditableItem(suggestion)).toBeNull();
  });

  it('returns null for correction suggestions', () => {
    const suggestion: Suggestion = {
      id: 'sug-4',
      type: 'correction',
      status: 'active',
      content: {
        type: 'correction',
        targetItemId: 'item-2',
        field: 'dosage',
        currentValue: '100mg',
        suggestedValue: '200mg',
      },
      source: 'ai-analysis',
      confidence: 0.85,
      createdAt: new Date(),
      displayText: 'Fix dosage',
    };
    expect(suggestionToEditableItem(suggestion)).toBeNull();
  });
});

// ============================================================================
// buildSuggestionSummary
// ============================================================================

describe('buildSuggestionSummary', () => {
  it('builds summary from new-item template data', () => {
    const suggestion: Suggestion = {
      id: 'sug-5',
      type: 'chart-item',
      status: 'active',
      content: {
        type: 'new-item',
        itemTemplate: {
          category: 'medication',
          data: { drugName: 'Ibuprofen', dosage: '400mg', route: 'PO', frequency: 'TID PRN' },
        } as any,
        category: 'medication',
      },
      source: 'ai-analysis',
      confidence: 0.9,
      createdAt: new Date(),
      displayText: 'Add Ibuprofen 400mg',
      actionLabel: 'Ibuprofen',
    };
    expect(buildSuggestionSummary(suggestion)).toBe('400mg PO TID PRN');
  });

  it('falls back to displaySubtext for non-editable types', () => {
    const suggestion: Suggestion = {
      id: 'sug-6',
      type: 'dx-association',
      status: 'active',
      content: {
        type: 'dx-link',
        targetItemId: 'item-1',
        suggestedDx: [],
      },
      source: 'ai-analysis',
      confidence: 0.8,
      createdAt: new Date(),
      displayText: 'Link Dx',
      displaySubtext: 'Associate with J06.9',
    };
    expect(buildSuggestionSummary(suggestion)).toBe('Associate with J06.9');
  });
});
