/**
 * PatientIdentityHeader Component
 *
 * Patient identity display for the floating nav row.
 * Shows name, MRN, DOB, and shortcuts menu.
 *
 * Variants:
 * - stacked: Name on top, details below (for overview zone when pane open)
 * - inline: Name + details side-by-side (for canvas zone when pane collapsed)
 */

import React, { useState } from 'react';
import { MoreHorizontal, ExternalLink, Copy, FileText } from 'lucide-react';
import { colors, borderRadius, spaceAround, spaceBetween, typography, transitions, shadows } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface PatientIdentityHeaderProps {
  /** Patient display name */
  name: string;
  /** Medical Record Number */
  mrn: string;
  /** Date of birth */
  dob: string;
  /** Age in years */
  age: number;
  /** Gender */
  gender: string;
  /** Pronouns (optional) */
  pronouns?: string;
  /** Called when patient name is clicked */
  onPatientClick?: () => void;
  /** Called when MRN is copied */
  onCopyMrn?: () => void;
  /** Called when "Open full chart" is clicked */
  onOpenFullChart?: () => void;
  /** Layout variant: stacked (vertical) or inline (horizontal) */
  variant?: 'stacked' | 'inline';
  /** Whether to show the kebab menu button (default true) */
  showMenuButton?: boolean;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const PatientIdentityHeader: React.FC<PatientIdentityHeaderProps> = ({
  name,
  mrn,
  dob,
  age,
  gender,
  pronouns,
  onPatientClick,
  onCopyMrn,
  onOpenFullChart,
  variant = 'stacked',
  showMenuButton = true,
  style,
  testID,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

  const isStacked = variant === 'stacked';

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: isStacked ? 'flex-start' : 'center',
    gap: spaceBetween.relatedCompact,
    padding: 0,
    backgroundColor: 'transparent',
    ...style,
  };

  const infoContainerStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: isStacked ? 'column' : 'row',
    alignItems: isStacked ? 'flex-start' : 'center',
    gap: isStacked ? spaceBetween.coupled : spaceBetween.relatedCompact,
    minWidth: 0,
  };

  const nameStyle: React.CSSProperties = {
    fontSize: isStacked ? 15 : 14,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.primary,
    cursor: onPatientClick ? 'pointer' : 'default',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const metaStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spaceBetween.coupled,
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
  };

  const menuButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: borderRadius.sm,
    cursor: 'pointer',
    color: colors.fg.neutral.secondary,
    transition: `all ${transitions.fast}`,
    flexShrink: 0,
  };

  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    ...menuPosition,
    backgroundColor: colors.bg.neutral.base,
    borderRadius: borderRadius.sm,
    boxShadow: shadows.lg,
    border: `1px solid ${colors.border.neutral.low}`,
    minWidth: 160,
    zIndex: 1000,
    overflow: 'hidden',
  };

  const menuItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    transition: `background-color ${transitions.fast}`,
  };

  const handleMenuButtonClick = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    });
    setShowMenu(!showMenu);
  };

  const handleMenuItemClick = (action: () => void) => {
    action();
    setShowMenu(false);
  };

  return (
    <div style={containerStyle} data-testid={testID}>
      <div style={infoContainerStyle}>
        <div
          style={nameStyle}
          onClick={onPatientClick}
          role={onPatientClick ? 'button' : undefined}
          tabIndex={onPatientClick ? 0 : undefined}
        >
          {name}
        </div>
        <div style={metaStyle}>
          <span>{age}y {gender}</span>
          <span>&middot;</span>
          <span>MRN: {mrn}</span>
          {pronouns && (
            <>
              <span>&middot;</span>
              <span>{pronouns}</span>
            </>
          )}
        </div>
      </div>

      {showMenuButton && (
        <button
          type="button"
          style={menuButtonStyle}
          onClick={handleMenuButtonClick}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.bg.neutral.subtle;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          aria-label="Patient shortcuts"
          aria-haspopup="true"
          aria-expanded={showMenu}
        >
          <MoreHorizontal size={18} />
        </button>
      )}

      {showMenuButton && showMenu && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
            onClick={() => setShowMenu(false)}
          />
          <div style={menuStyle} role="menu">
            <button
              type="button"
              style={menuItemStyle}
              onClick={() => handleMenuItemClick(() => onCopyMrn?.())}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.bg.neutral.subtle;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              role="menuitem"
            >
              <Copy size={14} />
              Copy MRN
            </button>
            <button
              type="button"
              style={menuItemStyle}
              onClick={() => handleMenuItemClick(() => onOpenFullChart?.())}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.bg.neutral.subtle;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              role="menuitem"
            >
              <ExternalLink size={14} />
              Open Full Chart
            </button>
            <button
              type="button"
              style={menuItemStyle}
              onClick={() => handleMenuItemClick(() => {})}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.bg.neutral.subtle;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              role="menuitem"
            >
              <FileText size={14} />
              View Demographics
            </button>
          </div>
        </>
      )}
    </div>
  );
};

PatientIdentityHeader.displayName = 'PatientIdentityHeader';
