/**
 * Tests for suggestion-validators — data validation and noise word filtering.
 *
 * Tests validateSuggestionData, getPrimaryIdentifier, and
 * STRUCTURED_SUGGESTION_CATEGORIES.
 */

import { describe, it, expect } from 'vitest';
import {
  STRUCTURED_SUGGESTION_CATEGORIES,
  NARRATIVE_SUGGESTION_CATEGORIES,
  EDITABLE_SUGGESTION_CATEGORIES,
  isNarrativeCategory,
  validateSuggestionData,
  getPrimaryIdentifier,
} from '../../services/ai/entity-extraction/suggestion-validators';

// ============================================================================
// STRUCTURED_SUGGESTION_CATEGORIES
// ============================================================================

describe('STRUCTURED_SUGGESTION_CATEGORIES', () => {
  it('contains all 7 structured categories', () => {
    expect(STRUCTURED_SUGGESTION_CATEGORIES.size).toBe(7);
    expect(STRUCTURED_SUGGESTION_CATEGORIES.has('medication')).toBe(true);
    expect(STRUCTURED_SUGGESTION_CATEGORIES.has('diagnosis')).toBe(true);
    expect(STRUCTURED_SUGGESTION_CATEGORIES.has('lab')).toBe(true);
    expect(STRUCTURED_SUGGESTION_CATEGORIES.has('imaging')).toBe(true);
    expect(STRUCTURED_SUGGESTION_CATEGORIES.has('procedure')).toBe(true);
    expect(STRUCTURED_SUGGESTION_CATEGORIES.has('allergy')).toBe(true);
    expect(STRUCTURED_SUGGESTION_CATEGORIES.has('referral')).toBe(true);
  });

  it('excludes unstructured and narrative categories', () => {
    expect(STRUCTURED_SUGGESTION_CATEGORIES.has('hpi' as any)).toBe(false);
    expect(STRUCTURED_SUGGESTION_CATEGORIES.has('vitals' as any)).toBe(false);
    expect(STRUCTURED_SUGGESTION_CATEGORIES.has('physical-exam' as any)).toBe(false);
    expect(STRUCTURED_SUGGESTION_CATEGORIES.has('note' as any)).toBe(false);
  });
});

// ============================================================================
// NARRATIVE_SUGGESTION_CATEGORIES
// ============================================================================

describe('NARRATIVE_SUGGESTION_CATEGORIES', () => {
  it('contains 3 narrative categories', () => {
    expect(NARRATIVE_SUGGESTION_CATEGORIES.size).toBe(3);
    expect(NARRATIVE_SUGGESTION_CATEGORIES.has('hpi')).toBe(true);
    expect(NARRATIVE_SUGGESTION_CATEGORIES.has('plan')).toBe(true);
    expect(NARRATIVE_SUGGESTION_CATEGORIES.has('instruction')).toBe(true);
  });

  it('excludes structured categories', () => {
    expect(NARRATIVE_SUGGESTION_CATEGORIES.has('medication' as any)).toBe(false);
    expect(NARRATIVE_SUGGESTION_CATEGORIES.has('lab' as any)).toBe(false);
  });
});

// ============================================================================
// EDITABLE_SUGGESTION_CATEGORIES
// ============================================================================

describe('EDITABLE_SUGGESTION_CATEGORIES', () => {
  it('contains all structured + narrative categories (10 total)', () => {
    expect(EDITABLE_SUGGESTION_CATEGORIES.size).toBe(10);
    // Structured
    expect(EDITABLE_SUGGESTION_CATEGORIES.has('medication')).toBe(true);
    expect(EDITABLE_SUGGESTION_CATEGORIES.has('diagnosis')).toBe(true);
    expect(EDITABLE_SUGGESTION_CATEGORIES.has('lab')).toBe(true);
    // Narrative
    expect(EDITABLE_SUGGESTION_CATEGORIES.has('hpi')).toBe(true);
    expect(EDITABLE_SUGGESTION_CATEGORIES.has('plan')).toBe(true);
    expect(EDITABLE_SUGGESTION_CATEGORIES.has('instruction')).toBe(true);
  });

  it('excludes non-editable categories', () => {
    expect(EDITABLE_SUGGESTION_CATEGORIES.has('vitals' as any)).toBe(false);
    expect(EDITABLE_SUGGESTION_CATEGORIES.has('note' as any)).toBe(false);
  });
});

// ============================================================================
// isNarrativeCategory
// ============================================================================

describe('isNarrativeCategory', () => {
  it('returns true for narrative categories', () => {
    expect(isNarrativeCategory('hpi')).toBe(true);
    expect(isNarrativeCategory('plan')).toBe(true);
    expect(isNarrativeCategory('instruction')).toBe(true);
  });

  it('returns false for structured categories', () => {
    expect(isNarrativeCategory('medication')).toBe(false);
    expect(isNarrativeCategory('lab')).toBe(false);
  });

  it('returns false for non-editable categories', () => {
    expect(isNarrativeCategory('vitals')).toBe(false);
    expect(isNarrativeCategory('note')).toBe(false);
  });
});

// ============================================================================
// validateSuggestionData
// ============================================================================

