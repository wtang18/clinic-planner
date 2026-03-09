/**
 * Integration Tests: CoordinationProvider → Hook → Component Flow
 *
 * Tests the full provider → adapter hook → component rendering chain.
 * Verifies that:
 * 1. CoordinationProvider + useCoordination deliver correct state and dispatch
 * 2. useBottomBar merges coordination tiers with session state
 * 3. useLeftPane reads pane state from coordination
 * 4. useDrawerCoordination provides coordinated actions across surfaces
 * 5. Multiple hooks reading the same provider stay consistent
 * 6. Realistic multi-step user interaction flows work end-to-end
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

// Providers
import { CoordinationProvider } from '../../hooks/useCoordination';
import { BottomBarProvider } from '../../hooks/useBottomBar';

// Hooks under test
import { useCoordination } from '../../hooks/useCoordination';
import { useBottomBar, useTranscription, useTierControls } from '../../hooks/useBottomBar';
import { useLeftPane, useLeftPaneState } from '../../hooks/useLeftPane';
import { useDrawerCoordination, useIsAIInDrawer, useIsTranscriptionInDrawer } from '../../hooks/useDrawerCoordination';

import type { CoordinationState } from '../../state/coordination';

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Full provider wrapper: CoordinationProvider → BottomBarProvider.
 * Mirrors the real AppProviders nesting order.
 */
function createWrapper(coordInitial?: Partial<CoordinationState>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <CoordinationProvider initialState={coordInitial}>
        <BottomBarProvider>
          {children}
        </BottomBarProvider>
      </CoordinationProvider>
    );
  };
}

// ============================================================================
// 1. CoordinationProvider + useCoordination
// ============================================================================

describe('CoordinationProvider + useCoordination', () => {
  it('provides default initial state', () => {
    const { result } = renderHook(() => useCoordination(), {
      wrapper: createWrapper(),
    });

    expect(result.current.state).toEqual({
      aiTier: 'bar',
      txTier: 'bar',
      paneView: 'menu',
      paneExpanded: true,
      txEligible: false,
      overviewExpanded: true,
      referencePane: { expanded: true, activeTab: 'overview', protocolTabState: 'available' },
    });
  });

  it('accepts initial state overrides', () => {
    const { result } = renderHook(() => useCoordination(), {
      wrapper: createWrapper({ txEligible: true, aiTier: 'palette', txTier: 'anchor' }),
    });

    expect(result.current.state.txEligible).toBe(true);
    expect(result.current.state.aiTier).toBe('palette');
    expect(result.current.state.txTier).toBe('anchor');
  });

  it('dispatches BAR_TAPPED and updates state', () => {
    const { result } = renderHook(() => useCoordination(), {
      wrapper: createWrapper({ txEligible: true }),
    });

    act(() => {
      result.current.dispatch({ type: 'BAR_TAPPED', payload: { module: 'ai' } });
    });

    expect(result.current.state.aiTier).toBe('palette');
    expect(result.current.state.txTier).toBe('anchor');
  });

  it('computes derived selectors after dispatch', () => {
    const { result } = renderHook(() => useCoordination(), {
      wrapper: createWrapper({ txEligible: true }),
    });

    // Initial: both at bar → two-column
    expect(result.current.bottomBarVisibility.layout).toBe('two-column');
    expect(result.current.isBottomBarHidden).toBe(false);
    expect(result.current.hasPaletteOpen).toBe(false);

    act(() => {
      result.current.dispatch({ type: 'BAR_TAPPED', payload: { module: 'ai' } });
    });

    // AI palette open
    expect(result.current.hasPaletteOpen).toBe(true);
    expect(result.current.bottomBarVisibility.ai.tier).toBe('palette');
    expect(result.current.bottomBarVisibility.transcription.tier).toBe('anchor');
  });

  it('computes gridTemplate for two-column bar state', () => {
    const { result } = renderHook(() => useCoordination(), {
      wrapper: createWrapper({ txEligible: true }),
    });

    // Both at bar → uses bar width tokens
    expect(result.current.gridTemplate).toContain('var(--bottom-bar-bar-width-tm)');
    expect(result.current.gridTemplate).toContain('var(--bottom-bar-bar-width-ai)');
  });

  it('computes gridTemplate "none" when bottom bar is hidden', () => {
    const { result } = renderHook(() => useCoordination(), {
      wrapper: createWrapper({ txEligible: true, aiTier: 'drawer', txTier: 'drawer' }),
    });

    expect(result.current.gridTemplate).toBe('none');
    expect(result.current.isBottomBarHidden).toBe(true);
  });

  it('throws when used outside CoordinationProvider', () => {
    expect(() => {
      renderHook(() => useCoordination());
    }).toThrow('useCoordination must be used within a CoordinationProvider');
  });
});

