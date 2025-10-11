import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Design System/Semantics/Elevation',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Elevation System

A token-based elevation system using **multi-layer box-shadows** for depth and visual hierarchy.

## Quick Reference

**Levels**: 7 elevation levels + inner shadow + none
**Regenerate**: \`npm run elevation:generate\`
**Token Source**: \`primitives-elevation.json\`, \`semantic-elevation.json\`

---

## Features

- ✅ **Token-based**: All shadows reference primitive dimension and color tokens
- ✅ **Multi-layer**: 1-2 shadow layers per elevation for realistic depth
- ✅ **Auto-generated**: Utility classes generated from semantic tokens
- ✅ **Semantic naming**: Clear elevation scale from xs to 2xl

---

## Naming Convention

\`.elevation-{size}\`

| Size | Shadow Intensity | Typical Z-Index | Use Case |
|------|------------------|-----------------|----------|
| \`none\` | No shadow | - | Flat elements on page background |
| \`xs\` | Very subtle (5% opacity) | 1-10 | Barely visible depth |
| \`sm\` | Subtle (6% opacity) | 10-50 | Subtle cards, resting state |
| \`md\` | Medium (12% opacity) | 50-100 | **Standard cards (recommended)** |
| \`lg\` | Strong (12% opacity) | 100-500 | Dropdowns, sticky headers, tooltips |
| \`xl\` | Stronger (24% opacity) | 500-1000 | Popovers, floating menus |
| \`2xl\` | Maximum (24% opacity) | 1000+ | Modals, dialogs, overlays |
| \`inner\` | Inset (12% opacity) | - | Pressed/active button states |

**Rule of thumb**: Higher elevation = stronger shadow = higher z-index

---

## Usage Examples

### Standard Card
\`\`\`tsx
<div className="elevation-md rounded-lg p-6 bg-white">
  <h3 className="text-heading-md-medium text-fg-neutral-primary mb-2">
    Card Title
  </h3>
  <p className="text-body-sm-regular text-fg-neutral-secondary">
    Card content with medium elevation
  </p>
</div>
\`\`\`

### Interactive Card with Hover
\`\`\`tsx
// Note: Hover behavior is NOT built into elevation utilities
// Handle in component with state or CSS:

const [hovered, setHovered] = useState(false);
<button
  className={\`\${hovered ? 'elevation-md' : 'elevation-sm'} transition-shadow rounded-lg p-4\`}
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
>
  Hover me to see elevation increase
</button>

// Or in component CSS:
// .my-button { @apply elevation-sm transition-shadow; }
// .my-button:hover { @apply elevation-md; }
\`\`\`

### Dropdown Menu
\`\`\`tsx
<div className="elevation-lg rounded-md bg-white border">
  <div className="p-2">Menu items...</div>
</div>
\`\`\`

### Modal Dialog
\`\`\`tsx
<div className="elevation-2xl rounded-xl p-8 bg-white max-w-md">
  <h2 className="text-heading-xl-bold mb-4">Modal Title</h2>
  <p className="text-body-md-regular mb-6">Modal content...</p>
  <button className="elevation-sm active:elevation-inner">
    Confirm
  </button>
</div>
\`\`\`

### Pressed Button State
\`\`\`tsx
// For active/pressed states, handle with component logic or CSS:
<button className="elevation-md active:elevation-inner px-4 py-2 bg-gray-100 rounded">
  Click me for inner shadow
</button>

// Note: active: pseudo-class may not work with custom utilities in all setups
// More reliable approach in component CSS or state
\`\`\`

---

## Elevation & Stacking Context

Use elevation to communicate **visual depth and layering**:

| Elevation | Z-Index Range | Stacking Context | Common Elements |
|-----------|---------------|------------------|-----------------|
| \`none\` | - | Flat | Page background, borders, dividers |
| \`xs\` | 1-10 | Barely lifted | Subtle hover states |
| \`sm\` | 10-50 | Resting | Subtle cards, resting state |
| \`md\` | 50-100 | Raised | **Standard cards & containers** ✓ |
| \`lg\` | 100-500 | Floating | Dropdowns, sticky headers, tooltips |
| \`xl\` | 500-1000 | Hovering | Popovers, floating menus |
| \`2xl\` | 1000+ | Overlay | Modals, dialogs, notifications |

**Rule of thumb**: Higher elevation = stronger shadow = higher z-index

---

## Token Architecture

### Primitive Tokens
Define the **building blocks** for shadows:

\`\`\`json
{
  "elevation": {
    "shadow": {
      "y": {
        "0": "0px",
        "1": "2px",   // via {dimension.space.25}
        "4": "8px",   // via {dimension.space.100}
        ...
      },
      "blur": {
        "0": "0px",
        "4": "4px",   // via {dimension.space.50}
        ...
      },
      "color": {
        "subtle": "{black.alpha-min}",     // 5% opacity
        "default": "{black.alpha-lower}",  // 12% opacity
        "medium": "{black.alpha-low}"      // 24% opacity
      }
    }
  }
}
\`\`\`

### Semantic Tokens
Define **complete elevations** with multiple layers:

\`\`\`json
{
  "elevation": {
    "md": {
      "layer-1": {
        "x": "{elevation.shadow.x.0}",        // 0px
        "y": "{elevation.shadow.y.4}",        // 8px
        "blur": "{elevation.shadow.blur.8}",  // 8px
        "spread": "{elevation.shadow.spread.negative-2}", // -2px
        "color": "{elevation.shadow.color.default}"       // 12% black
      },
      "layer-2": { ... }
    }
  }
}
\`\`\`

### Generated Utility
Combines layers into a single \`box-shadow\`:

\`\`\`css
.elevation-md {
  box-shadow:
    var(--elevation-md-layer-1-x) var(--elevation-md-layer-1-y)
    var(--elevation-md-layer-1-blur) var(--elevation-md-layer-1-spread)
    var(--elevation-md-layer-1-color),
    var(--elevation-md-layer-2-x) var(--elevation-md-layer-2-y)
    var(--elevation-md-layer-2-blur) var(--elevation-md-layer-2-spread)
    var(--elevation-md-layer-2-color);
}
\`\`\`

**Result**: \`0 8px 8px -2px rgba(0,0,0,0.12), 0 4px 4px 0 rgba(0,0,0,0.06)\`

---

## Working with Claude Code (AI Assistant)

### Add New Elevation Level
\`\`\`
Can you add a new elevation level "elevation-3xl" with 3 shadow layers
for maximum depth? Use 48px Y offset and 60px blur.
\`\`\`

### Adjust Existing Elevation
\`\`\`
The elevation-lg shadow feels too strong. Can you reduce the opacity
from 24% to 18% and regenerate?
\`\`\`

### Regenerate After Token Changes
\`\`\`
I updated the semantic-elevation.json file to add a new layer to elevation-xl.
Can you regenerate the utility classes?
\`\`\`

### Find the Right Elevation
\`\`\`
I need a shadow for a floating notification toast that appears above modals.
What elevation level should I use?
\`\`\`

### Verify Token Chain
\`\`\`
Show me the full token resolution for elevation-md
(from utility class → semantic tokens → primitive tokens → final values)
\`\`\`

### Migration from Tailwind
\`\`\`
Can you migrate this component from Tailwind's shadow-lg to our elevation system?
<div className="shadow-lg rounded-lg p-4">Card</div>
\`\`\`

---

## Best Practices

### ✅ Do

- Use \`elevation-md\` as the default for most cards
- Add \`transition-shadow\` when implementing hover effects manually
- Use \`elevation-inner\` for pressed/active button states
- Match elevation size with z-index (higher elevation = higher z-index)
- Reserve \`elevation-xl\` and \`elevation-2xl\` for modals and overlays
- Set background color for proper contrast (shadows need visible backgrounds)

### ❌ Don't

- Expect \`hover:elevation-md\` to work (not built into utilities)
- Stack too many different elevation levels on the same screen
- Use large elevations (\`xl\`, \`2xl\`) for standard cards
- Apply elevation to transparent elements
- Use elevation without considering z-index hierarchy

### 💡 Hover Effects

Elevation utilities are **static only** - no built-in hover behavior:

\`\`\`tsx
// ❌ This won't work (Tailwind doesn't know our custom classes)
<div className="elevation-sm hover:elevation-md">

// ✅ Handle hover in component state
const [hovered, setHovered] = useState(false);
<div className={\`\${hovered ? 'elevation-md' : 'elevation-sm'} transition-shadow\`}>

// ✅ Or use component CSS
// .my-card { @apply elevation-sm transition-shadow; }
// .my-card:hover { @apply elevation-md; }
\`\`\`

---

## Accessibility Considerations

- **Don't rely on shadows alone** for critical UI states
- **Pair with color/border changes** for hover/focus states
- **Test on different backgrounds**—shadows may be less visible on dark backgrounds
- **Consider reduced motion**—use \`transition-shadow\` carefully

---

## Tailwind Integration

You can still use Tailwind's shadow utilities, but for consistency:

| Tailwind | Elevation System | Use Case |
|----------|------------------|----------|
| \`shadow-sm\` | \`elevation-sm\` | Subtle cards |
| \`shadow\` | \`elevation-md\` | Default cards ✅ |
| \`shadow-md\` | \`elevation-lg\` | Dropdowns |
| \`shadow-lg\` | \`elevation-xl\` | Popovers |
| \`shadow-2xl\` | \`elevation-2xl\` | Modals |
| \`shadow-inner\` | \`elevation-inner\` | Pressed states |
| \`shadow-none\` | \`elevation-none\` | Remove shadow |

**Recommendation**: Use elevation system utilities for consistency with design tokens.

---

## Customization

### Adding a New Elevation Level

1. **Edit** \`src/design-system/tokens/sd-input/semantic-elevation.json\`
2. **Add** new level with layers:
   \`\`\`json
   "3xl": {
     "comment": "3XL elevation - Maximum depth",
     "layer-1": { ... },
     "layer-2": { ... }
   }
   \`\`\`
3. **Rebuild** tokens: \`npm run tokens:build\`
4. **Regenerate** utilities: \`npm run elevation:generate\`
5. **Update** this story to include the new level

### Adjusting Shadow Intensity

Edit \`primitives-elevation.json\` → \`elevation.shadow.color\` values to adjust opacity across all elevations.

---

## File Structure

\`\`\`
src/design-system/tokens/
├── sd-input/
│   ├── primitives-elevation.json       ← Primitive shadow tokens
│   └── semantic-elevation.json         ← Semantic elevation levels
├── build/
│   ├── primitives-elevation.css        ← Generated primitive CSS
│   ├── semantic-elevation.css          ← Generated semantic CSS
│   └── elevation-utilities.css         ← Generated utility classes
└── scripts/
    └── generate-elevation-utilities.js ← Generator script
\`\`\`
        `.trim(),
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Elevation Scale Story
export const ElevationScale: Story = {
  render: () => (
    <div className="p-8 space-y-8 bg-gray-50">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Elevation Scale</h2>
        <p className="text-sm text-gray-600 mb-8">
          All elevation levels from subtle to dramatic
        </p>
      </div>

      <div className="grid grid-cols-4 gap-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 elevation-xs bg-white rounded-lg flex items-center justify-center">
            <span className="text-sm text-gray-600">XS</span>
          </div>
          <div className="text-center">
            <code className="text-xs bg-gray-200 px-2 py-1 rounded">.elevation-xs</code>
            <p className="text-xs text-gray-600 mt-1">Barely visible</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 elevation-sm bg-white rounded-lg flex items-center justify-center">
            <span className="text-sm text-gray-600">SM</span>
          </div>
          <div className="text-center">
            <code className="text-xs bg-gray-200 px-2 py-1 rounded">.elevation-sm</code>
            <p className="text-xs text-gray-600 mt-1">Subtle</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 elevation-md bg-white rounded-lg flex items-center justify-center">
            <span className="text-sm text-gray-600 font-semibold">MD ✓</span>
          </div>
          <div className="text-center">
            <code className="text-xs bg-gray-200 px-2 py-1 rounded">.elevation-md</code>
            <p className="text-xs text-gray-600 mt-1">Default (recommended)</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 elevation-lg bg-white rounded-lg flex items-center justify-center">
            <span className="text-sm text-gray-600">LG</span>
          </div>
          <div className="text-center">
            <code className="text-xs bg-gray-200 px-2 py-1 rounded">.elevation-lg</code>
            <p className="text-xs text-gray-600 mt-1">Elevated</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 elevation-xl bg-white rounded-lg flex items-center justify-center">
            <span className="text-sm text-gray-600">XL</span>
          </div>
          <div className="text-center">
            <code className="text-xs bg-gray-200 px-2 py-1 rounded">.elevation-xl</code>
            <p className="text-xs text-gray-600 mt-1">Floating</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 elevation-2xl bg-white rounded-lg flex items-center justify-center">
            <span className="text-sm text-gray-600">2XL</span>
          </div>
          <div className="text-center">
            <code className="text-xs bg-gray-200 px-2 py-1 rounded">.elevation-2xl</code>
            <p className="text-xs text-gray-600 mt-1">Maximum</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 elevation-inner bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-sm text-gray-600">Inner</span>
          </div>
          <div className="text-center">
            <code className="text-xs bg-gray-200 px-2 py-1 rounded">.elevation-inner</code>
            <p className="text-xs text-gray-600 mt-1">Inset/pressed</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 elevation-none bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <span className="text-sm text-gray-600">None</span>
          </div>
          <div className="text-center">
            <code className="text-xs bg-gray-200 px-2 py-1 rounded">.elevation-none</code>
            <p className="text-xs text-gray-600 mt-1">Flat</p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete elevation scale showing all available levels.',
      },
    },
  },
};

