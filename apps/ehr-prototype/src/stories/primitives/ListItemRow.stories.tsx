import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { AlertTriangle, Heart, Pill, FileText, ChevronRight } from 'lucide-react';
import { ListItemRow } from '../../components/primitives/ListItemRow';
import { Badge } from '../../components/primitives/Badge';
import { colors } from '../../styles/foundations';

const meta: Meta<typeof ListItemRow> = {
  title: 'Primitives/ListItemRow',
  component: ListItemRow,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'subtle', 'highlighted'],
      description: 'Visual variant',
    },
    compact: {
      control: 'boolean',
      description: 'Whether to use compact padding',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'A flexible row component for list items with optional icon, content, and trailing elements. Used in patient cards, linked items lists, and other repeating row patterns.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <span style={{ fontSize: 14, color: colors.fg.neutral.primary }}>Basic list item content</span>,
  },
};

export const WithIcon: Story = {
  args: {
    icon: <Pill size={16} />,
    children: <span style={{ fontSize: 14, color: colors.fg.neutral.primary }}>Lisinopril 10mg daily</span>,
  },
};

export const WithTrailing: Story = {
  args: {
    icon: <AlertTriangle size={16} />,
    iconColor: colors.fg.alert.secondary,
    children: <span style={{ fontSize: 14, color: colors.fg.neutral.primary }}>Penicillin allergy</span>,
    trailing: <Badge variant="error" size="sm">Severe</Badge>,
  },
};

export const Variants: Story = {
  name: 'Variant Comparison',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: 400 }}>
      <ListItemRow variant="default" icon={<FileText size={16} />}>
        <span style={{ fontSize: 14, color: colors.fg.neutral.primary }}>Default variant</span>
      </ListItemRow>
      <ListItemRow variant="subtle" icon={<FileText size={16} />}>
        <span style={{ fontSize: 14, color: colors.fg.neutral.primary }}>Subtle variant</span>
      </ListItemRow>
      <ListItemRow variant="highlighted" icon={<FileText size={16} />}>
        <span style={{ fontSize: 14, color: colors.fg.neutral.primary }}>Highlighted variant</span>
      </ListItemRow>
    </div>
  ),
};

export const Compact: Story = {
  name: 'Compact Mode',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: 400 }}>
      <ListItemRow compact icon={<Pill size={14} />}>
        <span style={{ fontSize: 12, color: colors.fg.neutral.secondary }}>Compact item 1</span>
      </ListItemRow>
      <ListItemRow compact icon={<Pill size={14} />}>
        <span style={{ fontSize: 12, color: colors.fg.neutral.secondary }}>Compact item 2</span>
      </ListItemRow>
      <ListItemRow compact icon={<Pill size={14} />}>
        <span style={{ fontSize: 12, color: colors.fg.neutral.secondary }}>Compact item 3</span>
      </ListItemRow>
    </div>
  ),
};

export const Clickable: Story = {
  name: 'Clickable Row',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: 400 }}>
      <ListItemRow
        icon={<Heart size={16} />}
        trailing={<ChevronRight size={16} color={colors.fg.neutral.spotReadable} />}
        onClick={() => alert('Clicked!')}
      >
        <span style={{ fontSize: 14, color: colors.fg.neutral.primary }}>Click me to navigate</span>
      </ListItemRow>
      <ListItemRow
        variant="subtle"
        icon={<FileText size={16} />}
        trailing={<ChevronRight size={16} color={colors.fg.neutral.spotReadable} />}
        onClick={() => alert('Clicked!')}
      >
        <span style={{ fontSize: 14, color: colors.fg.neutral.primary }}>Another clickable row</span>
      </ListItemRow>
    </div>
  ),
};
