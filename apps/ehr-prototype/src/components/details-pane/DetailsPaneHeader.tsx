/**
 * DetailsPaneHeader Component
 *
 * Category badge + item name + close button for the details pane.
 */

import React from 'react';
import { X } from 'lucide-react';
import type { ChartItem } from '../../types/chart-items';
import { getCategoryMeta } from '../omni-add/omni-add-machine';
import { colors, spaceAround, spaceBetween, typography, borderRadius } from '../../styles/foundations';
import { IconButton } from '../primitives/IconButton';

// ============================================================================
// Types
// ============================================================================

export interface DetailsPaneHeaderProps {
  item: ChartItem;
  onClose: () => void;
}

// ============================================================================
// Component
// ============================================================================

export const DetailsPaneHeader: React.FC<DetailsPaneHeaderProps> = ({ item, onClose }) => {
  const meta = getCategoryMeta(item.category);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${spaceAround.default}px ${spaceAround.defaultPlus}px`,
      borderBottom: `1px solid ${colors.border.neutral.low}`,
      flexShrink: 0,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: spaceBetween.relatedCompact,
        minWidth: 0,
        flex: 1,
      }}>
        {/* Category badge */}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: `${spaceAround.nudge2}px ${spaceAround.tight}px`,
          backgroundColor: colors.bg.neutral.subtle,
          color: colors.fg.neutral.secondary,
          fontSize: 12,
          fontWeight: typography.fontWeight.semibold,
          borderRadius: borderRadius.xs,
          whiteSpace: 'nowrap',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}>
          {meta.label}
        </span>

        {/* Item name */}
        <h3 style={{
          fontSize: 16,
          fontWeight: typography.fontWeight.semibold,
          color: colors.fg.neutral.primary,
          margin: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {item.displayText}
        </h3>
      </div>

      <IconButton
        icon={<X size={20} />}
        label="Close details pane"
        variant="ghost"
        size="md"
        onClick={onClose}
      />
    </div>
  );
};

DetailsPaneHeader.displayName = 'DetailsPaneHeader';
