import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Pill } from './Pill';

const meta: Meta<typeof Pill> = {
  title: 'Design System/Components/Pill',
  component: Pill,
  tags: ['autodocs'],
  argTypes: {
    // Core variant props
    type: {
      control: 'select',
      options: ['transparent', 'outlined', 'subtle-outlined', 'positive', 'attention', 'alert', 'alert-emphasis', 'info', 'info-emphasis', 'accent', 'accent-emphasis', 'no-fill', 'carby'],
      description: 'The visual style variant of the pill',
    },
    size: {
      control: 'select',
      options: ['x-small', 'small', 'medium'],
      description: 'The size of the pill',
    },
    iconOnly: {
      control: 'boolean',
      description: 'Whether to show only an icon (no text)',
    },
    truncate: {
      control: 'boolean',
      description: 'Truncate text with ellipsis when it overflows (use with max-width constraints)',
    },

    // Content props
    label: {
      control: 'text',
      description: 'The main label text',
      if: { arg: 'iconOnly', truthy: false },
    },

    // Icon props
    // Note: iconL and iconR accept IconName types (386+ options) which don't work well with Storybook controls
    // Icon names must be specified directly in code (see IconVariations story for examples)
    // Icon size is automatically 20px (small) for all pill sizes
    // Icons render automatically when iconL/iconR props are provided

    // Subtext props
    showSubtextL: {
      control: 'boolean',
      description: 'Show left subtext',
      if: { arg: 'iconOnly', truthy: false },
    },
    subtextL: {
      control: 'text',
      description: 'Left subtext content',
      if: {
        arg: 'showSubtextL',
        truthy: true
      },
      table: {
        defaultValue: { summary: 'Left' },
      },
    },
    showSubtextR: {
      control: 'boolean',
      description: 'Show right subtext',
      if: { arg: 'iconOnly', truthy: false },
    },
    subtextR: {
      control: 'text',
      description: 'Right subtext content',
      if: {
        arg: 'showSubtextR',
        truthy: true
      },
      table: {
        defaultValue: { summary: 'Right' },
      },
    },

    // Interaction props
    interactive: {
      control: 'boolean',
      description: 'Whether the pill is interactive (clickable)',
    },
    state: {
      control: 'select',
      options: ['default', 'hover', 'disabled'],
      description: 'Visual state (only applies when interactive)',
      if: { arg: 'interactive', truthy: true },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state (alias for state="disabled")',
      if: { arg: 'interactive', truthy: true },
    },

    // Accessibility props
    'aria-label': {
      control: 'text',
      description: 'Accessible label (required for icon-only pills)',
      table: {
        category: 'Accessibility',
      },
    },
    'aria-describedby': {
      control: 'text',
      description: 'ID of element describing the pill',
      table: {
        category: 'Accessibility',
      },
    },
  },

  parameters: {
    controls: {
      // Exclude icon and React props from controls
      exclude: ['iconL', 'iconR', 'leftIcon', 'rightIcon', 'onClick', 'children', 'className', 'style', 'ref', 'key'],
    },
    docs: {
      description: {
        component: `
# Pill Component

Production-ready pill/badge component with semantic token integration and comprehensive variant support.

## Quick Reference

See the **Visual Examples** story below for a quick preview of pill variants.

**Types**: 12 variants (transparent, outlined, subtle-outlined, positive, attention, alert, alert-emphasis, info, info-emphasis, accent, accent-emphasis, no-fill, carby)
**Sizes**: 3 sizes (x-small, small, medium)
**Tokens**: Uses semantic color tokens for theme support
**Icons**: 386+ icons supported via iconL/iconR props (small/medium sizes only)

## Features
- Semantic design tokens for theme-aware styling
- 12 distinct visual types for different use cases
- Optional left/right icons with automatic sizing
- Optional left/right subtexts for metadata
- Text truncation with ellipsis for long content
- Interactive states (hover/disabled) when clickable
- Icon-only mode with proper centering
- Accessibility with aria-label support
- Figma design system integration

## Pill Types
| Type | Background Token | Foreground Token | Use Case |
|------|------------------|------------------|----------|
| \`transparent\` | \`bg-transparent-low\` | \`fg-neutral-primary\` | Glassmorphism, overlays |
| \`outlined\` | \`bg-neutral-medium\` (border) | \`fg-neutral-primary\` | Neutral borders |
| \`subtle-outlined\` | \`bg-neutral-subtle\` (border) | \`fg-neutral-secondary\` | Very subtle borders |
| \`positive\` | \`bg-positive-low\` | \`fg-positive-primary\` | Success, completed |
| \`attention\` | \`bg-attention-low\` | \`fg-attention-primary\` | Warnings, pending |
| \`alert\` | \`bg-alert-low\` | \`fg-alert-primary\` | Errors, critical |
| \`alert-emphasis\` | \`bg-alert-high\` | \`fg-neutral-inverse-primary\` | Urgent/critical errors |
| \`info\` | \`bg-information-low\` | \`fg-information-primary\` | Informational |
| \`info-emphasis\` | \`bg-information-high\` | \`fg-neutral-inverse-primary\` | High-priority info |
| \`accent\` | \`bg-accent-low\` | \`fg-accent-primary\` | Featured content |
| \`accent-emphasis\` | \`bg-accent-high\` | \`fg-neutral-inverse-primary\` | Emphasized featured content |
| \`no-fill\` | transparent | \`fg-neutral-primary\` | Minimal styling |
| \`carby\` | \`bg-carby-default\` | \`fg-carby-primary\` | Brand-specific |

## Icon System
The \`iconL\` and \`iconR\` props accept icon names from the icon library (386+ options):
- **Icon Sizes**: Always 20px (small) for all pill sizes
- **Icon Support**: Only available for \`small\` and \`medium\` sizes (not \`x-small\`)
- **Icon-Only Mode**: Set \`iconOnly={true}\` for icon-only pills (requires aria-label)
- **Examples**:
  - \`iconL="star"\` - Star icon on left
  - \`iconR="chevron-down"\` - Chevron down icon on right
  - \`iconL="checkmark" iconR="arrow-right"\` - Both icons

See IconVariations story for comprehensive examples.

## Subtext System
The \`subtextL\` and \`subtextR\` props add small text before/after the label:
- **Default Behavior**: Shown by default when content is provided
- **Hide Subtexts**: Use \`showSubtextL={false}\` or \`showSubtextR={false}\`
- **Icon-Only Mode**: Subtexts automatically hidden when \`iconOnly={true}\`
- **Examples**:
  - \`subtextL="Q1" label="2024" subtextR="Jan"\` - Quarter/year/month metadata
  - \`subtextL="3" label="Tasks"\` - Count prefix
  - \`subtextL="URL" label="https://..."\` - Label prefix

## Sizes
| Size | Height | Text Style | Icons | Icon-Only | Use Case |
|------|--------|------------|-------|-----------|----------|
| \`x-small\` | 20px | text-xs | ❌ No | ❌ No | Compact spaces, dense lists |
| \`small\` | 24px | text-xs | ✅ Yes | ✅ Yes | Default, most common |
| \`medium\` | 32px | text-sm | ✅ Yes | ✅ Yes | Larger touch targets |

## Text Truncation
The \`truncate\` prop enables text truncation with ellipsis:
- Set \`truncate={true}\` on the Pill component
- Apply a max-width constraint via \`className\` (e.g., \`className="max-w-[200px]"\`)
- Text will automatically truncate with \`...\` when it exceeds the max-width
- **Subtexts Preserved**: Subtexts won't truncate (useful for labels like "URL")

**Example**:
\`\`\`tsx
<Pill
  subtextL="URL"
  label="https://www.example.com/very-long-path/to/resource/page.html"
  truncate
  className="max-w-[200px]"
/>
// Result: "URL https://www.examp..."
\`\`\`

See TextTruncation story for examples.

## Interactive States
Pills can be interactive (clickable) with hover/disabled states:
- Set \`interactive={true}\` to enable hover effects
- Add \`onClick\` handler for click events
- Use \`disabled={true}\` or \`state="disabled"\` to disable
- Disabled pills use gray background with reduced opacity

## Token Usage Examples

### Semantic Tokens (Recommended)
\`\`\`tsx
// Success state
<Pill type="positive" label="Completed" />
// Uses: bg-positive-low, fg-positive-primary

// Warning state
<Pill type="attention" label="Pending" />
// Uses: bg-attention-low, fg-attention-primary

// Error state
<Pill type="alert" label="Failed" />
// Uses: bg-alert-low, fg-alert-primary
\`\`\`

### Transparent Backgrounds
\`\`\`tsx
// Glassmorphism effect
<Pill type="transparent" label="Overlay" />
// Uses: bg-transparent-low (with alpha channel)
// Hover: bg-transparent-low-accented
\`\`\`

### Brand Colors
\`\`\`tsx
// Brand-specific styling
<Pill type="carby" label="Premium" />
// Uses: bg-carby-default, fg-carby-primary
\`\`\`

## Best Practices

### When to Use Pills
✅ Status indicators (success, warning, error)
✅ Category tags and labels
✅ Metadata badges (counts, dates)
✅ Filter chips in search interfaces
✅ Notification badges
✅ Icon-only action buttons (small UI controls)

### Accessibility
✅ Always provide \`aria-label\` for icon-only pills
✅ Use semantic types that match the content meaning
✅ Ensure sufficient color contrast (all types are WCAG AA compliant)
✅ Provide clear labels (avoid vague text like "Info")

### Common Patterns
\`\`\`tsx
// Status badge with icon
<Pill type="positive" iconL="checkmark" label="Completed" />

// Count badge
<Pill subtextL="3" label="Tasks" subtextR="pending" />

// Interactive tag
<Pill type="outlined" label="React" interactive onClick={handleRemove} />

// URL truncation
<Pill subtextL="URL" label={longUrl} truncate className="max-w-[200px]" />
\`\`\`
        `.trim(),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Pill>;

// Visual Examples Story - appears first in docs
export const VisualExamples: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '16px', background: '#f5f5f5', borderRadius: '8px', alignItems: 'center' }}>
      <Pill type="positive" size="medium" label="Positive" />
      <Pill type="attention" size="medium" label="Attention" />
      <Pill type="alert" size="medium" label="Alert" />
      <Pill type="info" size="medium" label="Info" />
      <Pill type="accent" size="medium" label="Accent" />
      <Pill type="outlined" size="small" label="Outlined" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Quick visual reference showing the main pill variants.',
      },
    },
  },
};

