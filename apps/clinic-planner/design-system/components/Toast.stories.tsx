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
# Toast Component

Production-ready toast notification system with semantic token integration, auto-dismiss, and flexible content options.

## Quick Reference

**Types**: 6 variants (positive, alert, attention, info, icon, no-icon)
**Auto-dismiss**: Configurable 5-second auto-close with manual override
**Tokens**: Uses semantic color tokens for theme support
**Max Width**: 480px for optimal readability

---

## Features

- ✅ **Semantic Tokens**: Uses \`--color-bg-*\` and \`--color-fg-*\` tokens for automatic theme support
- ✅ **6 Semantic Variants**: Positive, alert, attention, info, custom icon, and no-icon
- ✅ **Flexible Content**: Title, subtext, CTA button, and close button
- ✅ **Auto-dismiss**: Automatic dismissal after 5 seconds (configurable)
- ✅ **Accessibility**: ARIA live regions, keyboard navigation, screen reader support
- ✅ **BicolorIcons**: 32px semantic icons for visual clarity

---

## Types

| Type | Icon | Token | Use Case |
|------|------|-------|----------|
| \`positive\` | BicolorIcon (green checkmark) | \`bg-positive-*\` | Success messages, confirmations |
| \`alert\` | BicolorIcon (red x) | \`bg-alert-*\` | Errors, critical issues |
| \`attention\` | BicolorIcon (yellow exclamation) | \`bg-attention-*\` | Warnings, important notices |
| \`info\` | BicolorIcon (blue info) | \`bg-information-*\` | General information, tips |
| \`icon\` | Custom Icon (32px) | Neutral tokens | Custom notifications |
| \`no-icon\` | None | Neutral tokens | Minimal notifications |

---

## Content Structure

| Element | Required | Size | Use Case |
|---------|----------|------|----------|
| **Title** | Yes | 16px Medium | Primary message (1-2 lines) |
| **Subtext** | Optional | 14px Regular | Additional context (1-3 lines) |
| **CTA Button** | Optional | Small transparent | Action for user to take |
| **Close Button** | Optional | Icon button | Manual dismissal |

**Note:** If \`autoDismiss={false}\`, then \`showClose\` must be \`true\` (validation enforced)

---

## Auto-Dismiss Behavior

Toasts can auto-dismiss after 5 seconds:

\`\`\`tsx
// Auto-dismiss after 5 seconds (default)
<Toast
  type="positive"
  title="Changes saved"
  autoDismiss={true}
  onClose={() => console.log('Closed')}
/>

// Manual dismissal only (requires showClose=true)
<Toast
  type="alert"
  title="Error occurred"
  autoDismiss={false}
  showClose
  onClose={() => console.log('Closed')}
/>
\`\`\`

---

## Token Usage

Toast uses semantic tokens that adapt to themes:

\`\`\`tsx
// Positive toast
<Toast type="positive" title="Success">
  // Icon color: var(--color-fg-positive-primary)
  // Uses: --color-bg-positive-subtle for background
</Toast>

// Alert toast
<Toast type="alert" title="Error">
  // Icon color: var(--color-fg-alert-primary)
  // Uses: --color-bg-alert-subtle for background
</Toast>

// Custom icon
<Toast type="icon" customIcon="star" title="Achievement">
  // Icon color: var(--color-fg-neutral-primary)
  // Uses: --color-bg-neutral-base
</Toast>
\`\`\`

---

## Accessibility

All Toast components follow WCAG 2.1 Level AA guidelines and include comprehensive keyboard and screen reader support.

### Keyboard Navigation

- **Tab**: Focus CTA button or close button
- **Enter or Space**: Activate focused button
- **Escape**: Close toast (if showClose is true)

### Screen Reader Support

Toast automatically includes proper ARIA attributes:
- **aria-live**: "polite" by default (non-intrusive announcements)
- **aria-live="assertive"**: For urgent messages (alert type)
- **role="status"**: Announces toast content when displayed
- **aria-label**: Optional label for toast container

Screen readers announce:
- Toast content (title + subtext) when displayed
- Button labels (CTA and close)
- Live region updates without stealing focus

### ARIA Live Regions

Toast uses ARIA live regions for screen reader announcements:

\`\`\`tsx
// Polite announcement (default - doesn't interrupt)
<Toast
  type="info"
  title="Settings saved"
  aria-live="polite"
/>

// Assertive announcement (interrupts current speech - use for errors)
<Toast
  type="alert"
  title="Connection lost"
  aria-live="assertive"
/>
\`\`\`

### Focus Management

- Toasts do not steal focus when displayed
- Focus moves to CTA button when tabbing
- Close button is keyboard accessible
- Escape key closes toast if enabled

### Auto-Dismiss Accessibility

Auto-dismiss toasts announce before closing:
- 5-second window allows screen reader users to hear content
- User can disable auto-dismiss in accessibility settings
- Manual close button always available as fallback

### Color Contrast

All toast variants meet WCAG AA contrast requirements:
- **Title text**: 4.5:1 contrast ratio
- **Subtext**: 4.5:1 contrast ratio
- **Icons**: High contrast semantic colors
- **Buttons**: Meet button component contrast standards

### Best Practices for Accessibility

✅ **Do**:
- Keep title text concise (1-2 lines)
- Use \`aria-live="assertive"\` only for errors/critical messages
- Provide clear, actionable CTA labels
- Allow manual dismissal for important messages (\`showClose={true}\`)
- Use appropriate toast type for semantic meaning
- Test with screen readers

❌ **Don't**:
- Use auto-dismiss for error messages (users need time to read)
- Stack multiple toasts (can overwhelm screen readers)
- Put critical information only in toasts (they're temporary)
- Use vague titles ("Error", "Success")
- Rely solely on color to convey meaning (use icons + text)
- Make CTA labels ambiguous ("Click here")

---

## Best Practices

### ✅ When to Use Toasts

- Confirm successful actions (save, delete, update)
- Alert users to errors or issues
- Warn about important system states
- Inform about background processes
- Provide optional actions (undo, view, learn more)

### ✅ Do

- Use appropriate type for semantic meaning
- Keep title text short and scannable (1-2 lines)
- Provide subtext for additional context
- Use CTA for actionable items
- Allow manual dismissal for important messages
- Auto-dismiss success messages (5 seconds is good default)
- Stack toasts vertically if showing multiple

### ❌ Don't

- Use toasts for critical errors that require immediate action (use Modal instead)
- Auto-dismiss error messages (users need time to read)
- Put essential information only in toasts (they're temporary)
- Show more than 3 toasts at once (overwhelming)
- Use custom icons for semantic variants (use built-in types)
- Forget to handle onClose callback
        `.trim(),
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

