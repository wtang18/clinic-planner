/**
 * ToDoRow Component
 *
 * Generic row component for To-Do items. Renders appropriate
 * content based on the item's category (task, fax, message, care).
 */

import React, { useState } from 'react';
import {
  CheckSquare,
  FileText,
  MessageSquare,
  Heart,
  AlertCircle,
  Clock,
  User,
} from 'lucide-react';
import { colors, spaceBetween, spaceAround, borderRadius, typography, transitions } from '../../styles/foundations';
import type { ToDoItem } from '../../scenarios/todoData';

// ============================================================================
// Types
// ============================================================================

export interface ToDoRowProps {
  /** The To-Do item to display */
  item: ToDoItem;
  /** Called when the row is clicked */
  onClick?: () => void;
  /** Whether the row is selected */
  isSelected?: boolean;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getCategoryIcon(categoryId: string) {
  switch (categoryId) {
    case 'tasks':
      return CheckSquare;
    case 'inbox':
      return FileText;
    case 'messages':
      return MessageSquare;
    case 'care':
      return Heart;
    default:
      return CheckSquare;
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isOverdue(dueDate?: string): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

// ============================================================================
// Component
// ============================================================================

export const ToDoRow: React.FC<ToDoRowProps> = ({
  item,
  onClick,
  isSelected = false,
  style,
  testID,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const Icon = getCategoryIcon(item.categoryId);
  const overdue = isOverdue(item.dueDate);

  // Styles
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spaceBetween.related,
    padding: spaceAround.compact,
    marginBottom: spaceAround.tight,
    backgroundColor: isSelected
      ? colors.bg.accent.subtle
      : isHovered
      ? colors.bg.neutral.subtle
      : 'transparent',
    borderRadius: borderRadius.sm,
    cursor: 'pointer',
    transition: `background-color ${transitions.fast}`,
    ...style,
  };

  const iconContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    backgroundColor: colors.bg.neutral.subtle,
    borderRadius: borderRadius.sm,
    flexShrink: 0,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const titleRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    marginBottom: 2,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 500,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const priorityBadgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    padding: '1px 6px',
    borderRadius: borderRadius.xs,
    fontSize: 10,
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

  const metaRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.related,
    fontSize: 12,
    color: colors.fg.neutral.secondary,
  };

  const patientStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  };

  const dueDateStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    color: overdue ? colors.fg.alert.primary : colors.fg.neutral.spotReadable,
  };

  const ownerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
    color: colors.fg.neutral.spotReadable,
  };

  return (
    <div
      style={containerStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={testID}
    >
      {/* Category icon */}
      <div style={iconContainerStyle}>
        <Icon size={16} color={colors.fg.neutral.secondary} />
      </div>

      {/* Content */}
      <div style={contentStyle}>
        {/* Title row */}
        <div style={titleRowStyle}>
          <span style={titleStyle}>{item.title}</span>
          {item.priority && item.priority !== 'normal' && (
            <span style={priorityBadgeStyle}>
              <AlertCircle size={10} />
              {item.priority === 'stat' ? 'STAT' : 'Urgent'}
            </span>
          )}
        </div>

        {/* Meta row */}
        <div style={metaRowStyle}>
          {/* Patient */}
          {item.patient.name && (
            <span style={patientStyle}>
              <User size={12} />
              {item.patient.name}
              {item.patient.age > 0 && `, ${item.patient.age}${item.patient.gender}`}
            </span>
          )}

          {/* Due date */}
          {item.dueDate && (
            <span style={dueDateStyle}>
              <Clock size={12} />
              {overdue ? 'Overdue: ' : 'Due: '}
              {formatDate(item.dueDate)}
            </span>
          )}

          {/* Owner */}
          {item.owner && (
            <span style={ownerStyle}>
              {item.owner.split(',')[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

ToDoRow.displayName = 'ToDoRow';
