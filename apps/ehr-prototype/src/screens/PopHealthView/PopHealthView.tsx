/**
 * PopHealthView Screen
 *
 * Population health workspace layout host.
 * Composes AdaptiveLayout with cohort navigator (menu), dashboard + layer tree
 * (overview), and protocol flow/table canvas (canvas pane).
 */

import React, { useCallback, useMemo } from 'react';
import { useNavigation } from '../../navigation/NavigationContext';
import { PopHealthProvider, usePopHealth } from '../../context/PopHealthContext';
import { AdaptiveLayout } from '../../components/layout/AdaptiveLayout';
import { CohortNavigator } from '../../components/population-health/CohortNavigator';
import { Dashboard } from '../../components/population-health/Dashboard';
import { LayerTree } from '../../components/population-health/LayerTree';
import { PopHealthCanvas } from './PopHealthCanvas';
import { SegmentedControl, type Segment } from '../../components/primitives/SegmentedControl';
import { Layers, Table2 } from 'lucide-react';
import type { ActiveView } from '../../types/population-health';
import { COHORTS } from '../../data/mock-population-health';
import { colors, typography } from '../../styles/foundations';

// ============================================================================
// View Segments
// ============================================================================

const VIEW_SEGMENTS: Segment<ActiveView>[] = [
  { key: 'flow', label: 'Flow', icon: <Layers size={14} /> },
  { key: 'table', label: 'Table', icon: <Table2 size={14} /> },
];

// ============================================================================
// Inner Component (needs PopHealthContext)
// ============================================================================

const PopHealthViewInner: React.FC = () => {
  const { state, dispatch } = usePopHealth();
  const { goBack } = useNavigation();

  const handleViewChange = useCallback((view: ActiveView) => {
    dispatch({ type: 'VIEW_CHANGED', view });
  }, [dispatch]);

  // Workspace content for FloatingNavRow
  const selectedCohort = useMemo(
    () => COHORTS.find((c) => c.id === state.selectedCohortId),
    [state.selectedCohortId]
  );

  const workspaceContent = useMemo(() => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{
        fontSize: 16,
        fontWeight: 600,
        fontFamily: typography.fontFamily.sans,
        color: colors.fg.neutral.primary,
      }}>
        {selectedCohort ? selectedCohort.name : 'Population Health'}
      </span>
      {selectedCohort && (
        <span style={{
          fontSize: 12,
          fontFamily: typography.fontFamily.sans,
          color: colors.fg.neutral.secondary,
        }}>
          {selectedCohort.patientCount} patients
        </span>
      )}
    </div>
  ), [selectedCohort]);

  // Canvas header: Flow/Table toggle
  const canvasHeaderContent = useMemo(() => (
    <SegmentedControl
      segments={VIEW_SEGMENTS}
      value={state.activeView}
      onChange={handleViewChange}
      variant="topBar"
      testID="view-toggle"
    />
  ), [state.activeView, handleViewChange]);

  // Center pane: Dashboard + Layer Tree
  const overviewPane = useMemo(() => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Dashboard />
      <LayerTree />
    </div>
  ), []);

  return (
    <AdaptiveLayout
      menuPane={<CohortNavigator />}
      overviewPane={overviewPane}
      canvasPane={<PopHealthCanvas />}
      canvasHeaderContent={canvasHeaderContent}
      workspaceContent={workspaceContent}
      onBack={goBack}
      testID="pop-health-view"
    />
  );
};

// ============================================================================
// Outer Component (provides context)
// ============================================================================

interface PopHealthViewProps {
  initialCohortId?: string;
}

export const PopHealthView: React.FC<PopHealthViewProps> = ({ initialCohortId = 'coh-diabetes' }) => {
  return (
    <PopHealthProvider initialCohortId={initialCohortId}>
      <PopHealthViewInner />
    </PopHealthProvider>
  );
};

PopHealthView.displayName = 'PopHealthView';
