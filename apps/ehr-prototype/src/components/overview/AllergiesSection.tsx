/**
 * AllergiesSection Component
 *
 * Displays patient allergies in the overview pane.
 * Safety critical - always shows first in overview.
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../../styles/foundations';
import { OverviewSection } from '../layout/OverviewSection';

// ============================================================================
// Types
// ============================================================================

export interface Allergy {
  id: string;
  allergen: string;
  reaction?: string;
  severity: 'mild' | 'moderate' | 'severe';
  verified?: boolean;
}

export interface AllergiesSectionProps {
  /** List of allergies */
  allergies: Allergy[];
  /** Initial collapsed state */
  defaultCollapsed?: boolean;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const AllergiesSection: React.FC<AllergiesSectionProps> = ({
  allergies,
  defaultCollapsed = false,
  style,
  testID,
}) => {
  const severeAllergies = allergies.filter((a) => a.severity === 'severe');
  const hasAlerts = severeAllergies.length > 0;

  // Generate collapsed summary
  const collapsedSummary = hasAlerts
    ? `\u26A0\uFE0F ${severeAllergies[0]?.allergen}${severeAllergies.length > 1 ? ` +${severeAllergies.length - 1}` : ''}`
    : allergies.length > 0
    ? allergies[0]?.allergen
    : undefined;

  const listStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.repeating,
    paddingTop: spaceAround.compact,
  };

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.coupled,
    padding: spaceAround.tight,
    backgroundColor: colors.bg.neutral.min,
    borderRadius: borderRadius.xs,
  };

  const getSeverityColor = (severity: Allergy['severity']) => {
    switch (severity) {
      case 'severe':
        return colors.fg.alert.secondary;
      case 'moderate':
        return colors.fg.attention.secondary;
      default:
        return colors.fg.neutral.secondary;
    }
  };

  const getSeverityBadgeStyle = (severity: Allergy['severity']): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    padding: `${spaceAround.nudge2}px ${spaceAround.nudge6}px`,
    backgroundColor:
      severity === 'severe'
        ? colors.bg.alert.subtle
        : severity === 'moderate'
        ? colors.bg.attention.subtle
        : colors.bg.neutral.subtle,
    color: getSeverityColor(severity),
    borderRadius: borderRadius.xs,
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'capitalize',
  });

  return (
    <OverviewSection
      title="Allergies"
      count={allergies.length}
      collapsedSummary={collapsedSummary}
      hasAlert={hasAlerts}
      icon={<AlertTriangle size={16} />}
      defaultCollapsed={defaultCollapsed}
      style={style}
      testID={testID}
    >
      {allergies.length === 0 ? (
        <div
          style={{
            padding: `${spaceAround.compact}px 0`,
            fontSize: 13,
            fontFamily: typography.fontFamily.sans,
            color: colors.fg.neutral.spotReadable,
          }}
        >
          No known allergies (NKA)
        </div>
      ) : (
        <div style={listStyle}>
          {allergies.map((allergy) => (
            <div key={allergy.id} style={itemStyle}>
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
                  {allergy.allergen}
                </span>
                <span style={getSeverityBadgeStyle(allergy.severity)}>
                  {allergy.severity}
                </span>
              </div>
              {allergy.reaction && (
                <div
                  style={{
                    fontSize: 12,
                    fontFamily: typography.fontFamily.sans,
                    color: colors.fg.neutral.secondary,
                  }}
                >
                  Reaction: {allergy.reaction}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </OverviewSection>
  );
};

AllergiesSection.displayName = 'AllergiesSection';