export const Playground: Story = {
  args: {
    type: 'transparent',
    size: 'medium',
    iconOnly: false,
    truncate: false,
    label: 'Pill Label',
    showSubtextL: false,
    showSubtextR: false,
    interactive: false,
    state: 'default',
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes (e.g., "max-w-[200px]" for truncation)',
      if: { arg: 'truncate', truthy: true },
    },
  },
};

export const AllTypes: Story = {
  render: () => (
    <div className="p-8 space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-2">All 12 Pill Types</h3>
        <div className="flex flex-wrap gap-2">
          <Pill type="transparent" label="Transparent" />
          <Pill type="outlined" label="Outlined" />
          <Pill type="subtle-outlined" label="Subtle Outlined" />
          <Pill type="positive" label="Positive" />
          <Pill type="attention" label="Attention" />
          <Pill type="alert" label="Alert" />
          <Pill type="alert-emphasis" label="Alert Emphasis" />
          <Pill type="info" label="Info" />
          <Pill type="info-emphasis" label="Info Emphasis" />
          <Pill type="accent" label="Accent" />
          <Pill type="accent-emphasis" label="Accent Emphasis" />
          <Pill type="no-fill" label="No Fill" />
          <Pill type="carby" label="Carby" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Emphasis Variants Comparison</h3>
        <p className="text-sm text-gray-600 mb-3">
          Emphasis variants use high-contrast backgrounds with inverse text for important messaging.
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-500 w-20">Alert:</span>
            <Pill type="alert" label="Standard" />
            <Pill type="alert-emphasis" label="Emphasis" />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-500 w-20">Info:</span>
            <Pill type="info" label="Standard" />
            <Pill type="info-emphasis" label="Emphasis" />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-500 w-20">Accent:</span>
            <Pill type="accent" label="Standard" />
            <Pill type="accent-emphasis" label="Emphasis" />
          </div>
        </div>
      </div>
    </div>
  ),
};

