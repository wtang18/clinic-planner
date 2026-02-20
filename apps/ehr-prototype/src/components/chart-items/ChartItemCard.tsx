/**
 * ChartItemCard Component
 *
 * Base card component that renders any chart item with category-specific styling.
 *
 * Layout:
 *   [icon] [Title ........................] [Trailing action / status]
 *          [Clinical subtext]
 *          [Source · Status · Attribution]            ← conditional
 *          [tag] [tag] [tag]                          ← deduped
 *          [step] [step] [step]                       ← process view only
 */

import React from 'react';
import {
  Pencil,
  Trash2,
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
import { IconButton } from '../primitives/IconButton';

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
  /** Custom trailing action (ReactNode) — overrides default trailing behavior */
  trailingAction?: React.ReactNode;
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
// Attribution Helpers
// ============================================================================

/** Derive attribution text from item source */
function getAttributionText(item: ChartItem): string | null {
  switch (item.source.type) {
    case 'aiDraft':
      return 'AI Draft';
    case 'aiSuggestion':
      return 'AI Suggestion';
    case 'maHandoff': {
      const firstActor = item.activityLog[0]?.actor;
      return `Added by ${firstActor || 'MA'}`;
    }
    case 'protocol':
      return 'From protocol';
    case 'orderSet':
      return 'From order set';
    case 'manual':
    default:
      return null;
  }
}

/** Derive status suffix — appended to attribution when non-obvious */
function getStatusSuffix(item: ChartItem): string | null {
  // Omit "confirmed" on manual items (obvious)
  if (item.source.type === 'manual' && item.status === 'confirmed') return null;
  // Omit for drafts (redundant with attribution)
  if (item.status === 'draft') return null;

  const labels: Record<string, string> = {
    'pending-review': 'Pending review',
    'confirmed': 'Confirmed',
    'ordered': 'Ordered',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
  };
  return labels[item.status] || null;
}

/** Tags to filter out (now covered by attribution + trailing status) */
const DEDUPED_TAG_LABELS = new Set(['ai generated', 'needs review']);

function filterTags(tags: Tag[]): Tag[] {
  return tags.filter(t => !DEDUPED_TAG_LABELS.has(t.label.toLowerCase()));
}

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
        fontSize: 12,
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
  fontSize: 12,
  color: colors.fg.neutral.secondary,
};

const trailingActionButtonStyle: React.CSSProperties = {
  height: 20,
  padding: `0 ${spaceAround.nudge6}px`,
  fontSize: 11,
  lineHeight: '20px',
  fontWeight: typography.fontWeight.medium,
  color: colors.fg.accent.primary,
  backgroundColor: colors.bg.accent.subtle,
  border: `1px solid ${colors.border.accent.low}`,
  borderRadius: borderRadius.xs,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const attributionStyle: React.CSSProperties = {
  fontSize: 12,
  lineHeight: '16px',
  fontFamily: typography.fontFamily.sans,
  color: colors.fg.neutral.spotReadable,
};

const trailingStatusStyle: React.CSSProperties = {
  fontSize: 12,
  lineHeight: '20px',
  fontFamily: typography.fontFamily.sans,
  fontWeight: typography.fontWeight.medium,
  color: colors.fg.attention.primary,
  whiteSpace: 'nowrap',
  flexShrink: 0,
};

// ============================================================================
// Component
// ============================================================================

export const ChartItemCard: React.FC<ChartItemCardProps> = ({
  item,
  variant: _variant,
  selected = false,
  showActions = false,
  processingSteps,
  nextAction,
  trailingAction,
  onSelect,
  onEdit,
  onDelete,
  onAction,
  style,
}) => {
  const isUnreviewed = !item._meta.reviewed;

  // Attribution line
  const attribution = getAttributionText(item);
  const statusSuffix = getStatusSuffix(item);
  const attributionLine = [attribution, statusSuffix].filter(Boolean).join(' \u00B7 ');

  // Trailing content: explicit trailingAction > nextAction button > "Needs review" text
  const needsReview = item._meta.requiresReview || (isUnreviewed && item.source.type === 'maHandoff');

  const renderTrailing = (): React.ReactNode => {
    if (trailingAction) return trailingAction;

    if (nextAction && onAction) {
      return (
        <button
          type="button"
          style={trailingActionButtonStyle}
          onClick={(e) => {
            e.stopPropagation();
            onAction(nextAction.actionType, nextAction.taskId);
          }}
          data-testid={`action-${nextAction.actionType}`}
        >
          {nextAction.label}
        </button>
      );
    }

    if (needsReview) {
      return <span style={trailingStatusStyle}>Needs review</span>;
    }

    return null;
  };

  const trailing = renderTrailing();

  // Filtered tags
  const filteredTags = filterTags(item.tags);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    gap: spaceBetween.repeating,
    padding: spaceAround.tight,
    cursor: onSelect ? 'pointer' : 'default',
    transition: `all ${transitions.fast}`,
    ...style,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.coupled,
    paddingTop: 1,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spaceBetween.repeating,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 14,
    lineHeight: '20px',
    letterSpacing: -0.5,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.primary,
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'normal',
    flex: 1,
    minWidth: 0,
  };

  const subtextStyle: React.CSSProperties = {
    fontSize: 12,
    lineHeight: '16px',
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.spotReadable,
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'normal',
  };

  const tagsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spaceBetween.coupled,
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    flexShrink: 0,
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
        <div style={{ flexShrink: 0, marginTop: 2, color: colors.fg.neutral.spotReadable }}>
          {getCategoryIcon(item.category, 16)}
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {/* Title row with trailing action */}
          <div style={headerStyle}>
            <p style={titleStyle}>{item.displayText}</p>
            {trailing && (
              <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
                {trailing}
              </div>
            )}
          </div>

          {item.displaySubtext && (
            <p style={subtextStyle}>{item.displaySubtext}</p>
          )}

          {/* Attribution line */}
          {attributionLine && (
            <span style={attributionStyle}>{attributionLine}</span>
          )}

          {/* Tags (deduped) */}
          {filteredTags.length > 0 && (
            <div style={tagsContainerStyle}>
              {filteredTags.map((tag, index) => (
                <TagDisplay key={`${tag.type}-${tag.label}-${index}`} tag={tag} />
              ))}
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
