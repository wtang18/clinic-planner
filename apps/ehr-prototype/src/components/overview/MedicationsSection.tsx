/**
 * MedicationsSection Component
 *
 * Displays active medications in the overview pane.
 */

import React from 'react';
import { Pill } from 'lucide-react';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../../styles/foundations';
import { OverviewSection } from '../layout/OverviewSection';

// ============================================================================
// Types
// ============================================================================

export interface Medication {
  id: string;
  name: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  status: 'active' | 'on-hold' | 'discontinued';
  prescriber?: string;
  startDate?: string;
}

export interface MedicationsSectionProps {
  /** List of medications */
  medications: Medication[];
  /** Initial collapsed state */
  defaultCollapsed?: boolean;
  /** Maximum items to show before "Show more" */
  maxItems?: number;
  /** Called when a medication is clicked */
  onMedicationClick?: (medicationId: string) => void;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const MedicationsSection: React.FC<MedicationsSectionProps> = ({
  medications,
  defaultCollapsed = false,
  maxItems = 5,
  onMedicationClick,
  style,
  testID,
}) => {
  const [showAll, setShowAll] = React.useState(false);

  const activeMedications = medications.filter((m) => m.status === 'active');
  const displayMedications = showAll
    ? activeMedications
    : activeMedications.slice(0, maxItems);
  const hasMore = activeMedications.length > maxItems;

  // Generate collapsed summary
  const collapsedSummary =
    activeMedications.length > 0 ? `${activeMedications.length} active` : undefined;

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
    padding: `${spaceAround.tight}px`,
    backgroundColor: colors.bg.neutral.subtle,
    borderRadius: borderRadius.xs,
    cursor: onMedicationClick ? 'pointer' : 'default',
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
      title="Medications"
      count={activeMedications.length}
      collapsedSummary={collapsedSummary}
      icon={<Pill size={16} />}
      defaultCollapsed={defaultCollapsed}
      style={style}
      testID={testID}
    >
      {activeMedications.length === 0 ? (
        <div
          style={{
            padding: `${spaceAround.compact}px 0`,
            fontSize: 13,
            fontFamily: typography.fontFamily.sans,
            color: colors.fg.neutral.spotReadable,
          }}
        >
          No active medications
        </div>
      ) : (
        <div style={listStyle}>
          {displayMedications.map((med) => (
            <div
              key={med.id}
              style={itemStyle}
              onClick={() => onMedicationClick?.(med.id)}
              role={onMedicationClick ? 'button' : undefined}
              tabIndex={onMedicationClick ? 0 : undefined}
            >
              <div
                style={{
                  fontSize: 14,
                  fontFamily: typography.fontFamily.sans,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.fg.neutral.primary,
                }}
              >
                {med.name}
              </div>
              {(med.dosage || med.frequency) && (
                <div
                  style={{
                    fontSize: 12,
                    fontFamily: typography.fontFamily.sans,
                    color: colors.fg.neutral.secondary,
                  }}
                >
                  {[med.dosage, med.frequency, med.route].filter(Boolean).join(' · ')}
                </div>
              )}
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
                : `Show ${activeMedications.length - maxItems} more`}
            </button>
          )}
        </div>
      )}
    </OverviewSection>
  );
};

MedicationsSection.displayName = 'MedicationsSection';