export const WithSubtexts: Story = {
  render: () => (
    <div className="p-8 space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-2">Subtexts (shown by default when provided)</h3>
        <div className="flex flex-wrap gap-2">
          <Pill size="medium" label="Tasks" subtextL="3" subtextR="pending" />
          <Pill size="small" label="Completed" subtextL="✓" />
          <Pill size="x-small" label="2024" subtextL="Q1" subtextR="Jan" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Subtexts explicitly hidden with showSubtext=false</h3>
        <div className="flex flex-wrap gap-2">
          <Pill size="medium" label="Tasks" subtextL="3" subtextR="pending" showSubtextL={false} />
          <Pill size="medium" label="Tasks" subtextL="3" subtextR="pending" showSubtextR={false} />
          <Pill size="medium" label="Tasks" subtextL="3" subtextR="pending" showSubtextL={false} showSubtextR={false} />
        </div>
      </div>
    </div>
  ),
};

export const IconVariations: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Icon Library Examples</h3>
        <p className="text-sm text-gray-600 mb-4">
          The icon system provides 386+ icons. Specify icon names via iconL and iconR props.
        </p>
        <div className="flex flex-wrap gap-2">
          <Pill iconL="checkmark" label="Checkmark" />
          <Pill iconL="heart" label="Favorite" />
          <Pill iconL="star" label="Star" />
          <Pill iconL="bell" label="Notifications" />
          <Pill iconL="calendar" label="Schedule" />
          <Pill iconL="envelope" label="Email" />
          <Pill iconL="phone" label="Call" />
          <Pill iconL="trash" label="Delete" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Navigation Icons</h3>
        <div className="flex flex-wrap gap-2">
          <Pill iconL="arrow-left" label="Back" type="outlined" />
          <Pill iconR="arrow-right" label="Next" type="outlined" />
          <Pill iconL="arrow-up" label="Up" type="outlined" />
          <Pill iconR="arrow-down" label="Down" type="outlined" />
          <Pill iconL="home" label="Home" type="outlined" />
          <Pill iconR="external-link" label="Open" type="outlined" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Status Icons</h3>
        <div className="flex flex-wrap gap-2">
          <Pill iconL="checkmark" label="Success" type="positive" />
          <Pill iconL="alert" label="Warning" type="attention" />
          <Pill iconL="close" label="Error" type="alert" />
          <Pill iconL="info" label="Info" type="info" />
          <Pill iconL="star" label="Featured" type="accent" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Icon-Only Pills (sm/md only)</h3>
        <div className="flex flex-wrap gap-2">
          <Pill size="medium" iconOnly iconL="gear" aria-label="Settings" />
          <Pill size="small" iconOnly iconL="star" aria-label="Favorite" />
          <Pill size="medium" iconOnly iconL="checkmark" type="positive" aria-label="Success" />
          <Pill size="medium" iconOnly iconL="close" type="alert" aria-label="Close" />
          <Pill size="small" iconOnly iconL="info" type="info" aria-label="Info" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Combined Icons (Left + Right)</h3>
        <div className="flex flex-wrap gap-2">
          <Pill iconL="star" label="Featured" iconR="chevron-compact-down" />
          <Pill iconL="calendar" label="Schedule" iconR="arrow-right" type="outlined" />
          <Pill iconL="alert" label="Alert" iconR="close" type="attention" />
        </div>
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="p-8 space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-2">Extra Small (xs) - 20px height, no icons</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <Pill size="x-small" label="Extra Small" />
          <Pill size="x-small" type="positive" label="Success" />
          <Pill size="x-small" subtextL="Q1" label="2024" subtextR="Jan" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Small (sm) - 24px height, icons supported</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <Pill size="small" label="Small" />
          <Pill size="small" type="positive" label="Success" />
          <Pill size="small" iconL="checkmark" label="With Icon" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Medium (md) - 32px height, icons supported</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <Pill size="medium" label="Medium" />
          <Pill size="medium" type="positive" label="Success" />
          <Pill size="medium" iconL="checkmark" label="With Icon" />
        </div>
      </div>
    </div>
  ),
};

