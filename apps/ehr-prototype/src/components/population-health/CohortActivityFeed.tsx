/**
 * CohortActivityFeed Component
 *
 * Temporal feed of cohort-level events: patient additions/removals,
 * stage transitions, escalations, configuration changes, and batch actions.
 * Patterned after the patient-level ActivityTab.
 */

import React, { useState } from 'react';
import {
  UserPlus,
  UserMinus,
  ArrowRightLeft,
  AlertTriangle,
  Settings,
  Layers,
  Clock,
} from 'lucide-react';
import { colors, spaceAround, spaceBetween, typography, borderRadius, transitions } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export type CohortEventType =
  | 'patient-added'
  | 'patient-removed'
  | 'stage-transition'
  | 'escalation'
  | 'config-change'
  | 'batch-action';

export interface CohortEvent {
  id: string;
  type: CohortEventType;
  title: string;
  description?: string;
  date: Date;
  patientName?: string;
  pathwayName?: string;
}

export interface CohortActivityFeedProps {
  /** Cohort ID this feed belongs to */
  cohortId: string;
  /** Events to display (falls back to built-in mock data if omitted) */
  events?: CohortEvent[];
  /** Called when an event row is clicked */
  onEventClick?: (eventId: string) => void;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Event Type Icons
// ============================================================================

const EVENT_TYPE_ICONS: Record<CohortEventType, React.ReactNode> = {
  'patient-added': <UserPlus size={14} />,
  'patient-removed': <UserMinus size={14} />,
  'stage-transition': <ArrowRightLeft size={14} />,
  'escalation': <AlertTriangle size={14} />,
  'config-change': <Settings size={14} />,
  'batch-action': <Layers size={14} />,
};

const EVENT_TYPE_COLORS: Record<CohortEventType, string> = {
  'patient-added': colors.fg.positive.primary,
  'patient-removed': colors.fg.neutral.secondary,
  'stage-transition': colors.fg.accent.primary,
  'escalation': colors.fg.attention.primary,
  'config-change': colors.fg.neutral.spotReadable,
  'batch-action': colors.fg.accent.primary,
};

// ============================================================================
// Mock Data
// ============================================================================

const d = (daysAgo: number, hoursAgo = 0) =>
  new Date(Date.now() - daysAgo * 86400000 - hoursAgo * 3600000);

const MOCK_COHORT_EVENTS: CohortEvent[] = [
  {
    id: 'ce-1',
    type: 'escalation',
    title: 'Patient escalated to Endocrine Referral',
    description: 'A1c 9.4% — referral pending',
    date: d(0, 3),
    patientName: 'Robert Martinez',
    pathwayName: 'Diabetes A1c Management',
  },
  {
    id: 'ce-2',
    type: 'stage-transition',
    title: 'Patient moved to "Adjust Medication"',
    description: 'A1c 7.8% — medication titration needed',
    date: d(0, 8),
    patientName: 'James Wilson',
    pathwayName: 'Diabetes A1c Management',
  },
  {
    id: 'ce-3',
    type: 'patient-added',
    title: 'New patient enrolled in cohort',
    description: 'Auto-enrolled via diagnosis criteria (E11.9)',
    date: d(1, 2),
    patientName: 'Linda Johnson',
    pathwayName: 'Diabetes A1c Management',
  },
  {
    id: 'ce-4',
    type: 'batch-action',
    title: '5 lab orders placed',
    description: 'Batch A1c order for overdue patients',
    date: d(2),
    pathwayName: 'Diabetes A1c Management',
  },
  {
    id: 'ce-5',
    type: 'config-change',
    title: 'A1c threshold updated',
    description: 'Escalation threshold changed from 9.5% to 9.0%',
    date: d(3),
    pathwayName: 'Diabetes A1c Management',
  },
  {
    id: 'ce-6',
    type: 'patient-removed',
    title: 'Patient transferred to another provider',
    description: 'Removed from active cohort tracking',
    date: d(5),
    patientName: 'Sarah Adams',
    pathwayName: 'Diabetes A1c Management',
  },
  {
    id: 'ce-7',
    type: 'stage-transition',
    title: 'Patient completed medication reconciliation',
    description: 'All meds reconciled — no discrepancies',
    date: d(5, 4),
    patientName: 'Frank Young',
    pathwayName: 'Post-Discharge Follow-up',
  },
  {
    id: 'ce-8',
    type: 'escalation',
    title: 'Medication discrepancy flagged',
    description: 'Missing beta-blocker from discharge orders',
    date: d(6),
    patientName: 'Paul Robinson',
    pathwayName: 'Post-Discharge Follow-up',
  },
];

// ============================================================================
// Helpers
// ============================================================================

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ============================================================================
// Component
// ============================================================================

export const CohortActivityFeed: React.FC<CohortActivityFeedProps> = ({
  cohortId: _cohortId,
  events = MOCK_COHORT_EVENTS,
  onEventClick,
  style,
  testID = 'cohort-activity-feed',
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div style={{ ...feedStyles.container, ...style }} data-testid={testID}>
      {/* Header */}
      <div style={feedStyles.header}>
        <div style={feedStyles.headerLeft}>
          <Clock size={14} style={{ color: colors.fg.neutral.secondary }} />
          <span style={feedStyles.headerLabel}>All Activity</span>
        </div>
        <span style={feedStyles.filterHint}>Filter &#x25BE;</span>
      </div>

      {/* Event list */}
      <div style={feedStyles.scrollArea}>
        {events.length === 0 ? (
          <div style={feedStyles.emptyState}>
            <span style={feedStyles.emptyText}>No cohort activity to display</span>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              style={{
                ...feedStyles.eventRow,
                backgroundColor: hoveredId === event.id
                  ? colors.bg.neutral.subtle
                  : 'transparent',
              }}
              onClick={() => onEventClick?.(event.id)}
              onMouseEnter={() => setHoveredId(event.id)}
              onMouseLeave={() => setHoveredId(null)}
              role={onEventClick ? 'button' : undefined}
              tabIndex={onEventClick ? 0 : undefined}
            >
              {/* Icon */}
              <span style={{
                display: 'flex',
                color: EVENT_TYPE_COLORS[event.type],
                flexShrink: 0,
                marginTop: 1,
              }}>
                {EVENT_TYPE_ICONS[event.type]}
              </span>

              {/* Content */}
              <div style={feedStyles.eventContent}>
                <div style={feedStyles.eventTitle}>
                  {event.title}
                </div>
                {event.description && (
                  <div style={feedStyles.eventDescription}>{event.description}</div>
                )}
                {(event.patientName || event.pathwayName) && (
                  <div style={feedStyles.eventMeta}>
                    {event.patientName && <span>{event.patientName}</span>}
                    {event.patientName && event.pathwayName && <span>&middot;</span>}
                    {event.pathwayName && <span>{event.pathwayName}</span>}
                  </div>
                )}
              </div>

              {/* Date */}
              <span style={feedStyles.eventDate}>
                {formatRelativeDate(event.date)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

CohortActivityFeed.displayName = 'CohortActivityFeed';

// ============================================================================
// Styles
// ============================================================================

const feedStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
  },
  headerLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
  },
  filterHint: {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    opacity: 0.5,
  },
  scrollArea: {
    flex: 1,
    overflowY: 'auto',
    padding: spaceAround.default,
  },
  eventRow: {
    display: 'flex',
    gap: spaceBetween.related,
    padding: spaceAround.compact,
    borderRadius: borderRadius.sm,
    cursor: 'pointer',
    transition: `background-color ${transitions.fast}`,
  },
  eventContent: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  eventTitle: {
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    fontWeight: 500,
    color: colors.fg.neutral.primary,
  },
  eventDescription: {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  eventMeta: {
    display: 'flex',
    gap: spaceBetween.coupled,
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.spotReadable,
  },
  eventDate: {
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.spotReadable,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spaceAround.spacious,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.spotReadable,
  },
};