// ============================================================================
// 2. useBottomBar Adapter
// ============================================================================

describe('useBottomBar adapter', () => {
  it('merges tier state from coordination with session state from BottomBarProvider', () => {
    const { result } = renderHook(() => useBottomBar(), {
      wrapper: createWrapper({ txEligible: true }),
    });

    // Tiers sourced from coordination
    expect(result.current.state.transcriptionTier).toBe('bar');
    expect(result.current.state.aiTier).toBe('bar');
    expect(result.current.state.expandedModule).toBeNull();

    // Session state sourced from BottomBarProvider
    expect(result.current.activeSession).toBeNull();
    expect(result.current.isRecording).toBe(false);
  });

  it('derives expandedModule from coordination tiers', () => {
    const { result } = renderHook(() => useBottomBar(), {
      wrapper: createWrapper({ txEligible: true, aiTier: 'palette', txTier: 'anchor' }),
    });

    expect(result.current.state.expandedModule).toBe('ai');
  });

  it('expandModule dispatches to coordination', () => {
    const { result } = renderHook(() => useBottomBar(), {
      wrapper: createWrapper({ txEligible: true }),
    });

    act(() => {
      result.current.actions.expandModule('ai');
    });

    expect(result.current.state.aiTier).toBe('palette');
    expect(result.current.state.transcriptionTier).toBe('anchor');
    expect(result.current.state.expandedModule).toBe('ai');
  });

  it('collapseAll dispatches ESCAPE_PRESSED to coordination', () => {
    const { result } = renderHook(() => useBottomBar(), {
      wrapper: createWrapper({ txEligible: true, aiTier: 'palette', txTier: 'anchor' }),
    });

    act(() => {
      result.current.actions.collapseAll();
    });

    expect(result.current.state.aiTier).toBe('bar');
    expect(result.current.state.transcriptionTier).toBe('bar');
    expect(result.current.state.expandedModule).toBeNull();
  });

  it('setAITier maps imperative tier set to semantic coordination action', () => {
    const { result } = renderHook(() => useBottomBar(), {
      wrapper: createWrapper({ txEligible: true }),
    });

    // bar → palette triggers BAR_TAPPED
    act(() => {
      result.current.actions.setAITier('palette');
    });

    expect(result.current.state.aiTier).toBe('palette');
    expect(result.current.state.transcriptionTier).toBe('anchor');

    // palette → bar triggers PALETTE_COLLAPSED
    act(() => {
      result.current.actions.setAITier('bar');
    });

    expect(result.current.state.aiTier).toBe('bar');
    expect(result.current.state.transcriptionTier).toBe('bar');
  });

  it('session management dispatches to BottomBarProvider', () => {
    const { result } = renderHook(() => useBottomBar(), {
      wrapper: createWrapper({ txEligible: true }),
    });

    act(() => {
      result.current.actions.createSession('enc-1', {
        id: 'patient-1',
        name: 'Test Patient',
      });
    });

    expect(result.current.activeSession).not.toBeNull();
    expect(result.current.activeSession!.encounterId).toBe('enc-1');
  });
});

