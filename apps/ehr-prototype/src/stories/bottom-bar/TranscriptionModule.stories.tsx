import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import {
  TranscriptionDrawer,
  TranscriptionModule,
  WaveformIndicator,
  StatusBadge,
  AvatarWithBadge,
  PATIENT_COLORS,
} from '../../components/bottom-bar';
import {
  DEMO_PATIENTS,
} from '../../state/bottomBar/demoScenarios';
import { createSessionInState } from '../../state/bottomBar/initialState';
import { COUGH_5_DAYS_TRANSCRIPT } from '../../state/bottomBar/mockTranscripts';
import type { TierState, TranscriptionSession, RecordingStatus } from '../../state/bottomBar/types';

// ============================================================================
// Meta
// ============================================================================

const meta: Meta = {
  title: 'Bottom Bar/Transcription',
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
};

export default meta;

// ============================================================================
// StatusBadge Stories
// ============================================================================

export const StatusBadgeAll: StoryObj<typeof StatusBadge> = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, padding: 32, alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#fff', marginBottom: 16, fontSize: 12 }}>Idle (none)</p>
        <div style={{ position: 'relative', width: 32, height: 32, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}>
          <StatusBadge status="idle" />
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#fff', marginBottom: 16, fontSize: 12 }}>Recording</p>
        <div style={{ position: 'relative', width: 32, height: 32, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}>
          <StatusBadge status="recording" />
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#fff', marginBottom: 16, fontSize: 12 }}>Paused</p>
        <div style={{ position: 'relative', width: 32, height: 32, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}>
          <StatusBadge status="paused" />
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#fff', marginBottom: 16, fontSize: 12 }}>Processing</p>
        <div style={{ position: 'relative', width: 32, height: 32, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}>
          <StatusBadge status="processing" />
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#fff', marginBottom: 16, fontSize: 12 }}>Error</p>
        <div style={{ position: 'relative', width: 32, height: 32, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}>
          <StatusBadge status="error" />
        </div>
      </div>
    </div>
  ),
};

// ============================================================================
// AvatarWithBadge Stories
// ============================================================================

export const AvatarWithBadgeAll: StoryObj<typeof AvatarWithBadge> = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, padding: 32, alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#fff', marginBottom: 16, fontSize: 12 }}>Idle</p>
        <AvatarWithBadge initials="LS" color={PATIENT_COLORS.blue} status="idle" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#fff', marginBottom: 16, fontSize: 12 }}>Recording</p>
        <AvatarWithBadge initials="LS" color={PATIENT_COLORS.blue} status="recording" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#fff', marginBottom: 16, fontSize: 12 }}>Paused</p>
        <AvatarWithBadge initials="LS" color={PATIENT_COLORS.blue} status="paused" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#fff', marginBottom: 16, fontSize: 12 }}>Processing</p>
        <AvatarWithBadge initials="LS" color={PATIENT_COLORS.blue} status="processing" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#fff', marginBottom: 16, fontSize: 12 }}>Error</p>
        <AvatarWithBadge initials="LS" color={PATIENT_COLORS.blue} status="error" />
      </div>
    </div>
  ),
};

export const AvatarWithBadgeColors: StoryObj<typeof AvatarWithBadge> = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, padding: 32, alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#fff', marginBottom: 16, fontSize: 12 }}>Blue</p>
        <AvatarWithBadge initials="LS" color={PATIENT_COLORS.blue} status="recording" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#fff', marginBottom: 16, fontSize: 12 }}>Teal</p>
        <AvatarWithBadge initials="RM" color={PATIENT_COLORS.teal} status="recording" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#fff', marginBottom: 16, fontSize: 12 }}>Purple</p>
        <AvatarWithBadge initials="SC" color={PATIENT_COLORS.purple} status="recording" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#fff', marginBottom: 16, fontSize: 12 }}>Green</p>
        <AvatarWithBadge initials="MJ" color={PATIENT_COLORS.green} status="recording" />
      </div>
    </div>
  ),
};

// ============================================================================
// WaveformIndicator Stories
// ============================================================================

export const WaveformAnimating: StoryObj<typeof WaveformIndicator> = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, padding: 32, alignItems: 'center' }}>
      <div>
        <p style={{ color: '#fff', marginBottom: 8, fontSize: 12 }}>Small (3 bars)</p>
        <WaveformIndicator isAnimating size="sm" barCount={3} />
      </div>
      <div>
        <p style={{ color: '#fff', marginBottom: 8, fontSize: 12 }}>Medium (5 bars)</p>
        <WaveformIndicator isAnimating size="md" barCount={5} />
      </div>
      <div>
        <p style={{ color: '#fff', marginBottom: 8, fontSize: 12 }}>Large (7 bars)</p>
        <WaveformIndicator isAnimating size="lg" barCount={7} />
      </div>
    </div>
  ),
};

