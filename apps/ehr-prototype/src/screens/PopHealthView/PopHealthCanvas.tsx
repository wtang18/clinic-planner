/**
 * PopHealthCanvas Component
 *
 * Canvas container that routes between Flow View and Table View
 * based on the active view selection in PopHealthContext.
 */

import React, { useMemo } from 'react';
import { usePopHealth } from '../../context/PopHealthContext';
import { FlowCanvas } from '../../components/population-health/FlowCanvas';
import { TableView } from '../../components/population-health/TableView';
import { SlideDrawer } from '../../components/shared/SlideDrawer';
import { NodeDetailView } from '../../components/population-health/NodeDetailView';
import { PatientPreviewView } from '../../components/population-health/PatientPreviewView';
import { getPathwayById } from '../../data/mock-population-health';
import { colors, typography, spaceAround } from '../../styles/foundations';

// ============================================================================
// Component
// ============================================================================

export const PopHealthCanvas: React.FC = () => {
  const { state, dispatch, isDrawerOpen, currentDrawerView, canDrawerGoBack } = usePopHealth();

  // Resolve selected pathway name for the label
  const selectedPathwayName = useMemo(() => {
    if (state.selectedPathwayIds.length === 1) {
      const pathway = getPathwayById(state.selectedPathwayIds[0]);
      return pathway?.name ?? null;
    }
    if (state.selectedPathwayIds.length > 1) {
      return `${state.selectedPathwayIds.length} pathways selected`;
    }
    return null;
  }, [state.selectedPathwayIds]);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  };

  return (
    <div style={containerStyle} data-testid="pop-health-canvas">
      {/* Pathway name label */}
      {state.activeView === 'flow' && selectedPathwayName && (
        <div style={labelStyles.container}>
          <span style={labelStyles.text}>{selectedPathwayName}</span>
        </div>
      )}

      {/* Main canvas area */}
      {state.activeView === 'flow' ? <FlowCanvas /> : <TableView />}

      {/* Detail drawer */}
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
              {currentDrawerView.type === 'node-detail' ? 'Node Details' : 'Patient Preview'}
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
      </SlideDrawer>
    </div>
  );
};

PopHealthCanvas.displayName = 'PopHealthCanvas';

// ============================================================================
// Styles
// ============================================================================

const labelStyles: Record<string, React.CSSProperties> = {
  container: {
    padding: `${spaceAround.tight}px ${spaceAround.default}px`,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
    flexShrink: 0,
  },
  text: {
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.primary,
  },
};
