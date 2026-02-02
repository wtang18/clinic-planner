/**
 * AIDrawerContent Component
 *
 * Placeholder content for the AI drawer.
 * Will be replaced with actual AI suggestions, item details, or context panels.
 */

import React from 'react';
import { Sparkles, Lightbulb, MessageSquare, FileText } from 'lucide-react';
import { colors, borderRadius, spaceAround, spaceBetween, typography, transitions } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export type AIDrawerMode = 'suggestions' | 'details' | 'assistant' | 'context';

export interface AIDrawerContentProps {
  /** Current drawer mode */
  mode?: AIDrawerMode;
  /** Title override */
  title?: string;
  /** Custom content */
  children?: React.ReactNode;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const AIDrawerContent: React.FC<AIDrawerContentProps> = ({
  mode = 'suggestions',
  title,
  children,
  style,
  testID,
}) => {
  const getTitle = () => {
    if (title) return title;
    switch (mode) {
      case 'suggestions':
        return 'AI Suggestions';
      case 'details':
        return 'Item Details';
      case 'assistant':
        return 'AI Assistant';
      case 'context':
        return 'Context';
      default:
        return 'AI Assistant';
    }
  };

  const getIcon = () => {
    switch (mode) {
      case 'suggestions':
        return <Lightbulb size={20} />;
      case 'details':
        return <FileText size={20} />;
      case 'assistant':
        return <MessageSquare size={20} />;
      case 'context':
        return <Sparkles size={20} />;
      default:
        return <Sparkles size={20} />;
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: spaceAround.default,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
    flexShrink: 0,
  };

  const iconContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    backgroundColor: colors.bg.accent.subtle,
    borderRadius: borderRadius.sm,
    color: colors.fg.accent.primary,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 16,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.primary,
    flex: 1,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: spaceAround.default,
  };

  const placeholderStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: spaceAround.spacious,
    textAlign: 'center',
  };

  const placeholderIconStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
    backgroundColor: colors.bg.neutral.subtle,
    borderRadius: borderRadius.md,
    color: colors.fg.neutral.spotReadable,
    marginBottom: spaceAround.default,
  };

  const placeholderTextStyle: React.CSSProperties = {
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    lineHeight: 1.5,
  };

  return (
    <div style={containerStyle} data-testid={testID}>
      <header style={headerStyle}>
        <span style={iconContainerStyle}>{getIcon()}</span>
        <h2 style={titleStyle}>{getTitle()}</h2>
      </header>

      <div style={contentStyle}>
        {children || (
          <div style={placeholderStyle}>
            <div style={placeholderIconStyle}>
              <Sparkles size={32} />
            </div>
            <p style={placeholderTextStyle}>
              AI suggestions, item details, and context information will appear here as you work through the encounter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

AIDrawerContent.displayName = 'AIDrawerContent';