describe('validateSuggestionData', () => {
  // --- Medication ---
  it('accepts valid medication', () => {
    expect(validateSuggestionData('medication', { drugName: 'Amoxicillin' })).toBe(true);
  });

  it('rejects noise word as medication', () => {
    expect(validateSuggestionData('medication', { drugName: 'started' })).toBe(false);
  });

  it('rejects noise word case-insensitively', () => {
    expect(validateSuggestionData('medication', { drugName: 'Taking' })).toBe(false);
  });

  it('rejects short medication name', () => {
    expect(validateSuggestionData('medication', { drugName: 'PO' })).toBe(false);
  });

  it('rejects empty medication name', () => {
    expect(validateSuggestionData('medication', { drugName: '' })).toBe(false);
  });

  // --- Diagnosis ---
  it('accepts valid diagnosis', () => {
    expect(validateSuggestionData('diagnosis', { description: 'Type 2 Diabetes' })).toBe(true);
  });

  it('rejects noise word as diagnosis', () => {
    expect(validateSuggestionData('diagnosis', { description: 'had' })).toBe(false);
  });

  it('rejects short diagnosis', () => {
    expect(validateSuggestionData('diagnosis', { description: 'ab' })).toBe(false);
  });

  // --- Lab ---
  it('accepts valid lab test', () => {
    expect(validateSuggestionData('lab', { testName: 'CBC' })).toBe(true);
  });

  it('rejects single char lab test', () => {
    expect(validateSuggestionData('lab', { testName: 'A' })).toBe(false);
  });

  it('rejects noise word as lab test', () => {
    expect(validateSuggestionData('lab', { testName: 'the' })).toBe(false);
  });

  // --- Imaging ---
  it('accepts valid imaging with both fields', () => {
    expect(validateSuggestionData('imaging', { studyType: 'X-ray', bodyPart: 'Chest' })).toBe(true);
  });

  it('rejects imaging with empty studyType', () => {
    expect(validateSuggestionData('imaging', { studyType: '', bodyPart: 'Chest' })).toBe(false);
  });

  it('rejects imaging with empty bodyPart', () => {
    expect(validateSuggestionData('imaging', { studyType: 'X-ray', bodyPart: '' })).toBe(false);
  });

  // --- Procedure ---
  it('accepts valid procedure', () => {
    expect(validateSuggestionData('procedure', { procedureName: 'Biopsy' })).toBe(true);
  });

  it('rejects noise word as procedure', () => {
    expect(validateSuggestionData('procedure', { procedureName: 'given' })).toBe(false);
  });

  // --- Allergy ---
  it('accepts valid allergy', () => {
    expect(validateSuggestionData('allergy', { allergen: 'Penicillin' })).toBe(true);
  });

  it('rejects short allergy allergen', () => {
    expect(validateSuggestionData('allergy', { allergen: 'A' })).toBe(false);
  });

  // --- Referral ---
  it('accepts valid referral', () => {
    expect(validateSuggestionData('referral', { specialty: 'Cardiology' })).toBe(true);
  });

  it('rejects short referral specialty', () => {
    expect(validateSuggestionData('referral', { specialty: 'ab' })).toBe(false);
  });

  // --- Unsupported categories ---
  it('rejects unsupported categories', () => {
    expect(validateSuggestionData('hpi' as any, { text: 'cough' })).toBe(false);
    expect(validateSuggestionData('note' as any, { text: 'note text' })).toBe(false);
  });

  // --- Missing data ---
  it('handles missing data fields gracefully', () => {
    expect(validateSuggestionData('medication', {})).toBe(false);
    expect(validateSuggestionData('imaging', {})).toBe(false);
  });
});

// ============================================================================
// getPrimaryIdentifier
// ============================================================================

describe('getPrimaryIdentifier', () => {
  it('returns drugName for medication', () => {
    expect(getPrimaryIdentifier('medication', { drugName: 'Metformin' })).toBe('Metformin');
  });

  it('returns description for diagnosis', () => {
    expect(getPrimaryIdentifier('diagnosis', { description: 'Hypertension' })).toBe('Hypertension');
  });

  it('returns testName for lab', () => {
    expect(getPrimaryIdentifier('lab', { testName: 'CBC' })).toBe('CBC');
  });

  it('returns studyType + bodyPart for imaging', () => {
    expect(getPrimaryIdentifier('imaging', { studyType: 'MRI', bodyPart: 'Brain' })).toBe('MRI Brain');
  });

  it('returns studyType only when bodyPart missing for imaging', () => {
    expect(getPrimaryIdentifier('imaging', { studyType: 'CT', bodyPart: '' })).toBe('CT');
  });

  it('returns procedureName for procedure', () => {
    expect(getPrimaryIdentifier('procedure', { procedureName: 'Colonoscopy' })).toBe('Colonoscopy');
  });

  it('returns allergen for allergy', () => {
    expect(getPrimaryIdentifier('allergy', { allergen: 'Sulfa' })).toBe('Sulfa');
  });

  it('returns specialty for referral', () => {
    expect(getPrimaryIdentifier('referral', { specialty: 'Neurology' })).toBe('Neurology');
  });

  it('returns null for empty data', () => {
    expect(getPrimaryIdentifier('medication', {})).toBe(null);
    expect(getPrimaryIdentifier('medication', { drugName: '' })).toBe(null);
  });

  it('returns null for unsupported categories', () => {
    expect(getPrimaryIdentifier('hpi' as any, { text: 'cough' })).toBe(null);
  });
});
