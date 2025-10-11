import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Toast } from './Toast';

const meta = {
  title: 'Design System/Components/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
    controls: {
      // Exclude React props and handlers from controls
      exclude: ['className', 'onClose', 'onCtaClick', 'children', 'ref', 'key'],
    },
    docs: {
      description: {
        component: `
Toast notifications for displaying temporary messages to users.

## Features
- **6 variants**: positive, alert, attention, info, icon (custom), no-icon
- **Flexible content**: Optional subtext, CTA button, and close button
- **Auto-dismiss**: Automatic dismissal after 5 seconds (configurable)
- **Validation**: Ensures proper prop combinations (e.g., autoDismiss=false requires showClose=true)
- **Accessible**: ARIA attributes for screen readers

## Design Specs
- Container: White background, 16px border radius, shadow, 480px max-width
- Icon: 32x32px BicolorIcon for semantic types, 32x32px Icon for custom
- Title: Inter Medium 16px/24px
- Subtext: Inter Regular 14px/20px
- CTA: Button component with transparent type
- Layout: Icon + Text + CTA + Close

## Usage
\`\`\`tsx
import { Toast } from '@/design-system/components/Toast';

// Positive notification
<Toast
  type="positive"
  title="Success!"
  showSubtext
  subtext="Your changes have been saved."
  showClose
  onClose={() => {}}
/>

// With CTA
<Toast
  type="info"
  title="Update available"
  showCta
  ctaLabel="Update"
  onCtaClick={() => {}}
  onClose={() => {}}
/>
\`\`\`

## Icon Sizing
- **BicolorIcon**: 32x32px for semantic variants (positive, alert, attention, info)
- **Regular Icon**: 32x32px for custom icon variant (type="icon")
- Icon size is automatically determined by the type prop
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    // Core variant props
    type: {
      control: 'select',
      options: ['positive', 'alert', 'attention', 'info', 'icon', 'no-icon'],
      description: 'Toast variant type',
    },

    // Content props
    title: {
      control: 'text',
      description: 'Main notification title',
    },

    // Subtext props
    showSubtext: {
      control: 'boolean',
      description: 'Whether to show subtext',
    },
    subtext: {
      control: 'text',
      description: 'Subtext content (only shown if showSubtext=true)',
      if: { arg: 'showSubtext', truthy: true },
      table: {
        defaultValue: { summary: 'Subtext' },
      },
    },

    // CTA props
    showCta: {
      control: 'boolean',
      description: 'Whether to show CTA button',
    },
    ctaLabel: {
      control: 'text',
      description: 'CTA button label',
      if: { arg: 'showCta', truthy: true },
      table: {
        defaultValue: { summary: 'Label' },
      },
    },

    // Close props
    showClose: {
      control: 'boolean',
      description: 'Whether to show close button',
    },
    autoDismiss: {
      control: 'boolean',
      description: 'Auto-dismiss after 5 seconds (default: true)',
    },

    // Custom icon prop
    customIcon: {
      control: 'text',
      description: 'Custom icon name (required when type="icon")',
      if: { arg: 'type', eq: 'icon' },
    },

    // Accessibility props
    'aria-label': {
      control: 'text',
      description: 'Accessible label for the toast',
      table: {
        category: 'Accessibility',
      },
    },
    'aria-live': {
      control: 'select',
      options: ['polite', 'assertive', 'off'],
      description: 'ARIA live region politeness level',
      table: {
        category: 'Accessibility',
        defaultValue: { summary: 'polite' },
      },
    },
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default positive toast with all features enabled.
 */
export const Default: Story = {
  args: {
    type: 'positive',
    title: 'Notification Title',
    showSubtext: true,
    subtext: 'Subtext',
    showCta: true,
    ctaLabel: 'Label',
    showClose: true,
    autoDismiss: false, // Disable for Storybook demo
    onClose: () => console.log('Toast closed'),
    onCtaClick: () => console.log('CTA clicked'),
  },
};

/**
 * Positive variant examples showing different content combinations.
 */
export const PositiveVariant: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-[480px]">
      <div>
        <p className="text-sm font-semibold mb-3 text-gray-700">Full Toast (All Elements)</p>
        <Toast
          type="positive"
          title="Success!"
          showSubtext
          subtext="Your changes have been saved successfully."
          showCta
          ctaLabel="View"
          onCtaClick={() => console.log('View clicked')}
          showClose
          autoDismiss={false}
          onClose={() => console.log('Closed')}
        />
      </div>

      <div>
        <p className="text-sm font-semibold mb-3 text-gray-700">Title + Subtext Only</p>
        <Toast
          type="positive"
          title="Changes saved"
          showSubtext
          subtext="All updates have been applied to your account."
          showClose
          autoDismiss={false}
          onClose={() => console.log('Closed')}
        />
      </div>

      <div>
        <p className="text-sm font-semibold mb-3 text-gray-700">Title + CTA</p>
        <Toast
          type="positive"
          title="Task completed"
          showCta
          ctaLabel="Undo"
          onCtaClick={() => console.log('Undo clicked')}
          showClose
          autoDismiss={false}
          onClose={() => console.log('Closed')}
        />
      </div>

      <div>
        <p className="text-sm font-semibold mb-3 text-gray-700">Title Only</p>
        <Toast
          type="positive"
          title="Item added to favorites"
          showClose
          autoDismiss={false}
          onClose={() => console.log('Closed')}
        />
      </div>
    </div>
  ),
};

/**
 * Alert variant for error or critical notifications.
 */
export const AlertVariant: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-[480px]">
      <div>
        <p className="text-sm font-semibold mb-3 text-gray-700">Full Toast</p>
        <Toast
          type="alert"
          title="Error occurred"
          showSubtext
          subtext="We couldn't process your request. Please try again."
          showCta
          ctaLabel="Retry"
          onCtaClick={() => console.log('Retry clicked')}
          showClose
          autoDismiss={false}
          onClose={() => console.log('Closed')}
        />
      </div>

      <div>
        <p className="text-sm font-semibold mb-3 text-gray-700">Title + Subtext</p>
        <Toast
          type="alert"
          title="Upload failed"
          showSubtext
          subtext="The file size exceeds the maximum limit of 10MB."
          showClose
          autoDismiss={false}
          onClose={() => console.log('Closed')}
        />
      </div>
    </div>
  ),
};

/**
 * Attention variant for warnings or important notices.
 */
export const AttentionVariant: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-[480px]">
      <div>
        <p className="text-sm font-semibold mb-3 text-gray-700">Full Toast</p>
        <Toast
          type="attention"
          title="Storage almost full"
          showSubtext
          subtext="You're using 90% of your storage. Consider upgrading."
          showCta
          ctaLabel="Upgrade"
          onCtaClick={() => console.log('Upgrade clicked')}
          showClose
          autoDismiss={false}
          onClose={() => console.log('Closed')}
        />
      </div>

      <div>
        <p className="text-sm font-semibold mb-3 text-gray-700">Title Only</p>
        <Toast
          type="attention"
          title="Unsaved changes"
          showClose
          autoDismiss={false}
          onClose={() => console.log('Closed')}
        />
      </div>
    </div>
  ),
};

/**
 * Info variant for general informational messages.
 */
export const InfoVariant: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-[480px]">
      <div>
        <p className="text-sm font-semibold mb-3 text-gray-700">Full Toast</p>
        <Toast
          type="info"
          title="New feature available"
          showSubtext
          subtext="Check out the new collaboration tools in settings."
          showCta
          ctaLabel="Learn more"
          onCtaClick={() => console.log('Learn more clicked')}
          showClose
          autoDismiss={false}
          onClose={() => console.log('Closed')}
        />
      </div>

      <div>
        <p className="text-sm font-semibold mb-3 text-gray-700">Title + Subtext</p>
        <Toast
          type="info"
          title="Maintenance scheduled"
          showSubtext
          subtext="System will be down for maintenance on Sunday 2-4 AM."
          showClose
          autoDismiss={false}
          onClose={() => console.log('Closed')}
        />
      </div>
    </div>
  ),
};

/**
 * Custom icon variant using regular Icon component.
 */
export const CustomIcon: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-[480px]">
      <div>
        <p className="text-sm font-semibold mb-3 text-gray-700">Star Icon</p>
        <Toast
          type="icon"
          customIcon="star"
          title="Achievement unlocked!"
          showSubtext
          subtext="You've completed 100 tasks this month."
          showClose
          autoDismiss={false}
          onClose={() => console.log('Closed')}
        />
      </div>

      <div>
        <p className="text-sm font-semibold mb-3 text-gray-700">Bell Icon</p>
        <Toast
          type="icon"
          customIcon="bell"
          title="You have 3 new notifications"
          showCta
          ctaLabel="View all"
          onCtaClick={() => console.log('View all clicked')}
          showClose
          autoDismiss={false}
          onClose={() => console.log('Closed')}
        />
      </div>
    </div>
  ),
};

/**
 * No icon variant for minimal toasts.
 */
export const NoIcon: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-[480px]">
      <div>
        <p className="text-sm font-semibold mb-3 text-gray-700">Title + Subtext</p>
        <Toast
          type="no-icon"
          title="Settings updated"
          showSubtext
          subtext="Your preferences have been saved."
          showClose
          autoDismiss={false}
          onClose={() => console.log('Closed')}
        />
      </div>

      <div>
        <p className="text-sm font-semibold mb-3 text-gray-700">Title Only</p>
        <Toast
          type="no-icon"
          title="Action completed"
          showClose
          autoDismiss={false}
          onClose={() => console.log('Closed')}
        />
      </div>
    </div>
  ),
};

/**
 * Auto-dismiss behavior demonstration.
 * Note: In Storybook, this will auto-dismiss after 5 seconds.
 */
export const AutoDismiss: Story = {
  render: () => {
    const [visible, setVisible] = React.useState(true);

    return (
      <div className="w-[480px]">
        {visible ? (
          <Toast
            type="positive"
            title="This toast will auto-dismiss in 5 seconds"
            showSubtext
            subtext="Watch as it automatically closes..."
            showClose
            autoDismiss={true}
            onClose={() => {
              setVisible(false);
              console.log('Auto-dismissed');
            }}
          />
        ) : (
          <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
            <p className="text-sm text-gray-600">Toast was auto-dismissed!</p>
            <button
              onClick={() => setVisible(true)}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              Show again
            </button>
          </div>
        )}
      </div>
    );
  },
};

/**
 * All variants side by side for comparison.
 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-[480px]">
      <div>
        <p className="text-xs font-semibold mb-2 text-gray-500">POSITIVE</p>
        <Toast
          type="positive"
          title="Success notification"
          showSubtext
          subtext="This is a positive message."
          showClose
          autoDismiss={false}
          onClose={() => console.log('Closed')}
        />
      </div>

      <div>
        <p className="text-xs font-semibold mb-2 text-gray-500">ALERT</p>
        <Toast
          type="alert"
          title="Error notification"
          showSubtext
          subtext="This is an alert message."
          showClose
          autoDismiss={false}
          onClose={() => console.log('Closed')}
        />
      </div>

      <div>
        <p className="text-xs font-semibold mb-2 text-gray-500">ATTENTION</p>
        <Toast
          type="attention"
          title="Warning notification"
          showSubtext
          subtext="This is an attention message."
          showClose
          autoDismiss={false}
          onClose={() => console.log('Closed')}
        />
      </div>

      <div>
        <p className="text-xs font-semibold mb-2 text-gray-500">INFO</p>
        <Toast
          type="info"
          title="Info notification"
          showSubtext
          subtext="This is an informational message."
          showClose
          autoDismiss={false}
          onClose={() => console.log('Closed')}
        />
      </div>

      <div>
        <p className="text-xs font-semibold mb-2 text-gray-500">CUSTOM ICON</p>
        <Toast
          type="icon"
          customIcon="star"
          title="Custom icon notification"
          showSubtext
          subtext="This uses a custom icon."
          showClose
          autoDismiss={false}
          onClose={() => console.log('Closed')}
        />
      </div>

      <div>
        <p className="text-xs font-semibold mb-2 text-gray-500">NO ICON</p>
        <Toast
          type="no-icon"
          title="No icon notification"
          showSubtext
          subtext="This has no icon."
          showClose
          autoDismiss={false}
          onClose={() => console.log('Closed')}
        />
      </div>
    </div>
  ),
};