export const InteractiveStates: Story = {
  render: () => (
    <div className="p-8 space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-2">Interactive Pills (hover to see effect)</h3>
        <div className="flex flex-wrap gap-2">
          <Pill type="positive" label="Interactive Positive" interactive onClick={() => alert('Clicked!')} />
          <Pill type="outlined" label="Interactive Outlined" interactive onClick={() => alert('Clicked!')} />
          <Pill type="no-fill" label="Interactive No Fill" interactive onClick={() => alert('Clicked!')} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Disabled Pills</h3>
        <div className="flex flex-wrap gap-2">
          <Pill type="transparent" label="Disabled" disabled />
          <Pill type="positive" label="Disabled Positive" disabled />
          <Pill type="alert" label="Disabled Alert" disabled />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">State Variants (interactive required)</h3>
        <div className="flex flex-wrap gap-2">
          <Pill type="positive" label="Default State" interactive state="default" />
          <Pill type="positive" label="Hover State" interactive state="hover" />
          <Pill type="positive" label="Disabled State" interactive state="disabled" />
        </div>
      </div>
    </div>
  ),
};

export const IconOnlyCentering: Story = {
  render: () => (
    <div className="p-8 space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-2">Icon-Only Pills - Properly Centered</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <Pill size="medium" iconOnly iconL="gear" aria-label="Settings" />
          <Pill size="small" iconOnly iconL="star" aria-label="Favorite" />
          <Pill size="medium" iconOnly iconL="checkmark" type="positive" aria-label="Success" />
          <Pill size="medium" iconOnly iconL="close" type="alert" aria-label="Close" />
          <Pill size="small" iconOnly iconL="info" type="info" aria-label="Info" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Comparison: Icon-Only vs Regular Pills (Same Size)</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <Pill size="medium" iconOnly iconL="star" aria-label="Favorite" type="accent" />
          <Pill size="medium" iconL="star" label="Favorite" type="accent" />
        </div>
      </div>
    </div>
  ),
};

