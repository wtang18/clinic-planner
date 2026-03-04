/**
 * PopHealthCanvas Component
 *
 * Canvas container that routes between Flow View and Table View
 * based on the active view selection in PopHealthContext.
 */

import React from 'react';
import { usePopHealth } from '../../context/PopHealthContext';
import { FlowCanvas } from '../../components/population-health/FlowCanvas';
import { TableView } from '../../components/population-health/TableView';
import { SlideDrawer } from '../../components/shared/SlideDrawer';
import { NodeDetailView } from '../../components/population-health/NodeDetailView';
import { PatientPreviewView } from '../../components/population-health/PatientPreviewView';
import { colors, typography, spaceAround } from '../../styles/foundations';

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
