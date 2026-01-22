/**
 * AppShell Component
 *
 * Main application layout shell.
 */

import React from 'react';
import { colors, spacing, zIndex } from '../../styles/tokens';

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
  /** Optional minibar (AI status bar) */
  minibar?: React.ReactNode;
  /** Sidebar width */
  sidebarWidth?: string;
  /** Whether sidebar is collapsible */
  sidebarCollapsible?: boolean;
  /** Whether sidebar is collapsed */
  sidebarCollapsed?: boolean;
  /** Custom styles */
  style?: React.CSSProperties;
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
  sidebarWidth = '280px',
  sidebarCollapsible = false,
  sidebarCollapsed = false,
  style,
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100%',
    backgroundColor: colors.neutral[50],
    overflow: 'hidden',
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
    backgroundColor: colors.neutral[0],
    borderRight: `1px solid ${colors.neutral[200]}`,
    overflowY: 'auto',
    transition: 'width 0.2s ease',
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
    padding: spacing[4],
  };

  const footerContainerStyle: React.CSSProperties = {
    flexShrink: 0,
    borderTop: `1px solid ${colors.neutral[200]}`,
    backgroundColor: colors.neutral[0],
  };

  const minibarContainerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: spacing[4],
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: zIndex.docked,
    maxWidth: '600px',
    width: 'calc(100% - 32px)',
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerContainerStyle}>
        {header}
      </div>

      {/* Body: Sidebar + Main */}
      <div style={bodyStyle}>
        {/* Sidebar */}
        {sidebar && (
          <aside style={sidebarStyle}>
            {sidebar}
          </aside>
        )}

        {/* Main content area */}
        <div style={mainContainerStyle}>
          <main style={mainContentStyle}>
            {main}
          </main>

          {/* Footer */}
          {footer && (
            <div style={footerContainerStyle}>
              {footer}
            </div>
          )}
        </div>
      </div>

      {/* Minibar (fixed position) */}
      {minibar && (
        <div style={minibarContainerStyle}>
          {minibar}
        </div>
      )}
    </div>
  );
};

AppShell.displayName = 'AppShell';
