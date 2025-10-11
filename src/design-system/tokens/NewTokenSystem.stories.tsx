import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Design System/Foundations/Token System',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Design Token System

A production-ready design token system with **834 tokens** organized in a three-layer hierarchy, built with Style Dictionary v4 and exported across 11 CSS files + 2 JS/TS exports.

## Three-Layer Architecture

\`\`\`
Components
    ↓
Semantic Tokens (--color-bg-*, --color-fg-*)
    ↓
Decorative Tokens (--green-low, --gray-highest)
    ↓
Primitive Tokens (--color-green-200, #a8e3b3)
\`\`\`

### Why Three Layers?

1. **Primitives** - Raw color values from design (110 color tokens)
2. **Decoratives** - Named aliases that invert between light/dark themes
3. **Semantics** - Context-based tokens for UI components (always use these!)

## Token Categories

### Colors (228 semantic tokens)
- **Backgrounds**: \`--color-bg-neutral-*\`, \`--color-bg-positive-*\`, \`--color-bg-alert-*\`, etc.
- **Foregrounds**: \`--color-fg-neutral-*\`, \`--color-fg-positive-*\`, \`--color-fg-alert-*\`, etc.
- **Themes**: Automatic light/dark theme support via \`[data-theme="dark"]\` selector

### Typography (262 tokens)
- **Standard** (131 tokens): Consistent across viewports
- **Expressive** (131 tokens): Scales automatically between mobile (≤768px) and desktop (>768px)
- **Font families**: \`--font-global-sans\` (Inter), \`--font-global-mono\` (monospace)

### Dimensions (40 tokens)
- **Spacing**: \`--dimension-space-*\` (4px to 96px scale)
- **Border Radius**: \`--dimension-radius-*\` (0px to 32px scale)
- **Elevation**: \`--dimension-elevation-*\` (box-shadow presets)

## Generated Files

### Primitives (3 files, 180 tokens)
- \`primitives-color.css\` - 110 base color values
- \`primitives-typography.css\` - 46 font tokens
- \`primitives-dimensions.css\` - 24 spacing/radius values

### Decoratives (2 files, 148 tokens)
- \`decorative-light.css\` - 74 light theme aliases
- \`decorative-dark.css\` - 74 dark theme aliases (inverted)

### Semantics (5 files, 506 tokens)
- \`semantic-color-light.css\` - 114 light theme colors
- \`semantic-color-dark.css\` - 114 dark theme colors
- \`semantic-dimensions.css\` - 16 spacing/radius tokens
- \`semantic-typography-small.css\` - 131 tokens (default + mobile)
- \`semantic-typography-large.css\` - 131 tokens (desktop)

### Exports
- \`index.css\` - Imports all token files
- \`tokens.js\` - React Native exports
- \`tokens.d.ts\` - TypeScript definitions

## Build Pipeline

The token system is generated in 6 steps:

1. **Parse Figma Export** → Convert Figma Variables JSON to Style Dictionary format
2. **Generate Base** → Build primitives + semantic dimensions + typography (small) + JS/TS
3. **Generate Light Theme** → Build light mode decorative + semantic colors
4. **Generate Dark Theme** → Build dark mode decorative + semantic colors (inverted)
5. **Generate Large Typography** → Build expressive typography for desktop
6. **Wrap Media Queries** → Post-process to add \`@media (min-width: 768px)\` wrappers

**Command**: \`npm run tokens:build\` (runs all steps)

## Usage Guidelines

### ✅ DO: Use Semantic Tokens

\`\`\`tsx
// Tailwind classes with semantic tokens
<div className="bg-[var(--color-bg-neutral-subtle)]">
  <p className="text-[var(--color-fg-neutral-primary)]">
    Content
  </p>
</div>

// Inline styles with semantic tokens
<div style={{
  backgroundColor: 'var(--color-bg-positive-subtle)',
  color: 'var(--color-fg-positive-primary)'
}}>
  Success!
</div>

// Responsive typography (auto-scales on desktop)
<h1 className="text-[var(--text-font-size-display-expressive-xl)]">
  Hero Heading
</h1>
\`\`\`

### ❌ DON'T: Use Primitives or Decoratives

\`\`\`tsx
// ❌ Bad - bypasses semantic layer, breaks theming
<div className="bg-[var(--color-gray-50)]">
  <p className="text-[var(--color-gray-900)]">...</p>
</div>

// ❌ Bad - decorative tokens can change meaning between themes
<div className="bg-[var(--gray-lowest)]">
  <p className="text-[var(--gray-highest)]">...</p>
</div>
\`\`\`

## Theme Switching

Set \`data-theme\` attribute on the root element:

\`\`\`tsx
// Light theme (default)
document.documentElement.setAttribute('data-theme', 'light');

// Dark theme
document.documentElement.setAttribute('data-theme', 'dark');
\`\`\`

All semantic color tokens automatically adapt. No component changes needed!

## Semantic Color States

Each semantic color has 6 background variants and 4 foreground variants:

### Backgrounds
- \`*-base\` - Base canvas color
- \`*-subtle\` - Very subtle background (low contrast)
- \`*-low-accented\` - Light accent background
- \`*-medium\` - Medium accent background
- \`*-high\` - Strong accent background (use inverse foreground)
- \`*-high-accented\` - Strongest accent background (use inverse foreground)

### Foregrounds
- \`*-primary\` - Primary text color (highest contrast)
- \`*-secondary\` - Secondary text color (medium contrast)
- \`*-disabled\` - Disabled text color (low contrast)
- \`*-inverse-primary\` - Text on high/high-accented backgrounds

## Commands

\`\`\`bash
# Build all tokens from Figma export
npm run tokens:build

# Clean all generated files
npm run tokens:clean

# Generate TypeScript types from primitives
npm run tokens:generate
\`\`\`

## File Structure

\`\`\`
src/design-system/tokens/
├── source/              # Figma exports (JSON)
├── build/               # Generated CSS/JS/TS files
├── scripts/             # Build pipeline scripts
└── *.config.js          # Style Dictionary configs
\`\`\`

## Interactive Examples

See the **Canvas** tab for interactive demonstrations:
- **Documentation** - Overview with quick links
- **Theme Comparison** - Toggle between light/dark themes
        `.trim(),
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Documentation: Story = {
  parameters: {
    docs: {
      disable: true, // Don't show this story in docs
    },
  },
  render: () => (
    <div className="p-8 bg-[var(--color-bg-neutral-base)] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[var(--color-bg-information-subtle)] border-l-4 border-[var(--color-bg-information-high)] p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-[var(--color-fg-information-primary)]">
            📚 Complete Documentation
          </h2>
          <p className="text-sm text-[var(--color-fg-information-secondary)]">
            All token system documentation is available in the <strong>Docs</strong> tab above.
            Click "Docs" to read the full guide on architecture, usage guidelines, and build pipeline.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-bold text-[var(--color-fg-neutral-primary)]">
            Quick Links
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--color-bg-neutral-subtle)] p-4 rounded-lg border border-[var(--color-bg-neutral-low-accented)]">
              <h3 className="font-semibold text-[var(--color-fg-neutral-primary)] mb-2">
                🎨 Semantic Tokens
              </h3>
              <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-3">
                Browse all available color, typography, and dimension tokens organized by category.
              </p>
              <p className="text-xs text-[var(--color-fg-neutral-disabled)]">
                See: Colors, Text Styles, Border Radius, Spacing, Elevation
              </p>
            </div>

            <div className="bg-[var(--color-bg-neutral-subtle)] p-4 rounded-lg border border-[var(--color-bg-neutral-low-accented)]">
              <h3 className="font-semibold text-[var(--color-fg-neutral-primary)] mb-2">
                🌗 Theme Comparison
              </h3>
              <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-3">
                Interactive demo showing how semantic tokens adapt between light and dark themes.
              </p>
              <p className="text-xs text-[var(--color-fg-neutral-disabled)]">
                See: Theme Comparison story
              </p>
            </div>
          </div>

          <div className="bg-[var(--color-bg-positive-subtle)] p-4 rounded-lg mt-6">
            <h3 className="font-semibold text-[var(--color-fg-positive-primary)] mb-2">
              ✅ Usage Pattern
            </h3>
            <pre className="text-xs bg-[var(--color-bg-neutral-base)] p-3 rounded overflow-x-auto border border-[var(--color-bg-neutral-low-accented)]">
              <code className="text-[var(--color-fg-neutral-primary)]">{`// Always use semantic tokens in components
<div className="bg-[var(--color-bg-neutral-subtle)]">
  <p className="text-[var(--color-fg-neutral-primary)]">
    Content
  </p>
</div>`}</code>
            </pre>
          </div>

          <div className="bg-[var(--color-bg-alert-subtle)] p-4 rounded-lg border-l-4 border-[var(--color-bg-alert-high)]">
            <h3 className="font-semibold text-[var(--color-fg-alert-primary)] mb-2">
              ❌ Anti-Pattern
            </h3>
            <pre className="text-xs bg-[var(--color-bg-neutral-base)] p-3 rounded overflow-x-auto border border-[var(--color-bg-neutral-low-accented)]">
              <code className="text-[var(--color-fg-neutral-primary)]">{`// Never use primitives or decoratives directly
<div className="bg-[var(--color-gray-50)]">
  <p className="text-[var(--gray-highest)]">...</p>
</div>`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const ThemeComparison: Story = {
  parameters: {
    docs: {
      disable: true, // Don't show this story in docs
    },
  },
  render: () => {
    const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

    React.useEffect(() => {
      document.documentElement.setAttribute('data-theme', theme);

      // Debug: Check computed values
      const styles = getComputedStyle(document.documentElement);
      console.log('=== Theme Debug ===');
      console.log('Theme:', theme);
      console.log('data-theme attribute:', document.documentElement.getAttribute('data-theme'));
      console.log('--color-bg-neutral-base:', styles.getPropertyValue('--color-bg-neutral-base').trim());
      console.log('--color-bg-neutral-subtle:', styles.getPropertyValue('--color-bg-neutral-subtle').trim());
      console.log('--gray-lowest:', styles.getPropertyValue('--gray-lowest').trim());
      console.log('--gray-highest:', styles.getPropertyValue('--gray-highest').trim());
      console.log('--white-solid:', styles.getPropertyValue('--white-solid').trim());
      console.log('--black-solid:', styles.getPropertyValue('--black-solid').trim());

      // Cleanup: reset to light theme when component unmounts
      return () => {
        document.documentElement.setAttribute('data-theme', 'light');
      };
    }, [theme]);

    return (
      <div className="p-8 bg-[var(--color-bg-neutral-base)] min-h-screen">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-fg-neutral-primary)]">
                Light vs Dark Theme
              </h1>
              <p className="text-[var(--color-fg-neutral-secondary)] mt-2">
                Toggle between themes to see automatic color adaptation
              </p>
            </div>
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="px-6 py-3 bg-[var(--color-bg-positive-high)] text-[var(--color-fg-neutral-inverse-primary)] rounded-lg hover:bg-[var(--color-bg-positive-medium)] transition-colors font-semibold"
            >
              {theme === 'light' ? '🌙 Switch to Dark' : '☀️ Switch to Light'}
            </button>
          </div>

          <div key={theme} className="grid grid-cols-2 gap-6">
            {/* Neutral */}
            <div className="p-6 rounded-lg bg-[var(--color-bg-neutral-subtle)] border border-[var(--color-bg-neutral-low-accented)]">
              <h2 className="text-xl font-semibold mb-3 text-[var(--color-fg-neutral-primary)]">
                Neutral
              </h2>
              <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-4">
                Background and foreground colors for general content
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2 rounded bg-[var(--color-bg-neutral-base)] border border-[var(--color-bg-neutral-low-accented)]">
                  <span className="text-[var(--color-fg-neutral-primary)]">--color-bg-neutral-base</span>
                </div>
                <div className="p-2 rounded bg-[var(--color-bg-neutral-subtle)]">
                  <span className="text-[var(--color-fg-neutral-primary)]">--color-bg-neutral-subtle</span>
                </div>
                <div className="p-2 rounded bg-[var(--color-bg-neutral-low-accented)]">
                  <span className="text-[var(--color-fg-neutral-primary)]">--color-bg-neutral-low-accented</span>
                </div>
              </div>
            </div>

            {/* Positive */}
            <div className="p-6 rounded-lg bg-[var(--color-bg-positive-subtle)] border border-[var(--color-bg-positive-medium)]">
              <h2 className="text-xl font-semibold mb-3 text-[var(--color-fg-positive-primary)]">
                Positive / Success
              </h2>
              <p className="text-sm text-[var(--color-fg-positive-secondary)] mb-4">
                For success states, confirmations, and positive feedback
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2 rounded bg-[var(--color-bg-positive-subtle)]">
                  <span className="text-[var(--color-fg-positive-primary)]">--color-bg-positive-subtle</span>
                </div>
                <div className="p-2 rounded bg-[var(--color-bg-positive-low-accented)]">
                  <span className="text-[var(--color-fg-positive-primary)]">--color-bg-positive-low-accented</span>
                </div>
                <div className="p-2 rounded bg-[var(--color-bg-positive-high-accented)]">
                  <span className="text-[var(--color-fg-positive-inverse-primary)]">--color-bg-positive-high-accented</span>
                </div>
              </div>
            </div>

            {/* Alert */}
            <div className="p-6 rounded-lg bg-[var(--color-bg-alert-subtle)] border border-[var(--color-bg-alert-medium)]">
              <h2 className="text-xl font-semibold mb-3 text-[var(--color-fg-alert-primary)]">
                Alert / Error
              </h2>
              <p className="text-sm text-[var(--color-fg-alert-secondary)] mb-4">
                For error states, warnings, and critical information
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2 rounded bg-[var(--color-bg-alert-subtle)]">
                  <span className="text-[var(--color-fg-alert-primary)]">--color-bg-alert-subtle</span>
                </div>
                <div className="p-2 rounded bg-[var(--color-bg-alert-low-accented)]">
                  <span className="text-[var(--color-fg-alert-primary)]">--color-bg-alert-low-accented</span>
                </div>
                <div className="p-2 rounded bg-[var(--color-bg-alert-high-accented)]">
                  <span className="text-[var(--color-fg-alert-inverse-primary)]">--color-bg-alert-high-accented</span>
                </div>
              </div>
            </div>

            {/* Information */}
            <div className="p-6 rounded-lg bg-[var(--color-bg-information-subtle)] border border-[var(--color-bg-information-medium)]">
              <h2 className="text-xl font-semibold mb-3 text-[var(--color-fg-information-primary)]">
                Information
              </h2>
              <p className="text-sm text-[var(--color-fg-information-secondary)] mb-4">
                For informational messages and helpful content
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2 rounded bg-[var(--color-bg-information-subtle)]">
                  <span className="text-[var(--color-fg-information-primary)]">--color-bg-information-subtle</span>
                </div>
                <div className="p-2 rounded bg-[var(--color-bg-information-low-accented)]">
                  <span className="text-[var(--color-fg-information-primary)]">--color-bg-information-low-accented</span>
                </div>
                <div className="p-2 rounded bg-[var(--color-bg-information-high-accented)]">
                  <span className="text-[var(--color-fg-information-inverse-primary)]">--color-bg-information-high-accented</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--color-bg-attention-subtle)] p-6 rounded-lg border-l-4 border-[var(--color-bg-attention-high)]">
            <h3 className="text-lg font-semibold mb-2 text-[var(--color-fg-attention-primary)]">
              How Theme Switching Works
            </h3>
            <p className="text-sm text-[var(--color-fg-attention-secondary)]">
              Setting <code className="bg-[var(--color-bg-neutral-base)] px-2 py-1 rounded font-mono">data-theme="{theme}"</code> on
              the root element triggers CSS to load the corresponding theme tokens. Light theme uses
              <code className="bg-[var(--color-bg-neutral-base)] px-2 py-1 rounded font-mono ml-1">:root</code> selector,
              while dark theme uses <code className="bg-[var(--color-bg-neutral-base)] px-2 py-1 rounded font-mono">[data-theme="dark"]</code> selector
              with higher specificity to override.
            </p>
          </div>
        </div>
      </div>
    );
  },
};
