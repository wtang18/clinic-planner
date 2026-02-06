/**
 * AppShell Component
 *
 * Main application layout shell.
 */

import React from 'react';
import { colors, spaceAround, zIndex, transitions, typography } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface AppShellProps {
  /** Header content */
  header: React.ReactNode;
  /** Optional sidebar content */
  sidebar?: React.ReactNode;
  /** Main content area */
  main: React.ReactNode;
  /** Optional footer content */
  footer?: React.ReactNode;
  /** Optional minibar (AI status bar) - legacy, prefer bottomBar */
  minibar?: React.ReactNode;
  /** Optional bottom bar (new system) - renders BottomBarContainer internally */
  bottomBar?: React.ReactNode;
  /** Sidebar width */
  sidebarWidth?: string;
  /** Whether sidebar is collapsible */
  sidebarCollapsible?: boolean;
  /** Whether sidebar is collapsed */
  sidebarCollapsed?: boolean;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID for E2E testing */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const AppShell: React.FC<AppShellProps> = ({
  header,
  sidebar,
  main,
  footer,
  minibar,
  bottomBar,
  sidebarWidth = '280px',
  sidebarCollapsible = false,
  sidebarCollapsed = false,
  style,
  testID,
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100%',
    backgroundColor: colors.bg.neutral.min,
    overflow: 'hidden',
    fontFamily: typography.fontFamily.sans,
    ...style,
  };

  const headerContainerStyle: React.CSSProperties = {
    flexShrink: 0,
    zIndex: zIndex.sticky,
    position: 'sticky',
    top: 0,
  };

  const bodyStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  };

  const sidebarStyle: React.CSSProperties = {
    flexShrink: 0,
    width: sidebarCollapsed ? '64px' : sidebarWidth,
    backgroundColor: colors.bg.neutral.base,
    borderRight: `1px solid ${colors.border.neutral.low}`,
    overflowY: 'auto',
    transition: `width ${transitions.base}`,
  };

  const mainContainerStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const mainContentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: spaceAround.default,
  };

  const footerContainerStyle: React.CSSProperties = {
    flexShrink: 0,
    borderTop: `1px solid ${colors.border.neutral.low}`,
    backgroundColor: colors.bg.neutral.base,
  };

  const minibarContainerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: spaceAround.default,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: zIndex.docked,
    maxWidth: '600px',
    width: 'calc(100% - 32px)',
  };

  return (
    <div style={containerStyle} data-testid={testID}>
      <div style={headerContainerStyle}>
        {header}
      </div>

      <div style={bodyStyle}>
        {sidebar && (
          <aside style={sidebarStyle}>
            {sidebar}
          </aside>
        )}

        <div style={mainContainerStyle}>
          <main style={mainContentStyle}>
            {main}
          </main>

          {footer && (
            <div style={footerContainerStyle}>
              {footer}
            </div>
          )}
        </div>
      </div>

      {/* Legacy minibar (centered at bottom) */}
      {minibar && !bottomBar && (
        <div style={minibarContainerStyle}>
          {minibar}
        </div>
      )}

      {/* New bottom bar system (self-positioned) */}
      {bottomBar}
    </div>
  );
};

AppShell.displayName = 'AppShell';
