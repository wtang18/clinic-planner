/**
 * CohortNavigator Component
 *
 * Tree navigation for cohort groups and individual cohorts.
 * Renders in the left pane (menu) for the population health workspace.
 * Uses existing MenuSection/MenuNavItem patterns.
 */

import React from 'react';
import {
  Users,
  Activity,
  Shield,
  Calendar,
  Syringe,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  ArrowRightLeft,
} from 'lucide-react';
import { usePopHealth } from '../../context/PopHealthContext';
import { COHORT_GROUPS, COHORTS } from '../../data/mock-population-health';
import { MenuSection } from '../layout/MenuSection';
import { MenuNavItem } from '../layout/MenuNavItem';
import { colors, spaceAround, spaceBetween, typography, LAYOUT } from '../../styles/foundations';

// ============================================================================
// Icon Map — cohort icon by ID
// ============================================================================

const COHORT_ICONS: Record<string, React.ReactNode> = {
  'coh-diabetes': <Activity size={16} />,
  'coh-hypertension': <Activity size={16} />,
  'coh-copd': <Activity size={16} />,
  'coh-cancer-screening': <Shield size={16} />,
  'coh-immunization': <Syringe size={16} />,
  'coh-high-risk': <AlertTriangle size={16} />,
  'coh-rising-risk': <TrendingUp size={16} />,
  'coh-stable': <CheckCircle size={16} />,
  'coh-recent-discharge': <ArrowRightLeft size={16} />,
};

// ============================================================================
// Component
// ============================================================================

export const CohortNavigator: React.FC = () => {
  const { state, dispatch } = usePopHealth();

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  };

  const scrollContainerStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: LAYOUT.menuContentPadding,
  };

  const sectionGapStyle: React.CSSProperties = {
    height: spaceBetween.related,
  };

  return (
    <div style={containerStyle} data-testid="cohort-navigator">
      <div style={scrollContainerStyle}>
        {/* All Patients (root) */}
        <MenuNavItem
          icon={<Users size={16} />}
          label="All Patients"
          badge={COHORTS.reduce((sum, c) => sum + c.patientCount, 0)}
          isSelected={state.selectedCohortId === null}
          onClick={() => dispatch({ type: 'COHORT_SELECTED', cohortId: '' })}
        />

        <div style={sectionGapStyle} />

        {/* Cohort Groups */}
        {COHORT_GROUPS.map((group) => {
          const groupCohorts = COHORTS.filter((c) => group.cohortIds.includes(c.id));
          const groupCount = groupCohorts.reduce((sum, c) => sum + c.patientCount, 0);

          return (
            <React.Fragment key={group.id}>
              <MenuSection
                title={group.label}
                collapsible
                collapsedBadge={groupCount}
                testID={`cohort-group-${group.id}`}
              >
                {groupCohorts.map((cohort) => (
                  <MenuNavItem
                    key={cohort.id}
                    icon={COHORT_ICONS[cohort.id] || <Users size={16} />}
                    label={cohort.name}
                    badge={cohort.patientCount}
                    isSelected={state.selectedCohortId === cohort.id}
                    onClick={() => dispatch({ type: 'COHORT_SELECTED', cohortId: cohort.id })}
                    testID={`cohort-${cohort.id}`}
                  />
                ))}
              </MenuSection>
              <div style={sectionGapStyle} />
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

CohortNavigator.displayName = 'CohortNavigator';
