import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Card } from '../../components/primitives/Card';
import { CardIconContainer } from '../../components/primitives/CardIconContainer';
import { Badge } from '../../components/primitives/Badge';
import { Pill } from '../../components/primitives/Pill';
import { Pill as PillIcon } from 'lucide-react';
import { colors } from '../../styles/foundations';
import { fn } from 'storybook/test';

const meta: Meta<typeof Card> = {
  title: 'Primitives/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outlined', 'elevated'],
      description: 'Visual variant',
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Padding size',
    },
    interactive: {
      control: 'boolean',
      description: 'Enable hover and click states',
    },
    selected: {
      control: 'boolean',
      description: 'Selected state',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div>
        <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 600 }}>Default Card</h3>
        <p style={{ margin: 0, fontSize: '14px', color: colors.fg.neutral.spotReadable }}>
          A simple card with default styling. Uses a subtle border.
        </p>
      </div>
    ),
    variant: 'default',
    padding: 'md',
  },
};

export const Outlined: Story = {
  args: {
    children: (
      <div>
        <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 600 }}>Outlined Card</h3>
        <p style={{ margin: 0, fontSize: '14px', color: colors.fg.neutral.spotReadable }}>
          Transparent background with a visible border.
        </p>
      </div>
    ),
    variant: 'outlined',
    padding: 'md',
  },
};

export const Elevated: Story = {
  args: {
    children: (
      <div>
        <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 600 }}>Elevated Card</h3>
        <p style={{ margin: 0, fontSize: '14px', color: colors.fg.neutral.spotReadable }}>
          No border, uses box shadow for elevation.
        </p>
      </div>
    ),
    variant: 'elevated',
    padding: 'md',
  },
};

export const Interactive: Story = {
  args: {
    children: (
      <div>
        <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 600 }}>Interactive Card</h3>
        <p style={{ margin: 0, fontSize: '14px', color: colors.fg.neutral.spotReadable }}>
          Hover to see the interaction state. Click to trigger action.
        </p>
      </div>
    ),
    variant: 'default',
    interactive: true,
    onClick: fn(),
  },
};

export const Selected: Story = {
  args: {
    children: (
      <div>
        <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 600 }}>Selected Card</h3>
        <p style={{ margin: 0, fontSize: '14px', color: colors.fg.neutral.spotReadable }}>
          Shows the selected state with a primary border highlight.
        </p>
      </div>
    ),
    variant: 'default',
    selected: true,
    interactive: true,
    onClick: fn(),
  },
};

export const PaddingSizes: Story = {
  name: 'Padding Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Card padding="none">
        <div style={{ padding: '8px', fontSize: '14px' }}>padding="none"</div>
      </Card>
      <Card padding="sm">
        <div style={{ fontSize: '14px' }}>padding="sm" (12px)</div>
      </Card>
      <Card padding="md">
        <div style={{ fontSize: '14px' }}>padding="md" (16px)</div>
      </Card>
      <Card padding="lg">
        <div style={{ fontSize: '14px' }}>padding="lg" (24px)</div>
      </Card>
    </div>
  ),
};

export const ChartItemCard: Story = {
  name: 'Chart Item Example',
  render: () => (
    <Card variant="default" padding="md">
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <CardIconContainer color="accent" size="lg">
          <PillIcon size={18} />
        </CardIconContainer>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', fontWeight: 600, color: colors.fg.neutral.primary }}>
              Amoxicillin 500mg
            </span>
            <Badge variant="success">Confirmed</Badge>
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: colors.fg.neutral.spotReadable }}>
            Take 1 capsule by mouth 3 times daily for 10 days
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <Pill color="accent" size="sm">Medication</Pill>
            <Pill color="accent" size="sm">AI Suggested</Pill>
          </div>
        </div>
      </div>
    </Card>
  ),
};
