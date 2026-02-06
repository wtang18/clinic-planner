/**
 * TaskDetailView Component
 *
 * Detail view for task items from the To-Do list.
 */

import React from 'react';
import { CheckCircle2, User, Clock, ArrowRight, MoreHorizontal } from 'lucide-react';
import { colors, spaceBetween, spaceAround, borderRadius, typography } from '../../styles/foundations';
import type { ToDoItem } from '../../scenarios/todoData';

// ============================================================================
// Types
// ============================================================================

export interface TaskDetailViewProps {
  /** The task item to display */
  item: ToDoItem;
  /** Called when complete action is triggered */
  onComplete?: () => void;
  /** Called when reassign action is triggered */
  onReassign?: () => void;
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

export const TaskDetailView: React.FC<TaskDetailViewProps> = ({
  item,
  onComplete,
  onReassign,
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

  const titleStyle: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 600,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
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

  const placeholderStyle: React.CSSProperties = {
    padding: spaceAround.spacious,
    textAlign: 'center',
    color: colors.fg.neutral.spotReadable,
    fontSize: 14,
  };

  return (
    <div style={containerStyle} data-testid={testID}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleStyle}>{item.title}</div>

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
          <span>Complete</span>
        </button>
        <button style={buttonStyle()} onClick={onReassign}>
          <User size={14} />
          <span>Reassign</span>
        </button>
        <button style={buttonStyle()}>
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* Content placeholder */}
      <div style={contentStyle}>
        <div style={placeholderStyle}>
          Task details and activity log will appear here.
        </div>
      </div>
    </div>
  );
};

TaskDetailView.displayName = 'TaskDetailView';
