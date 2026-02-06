import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Inbox, Sparkles, Heart, FileText, Search } from 'lucide-react';
import { EmptyState } from '../../components/primitives/EmptyState';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { colors } from '../../styles/foundations';

const meta: Meta<typeof EmptyState> = {
  title: 'Primitives/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant: sm = compact, md = standard, lg = spacious',
    },
    title: {
      control: 'text',
      description: 'Title text displayed below the icon',
    },
    description: {
      control: 'text',
      description: 'Optional description text below the title',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Presentational empty state placeholder with icon, title, optional description, and optional action. Used when a list or section has no content to display.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: <Inbox size={40} />,
    title: 'No items',
    size: 'md',
  },
};

export const WithDescription: Story = {
  args: {
    icon: <Sparkles size={48} />,
    title: 'No suggestions right now',
    description: 'AI assistance will appear here as you work.',
    size: 'lg',
  },
};

export const WithAction: Story = {
  args: {
    icon: <Search size={40} />,
    title: 'No results found',
    description: 'Try adjusting your search criteria.',
    action: (
      <Button variant="secondary" size="sm">
        Clear filters
      </Button>
    ),
    size: 'md',
  },
};

export const AllSizes: Story = {
  name: 'Size Comparison',
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: colors.fg.neutral.spotReadable }}>sm</span>
        <div style={{ border: `1px dashed ${colors.border.neutral.low}`, borderRadius: 8 }}>
          <EmptyState
            icon={<Inbox size={32} />}
            title="No items"
            size="sm"
          />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: colors.fg.neutral.spotReadable }}>md</span>
        <div style={{ border: `1px dashed ${colors.border.neutral.low}`, borderRadius: 8 }}>
          <EmptyState
            icon={<Inbox size={40} />}
            title="No items"
            size="md"
          />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: colors.fg.neutral.spotReadable }}>lg</span>
        <div style={{ border: `1px dashed ${colors.border.neutral.low}`, borderRadius: 8 }}>
          <EmptyState
            icon={<Inbox size={48} />}
            title="No items"
            size="lg"
          />
        </div>
      </div>
    </div>
  ),
};

export const InContext: Story = {
  name: 'In Context (Card with Empty List)',
  render: () => (
    <div style={{ maxWidth: 400 }}>
      <Card variant="default" padding="lg">
        <div style={{
          fontSize: 16,
          fontWeight: 600,
          color: colors.fg.neutral.primary,
          marginBottom: 12,
        }}>
          Care Gaps
        </div>
        <EmptyState
          icon={<Heart size={40} />}
          title="No care gaps"
          description="All preventive care measures are up to date."
          size="md"
        />
      </Card>

      <div style={{ height: 16 }} />

      <Card variant="default" padding="lg">
        <div style={{
          fontSize: 16,
          fontWeight: 600,
          color: colors.fg.neutral.primary,
          marginBottom: 12,
        }}>
          AI Assistant
        </div>
        <EmptyState
          icon={<Sparkles size={48} />}
          title="No alerts or suggestions"
          description="AI assistance will appear here as you work."
          action={
            <Button variant="secondary" size="sm" leftIcon={<FileText size={14} />}>
              Generate Note
            </Button>
          }
          size="lg"
        />
      </Card>
    </div>
  ),
};
