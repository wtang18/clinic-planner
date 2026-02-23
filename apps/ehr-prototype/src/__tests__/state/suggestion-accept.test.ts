/**
 * Tests for suggestion generator data structures.
 *
 * Verifies that generateNewItemSuggestion and generateCareGapActionSuggestion
 * produce proper Partial<ChartItem> structure with category, displayText,
 * and data wrapper — the fix for blank note materialization.
 */

import { describe, it, expect } from 'vitest';
import {
  generateNewItemSuggestion,
  generateCareGapActionSuggestion,
} from '../../mocks/generators/suggestions';
import {
  suggestionToEditableItem,
  buildSuggestionSummary,
} from '../../utils/suggestion-helpers';

// ============================================================================
// generateNewItemSuggestion — proper ChartItem structure
// ============================================================================

describe('generateNewItemSuggestion', () => {
  it('wraps data into itemTemplate with category, displayText, and data object', () => {
    const suggestion = generateNewItemSuggestion(
      'medication',
      { drugName: 'Amoxicillin', dosage: '500mg' },
      'Amoxicillin 500mg',
    );

    expect(suggestion.content.type).toBe('new-item');
    if (suggestion.content.type !== 'new-item') return;

    const template = suggestion.content.itemTemplate;
    expect(template.category).toBe('medication');
    expect(template.displayText).toBe('Amoxicillin 500mg');
    expect(template.data).toEqual({ drugName: 'Amoxicillin', dosage: '500mg' });
  });

  it('sets content.category to match', () => {
    const suggestion = generateNewItemSuggestion('lab', { testName: 'CBC' }, 'CBC');

    if (suggestion.content.type !== 'new-item') return;
    expect(suggestion.content.category).toBe('lab');
    expect(suggestion.content.itemTemplate.category).toBe('lab');
  });

  it('includes _meta with aiGenerated and reviewed fields', () => {
    const suggestion = generateNewItemSuggestion(
      'diagnosis',
      { icdCode: 'J20.9' },
      'Acute bronchitis',
      { confidence: 0.9 },
    );

    if (suggestion.content.type !== 'new-item') return;
    const meta = (suggestion.content.itemTemplate as any)._meta;
    expect(meta).toBeDefined();
    expect(meta.aiGenerated).toBe(true);
    expect(meta.reviewed).toBe(false);
    expect(meta.aiConfidence).toBe(0.9);
    expect(meta.syncStatus).toBe('local');
  });

  it('sets actionLabel to displayText', () => {
    const suggestion = generateNewItemSuggestion('lab', { testName: 'CMP' }, 'CMP');
    expect(suggestion.actionLabel).toBe('CMP');
  });
});

// ============================================================================
// generateCareGapActionSuggestion — proper ChartItem structure
// ============================================================================

describe('generateCareGapActionSuggestion', () => {
  it('wraps data into actionTemplate with category and data object', () => {
    const suggestion = generateCareGapActionSuggestion(
      'gap-1',
      'lab',
      { testName: 'HbA1c', testCode: '4548-4' },
      'Order A1C',
    );

    expect(suggestion.content.type).toBe('care-gap-action');
    if (suggestion.content.type !== 'care-gap-action') return;

    const template = suggestion.content.actionTemplate;
    expect(template.category).toBe('lab');
    expect(template.displayText).toBe('Order A1C');
    expect(template.data).toEqual({ testName: 'HbA1c', testCode: '4548-4' });
  });

  it('preserves careGapId', () => {
    const suggestion = generateCareGapActionSuggestion(
      'gap-eye-001',
      'referral',
      { specialty: 'Ophthalmology' },
      'Refer for eye exam',
    );

    if (suggestion.content.type !== 'care-gap-action') return;
    expect(suggestion.content.careGapId).toBe('gap-eye-001');
  });

  it('sets actionLabel to displayText', () => {
    const suggestion = generateCareGapActionSuggestion(
      'gap-1',
      'lab',
      { testName: 'A1C' },
      'Order A1C',
    );
    expect(suggestion.actionLabel).toBe('Order A1C');
  });
});