// Interactive States Story
export const InteractiveStates: Story = {
  render: () => {
    const [hoveredButton, setHoveredButton] = React.useState(false);
    const [hoveredCard, setHoveredCard] = React.useState(false);

    return (
      <div className="p-8 space-y-12 bg-gray-50">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Interactive States</h2>
          <p className="text-sm text-gray-600 mb-4">
            Elevation utilities are static - implement hover with component state or CSS
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-900">
              <strong>Note:</strong> These examples use React state to swap elevation classes.
              See "Best Practices" in Docs for implementation details.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Hover Elevation (State-based)</h3>
            <button
              className={`${hoveredButton ? 'elevation-md' : 'elevation-sm'} transition-shadow px-6 py-3 bg-white rounded-lg text-sm font-medium`}
              onMouseEnter={() => setHoveredButton(true)}
              onMouseLeave={() => setHoveredButton(false)}
            >
              Hover me (sm → md)
            </button>
            <p className="text-xs text-gray-600 mt-2">
              Uses React state: <code className="bg-gray-200 px-1 rounded">onMouseEnter/Leave</code> to swap classes
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Static Elevation (No hover)</h3>
            <button className="elevation-md px-6 py-3 bg-white rounded-lg text-sm font-medium">
              Static elevation-md
            </button>
            <p className="text-xs text-gray-600 mt-2">
              Most buttons don't need hover elevation effects
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Interactive Card (State-based)</h3>
            <div
              className={`${hoveredCard ? 'elevation-lg' : 'elevation-sm'} transition-shadow cursor-pointer max-w-sm p-6 bg-white rounded-lg`}
              onMouseEnter={() => setHoveredCard(true)}
              onMouseLeave={() => setHoveredCard(false)}
            >
              <h4 className="text-heading-sm-medium text-fg-neutral-primary mb-2">
                Hover for Dramatic Lift
              </h4>
              <p className="text-body-sm-regular text-fg-neutral-secondary">
                This card jumps two elevation levels on hover (sm → lg)
              </p>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Alternative: Use component CSS with <code className="bg-gray-200 px-1 rounded">:hover</code> selector
            </p>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Examples of implementing interactive hover states with elevation (using React state or component CSS).',
      },
    },
  },
};

