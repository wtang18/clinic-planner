/**
 * Tag Component
 *
 * Clinical tags for status, source, alerts, etc.
 */

import React from 'react';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions } from '../../styles/foundations';
import type { TagType } from '../../types/chart-items';
import { getTagColor } from '../../styles/utils';

// ============================================================================
// Types
// ============================================================================

export interface TagProps {
  /** Tag type for styling */
  type: TagType;
  /** Tag label */
  label: string;
  /** Custom color override */
  color?: string;
  /** Show remove button */
  removable?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Remove handler */
  onRemove?: () => void;
}

// ============================================================================
// Component
// ============================================================================

export const Tag: React.FC<TagProps> = ({
  type,
  label,
  color: customColor,
  removable = false,
  onClick,
  onRemove,
}) => {
  const colorSet = getTagColor({ label, type, color: customColor });
  const [isHovered, setIsHovered] = React.useState(false);

  const isClickable = !!onClick;

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  return (
    <span
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          onClick?.();
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: spaceBetween.coupled,
        padding: `${spaceAround.nudge2}px ${spaceAround.tight}px`,
        backgroundColor: colorSet.bgColor,
        color: colorSet.color,
        fontSize: 12,
        fontWeight: typography.fontWeight.medium,
        fontFamily: typography.fontFamily.sans,
        borderRadius: borderRadius.xs,
        whiteSpace: 'nowrap',
        cursor: isClickable ? 'pointer' : 'default',
        transition: `all ${transitions.fast}`,
        opacity: isHovered && isClickable ? 0.8 : 1,
      }}
    >
      {type === 'ai' && (
        <span style={{ fontSize: '10px' }}>&#x2728;</span>
      )}
      {type === 'alert' && (
        <span style={{ fontSize: '10px' }}>&#x26A0;&#xFE0F;</span>
      )}

      {label}

      {removable && (
        <button
          type="button"
          onClick={handleRemove}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '14px',
            height: '14px',
            padding: 0,
            marginLeft: spaceAround.nudge4,
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: borderRadius.full,
            color: colorSet.color,
            cursor: 'pointer',
            opacity: 0.7,
            transition: `opacity ${transitions.fast}`,
          }}
          aria-label={`Remove ${label}`}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M2 2L8 8M8 2L2 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </span>
  );
};
