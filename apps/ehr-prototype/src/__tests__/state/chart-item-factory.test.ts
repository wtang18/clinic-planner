/**
 * Chart Item Factory Tests
 *
 * Tests for materializeChartItem() — the single factory function
 * that constructs ChartItem objects from partials with correct defaults.
 */

import { describe, it, expect } from 'vitest';
import { materializeChartItem } from '../../utils/chart-item-factory';
import type { ChartItem } from '../../types/chart-items';

describe('materializeChartItem', () => {
  it('fills id, timestamps, and audit fields', () => {
    const item = materializeChartItem({ category: 'note', displayText: 'Test' });

    expect(item.id).toMatch(/^item-\d+-[a-z0-9]+$/);
    expect(item.createdAt).toBeInstanceOf(Date);
    expect(item.modifiedAt).toBeInstanceOf(Date);
    expect(item.createdBy).toEqual({ id: 'current-user', name: 'Current User' });
    expect(item.modifiedBy).toEqual({ id: 'current-user', name: 'Current User' });
    expect(item.activityLog).toHaveLength(1);
    expect(item.activityLog[0].action).toBe('created');
  });

  it('defaults status to draft', () => {
    const item = materializeChartItem({ category: 'note' });
    expect(item.status).toBe('draft');
  });

  it('defaults syncStatus to local', () => {
    const item = materializeChartItem({ category: 'note' });
    expect(item._meta.syncStatus).toBe('local');
  });

  it('defaults aiGenerated to false', () => {
    const item = materializeChartItem({ category: 'note' });
    expect(item._meta.aiGenerated).toBe(false);
    expect(item._meta.requiresReview).toBe(false);
    expect(item._meta.reviewed).toBe(true);
  });

  it('respects status override', () => {
    const item = materializeChartItem(
      { category: 'medication' },
      { status: 'confirmed' },
    );
    expect(item.status).toBe('confirmed');
  });

  it('respects aiGenerated and review overrides', () => {
    const item = materializeChartItem(
      { category: 'lab' },
      { aiGenerated: true, requiresReview: true, reviewed: false },
    );
    expect(item._meta.aiGenerated).toBe(true);
    expect(item._meta.requiresReview).toBe(true);
    expect(item._meta.reviewed).toBe(false);
  });

  it('partial spread wins over defaults', () => {
    const item = materializeChartItem({
      category: 'diagnosis',
      displayText: 'Hypertension',
      tags: [{ label: 'New', type: 'status' }],
    });
    expect(item.tags).toEqual([{ label: 'New', type: 'status' }]);
    expect(item.displayText).toBe('Hypertension');
  });

  it('preserves category and data from partial', () => {
    const narrativeData = { text: 'Patient presents with headache', format: 'plain' as const };
    const item = materializeChartItem({
      category: 'hpi',
      displayText: 'HPI note',
      data: narrativeData,
    });

    expect(item.category).toBe('hpi');
    expect((item as { data: unknown }).data).toEqual(narrativeData);
  });

  it('uses fallback category note when none provided', () => {
    const item = materializeChartItem({});
    expect(item.category).toBe('note');
  });

  it('uses custom source from options', () => {
    const item = materializeChartItem(
      { category: 'lab' },
      { source: { type: 'aiDraft', draftId: 'draft-1' } },
    );
    expect(item.source).toEqual({ type: 'aiDraft', draftId: 'draft-1' });
  });

  it('uses custom activityDetail', () => {
    const item = materializeChartItem(
      { category: 'medication' },
      { activityDetail: 'Accepted AI draft (medication)' },
    );
    expect(item.activityLog[0].details).toBe('Accepted AI draft (medication)');
  });
});
