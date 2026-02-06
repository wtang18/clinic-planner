import React from 'react';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions } from '../../styles/foundations';

export interface ListItemRowProps {
  icon?: React.ReactNode;
  iconColor?: string;
  children: React.ReactNode;
  trailing?: React.ReactNode;
  variant?: 'default' | 'subtle' | 'highlighted';
  compact?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const variantStyles: Record<string, React.CSSProperties> = {
  default: { backgroundColor: 'transparent' },
  subtle: { backgroundColor: colors.bg.neutral.min },
  highlighted: { backgroundColor: colors.bg.positive.subtle },
};

export const ListItemRow: React.FC<ListItemRowProps> = ({
  icon,
  iconColor,
  children,
  trailing,
  variant = 'default',
  compact = false,
  onClick,
  style,
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: compact
      ? `${spaceAround.nudge4}px ${spaceAround.tight}px`
      : `${spaceAround.tight}px ${spaceAround.compact}px`,
    borderRadius: borderRadius.sm,
    transition: `all ${transitions.fast}`,
    cursor: onClick ? 'pointer' : undefined,
    ...variantStyles[variant],
    ...style,
  };

  const contentStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    minWidth: 0,
    flex: 1,
  };

  const trailingStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    flexShrink: 0,
  };

  return (
    <div style={containerStyle} onClick={onClick}>
      <div style={contentStyle}>
        {icon && (
          <span style={{ display: 'flex', color: iconColor || colors.fg.neutral.spotReadable, flexShrink: 0 }}>
            {icon}
          </span>
        )}
        {children}
      </div>
      {trailing && <div style={trailingStyle}>{trailing}</div>}
    </div>
  );
};

ListItemRow.displayName = 'ListItemRow';
