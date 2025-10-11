import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Design System/Foundations/Legacy Tokens/Colors',
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
  bgColor,
  textColor
}: {
  label: string;
  bgColor: string;
  textColor: string;
}) => (
  <div className="flex flex-col gap-1">
    <div
      className={`w-full h-12 rounded-lg border flex items-center justify-center text-xs font-semibold ${bgColor} ${textColor}`}
    >
      {label}
    </div>
    <span className="text-2xs text-gray-600 text-center">{label}</span>
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
          <SemanticSwatch label="base" bgColor="bg-neutral-base" textColor="text-fg-neutral-primary" />
          <SemanticSwatch label="min" bgColor="bg-neutral-min" textColor="text-fg-neutral-primary" />
          <SemanticSwatch label="subtle" bgColor="bg-neutral-subtle" textColor="text-fg-neutral-primary" />
          <SemanticSwatch label="low" bgColor="bg-neutral-low" textColor="text-fg-neutral-primary" />
          <SemanticSwatch label="low-accented" bgColor="bg-neutral-low-accented" textColor="text-fg-neutral-primary" />
          <SemanticSwatch label="medium" bgColor="bg-neutral-medium" textColor="text-fg-neutral-primary" />
          <SemanticSwatch label="inverse-base" bgColor="bg-neutral-inverse-base" textColor="text-fg-neutral-inverse-primary" />
          <SemanticSwatch label="inverse-low" bgColor="bg-neutral-inverse-low" textColor="text-fg-neutral-inverse-primary" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Neutral Foregrounds</h2>
        <p className="text-sm text-gray-600 mb-6">For text and icons on light backgrounds</p>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <p className="text-fg-neutral-primary font-semibold mb-1">Primary</p>
            <p className="text-fg-neutral-primary text-xs">Main text content</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-fg-neutral-secondary font-semibold mb-1">Secondary</p>
            <p className="text-fg-neutral-secondary text-xs">Supporting text</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-fg-neutral-spot-readable font-semibold mb-1">Spot Readable</p>
            <p className="text-fg-neutral-spot-readable text-xs">Subtle hints</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-fg-neutral-disabled font-semibold mb-1">Disabled</p>
            <p className="text-fg-neutral-disabled text-xs">Inactive state</p>
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
          <SemanticSwatch label="subtle" bgColor="bg-alert-subtle" textColor="text-alert-primary" />
          <SemanticSwatch label="low" bgColor="bg-alert-low" textColor="text-alert-primary" />
          <SemanticSwatch label="low-accented" bgColor="bg-alert-low-accented" textColor="text-alert-primary" />
          <SemanticSwatch label="medium" bgColor="bg-alert-medium" textColor="text-alert-primary" />
          <SemanticSwatch label="high" bgColor="bg-alert-high" textColor="text-fg-alert-inverse-primary" />
          <SemanticSwatch label="high-accented" bgColor="bg-alert-high-accented" textColor="text-fg-alert-inverse-primary" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Example Usage</h2>
        <div className="space-y-3">
          <div className="bg-alert-subtle border-l-4 border-alert-high p-4 rounded">
            <p className="text-alert-primary font-semibold mb-1">Error</p>
            <p className="text-alert-primary text-sm">Something went wrong. Please try again.</p>
          </div>
          <div className="bg-alert-high p-4 rounded">
            <p className="text-fg-alert-inverse-primary font-semibold">Delete Account</p>
            <p className="text-fg-alert-inverse-secondary text-sm">This action cannot be undone</p>
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
          <SemanticSwatch label="subtle" bgColor="bg-positive-subtle" textColor="text-positive-primary" />
          <SemanticSwatch label="low" bgColor="bg-positive-low" textColor="text-positive-primary" />
          <SemanticSwatch label="low-accented" bgColor="bg-positive-low-accented" textColor="text-positive-primary" />
          <SemanticSwatch label="medium" bgColor="bg-positive-medium" textColor="text-positive-primary" />
          <SemanticSwatch label="strong" bgColor="bg-positive-strong" textColor="text-fg-positive-inverse-primary" />
          <SemanticSwatch label="high" bgColor="bg-positive-high" textColor="text-fg-positive-inverse-primary" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Example Usage</h2>
        <div className="space-y-3">
          <div className="bg-positive-subtle border-l-4 border-positive-high p-4 rounded">
            <p className="text-positive-primary font-semibold mb-1">Success</p>
            <p className="text-positive-primary text-sm">Your changes have been saved.</p>
          </div>
          <div className="bg-positive-strong p-4 rounded">
            <p className="text-fg-positive-inverse-primary font-semibold">Active Subscription</p>
            <p className="text-fg-positive-inverse-secondary text-sm">Your plan is active</p>
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
          <SemanticSwatch label="subtle" bgColor="bg-attention-subtle" textColor="text-attention-primary" />
          <SemanticSwatch label="low" bgColor="bg-attention-low" textColor="text-attention-primary" />
          <SemanticSwatch label="low-accented" bgColor="bg-attention-low-accented" textColor="text-attention-primary" />
          <SemanticSwatch label="medium" bgColor="bg-attention-medium" textColor="text-attention-primary" />
          <SemanticSwatch label="high" bgColor="bg-attention-high" textColor="text-white" />
          <SemanticSwatch label="high-accented" bgColor="bg-attention-high-accented" textColor="text-white" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Example Usage</h2>
        <div className="bg-attention-subtle border-l-4 border-attention-high p-4 rounded">
          <p className="text-attention-primary font-semibold mb-1">Warning</p>
          <p className="text-attention-primary text-sm">This action requires your attention.</p>
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
          <SemanticSwatch label="subtle" bgColor="bg-information-subtle" textColor="text-information-primary" />
          <SemanticSwatch label="low" bgColor="bg-information-low" textColor="text-information-primary" />
          <SemanticSwatch label="low-accented" bgColor="bg-information-low-accented" textColor="text-information-primary" />
          <SemanticSwatch label="medium" bgColor="bg-information-medium" textColor="text-information-primary" />
          <SemanticSwatch label="high" bgColor="bg-information-high" textColor="text-fg-information-inverse-primary" />
          <SemanticSwatch label="high-accented" bgColor="bg-information-high-accented" textColor="text-fg-information-inverse-primary" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Example Usage</h2>
        <div className="bg-information-subtle border-l-4 border-information-high p-4 rounded">
          <p className="text-information-primary font-semibold mb-1">Information</p>
          <p className="text-information-primary text-sm">New features are available in this release.</p>
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
          <SemanticSwatch label="subtle" bgColor="bg-accent-subtle" textColor="text-accent-primary" />
          <SemanticSwatch label="low" bgColor="bg-accent-low" textColor="text-accent-primary" />
          <SemanticSwatch label="low-accented" bgColor="bg-accent-low-accented" textColor="text-accent-primary" />
          <SemanticSwatch label="medium" bgColor="bg-accent-medium" textColor="text-accent-primary" />
          <SemanticSwatch label="high" bgColor="bg-accent-high" textColor="text-white" />
          <SemanticSwatch label="high-accented" bgColor="bg-accent-high-accented" textColor="text-white" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Example Usage</h2>
        <div className="bg-accent-subtle border border-accent-high p-4 rounded">
          <p className="text-accent-primary font-semibold mb-1">Premium Feature</p>
          <p className="text-accent-primary text-sm">Upgrade to unlock advanced analytics.</p>
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
          <div className="bg-alert-subtle border border-alert-high rounded-lg p-4">
            <p className="text-alert-primary font-semibold">Validation Error</p>
            <p className="text-alert-primary text-sm">Please fill in all required fields.</p>
          </div>
          <div className="bg-alert-high rounded-lg p-4">
            <p className="text-fg-alert-inverse-primary font-semibold">Delete Confirmation</p>
            <p className="text-fg-alert-inverse-secondary text-sm">This will permanently delete your data.</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Success Messages</h3>
        <div className="space-y-3">
          <div className="bg-positive-subtle border border-positive-high rounded-lg p-4">
            <p className="text-positive-primary font-semibold">Success!</p>
            <p className="text-positive-primary text-sm">Your profile has been updated.</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Information Messages</h3>
        <div className="bg-information-subtle border border-information-high rounded-lg p-4">
          <p className="text-information-primary font-semibold">Did you know?</p>
          <p className="text-information-primary text-sm">You can customize your dashboard layout.</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Warning Messages</h3>
        <div className="bg-attention-subtle border border-attention-high rounded-lg p-4">
          <p className="text-attention-primary font-semibold">Caution</p>
          <p className="text-attention-primary text-sm">This operation may take several minutes.</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Cards & Containers</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-neutral-base border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-fg-neutral-primary font-semibold">Default Card</p>
            <p className="text-fg-neutral-secondary text-sm">Using neutral colors</p>
          </div>
          <div className="bg-neutral-subtle border border-gray-200 rounded-lg p-4">
            <p className="text-fg-neutral-primary font-semibold">Subtle Background</p>
            <p className="text-fg-neutral-secondary text-sm">For less emphasis</p>
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
