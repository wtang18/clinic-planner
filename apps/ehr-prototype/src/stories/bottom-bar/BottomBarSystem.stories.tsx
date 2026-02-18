import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import {
  BottomBarSystem,
  BottomBarContainer,
} from '../../components/bottom-bar';
import { BottomBarProvider, useBottomBar, useTierControls, useTranscription } from '../../hooks/useBottomBar';
import { CoordinationProvider } from '../../hooks/useCoordination';
import {
  DEMO_PATIENTS,
  DEMO_SCENARIOS,
  SCENARIO_READY_TO_RECORD,
  SCENARIO_RECORDING,
  SCENARIO_WITH_SEGMENTS,
} from '../../state/bottomBar/demoScenarios';
import type { AIMinibarContent } from '../../components/ai-ui/AIMinibar';
import type { Suggestion, Alert } from '../../types/suggestions';

// ============================================================================
// Meta
// ============================================================================

const meta: Meta = {
  title: 'Bottom Bar/System',
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <CoordinationProvider initialState={{ txEligible: true }}>
        <Story />
      </CoordinationProvider>
    ),
  ],
};

export default meta;

// ============================================================================
// Mock Data
// ============================================================================

const mockSuggestions: Suggestion[] = [
  {
    id: 'sug-001',
    type: 'chart-item',
    displayText: 'Consider ordering CBC for fatigue assessment',
    status: 'active',
    confidence: 0.85,
    source: 'ai-analysis',
    content: {
      type: 'new-item',
      category: 'lab',
      itemTemplate: {
        displayText: 'CBC with differential',
      },
    },
    createdAt: new Date(),
  },
  {
    id: 'sug-002',
    type: 'chart-item',
    displayText: 'Add diagnosis: Acute bronchitis (J20.9)',
    status: 'active',
    confidence: 0.92,
    source: 'transcription',
    content: {
      type: 'new-item',
      category: 'diagnosis',
      itemTemplate: {
        displayText: 'Acute bronchitis',
      },
    },
    createdAt: new Date(),
  },
];

const mockAlerts: Alert[] = [
  {
    id: 'alert-001',
    taskId: 'task-001',
    severity: 'warning',
    title: 'Drug Interaction',
    message: 'Potential interaction: Lisinopril + Potassium supplements',
    requiresAcknowledgment: true,
    createdAt: new Date(),
    actions: [
      { label: 'View Details', action: 'view', style: 'primary' },
      { label: 'Dismiss', action: 'dismiss', style: 'secondary' },
    ],
  },
];

const aiContentIdle: AIMinibarContent = { type: 'idle' };
const aiContentSuggestion: AIMinibarContent = {
  type: 'suggestion',
  id: 'sug-001',
  text: '2 suggestions available',
};

// ============================================================================
// Interactive Demo
// ============================================================================

