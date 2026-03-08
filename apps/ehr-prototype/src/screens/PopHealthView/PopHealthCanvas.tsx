/**
 * PopHealthCanvas Component
 *
 * Canvas container that routes between Flow View and Table View
 * based on the active view selection in PopHealthContext.
 *
 * Renders the FilterBar as a sticky row below the floating nav,
 * and a SlideDrawer for node detail, patient preview, or filter views.
 */

import React from 'react';
import { usePopHealth } from '../../context/PopHealthContext';
import { PrioritiesView } from '../../components/population-health/PrioritiesView';
import { FlowCanvas } from '../../components/population-health/FlowCanvas';
import { TableView } from '../../components/population-health/TableView';
import { FilterBar } from '../../components/population-health/FilterBar';
import { SlideDrawer } from '../../components/shared/SlideDrawer';
import { NodeDetailView } from '../../components/population-health/NodeDetailView';
import { PatientPreviewView } from '../../components/population-health/PatientPreviewView';
import { colors, typography } from '../../styles/foundations';

// ============================================================================
// Component
// ============================================================================

export const PopHealthCanvas: React.FC = () => {
  const { state, dispatch, isDrawerOpen, currentDrawerView, canDrawerGoBack } = usePopHealth();

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  };

  return (
    <div style={containerStyle} data-testid="pop-health-canvas">
      {/* Sticky filter row — lifecycle toggles + chips, only for flow/table views */}
      {state.activeView !== 'priorities' && <FilterBar />}

      {/* Main canvas area */}
      {state.activeView === 'priorities' && <PrioritiesView />}
      {state.activeView === 'flow' && <FlowCanvas />}
      {state.activeView === 'table' && <TableView />}

      {/* Detail drawer — node detail, patient preview, or filter controls */}
      <SlideDrawer
        open={isDrawerOpen}
        onClose={() => dispatch({ type: 'DRAWER_CLOSED' })}
        showBack={canDrawerGoBack}
        onBack={() => dispatch({ type: 'DRAWER_BACK' })}
        header={
          currentDrawerView ? (
            <span style={{
              fontSize: 14,
              fontWeight: 600,
              fontFamily: typography.fontFamily.sans,
              color: colors.fg.neutral.primary,
            }}>
              {currentDrawerView.type === 'node-detail'
                ? 'Node Details'
                : currentDrawerView.type === 'patient-preview'
                  ? 'Patient Preview'
                  : 'Filters'}
            </span>
          ) : undefined
        }
        testID="pop-health-drawer"
      >
        {currentDrawerView?.type === 'node-detail' && (
          <NodeDetailView nodeId={currentDrawerView.nodeId} />
        )}
        {currentDrawerView?.type === 'patient-preview' && (
          <PatientPreviewView patientId={currentDrawerView.patientId} />
        )}
        {currentDrawerView?.type === 'filter' && (
          <FilterDrawerPlaceholder />
        )}
      </SlideDrawer>
    </div>
  );
};

PopHealthCanvas.displayName = 'PopHealthCanvas';

// ============================================================================
// Filter Drawer Placeholder
// ============================================================================

const FilterDrawerPlaceholder: React.FC = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    gap: 8,
    padding: 20,
  }}>
    <span style={{
      fontSize: 14,
      fontFamily: typography.fontFamily.sans,
      color: colors.fg.neutral.secondary,
    }}>
      Advanced filter controls
    </span>
    <span style={{
      fontSize: 12,
      fontFamily: typography.fontFamily.sans,
      color: colors.fg.neutral.spotReadable,
      textAlign: 'center',
    }}>
      Configure lifecycle state, node type, patient count, and date range filters.
    </span>
  </div>
);

FilterDrawerPlaceholder.displayName = 'FilterDrawerPlaceholder';