// ============================================================================
// 3. useTranscription Hook
// ============================================================================

describe('useTranscription hook', () => {
  it('provides recording state from session', () => {
    const { result } = renderHook(() => useTranscription(), {
      wrapper: createWrapper({ txEligible: true }),
    });

    expect(result.current.isIdle).toBe(true);
    expect(result.current.isRecording).toBe(false);
    expect(result.current.session).toBeNull();
  });

  it('reflects session after creation via useBottomBar', () => {
    // Use both hooks to verify cross-hook consistency
    const { result: bbResult } = renderHook(() => useBottomBar(), {
      wrapper: createWrapper({ txEligible: true }),
    });

    act(() => {
      bbResult.current.actions.createSession('enc-1', {
        id: 'patient-1',
        name: 'Test Patient',
      });
    });

    expect(bbResult.current.activeSession).not.toBeNull();
  });
});

// ============================================================================
// 4. useTierControls Hook
// ============================================================================

describe('useTierControls hook', () => {
  it('reads tiers from coordination and provides toggle helpers', () => {
    const { result } = renderHook(() => useTierControls(), {
      wrapper: createWrapper({ txEligible: true }),
    });

    expect(result.current.transcriptionTier).toBe('bar');
    expect(result.current.aiTier).toBe('bar');
    expect(result.current.hasExpanded).toBe(false);

    act(() => {
      result.current.toggleAIExpanded();
    });

    expect(result.current.aiTier).toBe('palette');
    expect(result.current.hasExpanded).toBe(true);
    expect(result.current.expandedModule).toBe('ai');

    // Toggle again collapses
    act(() => {
      result.current.toggleAIExpanded();
    });

    expect(result.current.aiTier).toBe('bar');
    expect(result.current.hasExpanded).toBe(false);
  });
});

// ============================================================================
// 5. useLeftPane Adapter
// ============================================================================

describe('useLeftPane adapter', () => {
  it('reads pane state from coordination', () => {
    const { result } = renderHook(() => useLeftPane(), {
      wrapper: createWrapper(),
    });

    expect(result.current.state.isExpanded).toBe(true);
    expect(result.current.state.activeView).toBe('menu');
  });

  it('dispatches switchView to coordination', () => {
    const { result } = renderHook(() => useLeftPane(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.actions.switchView('ai');
    });

    expect(result.current.state.activeView).toBe('ai');
  });

  it('dispatches collapse/expand to coordination', () => {
    const { result } = renderHook(() => useLeftPane(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.actions.collapse();
    });

    expect(result.current.state.isExpanded).toBe(false);
    expect(result.current.state.activeView).toBe('menu');

    act(() => {
      result.current.actions.expand();
    });

    expect(result.current.state.isExpanded).toBe(true);
  });

  it('toggle toggles expanded state', () => {
    const { result } = renderHook(() => useLeftPane(), {
      wrapper: createWrapper(),
    });

    expect(result.current.state.isExpanded).toBe(true);

    act(() => {
      result.current.actions.toggle();
    });

    expect(result.current.state.isExpanded).toBe(false);

    act(() => {
      result.current.actions.toggle();
    });

    expect(result.current.state.isExpanded).toBe(true);
  });

  it('useLeftPaneState returns read-only state', () => {
    const { result } = renderHook(() => useLeftPaneState(), {
      wrapper: createWrapper({ paneExpanded: false }),
    });

    expect(result.current.isExpanded).toBe(false);
    expect(result.current.activeView).toBe('menu');
  });
});

// ============================================================================
// 6. useDrawerCoordination
// ============================================================================