export const WaveformStatic: StoryObj<typeof WaveformIndicator> = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, padding: 32, alignItems: 'center' }}>
      <WaveformIndicator isAnimating={false} size="sm" barCount={3} />
      <WaveformIndicator isAnimating={false} size="md" barCount={5} />
      <WaveformIndicator isAnimating={false} size="lg" barCount={7} />
    </div>
  ),
};

// ============================================================================
// TranscriptionDrawer Stories
// ============================================================================

const DrawerWrapper: React.FC = () => {
  const session = createSessionInState(
    'enc-001',
    DEMO_PATIENTS.laurenSvendsen,
    'recording',
    {
      duration: 60,
      segments: COUGH_5_DAYS_TRANSCRIPT,
      isDemo: true,
    }
  );

  return (
    <div style={{ width: 500, height: 600, padding: 32 }}>
      <TranscriptionDrawer
        session={session}
        onCollapse={() => console.log('Collapse')}
        onCollapseToPalette={() => console.log('Collapse to palette')}
        onStart={() => console.log('Start')}
        onPause={() => console.log('Pause')}
        onResume={() => console.log('Resume')}
        onStop={() => console.log('Stop')}
        onDiscard={() => console.log('Discard')}
      />
    </div>
  );
};

export const DrawerWithTranscript: StoryObj = {
  render: () => <DrawerWrapper />,
};

// ============================================================================
// TranscriptionModule Stories (Tier Switching)
// ============================================================================

