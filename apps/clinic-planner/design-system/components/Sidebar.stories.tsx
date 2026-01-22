import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Sidebar, MenuItem } from './Sidebar';

const meta: Meta<typeof Sidebar> = {
  title: 'Design System/Components/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Whether the sidebar is open',
    },
    menuItems: {
      control: 'object',
      description: 'Array of menu items to display',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },

  parameters: {
    layout: 'fullscreen',
    controls: {
      exclude: ['className', 'style', 'ref', 'key'],
    },
    docs: {
      description: {
        component: `
# Sidebar

Production-ready navigation sidebar component with Figma design system integration.

## Quick Reference

\`\`\`tsx
import { Sidebar } from '@/design-system/components/Sidebar';

<Sidebar
  isOpen={true}
  menuItems={[
    { id: 'calendar', label: 'Calendar', icon: 'calendar', active: true, onClick: () => {} },
    { id: 'materials', label: 'Marketing Materials', icon: 'file-stack', onClick: () => {} },
  ]}
/>
\`\`\`

## Features

- **Navigation Menu**: Display a list of menu items with icons and labels
- **Active State**: Highlight the currently active menu item
- **Hover State**: Visual feedback on hover
- **Icon Support**: 24x24px medium icons from the design system
- **Fully Rounded Items**: Menu items use rounded-full for pill shape
- **Semantic Tokens**: Uses design tokens for colors and spacing
- **Keyboard Accessible**: Full keyboard navigation support
- **Screen Reader Support**: Proper ARIA attributes for navigation

## Specifications

| Property | Value |
|----------|-------|
| **Container Width** | 280px (fixed) |
| **Container Padding** | 16px |
| **Border Radius** | 24px (lg) |
| **Background** | \`rgba(255,255,255,0.68)\` with backdrop blur |
| **Elevation** | elevation-lg (shadow) |
| **Menu Item Height** | 40px |
| **Menu Item Padding** | 12px horizontal, 8px vertical |
| **Menu Item Radius** | rounded-full |
| **Gap Between Items** | 12px |
| **Typography** | Body/Md Medium (16px/24px) |
| **Icon Size** | Medium (24x24px) |

## MenuItem Interface

\`\`\`tsx
interface MenuItem {
  id: string;           // Unique identifier
  label: string;        // Display text
  icon: string;         // Icon name from design system
  active?: boolean;     // Whether this item is active
  onClick?: () => void; // Click handler
}
\`\`\`

## States

- **Default**: Transparent background, visible icon and label
- **Hover**: Light background (\`rgba(0,0,0,0.08)\`)
- **Active**: Darker background (\`rgba(0,0,0,0.12)\`), no hover state
- **Focused**: Visible focus ring for keyboard navigation

## Token Usage

\`\`\`tsx
// Container
background: var(--color-bg-transparent-inverse-low)
borderRadius: var(--dimension-radius-lg)      // 24px
padding: var(--dimension-space-around-md)      // 16px
gap: var(--dimension-space-between-separated-md)

// Menu Items
gap: var(--dimension-space-around-sm)          // 12px between items

// Active State
background: var(--color-bg-transparent-low)    // rgba(0,0,0,0.12)

// Hover State
background: var(--color-bg-transparent-subtle) // rgba(0,0,0,0.08)

// Text and Icons
color: var(--color-fg-neutral-primary)         // #181818
\`\`\`

## Accessibility

All Sidebar components follow WCAG 2.1 Level AA guidelines and include comprehensive keyboard and screen reader support.

### Keyboard Navigation

- **Tab**: Move focus to next menu item
- **Shift + Tab**: Move focus to previous menu item
- **Enter or Space**: Activate focused menu item
- **Arrow Up/Down**: Navigate between menu items (recommended enhancement)

### Screen Reader Support

The sidebar automatically includes proper ARIA attributes for navigation:
- **role="navigation"**: Identifies the sidebar as a navigation landmark (recommended to add)
- **aria-label**: Should be provided to describe the navigation (e.g., "Main navigation")
- **aria-current="page"**: Should be used instead of visual active state for the current page

### Focus Management

- Menu items are keyboard focusable with visible focus indicators
- Focus order follows visual order top to bottom
- Focus indicators use high contrast for visibility

### Best Practices for Accessibility

\`\`\`tsx
// ✅ Correct - Provide navigation label
<Sidebar
  isOpen={true}
  menuItems={menuItems}
  aria-label="Main navigation"
/>

// ✅ Correct - Use aria-current for active page
menuItems={[
  {
    id: 'calendar',
    label: 'Calendar',
    icon: 'calendar',
    active: true,
    'aria-current': 'page' // Indicates current page
  }
]}

// ❌ Wrong - No accessible label
<Sidebar isOpen={true} menuItems={menuItems} />
\`\`\`

## Best Practices

1. **Always provide unique IDs**: Each menu item must have a unique \`id\` for proper state management
2. **Use descriptive labels**: Menu labels should be clear and concise
3. **Provide onClick handlers**: All menu items should have navigation functionality
4. **Mark active item**: Always mark the current page/section as active
5. **Choose appropriate icons**: Use icons that clearly represent the menu item's purpose
6. **Consider mobile**: On mobile devices, consider a collapsible/overlay sidebar
7. **Accessibility labels**: Provide \`aria-label\` for the sidebar navigation
8. **Use aria-current**: For the active page, use \`aria-current="page"\` instead of just visual styling

## Usage Examples

\`\`\`tsx
// Basic navigation sidebar
const [activeId, setActiveId] = useState('calendar');

const menuItems = [
  {
    id: 'calendar',
    label: 'Calendar',
    icon: 'calendar',
    active: activeId === 'calendar',
    onClick: () => setActiveId('calendar')
  },
  {
    id: 'materials',
    label: 'Marketing Materials',
    icon: 'file-stack',
    active: activeId === 'materials',
    onClick: () => setActiveId('materials')
  },
];

<Sidebar isOpen={true} menuItems={menuItems} />
\`\`\`
        `.trim(),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default menu items for stories
const defaultMenuItems: MenuItem[] = [
  { id: 'calendar', label: 'Calendar', icon: 'calendar', active: true },
  { id: 'materials', label: 'Marketing Materials', icon: 'file-stack' },
  { id: 'patients', label: 'Patients', icon: 'person' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

/**
 * Interactive playground with all controls
 */
export const Playground: Story = {
  render: (args) => {
    const [activeId, setActiveId] = useState('calendar');

    const interactiveMenuItems = args.menuItems.map(item => ({
      ...item,
      active: item.id === activeId,
      onClick: () => {
        setActiveId(item.id);
        console.log('Clicked:', item.label);
      },
    }));

    return (
      <div className="h-screen bg-gray-100 p-8">
        <Sidebar {...args} menuItems={interactiveMenuItems} />
      </div>
    );
  },
  args: {
    isOpen: true,
    menuItems: defaultMenuItems,
  },
};

/**
 * Basic sidebar with standard menu items
 */
export const Overview: Story = {
  render: () => {
    const [activeId, setActiveId] = useState('calendar');

    const menuItems: MenuItem[] = [
      {
        id: 'calendar',
        label: 'Calendar',
        icon: 'calendar',
        active: activeId === 'calendar',
        onClick: () => setActiveId('calendar')
      },
      {
        id: 'materials',
        label: 'Marketing Materials',
        icon: 'file-stack',
        active: activeId === 'materials',
        onClick: () => setActiveId('materials')
      },
      {
        id: 'patients',
        label: 'Patients',
        icon: 'person',
        active: activeId === 'patients',
        onClick: () => setActiveId('patients')
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: 'settings',
        active: activeId === 'settings',
        onClick: () => setActiveId('settings')
      },
    ];

    return (
      <div className="h-screen bg-gray-100 p-8">
        <Sidebar isOpen={true} menuItems={menuItems} />
      </div>
    );
  },
};

/**
 * Different menu configurations
 */
export const MenuVariations: Story = {
  render: () => {
    const [activeIds, setActiveIds] = useState({
      minimal: 'home',
      standard: 'calendar',
      extended: 'dashboard',
    });

    const minimalMenu: MenuItem[] = [
      {
        id: 'home',
        label: 'Home',
        icon: 'home',
        active: activeIds.minimal === 'home',
        onClick: () => setActiveIds(prev => ({ ...prev, minimal: 'home' }))
      },
      {
        id: 'search',
        label: 'Search',
        icon: 'search',
        active: activeIds.minimal === 'search',
        onClick: () => setActiveIds(prev => ({ ...prev, minimal: 'search' }))
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: 'person',
        active: activeIds.minimal === 'profile',
        onClick: () => setActiveIds(prev => ({ ...prev, minimal: 'profile' }))
      },
    ];

    const standardMenu: MenuItem[] = [
      {
        id: 'calendar',
        label: 'Calendar',
        icon: 'calendar',
        active: activeIds.standard === 'calendar',
        onClick: () => setActiveIds(prev => ({ ...prev, standard: 'calendar' }))
      },
      {
        id: 'materials',
        label: 'Marketing Materials',
        icon: 'file-stack',
        active: activeIds.standard === 'materials',
        onClick: () => setActiveIds(prev => ({ ...prev, standard: 'materials' }))
      },
      {
        id: 'patients',
        label: 'Patients',
        icon: 'person',
        active: activeIds.standard === 'patients',
        onClick: () => setActiveIds(prev => ({ ...prev, standard: 'patients' }))
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: 'document',
        active: activeIds.standard === 'reports',
        onClick: () => setActiveIds(prev => ({ ...prev, standard: 'reports' }))
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: 'settings',
        active: activeIds.standard === 'settings',
        onClick: () => setActiveIds(prev => ({ ...prev, standard: 'settings' }))
      },
    ];

    const extendedMenu: MenuItem[] = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'home',
        active: activeIds.extended === 'dashboard',
        onClick: () => setActiveIds(prev => ({ ...prev, extended: 'dashboard' }))
      },
      {
        id: 'calendar',
        label: 'Calendar',
        icon: 'calendar',
        active: activeIds.extended === 'calendar',
        onClick: () => setActiveIds(prev => ({ ...prev, extended: 'calendar' }))
      },
      {
        id: 'materials',
        label: 'Marketing Materials',
        icon: 'file-stack',
        active: activeIds.extended === 'materials',
        onClick: () => setActiveIds(prev => ({ ...prev, extended: 'materials' }))
      },
      {
        id: 'patients',
        label: 'Patients',
        icon: 'person',
        active: activeIds.extended === 'patients',
        onClick: () => setActiveIds(prev => ({ ...prev, extended: 'patients' }))
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: 'chart',
        active: activeIds.extended === 'analytics',
        onClick: () => setActiveIds(prev => ({ ...prev, extended: 'analytics' }))
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: 'document',
        active: activeIds.extended === 'reports',
        onClick: () => setActiveIds(prev => ({ ...prev, extended: 'reports' }))
      },
      {
        id: 'team',
        label: 'Team',
        icon: 'people',
        active: activeIds.extended === 'team',
        onClick: () => setActiveIds(prev => ({ ...prev, extended: 'team' }))
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: 'settings',
        active: activeIds.extended === 'settings',
        onClick: () => setActiveIds(prev => ({ ...prev, extended: 'settings' }))
      },
    ];

    return (
      <div className="p-8 space-y-8 bg-gray-100 min-h-screen">
        <div>
          <h3 className="text-lg font-bold mb-4">Minimal Menu (3 items)</h3>
          <div className="h-[400px]">
            <Sidebar isOpen={true} menuItems={minimalMenu} />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">Standard Menu (5 items)</h3>
          <div className="h-[500px]">
            <Sidebar isOpen={true} menuItems={standardMenu} />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">Extended Menu (8 items)</h3>
          <div className="h-[700px]">
            <Sidebar isOpen={true} menuItems={extendedMenu} />
          </div>
        </div>
      </div>
    );
  },
};

/**
 * Demonstrates all interactive states
 */
export const InteractiveStates: Story = {
  render: () => {
    const [activeId, setActiveId] = useState('active');

    const menuItems: MenuItem[] = [
      {
        id: 'active',
        label: 'Active Item',
        icon: 'checkmark',
        active: true,
      },
      {
        id: 'hover',
        label: 'Hover Me',
        icon: 'cursor',
        active: false,
        onClick: () => console.log('Clicked: Hover Me')
      },
      {
        id: 'clickable',
        label: 'Clickable Item',
        icon: 'hand-point',
        active: activeId === 'clickable',
        onClick: () => {
          setActiveId('clickable');
          console.log('Clicked: Clickable Item');
        }
      },
      {
        id: 'standard',
        label: 'Standard Item',
        icon: 'document',
        active: false,
        onClick: () => console.log('Clicked: Standard Item')
      },
    ];

    return (
      <div className="h-screen bg-gray-100 p-8">
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold mb-2">Interactive States Demonstration</h3>
          <ul className="text-sm space-y-1">
            <li>• <strong>Active:</strong> Dark background, no hover state</li>
            <li>• <strong>Hover:</strong> Light background on mouse over</li>
            <li>• <strong>Clickable:</strong> Try clicking items to see state change</li>
            <li>• <strong>Standard:</strong> Default appearance</li>
          </ul>
        </div>
        <Sidebar isOpen={true} menuItems={menuItems} />
      </div>
    );
  },
};

/**
 * Real-world application layout
 */
export const ApplicationLayout: Story = {
  render: () => {
    const [activeId, setActiveId] = useState('calendar');

    const menuItems: MenuItem[] = [
      {
        id: 'calendar',
        label: 'Calendar',
        icon: 'calendar',
        active: activeId === 'calendar',
        onClick: () => setActiveId('calendar')
      },
      {
        id: 'materials',
        label: 'Marketing Materials',
        icon: 'file-stack',
        active: activeId === 'materials',
        onClick: () => setActiveId('materials')
      },
      {
        id: 'patients',
        label: 'Patients',
        icon: 'person',
        active: activeId === 'patients',
        onClick: () => setActiveId('patients')
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: 'settings',
        active: activeId === 'settings',
        onClick: () => setActiveId('settings')
      },
    ];

    return (
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="p-4">
          <Sidebar isOpen={true} menuItems={menuItems} />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="bg-white rounded-lg shadow-sm p-6 h-full">
            <h1 className="text-2xl font-bold mb-4">
              {menuItems.find(item => item.id === activeId)?.label}
            </h1>
            <p className="text-gray-600">
              This is the main content area for the {menuItems.find(item => item.id === activeId)?.label} section.
            </p>
          </div>
        </div>
      </div>
    );
  },
};

export const AccessibilityDemo: Story = {
  render: () => {
    const [activeId, setActiveId] = useState('calendar');

    const accessibleMenuItems: MenuItem[] = [
      {
        id: 'calendar',
        label: 'Calendar',
        icon: 'calendar',
        active: activeId === 'calendar',
        onClick: () => setActiveId('calendar')
      },
      {
        id: 'materials',
        label: 'Marketing Materials',
        icon: 'file-stack',
        active: activeId === 'materials',
        onClick: () => setActiveId('materials')
      },
      {
        id: 'patients',
        label: 'Patients',
        icon: 'person',
        active: activeId === 'patients',
        onClick: () => setActiveId('patients')
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: 'settings',
        active: activeId === 'settings',
        onClick: () => setActiveId('settings')
      },
    ];

    return (
      <div className="p-8 space-y-8 bg-gray-100 min-h-screen">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-bold mb-4">Accessibility Features</h3>
          <p className="text-sm text-gray-700 mb-4">
            Sidebar components are fully keyboard accessible and follow WCAG guidelines.
          </p>
          <ul className="text-sm space-y-2 mb-6 text-gray-700">
            <li>✓ Keyboard navigation (Tab, Enter, Space)</li>
            <li>✓ Screen reader support with navigation role</li>
            <li>✓ Visible focus indicators</li>
            <li>✓ WCAG AA color contrast ratios</li>
            <li>✓ Active state announcements</li>
            <li>✓ Proper button semantics for menu items</li>
          </ul>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-600 mb-2">✓ Try keyboard navigation:</p>
              <p className="text-xs text-gray-500 mb-4">
                Press Tab to focus menu items, Enter/Space to activate, Shift+Tab to go back
              </p>
            </div>
          </div>
        </div>

        <div className="h-[600px]">
          <Sidebar isOpen={true} menuItems={accessibleMenuItems} />
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-bold mb-2">Accessibility Best Practices</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold mb-2">✅ Do:</p>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Provide unique IDs for all menu items</li>
                <li>• Use descriptive labels that make sense out of context</li>
                <li>• Include aria-label on the sidebar container</li>
                <li>• Use aria-current="page" for the active page</li>
                <li>• Ensure sufficient color contrast (4.5:1 for text)</li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold mb-2">❌ Don't:</p>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Use icons without labels</li>
                <li>• Rely only on color to indicate active state</li>
                <li>• Forget to provide click handlers</li>
                <li>• Use vague labels like "Click here" or "Link"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const ClaudeCodeExamples: Story = {
  render: () => (
    <div className="p-8 max-w-4xl bg-[var(--color-bg-neutral-base)] min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Working with Claude Code (AI Assistant)</h2>
      <p className="text-gray-600 mb-8">Use these natural language prompts when working with Sidebar.</p>

      <div className="space-y-6">
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3">
            <span className="text-blue-600">🎨</span> Create Navigation Sidebar
          </h3>
          <div className="bg-white p-4 rounded border mb-3">
            <code className="text-sm text-gray-800">
              "Add a sidebar with menu items for Calendar, Patients, and Settings"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add Sidebar component with menuItems array and proper icons
          </p>
        </div>

        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3">
            <span className="text-green-600">✨</span> Add Active State Management
          </h3>
          <div className="bg-white p-4 rounded border mb-3">
            <code className="text-sm text-gray-800">
              "Make the sidebar highlight the active menu item based on the current page"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add state management with <code className="bg-gray-100 px-1">active</code> prop tracking
          </p>
        </div>

        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3">
            <span className="text-purple-600">🔗</span> Add Navigation Handlers
          </h3>
          <div className="bg-white p-4 rounded border mb-3">
            <code className="text-sm text-gray-800">
              "Add onClick handlers to each menu item to navigate to different pages"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add <code className="bg-gray-100 px-1">onClick</code> handlers with navigation logic (e.g., router.push)
          </p>
        </div>

        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3">
            <span className="text-orange-600">♿</span> Improve Accessibility
          </h3>
          <div className="bg-white p-4 rounded border mb-3">
            <code className="text-sm text-gray-800">
              "Add proper ARIA labels to make the sidebar more accessible"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add <code className="bg-gray-100 px-1">aria-label="Main navigation"</code> and <code className="bg-gray-100 px-1">aria-current="page"</code> for active item
          </p>
        </div>

        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3">
            <span className="text-red-600">🎯</span> Add More Menu Items
          </h3>
          <div className="bg-white p-4 rounded border mb-3">
            <code className="text-sm text-gray-800">
              "Add Analytics and Reports menu items to the sidebar"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will extend the menuItems array with new items and appropriate icons
          </p>
        </div>

        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3">
            <span className="text-teal-600">📱</span> Make Sidebar Responsive
          </h3>
          <div className="bg-white p-4 rounded border mb-3">
            <code className="text-sm text-gray-800">
              "Make the sidebar collapsible on mobile devices with a toggle button"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add toggle functionality using <code className="bg-gray-100 px-1">isOpen</code> prop and add a button to control it
          </p>
        </div>
      </div>

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">💡 Pro Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Always provide unique IDs for menu items</li>
          <li>• Use descriptive labels and appropriate icons</li>
          <li>• Add aria-label for navigation landmark</li>
          <li>• Use aria-current="page" for the active item</li>
          <li>• Sidebar uses semantic tokens for theming</li>
          <li>• Consider mobile responsiveness with isOpen prop</li>
        </ul>
      </div>
    </div>
  ),
};