// Real-World Examples Story
export const RealWorldExamples: Story = {
  render: () => (
    <div className="p-8 space-y-12 bg-gray-50">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Real-World Examples</h2>
        <p className="text-sm text-gray-600">
          Common UI patterns using elevation
        </p>
      </div>

      <div className="space-y-12">
        {/* Dashboard Cards */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Dashboard Cards (elevation-md)</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="elevation-md p-6 bg-white rounded-lg">
              <div className="text-label-sm-medium text-fg-neutral-secondary mb-2">
                Total Users
              </div>
              <div className="text-heading-2xl-bold text-fg-neutral-primary">
                12,543
              </div>
              <div className="text-body-sm-regular text-[#10b981] mt-2">
                +12% from last month
              </div>
            </div>
            <div className="elevation-md p-6 bg-white rounded-lg">
              <div className="text-label-sm-medium text-fg-neutral-secondary mb-2">
                Revenue
              </div>
              <div className="text-heading-2xl-bold text-fg-neutral-primary">
                $45.2k
              </div>
              <div className="text-body-sm-regular text-[#10b981] mt-2">
                +8% from last month
              </div>
            </div>
            <div className="elevation-md p-6 bg-white rounded-lg">
              <div className="text-label-sm-medium text-fg-neutral-secondary mb-2">
                Active Sessions
              </div>
              <div className="text-heading-2xl-bold text-fg-neutral-primary">
                1,234
              </div>
              <div className="text-body-sm-regular text-[#ef4444] mt-2">
                -3% from last month
              </div>
            </div>
          </div>
        </div>

        {/* Dropdown Menu */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Dropdown Menu (elevation-lg)</h3>
          <div className="inline-block">
            <button className="px-4 py-2 bg-white elevation-sm rounded-lg text-sm font-medium border">
              Options ▾
            </button>
            <div className="mt-2 elevation-lg bg-white rounded-lg border overflow-hidden w-48">
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">
                Edit
              </button>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">
                Duplicate
              </button>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">
                Archive
              </button>
              <hr className="border-gray-200" />
              <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Modal */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Modal Dialog (elevation-2xl)</h3>
          <div className="elevation-2xl max-w-md p-8 bg-white rounded-xl">
            <h2 className="text-heading-xl-bold text-fg-neutral-primary mb-4">
              Confirm Action
            </h2>
            <p className="text-body-md-regular text-fg-neutral-secondary mb-6">
              Are you sure you want to delete this item? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button className="px-4 py-2 text-sm font-medium rounded-lg border hover:bg-gray-50">
                Cancel
              </button>
              <button className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Toast Notification (elevation-xl)</h3>
          <div className="elevation-xl max-w-sm p-4 bg-white rounded-lg border flex gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white flex-shrink-0">
              ✓
            </div>
            <div>
              <div className="text-body-sm-medium text-fg-neutral-primary mb-1">
                Success!
              </div>
              <div className="text-body-sm-regular text-fg-neutral-secondary">
                Your changes have been saved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Common UI patterns showing appropriate elevation usage.',
      },
    },
  },
};