export const AccessibilityDemo: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-bold mb-4">Accessibility Features</h3>
        <p className="text-sm text-gray-700 mb-4">
          Toast notifications are fully keyboard accessible and use ARIA live regions for screen reader support.
        </p>
        <ul className="text-sm space-y-2 mb-6 text-gray-700">
          <li>✓ ARIA live regions for non-intrusive announcements</li>
          <li>✓ Keyboard navigation (Tab, Enter, Escape)</li>
          <li>✓ Screen reader announces title and subtext</li>
          <li>✓ Accessible CTA and close buttons</li>
          <li>✓ WCAG AA color contrast ratios</li>
        </ul>

        <div className="space-y-6">
          {/* ARIA Live Regions */}
          <div>
            <h4 className="text-base font-semibold mb-3">ARIA Live Regions</h4>
            <p className="text-sm text-gray-600 mb-3">
              Toasts use aria-live for screen reader announcements:
            </p>
            <div className="space-y-3 max-w-[480px]">
              <div>
                <p className="text-xs text-gray-600 mb-2">Polite (default - doesn't interrupt):</p>
                <Toast
                  type="info"
                  title="Settings saved"
                  showSubtext
                  subtext="Screen reader announces when current speech finishes"
                  aria-live="polite"
                  showClose
                  autoDismiss={false}
                  onClose={() => console.log('Closed')}
                />
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-2">Assertive (interrupts - use for errors):</p>
                <Toast
                  type="alert"
                  title="Connection lost"
                  showSubtext
                  subtext="Screen reader interrupts to announce immediately"
                  aria-live="assertive"
                  showClose
                  autoDismiss={false}
                  onClose={() => console.log('Closed')}
                />
              </div>
            </div>
          </div>

          {/* Keyboard Navigation */}
          <div>
            <h4 className="text-base font-semibold mb-3">Keyboard Navigation</h4>
            <p className="text-sm text-gray-600 mb-3">
              Try using Tab to focus buttons, Enter/Space to activate, Escape to close:
            </p>
            <div className="max-w-[480px]">
              <Toast
                type="positive"
                title="Keyboard accessible toast"
                showSubtext
                subtext="Press Tab to focus CTA or close button, Escape to dismiss"
                showCta
                ctaLabel="View Details"
                onCtaClick={() => console.log('CTA clicked')}
                showClose
                autoDismiss={false}
                onClose={() => console.log('Closed')}
              />
            </div>
          </div>

          {/* Auto-Dismiss Considerations */}
          <div>
            <h4 className="text-base font-semibold mb-3">Auto-Dismiss Accessibility</h4>
            <p className="text-sm text-gray-600 mb-3">
              Auto-dismiss gives screen reader users 5 seconds to hear content:
            </p>
            <div className="space-y-3 max-w-[480px]">
              <div>
                <p className="text-xs text-gray-600 mb-2">✓ Good - Auto-dismiss for success (transient):</p>
                <Toast
                  type="positive"
                  title="File uploaded successfully"
                  autoDismiss={true}
                  onClose={() => console.log('Auto-dismissed')}
                />
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-2">✓ Good - Manual dismiss for errors (important):</p>
                <Toast
                  type="alert"
                  title="Upload failed - file too large"
                  showSubtext
                  subtext="Maximum size is 10MB"
                  autoDismiss={false}
                  showClose
                  onClose={() => console.log('Closed')}
                />
              </div>
            </div>
          </div>

          {/* Semantic Variants */}
          <div>
            <h4 className="text-base font-semibold mb-3">Semantic Variants with Color Contrast</h4>
            <p className="text-sm text-gray-600 mb-3">
              All variants meet WCAG AA contrast requirements (4.5:1):
            </p>
            <div className="space-y-3 max-w-[480px]">
              <Toast
                type="positive"
                title="Positive - Green theme"
                showClose
                autoDismiss={false}
                onClose={() => console.log('Closed')}
              />
              <Toast
                type="alert"
                title="Alert - Red theme"
                showClose
                autoDismiss={false}
                onClose={() => console.log('Closed')}
              />
              <Toast
                type="attention"
                title="Attention - Yellow theme"
                showClose
                autoDismiss={false}
                onClose={() => console.log('Closed')}
              />
              <Toast
                type="info"
                title="Info - Blue theme"
                showClose
                autoDismiss={false}
                onClose={() => console.log('Closed')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const ClaudeCodeExamples: Story = {
  render: () => (
    <div className="p-8 max-w-4xl bg-[var(--color-bg-neutral-base)]">
      <h2 className="text-2xl font-bold mb-6">Working with Claude Code (AI Assistant)</h2>
      <p className="text-gray-600 mb-8">
        Use these natural language prompts when working with Toast components.
      </p>

      <div className="space-y-8">
        {/* Show Success Toast */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-green-600">✅</span>
            Show Success Toast
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Show a success toast when the form is saved, with 'Changes saved' as the title"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add <code className="bg-gray-100 px-1 rounded">{'<Toast type="positive" title="Changes saved" autoDismiss={true} onClose={...} />'}</code>
          </p>
        </div>

        {/* Add Subtext */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-blue-600">🏷️</span>
            Add Description Text
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Add subtext to the toast explaining that 'All changes will sync across devices'"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add <code className="bg-gray-100 px-1 rounded">showSubtext</code> and <code className="bg-gray-100 px-1 rounded">{'subtext="All changes will sync across devices"'}</code>
          </p>
        </div>

        {/* Add CTA Button */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-purple-600">✨</span>
            Add Action Button
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Add a 'View Details' button to the toast that navigates to the details page"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add <code className="bg-gray-100 px-1 rounded">showCta</code>, <code className="bg-gray-100 px-1 rounded">{'ctaLabel="View Details"'}</code>, and <code className="bg-gray-100 px-1 rounded">onCtaClick</code> handler
          </p>
        </div>

        {/* Show Error Toast */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-red-600">⚠️</span>
            Show Error Toast
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Show an error toast when the API call fails, don't auto-dismiss it"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add <code className="bg-gray-100 px-1 rounded">{'type="alert"'}</code>, <code className="bg-gray-100 px-1 rounded">autoDismiss={'{false}'}</code>, and <code className="bg-gray-100 px-1 rounded">showClose</code>
          </p>
        </div>

        {/* Change Toast Type */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-yellow-600">🎨</span>
            Change Toast Type
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Change this to an attention/warning toast instead of positive"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will change <code className="bg-gray-100 px-1 rounded">{'type="positive"'}</code> to <code className="bg-gray-100 px-1 rounded">{'type="attention"'}</code>
          </p>
        </div>

        {/* Improve Accessibility */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-orange-600">♿</span>
            Improve Accessibility
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Make this error toast announce immediately to screen readers"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add <code className="bg-gray-100 px-1 rounded">{'aria-live="assertive"'}</code> to the Toast
          </p>
        </div>
      </div>

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">💡 Pro Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Use <code className="bg-white px-1 rounded">type="positive"</code> for success, <code className="bg-white px-1 rounded">type="alert"</code> for errors</li>
          <li>• Auto-dismiss success toasts (5s), but keep error toasts visible with <code className="bg-white px-1 rounded">autoDismiss={'{false}'}</code></li>
          <li>• Always provide <code className="bg-white px-1 rounded">showClose</code> when <code className="bg-white px-1 rounded">autoDismiss={'{false}'}</code></li>
          <li>• Use <code className="bg-white px-1 rounded">aria-live="assertive"</code> for critical error toasts</li>
          <li>• Toasts use semantic tokens that automatically adapt to light/dark themes</li>
        </ul>
      </div>
    </div>
  ),
};
