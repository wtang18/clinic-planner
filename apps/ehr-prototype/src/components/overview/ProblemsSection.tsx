/**
 * ProblemsSection Component
 *
 * Displays active problems/conditions in the overview pane.
 */

import React from 'react';
import { Activity } from 'lucide-react';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../../styles/foundations';
import { OverviewSection } from '../layout/OverviewSection';

// ============================================================================
// Types
// ============================================================================

export interface Problem {
  id: string;
  name: string;
  icdCode?: string;
  status: 'active' | 'resolved' | 'inactive';
  onsetDate?: string;
  isPrimary?: boolean;
}

export interface ProblemsSectionProps {
  /** List of problems */
  problems: Problem[];
  /** Initial collapsed state */
  defaultCollapsed?: boolean;
  /** Maximum items to show before "Show more" */
  maxItems?: number;
  /** Called when a problem is clicked */
  onProblemClick?: (problemId: string) => void;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const ProblemsSection: React.FC<ProblemsSectionProps> = ({
  problems,
  defaultCollapsed = false,
  maxItems = 5,
  onProblemClick,
  style,
  testID,
}) => {
  const [showAll, setShowAll] = React.useState(false);

  const activeProblems = problems.filter((p) => p.status === 'active');
  // Sort with primary problems first
  const sortedProblems = [...activeProblems].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return 0;
  });
  const displayProblems = showAll ? sortedProblems : sortedProblems.slice(0, maxItems);
  const hasMore = sortedProblems.length > maxItems;

  // Collapsed summary — omitted when it would just restate the inline count
  const collapsedSummary = undefined;

  const listStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.repeating,
    paddingTop: spaceAround.compact,
  };

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.tight}px`,
    backgroundColor: colors.bg.neutral.min,
    borderRadius: borderRadius.xs,
    cursor: onProblemClick ? 'pointer' : 'default',
  };

  const primaryBadgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: `${spaceAround.nudge2}px ${spaceAround.nudge6}px`,
    backgroundColor: colors.bg.accent.subtle,
    color: colors.fg.accent.primary,
    borderRadius: borderRadius.xs,
    fontSize: 10,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  };

  const showMoreStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${spaceAround.tight}px`,
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.accent.primary,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderRadius: borderRadius.xs,
  };

  return (
    <OverviewSection
      title="Problems"
      count={activeProblems.length}
      collapsedSummary={collapsedSummary}
      icon={<Activity size={16} />}
      defaultCollapsed={defaultCollapsed}
      style={style}
      testID={testID}
    >
      {activeProblems.length === 0 ? (
        <div
          style={{
            padding: `${spaceAround.compact}px 0`,
            fontSize: 13,
            fontFamily: typography.fontFamily.sans,
            color: colors.fg.neutral.spotReadable,
          }}
        >
          No active problems
        </div>
      ) : (
        <div style={listStyle}>
          {displayProblems.map((problem) => (
            <div
              key={problem.id}
              style={itemStyle}
              onClick={() => onProblemClick?.(problem.id)}
              role={onProblemClick ? 'button' : undefined}
              tabIndex={onProblemClick ? 0 : undefined}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spaceBetween.relatedCompact,
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      lineHeight: '20px',
                      letterSpacing: -0.5,
                      fontFamily: typography.fontFamily.sans,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.fg.neutral.primary,
                    }}
                  >
                    {problem.name}
                  </span>
                  {problem.isPrimary && (
                    <span style={primaryBadgeStyle}>Primary</span>
                  )}
                </div>
                {(problem.icdCode || problem.onsetDate) && (
                  <div
                    style={{
                      fontSize: 12,
                      fontFamily: typography.fontFamily.sans,
                      color: colors.fg.neutral.secondary,
                      marginTop: spaceBetween.coupled,
                    }}
                  >
                    {[problem.icdCode, problem.onsetDate && `Since ${problem.onsetDate}`]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                )}
              </div>
            </div>
          ))}

          {hasMore && (
            <button
              type="button"
              style={showMoreStyle}
              onClick={() => setShowAll(!showAll)}
            >
              {showAll
                ? 'Show less'
                : `Show ${sortedProblems.length - maxItems} more`}
            </button>
          )}
        </div>
      )}
    </OverviewSection>
  );
};

ProblemsSection.displayName = 'ProblemsSection';
