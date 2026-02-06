import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { X, Sparkles, FileText } from 'lucide-react';
import { Modal } from '../../components/primitives/Modal';
import { colors, spaceAround, spaceBetween, typography, borderRadius } from '../../styles/foundations';

const meta: Meta<typeof Modal> = {
  title: 'Primitives/Modal',
  component: Modal,
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Whether the modal is visible',
    },
    position: {
      control: 'select',
      options: ['center', 'bottom'],
      description: 'Position of the modal content',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size constraint for the modal',
    },
    hasBackdrop: {
      control: 'boolean',
      description: 'Whether to show backdrop overlay',
    },
    closeOnBackdropClick: {
      control: 'boolean',
      description: 'Whether clicking backdrop closes the modal',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Overlay container for dialogs, bottom sheets, and centered modals. Provides backdrop, positioning, and transition animations.',
      },
    },
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const SampleContent: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div style={{ padding: spaceAround.default }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spaceAround.compact,
    }}>
      <h3 style={{
        margin: 0,
        fontSize: 16,
        fontWeight: typography.fontWeight.semibold,
        color: colors.fg.neutral.primary,
      }}>
        {title}
      </h3>
    </div>
    <p style={{
      margin: 0,
      fontSize: 14,
      color: colors.fg.neutral.secondary,
      lineHeight: '20px',
    }}>
      {description}
    </p>
  </div>
);

export const BottomSheet: Story = {
  name: 'Bottom Sheet (Default)',
  args: {
    isOpen: true,
    position: 'bottom',
    size: 'md',
    hasBackdrop: true,
    closeOnBackdropClick: true,
    children: (
      <SampleContent
        title="AI Assistant"
        description="This is a bottom sheet modal, commonly used for action panels and tool palettes that slide up from the bottom of the screen."
      />
    ),
  },
};

export const CenterModal: Story = {
  name: 'Center Modal',
  args: {
    isOpen: true,
    position: 'center',
    size: 'md',
    hasBackdrop: true,
    closeOnBackdropClick: true,
    children: (
      <SampleContent
        title="Confirm Action"
        description="This is a centered modal dialog, used for confirmations, alerts, and focused interactions that require user attention."
      />
    ),
  },
};

export const Sizes: Story = {
  name: 'Size Variants',
  render: () => {
    const [activeSize, setActiveSize] = React.useState<'sm' | 'md' | 'lg' | null>(null);

    return (
      <div style={{ padding: 40 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <button
              key={size}
              onClick={() => setActiveSize(size)}
              style={{
                padding: '8px 16px',
                fontSize: 14,
                border: `1px solid ${colors.border.neutral.low}`,
                borderRadius: borderRadius.sm,
                backgroundColor: colors.bg.neutral.base,
                color: colors.fg.neutral.primary,
                cursor: 'pointer',
              }}
            >
              Open {size}
            </button>
          ))}
        </div>
        {activeSize && (
          <Modal
            isOpen={true}
            onClose={() => setActiveSize(null)}
            position="center"
            size={activeSize}
          >
            <SampleContent
              title={`Size: ${activeSize}`}
              description={`This modal uses the "${activeSize}" size constraint. Click the backdrop to close.`}
            />
          </Modal>
        )}
      </div>
    );
  },
};

export const WithContent: Story = {
  name: 'With Rich Content',
  args: {
    isOpen: true,
    position: 'bottom',
    size: 'md',
    hasBackdrop: true,
    children: (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${spaceAround.default}px ${spaceAround.defaultPlus}px`,
          borderBottom: `1px solid ${colors.border.neutral.low}`,
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spaceBetween.repeating,
          }}>
            <span style={{ display: 'flex', color: colors.fg.generative.spotReadable }}>
              <Sparkles size={20} />
            </span>
            <h2 style={{
              margin: 0,
              fontSize: 16,
              fontWeight: typography.fontWeight.semibold,
              color: colors.fg.neutral.primary,
            }}>
              AI Assistant
            </h2>
          </div>
          <button style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            color: colors.fg.neutral.secondary,
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: spaceAround.default,
        }}>
          <div style={{ marginBottom: spaceAround.spacious }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: spaceBetween.repeating,
              fontSize: 14,
              fontWeight: typography.fontWeight.semibold,
              color: colors.fg.neutral.secondary,
              marginBottom: spaceAround.compact,
            }}>
              <span style={{ display: 'flex' }}>
                <FileText size={16} />
              </span>
              Quick Actions
            </div>
            <div style={{ display: 'flex', gap: spaceBetween.relatedCompact, flexWrap: 'wrap' }}>
              <button style={{
                padding: '8px 16px',
                fontSize: 14,
                border: `1px solid ${colors.border.neutral.low}`,
                borderRadius: borderRadius.sm,
                backgroundColor: colors.bg.neutral.base,
                color: colors.fg.neutral.primary,
                cursor: 'pointer',
              }}>
                Generate Note
              </button>
              <button style={{
                padding: '8px 16px',
                fontSize: 14,
                border: `1px solid ${colors.border.neutral.low}`,
                borderRadius: borderRadius.sm,
                backgroundColor: colors.bg.neutral.base,
                color: colors.fg.neutral.primary,
                cursor: 'pointer',
              }}>
                Check Interactions
              </button>
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            padding: spaceAround.spacious,
            color: colors.fg.neutral.spotReadable,
            fontSize: 14,
          }}>
            <p style={{ margin: 0 }}>No alerts or suggestions right now.</p>
            <p style={{ margin: 0, marginTop: 4, color: colors.fg.neutral.spotReadable }}>
              AI assistance will appear here as you work.
            </p>
          </div>
        </div>
      </div>
    ),
  },
};