const InteractiveDemo: React.FC = () => {
  const { state, actions, activeSession, gridTemplate } = useBottomBar();
  const { transcriptionTier, aiTier } = useTierControls();
  const transcription = useTranscription();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1a1a', padding: 24 }}>
      {/* Debug Panel */}
      <div
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: 16,
          borderRadius: 8,
          color: '#fff',
          fontSize: 12,
          maxWidth: 280,
          zIndex: 9999,
        }}
      >
        <h4 style={{ margin: '0 0 12px 0' }}>Debug Panel</h4>
        <div style={{ marginBottom: 8 }}>
          <strong>Transcription Tier:</strong> {transcriptionTier}
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>AI Tier:</strong> {aiTier}
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>Expanded:</strong> {state.expandedModule || 'none'}
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>Session Status:</strong> {transcription.status || 'none'}
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>Duration:</strong> {transcription.duration}s
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>Segments:</strong> {transcription.segments.length}
        </div>
        <div style={{ marginBottom: 16 }}>
          <strong>Grid:</strong> {gridTemplate.columns}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 12 }}>
          <p style={{ marginBottom: 8 }}>Quick Actions:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {!activeSession && (
              <button
                onClick={() => actions.createSession('enc-001', DEMO_PATIENTS.laurenSvendsen)}
                style={{ ...buttonStyle, backgroundColor: '#4caf50' }}
              >
                Create Session
              </button>
            )}
            {transcription.isIdle && activeSession && (
              <button
                onClick={transcription.start}
                style={{ ...buttonStyle, backgroundColor: '#f44336' }}
              >
                Start Recording
              </button>
            )}
            {transcription.isRecording && (
              <button
                onClick={transcription.pause}
                style={{ ...buttonStyle, backgroundColor: '#ff9800' }}
              >
                Pause
              </button>
            )}
            {transcription.isPaused && (
              <button
                onClick={transcription.resume}
                style={{ ...buttonStyle, backgroundColor: '#4caf50' }}
              >
                Resume
              </button>
            )}
            {(transcription.isRecording || transcription.isPaused) && (
              <button
                onClick={transcription.stop}
                style={buttonStyle}
              >
                Stop
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div
        style={{
          maxWidth: 800,
          margin: '0 auto',
          paddingBottom: 100,
        }}
      >
        <h1 style={{ color: '#fff', marginBottom: 24 }}>Bottom Bar System Demo</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>
          This demo shows the integrated bottom bar system. Use the debug panel to control state,
          or interact directly with the bottom bar.
        </p>

        {/* Placeholder content */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              padding: 24,
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <h3 style={{ color: '#fff', marginBottom: 8 }}>Content Section {i}</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <BottomBarContainer
        aiContent={aiContentSuggestion}
        suggestions={mockSuggestions}
        alerts={mockAlerts}
        onSuggestionAccept={(id) => console.log('Accept suggestion:', id)}
        onSuggestionDismiss={(id) => console.log('Dismiss suggestion:', id)}
        onAlertAcknowledge={(id) => console.log('Acknowledge alert:', id)}
      />
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  padding: '4px 8px',
  backgroundColor: 'rgba(255,255,255,0.2)',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 11,
};

export const Interactive: StoryObj = {
  render: () => (
    <BottomBarProvider initialState={SCENARIO_READY_TO_RECORD}>
      <InteractiveDemo />
    </BottomBarProvider>
  ),
};

export const WithRecording: StoryObj = {
  render: () => (
    <BottomBarProvider initialState={SCENARIO_RECORDING}>
      <InteractiveDemo />
    </BottomBarProvider>
  ),
};

export const WithSegments: StoryObj = {
  render: () => (
    <BottomBarProvider initialState={SCENARIO_WITH_SEGMENTS}>
      <InteractiveDemo />
    </BottomBarProvider>
  ),
};

// ============================================================================
// BottomBarSystem (Integrated Provider)
// ============================================================================

export const FullSystem: StoryObj = {
  render: () => (
    <BottomBarSystem
      encounterId="enc-001"
      patient={DEMO_PATIENTS.laurenSvendsen}
      aiContent={aiContentSuggestion}
      suggestions={mockSuggestions}
      alerts={mockAlerts}
      onSuggestionAccept={(id) => console.log('Accept:', id)}
      onSuggestionDismiss={(id) => console.log('Dismiss:', id)}
      onAlertAcknowledge={(id) => console.log('Acknowledge:', id)}
    >
      <div style={{ minHeight: '100vh', backgroundColor: '#1a1a1a', padding: 24 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 100 }}>
          <h1 style={{ color: '#fff', marginBottom: 24 }}>Full System Demo</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>
            This uses BottomBarSystem which wraps the provider and container together.
          </p>
        </div>
      </div>
    </BottomBarSystem>
  ),
};

// ============================================================================
// Scenario Showcase
// ============================================================================

export const AllScenarios: StoryObj = {
  render: () => (
    <div style={{ padding: 24, backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
      <h1 style={{ color: '#fff', marginBottom: 24 }}>Available Scenarios</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: 16,
        }}
      >
        {Object.entries(DEMO_SCENARIOS).map(([key, scenario]) => (
          <div
            key={key}
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              padding: 16,
              borderRadius: 8,
            }}
          >
            <h3 style={{ color: '#fff', marginBottom: 8, fontSize: 14 }}>{scenario.name}</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 12 }}>
              {scenario.description}
            </p>
            <code style={{ color: '#4caf50', fontSize: 11 }}>{key}</code>
          </div>
        ))}
      </div>
    </div>
  ),
};
