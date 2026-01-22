/**
 * ChartItemCard Component
 *
 * Base card component that renders any chart item with category-specific styling.
 */

import React from 'react';
import type { ChartItem, Tag } from '../../types/chart-items';
import { colors, spacing, typography, shadows, radii, transitions } from '../../styles/tokens';
import { getCategoryColor, getTagColor } from '../../styles/utils';
import { Card } from '../primitives/Card';
import { Badge } from '../primitives/Badge';
import { IconButton } from '../primitives/IconButton';

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
// Icons (Simple SVG components)
// ============================================================================

const EditIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3,6 5,6 21,6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const AIIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

// Category icons
const getCategoryIcon = (category: ChartItem['category']): React.ReactNode => {
  const iconStyle = { width: '100%', height: '100%' };

  switch (category) {
    case 'medication':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.5 20.5L3.5 13.5a4.95 4.95 0 0 1 7-7l7 7a4.95 4.95 0 0 1-7 7z" />
          <path d="M8.5 8.5l7 7" />
        </svg>
      );
    case 'lab':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 3h6v5.5l3 5.5v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-4l3-5.5V3z" />
          <path d="M9 3h6" />
        </svg>
      );
    case 'diagnosis':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      );
    case 'vitals':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
    case 'imaging':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
          <line x1="7" y1="2" x2="7" y2="22" />
          <line x1="17" y1="2" x2="17" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="2" y1="7" x2="7" y2="7" />
          <line x1="2" y1="17" x2="7" y2="17" />
          <line x1="17" y1="17" x2="22" y2="17" />
          <line x1="17" y1="7" x2="22" y2="7" />
        </svg>
      );
    case 'procedure':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      );
    case 'allergy':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    default:
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10,9 9,9 8,9" />
        </svg>
      );
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
        padding: `${spacing[0.5]} ${spacing[2]}`,
        backgroundColor: tagColors.bgColor,
        color: tagColors.color,
        fontSize: typography.fontSize.xs[0],
        lineHeight: typography.fontSize.xs[1].lineHeight,
        fontWeight: typography.fontWeight.medium,
        borderRadius: radii.full,
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

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: isCompact ? 'center' : 'flex-start',
    gap: spacing[3],
    padding: isCompact ? spacing[3] : spacing[4],
    borderLeft: `3px solid ${categoryColors.border}`,
    cursor: onSelect ? 'pointer' : 'default',
    transition: `all ${transitions.fast}`,
    ...(selected && {
      backgroundColor: colors.primary[50],
      boxShadow: shadows.focus,
    }),
    ...style,
  };

  const iconContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: isCompact ? '32px' : '40px',
    height: isCompact ? '32px' : '40px',
    backgroundColor: categoryColors.lightBg,
    borderRadius: radii.lg,
    color: categoryColors.icon,
    flexShrink: 0,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: isCompact ? spacing[1] : spacing[2],
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    flexWrap: 'wrap',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: isCompact ? typography.fontSize.sm[0] : typography.fontSize.base[0],
    lineHeight: isCompact ? typography.fontSize.sm[1].lineHeight : typography.fontSize.base[1].lineHeight,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[900],
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: isCompact ? 'nowrap' : 'normal',
  };

  const subtextStyle: React.CSSProperties = {
    fontSize: typography.fontSize.xs[0],
    lineHeight: typography.fontSize.xs[1].lineHeight,
    color: colors.neutral[500],
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: isCompact ? 'nowrap' : 'normal',
  };

  const tagsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing[1],
    marginTop: isCompact ? 0 : spacing[2],
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[1],
    flexShrink: 0,
  };

  const aiIndicatorStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[1],
    color: colors.ai.suggestion,
    fontSize: typography.fontSize.xs[0],
  };

  return (
    <Card
      variant={selected ? 'elevated' : 'default'}
      padding="none"
      interactive={!!onSelect}
      selected={selected}
      onClick={onSelect}
      style={{ overflow: 'visible' }}
    >
      <div style={containerStyle}>
        {/* Category Icon */}
        <div style={iconContainerStyle}>
          <div style={{ width: isCompact ? '16px' : '20px', height: isCompact ? '16px' : '20px' }}>
            {getCategoryIcon(item.category)}
          </div>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          <div style={headerStyle}>
            <p style={titleStyle}>{item.displayText}</p>
            {isAIGenerated && (
              <div style={aiIndicatorStyle}>
                <span style={{ width: '14px', height: '14px', display: 'flex' }}>
                  <AIIcon />
                </span>
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
                  fontSize: typography.fontSize.xs[0],
                  color: colors.neutral[500],
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
                icon={<EditIcon />}
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
                icon={<TrashIcon />}
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
