/**
 * FaxDetailView Component
 *
 * Detail view for fax items from the inbox.
 */

import React from 'react';
import { FileText, User, Link2, Trash2, ArrowRight, MoreHorizontal } from 'lucide-react';
import { colors, spaceBetween, spaceAround, borderRadius, typography } from '../../styles/foundations';
import type { ToDoItem } from '../../scenarios/todoData';

// ============================================================================
// Types
// ============================================================================

export interface FaxDetailViewProps {
  /** The fax item to display */
  item: ToDoItem;
  /** Called when link to patient action is triggered */
  onLinkPatient?: () => void;
  /** Called when delete action is triggered */
  onDelete?: () => void;
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

export const FaxDetailView: React.FC<FaxDetailViewProps> = ({
  item,
  onLinkPatient,
  onDelete,
  onNavigateToPatient,
  style,
  testID,
}) => {
  const isLinked = !!item.patient.name;

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
    backgroundColor: colors.bg.neutral.subtle,
    borderRadius: borderRadius.sm,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 600,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
  };

  const dateStyle: React.CSSProperties = {
    fontSize: 12,
    color: colors.fg.neutral.secondary,
  };

  const patientRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    backgroundColor: colors.bg.neutral.subtle,
    borderRadius: borderRadius.sm,
    cursor: isLinked ? 'pointer' : 'default',
  };

  const patientNameStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 500,
    fontFamily: typography.fontFamily.sans,
    color: isLinked ? colors.fg.accent.primary : colors.fg.neutral.spotReadable,
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.related,
    padding: spaceAround.default,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
  };

  const buttonStyle = (primary?: boolean, destructive?: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    backgroundColor: primary
      ? colors.bg.accent.medium
      : destructive
      ? colors.bg.alert.subtle
      : colors.bg.neutral.subtle,
    color: primary
      ? colors.fg.neutral.inversePrimary
      : destructive
      ? colors.fg.alert.primary
      : colors.fg.neutral.primary,
    border: 'none',
    borderRadius: borderRadius.sm,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  });

  const previewStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg.neutral.subtle,
    margin: spaceAround.default,
    borderRadius: borderRadius.md,
  };

  const previewPlaceholderStyle: React.CSSProperties = {
    padding: spaceAround.spacious,
    textAlign: 'center',
    color: colors.fg.neutral.spotReadable,
    fontSize: 14,
  };

  return (
    <div style={containerStyle} data-testid={testID}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleRowStyle}>
          <div style={iconContainerStyle}>
            <FileText size={20} color={colors.fg.neutral.secondary} />
          </div>
          <div>
            <div style={titleStyle}>{item.title}</div>
            <div style={dateStyle}>
              Received: {new Date(item.createdDate).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Patient link */}
        <div
          style={patientRowStyle}
          onClick={isLinked ? onNavigateToPatient : onLinkPatient}
        >
          <User size={16} color={colors.fg.neutral.secondary} />
          {isLinked ? (
            <>
              <span style={patientNameStyle}>{item.patient.name}</span>
              <span style={{ fontSize: 12, color: colors.fg.neutral.secondary }}>
                {item.patient.age}{item.patient.gender} • MRN: {item.patient.mrn}
              </span>
              <ArrowRight size={14} color={colors.fg.neutral.spotReadable} style={{ marginLeft: 'auto' }} />
            </>
          ) : (
            <span style={patientNameStyle}>Not linked to patient</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={actionsStyle}>
        {!isLinked && (
          <button style={buttonStyle(true)} onClick={onLinkPatient}>
            <Link2 size={14} />
            <span>Link to Patient</span>
          </button>
        )}
        <button style={buttonStyle(false, true)} onClick={onDelete}>
          <Trash2 size={14} />
          <span>Delete</span>
        </button>
        <button style={buttonStyle()}>
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* Fax preview placeholder */}
      <div style={previewStyle}>
        <div style={previewPlaceholderStyle}>
          <FileText size={48} color={colors.fg.neutral.softer} />
          <div style={{ marginTop: spaceAround.compact }}>
            Fax document preview will appear here.
          </div>
        </div>
      </div>
    </div>
  );
};

FaxDetailView.displayName = 'FaxDetailView';