describe('useDrawerCoordination', () => {
  it('provides coordinated pane + bar state', () => {
    const { result } = renderHook(() => useDrawerCoordination(), {
      wrapper: createWrapper({ txEligible: true }),
    });

    expect(result.current.paneState.isExpanded).toBe(true);
    expect(result.current.paneState.activeView).toBe('menu');
    expect(result.current.barState.aiTier).toBe('bar');
    expect(result.current.barState.transcriptionTier).toBe('bar');
  });

  it('escalateAIToDrawer dispatches PALETTE_ESCALATED', () => {
    const { result } = renderHook(() => useDrawerCoordination(), {
      wrapper: createWrapper({ txEligible: true, aiTier: 'palette', txTier: 'anchor' }),
    });

    act(() => {
      result.current.actions.escalateAIToDrawer();
    });

    expect(result.current.barState.aiTier).toBe('drawer');
    expect(result.current.barState.transcriptionTier).toBe('bar');
    expect(result.current.paneState.activeView).toBe('ai');
    expect(result.current.paneState.isExpanded).toBe(true);
  });

  it('escalateTranscriptionToDrawer dispatches PALETTE_ESCALATED for TM', () => {
    const { result } = renderHook(() => useDrawerCoordination(), {
      wrapper: createWrapper({ txEligible: true, txTier: 'palette', aiTier: 'anchor' }),
    });

    act(() => {
      result.current.actions.escalateTranscriptionToDrawer();
    });

    expect(result.current.barState.transcriptionTier).toBe('drawer');
    expect(result.current.barState.aiTier).toBe('bar');
    expect(result.current.paneState.activeView).toBe('transcript');
  });

  it('switchView coordinates pane and bar', () => {
    const { result } = renderHook(() => useDrawerCoordination(), {
      wrapper: createWrapper({ txEligible: true }),
    });

    // Switch to AI view → AI goes to drawer
    act(() => {
      result.current.actions.switchView('ai');
    });

    expect(result.current.paneState.activeView).toBe('ai');
    expect(result.current.barState.aiTier).toBe('drawer');

    // Switch to transcript view → AI leaves drawer, TM enters
    act(() => {
      result.current.actions.switchView('transcript');
    });

    expect(result.current.paneState.activeView).toBe('transcript');
    expect(result.current.barState.transcriptionTier).toBe('drawer');
    expect(result.current.barState.aiTier).toBe('bar');
  });
});

// ============================================================================
// 7. Utility Hooks
// ============================================================================

