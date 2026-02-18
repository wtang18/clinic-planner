/**
 * OmniAddBreadcrumb Component
 *
 * Clickable breadcrumb trail showing the current navigation path in the OmniAdd tree.
 * Tapping a breadcrumb segment returns to that level's selection state.
 */

import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { BreadcrumbSegment } from './omni-add-machine';
import { colors, spaceBetween, typography, transitions } from '../../styles/foundations';

export interface OmniAddBreadcrumbProps {
  segments: BreadcrumbSegment[];
  onNavigate: (index: number) => void;
}

export const OmniAddBreadcrumb: React.FC<OmniAddBreadcrumbProps> = ({
  segments,
  onNavigate,
}) => {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    minHeight: 24,
  };

  return (
    <nav style={containerStyle} aria-label="OmniAdd navigation" data-testid="omni-add-breadcrumb">
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const isHovered = hoveredIndex === index;

        const segmentStyle: React.CSSProperties = {
          cursor: isLast ? 'default' : 'pointer',
          color: isLast
            ? colors.fg.neutral.primary
            : isHovered
            ? colors.fg.accent.primary
            : colors.fg.neutral.spotReadable,
          fontWeight: isLast ? typography.fontWeight.medium : 'normal',
          transition: `color ${transitions.fast}`,
          userSelect: 'none',
        };

        return (
          <React.Fragment key={index}>
            <span
              style={segmentStyle}
              onClick={() => !isLast && onNavigate(index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              role={isLast ? undefined : 'button'}
              tabIndex={isLast ? undefined : 0}
              onKeyDown={(e) => {
                if (!isLast && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onNavigate(index);
                }
              }}
              data-testid={`breadcrumb-${index}`}
            >
              {segment.label}
            </span>
            {!isLast && (
              <ChevronRight
                size={12}
                color={colors.fg.neutral.disabled}
                style={{ flexShrink: 0 }}
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

OmniAddBreadcrumb.displayName = 'OmniAddBreadcrumb';