export const TextTruncation: Story = {
  render: () => (
    <div className="p-8 space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-2">Text Truncation with Max-Width Constraints</h3>
        <p className="text-sm text-gray-600 mb-4">
          When <code>truncate={'{true}'}</code>, text will truncate with ellipsis at the max-width boundary.
        </p>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">max-w-[150px]</p>
            <Pill
              type="transparent"
              size="small"
              label="This is a very long text that will be truncated"
              truncate
              className="max-w-[150px]"
            />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">max-w-[200px]</p>
            <Pill
              type="transparent"
              size="small"
              label="This is a very long text that will be truncated"
              truncate
              className="max-w-[200px]"
            />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">max-w-[300px]</p>
            <Pill
              type="transparent"
              size="small"
              label="This is a very long text that will be truncated"
              truncate
              className="max-w-[300px]"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Truncation with Subtexts (Subtexts Preserved)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Subtexts have <code>shrink-0</code> and won't truncate, ensuring labels like "URL" remain visible.
        </p>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">URL Pill - max-w-[200px]</p>
            <Pill
              type="transparent"
              size="small"
              subtextL="URL"
              label="https://www.example.com/very-long-path/to/resource/page.html"
              truncate
              className="max-w-[200px]"
            />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">File Path - max-w-[250px]</p>
            <Pill
              type="transparent"
              size="small"
              subtextL="Path"
              label="/Users/username/Documents/Projects/my-project/src/components/design-system/Pill.tsx"
              truncate
              className="max-w-[250px]"
            />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Email - max-w-[180px]</p>
            <Pill
              type="transparent"
              size="small"
              subtextL="To"
              label="very.long.email.address@example-domain.com"
              truncate
              className="max-w-[180px]"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Without Truncation (Comparison)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Without <code>truncate</code> prop, text overflows the container.
        </p>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">No truncate - max-w-[200px] (text overflows)</p>
            <Pill
              type="transparent"
              size="small"
              label="This is a very long text that will overflow the container"
              className="max-w-[200px]"
            />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">With truncate - max-w-[200px] (text truncates with ellipsis)</p>
            <Pill
              type="transparent"
              size="small"
              label="This is a very long text that will overflow the container"
              truncate
              className="max-w-[200px]"
            />
          </div>
        </div>
      </div>
    </div>
  ),
};

