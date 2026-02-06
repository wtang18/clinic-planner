import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { AlertTriangle, Sparkles, Zap, Heart, FileText } from 'lucide-react';
import { SectionTitle } from '../../components/primitives/SectionTitle';
import { Button } from '../../components/primitives/Button';
import { Badge } from '../../components/primitives/Badge';
import { colors } from '../../styles/foundations';

const meta: Meta<typeof SectionTitle> = {
  title: 'Primitives/SectionTitle',
  component: SectionTitle,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Size variant: sm = 12px, md = 14px font',
    },
    title: {
      control: 'text',
      description: 'Section title text',
    },
    iconColor: {
      control: 'color',
      description: 'Color for the leading icon',
    },
    count: {
      control: 'text',
      description: 'Count or label shown in parentheses after the title',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Presentational section header with optional leading icon, count badge, and trailing content. Used to label groups of related content within panels and cards.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Section Title',
    size: 'md',
  },
};

export const WithIcon: Story = {
  args: {
    title: 'Critical Alerts',
    icon: <AlertTriangle size={16} />,
    iconColor: colors.fg.alert.secondary,
  },
};

export const WithCount: Story = {
  args: {
    title: 'Suggestions',
    icon: <Sparkles size={16} />,
    iconColor: colors.fg.generative.spotReadable,
    count: 5,
  },
};

export const WithTrailing: Story = {
  args: {
    title: 'Care Gaps',
    icon: <Heart size={16} />,
    iconColor: colors.fg.attention.secondary,
    count: '3 open',
    trailing: (
      <Button variant="ghost" size="sm" style={{ color: colors.fg.neutral.spotReadable }}>
        View All
      </Button>
    ),
  },
};

export const Sizes: Story = {
  name: 'Size Comparison',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <span style={{ fontSize: 12, color: colors.fg.neutral.spotReadable, marginBottom: 4, display: 'block' }}>
          sm (12px)
        </span>
        <SectionTitle
          title="Small Section"
          icon={<FileText size={14} />}
          iconColor={colors.fg.neutral.spotReadable}
          count={2}
          size="sm"
        />
        <div style={{
          padding: '8px 12px',
          backgroundColor: colors.bg.neutral.min,
          borderRadius: 4,
          fontSize: 13,
          color: colors.fg.neutral.secondary,
        }}>
          Content below the section title...
        </div>
      </div>

      <div>
        <span style={{ fontSize: 12, color: colors.fg.neutral.spotReadable, marginBottom: 4, display: 'block' }}>
          md (14px)
        </span>
        <SectionTitle
          title="Medium Section"
          icon={<FileText size={16} />}
          iconColor={colors.fg.neutral.spotReadable}
          count={4}
          size="md"
        />
        <div style={{
          padding: '8px 12px',
          backgroundColor: colors.bg.neutral.min,
          borderRadius: 4,
          fontSize: 14,
          color: colors.fg.neutral.secondary,
        }}>
          Content below the section title...
        </div>
      </div>
    </div>
  ),
};
