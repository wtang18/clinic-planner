/**
 * Input Recognizer Tests
 *
 * Tests for prefix detection, auto-categorization, ambiguity grouping,
 * and the main recognize() pipeline.
 */

import { describe, it, expect } from 'vitest';
import {
  detectPrefix,
  autoCategorize,
  groupAmbiguous,
  searchInCategory,
  recognize,
  parseRxNL,
} from '../../services/input-recognizer';

// ============================================================================
// Prefix Detection
// ============================================================================

describe('detectPrefix', () => {
  it('detects "rx:" prefix', () => {
    const result = detectPrefix('rx:benzonatate');
    expect(result).not.toBeNull();
    expect(result!.kind).toBe('prefix');
    expect(result!.category).toBe('medication');
    expect(result!.query).toBe('benzonatate');
  });

  it('detects "lab:" prefix', () => {
    const result = detectPrefix('lab:cbc');
    expect(result!.category).toBe('lab');
    expect(result!.query).toBe('cbc');
  });

  it('detects "dx:" prefix', () => {
    const result = detectPrefix('dx:bronchitis');
    expect(result!.category).toBe('diagnosis');
    expect(result!.query).toBe('bronchitis');
  });

  it('detects prefix with space after colon', () => {
    const result = detectPrefix('rx: ibuprofen');
    expect(result!.category).toBe('medication');
    expect(result!.query).toBe('ibuprofen');
  });

  it('returns null for no prefix', () => {
    expect(detectPrefix('benzonatate')).toBeNull();
  });

  it('is case-insensitive', () => {
    const result = detectPrefix('RX:benzonatate');
    expect(result!.category).toBe('medication');
  });

  it('detects "img:" prefix', () => {
    const result = detectPrefix('img:chest');
    expect(result!.category).toBe('imaging');
  });

  it('detects "ref:" prefix', () => {
    const result = detectPrefix('ref:cardiology');
    expect(result!.category).toBe('referral');
  });

  it('handles empty query after prefix', () => {
    const result = detectPrefix('rx:');
    expect(result!.category).toBe('medication');
    expect(result!.query).toBe('');
  });
});

// ============================================================================
// Auto-Categorization
// ============================================================================

describe('autoCategorize', () => {
  it('auto-categorizes "benzonatate" to medication', () => {
    const result = autoCategorize('benzonatate');
    expect(result).not.toBeNull();
    expect(result!.kind).toBe('auto-category');
    expect(result!.category).toBe('medication');
    expect(result!.items.length).toBeGreaterThanOrEqual(1);
  });

  it('auto-categorizes "ibuprofen" to medication', () => {
    const result = autoCategorize('ibuprofen');
    expect(result!.category).toBe('medication');
    expect(result!.bestMatch).toBeDefined();
    expect(result!.bestMatch!.id).toBe('rx-ibuprofen');
  });

  it('returns null for ambiguous terms', () => {
    // "rapid" matches across lab and procedure categories
    const result = autoCategorize('rapid');
    expect(result).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(autoCategorize('')).toBeNull();
  });

  it('returns null for single character', () => {
    expect(autoCategorize('a')).toBeNull();
  });

  it('returns null for no matches', () => {
    expect(autoCategorize('xyznotadrugname')).toBeNull();
  });

  it('auto-categorizes unique lab term', () => {
    const result = autoCategorize('troponin');
    expect(result).not.toBeNull();
    expect(result!.category).toBe('lab');
  });

  it('provides bestMatch for exact chipLabel match', () => {
    const result = autoCategorize('Benzonatate');
    expect(result!.bestMatch).toBeDefined();
    expect(result!.bestMatch!.chipLabel).toBe('Benzonatate');
  });
});

// ============================================================================
// Ambiguity Grouping
// ============================================================================

describe('groupAmbiguous', () => {
  it('groups "strep" across lab and procedure', () => {
    const result = groupAmbiguous('strep');
    expect(result).not.toBeNull();
    expect(result!.kind).toBe('ambiguous');
    expect(result!.groups.length).toBeGreaterThanOrEqual(2);
    const categories = result!.groups.map(g => g.category);
    expect(categories).toContain('lab');
    expect(categories).toContain('procedure');
  });

  it('returns null for single-category term like "chest"', () => {
    // "chest" only matches imaging items — not ambiguous
    expect(groupAmbiguous('chest')).toBeNull();
  });

  it('groups "culture" across lab and procedure', () => {
    const result = groupAmbiguous('culture');
    expect(result).not.toBeNull();
    expect(result!.groups.length).toBeGreaterThanOrEqual(2);
    const categories = result!.groups.map(g => g.category);
    expect(categories).toContain('lab');
    expect(categories).toContain('procedure');
  });

  it('returns null for single-category results', () => {
    expect(groupAmbiguous('benzonatate')).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(groupAmbiguous('')).toBeNull();
  });

  it('returns null for no matches', () => {
    expect(groupAmbiguous('xyznotadrugname')).toBeNull();
  });

  it('each group has category label', () => {
    const result = groupAmbiguous('strep');
    if (result) {
      for (const group of result.groups) {
        expect(group.label).toBeTruthy();
        expect(group.items.length).toBeGreaterThanOrEqual(1);
      }
    }
  });
});