const ModuleWrapper: React.FC = () => {
  const [tier, setTier] = useState<TierState>('bar');
  const session = createSessionInState(
    'enc-001',
    DEMO_PATIENTS.laurenSvendsen,
    'recording',
    {
      duration: 45,
      segments: COUGH_5_DAYS_TRANSCRIPT.slice(0, 3),
      isDemo: true,
    }
  );

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 16, color: '#fff', fontSize: 12 }}>
        Current tier: <strong>{tier}</strong>
        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          {(['anchor', 'bar', 'palette', 'drawer'] as TierState[]).map((t) => (
            <button
              key={t}
              onClick={() => setTier(t)}
              style={{
                padding: '4px 8px',
                backgroundColor: tier === t ? '#fff' : 'rgba(255,255,255,0.1)',
                color: tier === t ? '#000' : '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div style={{ width: tier === 'anchor' ? 48 : tier === 'bar' ? 200 : 500 }}>
        <TranscriptionModule
          tier={tier}
          session={session}
          onTierChange={setTier}
          onStart={() => console.log('Start')}
          onPause={() => console.log('Pause')}
          onResume={() => console.log('Resume')}
          onStop={() => console.log('Stop')}
          onDiscard={() => console.log('Discard')}
        />
      </div>
    </div>
  );
};

export const ModuleTierSwitching: StoryObj = {
  render: () => <ModuleWrapper />,
};

// ============================================================================
// TranscriptionModule - 3-Container Architecture Stories
// ============================================================================

/**
 * Module wrapper for demonstrating 3-container architecture
 */
const Module3ContainerWrapper: React.FC<{
  tier: TierState;
  status: RecordingStatus;
  duration?: number;
  hasSegments?: boolean;
  error?: string | null;
}> = ({
  tier,
  status,
  duration = 0,
  hasSegments = false,
  error = null,
}) => {
  const [currentTier, setCurrentTier] = useState<TierState>(tier);
  const session: TranscriptionSession = {
    ...createSessionInState(
      'enc-001',
      DEMO_PATIENTS.laurenSvendsen,
      status,
      {
        duration,
        segments: hasSegments ? COUGH_5_DAYS_TRANSCRIPT.slice(0, 5) : [],
        isDemo: true,
      }
    ),
    error,
  };

  return (
    <div style={{ padding: 32, minHeight: tier === 'palette' ? 500 : 100 }}>
      <TranscriptionModule
        tier={currentTier}
        session={session}
        onTierChange={setCurrentTier}
        onStart={() => console.log('Start')}
        onPause={() => console.log('Pause')}
        onResume={() => console.log('Resume')}
        onStop={() => console.log('Stop')}
        onDiscard={() => console.log('Discard')}
      />
    </div>
  );
};

// Mini tier stories
export const ModuleMiniIdle: StoryObj = {
  name: 'Module: Mini - Idle',
  render: () => <Module3ContainerWrapper tier="anchor" status="idle" />,
};

export const ModuleMiniRecording: StoryObj = {
  name: 'Module: Mini - Recording',
  render: () => <Module3ContainerWrapper tier="anchor" status="recording" duration={45} />,
};

export const ModuleMiniPaused: StoryObj = {
  name: 'Module: Mini - Paused',
  render: () => <Module3ContainerWrapper tier="anchor" status="paused" duration={120} />,
};

// Bar tier stories (3-container layout: Avatar | Content | Controls)
export const ModuleBarIdle: StoryObj = {
  name: 'Module: Bar - Idle (3-Container)',
  render: () => <Module3ContainerWrapper tier="bar" status="idle" />,
};

export const ModuleBarRecording: StoryObj = {
  name: 'Module: Bar - Recording (3-Container)',
  render: () => <Module3ContainerWrapper tier="bar" status="recording" duration={83} />,
};

export const ModuleBarPaused: StoryObj = {
  name: 'Module: Bar - Paused (3-Container)',
  render: () => <Module3ContainerWrapper tier="bar" status="paused" duration={272} />,
};

export const ModuleBarProcessing: StoryObj = {
  name: 'Module: Bar - Processing (3-Container)',
  render: () => <Module3ContainerWrapper tier="bar" status="processing" duration={180} />,
};

export const ModuleBarError: StoryObj = {
  name: 'Module: Bar - Error (3-Container)',
  render: () => <Module3ContainerWrapper tier="bar" status="error" error="Mic error" />,
};

// Palette tier stories (3-container layout: Avatar Row | Content Row | Controls Row)
export const ModulePaletteIdle: StoryObj = {
  name: 'Module: Palette - Idle (3-Container)',
  render: () => <Module3ContainerWrapper tier="palette" status="idle" />,
};

export const ModulePaletteRecording: StoryObj = {
  name: 'Module: Palette - Recording (3-Container)',
  render: () => <Module3ContainerWrapper tier="palette" status="recording" duration={45} />,
};

export const ModulePaletteRecordingWithSegments: StoryObj = {
  name: 'Module: Palette - Recording w/ Segments',
  render: () => <Module3ContainerWrapper tier="palette" status="recording" duration={180} hasSegments />,
};

export const ModulePalettePaused: StoryObj = {
  name: 'Module: Palette - Paused (3-Container)',
  render: () => <Module3ContainerWrapper tier="palette" status="paused" duration={272} hasSegments />,
};

export const ModulePaletteError: StoryObj = {
  name: 'Module: Palette - Error (3-Container)',
  render: () => <Module3ContainerWrapper tier="palette" status="error" error="Microphone access denied" />,
};

// All states overview for 3-container architecture
export const Module3ContainerAllStates: StoryObj = {
  name: 'Module: 3-Container All States',
  render: () => (
    <div style={{ padding: 32 }}>
      <h3 style={{ color: '#fff', marginBottom: 24, fontSize: 16 }}>
        3-Container Architecture Overview
      </h3>
      <p style={{ color: '#888', marginBottom: 24, fontSize: 13 }}>
        Each module uses 3 independent animated containers: Avatar | Content | Controls
      </p>

      {/* Bar States */}
      <div style={{ marginBottom: 32 }}>
        <h4 style={{ color: '#fff', marginBottom: 16, fontSize: 14 }}>Bar Tier (160×48)</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          <div>
            <p style={{ color: '#888', marginBottom: 8, fontSize: 11 }}>Idle</p>
            <Module3ContainerWrapper tier="bar" status="idle" />
          </div>
          <div>
            <p style={{ color: '#888', marginBottom: 8, fontSize: 11 }}>Recording</p>
            <Module3ContainerWrapper tier="bar" status="recording" duration={83} />
          </div>
          <div>
            <p style={{ color: '#888', marginBottom: 8, fontSize: 11 }}>Paused</p>
            <Module3ContainerWrapper tier="bar" status="paused" duration={272} />
          </div>
        </div>
      </div>

      {/* Palette States */}
      <div>
        <h4 style={{ color: '#fff', marginBottom: 16, fontSize: 14 }}>Palette Tier (400px wide)</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
          <div>
            <p style={{ color: '#888', marginBottom: 8, fontSize: 11 }}>Idle (Consent)</p>
            <Module3ContainerWrapper tier="palette" status="idle" />
          </div>
          <div>
            <p style={{ color: '#888', marginBottom: 8, fontSize: 11 }}>Recording w/ Transcript</p>
            <Module3ContainerWrapper tier="palette" status="recording" duration={45} hasSegments />
          </div>
        </div>
      </div>
    </div>
  ),
};