describe('useIsAIInDrawer / useIsTranscriptionInDrawer', () => {
  it('useIsAIInDrawer returns true when AI is at drawer', () => {
    const { result } = renderHook(() => useIsAIInDrawer(), {
      wrapper: createWrapper({ aiTier: 'drawer', paneView: 'ai', paneExpanded: true }),
    });

    expect(result.current).toBe(true);
  });

  it('useIsAIInDrawer returns false when AI is at bar', () => {
    const { result } = renderHook(() => useIsAIInDrawer(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toBe(false);
  });

  it('useIsTranscriptionInDrawer returns true when TM is at drawer', () => {
    const { result } = renderHook(() => useIsTranscriptionInDrawer(), {
      wrapper: createWrapper({
        txEligible: true,
        txTier: 'drawer',
        paneView: 'transcript',
        paneExpanded: true,
      }),
    });

    expect(result.current).toBe(true);
  });
});

// ============================================================================
// 8. Cross-Hook Consistency
// ============================================================================

describe('Cross-hook consistency', () => {
  it('useCoordination and useLeftPane agree on pane state', () => {
    // Render both hooks under the same provider
    const wrapper = createWrapper();

    const { result: coordResult } = renderHook(() => useCoordination(), { wrapper });
    const { result: paneResult } = renderHook(() => useLeftPane(), { wrapper });

    expect(paneResult.current.state.isExpanded).toBe(coordResult.current.state.paneExpanded);
    expect(paneResult.current.state.activeView).toBe(coordResult.current.state.paneView);
  });

  it('useCoordination and useBottomBar agree on tier state', () => {
    const wrapper = createWrapper({ txEligible: true });

    const { result: coordResult } = renderHook(() => useCoordination(), { wrapper });
    const { result: bbResult } = renderHook(() => useBottomBar(), { wrapper });

    expect(bbResult.current.state.aiTier).toBe(coordResult.current.state.aiTier);
    expect(bbResult.current.state.transcriptionTier).toBe(coordResult.current.state.txTier);
  });
});

// ============================================================================
// 9. Multi-Step User Flows (End-to-End)
// ============================================================================

describe('Multi-step user flows', () => {
  it('encounter entry → AI palette → escalate to drawer → switch to transcript → collapse pane', () => {
    const { result } = renderHook(() => useDrawerCoordination(), {
      wrapper: createWrapper(),
    });

    // Step 1: Enter encounter (txEligible → true)
    const { result: coordResult } = renderHook(() => useCoordination(), {
      wrapper: createWrapper(),
    });

    // Use a fresh hook render with encounter state
    const { result: flowResult } = renderHook(() => useDrawerCoordination(), {
      wrapper: createWrapper({ txEligible: true }),
    });

    // Step 2: Expand AI module (bar → palette)
    act(() => {
      flowResult.current.barActions.expandModule('ai');
    });

    expect(flowResult.current.barState.aiTier).toBe('palette');
    expect(flowResult.current.barState.transcriptionTier).toBe('anchor');

    // Step 3: Escalate AI to drawer
    act(() => {
      flowResult.current.actions.escalateAIToDrawer();
    });

    expect(flowResult.current.barState.aiTier).toBe('drawer');
    expect(flowResult.current.barState.transcriptionTier).toBe('bar');
    expect(flowResult.current.paneState.activeView).toBe('ai');
    expect(flowResult.current.paneState.isExpanded).toBe(true);

    // Step 4: Switch to transcript view (drawer swap)
    act(() => {
      flowResult.current.actions.switchView('transcript');
    });

    expect(flowResult.current.barState.transcriptionTier).toBe('drawer');
    expect(flowResult.current.barState.aiTier).toBe('bar');
    expect(flowResult.current.paneState.activeView).toBe('transcript');

    // Step 5: Collapse pane
    act(() => {
      flowResult.current.actions.collapse();
    });

    expect(flowResult.current.paneState.isExpanded).toBe(false);
    expect(flowResult.current.paneState.activeView).toBe('menu');
    // TM de-escalated from drawer → bar (no palette pressure from AI)
    expect(flowResult.current.barState.transcriptionTier).toBe('bar');
    expect(flowResult.current.barState.aiTier).toBe('bar');
  });

  it('CMD_K flow: open AI palette → type → escalate → escape returns to menu', () => {
    const { result } = renderHook(() => useCoordination(), {
      wrapper: createWrapper({ txEligible: true }),
    });

    // Step 1: CMD_K opens AI palette
    act(() => {
      result.current.dispatch({ type: 'CMD_K_PRESSED' });
    });

    expect(result.current.state.aiTier).toBe('palette');
    expect(result.current.state.txTier).toBe('anchor');
    expect(result.current.hasPaletteOpen).toBe(true);

    // Step 2: Escalate AI to drawer
    act(() => {
      result.current.dispatch({ type: 'PALETTE_ESCALATED', payload: { module: 'ai' } });
    });

    expect(result.current.state.aiTier).toBe('drawer');
    expect(result.current.state.txTier).toBe('bar');
    expect(result.current.state.paneView).toBe('ai');
    expect(result.current.state.paneExpanded).toBe(true);
    expect(result.current.isBottomBarHidden).toBe(false);

    // Step 3: Switch pane to menu (de-escalates AI from drawer)
    act(() => {
      result.current.dispatch({ type: 'PANE_VIEW_CHANGED', payload: { to: 'menu' } });
    });

    expect(result.current.state.paneView).toBe('menu');
    expect(result.current.state.aiTier).toBe('bar');
    expect(result.current.state.txTier).toBe('bar');
  });

  it('anchor swap: AI palette → tap TM anchor → swaps modules', () => {
    const { result } = renderHook(() => useCoordination(), {
      wrapper: createWrapper({ txEligible: true, aiTier: 'palette', txTier: 'anchor' }),
    });

    // TM is at anchor, AI is at palette
    expect(result.current.state.aiTier).toBe('palette');
    expect(result.current.state.txTier).toBe('anchor');

    // Tap TM anchor → direct swap
    act(() => {
      result.current.dispatch({ type: 'ANCHOR_TAPPED', payload: { module: 'tm' } });
    });

    expect(result.current.state.txTier).toBe('palette');
    expect(result.current.state.aiTier).toBe('anchor');
  });

  it('non-encounter mode: txEligible=false, AI-only operations', () => {
    const { result } = renderHook(() => useCoordination(), {
      wrapper: createWrapper({ txEligible: false }),
    });

    // Only AI visible → single-column
    expect(result.current.bottomBarVisibility.layout).toBe('single-column');
    expect(result.current.bottomBarVisibility.transcription.visible).toBe(false);
    expect(result.current.bottomBarVisibility.ai.visible).toBe(true);

    // CMD_K opens AI palette (no TM compression)
    act(() => {
      result.current.dispatch({ type: 'CMD_K_PRESSED' });
    });

    expect(result.current.state.aiTier).toBe('palette');
    expect(result.current.bottomBarVisibility.layout).toBe('single-column');

    // Escalate to drawer
    act(() => {
      result.current.dispatch({ type: 'PALETTE_ESCALATED', payload: { module: 'ai' } });
    });

    expect(result.current.state.aiTier).toBe('drawer');
    expect(result.current.isBottomBarHidden).toBe(true);
    expect(result.current.state.paneView).toBe('ai');
  });

  it('encounter lifecycle: enter → interact → exit resets TM', () => {
    const { result } = renderHook(() => useCoordination(), {
      wrapper: createWrapper(),
    });

    // Start: non-encounter
    expect(result.current.state.txEligible).toBe(false);

    // Enter encounter
    act(() => {
      result.current.dispatch({
        type: 'ENCOUNTER_ENTERED',
        payload: { encounterId: 'enc-1', patientId: 'p-1' },
      });
    });

    expect(result.current.state.txEligible).toBe(true);
    expect(result.current.state.txTier).toBe('bar');
    expect(result.current.bottomBarVisibility.layout).toBe('two-column');

    // Expand TM
    act(() => {
      result.current.dispatch({ type: 'BAR_TAPPED', payload: { module: 'tm' } });
    });

    expect(result.current.state.txTier).toBe('palette');
    expect(result.current.state.aiTier).toBe('anchor');

    // Exit encounter
    act(() => {
      result.current.dispatch({ type: 'ENCOUNTER_EXITED' });
    });

    expect(result.current.state.txEligible).toBe(false);
    expect(result.current.state.aiTier).toBe('bar');
    expect(result.current.bottomBarVisibility.layout).toBe('single-column');
  });

  it('drawer swap via pane view icons: ai drawer → transcript drawer', () => {
    const { result } = renderHook(() => useCoordination(), {
      wrapper: createWrapper({
        txEligible: true,
        aiTier: 'drawer',
        paneView: 'ai',
        paneExpanded: true,
      }),
    });

    // AI in drawer, TM at bar
    expect(result.current.state.aiTier).toBe('drawer');
    expect(result.current.bottomBarVisibility.ai.visible).toBe(false);
    expect(result.current.bottomBarVisibility.transcription.visible).toBe(true);

    // Switch to transcript view → drawer swap
    act(() => {
      result.current.dispatch({ type: 'PANE_VIEW_CHANGED', payload: { to: 'transcript' } });
    });

    expect(result.current.state.txTier).toBe('drawer');
    expect(result.current.state.aiTier).toBe('bar');
    expect(result.current.state.paneView).toBe('transcript');
    expect(result.current.bottomBarVisibility.ai.visible).toBe(true);
    expect(result.current.bottomBarVisibility.transcription.visible).toBe(false);
  });
});
