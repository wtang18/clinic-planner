import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../components/primitives/Button';
import type { ButtonShape } from '../../components/primitives/Button';
import { fn } from 'storybook/test';

const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Button size',
    },
    shape: {
      control: 'select',
      options: ['pill', 'rounded', 'rect'],
      description: 'Border radius shape — pill (default), rounded (16px), rect (8px)',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    loading: {
      control: 'boolean',
      description: 'Loading state with spinner',
    },
  },
  args: {
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
};

export const Danger: Story = {
  args: {
    children: 'Danger Button',
    variant: 'danger',
  },
};

export const Small: Story = {
  args: {
    children: 'Small',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large',
    size: 'lg',
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading...',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

export const ClinicalActions: Story = {
  name: 'Clinical Actions',
  render: () => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Button variant="primary" onClick={fn()}>Confirm</Button>
      <Button variant="secondary" onClick={fn()}>Edit</Button>
      <Button variant="danger" onClick={fn()}>Cancel Order</Button>
    </div>
  ),
};

export const ShapeRounded: Story = {
  name: 'Shape: Rounded',
  args: { children: 'Rounded', shape: 'rounded' },
};

export const ShapeRect: Story = {
  name: 'Shape: Rect',
  args: { children: 'Rect', shape: 'rect' },
};

const VARIANTS = ['primary', 'secondary', 'ghost', 'danger'] as const;
const SHAPES: ButtonShape[] = ['pill', 'rounded', 'rect'];

export const ShapeMatrix: Story = {
  name: 'Shape × Variant Matrix',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {SHAPES.map((shape) => (
        <div key={shape} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ width: 70, fontSize: 12, color: '#666' }}>{shape}</span>
          {VARIANTS.map((variant) => (
            <Button key={`${shape}-${variant}`} variant={variant} shape={shape} size="sm" onClick={fn()}>
              {variant}
            </Button>
          ))}
        </div>
      ))}
    </div>
  ),
};
