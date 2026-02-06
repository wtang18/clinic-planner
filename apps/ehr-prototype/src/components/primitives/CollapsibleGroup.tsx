import React from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions } from '../../styles/foundations';
import { Badge } from './Badge';

export interface CollapsibleGroupProps {
  title: string;
  isCollapsed: boolean;
  onToggle: () => void;
  badge?: { label: string | number; variant?: 'default' | 'success' | 'warning' | 'error' | 'info' };
  trailing?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const CollapsibleGroup: React.FC<CollapsibleGroupProps> = ({
  title,
  isCollapsed,
  onToggle,
  badge,
  trailing,
  children,
  style,
}) => {
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    backgroundColor: colors.bg.neutral.min,
    borderRadius: borderRadius.sm,
    cursor: 'pointer',
    userSelect: 'none',
    transition: `background-color ${transitions.fast}`,
    ...style,
  };

  const titleContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.secondary,
    margin: 0,
  };

  const rightStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
  };

  const contentStyle: React.CSSProperties = {
    display: isCollapsed ? 'none' : 'flex',
    flexDirection: 'column',
    gap: spaceBetween.repeating,
    paddingTop: spaceBetween.repeating,
  };

  return (
    <div>
      <div style={headerStyle} onClick={onToggle}>
        <div style={titleContainerStyle}>
          {isCollapsed
            ? <ChevronRight size={16} color={colors.fg.neutral.spotReadable} />
            : <ChevronDown size={16} color={colors.fg.neutral.spotReadable} />
          }
          <span style={titleStyle}>{title}</span>
        </div>
        <div style={rightStyle}>
          {badge && (
            <Badge variant={badge.variant || 'default'} size="sm">
              {String(badge.label)}
            </Badge>
          )}
          {trailing}
        </div>
      </div>
      <div style={contentStyle}>
        {children}
      </div>
    </div>
  );
};

CollapsibleGroup.displayName = 'CollapsibleGroup';
