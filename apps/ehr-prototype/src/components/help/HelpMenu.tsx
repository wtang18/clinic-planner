/**
 * HelpMenu Component
 *
 * Small popover appearing above the help hub button.
 * Lists help options: Keyboard Shortcuts (functional), placeholders for future items.
 */

import React, { useEffect, useRef } from 'react';
import { Keyboard, BookOpen, HelpCircle } from 'lucide-react';
import { colors, spaceAround, borderRadius, glass, transitions, LAYOUT, GLASS_BUTTON_HEIGHT } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

interface HelpMenuProps {
  onToggleLegend: () => void;
  onClose: () => void;
}

// ============================================================================
// Component
// ============================================================================

export const HelpMenu: React.FC<HelpMenuProps> = ({ onToggleLegend, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay to avoid catching the click that opened the menu
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handler);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handler);
    };
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [onClose]);

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: `calc(${LAYOUT.floatingInset + GLASS_BUTTON_HEIGHT + 8}px + var(--legend-panel-height, 0px))`,
    right: LAYOUT.floatingInset,
    width: 220,
    ...glass.floatingPanel,
    borderRadius: borderRadius.md,
    padding: `${spaceAround.nudge6}px 0`,
    zIndex: 251, // Above the button
  };

  return (
    <div ref={ref} style={containerStyle} data-testid="help-menu">
      <MenuItem
        icon={<Keyboard size={16} />}
        label="Keyboard Shortcuts"
        onClick={() => {
          onToggleLegend();
          onClose();
        }}
      />
      <MenuItem
        icon={<BookOpen size={16} />}
        label="How do I...?"
        disabled
      />
      <MenuItem
        icon={<HelpCircle size={16} />}
        label="FAQ"
        disabled
      />
    </div>
  );
};

HelpMenu.displayName = 'HelpMenu';

// ============================================================================
// MenuItem
// ============================================================================

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onClick, disabled }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const style: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceAround.compact,
    width: '100%',
    padding: `${spaceAround.tight}px ${spaceAround.default}px`,
    border: 'none',
    backgroundColor: isHovered && !disabled ? colors.bg.neutral.subtle : 'transparent',
    color: disabled ? colors.fg.neutral.spotReadable : colors.fg.neutral.primary,
    fontSize: 13,
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: `background-color ${transitions.fast}`,
    textAlign: 'left',
  };

  return (
    <button
      type="button"
      style={style}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled}
    >
      {icon}
      {label}
    </button>
  );
};
