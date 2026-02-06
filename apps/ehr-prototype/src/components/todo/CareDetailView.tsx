/**
 * CareDetailView Component
 *
 * Detail view for care coordination items from the To-Do list.
 */

import React from 'react';
import { Heart, User, Clock, CheckCircle2, ArrowRight, MoreHorizontal, Calendar } from 'lucide-react';
import { colors, spaceBetween, spaceAround, borderRadius, typography } from '../../styles/foundations';
import type { ToDoItem } from '../../scenarios/todoData';

// ============================================================================
// Types
// ============================================================================

export interface CareDetailViewProps {
  /** The care item to display */
  item: ToDoItem;
  /** Called when complete action is triggered */
  onComplete?: () => void;
  /** Called when schedule action is triggered */
  onSchedule?: () => void;
  /** Called when navigate to patient is triggered */
  onNavigateToPatient?: () => void;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const CareDetailView: React.FC<CareDetailViewProps> = ({
  item,
  onComplete,
  onSchedule,
  onNavigateToPatient,
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
    flexDirection: 'column',
    gap: spaceBetween.related,
    padding: spaceAround.default,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
  };

  const titleRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.related,
  };

  const iconContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    backgroundColor: colors.bg.positive.subtle,
    borderRadius: borderRadius.sm,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 600,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
  };

  const priorityBadgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: borderRadius.xs,
    fontSize: 11,
    fontWeight: 500,
    backgroundColor:
      item.priority === 'stat'
        ? colors.bg.alert.subtle
        : item.priority === 'urgent'
        ? colors.bg.attention.subtle
        : 'transparent',
    color:
      item.priority === 'stat'
        ? colors.fg.alert.primary
        : item.priority === 'urgent'
        ? colors.fg.attention.primary
        : colors.fg.neutral.secondary,
  };

  const patientRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    backgroundColor: colors.bg.neutral.subtle,
    borderRadius: borderRadius.sm,
    cursor: 'pointer',
  };

  const patientNameStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 500,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.accent.primary,
  };

  const patientInfoStyle: React.CSSProperties = {
    fontSize: 12,
    color: colors.fg.neutral.secondary,
  };

  const metaRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.separated,
    fontSize: 13,
    color: colors.fg.neutral.secondary,
  };

  const metaItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.related,
    padding: spaceAround.default,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
  };

  const buttonStyle = (primary?: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    backgroundColor: primary ? colors.bg.accent.medium : colors.bg.neutral.subtle,
    color: primary ? colors.fg.neutral.inversePrimary : colors.fg.neutral.primary,
    border: 'none',
    borderRadius: borderRadius.sm,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  });

  const contentStyle: React.CSSProperties = {
    flex: 1,
    padding: spaceAround.default,
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
    marginBottom: spaceAround.compact,
  };

  const placeholderStyle: React.CSSProperties = {
    padding: spaceAround.compact,
    backgroundColor: colors.bg.neutral.subtle,
    borderRadius: borderRadius.sm,
    color: colors.fg.neutral.spotReadable,
    fontSize: 13,
  };

  return (
    <div style={containerStyle} data-testid={testID}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleRowStyle}>
          <div style={iconContainerStyle}>
            <Heart size={20} color={colors.fg.positive.primary} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: spaceBetween.related }}>
              <span style={titleStyle}>{item.title}</span>
              {item.priority && item.priority !== 'normal' && (
                <span style={priorityBadgeStyle}>
                  {item.priority === 'stat' ? 'STAT' : 'Urgent'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Patient card */}
        {item.patient.name && (
          <div style={patientRowStyle} onClick={onNavigateToPatient}>
            <User size={16} color={colors.fg.neutral.secondary} />
            <span style={patientNameStyle}>{item.patient.name}</span>
            <span style={patientInfoStyle}>
              {item.patient.age}{item.patient.gender} • MRN: {item.patient.mrn}
            </span>
            <ArrowRight size={14} color={colors.fg.neutral.spotReadable} style={{ marginLeft: 'auto' }} />
          </div>
        )}

        {/* Meta row */}
        <div style={metaRowStyle}>
          {item.owner && (
            <div style={metaItemStyle}>
              <User size={14} />
              <span>{item.owner}</span>
            </div>
          )}
          {item.dueDate && (
            <div style={metaItemStyle}>
              <Clock size={14} />
              <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={actionsStyle}>
        <button style={buttonStyle(true)} onClick={onComplete}>
          <CheckCircle2 size={14} />
          <span>Mark Complete</span>
        </button>
        <button style={buttonStyle()} onClick={onSchedule}>
          <Calendar size={14} />
          <span>Schedule</span>
        </button>
        <button style={buttonStyle()}>
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* Content */}
      <div style={contentStyle}>
        <div style={sectionTitleStyle}>Care Details</div>
        <div style={placeholderStyle}>
          Care coordination details, history, and related documentation will appear here.
        </div>
      </div>
    </div>
  );
};

CareDetailView.displayName = 'CareDetailView';
