/**
 * ChartItemCard Component
 *
 * Base card component that renders any chart item with category-specific styling.
 */

import React from 'react';
import {
  Pencil,
  Trash2,
  Sparkles,
  Pill,
  FlaskConical,
  Activity,
  HeartPulse,
  ScanLine,
  CircleDot,
  AlertTriangle,
  FileText,
  CheckCircle,
  Circle,
  Loader,
} from 'lucide-react';
import type { ChartItem, Tag } from '../../types/chart-items';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions } from '../../styles/foundations';
import { getTagColor } from '../../styles/utils';
import { Card } from '../primitives/Card';
import { Badge } from '../primitives/Badge';
import { IconButton } from '../primitives/IconButton';
import { CardIconContainer } from '../primitives/CardIconContainer';

// ============================================================================
// Types
// ============================================================================

/** A processing step rendered below card content (used in Process view) */
export interface CardProcessingStep {
  label: string;
  status: 'complete' | 'pending' | 'active' | 'failed';
  taskId?: string;
}

/** A next-action button rendered in the trailing area (used in Process view) */
export interface CardNextAction {
  label: string;
  actionType: string;
  taskId?: string;
}

export interface ChartItemCardProps {
  /** The chart item to display */
  item: ChartItem;
  /** Display variant */
  variant?: 'compact' | 'expanded';
  /** Whether the card is selected */
  selected?: boolean;
  /** Whether to show action buttons */
  showActions?: boolean;
  /** Processing steps rendered below content (Process view) */
  processingSteps?: CardProcessingStep[];
  /** Next action button in trailing area (Process view) */
  nextAction?: CardNextAction;
  /** Called when the card is selected */
  onSelect?: () => void;
  /** Called when edit is clicked */
  onEdit?: () => void;
  /** Called when delete is clicked */
  onDelete?: () => void;
  /** Called when next action button is clicked */
  onAction?: (actionType: string, taskId?: string) => void;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Icons
// ============================================================================

// Category icons
const getCategoryIcon = (category: ChartItem['category'], size: number): React.ReactNode => {
  switch (category) {
    case 'medication':
      return <Pill size={size} />;
    case 'lab':
      return <FlaskConical size={size} />;
    case 'diagnosis':
      return <Activity size={size} />;
    case 'vitals':
      return <HeartPulse size={size} />;
    case 'imaging':
      return <ScanLine size={size} />;
    case 'procedure':
      return <CircleDot size={size} />;
    case 'allergy':
      return <AlertTriangle size={size} />;
    default:
      return <FileText size={size} />;
  }
};

// ============================================================================
// Helper Components
// ============================================================================

const TagDisplay: React.FC<{ tag: Tag }> = ({ tag }) => {
  const tagColors = getTagColor(tag);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: `1px ${spaceAround.nudge6}px`,
        backgroundColor: tagColors.bgColor,
        color: tagColors.color,
        fontSize: 11,
        lineHeight: '16px',
        fontWeight: typography.fontWeight.medium,
        borderRadius: borderRadius.xs,
        whiteSpace: 'nowrap',
      }}
    >
      {tag.label}
    </span>
  );
};

const StepIcon: React.FC<{ status: CardProcessingStep['status']; size?: number }> = ({
  status,
  size = 14,
}) => {
  switch (status) {
    case 'complete':
      return <CheckCircle size={size} color={colors.fg.positive.secondary} />;
    case 'active':
      return <Loader size={size} color={colors.fg.information.secondary} />;
    case 'failed':
      return <AlertTriangle size={size} color={colors.fg.alert.secondary} />;
    case 'pending':
    default:
      return <Circle size={size} color={colors.fg.neutral.disabled} />;
  }
};

const stepsRowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: spaceBetween.related,
  marginTop: spaceAround.tight,
};

const stepStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
};

const stepLabelStyle: React.CSSProperties = {
  fontSize: 11,
  color: colors.fg.neutral.secondary,
};

const nextActionButtonStyle: React.CSSProperties = {
  alignSelf: 'flex-start',
  marginTop: spaceAround.tight,
  padding: `${spaceAround.nudge4}px ${spaceAround.compact}px`,
  fontSize: 12,
  fontWeight: typography.fontWeight.medium,
  color: colors.fg.accent.primary,
  backgroundColor: colors.bg.accent.subtle,
  border: `1px solid ${colors.border.accent.low}`,
  borderRadius: borderRadius.sm,
  cursor: 'pointer',
};