export const AdvancedExamples: Story = {
  render: () => (
    <div className="p-8 space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-2">Complex Pills with All Features</h3>
        <div className="flex flex-wrap gap-2">
          <Pill
            type="attention"
            size="medium"
            label="Alert"
            iconL="alert"
            subtextR="2"
            interactive
            onClick={() => alert('Alert clicked!')}
          />
          <Pill
            type="positive"
            size="medium"
            label="Download"
            iconR="arrow-down"
            interactive
            onClick={() => alert('Download clicked!')}
          />
          <Pill
            type="info"
            size="small"
            iconL="info"
            subtextL="i"
            label="Information"
            subtextR="new"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Accessibility: Icon-only with aria-label</h3>
        <div className="flex flex-wrap gap-2">
          <Pill size="medium" iconOnly iconL="close" type="alert" aria-label="Close notification" interactive />
          <Pill size="medium" iconOnly iconL="heart" type="positive" aria-label="Like this item" interactive />
          <Pill size="small" iconOnly iconL="share" type="info" aria-label="Share content" interactive />
        </div>
      </div>
    </div>
  ),
};

export const ClaudeCodeExamples: Story = {
  render: () => (
    <div className="p-8 max-w-4xl bg-[var(--color-bg-neutral-base)]">
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">Working with Claude Code (AI Assistant)</h2>
      <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-8">
        When working with Claude Code, use these example prompts to modify Pill components.
        Claude understands the component's prop API and semantic token system.
      </p>

      <div className="space-y-8">
        {/* Example 1: Update Pill Type */}
        <div className="border rounded-lg p-6 bg-[var(--color-bg-neutral-subtle)]">
          <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-neutral-primary)]">1. Update Pill Type</h3>
          <div className="mb-3">
            <code className="text-sm bg-[var(--color-bg-neutral-low)] px-2 py-1 rounded text-[var(--color-fg-accent-primary)]">
              "Change the status pill from outlined to positive type"
            </code>
          </div>
          <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-2">
            <strong>Expected:</strong> Claude will update <code>type="outlined"</code> to <code>type="positive"</code>
          </p>
          <div className="flex gap-3 items-center mt-4">
            <div>
              <p className="text-xs text-[var(--color-fg-neutral-secondary)] mb-1">Before:</p>
              <Pill type="outlined" label="Status" />
            </div>
            <span className="text-[var(--color-fg-neutral-secondary)]">→</span>
            <div>
              <p className="text-xs text-[var(--color-fg-neutral-secondary)] mb-1">After:</p>
              <Pill type="positive" label="Status" />
            </div>
          </div>
        </div>

        {/* Example 2: Add Icon to Pill */}
        <div className="border rounded-lg p-6 bg-[var(--color-bg-neutral-subtle)]">
          <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-neutral-primary)]">2. Add Icon to Pill</h3>
          <div className="mb-3">
            <code className="text-sm bg-[var(--color-bg-neutral-low)] px-2 py-1 rounded text-[var(--color-fg-accent-primary)]">
              "Add a checkmark icon to the left of the completed pill"
            </code>
          </div>
          <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-2">
            <strong>Expected:</strong> Claude will add <code>iconL="checkmark"</code> to the Pill component
          </p>
          <div className="flex gap-3 items-center mt-4">
            <div>
              <p className="text-xs text-[var(--color-fg-neutral-secondary)] mb-1">Before:</p>
              <Pill type="positive" label="Completed" />
            </div>
            <span className="text-[var(--color-fg-neutral-secondary)]">→</span>
            <div>
              <p className="text-xs text-[var(--color-fg-neutral-secondary)] mb-1">After:</p>
              <Pill type="positive" iconL="checkmark" label="Completed" />
            </div>
          </div>
        </div>

        {/* Example 3: Migrate to Semantic Tokens */}
        <div className="border rounded-lg p-6 bg-[var(--color-bg-neutral-subtle)]">
          <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-neutral-primary)]">3. Migrate to Semantic Tokens</h3>
          <div className="mb-3">
            <code className="text-sm bg-[var(--color-bg-neutral-low)] px-2 py-1 rounded text-[var(--color-fg-accent-primary)]">
              "Update the error pill to use semantic alert tokens instead of hardcoded colors"
            </code>
          </div>
          <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-2">
            <strong>Expected:</strong> Claude will change from custom className to <code>type="alert"</code>
          </p>
          <div className="mt-4">
            <p className="text-xs text-[var(--color-fg-neutral-secondary)] mb-2">Code transformation:</p>
            <pre className="text-xs bg-[var(--color-bg-neutral-low)] p-3 rounded overflow-x-auto">
{`// Before
<Pill className="bg-red-100 text-red-700" label="Error" />

// After
<Pill type="alert" label="Error" />`}
            </pre>
          </div>
        </div>

        {/* Example 4: Make Pill Interactive */}
        <div className="border rounded-lg p-6 bg-[var(--color-bg-neutral-subtle)]">
          <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-neutral-primary)]">4. Make Pill Interactive</h3>
          <div className="mb-3">
            <code className="text-sm bg-[var(--color-bg-neutral-low)] px-2 py-1 rounded text-[var(--color-fg-accent-primary)]">
              "Make the tag pill clickable and add a handler to remove it"
            </code>
          </div>
          <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-2">
            <strong>Expected:</strong> Claude will add <code>interactive</code> and <code>onClick</code> props
          </p>
          <div className="flex gap-3 items-center mt-4">
            <div>
              <p className="text-xs text-[var(--color-fg-neutral-secondary)] mb-1">Before (not clickable):</p>
              <Pill type="outlined" label="React" />
            </div>
            <span className="text-[var(--color-fg-neutral-secondary)]">→</span>
            <div>
              <p className="text-xs text-[var(--color-fg-neutral-secondary)] mb-1">After (clickable with hover):</p>
              <Pill type="outlined" label="React" interactive onClick={() => alert('Removed!')} />
            </div>
          </div>
        </div>

        {/* Example 5: Add Subtext */}
        <div className="border rounded-lg p-6 bg-[var(--color-bg-neutral-subtle)]">
          <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-neutral-primary)]">5. Add Count Subtext</h3>
          <div className="mb-3">
            <code className="text-sm bg-[var(--color-bg-neutral-low)] px-2 py-1 rounded text-[var(--color-fg-accent-primary)]">
              "Add a count of 5 to the left of the tasks pill"
            </code>
          </div>
          <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-2">
            <strong>Expected:</strong> Claude will add <code>subtextL="5"</code>
          </p>
          <div className="flex gap-3 items-center mt-4">
            <div>
              <p className="text-xs text-[var(--color-fg-neutral-secondary)] mb-1">Before:</p>
              <Pill type="info" label="Tasks" />
            </div>
            <span className="text-[var(--color-fg-neutral-secondary)]">→</span>
            <div>
              <p className="text-xs text-[var(--color-fg-neutral-secondary)] mb-1">After:</p>
              <Pill type="info" subtextL="5" label="Tasks" />
            </div>
          </div>
        </div>

        {/* Example 6: Choose Right Pill Type */}
        <div className="border rounded-lg p-6 bg-[var(--color-bg-neutral-subtle)]">
          <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-neutral-primary)]">6. Choose Right Pill Type</h3>
          <div className="mb-3">
            <code className="text-sm bg-[var(--color-bg-neutral-low)] px-2 py-1 rounded text-[var(--color-fg-accent-primary)]">
              "Show a warning pill for pending approval items"
            </code>
          </div>
          <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-2">
            <strong>Expected:</strong> Claude will choose <code>type="attention"</code> (yellow/warning semantic)
          </p>
          <div className="mt-4">
            <p className="text-xs text-[var(--color-fg-neutral-secondary)] mb-2">Claude's reasoning:</p>
            <ul className="text-xs text-[var(--color-fg-neutral-secondary)] list-disc list-inside space-y-1 mb-3">
              <li><code>positive</code> - Success/completed (green) ❌</li>
              <li><code>attention</code> - Warning/pending (yellow) ✅</li>
              <li><code>alert</code> - Error/critical (red) ❌</li>
            </ul>
            <Pill type="attention" label="Pending Approval" />
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-[var(--color-bg-information-low)] rounded-lg">
        <p className="text-sm text-[var(--color-fg-information-primary)]">
          <strong>💡 Tip:</strong> Claude understands the semantic token system and will choose appropriate pill types
          based on context (positive for success, attention for warnings, alert for errors, etc.)
        </p>
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
          Pill components follow WCAG 2.1 Level AA guidelines with proper color contrast and keyboard support for interactive pills.
        </p>
        <ul className="text-sm space-y-2 mb-6 text-gray-700">
          <li>✓ WCAG AA color contrast ratios for all variants</li>
          <li>✓ Keyboard navigation for interactive pills (Tab, Enter, Space)</li>
          <li>✓ Screen reader support with proper ARIA attributes</li>
          <li>✓ Semantic color meanings (green=positive, red=alert, yellow=attention)</li>
          <li>✓ Text truncation with full text available to screen readers</li>
        </ul>

        <div className="space-y-6">
          {/* Interactive Pills */}
          <div>
            <h4 className="text-base font-semibold mb-3">Interactive Pills (Keyboard Accessible)</h4>
            <p className="text-sm text-gray-600 mb-3">
              Try using Tab to focus, then Enter or Space to activate:
            </p>
            <div className="flex flex-wrap gap-3">
              <Pill type="outlined" label="Clickable Tag" interactive onClick={() => alert('Clicked!')} />
              <Pill type="info" label="Filter: Active" interactive onClick={() => alert('Filter toggled')} />
              <Pill type="attention" label="Remove" interactive iconR="close" onClick={() => alert('Removed')} />
            </div>
          </div>

          {/* Color Contrast */}
          <div>
            <h4 className="text-base font-semibold mb-3">Color Contrast (WCAG AA Compliant)</h4>
            <p className="text-sm text-gray-600 mb-3">
              All pill types meet 4.5:1 contrast requirements:
            </p>
            <div className="flex flex-wrap gap-3">
              <Pill type="positive" label="Success (4.5:1+)" />
              <Pill type="alert" label="Error (4.5:1+)" />
              <Pill type="attention" label="Warning (4.5:1+)" />
              <Pill type="info" label="Info (4.5:1+)" />
              <Pill type="outlined" label="Neutral (3:1+)" />
            </div>
          </div>

          {/* Semantic Meaning */}
          <div>
            <h4 className="text-base font-semibold mb-3">Semantic Color Meanings</h4>
            <p className="text-sm text-gray-600 mb-3">
              Colors convey meaning to sighted users AND via semantic type names for screen readers:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Pill type="positive" label="Completed" />
                <span className="text-sm text-gray-600">→ Screen reader: "positive Completed"</span>
              </div>
              <div className="flex items-center gap-3">
                <Pill type="alert" label="Failed" />
                <span className="text-sm text-gray-600">→ Screen reader: "alert Failed"</span>
              </div>
              <div className="flex items-center gap-3">
                <Pill type="attention" label="Pending" />
                <span className="text-sm text-gray-600">→ Screen reader: "attention Pending"</span>
              </div>
            </div>
          </div>

          {/* Icon Pills */}
          <div>
            <h4 className="text-base font-semibold mb-3">Icon-Only Pills (Requires aria-label)</h4>
            <p className="text-sm text-gray-600 mb-3">
              Pills with only icons must have aria-label for screen readers:
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-600 mb-2">✓ Correct - Has aria-label:</p>
                <Pill type="outlined" iconL="heart" aria-label="Favorite" interactive onClick={() => {}} />
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-2">✓ Correct - Has visible label:</p>
                <Pill type="info" iconL="calendar" label="Scheduled" />
              </div>
            </div>
          </div>

          {/* Text Truncation */}
          <div>
            <h4 className="text-base font-semibold mb-3">Text Truncation Accessibility</h4>
            <p className="text-sm text-gray-600 mb-3">
              Truncated text is fully available to screen readers:
            </p>
            <div className="max-w-xs">
              <Pill 
                type="outlined" 
                label="This is a very long pill label that will truncate with ellipsis" 
                truncate 
              />
              <p className="text-xs text-gray-600 mt-2">
                Screen readers read the full text even though it's visually truncated
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};
