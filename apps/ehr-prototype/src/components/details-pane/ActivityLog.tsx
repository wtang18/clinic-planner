/**
 * ActivityLog Component
 *
 * Chronological list of activity log entries for a chart item.
 * Most recent at bottom, formatted as compact clinical timestamps.
 */

import React from 'react';
import type { ActivityLogEntry } from '../../types/chart-items';
import { formatLogTimestamp } from '../../utils/activity-log';
import { colors, spaceAround, spaceBetween, typography } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface ActivityLogProps {
  entries: ActivityLogEntry[];
}

// ============================================================================
// Component
// ============================================================================

export const ActivityLog: React.FC<ActivityLogProps> = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <p style={{
        fontSize: 13,
        color: colors.fg.neutral.disabled,
        fontStyle: 'italic',
        margin: 0,
      }}>
        No activity recorded
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spaceBetween.repeating }}>
      {entries.map((entry, index) => (
        <div
          key={`${entry.action}-${index}`}
          style={{
            display: 'flex',
            gap: spaceBetween.related,
            alignItems: 'flex-start',
          }}
        >
          <span style={{
            fontSize: 12,
            fontFamily: typography.fontFamily.mono,
            color: colors.fg.neutral.spotReadable,
            whiteSpace: 'nowrap',
            minWidth: 52,
            flexShrink: 0,
          }}>
            {formatLogTimestamp(entry.timestamp instanceof Date ? entry.timestamp : new Date(entry.timestamp))}
          </span>
          <span style={{
            fontSize: 13,
            color: colors.fg.neutral.primary,
            lineHeight: '18px',
          }}>
            {formatEntryText(entry)}
          </span>
        </div>
      ))}
    </div>
  );
};

ActivityLog.displayName = 'ActivityLog';

// ============================================================================
// Helpers
// ============================================================================

function formatEntryText(entry: ActivityLogEntry): string {
  const actionLabel = ACTION_LABELS[entry.action] || entry.action;

  if (entry.details) {
    // For "edited" actions with field diffs, show the details directly
    if (entry.action === 'edited') {
      return `${entry.details} by ${entry.actor}`;
    }
    return `${actionLabel} by ${entry.actor} — ${entry.details}`;
  }

  return `${actionLabel} by ${entry.actor}`;
}

const ACTION_LABELS: Record<string, string> = {
  created: 'Created',
  edited: 'Edited',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  sent: 'Sent',
  reviewed: 'Reviewed',
  ai_enriched: 'AI enriched',
  dx_associated: 'Dx associated',
  dx_removed: 'Dx removed',
  result_received: 'Results received',
  updated: 'Updated',
};
