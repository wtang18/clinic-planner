import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../../components/primitives/Badge';

const meta: Meta<typeof Badge> = {
  title: 'Primitives/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error', 'info', 'ai'],
      description: 'Visual variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Badge size',
    },
    dot: {
      control: 'boolean',
      description: 'Show as a dot indicator',
    },
    count: {
      control: 'number',
      description: 'Show a count value',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default',
    variant: 'default',
  },
};

export const Success: Story = {
  args: {
    children: 'Completed',
    variant: 'success',
  },
};

export const Warning: Story = {
  args: {
    children: 'Pending',
    variant: 'warning',
  },
};

export const Error: Story = {
  args: {
    children: 'Critical',
    variant: 'error',
  },
};

export const Info: Story = {
  args: {
    children: 'Active',
    variant: 'info',
  },
};

export const AI: Story = {
  args: {
    children: 'AI Suggested',
    variant: 'ai',
  },
};

export const DotIndicator: Story = {
  name: 'Dot Indicator',
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Badge variant="success" dot />
      <Badge variant="warning" dot />
      <Badge variant="error" dot />
      <Badge variant="info" dot />
      <Badge variant="ai" dot />
    </div>
  ),
};

export const CountBadge: Story = {
  name: 'Count Badge',
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Badge variant="error" count={3} />
      <Badge variant="info" count={12} />
      <Badge variant="warning" count={99} />
      <Badge variant="default" count={150} />
    </div>
  ),
};

export const Sizes: Story = {
  name: 'Sizes',
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Badge size="sm" variant="info">Small</Badge>
      <Badge size="md" variant="info">Medium</Badge>
    </div>
  ),
};

export const ClinicalUsage: Story = {
  name: 'Clinical Usage',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Badge variant="success">Confirmed</Badge>
        <Badge variant="warning">Pending Review</Badge>
        <Badge variant="error">Overdue</Badge>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Badge variant="ai">AI Generated</Badge>
        <Badge variant="info">New Order</Badge>
        <Badge variant="default">Draft</Badge>
      </div>
    </div>
  ),
};