// ============================================================================
// Component
// ============================================================================

export const ChartItemCard: React.FC<ChartItemCardProps> = ({
  item,
  variant = 'compact',
  selected = false,
  showActions = false,
  processingSteps,
  nextAction,
  onSelect,
  onEdit,
  onDelete,
  onAction,
  style,
}) => {
  const isCompact = variant === 'compact';
  const isAIGenerated = item._meta.aiGenerated;
  const isUnreviewed = !item._meta.reviewed;

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: isCompact ? 'center' : 'flex-start',
    gap: isCompact ? spaceBetween.repeating : spaceBetween.relatedCompact,
    padding: isCompact ? spaceAround.tight : spaceAround.compact,
    cursor: onSelect ? 'pointer' : 'default',
    transition: `all ${transitions.fast}`,
    ...style,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: isCompact ? spaceBetween.coupled : spaceBetween.repeating,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    flexWrap: 'wrap',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: isCompact ? 13 : 15,
    lineHeight: isCompact ? '18px' : '22px',
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.primary,
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: isCompact ? 'nowrap' : 'normal',
  };

  const subtextStyle: React.CSSProperties = {
    fontSize: 12,
    lineHeight: '16px',
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.spotReadable,
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: isCompact ? 'nowrap' : 'normal',
  };

  const tagsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spaceBetween.coupled,
    marginTop: isCompact ? 0 : spaceAround.tight,
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    flexShrink: 0,
  };

  const aiIndicatorStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    color: colors.fg.neutral.spotReadable,
    fontSize: 12,
  };

  return (
    <Card
      data-testid={`chart-item-card-${item.id}`}
      variant={selected ? 'elevated' : 'default'}
      padding="none"
      interactive={!!onSelect}
      selected={selected}
      onClick={onSelect}
      style={{ overflow: 'visible' }}
    >
      <div style={containerStyle}>
        {/* Category Icon */}
        <CardIconContainer color="default" size={isCompact ? 'sm' : 'md'}>
          {getCategoryIcon(item.category, isCompact ? 14 : 18)}
        </CardIconContainer>

        {/* Content */}
        <div style={contentStyle}>
          <div style={headerStyle}>
            <p style={titleStyle}>{item.displayText}</p>
            {isAIGenerated && (
              <div style={aiIndicatorStyle}>
                <Sparkles size={14} />
                {!isCompact && (
                  <span>AI</span>
                )}
              </div>
            )}
            {(item._meta.requiresReview || (isUnreviewed && item.source.type === 'maHandoff')) && (
              <Badge variant="default" size="sm">Needs review</Badge>
            )}
          </div>

          {item.displaySubtext && (
            <p style={subtextStyle}>{item.displaySubtext}</p>
          )}

          {/* Tags */}
          {item.tags.length > 0 && (
            <div style={tagsContainerStyle}>
              {item.tags.slice(0, isCompact ? 3 : undefined).map((tag, index) => (
                <TagDisplay key={`${tag.type}-${tag.label}-${index}`} tag={tag} />
              ))}
              {isCompact && item.tags.length > 3 && (
                <span style={{
                  fontSize: 12,
                  color: colors.fg.neutral.spotReadable,
                  alignSelf: 'center',
                }}>
                  +{item.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Processing Steps (Process view) */}
          {processingSteps && processingSteps.length > 0 && (
            <div style={stepsRowStyle} data-testid="processing-steps">
              {processingSteps.map((step, i) => (
                <div key={step.taskId || i} style={stepStyle} title={step.label}>
                  <StepIcon status={step.status} />
                  <span style={stepLabelStyle}>{step.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Next Action (Process view) */}
          {nextAction && onAction && (
            <button
              type="button"
              style={nextActionButtonStyle}
              onClick={(e) => {
                e.stopPropagation();
                onAction(nextAction.actionType, nextAction.taskId);
              }}
              data-testid={`action-${nextAction.actionType}`}
            >
              {nextAction.label}
            </button>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div style={actionsStyle}>
            {onEdit && (
              <IconButton
                data-testid="edit-btn"
                icon={<Pencil size={14} />}
                label="Edit item"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              />
            )}
            {onDelete && (
              <IconButton
                data-testid="delete-btn"
                icon={<Trash2 size={14} />}
                label="Delete item"
                variant="danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              />
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

ChartItemCard.displayName = 'ChartItemCard';
