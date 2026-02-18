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
} from 'lucide-react';
import type { ChartItem, Tag } from '../../types/chart-items';
import { colors, spaceAround, spaceBetween, borderRadius, typography, shadows, transitions } from '../../styles/foundations';
import { getCategoryColor, getTagColor } from '../../styles/utils';
import { Card } from '../primitives/Card';
import { Badge } from '../primitives/Badge';
import { IconButton } from '../primitives/IconButton';
import { CardIconContainer } from '../primitives/CardIconContainer';

// ============================================================================
// Types
// ============================================================================

export interface ChartItemCardProps {
  /** The chart item to display */
  item: ChartItem;
  /** Display variant */
  variant?: 'compact' | 'expanded';
  /** Whether the card is selected */
  selected?: boolean;
  /** Whether to show action buttons */
  showActions?: boolean;
  /** Called when the card is selected */
  onSelect?: () => void;
  /** Called when edit is clicked */
  onEdit?: () => void;
  /** Called when delete is clicked */
  onDelete?: () => void;
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
        padding: `${spaceAround.nudge2}px ${spaceAround.tight}px`,
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

// ============================================================================
// Component
// ============================================================================

export const ChartItemCard: React.FC<ChartItemCardProps> = ({
  item,
  variant = 'compact',
  selected = false,
  showActions = false,
  onSelect,
  onEdit,
  onDelete,
  style,
}) => {
  const categoryColors = getCategoryColor(item.category);
  const isCompact = variant === 'compact';
  const isAIGenerated = item._meta.aiGenerated;
  const isUnreviewed = !item._meta.reviewed;

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: isCompact ? 'center' : 'flex-start',
    gap: spaceBetween.relatedCompact,
    padding: isCompact ? spaceAround.compact : spaceAround.default,
    cursor: onSelect ? 'pointer' : 'default',
    transition: `all ${transitions.fast}`,
    // Unreviewed indicator: subtle left border for MA handoff items
    ...(isUnreviewed && {
      borderLeft: `3px solid ${colors.fg.attention.secondary}`,
    }),
    ...(selected && {
      backgroundColor: colors.bg.accent.subtle,
      boxShadow: shadows.focus,
    }),
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
    fontSize: isCompact ? 14 : 16,
    lineHeight: isCompact ? '20px' : '24px',
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
    color: colors.fg.generative.spotReadable,
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
        <CardIconContainer color="default" size={isCompact ? 'md' : 'lg'}>
          {getCategoryIcon(item.category, isCompact ? 16 : 20)}
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
            {item._meta.requiresReview && (
              <Badge variant="warning" size="sm">Review</Badge>
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
