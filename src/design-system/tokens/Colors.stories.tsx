import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Design System/Foundations/Colors',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Color Tokens

A comprehensive color system with semantic naming for consistent UI design.

## Color System Structure

### Base Color Scales
- **Gray**: Neutral scale from light to dark (25-1000)
- **Cream**: Warm neutral alternative
- **Blue**: Information and accents
- **Green**: Success and positive actions
- **Yellow**: Attention and warnings
- **Red**: Errors and destructive actions
- **Purple**: Accent and special highlights
- **Saturated Red**: High-contrast alerts

### Semantic Color System

Colors are organized by intent with background (bg) and foreground (fg) variants:

- **Neutral**: Base UI elements, text, backgrounds
- **Alert**: Errors, destructive actions
- **Attention**: Warnings, cautions
- **Positive**: Success, confirmations
- **Information**: Informational messages, links
- **Accent**: Special highlights, premium features

### Usage Patterns

**Background Colors** follow an intensity scale:
- \`subtle\`: Lightest, barely visible
- \`low\`: Light, for containers
- \`low-accented\`: Light, slightly more prominent
- \`medium\`: Mid-tone, moderate emphasis
- \`high\`: Dark, high emphasis
- \`high-accented\`: Darkest, maximum emphasis

**Foreground Colors** are optimized for readability:
- \`primary\`: Main text color on light backgrounds
- \`secondary\`: Slightly lighter for less important text
- \`spot-readable\`: Colored text that remains readable
- \`inverse-primary\`: Text color on dark backgrounds
- \`inverse-secondary\`: Secondary text on dark backgrounds

## Using Color Tokens

\`\`\`tsx
// Semantic colors (recommended)
<div className="bg-alert-subtle text-alert-primary">Error message</div>
<div className="bg-positive-low text-positive-primary">Success</div>

// Base color scales (for custom cases)
<div className="bg-gray-50 text-gray-900">Neutral content</div>
<div className="bg-blue-100 text-blue-800">Custom info box</div>
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// Color swatch component
const ColorSwatch = ({
  name,
  value,
  textColor = 'text-gray-900'
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
      <span className="text-xs font-semibold text-gray-900">{name}</span>
      <span className="text-2xs text-gray-600 font-mono">{value}</span>
    </div>
  </div>
);

// Semantic color swatch with both bg and fg
const SemanticSwatch = ({
  label,
  bgToken,
  fgToken
}: {
  label: string;
  bgToken: string;
  fgToken: string;
}) => (
  <div className="flex flex-col gap-1">
    <div
      className="w-full h-12 rounded-lg border flex items-center justify-center text-xs font-semibold"
      style={{
        backgroundColor: `var(${bgToken})`,
        color: `var(${fgToken})`
      }}
    >
      {label}
    </div>
    <span className="text-2xs text-[var(--color-fg-neutral-secondary)] text-center">{label}</span>
  </div>
);

export const BaseColorScales: Story = {
  render: () => (
    <div className="p-8 space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-2">Gray Scale</h2>
        <p className="text-sm text-gray-600 mb-6">Primary neutral scale for UI elements</p>
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

      <div>
        <h2 className="text-2xl font-bold mb-2">Blue Scale</h2>
        <p className="text-sm text-gray-600 mb-6">Information and interactive elements</p>
        <div className="grid grid-cols-5 gap-4">
          <ColorSwatch name="blue-50" value="#e5f3f8" />
          <ColorSwatch name="blue-100" value="#c9e6f0" />
          <ColorSwatch name="blue-200" value="#b9dfea" />
          <ColorSwatch name="blue-300" value="#8bc9de" />
          <ColorSwatch name="blue-400" value="#6ab0ca" />
        </div>
        <div className="grid grid-cols-5 gap-4 mt-4">
          <ColorSwatch name="blue-500" value="#4d93af" textColor="text-white" />
          <ColorSwatch name="blue-600" value="#376c89" textColor="text-white" />
          <ColorSwatch name="blue-700" value="#306385" textColor="text-white" />
          <ColorSwatch name="blue-800" value="#234658" textColor="text-white" />
          <ColorSwatch name="blue-900" value="#1b3644" textColor="text-white" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Green Scale</h2>
        <p className="text-sm text-gray-600 mb-6">Success and positive actions</p>
        <div className="grid grid-cols-5 gap-4">
          <ColorSwatch name="green-50" value="#e3f5eb" />
          <ColorSwatch name="green-100" value="#cbedda" />
          <ColorSwatch name="green-200" value="#a9e2b3" />
          <ColorSwatch name="green-300" value="#76ce98" />
          <ColorSwatch name="green-400" value="#52b784" />
        </div>
        <div className="grid grid-cols-5 gap-4 mt-4">
          <ColorSwatch name="green-500" value="#319d6d" textColor="text-white" />
          <ColorSwatch name="green-600" value="#247450" textColor="text-white" />
          <ColorSwatch name="green-700" value="#0e6c52" textColor="text-white" />
          <ColorSwatch name="green-800" value="#174b34" textColor="text-white" />
          <ColorSwatch name="green-900" value="#123928" textColor="text-white" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Yellow Scale</h2>
        <p className="text-sm text-gray-600 mb-6">Warnings and attention</p>
        <div className="grid grid-cols-5 gap-4">
          <ColorSwatch name="yellow-50" value="#faf1ce" />
          <ColorSwatch name="yellow-100" value="#f3e197" />
          <ColorSwatch name="yellow-200" value="#eed366" />
          <ColorSwatch name="yellow-300" value="#d7ba5a" />
          <ColorSwatch name="yellow-400" value="#c1a14e" />
        </div>
        <div className="grid grid-cols-5 gap-4 mt-4">
          <ColorSwatch name="yellow-500" value="#a9863c" textColor="text-white" />
          <ColorSwatch name="yellow-600" value="#7f6139" textColor="text-white" />
          <ColorSwatch name="yellow-700" value="#755a34" textColor="text-white" />
          <ColorSwatch name="yellow-800" value="#523f25" textColor="text-white" />
          <ColorSwatch name="yellow-900" value="#3f301c" textColor="text-white" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Saturated Red Scale</h2>
        <p className="text-sm text-gray-600 mb-6">Errors and alerts</p>
        <div className="grid grid-cols-5 gap-4">
          <ColorSwatch name="saturated-red-50" value="#fcedeb" />
          <ColorSwatch name="saturated-red-100" value="#f8dad6" />
          <ColorSwatch name="saturated-red-200" value="#f5cbc5" />
          <ColorSwatch name="saturated-red-300" value="#ecada5" />
          <ColorSwatch name="saturated-red-400" value="#e18e85" />
        </div>
        <div className="grid grid-cols-5 gap-4 mt-4">
          <ColorSwatch name="saturated-red-500" value="#d36d64" textColor="text-white" />
          <ColorSwatch name="saturated-red-600" value="#b33f3b" textColor="text-white" />
          <ColorSwatch name="saturated-red-700" value="#b4272c" textColor="text-white" />
          <ColorSwatch name="saturated-red-800" value="#712c28" textColor="text-white" />
          <ColorSwatch name="saturated-red-900" value="#552320" textColor="text-white" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Purple Scale</h2>
        <p className="text-sm text-gray-600 mb-6">Accents and special highlights</p>
        <div className="grid grid-cols-5 gap-4">
          <ColorSwatch name="purple-50" value="#f3eff6" />
          <ColorSwatch name="purple-100" value="#e9e3ee" />
          <ColorSwatch name="purple-200" value="#ddcfeb" />
          <ColorSwatch name="purple-300" value="#cfb7dd" />
          <ColorSwatch name="purple-400" value="#b39cc5" />
        </div>
        <div className="grid grid-cols-5 gap-4 mt-4">
          <ColorSwatch name="purple-500" value="#a489bb" textColor="text-white" />
          <ColorSwatch name="purple-600" value="#765c8b" textColor="text-white" />
          <ColorSwatch name="purple-700" value="#6f5782" textColor="text-white" />
          <ColorSwatch name="purple-800" value="#4c3c5a" textColor="text-white" />
          <ColorSwatch name="purple-900" value="#3a2e45" textColor="text-white" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Black Alpha Scale</h2>
        <p className="text-sm text-gray-600 mb-6">Transparent black for overlays on light backgrounds</p>
        <div className="grid grid-cols-6 gap-4">
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg overflow-hidden border border-gray-200">
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900">black-a25</div>
            <div className="text-2xs text-gray-600 font-mono">2% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg overflow-hidden border border-gray-200">
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.06)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900">black-a50</div>
            <div className="text-2xs text-gray-600 font-mono">6% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg overflow-hidden border border-gray-200">
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.12)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900">black-a100</div>
            <div className="text-2xs text-gray-600 font-mono">12% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg overflow-hidden border border-gray-200">
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.24)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900">black-a200</div>
            <div className="text-2xs text-gray-600 font-mono">24% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg overflow-hidden border border-gray-200">
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900">black-a300</div>
            <div className="text-2xs text-gray-600 font-mono">30% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg overflow-hidden border border-gray-200">
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.36)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900">black-a400</div>
            <div className="text-2xs text-gray-600 font-mono">36% opacity</div>
          </div>
        </div>
        <div className="grid grid-cols-6 gap-4 mt-4">
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg overflow-hidden border border-gray-200">
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.48)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900">black-a500</div>
            <div className="text-2xs text-gray-600 font-mono">48% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg overflow-hidden border border-gray-200">
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-white">black-a600</div>
            <div className="text-2xs text-white/80 font-mono">60% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg overflow-hidden border border-gray-200">
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.72)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-white">black-a700</div>
            <div className="text-2xs text-white/80 font-mono">72% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg overflow-hidden border border-gray-200">
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-white">black-a800</div>
            <div className="text-2xs text-white/80 font-mono">80% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg overflow-hidden border border-gray-200">
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.88)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-white">black-a900</div>
            <div className="text-2xs text-white/80 font-mono">88% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg overflow-hidden border border-gray-200">
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.96)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-white">black-a1000</div>
            <div className="text-2xs text-white/80 font-mono">96% opacity</div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">White Alpha Scale</h2>
        <p className="text-sm text-gray-600 mb-6">Transparent white for overlays on dark backgrounds</p>
        <div className="grid grid-cols-6 gap-4">
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg overflow-hidden border border-gray-600">
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900">white-a25</div>
            <div className="text-2xs text-gray-600 font-mono">8% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg overflow-hidden border border-gray-600">
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.16)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900">white-a50</div>
            <div className="text-2xs text-gray-600 font-mono">16% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg overflow-hidden border border-gray-600">
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.24)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900">white-a100</div>
            <div className="text-2xs text-gray-600 font-mono">24% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg overflow-hidden border border-gray-600">
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.32)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900">white-a200</div>
            <div className="text-2xs text-gray-600 font-mono">32% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg overflow-hidden border border-gray-600">
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900">white-a300</div>
            <div className="text-2xs text-gray-600 font-mono">40% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg overflow-hidden border border-gray-600">
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.48)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900">white-a400</div>
            <div className="text-2xs text-gray-600 font-mono">48% opacity</div>
          </div>
        </div>
        <div className="grid grid-cols-6 gap-4 mt-4">
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg overflow-hidden border border-gray-600">
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.56)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900">white-a500</div>
            <div className="text-2xs text-gray-600 font-mono">56% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg overflow-hidden border border-gray-600">
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.68)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900">white-a600</div>
            <div className="text-2xs text-gray-600 font-mono">68% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg overflow-hidden border border-gray-600">
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.74)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900">white-a700</div>
            <div className="text-2xs text-gray-600 font-mono">74% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg overflow-hidden border border-gray-600">
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900">white-a800</div>
            <div className="text-2xs text-gray-600 font-mono">80% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg overflow-hidden border border-gray-600">
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.88)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900">white-a900</div>
            <div className="text-2xs text-gray-600 font-mono">88% opacity</div>
          </div>
          <div className="space-y-2">
            <div className="relative h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg overflow-hidden border border-gray-600">
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.96)' }} className="absolute inset-0" />
            </div>
            <div className="text-xs font-semibold text-gray-900">white-a1000</div>
            <div className="text-2xs text-gray-600 font-mono">96% opacity</div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete base color scales available in the design system.',
      },
    },
  },
};

export const SemanticNeutral: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Neutral Backgrounds</h2>
        <p className="text-sm text-gray-600 mb-6">For general UI elements and containers</p>
        <div className="grid grid-cols-4 gap-4">
          <SemanticSwatch label="base" bgToken="--color-bg-neutral-base" fgToken="--color-fg-neutral-primary" />
          <SemanticSwatch label="min" bgToken="--color-bg-neutral-min" fgToken="--color-fg-neutral-primary" />
          <SemanticSwatch label="subtle" bgToken="--color-bg-neutral-subtle" fgToken="--color-fg-neutral-primary" />
          <SemanticSwatch label="low" bgToken="--color-bg-neutral-low" fgToken="--color-fg-neutral-primary" />
          <SemanticSwatch label="low-accented" bgToken="--color-bg-neutral-low-accented" fgToken="--color-fg-neutral-primary" />
          <SemanticSwatch label="medium" bgToken="--color-bg-neutral-medium" fgToken="--color-fg-neutral-primary" />
          <SemanticSwatch label="inverse-base" bgToken="--color-bg-neutral-inverse-base" fgToken="--color-fg-neutral-inverse-primary" />
          <SemanticSwatch label="inverse-low" bgToken="--color-bg-neutral-inverse-low" fgToken="--color-fg-neutral-inverse-primary" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Neutral Foregrounds</h2>
        <p className="text-sm text-gray-600 mb-6">For text and icons on light backgrounds</p>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <p className="text-[var(--color-fg-neutral-primary)] font-semibold mb-1">Primary</p>
            <p className="text-[var(--color-fg-neutral-primary)] text-xs">Main text content</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-[var(--color-fg-neutral-secondary)] font-semibold mb-1">Secondary</p>
            <p className="text-[var(--color-fg-neutral-secondary)] text-xs">Supporting text</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-[var(--color-fg-neutral-spot-readable)] font-semibold mb-1">Spot Readable</p>
            <p className="text-[var(--color-fg-neutral-spot-readable)] text-xs">Subtle hints</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-[var(--color-fg-neutral-disabled)] font-semibold mb-1">Disabled</p>
            <p className="text-[var(--color-fg-neutral-disabled)] text-xs">Inactive state</p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Neutral semantic colors for general UI elements.',
      },
    },
  },
};

export const SemanticAlert: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Alert Backgrounds</h2>
        <p className="text-sm text-gray-600 mb-6">For errors and destructive actions</p>
        <div className="grid grid-cols-3 gap-4">
          <SemanticSwatch label="subtle" bgToken="--color-bg-alert-subtle" fgToken="--color-fg-alert-primary" />
          <SemanticSwatch label="low" bgToken="--color-bg-alert-low" fgToken="--color-fg-alert-primary" />
          <SemanticSwatch label="low-accented" bgToken="--color-bg-alert-low-accented" fgToken="--color-fg-alert-primary" />
          <SemanticSwatch label="medium" bgToken="--color-bg-alert-medium" fgToken="--color-fg-alert-primary" />
          <SemanticSwatch label="high" bgToken="--color-bg-alert-high" fgToken="--color-fg-alert-inverse-primary" />
          <SemanticSwatch label="high-accented" bgToken="--color-bg-alert-high-accented" fgToken="--color-fg-alert-inverse-primary" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Alert Foregrounds</h2>
        <p className="text-sm text-gray-600 mb-6">For error text and icons on light backgrounds</p>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-alert-primary)' }} className="font-semibold mb-1">Primary</p>
            <p style={{ color: 'var(--color-fg-alert-primary)' }} className="text-xs">Main error text</p>
            <p className="text-2xs font-mono text-gray-600 mt-2">--color-fg-alert-primary</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-alert-secondary)' }} className="font-semibold mb-1">Secondary</p>
            <p style={{ color: 'var(--color-fg-alert-secondary)' }} className="text-xs">Supporting error text</p>
            <p className="text-2xs font-mono text-gray-600 mt-2">--color-fg-alert-secondary</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-alert-inverse-primary)' }} className="font-semibold mb-1">Inverse Primary</p>
            <p style={{ color: 'var(--color-fg-alert-inverse-primary)' }} className="text-xs">Text on dark alert bg</p>
            <p className="text-2xs font-mono text-gray-400 mt-2">--color-fg-alert-inverse-primary</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-alert-inverse-secondary)' }} className="font-semibold mb-1">Inverse Secondary</p>
            <p style={{ color: 'var(--color-fg-alert-inverse-secondary)' }} className="text-xs">Supporting on dark</p>
            <p className="text-2xs font-mono text-gray-400 mt-2">--color-fg-alert-inverse-secondary</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Example Usage</h2>
        <div className="space-y-3">
          <div style={{ backgroundColor: 'var(--color-bg-alert-subtle)', borderLeftWidth: '4px', borderLeftColor: 'var(--color-bg-alert-high)' }} className="p-4 rounded">
            <p style={{ color: 'var(--color-fg-alert-primary)' }} className="font-semibold mb-1">Error</p>
            <p style={{ color: 'var(--color-fg-alert-secondary)' }} className="text-sm">Something went wrong. Please try again.</p>
          </div>
          <div style={{ backgroundColor: 'var(--color-bg-alert-high)' }} className="p-4 rounded">
            <p style={{ color: 'var(--color-fg-alert-inverse-primary)' }} className="font-semibold">Delete Account</p>
            <p style={{ color: 'var(--color-fg-alert-inverse-secondary)' }} className="text-sm">This action cannot be undone</p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Alert colors for errors and destructive actions.',
      },
    },
  },
};

export const SemanticPositive: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Positive Backgrounds</h2>
        <p className="text-sm text-gray-600 mb-6">For success states and confirmations</p>
        <div className="grid grid-cols-3 gap-4">
          <SemanticSwatch label="subtle" bgToken="--color-bg-positive-subtle" fgToken="--color-fg-positive-primary" />
          <SemanticSwatch label="low" bgToken="--color-bg-positive-low" fgToken="--color-fg-positive-primary" />
          <SemanticSwatch label="low-accented" bgToken="--color-bg-positive-low-accented" fgToken="--color-fg-positive-primary" />
          <SemanticSwatch label="medium" bgToken="--color-bg-positive-medium" fgToken="--color-fg-positive-primary" />
          <SemanticSwatch label="strong" bgToken="--color-bg-positive-strong" fgToken="--color-fg-positive-inverse-primary" />
          <SemanticSwatch label="high" bgToken="--color-bg-positive-high" fgToken="--color-fg-positive-inverse-primary" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Positive Foregrounds</h2>
        <p className="text-sm text-gray-600 mb-6">For success text and icons on light backgrounds</p>
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-positive-primary)' }} className="font-semibold mb-1">Primary</p>
            <p style={{ color: 'var(--color-fg-positive-primary)' }} className="text-xs">Main success text</p>
            <p className="text-2xs font-mono text-gray-600 mt-2">--color-fg-positive-primary</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-positive-secondary)' }} className="font-semibold mb-1">Secondary</p>
            <p style={{ color: 'var(--color-fg-positive-secondary)' }} className="text-xs">Supporting text</p>
            <p className="text-2xs font-mono text-gray-600 mt-2">--color-fg-positive-secondary</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-positive-spot-readable)' }} className="font-semibold mb-1">Spot Readable</p>
            <p style={{ color: 'var(--color-fg-positive-spot-readable)' }} className="text-xs">Subtle hints</p>
            <p className="text-2xs font-mono text-gray-600 mt-2">--color-fg-positive-spot-readable</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-positive-inverse-primary)' }} className="font-semibold mb-1">Inverse Primary</p>
            <p style={{ color: 'var(--color-fg-positive-inverse-primary)' }} className="text-xs">Text on dark bg</p>
            <p className="text-2xs font-mono text-gray-400 mt-2">--color-fg-positive-inverse-primary</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-positive-inverse-secondary)' }} className="font-semibold mb-1">Inverse Secondary</p>
            <p style={{ color: 'var(--color-fg-positive-inverse-secondary)' }} className="text-xs">Supporting on dark</p>
            <p className="text-2xs font-mono text-gray-400 mt-2">--color-fg-positive-inverse-secondary</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Example Usage</h2>
        <div className="space-y-3">
          <div style={{ backgroundColor: 'var(--color-bg-positive-subtle)', borderLeftWidth: '4px', borderLeftColor: 'var(--color-bg-positive-high)' }} className="p-4 rounded">
            <p style={{ color: 'var(--color-fg-positive-primary)' }} className="font-semibold mb-1">Success</p>
            <p style={{ color: 'var(--color-fg-positive-secondary)' }} className="text-sm">Your changes have been saved.</p>
          </div>
          <div style={{ backgroundColor: 'var(--color-bg-positive-strong)' }} className="p-4 rounded">
            <p style={{ color: 'var(--color-fg-positive-inverse-primary)' }} className="font-semibold">Active Subscription</p>
            <p style={{ color: 'var(--color-fg-positive-inverse-secondary)' }} className="text-sm">Your plan is active</p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Positive colors for success states and confirmations.',
      },
    },
  },
};

export const SemanticAttention: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Attention Backgrounds</h2>
        <p className="text-sm text-gray-600 mb-6">For warnings and important notices</p>
        <div className="grid grid-cols-3 gap-4">
          <SemanticSwatch label="subtle" bgToken="--color-bg-attention-subtle" fgToken="--color-fg-attention-primary" />
          <SemanticSwatch label="low" bgToken="--color-bg-attention-low" fgToken="--color-fg-attention-primary" />
          <SemanticSwatch label="low-accented" bgToken="--color-bg-attention-low-accented" fgToken="--color-fg-attention-primary" />
          <SemanticSwatch label="medium" bgToken="--color-bg-attention-medium" fgToken="--color-fg-attention-primary" />
          <SemanticSwatch label="high" bgToken="--color-bg-attention-high" fgToken="--color-fg-attention-inverse-primary" />
          <SemanticSwatch label="high-accented" bgToken="--color-bg-attention-high-accented" fgToken="--color-fg-attention-inverse-primary" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Attention Foregrounds</h2>
        <p className="text-sm text-gray-600 mb-6">For warning text and icons on light backgrounds</p>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-attention-primary)' }} className="font-semibold mb-1">Primary</p>
            <p style={{ color: 'var(--color-fg-attention-primary)' }} className="text-xs">Main warning text</p>
            <p className="text-2xs font-mono text-gray-600 mt-2">--color-fg-attention-primary</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-attention-secondary)' }} className="font-semibold mb-1">Secondary</p>
            <p style={{ color: 'var(--color-fg-attention-secondary)' }} className="text-xs">Supporting text</p>
            <p className="text-2xs font-mono text-gray-600 mt-2">--color-fg-attention-secondary</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Example Usage</h2>
        <div style={{ backgroundColor: 'var(--color-bg-attention-subtle)', borderLeftWidth: '4px', borderLeftColor: 'var(--color-bg-attention-high)' }} className="p-4 rounded">
          <p style={{ color: 'var(--color-fg-attention-primary)' }} className="font-semibold mb-1">Warning</p>
          <p style={{ color: 'var(--color-fg-attention-secondary)' }} className="text-sm">This action requires your attention.</p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Attention colors for warnings and important notices.',
      },
    },
  },
};

export const SemanticInformation: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Information Backgrounds</h2>
        <p className="text-sm text-gray-600 mb-6">For informational messages and links</p>
        <div className="grid grid-cols-3 gap-4">
          <SemanticSwatch label="subtle" bgToken="--color-bg-information-subtle" fgToken="--color-fg-information-primary" />
          <SemanticSwatch label="low" bgToken="--color-bg-information-low" fgToken="--color-fg-information-primary" />
          <SemanticSwatch label="low-accented" bgToken="--color-bg-information-low-accented" fgToken="--color-fg-information-primary" />
          <SemanticSwatch label="medium" bgToken="--color-bg-information-medium" fgToken="--color-fg-information-primary" />
          <SemanticSwatch label="high" bgToken="--color-bg-information-high" fgToken="--color-fg-information-inverse-primary" />
          <SemanticSwatch label="high-accented" bgToken="--color-bg-information-high-accented" fgToken="--color-fg-information-inverse-primary" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Information Foregrounds</h2>
        <p className="text-sm text-gray-600 mb-6">For informational text and icons on light backgrounds</p>
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-information-primary)' }} className="font-semibold mb-1">Primary</p>
            <p style={{ color: 'var(--color-fg-information-primary)' }} className="text-xs">Main info text</p>
            <p className="text-2xs font-mono text-gray-600 mt-2">--color-fg-information-primary</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-information-secondary)' }} className="font-semibold mb-1">Secondary</p>
            <p style={{ color: 'var(--color-fg-information-secondary)' }} className="text-xs">Supporting text</p>
            <p className="text-2xs font-mono text-gray-600 mt-2">--color-fg-information-secondary</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-information-spot-readable)' }} className="font-semibold mb-1">Spot Readable</p>
            <p style={{ color: 'var(--color-fg-information-spot-readable)' }} className="text-xs">Subtle hints</p>
            <p className="text-2xs font-mono text-gray-600 mt-2">--color-fg-information-spot-readable</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-information-inverse-primary)' }} className="font-semibold mb-1">Inverse Primary</p>
            <p style={{ color: 'var(--color-fg-information-inverse-primary)' }} className="text-xs">Text on dark bg</p>
            <p className="text-2xs font-mono text-gray-400 mt-2">--color-fg-information-inverse-primary</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-information-inverse-secondary)' }} className="font-semibold mb-1">Inverse Secondary</p>
            <p style={{ color: 'var(--color-fg-information-inverse-secondary)' }} className="text-xs">Supporting on dark</p>
            <p className="text-2xs font-mono text-gray-400 mt-2">--color-fg-information-inverse-secondary</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Example Usage</h2>
        <div style={{ backgroundColor: 'var(--color-bg-information-subtle)', borderLeftWidth: '4px', borderLeftColor: 'var(--color-bg-information-high)' }} className="p-4 rounded">
          <p style={{ color: 'var(--color-fg-information-primary)' }} className="font-semibold mb-1">Information</p>
          <p style={{ color: 'var(--color-fg-information-secondary)' }} className="text-sm">New features are available in this release.</p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Information colors for informational messages.',
      },
    },
  },
};

export const SemanticAccent: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Accent Backgrounds</h2>
        <p className="text-sm text-gray-600 mb-6">For special highlights and premium features</p>
        <div className="grid grid-cols-3 gap-4">
          <SemanticSwatch label="subtle" bgToken="--color-bg-accent-subtle" fgToken="--color-fg-accent-primary" />
          <SemanticSwatch label="low" bgToken="--color-bg-accent-low" fgToken="--color-fg-accent-primary" />
          <SemanticSwatch label="low-accented" bgToken="--color-bg-accent-low-accented" fgToken="--color-fg-accent-primary" />
          <SemanticSwatch label="medium" bgToken="--color-bg-accent-medium" fgToken="--color-fg-accent-primary" />
          <SemanticSwatch label="high" bgToken="--color-bg-accent-high" fgToken="--color-fg-accent-inverse-primary" />
          <SemanticSwatch label="high-accented" bgToken="--color-bg-accent-high-accented" fgToken="--color-fg-accent-inverse-primary" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Accent Foregrounds</h2>
        <p className="text-sm text-gray-600 mb-6">For accent text and icons on light backgrounds</p>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-accent-primary)' }} className="font-semibold mb-1">Primary</p>
            <p style={{ color: 'var(--color-fg-accent-primary)' }} className="text-xs">Main accent text</p>
            <p className="text-2xs font-mono text-gray-600 mt-2">--color-fg-accent-primary</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-accent-secondary)' }} className="font-semibold mb-1">Secondary</p>
            <p style={{ color: 'var(--color-fg-accent-secondary)' }} className="text-xs">Supporting text</p>
            <p className="text-2xs font-mono text-gray-600 mt-2">--color-fg-accent-secondary</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-accent-spot-readable)' }} className="font-semibold mb-1">Spot Readable</p>
            <p style={{ color: 'var(--color-fg-accent-spot-readable)' }} className="text-xs">Subtle hints</p>
            <p className="text-2xs font-mono text-gray-600 mt-2">--color-fg-accent-spot-readable</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Example Usage</h2>
        <div style={{ backgroundColor: 'var(--color-bg-accent-subtle)', borderWidth: '1px', borderColor: 'var(--color-bg-accent-high)' }} className="p-4 rounded">
          <p style={{ color: 'var(--color-fg-accent-primary)' }} className="font-semibold mb-1">Premium Feature</p>
          <p style={{ color: 'var(--color-fg-accent-secondary)' }} className="text-sm">Upgrade to unlock advanced analytics.</p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Accent colors for special highlights and premium features.',
      },
    },
  },
};

export const SemanticTransparent: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Transparent Backgrounds</h2>
        <p className="text-sm text-gray-600 mb-6">For overlays, modals, and layered UI elements</p>

        {/* Regular transparent backgrounds (black alpha) */}
        <div className="mb-8">
          <h3 className="text-base font-semibold mb-4 text-gray-700">Standard (Black Alpha)</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="relative h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg overflow-hidden">
                <div style={{ backgroundColor: 'var(--color-bg-transparent-min)' }} className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">min</span>
                </div>
              </div>
              <p className="text-2xs font-mono text-gray-600">--color-bg-transparent-min</p>
            </div>
            <div className="space-y-2">
              <div className="relative h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg overflow-hidden">
                <div style={{ backgroundColor: 'var(--color-bg-transparent-subtle)' }} className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">subtle</span>
                </div>
              </div>
              <p className="text-2xs font-mono text-gray-600">--color-bg-transparent-subtle</p>
            </div>
            <div className="space-y-2">
              <div className="relative h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg overflow-hidden">
                <div style={{ backgroundColor: 'var(--color-bg-transparent-subtle-accented)' }} className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">subtle-accented</span>
                </div>
              </div>
              <p className="text-2xs font-mono text-gray-600">--color-bg-transparent-subtle-accented</p>
            </div>
            <div className="space-y-2">
              <div className="relative h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg overflow-hidden">
                <div style={{ backgroundColor: 'var(--color-bg-transparent-low)' }} className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">low</span>
                </div>
              </div>
              <p className="text-2xs font-mono text-gray-600">--color-bg-transparent-low</p>
            </div>
            <div className="space-y-2">
              <div className="relative h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg overflow-hidden">
                <div style={{ backgroundColor: 'var(--color-bg-transparent-low-accented)' }} className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">low-accented</span>
                </div>
              </div>
              <p className="text-2xs font-mono text-gray-600">--color-bg-transparent-low-accented</p>
            </div>
            <div className="space-y-2">
              <div className="relative h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg overflow-hidden">
                <div style={{ backgroundColor: 'var(--color-bg-transparent-medium)' }} className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">medium</span>
                </div>
              </div>
              <p className="text-2xs font-mono text-gray-600">--color-bg-transparent-medium</p>
            </div>
            <div className="space-y-2">
              <div className="relative h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg overflow-hidden">
                <div style={{ backgroundColor: 'var(--color-bg-transparent-high)' }} className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">high</span>
                </div>
              </div>
              <p className="text-2xs font-mono text-gray-600">--color-bg-transparent-high</p>
            </div>
          </div>
        </div>

        {/* Inverse transparent backgrounds (white alpha) */}
        <div>
          <h3 className="text-base font-semibold mb-4 text-gray-700">Inverse (White Alpha)</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="relative h-24 bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg overflow-hidden">
                <div style={{ backgroundColor: 'var(--color-bg-transparent-inverse-min)' }} className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">inverse-min</span>
                </div>
              </div>
              <p className="text-2xs font-mono text-gray-600">--color-bg-transparent-inverse-min</p>
            </div>
            <div className="space-y-2">
              <div className="relative h-24 bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg overflow-hidden">
                <div style={{ backgroundColor: 'var(--color-bg-transparent-inverse-subtle)' }} className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">inverse-subtle</span>
                </div>
              </div>
              <p className="text-2xs font-mono text-gray-600">--color-bg-transparent-inverse-subtle</p>
            </div>
            <div className="space-y-2">
              <div className="relative h-24 bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg overflow-hidden">
                <div style={{ backgroundColor: 'var(--color-bg-transparent-inverse-subtle-accented)' }} className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">inverse-subtle-accented</span>
                </div>
              </div>
              <p className="text-2xs font-mono text-gray-600">--color-bg-transparent-inverse-subtle-accented</p>
            </div>
            <div className="space-y-2">
              <div className="relative h-24 bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg overflow-hidden">
                <div style={{ backgroundColor: 'var(--color-bg-transparent-inverse-low)' }} className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">inverse-low</span>
                </div>
              </div>
              <p className="text-2xs font-mono text-gray-600">--color-bg-transparent-inverse-low</p>
            </div>
            <div className="space-y-2">
              <div className="relative h-24 bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg overflow-hidden">
                <div style={{ backgroundColor: 'var(--color-bg-transparent-inverse-low-accented)' }} className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">inverse-low-accented</span>
                </div>
              </div>
              <p className="text-2xs font-mono text-gray-600">--color-bg-transparent-inverse-low-accented</p>
            </div>
            <div className="space-y-2">
              <div className="relative h-24 bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg overflow-hidden">
                <div style={{ backgroundColor: 'var(--color-bg-transparent-inverse-medium)' }} className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">inverse-medium</span>
                </div>
              </div>
              <p className="text-2xs font-mono text-gray-600">--color-bg-transparent-inverse-medium</p>
            </div>
            <div className="space-y-2">
              <div className="relative h-24 bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg overflow-hidden">
                <div style={{ backgroundColor: 'var(--color-bg-transparent-inverse-high)' }} className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">inverse-high</span>
                </div>
              </div>
              <p className="text-2xs font-mono text-gray-600">--color-bg-transparent-inverse-high</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Transparent Foregrounds</h2>
        <p className="text-sm text-gray-600 mb-6">For text and icons with varying opacity</p>

        {/* Regular transparent foregrounds (black alpha) */}
        <div className="mb-8">
          <h3 className="text-base font-semibold mb-4 text-gray-700">Standard (Black Alpha)</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white border rounded-lg p-4">
              <p style={{ color: 'var(--color-fg-transparent-softer)' }} className="font-semibold mb-1">Softer</p>
              <p className="text-2xs font-mono text-gray-600">--color-fg-transparent-softer</p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <p style={{ color: 'var(--color-fg-transparent-soft)' }} className="font-semibold mb-1">Soft</p>
              <p className="text-2xs font-mono text-gray-600">--color-fg-transparent-soft</p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <p style={{ color: 'var(--color-fg-transparent-medium)' }} className="font-semibold mb-1">Medium</p>
              <p className="text-2xs font-mono text-gray-600">--color-fg-transparent-medium</p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <p style={{ color: 'var(--color-fg-transparent-strong)' }} className="font-semibold mb-1">Strong</p>
              <p className="text-2xs font-mono text-gray-600">--color-fg-transparent-strong</p>
            </div>
          </div>
        </div>

        {/* Inverse transparent foregrounds (white alpha) */}
        <div>
          <h3 className="text-base font-semibold mb-4 text-gray-700">Inverse (White Alpha)</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <p style={{ color: 'var(--color-fg-transparent-inverse-softer)' }} className="font-semibold mb-1">Inverse Softer</p>
              <p className="text-2xs font-mono text-gray-400">--color-fg-transparent-inverse-softer</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <p style={{ color: 'var(--color-fg-transparent-inverse-soft)' }} className="font-semibold mb-1">Inverse Soft</p>
              <p className="text-2xs font-mono text-gray-400">--color-fg-transparent-inverse-soft</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <p style={{ color: 'var(--color-fg-transparent-inverse-medium)' }} className="font-semibold mb-1">Inverse Medium</p>
              <p className="text-2xs font-mono text-gray-400">--color-fg-transparent-inverse-medium</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <p style={{ color: 'var(--color-fg-transparent-inverse-strong)' }} className="font-semibold mb-1">Inverse Strong</p>
              <p className="text-2xs font-mono text-gray-400">--color-fg-transparent-inverse-strong</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Example Usage</h2>
        <div className="space-y-4">
          {/* Modal overlay example */}
          <div className="relative h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg overflow-hidden">
            <div style={{ backgroundColor: 'var(--color-bg-transparent-medium)' }} className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 max-w-sm shadow-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Modal Dialog</h4>
                <p className="text-sm text-gray-600">Using transparent-medium for the overlay backdrop</p>
              </div>
            </div>
          </div>

          {/* Tooltip example */}
          <div className="bg-white border rounded-lg p-6">
            <div className="inline-block">
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Hover for tooltip
              </button>
              <div
                style={{ backgroundColor: 'var(--color-bg-transparent-inverse-high)' }}
                className="mt-2 px-3 py-2 rounded text-sm"
              >
                <p style={{ color: 'var(--color-fg-transparent-inverse-strong)' }}>
                  Tooltip with inverse transparent colors
                </p>
              </div>
            </div>
          </div>

          {/* Card with transparent overlay */}
          <div className="relative h-40 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg overflow-hidden">
            <div style={{ backgroundColor: 'var(--color-bg-transparent-low)' }} className="absolute inset-0 p-6 flex flex-col justify-end">
              <h4 style={{ color: 'var(--color-fg-transparent-inverse-strong)' }} className="font-bold text-lg mb-1">
                Image Card Overlay
              </h4>
              <p style={{ color: 'var(--color-fg-transparent-inverse-medium)' }} className="text-sm">
                Using transparent overlays for better text readability
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Usage Guidelines</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Use standard (black alpha) transparent tokens on light backgrounds</li>
          <li>• Use inverse (white alpha) transparent tokens on dark backgrounds</li>
          <li>• Transparent backgrounds are ideal for overlays, modals, and tooltips</li>
          <li>• Transparent foregrounds work well for text that needs to adapt to various backgrounds</li>
          <li>• Start with lower opacity variants (min, subtle, low) and increase as needed</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Transparent color tokens for overlays, modals, and adaptive UI elements.',
      },
    },
  },
};

export const BrandColors: Story = {
  render: () => (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-2">Brand Colors</h2>
      <p className="text-sm text-gray-600 mb-6">Official brand colors and logo palette</p>
      <div className="grid grid-cols-4 gap-4">
        <ColorSwatch name="carby-green" value="#6bd9a1" />
        <ColorSwatch name="logo-primary" value="#222324" textColor="text-white" />
        <ColorSwatch name="logo-secondary" value="#6e7071" textColor="text-white" />
        <ColorSwatch name="logo-purple" value="#baa3bf" />
        <ColorSwatch name="logo-mint" value="#a3e1c2" />
        <ColorSwatch name="logo-green" value="#24a06d" textColor="text-white" />
        <ColorSwatch name="logo-orange" value="#e15c18" textColor="text-white" />
        <ColorSwatch name="logo-yellow" value="#ebc627" />
        <ColorSwatch name="logo-blue" value="#58b3ca" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Official brand colors from the logo and brand guidelines.',
      },
    },
  },
};

export const UsageExamples: Story = {
  render: () => (
    <div className="p-8 space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold mb-4">Semantic Color Usage Examples</h2>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Alert Messages</h3>
        <div className="space-y-3">
          <div style={{ backgroundColor: 'var(--color-bg-alert-subtle)', borderWidth: '1px', borderColor: 'var(--color-bg-alert-high)' }} className="rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-alert-primary)' }} className="font-semibold">Validation Error</p>
            <p style={{ color: 'var(--color-fg-alert-primary)' }} className="text-sm">Please fill in all required fields.</p>
          </div>
          <div style={{ backgroundColor: 'var(--color-bg-alert-high)' }} className="rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-alert-inverse-primary)' }} className="font-semibold">Delete Confirmation</p>
            <p style={{ color: 'var(--color-fg-alert-inverse-secondary)' }} className="text-sm">This will permanently delete your data.</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Success Messages</h3>
        <div className="space-y-3">
          <div style={{ backgroundColor: 'var(--color-bg-positive-subtle)', borderWidth: '1px', borderColor: 'var(--color-bg-positive-high)' }} className="rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-positive-primary)' }} className="font-semibold">Success!</p>
            <p style={{ color: 'var(--color-fg-positive-primary)' }} className="text-sm">Your profile has been updated.</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Information Messages</h3>
        <div style={{ backgroundColor: 'var(--color-bg-information-subtle)', borderWidth: '1px', borderColor: 'var(--color-bg-information-high)' }} className="rounded-lg p-4">
          <p style={{ color: 'var(--color-fg-information-primary)' }} className="font-semibold">Did you know?</p>
          <p style={{ color: 'var(--color-fg-information-primary)' }} className="text-sm">You can customize your dashboard layout.</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Warning Messages</h3>
        <div style={{ backgroundColor: 'var(--color-bg-attention-subtle)', borderWidth: '1px', borderColor: 'var(--color-bg-attention-high)' }} className="rounded-lg p-4">
          <p style={{ color: 'var(--color-fg-attention-primary)' }} className="font-semibold">Caution</p>
          <p style={{ color: 'var(--color-fg-attention-primary)' }} className="text-sm">This operation may take several minutes.</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Cards & Containers</h3>
        <div className="grid grid-cols-2 gap-4">
          <div style={{ backgroundColor: 'var(--color-bg-neutral-base)', borderWidth: '1px', borderColor: 'var(--color-bg-neutral-low)' }} className="rounded-lg p-4 shadow-sm">
            <p style={{ color: 'var(--color-fg-neutral-primary)' }} className="font-semibold">Default Card</p>
            <p style={{ color: 'var(--color-fg-neutral-secondary)' }} className="text-sm">Using neutral colors</p>
          </div>
          <div style={{ backgroundColor: 'var(--color-bg-neutral-subtle)', borderWidth: '1px', borderColor: 'var(--color-bg-neutral-low)' }} className="rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-neutral-primary)' }} className="font-semibold">Subtle Background</p>
            <p style={{ color: 'var(--color-fg-neutral-secondary)' }} className="text-sm">For less emphasis</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Usage Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Use semantic colors (alert, positive, etc.) instead of raw color scales when possible</li>
          <li>• Pair background and foreground colors from the same semantic group</li>
          <li>• Use "subtle" and "low" variants for large areas</li>
          <li>• Use "high" and "high-accented" variants for small, important elements</li>
          <li>• Test color combinations for sufficient contrast (WCAG AA minimum)</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world examples of using semantic colors in UI components.',
      },
    },
  },
};
