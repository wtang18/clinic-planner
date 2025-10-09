import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from './Icon';
import { ALL_ICON_NAMES, SMALL_ICON_NAMES, MEDIUM_ICON_NAMES } from './icon-names';

const meta: Meta<typeof Icon> = {
  title: 'Design System/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Icon System

The Icon component provides a type-safe way to use SVG icons throughout the application.

## Features

- **Two sizes**: Small (20px) and Medium (24px)
- **Type-safe**: TypeScript autocomplete for all icon names
- **Smart fallbacks**: Automatically falls back to available size if requested size doesn't exist
- **Color inheritance**: Uses \`currentColor\` for easy styling
- **Accessibility**: Built-in ARIA support

## Quick Reference

### Adding New Icons

1. Add SVG files to \`src/design-system/icons/small/\` or \`medium/\`
2. Run \`npm run generate-icon-map\`
3. Use with \`<Icon name="..." size="..." />\`

### Naming Conventions

- **Small (20px)**: \`icon-name-small.svg\`
- **Medium (24px)**: \`icon-name.svg\`
- **Usage**: \`<Icon name="icon-name" size="small|medium" />\`

### SVG Requirements

- Use \`fill="currentColor"\` for all paths
- Proper viewBox: \`0 0 20 20\` (small) or \`0 0 24 24\` (medium)
- No hardcoded colors

---

## Working with Claude Code (AI Assistant)

### Simple Addition
\`\`\`
Hey Claude, I just added notification-bell-small.svg to the small folder.
Can you regenerate the icon map so I can use it?
\`\`\`

### Batch Addition
\`\`\`
I just dropped 10 new icons into both small and medium folders.
Make them available in the app.
\`\`\`

### Add and Use
\`\`\`
Added heart-small.svg and heart.svg to the icon folders.
Can you make them available and update the "Like" button to use the heart icon?
\`\`\`

### Troubleshooting
\`\`\`
I added search-small.svg but TypeScript says the icon doesn't exist. What's wrong?
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
      options: ALL_ICON_NAMES,
      description: 'Icon name (without size suffix)',
    },
    size: {
      control: 'radio',
      options: ['small', 'medium'],
      description: 'Icon size',
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
type Story = StoryObj<typeof Icon>;

export const Default: Story = {
  args: {
    name: 'star',
    size: 'small',
  },
};

export const Small: Story = {
  args: {
    name: 'calendar',
    size: 'small',
  },
  parameters: {
    docs: {
      description: {
        story: 'Small icons are 20×20px (w-5 h-5). Used in small/medium buttons and compact UI elements.',
      },
    },
  },
};

export const Medium: Story = {
  args: {
    name: 'calendar',
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'Medium icons are 24×24px (w-6 h-6). Used in large buttons and prominent UI elements.',
      },
    },
  },
};

export const WithColor: Story = {
  args: {
    name: 'heart',
    size: 'medium',
    className: 'text-red-500',
  },
  parameters: {
    docs: {
      description: {
        story: 'Icons inherit color from CSS via `currentColor`. Apply color with Tailwind or custom CSS.',
      },
    },
  },
};

export const WithAccessibility: Story = {
  args: {
    name: 'checkmark',
    size: 'small',
    'aria-label': 'Task completed',
    'aria-hidden': false,
  },
  parameters: {
    docs: {
      description: {
        story: 'For non-decorative icons, provide `aria-label` and set `aria-hidden={false}`.',
      },
    },
  },
};

// Gallery Stories
export const AllSmallIcons: Story = {
  render: () => (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">All Small Icons ({SMALL_ICON_NAMES.length})</h2>
      <p className="text-gray-600 mb-6">20×20px icons</p>
      <div className="grid grid-cols-8 gap-6">
        {SMALL_ICON_NAMES.map((iconName) => (
          <div key={iconName} className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 flex items-center justify-center border rounded hover:bg-gray-50">
              <Icon name={iconName} size="small" />
            </div>
            <span className="text-xs text-center text-gray-600 w-20 truncate" title={iconName}>
              {iconName}
            </span>
          </div>
        ))}
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete gallery of all available small (20px) icons.',
      },
    },
  },
};

export const AllMediumIcons: Story = {
  render: () => (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">All Medium Icons ({MEDIUM_ICON_NAMES.length})</h2>
      <p className="text-gray-600 mb-6">24×24px icons</p>
      <div className="grid grid-cols-8 gap-6">
        {MEDIUM_ICON_NAMES.map((iconName) => (
          <div key={iconName} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 flex items-center justify-center border rounded hover:bg-gray-50">
              <Icon name={iconName} size="medium" />
            </div>
            <span className="text-xs text-center text-gray-600 w-20 truncate" title={iconName}>
              {iconName}
            </span>
          </div>
        ))}
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete gallery of all available medium (24px) icons.',
      },
    },
  },
};

export const SizeComparison: Story = {
  render: () => (
    <div className="flex items-center gap-8 p-8">
      <div className="flex flex-col items-center gap-2">
        <Icon name="star" size="small" />
        <span className="text-sm text-gray-600">Small (20px)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="star" size="medium" />
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

export const ColorVariants: Story = {
  render: () => (
    <div className="flex gap-4 p-8">
      <Icon name="heart" size="medium" className="text-red-500" />
      <Icon name="heart" size="medium" className="text-blue-500" />
      <Icon name="heart" size="medium" className="text-green-500" />
      <Icon name="heart" size="medium" className="text-purple-500" />
      <Icon name="heart" size="medium" className="text-gray-500" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icons automatically inherit color from CSS classes.',
      },
    },
  },
};

export const InButtons: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-8">
      <div className="flex gap-2 items-center">
        <Icon name="arrow-left" size="small" />
        <span className="text-sm">Small icon (20px) - Used in small/medium buttons</span>
      </div>
      <div className="flex gap-2 items-center">
        <Icon name="arrow-left" size="medium" />
        <span className="text-sm">Medium icon (24px) - Used in large buttons</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icon sizes are designed to work with corresponding button sizes.',
      },
    },
  },
};

export const ClaudeCodeExamples: Story = {
  render: () => (
    <div className="p-8 max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Working with Claude Code (AI Assistant)</h2>
      <p className="text-gray-600 mb-8">
        Use these natural language prompts to work with Claude Code when adding or managing icons.
      </p>

      <div className="space-y-8">
        {/* Simple Addition */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-blue-600">💬</span>
            Simple Addition
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Hey Claude, I just added notification-bell-small.svg to the small folder.
              Can you regenerate the icon map so I can use it?"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will run <code className="bg-gray-100 px-1 rounded">npm run generate-icon-map</code> and confirm the icon is ready to use.
          </p>
        </div>

        {/* Batch Addition */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-green-600">📦</span>
            Batch Addition
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "I just dropped 10 new icons into both small and medium folders.
              Make them available in the app."
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will regenerate the icon map for all new icons in both directories.
          </p>
        </div>

        {/* Add and Use */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-purple-600">🔧</span>
            Add and Use in Component
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Added heart-small.svg and heart.svg to the icon folders.
              Can you make them available and update the 'Like' button to use the heart icon?"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will regenerate icons and update the button component with <code className="bg-gray-100 px-1 rounded">iconL="heart"</code>.
          </p>
        </div>

        {/* Icon Verification */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-orange-600">✓</span>
            Verification
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Added trash-small.svg and trash.svg. Regenerate the icon map
              and show me how to use it in a delete button."
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will regenerate and provide usage example with the Button component.
          </p>
        </div>

        {/* Troubleshooting */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-red-600">🔍</span>
            Troubleshooting
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "I added search-small.svg but TypeScript says the icon doesn't exist.
              What's wrong?"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will check if generation script was run and verify file naming/location.
          </p>
        </div>

        {/* Icon Replacement */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-indigo-600">🔄</span>
            Replacing Existing Icon
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "I replaced the old 'star.svg' file with a new design (same filename).
              Do I need to regenerate anything?"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will confirm no regeneration needed—Next.js will hot reload in dev mode.
          </p>
        </div>

        {/* Naming Convention Check */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-yellow-600">📝</span>
            Naming Convention Check
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Before I add these 5 new icons, can you remind me of the naming convention?"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will explain: small icons use <code className="bg-gray-100 px-1 rounded">name-small.svg</code>, medium use <code className="bg-gray-100 px-1 rounded">name.svg</code>.
          </p>
        </div>
      </div>

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">💡 Pro Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Be specific about which folder you added icons to (small vs medium)</li>
          <li>• Mention if you want Claude to update a specific component after adding icons</li>
          <li>• Ask Claude to verify the icon works if you're unsure about naming</li>
          <li>• For batch operations, just say how many icons and Claude will handle the rest</li>
        </ul>
      </div>

      <div className="mt-6 p-6 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Full Documentation:</strong> See <code className="bg-white px-2 py-1 rounded">src/design-system/icons/README.md</code> for complete workflow details
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example prompts for working with Claude Code AI assistant when managing the icon library.',
      },
    },
  },
};
