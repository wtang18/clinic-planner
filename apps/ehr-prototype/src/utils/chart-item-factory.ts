import type { ChartItem, ItemSource, ItemStatus } from '../types/chart-items';

export interface MaterializeOptions {
  source?: ItemSource;
  status?: ItemStatus;
  aiGenerated?: boolean;
  requiresReview?: boolean;
  reviewed?: boolean;
  activityDetail?: string;
}

/**
 * Creates a fully-formed ChartItem from a partial, filling in system defaults
 * for id, timestamps, audit metadata, and _meta.
 *
 * This is the single place where ChartItem objects are constructed from partials.
 * The `as ChartItem` cast is required because TypeScript can't narrow a
 * discriminated union from a spread of Partial<ChartItem>, but keeping it in
 * one place (instead of six) eliminates the scattered `as unknown as ChartItem`
 * casts and the type bugs they hid (status: 'active', syncStatus: 'pending').
 */
export function materializeChartItem(
  partial: Partial<ChartItem>,
  options: MaterializeOptions = {},
): ChartItem {
  const now = new Date();
  const {
    source = { type: 'manual' },
    status = 'draft',
    aiGenerated = false,
    requiresReview = false,
    reviewed = true,
    activityDetail = `Added (${partial.category || 'note'})`,
  } = options;

  return {
    id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    category: partial.category || 'note',
    displayText: partial.displayText || '',
    createdAt: now,
    createdBy: { id: 'current-user', name: 'Current User' },
    modifiedAt: now,
    modifiedBy: { id: 'current-user', name: 'Current User' },
    source,
    status,
    tags: [],
    linkedDiagnoses: [],
    linkedEncounters: [],
    activityLog: [
      {
        timestamp: now,
        action: 'created',
        actor: 'Current User',
        details: activityDetail,
      },
    ],
    _meta: {
      syncStatus: 'local',
      aiGenerated,
      requiresReview,
      reviewed,
    },
    ...partial, // category-specific fields (data, displaySubtext, tags, etc.)
  } as ChartItem; // Single cast — discriminated union construction requires it
}