// Elevation Hierarchy Story
export const ElevationHierarchy: Story = {
  render: () => (
    <div className="p-8 space-y-8 bg-gray-50">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Stacking & Layering</h2>
        <p className="text-sm text-gray-600 mb-8">
          Understanding visual depth in complex interfaces
        </p>
      </div>

      <div className="relative elevation-sm p-8 bg-white rounded-lg">
        <h3 className="text-heading-md-medium mb-4">Resting: Base Container (elevation-sm)</h3>
        <p className="text-body-sm-regular text-gray-600 mb-6">
          Subtle cards resting on the page background.
        </p>

        <div className="relative elevation-md p-6 bg-white rounded-lg">
          <h4 className="text-heading-sm-medium mb-3">Raised: Standard Card (elevation-md)</h4>
          <p className="text-body-sm-regular text-gray-600 mb-4">
            Most cards and containers use this elevation.
          </p>

          <div className="relative elevation-lg p-4 bg-white rounded-lg">
            <p className="text-body-xs-medium mb-2">Floating: Dropdown (elevation-lg)</p>
            <p className="text-body-xs-regular text-gray-600 mb-3">
              Menus and tooltips that float above cards.
            </p>

            <div className="elevation-2xl p-3 bg-white rounded-lg">
              <p className="text-body-xs-medium mb-1">Overlay: Modal (elevation-2xl)</p>
              <p className="text-body-2xs-regular text-gray-600">
                Dialogs at the highest depth.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Stacking Guidelines</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• <strong>Flat</strong> (none): Page background, borders, dividers</li>
          <li>• <strong>Resting</strong> (xs/sm): Subtle cards, minimal lift</li>
          <li>• <strong>Raised</strong> (md): Standard cards and containers ✓</li>
          <li>• <strong>Floating</strong> (lg): Dropdowns, sticky headers, tooltips</li>
          <li>• <strong>Hovering</strong> (xl): Popovers, floating menus</li>
          <li>• <strong>Overlay</strong> (2xl): Modals, dialogs, notifications</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Visual demonstration of elevation and stacking context in layered interfaces.',
      },
    },
  },
};

