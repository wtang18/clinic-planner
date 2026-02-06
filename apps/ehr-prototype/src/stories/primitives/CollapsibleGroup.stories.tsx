import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CollapsibleGroup } from '../../components/primitives/CollapsibleGroup';
import { Badge } from '../../components/primitives/Badge';
import { Button } from '../../components/primitives/Button';
import { Check } from 'lucide-react';
import { colors, spaceAround } from '../../styles/foundations';

const meta: Meta<typeof CollapsibleGroup> = {
  title: 'Primitives/CollapsibleGroup',
  component: CollapsibleGroup,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Group title displayed in the header',
    },
    isCollapsed: {
      control: 'boolean',
      description: 'Whether the group content is hidden',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Helper wrapper to manage state for stories
const StatefulCollapsibleGroup: React.FC<Omit<React.ComponentProps<typeof CollapsibleGroup>, 'isCollapsed' | 'onToggle'> & { defaultCollapsed?: boolean }> = ({
  defaultCollapsed = false,
  ...props
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  return (
    <CollapsibleGroup
      {...props}
      isCollapsed={isCollapsed}
      onToggle={() => setIsCollapsed(!isCollapsed)}
    />
  );
};

export const Default: Story = {
  name: 'Default (Expanded)',
  render: () => (
    <StatefulCollapsibleGroup title="Section Title">
      <div style={{ padding: spaceAround.compact, backgroundColor: colors.bg.neutral.base, borderRadius: 4 }}>
        <p style={{ margin: 0, fontSize: 14, color: colors.fg.neutral.secondary }}>
          This is the content inside the collapsible group.
        </p>
      </div>
      <div style={{ padding: spaceAround.compact, backgroundColor: colors.bg.neutral.base, borderRadius: 4 }}>
        <p style={{ margin: 0, fontSize: 14, color: colors.fg.neutral.secondary }}>
          Another item in the group.
        </p>
      </div>
    </StatefulCollapsibleGroup>
  ),
};

export const Collapsed: Story = {
  render: () => (
    <StatefulCollapsibleGroup title="Collapsed Section" defaultCollapsed>
      <div style={{ padding: spaceAround.compact, backgroundColor: colors.bg.neutral.base, borderRadius: 4 }}>
        <p style={{ margin: 0, fontSize: 14, color: colors.fg.neutral.secondary }}>
          You should not see this content when collapsed.
        </p>
      </div>
    </StatefulCollapsibleGroup>
  ),
};

export const WithBadge: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <StatefulCollapsibleGroup
        title="Ready to Send"
        badge={{ label: 5, variant: 'success' }}
      >
        <div style={{ padding: spaceAround.compact, backgroundColor: colors.bg.neutral.base, borderRadius: 4 }}>
          <p style={{ margin: 0, fontSize: 14, color: colors.fg.neutral.secondary }}>5 items ready</p>
        </div>
      </StatefulCollapsibleGroup>

      <StatefulCollapsibleGroup
        title="Needs Review"
        badge={{ label: 3, variant: 'warning' }}
      >
        <div style={{ padding: spaceAround.compact, backgroundColor: colors.bg.neutral.base, borderRadius: 4 }}>
          <p style={{ margin: 0, fontSize: 14, color: colors.fg.neutral.secondary }}>3 items need review</p>
        </div>
      </StatefulCollapsibleGroup>

      <StatefulCollapsibleGroup
        title="Failed"
        badge={{ label: 1, variant: 'error' }}
      >
        <div style={{ padding: spaceAround.compact, backgroundColor: colors.bg.neutral.base, borderRadius: 4 }}>
          <p style={{ margin: 0, fontSize: 14, color: colors.fg.neutral.secondary }}>1 failed item</p>
        </div>
      </StatefulCollapsibleGroup>
    </div>
  ),
};

export const WithTrailing: Story = {
  render: () => (
    <StatefulCollapsibleGroup
      title="Ready to Send"
      badge={{ label: 4, variant: 'success' }}
      trailing={
        <div onClick={(e) => e.stopPropagation()}>
          <Button variant="primary" size="sm" leftIcon={<Check size={14} />} onClick={() => alert('Send all!')}>
            Send All
          </Button>
        </div>
      }
    >
      <div style={{ padding: spaceAround.compact, backgroundColor: colors.bg.neutral.base, borderRadius: 4 }}>
        <p style={{ margin: 0, fontSize: 14, color: colors.fg.neutral.secondary }}>Task 1: Lab order</p>
      </div>
      <div style={{ padding: spaceAround.compact, backgroundColor: colors.bg.neutral.base, borderRadius: 4 }}>
        <p style={{ margin: 0, fontSize: 14, color: colors.fg.neutral.secondary }}>Task 2: E-prescribe</p>
      </div>
      <div style={{ padding: spaceAround.compact, backgroundColor: colors.bg.neutral.base, borderRadius: 4 }}>
        <p style={{ margin: 0, fontSize: 14, color: colors.fg.neutral.secondary }}>Task 3: Referral</p>
      </div>
      <div style={{ padding: spaceAround.compact, backgroundColor: colors.bg.neutral.base, borderRadius: 4 }}>
        <p style={{ margin: 0, fontSize: 14, color: colors.fg.neutral.secondary }}>Task 4: Follow-up</p>
      </div>
    </StatefulCollapsibleGroup>
  ),
};

export const MultipleGroups: Story = {
  name: 'Multiple Groups',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <StatefulCollapsibleGroup
        title="Critical"
        badge={{ label: 2, variant: 'error' }}
      >
        <div style={{ padding: spaceAround.compact, backgroundColor: colors.bg.alert.subtle, borderRadius: 4 }}>
          <p style={{ margin: 0, fontSize: 14, color: colors.fg.alert.secondary }}>A1c Screening overdue</p>
        </div>
        <div style={{ padding: spaceAround.compact, backgroundColor: colors.bg.alert.subtle, borderRadius: 4 }}>
          <p style={{ margin: 0, fontSize: 14, color: colors.fg.alert.secondary }}>Blood pressure check needed</p>
        </div>
      </StatefulCollapsibleGroup>

      <StatefulCollapsibleGroup
        title="Important"
        badge={{ label: 3, variant: 'warning' }}
      >
        <div style={{ padding: spaceAround.compact, backgroundColor: colors.bg.attention.subtle, borderRadius: 4 }}>
          <p style={{ margin: 0, fontSize: 14, color: colors.fg.attention.secondary }}>Annual wellness visit</p>
        </div>
        <div style={{ padding: spaceAround.compact, backgroundColor: colors.bg.attention.subtle, borderRadius: 4 }}>
          <p style={{ margin: 0, fontSize: 14, color: colors.fg.attention.secondary }}>Flu vaccine</p>
        </div>
        <div style={{ padding: spaceAround.compact, backgroundColor: colors.bg.attention.subtle, borderRadius: 4 }}>
          <p style={{ margin: 0, fontSize: 14, color: colors.fg.attention.secondary }}>Depression screening</p>
        </div>
      </StatefulCollapsibleGroup>

      <StatefulCollapsibleGroup
        title="Routine"
        badge={{ label: 1, variant: 'default' }}
        defaultCollapsed
      >
        <div style={{ padding: spaceAround.compact, backgroundColor: colors.bg.neutral.base, borderRadius: 4 }}>
          <p style={{ margin: 0, fontSize: 14, color: colors.fg.neutral.secondary }}>Eye exam referral</p>
        </div>
      </StatefulCollapsibleGroup>
    </div>
  ),
};
