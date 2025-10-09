import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ToastProvider, useToast } from './ToastContext';
import { Button } from '@/design-system/components/Button';

const meta = {
  title: 'Design System/Toast Provider',
  component: ToastProvider,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Toast Provider for managing toast notifications.

## Features
- **Single toast queue**: Shows one toast at a time
- **Auto-dismiss**: Toasts auto-dismiss after 5 seconds by default
- **Animations**: Slide up on enter, slide down on exit
- **Position**: Fixed bottom-right corner (24px from edges)

## Usage
\`\`\`tsx
import { ToastProvider, useToast } from '@/contexts/ToastContext';

// Wrap your app
<ToastProvider>
  <App />
</ToastProvider>

// Use in components
function MyComponent() {
  const { toast } = useToast();

  return (
    <button onClick={() => toast.positive('Success!')}>
      Show Toast
    </button>
  );
}
\`\`\`

## Toast Methods
- \`toast.positive(title, options?)\` - Success messages
- \`toast.alert(title, options?)\` - Error messages
- \`toast.attention(title, options?)\` - Warning messages
- \`toast.info(title, options?)\` - Informational messages
- \`toast.icon(title, iconName, options?)\` - Custom icon toast
- \`toast.custom(title, options?)\` - No icon toast

## Toast Options
\`\`\`typescript
interface ToastOptions {
  subtext?: string;
  showSubtext?: boolean;
  ctaLabel?: string;
  onCtaClick?: () => void;
  showCta?: boolean;
  showClose?: boolean;
  autoDismiss?: boolean; // Default: true
}
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ToastProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Demo component to test toast functionality
 */
function ToastDemo() {
  const { toast } = useToast();

  return (
    <div className="flex flex-col gap-4 p-8">
      <h2 className="text-xl font-bold mb-4">Toast Provider Demo</h2>
      <p className="text-sm text-gray-600 mb-6">
        Click buttons to trigger toasts. They appear in bottom-right corner.
        Only one toast shows at a time. Multiple toasts are queued.
      </p>

      <div className="space-y-6">
        {/* Basic Variants */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-gray-700">Basic Variants</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              type="primary"
              size="medium"
              label="Positive"
              onClick={() => toast.positive('Event created successfully!')}
            />
            <Button
              type="primary"
              size="medium"
              label="Alert"
              onClick={() => toast.alert('Failed to save changes')}
            />
            <Button
              type="primary"
              size="medium"
              label="Attention"
              onClick={() => toast.attention('Storage almost full')}
            />
            <Button
              type="primary"
              size="medium"
              label="Info"
              onClick={() => toast.info('New feature available')}
            />
          </div>
        </div>

        {/* With Subtext */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-gray-700">With Subtext</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              type="primary"
              size="medium"
              label="Success + Subtext"
              onClick={() =>
                toast.positive('Changes saved', {
                  showSubtext: true,
                  subtext: 'All updates have been applied to your account.',
                })
              }
            />
            <Button
              type="primary"
              size="medium"
              label="Error + Subtext"
              onClick={() =>
                toast.alert('Upload failed', {
                  showSubtext: true,
                  subtext: 'The file size exceeds the maximum limit of 10MB.',
                })
              }
            />
          </div>
        </div>

        {/* With CTA */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-gray-700">With CTA Button</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              type="primary"
              size="medium"
              label="Info + CTA"
              onClick={() =>
                toast.info('Update available', {
                  showCta: true,
                  ctaLabel: 'Update',
                  onCtaClick: () => console.log('Update clicked'),
                })
              }
            />
            <Button
              type="primary"
              size="medium"
              label="Warning + CTA"
              onClick={() =>
                toast.attention('Storage almost full', {
                  showSubtext: true,
                  subtext: "You're using 90% of your storage.",
                  showCta: true,
                  ctaLabel: 'Upgrade',
                  onCtaClick: () => console.log('Upgrade clicked'),
                })
              }
            />
          </div>
        </div>

        {/* Custom Icons */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-gray-700">Custom Icons</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              type="primary"
              size="medium"
              label="Star Icon"
              onClick={() => toast.icon('Achievement unlocked!', 'star')}
            />
            <Button
              type="primary"
              size="medium"
              label="Bell Icon"
              onClick={() =>
                toast.icon('You have 3 new notifications', 'bell', {
                  showCta: true,
                  ctaLabel: 'View all',
                  onCtaClick: () => console.log('View all clicked'),
                })
              }
            />
            <Button
              type="primary"
              size="medium"
              label="No Icon"
              onClick={() => toast.custom('Settings updated')}
            />
          </div>
        </div>

        {/* No Auto-Dismiss */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-gray-700">
            No Auto-Dismiss (Must Close Manually)
          </h3>
          <div className="flex flex-wrap gap-3">
            <Button
              type="primary"
              size="medium"
              label="Persistent Toast"
              onClick={() =>
                toast.info('This toast stays until you close it', {
                  autoDismiss: false,
                  showClose: true,
                })
              }
            />
          </div>
        </div>

        {/* Queue Test */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-gray-700">Queue Test</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              type="primary"
              size="medium"
              label="Trigger 3 Toasts"
              onClick={() => {
                toast.positive('First toast');
                setTimeout(() => toast.info('Second toast'), 100);
                setTimeout(() => toast.attention('Third toast'), 200);
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Toasts will appear one at a time in sequence
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Interactive demo showing all toast features
 */
export const InteractiveDemo: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  ),
};

/**
 * Simple example showing basic usage
 */
export const BasicExample: Story = {
  render: () => {
    function Example() {
      const { toast } = useToast();

      return (
        <div className="p-8 space-y-4">
          <h3 className="text-lg font-semibold">Basic Toast Example</h3>
          <div className="flex gap-3">
            <Button
              type="primary"
              label="Success"
              onClick={() => toast.positive('Operation completed!')}
            />
            <Button
              type="primary"
              label="Error"
              onClick={() => toast.alert('Something went wrong')}
            />
          </div>
        </div>
      );
    }

    return (
      <ToastProvider>
        <Example />
      </ToastProvider>
    );
  },
};

/**
 * Example with complex toast options
 */
export const ComplexExample: Story = {
  render: () => {
    function Example() {
      const { toast } = useToast();

      const handleAction = () => {
        toast.info('Feature tour started', {
          showSubtext: true,
          subtext: 'Follow the prompts to learn about new features.',
          showCta: true,
          ctaLabel: 'Skip',
          onCtaClick: () => console.log('Tour skipped'),
        });
      };

      return (
        <div className="p-8 space-y-4">
          <h3 className="text-lg font-semibold">Complex Toast Example</h3>
          <Button type="primary" label="Start Feature Tour" onClick={handleAction} />
        </div>
      );
    }

    return (
      <ToastProvider>
        <Example />
      </ToastProvider>
    );
  },
};
