/**
 * PaneContent Component
 *
 * Content switcher that renders the appropriate view based on activeView.
 * Menu view renders the existing MenuPane, AI and Transcript views are placeholders
 * for chunks 8.3 and 8.5.
 */

import React from 'react';
import { Sparkles, Mic } from 'lucide-react';
import { MenuPane } from '../layout/MenuPane';
import type { MenuPaneProps } from '../layout/MenuPane';
import { colors, spaceAround, typography } from '../../styles/foundations';
import type { PaneView } from '../../state/leftPane';

// ============================================================================
// Types
// ============================================================================

export interface PaneContentProps {
  /** Active view to render */
  activeView: PaneView;
  /** Props to pass through to MenuPane */
  menuPaneProps?: Omit<MenuPaneProps, 'style'>;
}

// ============================================================================
// Placeholder Components
// ============================================================================

interface PlaceholderViewProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({
  icon,
  title,
  description,
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: spaceAround.default,
    textAlign: 'center',
  };

  const iconContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.bg.accent.subtle,
    color: colors.fg.accent.primary,
    marginBottom: spaceAround.compact,
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: typography.fontFamily.sans,
    fontSize: 16,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 1.5,
    color: colors.fg.neutral.primary,
    marginBottom: 4,
  };

  const descriptionStyle: React.CSSProperties = {
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontWeight: typography.fontWeight.regular,
    lineHeight: 1.5,
    color: colors.fg.neutral.secondary,
  };

  return (
    <div style={containerStyle}>
      <div style={iconContainerStyle}>{icon}</div>
      <div style={titleStyle}>{title}</div>
      <div style={descriptionStyle}>{description}</div>
    </div>
  );
};

const AIDrawerPlaceholder: React.FC = () => (
  <PlaceholderView
    icon={<Sparkles size={24} />}
    title="AI Drawer"
    description="Coming in Chunk 8.3"
  />
);

const TranscriptDrawerPlaceholder: React.FC = () => (
  <PlaceholderView
    icon={<Mic size={24} />}
    title="Transcript Drawer"
    description="Coming in Chunk 8.5"
  />
);

// ============================================================================
// Component
// ============================================================================

export const PaneContent: React.FC<PaneContentProps> = ({
  activeView,
  menuPaneProps,
}) => {
  const containerStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  const renderContent = () => {
    switch (activeView) {
      case 'menu':
        return <MenuPane {...menuPaneProps} style={{ flex: 1 }} />;
      case 'ai':
        return <AIDrawerPlaceholder />;
      case 'transcript':
        return <TranscriptDrawerPlaceholder />;
      default:
        return null;
    }
  };

  return <div style={containerStyle}>{renderContent()}</div>;
};

PaneContent.displayName = 'PaneContent';
