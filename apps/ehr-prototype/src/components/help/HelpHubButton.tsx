/**
 * HelpHubButton Component
 *
 * 44px glassy circle fixed to bottom-right. Click opens HelpMenu popover.
 * When the legend panel is open, shows X icon to close it.
 */

import React, { useState, useCallback } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { colors, glass, transitions, zIndex as zIndexTokens, GLASS_BUTTON_HEIGHT, GLASS_BUTTON_RADIUS, LAYOUT } from '../../styles/foundations';
import { HelpMenu } from './HelpMenu';

// ============================================================================
// Types
// ============================================================================

interface HelpHubButtonProps {
  /** Whether the legend panel is currently open */
  isLegendOpen: boolean;
  /** Toggle the legend panel */
  onToggleLegend: () => void;
}

// ============================================================================
// Component
// ============================================================================

export const HelpHubButton: React.FC<HelpHubButtonProps> = ({
  isLegendOpen,
  onToggleLegend,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(() => {
    if (isLegendOpen) {
      // Close legend
      onToggleLegend();
    } else {
      // Toggle menu
      setIsMenuOpen((prev) => !prev);
    }
  }, [isLegendOpen, onToggleLegend]);

  const handleCloseMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const buttonStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: `calc(${LAYOUT.floatingInset}px + var(--legend-panel-height, 0px))`,
    right: LAYOUT.floatingInset,
    width: GLASS_BUTTON_HEIGHT,
    height: GLASS_BUTTON_HEIGHT,
    borderRadius: GLASS_BUTTON_RADIUS,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: zIndexTokens.popover,
    backgroundColor: isHovered ? glass.buttonHover.backgroundColor : glass.button.backgroundColor,
    backdropFilter: glass.button.backdropFilter,
    WebkitBackdropFilter: glass.button.WebkitBackdropFilter,
    border: isHovered ? glass.buttonHover.border : glass.button.border,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    transition: `background-color ${transitions.fast}, border ${transitions.fast}, bottom 200ms ease`,
  };

  const iconColor = colors.fg.neutral.secondary;
  const Icon = isLegendOpen ? X : HelpCircle;

  return (
    <>
      <button
        type="button"
        style={buttonStyle}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={isLegendOpen ? 'Close keyboard shortcuts' : 'Help'}
        data-testid="help-hub-button"
      >
        <Icon size={20} color={iconColor} />
      </button>

      {isMenuOpen && !isLegendOpen && (
        <HelpMenu
          onToggleLegend={() => {
            onToggleLegend();
            handleCloseMenu();
          }}
          onClose={handleCloseMenu}
        />
      )}
    </>
  );
};

HelpHubButton.displayName = 'HelpHubButton';
