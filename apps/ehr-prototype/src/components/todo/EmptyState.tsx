/**
 * EmptyState Component
 *
 * Empty state display for To-Do lists when no items match filters.
 */

import React from 'react';
import {
  CheckCircle2,
  Inbox,
  MessageSquare,
  Heart,
  Search,
} from 'lucide-react';
import { colors, spaceAround, typography } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface EmptyStateProps {
  /** Category ID for contextual messaging */
  categoryId: string;
  /** Filter ID for contextual messaging */
  filterId: string;
  /** Whether a search query is active */
  hasSearch?: boolean;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getEmptyMessage(categoryId: string, filterId: string, hasSearch: boolean): {
  icon: React.ReactNode;
  title: string;
  description: string;
} {
  if (hasSearch) {
    return {
      icon: <Search size={48} color={colors.fg.neutral.softer} />,
      title: 'No matches found',
      description: 'Try adjusting your search or filters.',
    };
  }

  // "All caught up" messages for personal filters
  if (filterId === 'my-pending') {
    const icons: Record<string, React.ReactNode> = {
      tasks: <CheckCircle2 size={48} color={colors.fg.positive.primary} />,
      messages: <MessageSquare size={48} color={colors.fg.positive.primary} />,
      care: <Heart size={48} color={colors.fg.positive.primary} />,
    };

    return {
      icon: icons[categoryId] || <CheckCircle2 size={48} color={colors.fg.positive.primary} />,
      title: 'All caught up!',
      description: `You have no pending ${categoryId} to review.`,
    };
  }

  // Empty inbox messages
  if (categoryId === 'inbox') {
    if (filterId === 'unsorted') {
      return {
        icon: <Inbox size={48} color={colors.fg.positive.primary} />,
        title: 'Inbox is clear!',
        description: 'All faxes have been sorted.',
      };
    }
    return {
      icon: <Inbox size={48} color={colors.fg.neutral.softer} />,
      title: 'No faxes',
      description: 'No faxes match your current filters.',
    };
  }

  // Generic empty state
  const categoryLabels: Record<string, string> = {
    tasks: 'tasks',
    inbox: 'items',
    messages: 'messages',
    care: 'care items',
  };

  return {
    icon: <CheckCircle2 size={48} color={colors.fg.neutral.softer} />,
    title: 'No items',
    description: `No ${categoryLabels[categoryId] ?? 'items'} match your current filters.`,
  };
}

// ============================================================================
// Component
// ============================================================================

export const EmptyState: React.FC<EmptyStateProps> = ({
  categoryId,
  filterId,
  hasSearch = false,
  style,
  testID,
}) => {
  const { icon, title, description } = getEmptyMessage(categoryId, filterId, hasSearch);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spaceAround.spacious,
    textAlign: 'center',
    ...style,
  };

  const iconContainerStyle: React.CSSProperties = {
    marginBottom: spaceAround.default,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 600,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
    marginBottom: spaceAround.tight,
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    maxWidth: 280,
  };

  return (
    <div style={containerStyle} data-testid={testID}>
      <div style={iconContainerStyle}>{icon}</div>
      <div style={titleStyle}>{title}</div>
      <div style={descriptionStyle}>{description}</div>
    </div>
  );
};

EmptyState.displayName = 'EmptyState';
