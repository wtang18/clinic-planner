/**
 * ActivityTab Component
 *
 * Timeline view of patient activity (visits, results, messages, etc.)
 * Placeholder implementation - will be expanded in Phase 6.
 */

import React from 'react';
import { Clock } from 'lucide-react';
import { colors, spaceBetween, spaceAround, borderRadius, typography } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface TimelineEvent {
  id: string;
  type: 'visit' | 'result' | 'message' | 'prescription' | 'document' | 'note';
  title: string;
  description?: string;
  date: Date;
  status?: 'completed' | 'in_progress' | 'pending';
}

export interface ActivityTabProps {
  /** Timeline events (placeholder - will be expanded) */
  events?: TimelineEvent[];
  /** Called when an event is clicked */
  onEventClick?: (eventId: string) => void;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Mock Data (temporary - will move to scenarios)
// ============================================================================

const MOCK_EVENTS: TimelineEvent[] = [
  {
    id: '1',
    type: 'visit',
    title: 'Office Visit',
    description: 'Diabetes follow-up',
    date: new Date(),
    status: 'in_progress',
  },
  {
    id: '2',
    type: 'result',
    title: 'Lab Results Received',
    description: 'Comprehensive Metabolic Panel',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    status: 'completed',
  },
  {
    id: '3',
    type: 'message',
    title: 'Message from Dr. Chen',
    description: 'Re: Referral follow-up',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    status: 'completed',
  },
  {
    id: '4',
    type: 'prescription',
    title: 'Prescription Refill',
    description: 'Metformin 500mg',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    status: 'completed',
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getEventIcon(type: TimelineEvent['type']): string {
  const icons: Record<TimelineEvent['type'], string> = {
    visit: '🏥',
    result: '🔬',
    message: '💬',
    prescription: '💊',
    document: '📄',
    note: '📝',
  };
  return icons[type];
}

// ============================================================================
// Component
// ============================================================================

export const ActivityTab: React.FC<ActivityTabProps> = ({
  events = MOCK_EVENTS,
  onEventClick,
  style,
  testID,
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
  };

  const filterPlaceholderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    fontSize: 12,
    color: colors.fg.neutral.secondary,
  };

  const listStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: spaceAround.default,
  };

  const eventItemStyle: React.CSSProperties = {
    display: 'flex',
    gap: spaceBetween.related,
    padding: spaceAround.compact,
    borderRadius: borderRadius.sm,
    cursor: 'pointer',
    transition: 'background-color 150ms ease',
  };

  const eventIconStyle: React.CSSProperties = {
    fontSize: 18,
    lineHeight: 1,
    flexShrink: 0,
  };

  const eventContentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const eventTitleStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 500,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
    marginBottom: 2,
  };

  const eventDescStyle: React.CSSProperties = {
    fontSize: 12,
    color: colors.fg.neutral.secondary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const eventDateStyle: React.CSSProperties = {
    fontSize: 11,
    color: colors.fg.neutral.spotReadable,
    flexShrink: 0,
  };

  const statusBadgeStyle = (status: TimelineEvent['status']): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 6px',
    borderRadius: borderRadius.xs,
    fontSize: 10,
    fontWeight: 500,
    backgroundColor:
      status === 'in_progress'
        ? colors.bg.accent.subtle
        : status === 'pending'
        ? colors.bg.attention.subtle
        : 'transparent',
    color:
      status === 'in_progress'
        ? colors.fg.accent.primary
        : status === 'pending'
        ? colors.fg.attention.primary
        : colors.fg.neutral.secondary,
  });

  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  return (
    <div style={containerStyle} data-testid={testID}>
      {/* Filter controls placeholder */}
      <div style={headerStyle}>
        <div style={filterPlaceholderStyle}>
          <Clock size={14} />
          <span>All Activity</span>
        </div>
        <div style={filterPlaceholderStyle}>
          <span style={{ opacity: 0.5 }}>Filter ▾</span>
        </div>
      </div>

      {/* Timeline list */}
      <div style={listStyle}>
        {events.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: spaceAround.spacious,
              color: colors.fg.neutral.spotReadable,
              fontSize: 13,
            }}
          >
            No activity to display
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              style={{
                ...eventItemStyle,
                backgroundColor:
                  hoveredId === event.id ? colors.bg.neutral.subtle : 'transparent',
              }}
              onClick={() => onEventClick?.(event.id)}
              onMouseEnter={() => setHoveredId(event.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <span style={eventIconStyle}>{getEventIcon(event.type)}</span>
              <div style={eventContentStyle}>
                <div style={eventTitleStyle}>
                  {event.title}
                  {event.status && event.status !== 'completed' && (
                    <span style={{ marginLeft: 8, ...statusBadgeStyle(event.status) }}>
                      {event.status === 'in_progress' ? 'In Progress' : 'Pending'}
                    </span>
                  )}
                </div>
                {event.description && <div style={eventDescStyle}>{event.description}</div>}
              </div>
              <span style={eventDateStyle}>{formatRelativeDate(event.date)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

ActivityTab.displayName = 'ActivityTab';
