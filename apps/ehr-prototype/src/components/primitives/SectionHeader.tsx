/**
 * SectionHeader Component
 *
 * Shared section header used across Process and Review views.
 * Pure text header with title, count, optional status icon, and trailing actions.
 * No background bar — just text with a subtle bottom border.
 *
 * Replaces: CollapsibleGroup headers in BatchSection/DraftSection
 *           and ReviewSectionHeader in ReviewView.
 */

import React from 'react';
import { Plus } from 'lucide-react';
import { colors, spaceAround, spaceBetween, typography } from '../../styles/foundations';
import { IconButton } from './IconButton';

// ============================================================================
// Types
// ============================================================================

export interface SectionHeaderProps {
  /** Section title */
  title: string;
  /** Count text (e.g. "3 items", "Not documented") */
  count?: string;
  /** Optional status icon rendered before the title */
  statusIcon?: React.ReactNode;
  /** Optional trailing content (e.g. sparkles icon for AI Drafts) */
  trailing?: React.ReactNode;
  /** Called when "+" button is clicked */
  onAdd?: () => void;
  /** Add button label for accessibility */
  addLabel?: string;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  count,
  statusIcon,
  trailing,
  onAdd,
  addLabel,
  style,
  testID,
}) => {
  return (
    <div style={{ ...styles.container, ...style }} data-testid={testID}>
      <div style={styles.left}>
        {statusIcon && (
          <span style={styles.statusIcon}>{statusIcon}</span>
        )}
        <span style={styles.title}>{title}</span>
        {count && (
          <span style={styles.count}>{count}</span>
        )}
      </div>
      <div style={styles.right}>
        {trailing}
        {onAdd && (
          <IconButton
            icon={<Plus size={14} />}
            label={addLabel || `Add ${title}`}
            variant="ghost"
            size="sm"
            onClick={onAdd}
            data-testid={testID ? `${testID}-add` : undefined}
          />
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spaceAround.tight}px 0`,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
  },
  statusIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 18,
    height: 18,
  },
  title: {
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
  },
  count: {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.spotReadable,
  },
};

SectionHeader.displayName = 'SectionHeader';
