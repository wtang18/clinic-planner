import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import { Button } from './Button';

const meta: Meta<typeof Card> = {
  title: 'Design System/Card',
  component: Card,
  argTypes: {
    variant: {
      control: 'select',
      options: ['interactive', 'non-interactive'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Interactive: Story = {
  args: {
    variant: 'interactive',
    children: <p>Click me - I'm interactive</p>,
  },
};

export const WithComplexContent: Story = {
  render: () => (
    <Card variant="non-interactive">
      <h3 className="font-bold mb-2">Patient Name</h3>
      <p className="text-sm text-gray-600 mb-4">Appointment details</p>
      <Button size="small" label="View Details" />
    </Card>
  ),
};