export const ClaudeCodeExamples: Story = {
  render: () => (
    <div className="p-8 max-w-4xl bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Working with Claude Code (AI Assistant)</h2>
      <p className="text-gray-600 mb-8">
        Use these natural language prompts to work with Claude Code when managing the elevation system.
      </p>

      <div className="space-y-8">
        {/* Add New Elevation Level */}
        <div className="border rounded-lg p-6 bg-white">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-blue-600">➕</span>
            Add New Elevation Level
          </h3>
          <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Can you add a new elevation level 'elevation-3xl' with 3 shadow layers for maximum depth? Use 48px Y offset and 60px blur."
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will edit <code className="bg-gray-100 px-1 rounded">semantic-elevation.json</code>, rebuild tokens, and regenerate utilities.
          </p>
        </div>

        {/* Adjust Existing Elevation */}
        <div className="border rounded-lg p-6 bg-white">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-green-600">🔧</span>
            Adjust Existing Elevation
          </h3>
          <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "The elevation-lg shadow feels too strong. Can you reduce the opacity from 24% to 18% and regenerate?"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will update color tokens in <code className="bg-gray-100 px-1 rounded">primitives-elevation.json</code> and rebuild.
          </p>
        </div>

        {/* Regenerate After Token Changes */}
        <div className="border rounded-lg p-6 bg-white">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-purple-600">🔄</span>
            Regenerate After Token Changes
          </h3>
          <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "I updated semantic-elevation.json to add a new layer to elevation-xl. Can you regenerate the utility classes?"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will run <code className="bg-gray-100 px-1 rounded">npm run tokens:build && npm run elevation:generate</code>.
          </p>
        </div>

        {/* Find the Right Elevation */}
        <div className="border rounded-lg p-6 bg-white">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-orange-600">🔍</span>
            Find the Right Elevation
          </h3>
          <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "I need a shadow for a floating notification toast that appears above modals. What elevation level should I use?"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will suggest a custom level higher than 2xl or recommend using 2xl with higher z-index.
          </p>
        </div>

        {/* Verify Token Chain */}
        <div className="border rounded-lg p-6 bg-white">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-indigo-600">🔗</span>
            Verify Token Chain
          </h3>
          <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Show me the full token resolution for elevation-md (from utility class → semantic tokens → primitive tokens → final values)"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will trace the complete chain and show how the multi-layer shadow is composed.
          </p>
        </div>

        {/* Migration from Tailwind */}
        <div className="border rounded-lg p-6 bg-white">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-red-600">🚀</span>
            Migration from Tailwind
          </h3>
          <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Can you migrate this component from Tailwind's shadow-lg to our elevation system? &lt;div className=&quot;shadow-lg rounded-lg p-4&quot;&gt;Card&lt;/div&gt;"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will replace with <code className="bg-gray-100 px-1 rounded">elevation-lg</code> or <code className="bg-gray-100 px-1 rounded">elevation-xl</code> depending on context.
          </p>
        </div>
      </div>

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">💡 Pro Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Use <code className="bg-white px-1 rounded">elevation-md</code> as the default for most cards</li>
          <li>• Increase by one step on hover for subtle lift effect</li>
          <li>• Pair elevation with z-index for proper layering</li>
          <li>• Use <code className="bg-white px-1 rounded">elevation-inner</code> for pressed/active button states</li>
        </ul>
      </div>

      <div className="mt-6 p-6 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Full Documentation:</strong> See the Docs page above for complete token architecture and usage guidelines
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example prompts for working with Claude Code AI assistant when managing the elevation system.',
      },
    },
  },
};
