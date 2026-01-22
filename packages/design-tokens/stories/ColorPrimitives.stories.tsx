import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Design System/Primitives/Colors',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Color Primitive Tokens

Raw color values that serve as the foundation for all semantic color tokens in the design system.

## What are Color Primitives?

Color primitives are the lowest-level color tokens in our system. They represent the actual color values (hex codes, RGB, HSL) that are used throughout the design. These primitives are referenced by semantic color tokens to create a consistent, themeable color system.

**Important**: In most cases, you should use semantic color tokens (like \`--color-bg-alert-subtle\`) instead of primitives. Only use primitive tokens when:
- Creating new semantic color tokens
- Handling edge cases not covered by semantic tokens
- Building foundation-level components or themes

## Color Primitive Categories

Our color primitives are organized into base scales and alpha (transparency) variants:

### Base Color Scales
- **Gray**: Neutral scale from light (25) to dark (1000)
- **Cream**: Warm neutral alternative to gray
- **Blue**: Information, links, and interactive elements
- **Green**: Success, confirmation, positive actions
- **Yellow**: Warnings, cautions, attention
- **Red**: Errors, alerts, destructive actions
- **Saturated Red**: High-contrast alerts and critical errors
- **Purple**: Accents, special highlights, premium features

### Alpha (Transparency) Scales
- **Black Alpha**: Transparent black overlays for use on light backgrounds
- **White Alpha**: Transparent white overlays for use on dark backgrounds

## Naming Convention

Primitive colors follow a numeric scale:
- **25-100**: Very light tints
- **200-400**: Light to medium tones
- **500-700**: Medium to dark tones
- **800-1000**: Very dark shades

Higher numbers = darker colors (except for alpha scales where the scale represents opacity)

## Usage

\`\`\`tsx
// ❌ Avoid using primitives directly in components
<div style={{ backgroundColor: '#e5f3f8' }}>
  Content
</div>

// ❌ Also avoid using primitive tokens directly
<div style={{ backgroundColor: 'var(--blue-50)' }}>
  Content
</div>

// ✅ Use semantic color tokens instead
<div className="bg-[var(--color-bg-information-subtle)]">
  Content
</div>

// ✅ Use primitives when creating new semantic tokens
// In your token definition file:
{
  "color": {
    "bg": {
      "information": {
        "subtle": { "value": "{blue.50}" }
      }
    }
  }
}
\`\`\`

## Design Principles

- **Consistent Scale**: All color scales follow the same numeric progression
- **Optical Balance**: Values are adjusted for perceived brightness, not just mathematical intervals
- **Accessibility Foundation**: Scales provide enough contrast options for WCAG compliance
- **Themeability**: Primitive values can be swapped to create light/dark themes or brand variations
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// Color swatch component for base colors
const ColorSwatch = ({
  name,
  value,
  textColor = 'text-gray-900',
}: {
  name: string;
  value: string;
  textColor?: string;
}) => (
  <div className="flex flex-col gap-2">
    <div
      className="w-full h-16 rounded-lg border border-gray-200 shadow-sm"
      style={{ backgroundColor: value }}
    />
    <div className="flex flex-col">
      <span className="text-xs font-semibold font-mono text-gray-900">{name}</span>
      <span className="text-2xs text-gray-600 font-mono">{value}</span>
    </div>
  </div>
);

export const GrayScale: Story = {
  render: () => (
    <div className="p-8 space-y-6 bg-[var(--color-bg-neutral-base)]">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-[var(--color-fg-neutral-primary)]">Gray Scale</h2>
        <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-6">
          Primary neutral scale for UI elements, text, backgrounds, and borders
        </p>
        <div className="grid grid-cols-6 gap-4">
          <ColorSwatch name="gray-25" value="#fafafa" />
          <ColorSwatch name="gray-50" value="#f1f1f1" />
          <ColorSwatch name="gray-100" value="#e1e1e1" />
          <ColorSwatch name="gray-200" value="#d4d4d4" />
          <ColorSwatch name="gray-300" value="#bcbcbc" />
          <ColorSwatch name="gray-400" value="#a4a4a4" />
        </div>
        <div className="grid grid-cols-6 gap-4 mt-4">
          <ColorSwatch name="gray-500" value="#8b8b8b" textColor="text-white" />
          <ColorSwatch name="gray-600" value="#676767" textColor="text-white" />
          <ColorSwatch name="gray-700" value="#5f5f5f" textColor="text-white" />
          <ColorSwatch name="gray-800" value="#424242" textColor="text-white" />
          <ColorSwatch name="gray-900" value="#323232" textColor="text-white" />
          <ColorSwatch name="gray-1000" value="#181818" textColor="text-white" />
        </div>
      </div>

      <div
        className="p-6 bg-[var(--color-bg-information-subtle)] border-l-4 border-[var(--color-bg-information-high)] rounded"
      >
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-information-primary)]">
          Gray Scale Usage
        </h3>
        <p className="text-sm text-[var(--color-fg-information-secondary)]">
          Gray is the workhorse of the design system. It's used for neutral UI elements, text, backgrounds, and borders. The scale provides enough variety to create clear visual hierarchy while maintaining a cohesive look.
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Neutral gray scale from light (25) to dark (1000).',
      },
    },
  },
};

export const BrandColors: Story = {
  render: () => (
    <div className="p-8 space-y-12 bg-[var(--color-bg-neutral-base)]">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-[var(--color-fg-neutral-primary)]">Cream Scale</h2>
        <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-6">
          Warm neutral alternative to gray for softer UI elements
        </p>
        <div className="grid grid-cols-5 gap-4">
          <ColorSwatch name="cream-50" value="#f4f0eb" />
          <ColorSwatch name="cream-100" value="#e8e0d7" />
          <ColorSwatch name="cream-200" value="#dbd3cb" />
          <ColorSwatch name="cream-300" value="#c2bbb4" />
          <ColorSwatch name="cream-400" value="#a9a39d" />
        </div>
        <div className="grid grid-cols-4 gap-4 mt-4">
          <ColorSwatch name="cream-500" value="#8f8a85" textColor="text-white" />
          <ColorSwatch name="cream-600" value="#6a6662" textColor="text-white" />
          <ColorSwatch name="cream-700" value="#625e5b" textColor="text-white" />
          <ColorSwatch name="cream-800" value="#44423f" textColor="text-white" />
          <ColorSwatch name="cream-900" value="#343230" textColor="text-white" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2 text-[var(--color-fg-neutral-primary)]">Blue Scale</h2>
        <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-6">
          Information, links, and interactive elements
        </p>
        <div className="grid grid-cols-5 gap-4">
          <ColorSwatch name="blue-50" value="#e5f3f8" />
          <ColorSwatch name="blue-100" value="#c9e6f0" />
          <ColorSwatch name="blue-200" value="#b9dfea" />
          <ColorSwatch name="blue-300" value="#8bc9de" />
          <ColorSwatch name="blue-400" value="#6ab0ca" />
        </div>
        <div className="grid grid-cols-4 gap-4 mt-4">
          <ColorSwatch name="blue-500" value="#4d93af" textColor="text-white" />
          <ColorSwatch name="blue-600" value="#376c89" textColor="text-white" />
          <ColorSwatch name="blue-700" value="#306385" textColor="text-white" />
          <ColorSwatch name="blue-800" value="#234658" textColor="text-white" />
          <ColorSwatch name="blue-900" value="#1b3644" textColor="text-white" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2 text-[var(--color-fg-neutral-primary)]">Green Scale</h2>
        <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-6">
          Success, confirmation, and positive actions
        </p>
        <div className="grid grid-cols-5 gap-4">
          <ColorSwatch name="green-50" value="#e3f5eb" />
          <ColorSwatch name="green-100" value="#cbedda" />
          <ColorSwatch name="green-200" value="#a9e2b3" />
          <ColorSwatch name="green-300" value="#76ce98" />
          <ColorSwatch name="green-400" value="#52b784" />
        </div>
        <div className="grid grid-cols-4 gap-4 mt-4">
          <ColorSwatch name="green-500" value="#319d6d" textColor="text-white" />
          <ColorSwatch name="green-600" value="#247450" textColor="text-white" />
          <ColorSwatch name="green-700" value="#0e6c52" textColor="text-white" />
          <ColorSwatch name="green-800" value="#174b34" textColor="text-white" />
          <ColorSwatch name="green-900" value="#123928" textColor="text-white" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2 text-[var(--color-fg-neutral-primary)]">Yellow Scale</h2>
        <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-6">
          Warnings, cautions, and attention
        </p>
        <div className="grid grid-cols-5 gap-4">
          <ColorSwatch name="yellow-50" value="#faf1ce" />
          <ColorSwatch name="yellow-100" value="#f3e197" />
          <ColorSwatch name="yellow-200" value="#eed366" />
          <ColorSwatch name="yellow-300" value="#d7ba5a" />
          <ColorSwatch name="yellow-400" value="#c1a14e" />
        </div>
        <div className="grid grid-cols-4 gap-4 mt-4">
          <ColorSwatch name="yellow-500" value="#a9863c" textColor="text-white" />
          <ColorSwatch name="yellow-600" value="#7f6139" textColor="text-white" />
          <ColorSwatch name="yellow-700" value="#755a34" textColor="text-white" />
          <ColorSwatch name="yellow-800" value="#523f25" textColor="text-white" />
          <ColorSwatch name="yellow-900" value="#3f301c" textColor="text-white" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2 text-[var(--color-fg-neutral-primary)]">Red Scale</h2>
        <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-6">
          Softer errors and negative states
        </p>
        <div className="grid grid-cols-5 gap-4">
          <ColorSwatch name="red-50" value="#fbeee9" />
          <ColorSwatch name="red-100" value="#f7e1d8" />
          <ColorSwatch name="red-200" value="#f0ceb7" />
          <ColorSwatch name="red-300" value="#e7b08c" />
          <ColorSwatch name="red-400" value="#e09361" />
        </div>
        <div className="grid grid-cols-4 gap-4 mt-4">
          <ColorSwatch name="red-500" value="#bf6640" textColor="text-white" />
          <ColorSwatch name="red-600" value="#9a5435" textColor="text-white" />
          <ColorSwatch name="red-700" value="#904b2c" textColor="text-white" />
          <ColorSwatch name="red-800" value="#623725" textColor="text-white" />
          <ColorSwatch name="red-900" value="#4a2b1d" textColor="text-white" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2 text-[var(--color-fg-neutral-primary)]">Saturated Red Scale</h2>
        <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-6">
          Errors, alerts, and destructive actions
        </p>
        <div className="grid grid-cols-5 gap-4">
          <ColorSwatch name="saturated-red-50" value="#fcedeb" />
          <ColorSwatch name="saturated-red-100" value="#f8dad6" />
          <ColorSwatch name="saturated-red-200" value="#f5cbc5" />
          <ColorSwatch name="saturated-red-300" value="#ecada5" />
          <ColorSwatch name="saturated-red-400" value="#e18e85" />
        </div>
        <div className="grid grid-cols-4 gap-4 mt-4">
          <ColorSwatch name="saturated-red-500" value="#d36d64" textColor="text-white" />
          <ColorSwatch name="saturated-red-600" value="#b33f3b" textColor="text-white" />
          <ColorSwatch name="saturated-red-700" value="#b4272c" textColor="text-white" />
          <ColorSwatch name="saturated-red-800" value="#712c28" textColor="text-white" />
          <ColorSwatch name="saturated-red-900" value="#552320" textColor="text-white" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2 text-[var(--color-fg-neutral-primary)]">Purple Scale</h2>
        <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-6">
          Accents, special highlights, and premium features
        </p>
        <div className="grid grid-cols-5 gap-4">
          <ColorSwatch name="purple-50" value="#f3eff6" />
          <ColorSwatch name="purple-100" value="#e9e3ee" />
          <ColorSwatch name="purple-200" value="#ddcfeb" />
          <ColorSwatch name="purple-300" value="#cfb7dd" />
          <ColorSwatch name="purple-400" value="#b39cc5" />
        </div>
        <div className="grid grid-cols-4 gap-4 mt-4">
          <ColorSwatch name="purple-500" value="#a489bb" textColor="text-white" />
          <ColorSwatch name="purple-600" value="#765c8b" textColor="text-white" />
          <ColorSwatch name="purple-700" value="#6f5782" textColor="text-white" />
          <ColorSwatch name="purple-800" value="#4c3c5a" textColor="text-white" />
          <ColorSwatch name="purple-900" value="#3a2e45" textColor="text-white" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2 text-[var(--color-fg-neutral-primary)]">Utility Colors</h2>
        <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-6">
          Special-purpose colors for specific features and accessibility
        </p>
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <ColorSwatch name="a11y-blue" value="#4477ff" textColor="text-white" />
          <ColorSwatch name="carby-green" value="#6bd9a1" />
        </div>
        <div className="mt-6 p-4 bg-[var(--color-bg-information-subtle)] rounded border border-[var(--color-bg-information-low)]">
          <p className="text-sm text-[var(--color-fg-information-secondary)]">
            <strong className="text-[var(--color-fg-information-primary)]">a11y-blue:</strong> Accessibility-focused blue for high contrast and WCAG compliance
          </p>
          <p className="text-sm text-[var(--color-fg-information-secondary)] mt-2">
            <strong className="text-[var(--color-fg-information-primary)]">carby-green:</strong> Brand-specific green for Carby features and branding
          </p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Brand color scales for semantic use cases.',
      },
    },
  },
};

export const AlphaColors: Story = {
  render: () => (
    <div className="p-8 space-y-12 bg-[var(--color-bg-neutral-base)]">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-[var(--color-fg-neutral-primary)]">Black Alpha Scale</h2>
        <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-6">
          Transparent black for overlays, shadows, and darkening effects on light backgrounds
        </p>
        <div className="grid grid-cols-6 gap-4">
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg overflow-hidden border border-gray-200">
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900 font-mono">black-alpha-min</div>
            <div className="text-2xs text-gray-600 font-mono">2% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg overflow-hidden border border-gray-200">
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.06)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900 font-mono">black-alpha-lowest</div>
            <div className="text-2xs text-gray-600 font-mono">6% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg overflow-hidden border border-gray-200">
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.12)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900 font-mono">black-alpha-lower</div>
            <div className="text-2xs text-gray-600 font-mono">12% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg overflow-hidden border border-gray-200">
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.24)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900 font-mono">black-alpha-low</div>
            <div className="text-2xs text-gray-600 font-mono">24% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg overflow-hidden border border-gray-200">
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900 font-mono">black-alpha-mid-low</div>
            <div className="text-2xs text-gray-600 font-mono">30% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg overflow-hidden border border-gray-200">
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.36)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900 font-mono">black-alpha-mid</div>
            <div className="text-2xs text-gray-600 font-mono">36% opacity</div>
          </div>
        </div>
        <div className="grid grid-cols-6 gap-4 mt-4">
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg overflow-hidden border border-gray-200">
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.48)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900 font-mono">black-alpha-mid-high</div>
            <div className="text-2xs text-gray-600 font-mono">48% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg overflow-hidden border border-gray-200">
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-white font-mono">black-alpha-high</div>
            <div className="text-2xs text-white/80 font-mono">60% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg overflow-hidden border border-gray-200">
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.72)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-white font-mono">black-alpha-higher</div>
            <div className="text-2xs text-white/80 font-mono">72% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg overflow-hidden border border-gray-200">
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-white font-mono">black-alpha-highest</div>
            <div className="text-2xs text-white/80 font-mono">80% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg overflow-hidden border border-gray-200">
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.88)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-white font-mono">black-alpha-max-low</div>
            <div className="text-2xs text-white/80 font-mono">88% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg overflow-hidden border border-gray-200">
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.96)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-white font-mono">black-alpha-max</div>
            <div className="text-2xs text-white/80 font-mono">96% opacity</div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2 text-[var(--color-fg-neutral-primary)]">White Alpha Scale</h2>
        <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-6">
          Transparent white for overlays, highlights, and lightening effects on dark backgrounds
        </p>
        <div className="grid grid-cols-6 gap-4">
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg overflow-hidden border border-gray-600">
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900 font-mono">white-alpha-min</div>
            <div className="text-2xs text-gray-600 font-mono">8% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg overflow-hidden border border-gray-600">
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.16)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900 font-mono">white-alpha-lowest</div>
            <div className="text-2xs text-gray-600 font-mono">16% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg overflow-hidden border border-gray-600">
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.24)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900 font-mono">white-alpha-lower</div>
            <div className="text-2xs text-gray-600 font-mono">24% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg overflow-hidden border border-gray-600">
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.32)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900 font-mono">white-alpha-low</div>
            <div className="text-2xs text-gray-600 font-mono">32% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg overflow-hidden border border-gray-600">
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900 font-mono">white-alpha-mid-low</div>
            <div className="text-2xs text-gray-600 font-mono">40% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg overflow-hidden border border-gray-600">
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.48)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900 font-mono">white-alpha-mid</div>
            <div className="text-2xs text-gray-600 font-mono">48% opacity</div>
          </div>
        </div>
        <div className="grid grid-cols-6 gap-4 mt-4">
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg overflow-hidden border border-gray-600">
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.56)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900 font-mono">white-alpha-mid-high</div>
            <div className="text-2xs text-gray-600 font-mono">56% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg overflow-hidden border border-gray-600">
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.68)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900 font-mono">white-alpha-high</div>
            <div className="text-2xs text-gray-600 font-mono">68% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg overflow-hidden border border-gray-600">
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.74)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900 font-mono">white-alpha-higher</div>
            <div className="text-2xs text-gray-600 font-mono">74% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg overflow-hidden border border-gray-600">
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900 font-mono">white-alpha-highest</div>
            <div className="text-2xs text-gray-600 font-mono">80% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg overflow-hidden border border-gray-600">
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.88)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900 font-mono">white-alpha-max-low</div>
            <div className="text-2xs text-gray-600 font-mono">88% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg overflow-hidden border border-gray-600">
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.96)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900 font-mono">white-alpha-max</div>
            <div className="text-2xs text-gray-600 font-mono">96% opacity</div>
          </div>
        </div>
      </div>

      <div
        className="p-6 bg-[var(--color-bg-accent-subtle)] border-l-4 border-[var(--color-bg-accent-high)] rounded"
      >
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-accent-primary)]">
          Alpha Color Usage
        </h3>
        <ul className="space-y-2 text-sm text-[var(--color-fg-accent-secondary)]">
          <li>• <strong>Black Alpha</strong>: Use for overlays, shadows, and darkening effects on light backgrounds</li>
          <li>• <strong>White Alpha</strong>: Use for highlights, glass effects, and lightening on dark backgrounds</li>
          <li>• Alpha colors preserve the background while adding tint</li>
          <li>• Useful for creating depth without fully obscuring content</li>
          <li>• Works across different background colors (unlike solid colors)</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Transparent black and white overlays for layering effects.',
      },
    },
  },
};

export const SemanticMapping: Story = {
  render: () => (
    <div className="p-8 bg-[var(--color-bg-neutral-base)]">
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">
        How Primitives Map to Semantic Tokens
      </h2>
      <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-8">
        Examples showing how primitive colors are referenced by semantic color tokens.
      </p>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-[var(--color-fg-neutral-primary)]">
            Alert/Error Colors
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-[var(--color-bg-neutral-subtle)] rounded border border-[var(--color-bg-neutral-low)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-[var(--color-fg-neutral-primary)]">
                  --color-bg-alert-subtle
                </span>
                <span className="text-xs text-[var(--color-fg-neutral-secondary)]">
                  uses
                </span>
                <span className="text-sm font-mono text-[var(--color-fg-alert-primary)]">
                  saturated-red-50
                </span>
              </div>
            </div>
            <div className="p-4 bg-[var(--color-bg-neutral-subtle)] rounded border border-[var(--color-bg-neutral-low)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-[var(--color-fg-neutral-primary)]">
                  --color-bg-alert-high
                </span>
                <span className="text-xs text-[var(--color-fg-neutral-secondary)]">
                  uses
                </span>
                <span className="text-sm font-mono text-[var(--color-fg-alert-primary)]">
                  saturated-red-700
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-[var(--color-fg-neutral-primary)]">
            Positive/Success Colors
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-[var(--color-bg-neutral-subtle)] rounded border border-[var(--color-bg-neutral-low)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-[var(--color-fg-neutral-primary)]">
                  --color-bg-positive-subtle
                </span>
                <span className="text-xs text-[var(--color-fg-neutral-secondary)]">
                  uses
                </span>
                <span className="text-sm font-mono text-[var(--color-fg-positive-primary)]">
                  green-50
                </span>
              </div>
            </div>
            <div className="p-4 bg-[var(--color-bg-neutral-subtle)] rounded border border-[var(--color-bg-neutral-low)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-[var(--color-fg-neutral-primary)]">
                  --color-bg-positive-high
                </span>
                <span className="text-xs text-[var(--color-fg-neutral-secondary)]">
                  uses
                </span>
                <span className="text-sm font-mono text-[var(--color-fg-positive-primary)]">
                  green-600
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-[var(--color-fg-neutral-primary)]">
            Information/Link Colors
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-[var(--color-bg-neutral-subtle)] rounded border border-[var(--color-bg-neutral-low)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-[var(--color-fg-neutral-primary)]">
                  --color-bg-information-subtle
                </span>
                <span className="text-xs text-[var(--color-fg-neutral-secondary)]">
                  uses
                </span>
                <span className="text-sm font-mono text-[var(--color-fg-information-primary)]">
                  blue-50
                </span>
              </div>
            </div>
            <div className="p-4 bg-[var(--color-bg-neutral-subtle)] rounded border border-[var(--color-bg-neutral-low)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-[var(--color-fg-neutral-primary)]">
                  --color-bg-information-high
                </span>
                <span className="text-xs text-[var(--color-fg-neutral-secondary)]">
                  uses
                </span>
                <span className="text-sm font-mono text-[var(--color-fg-information-primary)]">
                  blue-600
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-[var(--color-fg-neutral-primary)]">
            Neutral UI Colors
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-[var(--color-bg-neutral-subtle)] rounded border border-[var(--color-bg-neutral-low)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-[var(--color-fg-neutral-primary)]">
                  --color-bg-neutral-subtle
                </span>
                <span className="text-xs text-[var(--color-fg-neutral-secondary)]">
                  uses
                </span>
                <span className="text-sm font-mono text-[var(--color-fg-neutral-primary)]">
                  gray-50
                </span>
              </div>
            </div>
            <div className="p-4 bg-[var(--color-bg-neutral-subtle)] rounded border border-[var(--color-bg-neutral-low)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-[var(--color-fg-neutral-primary)]">
                  --color-fg-neutral-primary
                </span>
                <span className="text-xs text-[var(--color-fg-neutral-secondary)]">
                  uses
                </span>
                <span className="text-sm font-mono text-[var(--color-fg-neutral-primary)]">
                  gray-900
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="mt-8 p-6 bg-[var(--color-bg-accent-subtle)] border-l-4 border-[var(--color-bg-accent-high)] rounded"
      >
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-accent-primary)]">
          Color Token Architecture
        </h3>
        <p className="text-sm text-[var(--color-fg-accent-secondary)] mb-3">
          Our color system follows a three-tier architecture:
        </p>
        <ol className="space-y-2 text-sm text-[var(--color-fg-accent-secondary)] list-decimal list-inside">
          <li><strong>Primitives</strong> - Raw hex values (this page)</li>
          <li><strong>Semantic Tokens</strong> - Purpose-driven tokens that reference primitives (like --color-bg-alert-subtle)</li>
          <li><strong>Component Tokens</strong> - Component-specific tokens that reference semantic tokens</li>
        </ol>
        <p className="text-sm text-[var(--color-fg-accent-secondary)] mt-3">
          This separation allows us to update the entire color system by changing primitive values, and themes can be created by swapping primitive palettes.
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows how primitive colors are referenced by higher-level semantic color tokens.',
      },
    },
  },
};