// ============================================================================
// Scoped Search
// ============================================================================

describe('searchInCategory', () => {
  it('finds medications within category', () => {
    const results = searchInCategory('medication', 'benz');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].category).toBe('medication');
  });

  it('finds labs within category', () => {
    const results = searchInCategory('lab', 'cbc');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('lab-cbc');
  });

  it('returns empty for no matches', () => {
    const results = searchInCategory('medication', 'xyznotadrugname');
    expect(results).toHaveLength(0);
  });

  it('returns empty for empty query', () => {
    const results = searchInCategory('medication', '');
    expect(results).toHaveLength(0);
  });
});

// ============================================================================
// Main Recognition Pipeline
// ============================================================================

describe('recognize', () => {
  it('prioritizes prefix over auto-categorization', () => {
    const result = recognize('rx:ibuprofen');
    expect(result.kind).toBe('prefix');
  });

  it('falls back to auto-categorization for unambiguous terms', () => {
    const result = recognize('benzonatate');
    expect(result.kind).toBe('auto-category');
  });

  it('falls back to ambiguity grouping for multi-category terms', () => {
    const result = recognize('rapid');
    expect(result.kind).toBe('ambiguous');
  });

  it('returns none for empty input', () => {
    const result = recognize('');
    expect(result.kind).toBe('none');
  });

  it('returns none for whitespace-only input', () => {
    const result = recognize('   ');
    expect(result.kind).toBe('none');
  });

  it('returns none for unrecognized terms', () => {
    const result = recognize('xyznotadrugname');
    expect(result.kind).toBe('none');
  });
});

// ============================================================================
// NL Parameter Parsing (Rx)
// ============================================================================

describe('parseRxNL', () => {
  it('parses full Rx string: drug + dosage + route + frequency', () => {
    const result = parseRxNL('benzonatate 100mg po tid prn');
    expect(result).not.toBeNull();
    expect(result!.drugName).toBe('benzonatate');
    expect(result!.dosage).toBe('100mg');
    expect(result!.route).toBe('PO');
    expect(result!.frequency).toBe('TID PRN');
  });

  it('parses drug + dosage only', () => {
    const result = parseRxNL('amoxicillin 500mg');
    expect(result).not.toBeNull();
    expect(result!.drugName).toBe('amoxicillin');
    expect(result!.dosage).toBe('500mg');
    expect(result!.route).toBeUndefined();
    expect(result!.frequency).toBeUndefined();
  });

  it('parses drug + dosage + route', () => {
    const result = parseRxNL('ibuprofen 400mg po');
    expect(result!.drugName).toBe('ibuprofen');
    expect(result!.dosage).toBe('400mg');
    expect(result!.route).toBe('PO');
  });

  it('parses drug + dosage + frequency (no route)', () => {
    const result = parseRxNL('metoprolol 25mg bid');
    expect(result!.drugName).toBe('metoprolol');
    expect(result!.dosage).toBe('25mg');
    expect(result!.frequency).toBe('BID');
  });

  it('parses drug name only', () => {
    const result = parseRxNL('benzonatate');
    expect(result).not.toBeNull();
    expect(result!.drugName).toBe('benzonatate');
    expect(result!.dosage).toBeUndefined();
    expect(result!.route).toBeUndefined();
    expect(result!.frequency).toBeUndefined();
  });

  it('handles IM route', () => {
    const result = parseRxNL('ceftriaxone 250mg im');
    expect(result!.route).toBe('IM');
  });

  it('handles daily frequency', () => {
    const result = parseRxNL('metformin 500mg po daily');
    expect(result!.frequency).toBe('daily');
  });

  it('handles QHS frequency', () => {
    const result = parseRxNL('melatonin 3mg po qhs');
    expect(result!.frequency).toBe('QHS');
  });

  it('handles multi-word drug names', () => {
    const result = parseRxNL('albuterol sulfate 90mcg inh');
    expect(result!.drugName).toBe('albuterol sulfate');
    expect(result!.dosage).toBe('90mcg');
  });

  it('returns null for empty input', () => {
    expect(parseRxNL('')).toBeNull();
  });

  it('returns null for whitespace only', () => {
    expect(parseRxNL('   ')).toBeNull();
  });

  it('is case-insensitive for route and frequency', () => {
    const result = parseRxNL('amoxicillin 500mg PO BID');
    expect(result!.route).toBe('PO');
    expect(result!.frequency).toBe('BID');
  });

  it('handles Q4-6H PRN frequency', () => {
    const result = parseRxNL('codeine 10mg po q4-6h prn');
    expect(result!.frequency).toBe('Q4-6H PRN');
  });
});
