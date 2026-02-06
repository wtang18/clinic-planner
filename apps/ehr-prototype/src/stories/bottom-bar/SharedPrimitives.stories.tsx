import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Mic, Sparkles, FileText, Settings, Play } from 'lucide-react';
import {
  DragHandle,
  MiniAnchor,
  ControlsBar,
  ControlsBarButton,
  ControlsBarStatus,
} from '../../components/bottom-bar';

// ============================================================================
// DragHandle Stories
// ============================================================================

const DragHandleMeta: Meta<typeof DragHandle> = {
  title: 'Bottom Bar/Primitives/DragHandle',
  component: DragHandle,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
  argTypes: {
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    variant: { control: 'radio', options: ['light', 'dark'] },
  },
};

export default DragHandleMeta;

type DragHandleStory = StoryObj<typeof DragHandle>;

export const HorizontalDark: DragHandleStory = {
  args: {
    orientation: 'horizontal',
    variant: 'dark',
    onCollapse: () => console.log('Collapse clicked'),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 300, height: 44, backgroundColor: 'rgba(20,20,20,0.9)', borderRadius: 8 }}>
        <Story />
      </div>
    ),
  ],
};

export const HorizontalLight: DragHandleStory = {
  args: {
    orientation: 'horizontal',
    variant: 'light',
    onCollapse: () => console.log('Collapse clicked'),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 300, height: 44, backgroundColor: '#fff', borderRadius: 8 }}>
        <Story />
      </div>
    ),
  ],
};

export const VerticalDark: DragHandleStory = {
  args: {
    orientation: 'vertical',
    variant: 'dark',
    onCollapse: () => console.log('Collapse clicked'),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 44, height: 200, backgroundColor: 'rgba(20,20,20,0.9)', borderRadius: 8 }}>
        <Story />
      </div>
    ),
  ],
};

// ============================================================================
// MiniAnchor Stories
// ============================================================================

export const MiniAnchorStories = {
  title: 'Bottom Bar/Primitives/MiniAnchor',
};

export const MiniAnchorDefault: StoryObj<typeof MiniAnchor> = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, padding: 32 }}>
      <MiniAnchor
        icon={<Mic size={20} />}
        label="Microphone"
        onClick={() => console.log('Click')}
      />
      <MiniAnchor
        icon={<Sparkles size={20} />}
        label="AI Assistant"
        onClick={() => console.log('Click')}
      />
    </div>
  ),
};

export const MiniAnchorWithBadges: StoryObj<typeof MiniAnchor> = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, padding: 32 }}>
      <MiniAnchor
        icon={<Mic size={20} />}
        label="Recording"
        badge="recording"
        onClick={() => {}}
      />
      <MiniAnchor
        icon={<Mic size={20} />}
        label="Paused"
        badge="paused"
        onClick={() => {}}
      />
      <MiniAnchor
        icon={<Sparkles size={20} />}
        label="Processing"
        badge="processing"
        onClick={() => {}}
      />
      <MiniAnchor
        icon={<Sparkles size={20} />}
        label="3 suggestions"
        badge="count"
        badgeCount={3}
        onClick={() => {}}
      />
      <MiniAnchor
        icon={<Sparkles size={20} />}
        label="Has update"
        badge="dot"
        onClick={() => {}}
      />
    </div>
  ),
};

export const MiniAnchorLightVariant: StoryObj<typeof MiniAnchor> = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, padding: 32, backgroundColor: '#f0f0f0' }}>
      <MiniAnchor
        icon={<Mic size={20} />}
        label="Microphone"
        variant="light"
        onClick={() => {}}
      />
      <MiniAnchor
        icon={<Sparkles size={20} />}
        label="AI"
        variant="light"
        badge="count"
        badgeCount={5}
        onClick={() => {}}
      />
    </div>
  ),
};

// ============================================================================
// ControlsBar Stories
// ============================================================================

export const ControlsBarStories = {
  title: 'Bottom Bar/Primitives/ControlsBar',
};

export const ControlsBarDefault: StoryObj<typeof ControlsBar> = {
  render: () => (
    <div style={{ width: 500, backgroundColor: 'rgba(20,20,20,0.9)', borderRadius: 8 }}>
      <ControlsBar
        variant="dark"
        left={
          <ControlsBarButton
            label="Discard"
            variant="ghost"
            colorScheme="dark"
            onClick={() => {}}
          />
        }
        center={<ControlsBarStatus text="5 segments • 2:34" colorScheme="dark" />}
        right={
          <div style={{ display: 'flex', gap: 8 }}>
            <ControlsBarButton
              label="Done"
              variant="secondary"
              colorScheme="dark"
              onClick={() => {}}
            />
            <ControlsBarButton
              label="Resume"
              icon={<Play size={14} />}
              variant="primary"
              onClick={() => {}}
            />
          </div>
        }
      />
    </div>
  ),
};

export const ControlsBarLight: StoryObj<typeof ControlsBar> = {
  render: () => (
    <div style={{ width: 500, backgroundColor: '#fff', borderRadius: 8, border: '1px solid #e0e0e0' }}>
      <ControlsBar
        variant="light"
        left={
          <ControlsBarButton
            label="Cancel"
            variant="ghost"
            colorScheme="light"
            onClick={() => {}}
          />
        }
        center={<ControlsBarStatus text="Ready" colorScheme="light" />}
        right={
          <ControlsBarButton
            label="Save"
            variant="primary"
            onClick={() => {}}
          />
        }
      />
    </div>
  ),
};

export const ControlsBarDanger: StoryObj<typeof ControlsBar> = {
  render: () => (
    <div style={{ width: 400, backgroundColor: 'rgba(20,20,20,0.9)', borderRadius: 8 }}>
      <ControlsBar
        variant="dark"
        left={
          <ControlsBarButton
            label="Delete Recording"
            variant="danger"
            colorScheme="dark"
            onClick={() => {}}
          />
        }
        right={
          <ControlsBarButton
            label="Keep"
            variant="secondary"
            colorScheme="dark"
            onClick={() => {}}
          />
        }
      />
    </div>
  ),
};