// ============================================================================
// suggestionToEditableItem with generated suggestions
// ============================================================================

describe('suggestionToEditableItem with generated suggestions', () => {
  it('extracts correct data shape from generated new-item suggestion', () => {
    const suggestion = generateNewItemSuggestion(
      'medication',
      { drugName: 'Metformin', dosage: '1000mg', frequency: 'BID' },
      'Metformin 1000mg BID',
    );

    const item = suggestionToEditableItem(suggestion);
    expect(item).not.toBeNull();
    expect(item!.category).toBe('medication');
    expect(item!.data.drugName).toBe('Metformin');
    expect(item!.data.dosage).toBe('1000mg');
  });

  it('extracts correct data shape from generated care-gap suggestion', () => {
    const suggestion = generateCareGapActionSuggestion(
      'gap-1',
      'lab',
      { testName: 'Lipid Panel' },
      'Lipid Panel',
    );

    const item = suggestionToEditableItem(suggestion);
    expect(item).not.toBeNull();
    expect(item!.category).toBe('lab');
    expect(item!.data.testName).toBe('Lipid Panel');
  });
});

// ============================================================================
// buildSuggestionSummary — narrative content preview
// ============================================================================

describe('buildSuggestionSummary for narrative suggestions', () => {
  it('returns truncated text preview for HPI suggestion', () => {
    const suggestion = generateNewItemSuggestion(
      'hpi',
      {
        text: 'Patient is a 45-year-old male presenting with productive cough x5 days. Cough is worse at night.',
        format: 'plain',
      },
      'HPI Draft',
    );

    const summary = buildSuggestionSummary(suggestion);
    expect(summary).toContain('Patient is a 45-year-old');
    expect(summary.endsWith('...')).toBe(true);
    expect(summary.length).toBeLessThanOrEqual(63); // 60 + "..."
  });

  it('returns full text when under 60 chars', () => {
    const suggestion = generateNewItemSuggestion(
      'plan',
      { text: 'Short plan text', format: 'plain' },
      'Plan Draft',
    );

    expect(buildSuggestionSummary(suggestion)).toBe('Short plan text');
  });

  it('falls back to item summary for non-narrative categories', () => {
    const suggestion = generateNewItemSuggestion(
      'medication',
      { drugName: 'Ibuprofen', dosage: '400mg', route: 'PO', frequency: 'TID' },
      'Ibuprofen 400mg',
    );

    // Should use buildItemSummary which formats med data
    expect(buildSuggestionSummary(suggestion)).toBe('400mg PO TID');
  });
});

// ============================================================================
// Intent round-trip on generated suggestions
// ============================================================================

describe('Intent on generated suggestions', () => {
  it('Mucinex suggestion carries intent: report', () => {
    const suggestion = generateNewItemSuggestion(
      'medication',
      { drugName: 'Mucinex', dosage: '600mg', reportedBy: 'patient' },
      'Mucinex 600mg (reported)',
      { intent: 'report' },
    );

    if (suggestion.content.type !== 'new-item') return;
    expect((suggestion.content.itemTemplate as any).intent).toBe('report');
  });

  it('Benzonatate suggestion carries intent: prescribe', () => {
    const suggestion = generateNewItemSuggestion(
      'medication',
      { drugName: 'Benzonatate', dosage: '100mg' },
      'Benzonatate 100mg TID',
      { intent: 'prescribe' },
    );

    if (suggestion.content.type !== 'new-item') return;
    expect((suggestion.content.itemTemplate as any).intent).toBe('prescribe');
  });

  it('suggestion without intent option has no intent field on template', () => {
    const suggestion = generateNewItemSuggestion(
      'lab',
      { testName: 'CBC' },
      'CBC',
    );

    if (suggestion.content.type !== 'new-item') return;
    expect((suggestion.content.itemTemplate as any).intent).toBeUndefined();
  });
});
