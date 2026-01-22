import type { Meta, StoryObj } from '@storybook/react';
import { BicolorIcon, type BicolorIconName } from './BicolorIcon';

const meta: Meta<typeof BicolorIcon> = {
  title: 'Design System/Icons/BicolorIcon',
  component: BicolorIcon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Bicolor Icon System

The BicolorIcon component provides semantic status and directional icons with two-color styling.

## Features

- **Two sizes**: Small (20px) and Medium (24px)
- **Semantic naming**: Uses meaningful names like 'success', 'error', 'warning'
- **Default color schemes**: Pre-defined colors for each semantic meaning
- **Customizable colors**: Override container and signifier colors independently
- **Type-safe**: TypeScript autocomplete for all icon names

## How It Works

Each bicolor icon has two elements:
1. **Container** (outer shape): Circle, triangle, or square
2. **Signifier** (inner element): Checkmark, exclamation, X, etc.

Colors are applied in order:
- First \`fill\` attribute = container color
- Second \`fill\` attribute = signifier color

## Usage

\`\`\`tsx
// With default colors
<BicolorIcon name="positive" size="small" />

// Custom colors
<BicolorIcon
  name="alert"
  containerColor="#FFD700"
  signifierColor="#000000"
/>
\`\`\`

## Working with Claude Code

When you add new BicolorIcon SVG files to the folders, you can ask Claude Code to process them for you.

### Key Elements to Include in Your Prompt

1. **File names** or pattern description
2. **Desired semantic name** (e.g., "complete", "urgent", "approved")
3. **Default colors** (optional - Claude can suggest based on semantic meaning)
4. **Variant info** if applicable (light/bold)
5. **What you want done** (just regenerate map vs complete setup)

### Example Prompts

**Simple Addition:**
\`\`\`
I just added checkmark-square-small-bicolor.svg and checkmark-square-bicolor.svg
to the bicolor folders. Process these as "complete" with green/white colors.
\`\`\`

**Batch Addition:**
\`\`\`
I've added 4 new bicolor icons to the bicolor folders:
- star-circle (small + medium)
- heart-circle (small + medium)
- bookmark-circle (small + medium)
- flag-circle (small + medium)

Process all of these with default gray/dark colors. Use semantic names that make sense.
\`\`\`

**Complete Workflow:**
\`\`\`
I exported 3 new status icons from Figma and put them in the bicolor folders:

1. in-progress-spinner (blue/white)
2. on-hold-pause (yellow/dark)
3. archived-box (gray/dark)

Please handle everything needed to make them work - regenerate the map,
add semantic mappings, and set up the default colors.
\`\`\`

**With Variants:**
\`\`\`
Added light and bold variants of a "critical" status icon:

Files:
- exclamation-square-small-bicolor-light.svg / exclamation-square-bicolor-light.svg
- exclamation-square-small-bicolor-bold.svg / exclamation-square-bicolor-bold.svg

Set up as "critical" and "critical-bold" with red colors
(light: #FF6B6B/#FFF, bold: #D32F2F/#FFF)
\`\`\`

For complete documentation, see \`src/design-system/icons/README.md\`
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: [
        'positive',
        'positive-bold',
        'alert',
        'alert-bold',
        'attention',
        'info',
        'info-bold',
        'question',
        'plus',
        'minus',
        'arrow-up',
        'arrow-down',
        'arrow-left',
        'arrow-right',
        'chevron-up',
        'chevron-down',
        'chevron-left',
        'chevron-right',
      ] satisfies BicolorIconName[],
      description: 'Semantic icon name',
    },
    size: {
      control: 'radio',
      options: ['small', 'medium'],
      description: 'Icon size',
    },
    signifierColor: {
      control: 'color',
      description: 'Override signifier (inner element) color',
    },
    containerColor: {
      control: 'color',
      description: 'Override container (outer element) color',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    'aria-label': {
      control: 'text',
      description: 'Accessible label (for non-decorative icons)',
    },
    'aria-hidden': {
      control: 'boolean',
      description: 'Whether icon is decorative',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BicolorIcon>;

export const Default: Story = {
  args: {
    name: 'positive',
    size: 'small',
  },
};

export const Positive: Story = {
  args: {
    name: 'positive',
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'Positive state with green container and white checkmark.',
      },
    },
  },
};

export const PositiveBold: Story = {
  args: {
    name: 'positive-bold',
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'Bold positive variant with darker green.',
      },
    },
  },
};


export const Alert: Story = {
  args: {
    name: 'alert',
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'Alert state with yellow container and dark exclamation.',
      },
    },
  },
};

export const Attention: Story = {
  args: {
    name: 'attention',
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'Attention state with yellow triangle and dark exclamation.',
      },
    },
  },
};

export const Info: Story = {
  args: {
    name: 'info',
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'Info state with blue container and dark info symbol.',
      },
    },
  },
};

export const CustomColors: Story = {
  args: {
    name: 'positive',
    size: 'medium',
    containerColor: '#9C27B0',
    signifierColor: '#FFFFFF',
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom color override - purple container with white signifier.',
      },
    },
  },
};


// Gallery of all semantic icons
export const AllSemanticIcons: Story = {
  render: () => (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">All Semantic Bicolor Icons</h2>

      <div className="space-y-8">
        {/* Status Icons */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Status Icons</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <BicolorIcon name="positive" size="medium" />
              <div className="text-center">
                <p className="text-sm font-semibold">Positive</p>
                <p className="text-xs text-gray-600">Light variant</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <BicolorIcon name="positive-bold" size="medium" />
              <div className="text-center">
                <p className="text-sm font-semibold">Positive Bold</p>
                <p className="text-xs text-gray-600">Dark variant</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <BicolorIcon name="alert" size="medium" />
              <div className="text-center">
                <p className="text-sm font-semibold">Alert</p>
                <p className="text-xs text-gray-600">Light variant</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <BicolorIcon name="alert-bold" size="medium" />
              <div className="text-center">
                <p className="text-sm font-semibold">Alert Bold</p>
                <p className="text-xs text-gray-600">Dark variant</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <BicolorIcon name="attention" size="medium" />
              <div className="text-center">
                <p className="text-sm font-semibold">Attention</p>
                <p className="text-xs text-gray-600">Single variant</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <BicolorIcon name="info" size="medium" />
              <div className="text-center">
                <p className="text-sm font-semibold">Info</p>
                <p className="text-xs text-gray-600">Light variant</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <BicolorIcon name="info-bold" size="medium" />
              <div className="text-center">
                <p className="text-sm font-semibold">Info Bold</p>
                <p className="text-xs text-gray-600">Dark variant</p>
              </div>
            </div>
          </div>
        </div>

        {/* Utility Icons */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Utility Icons</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <BicolorIcon name="question" size="medium" />
              <div className="text-center">
                <p className="text-sm font-semibold">Question</p>
                <p className="text-xs text-gray-600">Help/info</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <BicolorIcon name="plus" size="medium" />
              <div className="text-center">
                <p className="text-sm font-semibold">Plus</p>
                <p className="text-xs text-gray-600">Add/expand</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <BicolorIcon name="minus" size="medium" />
              <div className="text-center">
                <p className="text-sm font-semibold">Minus</p>
                <p className="text-xs text-gray-600">Remove/collapse</p>
              </div>
            </div>
          </div>
        </div>

        {/* Directional Icons - Arrows */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Directional Icons - Arrows</h3>
          <div className="grid grid-cols-4 gap-6">
            <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <BicolorIcon name="arrow-up" size="medium" />
              <p className="text-sm font-semibold">Arrow Up</p>
            </div>

            <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <BicolorIcon name="arrow-down" size="medium" />
              <p className="text-sm font-semibold">Arrow Down</p>
            </div>

            <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <BicolorIcon name="arrow-left" size="medium" />
              <p className="text-sm font-semibold">Arrow Left</p>
            </div>

            <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <BicolorIcon name="arrow-right" size="medium" />
              <p className="text-sm font-semibold">Arrow Right</p>
            </div>
          </div>
        </div>

        {/* Directional Icons - Chevrons */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Directional Icons - Chevrons</h3>
          <div className="grid grid-cols-4 gap-6">
            <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <BicolorIcon name="chevron-up" size="medium" />
              <p className="text-sm font-semibold">Chevron Up</p>
            </div>

            <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <BicolorIcon name="chevron-down" size="medium" />
              <p className="text-sm font-semibold">Chevron Down</p>
            </div>

            <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <BicolorIcon name="chevron-left" size="medium" />
              <p className="text-sm font-semibold">Chevron Left</p>
            </div>

            <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <BicolorIcon name="chevron-right" size="medium" />
              <p className="text-sm font-semibold">Chevron Right</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete gallery of all semantic bicolor icons with default colors.',
      },
    },
  },
};

export const SizeComparison: Story = {
  render: () => (
    <div className="flex items-center gap-8 p-8">
      <div className="flex flex-col items-center gap-2">
        <BicolorIcon name="positive" size="small" />
        <span className="text-sm text-gray-600">Small (20px)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <BicolorIcon name="positive" size="medium" />
        <span className="text-sm text-gray-600">Medium (24px)</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison of small and medium icon sizes.',
      },
    },
  },
};

export const ColorCustomization: Story = {
  render: () => (
    <div className="p-8">
      <h3 className="text-lg font-semibold mb-6">Custom Color Examples</h3>
      <div className="space-y-8">
        {/* Positive - Default vs Custom */}
        <div>
          <p className="text-sm font-semibold mb-3 text-gray-700">Positive Icon</p>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <BicolorIcon name="positive" size="medium" />
              <p className="text-sm font-semibold">Default</p>
              <p className="text-xs text-gray-600">Green container, white signifier</p>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <BicolorIcon
                name="positive"
                size="medium"
                containerColor="#9C27B0"
                signifierColor="#FFFFFF"
              />
              <p className="text-sm font-semibold">Custom Purple</p>
              <p className="text-xs text-gray-600">Purple container, white signifier</p>
            </div>
          </div>
        </div>

        {/* Alert - Default vs Custom */}
        <div>
          <p className="text-sm font-semibold mb-3 text-gray-700">Alert Icon</p>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <BicolorIcon name="alert" size="medium" />
              <p className="text-sm font-semibold">Default</p>
              <p className="text-xs text-gray-600">Yellow container, dark signifier</p>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <BicolorIcon
                name="alert"
                size="medium"
                containerColor="#FF6B6B"
                signifierColor="#FFFFFF"
              />
              <p className="text-sm font-semibold">Custom Red</p>
              <p className="text-xs text-gray-600">Red container, white signifier</p>
            </div>
          </div>
        </div>

        {/* Info - Default vs Custom */}
        <div>
          <p className="text-sm font-semibold mb-3 text-gray-700">Info Icon</p>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <BicolorIcon name="info" size="medium" />
              <p className="text-sm font-semibold">Default</p>
              <p className="text-xs text-gray-600">Blue container, dark signifier</p>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <BicolorIcon
                name="info"
                size="medium"
                containerColor="#F5A623"
                signifierColor="#000000"
              />
              <p className="text-sm font-semibold">Custom Orange</p>
              <p className="text-xs text-gray-600">Orange container, black signifier</p>
            </div>
          </div>
        </div>

        {/* Arrow - Default vs Custom */}
        <div>
          <p className="text-sm font-semibold mb-3 text-gray-700">Arrow Icon</p>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <BicolorIcon name="arrow-up" size="medium" />
              <p className="text-sm font-semibold">Default</p>
              <p className="text-xs text-gray-600">Gray container, dark signifier</p>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <BicolorIcon
                name="arrow-up"
                size="medium"
                containerColor="#34C759"
                signifierColor="#FFFFFF"
              />
              <p className="text-sm font-semibold">Custom Green</p>
              <p className="text-xs text-gray-600">Green container, white signifier</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples showing default colors compared to custom color overrides.',
      },
    },
  },
};

export const UsageExamples: Story = {
  render: () => (
    <div className="p-8 max-w-2xl">
      <h3 className="text-lg font-semibold mb-6">Usage Examples</h3>
      <div className="space-y-6">
        {/* Positive Message */}
        <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: '#e3f5eb', borderColor: '#247450', borderWidth: '1px' }}>
          <BicolorIcon name="positive" size="small" />
          <div>
            <p className="font-semibold" style={{ color: '#174b34' }}>Success!</p>
            <p className="text-sm" style={{ color: '#247450' }}>Your changes have been saved.</p>
          </div>
        </div>

        {/* Alert Message */}
        <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: '#fcedeb', borderColor: '#b33f3b', borderWidth: '1px' }}>
          <BicolorIcon name="alert" size="small" />
          <div>
            <p className="font-semibold" style={{ color: '#712c28' }}>Alert</p>
            <p className="text-sm" style={{ color: '#b33f3b' }}>This action cannot be undone.</p>
          </div>
        </div>

        {/* Info Message */}
        <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: '#e5f3f8', borderColor: '#376c89', borderWidth: '1px' }}>
          <BicolorIcon name="info" size="small" />
          <div>
            <p className="font-semibold" style={{ color: '#234658' }}>Information</p>
            <p className="text-sm" style={{ color: '#376c89' }}>You have 3 pending tasks to review.</p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world usage examples in notification/alert contexts using semantic color tokens.',
      },
    },
  },
};
