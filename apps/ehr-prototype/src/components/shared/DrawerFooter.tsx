/**
 * DrawerFooter Layout Component
 *
 * Enforces consistent footer button placement for SlideDrawer:
 * [link left] ··· [kebab] [secondary] [primary]
 *
 * The kebab button opens a simple dropdown menu above it.
 * Primary uses accent fill; secondary uses ghost/outlined style.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import { Button } from '../primitives/Button';
import {
  colors,
  typography,
  spaceAround,
  borderRadius,
  transitions,
  glass,
} from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface DrawerFooterAction {
  label: string;
  onClick: () => void;
}

export interface DrawerFooterProps {
  /** Primary action button (accent fill, right-most) */
  primary?: { label: string; onClick: () => void; disabled?: boolean };
  /** Secondary action button (ghost style, left of primary) */
  secondary?: { label: string; onClick: () => void };
  /** Kebab menu items (opens dropdown above the "..." button) */
  moreActions?: DrawerFooterAction[];
  /** Link-style button (left-aligned, text only) */
  link?: { label: string; onClick: () => void };
}

// ============================================================================
// Component
// ============================================================================

export const DrawerFooter: React.FC<DrawerFooterProps> = ({
  primary,
  secondary,
  moreActions,
  link,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const kebabRef = useRef<HTMLButtonElement>(null);

  // Close menu on click outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        kebabRef.current && !kebabRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const handleMenuItemClick = useCallback((action: DrawerFooterAction) => {
    setMenuOpen(false);
    action.onClick();
  }, []);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    gap: 8,
  };

  const spacerStyle: React.CSSProperties = {
    flex: 1,
  };

  const linkStyle: React.CSSProperties = {
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.accent.primary,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    whiteSpace: 'nowrap',
  };

  const kebabStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    cursor: 'pointer',
    color: colors.fg.neutral.secondary,
    flexShrink: 0,
    transition: `background-color ${transitions.fast}`,
    ...glass.button,
  };

  const menuStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '100%',
    right: 0,
    marginBottom: 4,
    minWidth: 200,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...glass.floatingPanel,
    zIndex: 10,
  };

  const menuItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: `background-color ${transitions.fast}`,
  };

  return (
    <div style={containerStyle}>
      {/* Link (left-aligned) */}
      {link && (
        <button type="button" style={linkStyle} onClick={link.onClick}>
          {link.label}
        </button>
      )}

      {/* Spacer */}
      <div style={spacerStyle} />

      {/* Kebab menu */}
      {moreActions && moreActions.length > 0 && (
        <div style={{ position: 'relative' }}>
          <button
            ref={kebabRef}
            type="button"
            style={kebabStyle}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="More actions"
          >
            <MoreVertical size={18} />
          </button>
          {menuOpen && (
            <div ref={menuRef} style={menuStyle}>
              {moreActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  style={menuItemStyle}
                  onClick={() => handleMenuItemClick(action)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(0,0,0,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Secondary button */}
      {secondary && (
        <Button variant="secondary" size="sm" onClick={secondary.onClick}>
          {secondary.label}
        </Button>
      )}

      {/* Primary button */}
      {primary && (
        <Button
          variant="primary"
          size="sm"
          onClick={primary.onClick}
          disabled={primary.disabled}
        >
          {primary.label}
        </Button>
      )}
    </div>
  );
};

DrawerFooter.displayName = 'DrawerFooter';
