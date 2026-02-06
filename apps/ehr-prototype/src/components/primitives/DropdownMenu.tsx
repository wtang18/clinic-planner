/**
 * DropdownMenu Component
 *
 * Positioned overlay menu for selection lists and action menus.
 */

import React from 'react';
import { colors, spaceAround, spaceBetween, borderRadius, transitions } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface DropdownMenuItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface DropdownMenuProps {
  /** Whether the menu is open */
  isOpen: boolean;
  /** Items to display in the menu */
  items: DropdownMenuItem[];
  /** Called when an item is clicked */
  onItemClick: (value: string) => void;
  /** Position relative to the trigger element */
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  /** Minimum width of the menu */
  minWidth?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Component
// ============================================================================

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  isOpen,
  items,
  onItemClick,
  position = 'bottom-right',
  minWidth = '200px',
  style,
}) => {
  if (!isOpen) return null;

  const positionStyles: Record<string, React.CSSProperties> = {
    'bottom-left': { top: '100%', left: 0 },
    'bottom-right': { top: '100%', right: 0 },
    'top-left': { bottom: '100%', left: 0 },
    'top-right': { bottom: '100%', right: 0 },
  };

  const menuStyle: React.CSSProperties = {
    position: 'absolute',
    ...positionStyles[position],
    marginTop: position.startsWith('bottom') ? spaceAround.nudge4 : undefined,
    marginBottom: position.startsWith('top') ? spaceAround.nudge4 : undefined,
    backgroundColor: colors.bg.neutral.base,
    border: `1px solid ${colors.border.neutral.low}`,
    borderRadius: borderRadius.sm,
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    zIndex: 10,
    minWidth,
    overflow: 'hidden',
    ...style,
  };

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    fontSize: 14,
    color: colors.fg.neutral.secondary,
    cursor: 'pointer',
    transition: `background-color ${transitions.fast}`,
  };

  const disabledItemStyle: React.CSSProperties = {
    ...itemStyle,
    color: colors.fg.neutral.disabled,
    cursor: 'not-allowed',
  };

  return (
    <div style={menuStyle}>
      {items.map((item) => (
        <div
          key={item.value}
          style={item.disabled ? disabledItemStyle : itemStyle}
          onClick={() => !item.disabled && onItemClick(item.value)}
          onMouseEnter={(e) => {
            if (!item.disabled) {
              (e.currentTarget as HTMLDivElement).style.backgroundColor = colors.bg.neutral.subtle;
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
          }}
        >
          {item.icon && <span style={{ display: 'flex' }}>{item.icon}</span>}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

DropdownMenu.displayName = 'DropdownMenu';
