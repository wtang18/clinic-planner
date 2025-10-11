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
# Token System Overview

A production-ready design token system with **834 tokens** organized in a three-layer hierarchy.

## Quick Reference

**Architecture**: Components → Semantic Tokens → Decorative Tokens → Primitive Tokens

**Usage**: Always use semantic tokens (\`--color-bg-*\`, \`--color-fg-*\`) instead of primitives in your components.

**Build**: \`npm run tokens:build\` to regenerate tokens from Figma export.

## Stories

- **Architecture**: Build pipeline, generated files, and responsive typography details
- **Theme Comparison**: Interactive light/dark theme demonstration

See individual stories below for detailed documentation.
        `.trim(),
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Architecture: Story = {
  parameters: {
    docs: {
      story: {
        inline: false,
      },
    },
  },
  render: () => (
    <div className="p-8 space-y-12 bg-[var(--color-bg-neutral-base)]">
      <div>
        <h1 className="text-3xl font-bold mb-4 text-[var(--color-fg-neutral-primary)]">
          Style Dictionary Token System
        </h1>
        <p className="text-lg text-[var(--color-fg-neutral-secondary)] max-w-3xl">
          A production-ready token system built with Style Dictionary v4, featuring 834 tokens across 11 CSS files.
        </p>
      </div>

      {/* Build Pipeline */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-[var(--color-fg-neutral-primary)]">
          Build Pipeline
        </h2>
        <div className="bg-[var(--color-bg-information-subtle)] border-l-4 border-[var(--color-bg-information-high)] p-6 rounded">
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-[var(--color-bg-information-high)] rounded-full flex items-center justify-center text-[var(--color-fg-neutral-inverse-primary)] font-bold flex-shrink-0">1</div>
              <div>
                <h3 className="font-semibold text-[var(--color-fg-neutral-primary)] mb-1">Parse Figma JSON</h3>
                <p className="text-[var(--color-fg-neutral-secondary)]">
                  Convert Figma Variables export into Style Dictionary format
                </p>
                <code className="text-xs bg-[var(--color-bg-neutral-base)] px-2 py-1 rounded mt-1 inline-block">
                  node scripts/parse-figma-tokens.js
                </code>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-[var(--color-bg-information-high)] rounded-full flex items-center justify-center text-[var(--color-fg-neutral-inverse-primary)] font-bold flex-shrink-0">2</div>
              <div>
                <h3 className="font-semibold text-[var(--color-fg-neutral-primary)] mb-1">Generate Base Tokens</h3>
                <p className="text-[var(--color-fg-neutral-secondary)]">
                  Primitives, semantic dimensions, typography (small viewport), JS/TS exports
                </p>
                <code className="text-xs bg-[var(--color-bg-neutral-base)] px-2 py-1 rounded mt-1 inline-block">
                  style-dictionary build --config sd.config.js
                </code>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-[var(--color-bg-information-high)] rounded-full flex items-center justify-center text-[var(--color-fg-neutral-inverse-primary)] font-bold flex-shrink-0">3</div>
              <div>
                <h3 className="font-semibold text-[var(--color-fg-neutral-primary)] mb-1">Generate Light Theme</h3>
                <p className="text-[var(--color-fg-neutral-secondary)]">
                  Decorative + semantic colors for light mode
                </p>
                <code className="text-xs bg-[var(--color-bg-neutral-base)] px-2 py-1 rounded mt-1 inline-block">
                  style-dictionary build --config sd.config.light.js
                </code>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-[var(--color-bg-information-high)] rounded-full flex items-center justify-center text-[var(--color-fg-neutral-inverse-primary)] font-bold flex-shrink-0">4</div>
              <div>
                <h3 className="font-semibold text-[var(--color-fg-neutral-primary)] mb-1">Generate Dark Theme</h3>
                <p className="text-[var(--color-fg-neutral-secondary)]">
                  Decorative + semantic colors for dark mode (inverted values)
                </p>
                <code className="text-xs bg-[var(--color-bg-neutral-base)] px-2 py-1 rounded mt-1 inline-block">
                  style-dictionary build --config sd.config.dark.js
                </code>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-[var(--color-bg-information-high)] rounded-full flex items-center justify-center text-[var(--color-fg-neutral-inverse-primary)] font-bold flex-shrink-0">5</div>
              <div>
                <h3 className="font-semibold text-[var(--color-fg-neutral-primary)] mb-1">Generate Large Viewport Typography</h3>
                <p className="text-[var(--color-fg-neutral-secondary)]">
                  Expressive typography tokens for desktop screens
                </p>
                <code className="text-xs bg-[var(--color-bg-neutral-base)] px-2 py-1 rounded mt-1 inline-block">
                  style-dictionary build --config sd.config.typography-large.js
                </code>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-[var(--color-bg-positive-high)] rounded-full flex items-center justify-center text-[var(--color-fg-neutral-inverse-primary)] font-bold flex-shrink-0">✓</div>
              <div>
                <h3 className="font-semibold text-[var(--color-fg-neutral-primary)] mb-1">Wrap in Media Queries</h3>
                <p className="text-[var(--color-fg-neutral-secondary)]">
                  Post-process to add @media wrappers for responsive typography
                </p>
                <code className="text-xs bg-[var(--color-bg-neutral-base)] px-2 py-1 rounded mt-1 inline-block">
                  node scripts/wrap-typography-media-queries.js
                </code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Generated Files */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-[var(--color-fg-neutral-primary)]">
          Generated Files (11 CSS + 2 JS/TS)
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[var(--color-bg-neutral-subtle)] p-4 rounded">
            <h3 className="text-sm font-semibold mb-3 text-[var(--color-fg-neutral-primary)]">Primitives (3)</h3>
            <div className="space-y-1 text-xs font-mono text-[var(--color-fg-neutral-secondary)]">
              <div>primitives-color.css <span className="text-[var(--color-fg-neutral-disabled)]">(110 tokens)</span></div>
              <div>primitives-typography.css <span className="text-[var(--color-fg-neutral-disabled)]">(46)</span></div>
              <div>primitives-dimensions.css <span className="text-[var(--color-fg-neutral-disabled)]">(24)</span></div>
            </div>
          </div>
          <div className="bg-[var(--color-bg-neutral-subtle)] p-4 rounded">
            <h3 className="text-sm font-semibold mb-3 text-[var(--color-fg-neutral-primary)]">Decorative (2)</h3>
            <div className="space-y-1 text-xs font-mono text-[var(--color-fg-neutral-secondary)]">
              <div>decorative-light.css <span className="text-[var(--color-fg-neutral-disabled)]">(74)</span></div>
              <div>decorative-dark.css <span className="text-[var(--color-fg-neutral-disabled)]">(74)</span></div>
            </div>
          </div>
          <div className="bg-[var(--color-bg-neutral-subtle)] p-4 rounded">
            <h3 className="text-sm font-semibold mb-3 text-[var(--color-fg-neutral-primary)]">Semantic (5)</h3>
            <div className="space-y-1 text-xs font-mono text-[var(--color-fg-neutral-secondary)]">
              <div>semantic-color-light.css <span className="text-[var(--color-fg-neutral-disabled)]">(114)</span></div>
              <div>semantic-color-dark.css <span className="text-[var(--color-fg-neutral-disabled)]">(114)</span></div>
              <div>semantic-dimensions.css <span className="text-[var(--color-fg-neutral-disabled)]">(16)</span></div>
              <div>semantic-typography-small.css <span className="text-[var(--color-fg-neutral-disabled)]">(131)</span></div>
              <div>semantic-typography-large.css <span className="text-[var(--color-fg-neutral-disabled)]">(131)</span></div>
            </div>
          </div>
        </div>
        <div className="mt-4 bg-[var(--color-bg-accent-subtle)] p-4 rounded">
          <h3 className="text-sm font-semibold mb-2 text-[var(--color-fg-neutral-primary)]">Entry Point + Exports</h3>
          <div className="space-y-1 text-xs font-mono text-[var(--color-fg-neutral-secondary)]">
            <div>index.css <span className="text-[var(--color-fg-neutral-disabled)]">(imports all token files)</span></div>
            <div>tokens.js <span className="text-[var(--color-fg-neutral-disabled)]">(React Native exports)</span></div>
            <div>tokens.d.ts <span className="text-[var(--color-fg-neutral-disabled)]">(TypeScript definitions)</span></div>
          </div>
        </div>
      </section>

      {/* Responsive Typography */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-[var(--color-fg-neutral-primary)]">
          Responsive Typography
        </h2>
        <div className="bg-[var(--color-bg-positive-subtle)] border-l-4 border-[var(--color-bg-positive-high)] p-6 rounded">
          <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-4">
            Expressive typography automatically scales between mobile and desktop viewports using CSS media queries.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold mb-3 text-[var(--color-fg-neutral-primary)]">
                Small Viewport (≤768px)
              </h3>
              <div className="space-y-2">
                <div className="bg-[var(--color-bg-neutral-base)] p-3 rounded">
                  <div className="text-xs font-mono text-[var(--color-fg-neutral-secondary)] mb-1">
                    --text-font-size-display-expressive-sm
                  </div>
                  <div className="text-lg font-bold text-[var(--color-fg-neutral-primary)]" style={{ fontSize: '24px' }}>
                    24px
                  </div>
                </div>
                <div className="bg-[var(--color-bg-neutral-base)] p-3 rounded">
                  <div className="text-xs font-mono text-[var(--color-fg-neutral-secondary)] mb-1">
                    --text-font-size-display-expressive-xl
                  </div>
                  <div className="text-lg font-bold text-[var(--color-fg-neutral-primary)]" style={{ fontSize: '40px' }}>
                    40px
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3 text-[var(--color-fg-neutral-primary)]">
                Large Viewport (&gt;768px)
              </h3>
              <div className="space-y-2">
                <div className="bg-[var(--color-bg-neutral-base)] p-3 rounded">
                  <div className="text-xs font-mono text-[var(--color-fg-neutral-secondary)] mb-1">
                    --text-font-size-display-expressive-sm
                  </div>
                  <div className="text-lg font-bold text-[var(--color-fg-neutral-primary)]" style={{ fontSize: '40px' }}>
                    40px <span className="text-xs text-[var(--color-fg-positive-primary)]">(+67%)</span>
                  </div>
                </div>
                <div className="bg-[var(--color-bg-neutral-base)] p-3 rounded">
                  <div className="text-xs font-mono text-[var(--color-fg-neutral-secondary)] mb-1">
                    --text-font-size-display-expressive-xl
                  </div>
                  <div className="text-lg font-bold text-[var(--color-fg-neutral-primary)]" style={{ fontSize: '80px', lineHeight: '1' }}>
                    80px <span className="text-xs text-[var(--color-fg-positive-primary)]">(+100%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 text-xs text-[var(--color-fg-neutral-secondary)] italic">
            💡 Only expressive typography scales. Standard typography remains consistent across viewports.
          </div>
        </div>
      </section>

      {/* Usage */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-[var(--color-fg-neutral-primary)]">
          How to Use
        </h2>
        <div className="space-y-4">
          <div className="bg-[var(--color-bg-positive-subtle)] p-4 rounded">
            <h3 className="text-sm font-semibold mb-2 text-[var(--color-fg-positive-primary)]">✅ Import in CSS</h3>
            <pre className="text-xs bg-[var(--color-bg-neutral-base)] p-3 rounded overflow-x-auto">
              <code className="text-[var(--color-fg-neutral-primary)]">{`/* Already imported in globals.css */
@import '../design-system/tokens/build/index.css';`}</code>
            </pre>
          </div>
          <div className="bg-[var(--color-bg-positive-subtle)] p-4 rounded">
            <h3 className="text-sm font-semibold mb-2 text-[var(--color-fg-positive-primary)]">✅ Use Semantic Tokens</h3>
            <pre className="text-xs bg-[var(--color-bg-neutral-base)] p-3 rounded overflow-x-auto">
              <code className="text-[var(--color-fg-neutral-primary)]">{`// In Tailwind classes
<div className="bg-[var(--color-bg-neutral-subtle)]">
  <p className="text-[var(--color-fg-neutral-primary)]">
    Hello World
  </p>
</div>

// In inline styles
<div style={{
  backgroundColor: 'var(--color-bg-positive-subtle)',
  color: 'var(--color-fg-positive-primary)'
}}>
  Success!
</div>

// Responsive typography
<h1 className="text-[var(--text-font-size-display-expressive-xl)]">
  Scales automatically
</h1>`}</code>
            </pre>
          </div>
          <div className="bg-[var(--color-bg-alert-subtle)] p-4 rounded border-l-4 border-[var(--color-bg-alert-high)]">
            <h3 className="text-sm font-semibold mb-2 text-[var(--color-fg-alert-primary)]">❌ Don't Use Primitives</h3>
            <pre className="text-xs bg-[var(--color-bg-neutral-base)] p-3 rounded overflow-x-auto">
              <code className="text-[var(--color-fg-neutral-primary)]">{`// Bad - bypasses semantic layer, won't theme properly
<div className="bg-[var(--color-gray-50)]">
  <p className="text-[var(--color-gray-900)]">...</p>
</div>`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Commands */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-[var(--color-fg-neutral-primary)]">
          Commands
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[var(--color-bg-neutral-subtle)] p-4 rounded">
            <h3 className="text-sm font-semibold mb-3 text-[var(--color-fg-neutral-primary)]">Build Tokens</h3>
            <code className="text-xs bg-[var(--color-bg-neutral-base)] px-2 py-1 rounded block">
              npm run tokens:build
            </code>
            <p className="text-xs text-[var(--color-fg-neutral-secondary)] mt-2">
              Parses Figma JSON and generates all CSS/JS/TS files
            </p>
          </div>
          <div className="bg-[var(--color-bg-neutral-subtle)] p-4 rounded">
            <h3 className="text-sm font-semibold mb-3 text-[var(--color-fg-neutral-primary)]">Clean Build</h3>
            <code className="text-xs bg-[var(--color-bg-neutral-base)] px-2 py-1 rounded block">
              npm run tokens:clean
            </code>
            <p className="text-xs text-[var(--color-fg-neutral-secondary)] mt-2">
              Removes all generated files for a fresh build
            </p>
          </div>
        </div>
      </section>
    </div>
  ),
};

export const ThemeComparison: Story = {
  parameters: {
    docs: {
      story: {
        inline: false,
      },
    },
  },
  render: () => {
    const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

    React.useEffect(() => {
      document.documentElement.setAttribute('data-theme', theme);

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

          <div className="grid grid-cols-2 gap-6">
            {/* Neutral */}
            <div
              className="p-6 rounded-lg"
              style={{
                backgroundColor: 'var(--color-bg-neutral-subtle)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--color-bg-neutral-low-accented)'
              }}
            >
              <h2 className="text-xl font-semibold mb-3 text-[var(--color-fg-neutral-primary)]">
                Neutral
              </h2>
              <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-4">
                Background and foreground colors for general content
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div
                  className="p-2 rounded"
                  style={{
                    backgroundColor: 'var(--color-bg-neutral-base)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--color-bg-neutral-low-accented)'
                  }}
                >
                  <span className="text-[var(--color-fg-neutral-primary)]">--color-bg-neutral-base</span>
                </div>
                <div className="p-2 rounded" style={{ backgroundColor: 'var(--color-bg-neutral-subtle)' }}>
                  <span className="text-[var(--color-fg-neutral-primary)]">--color-bg-neutral-subtle</span>
                </div>
                <div className="p-2 rounded" style={{ backgroundColor: 'var(--color-bg-neutral-low-accented)' }}>
                  <span className="text-[var(--color-fg-neutral-primary)]">--color-bg-neutral-low-accented</span>
                </div>
              </div>
            </div>

            {/* Positive */}
            <div
              className="p-6 rounded-lg"
              style={{
                backgroundColor: 'var(--color-bg-positive-subtle)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--color-bg-positive-medium)'
              }}
            >
              <h2 className="text-xl font-semibold mb-3 text-[var(--color-fg-positive-primary)]">
                Positive / Success
              </h2>
              <p className="text-sm text-[var(--color-fg-positive-secondary)] mb-4">
                For success states, confirmations, and positive feedback
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2 rounded" style={{ backgroundColor: 'var(--color-bg-positive-subtle)' }}>
                  <span className="text-[var(--color-fg-positive-primary)]">--color-bg-positive-subtle</span>
                </div>
                <div className="p-2 rounded" style={{ backgroundColor: 'var(--color-bg-positive-low-accented)' }}>
                  <span className="text-[var(--color-fg-positive-primary)]">--color-bg-positive-low-accented</span>
                </div>
                <div className="p-2 rounded" style={{ backgroundColor: 'var(--color-bg-positive-high-accented)' }}>
                  <span className="text-[var(--color-fg-neutral-inverse-primary)]">--color-bg-positive-high-accented</span>
                </div>
              </div>
            </div>

            {/* Alert */}
            <div
              className="p-6 rounded-lg"
              style={{
                backgroundColor: 'var(--color-bg-alert-subtle)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--color-bg-alert-medium)'
              }}
            >
              <h2 className="text-xl font-semibold mb-3 text-[var(--color-fg-alert-primary)]">
                Alert / Error
              </h2>
              <p className="text-sm text-[var(--color-fg-alert-secondary)] mb-4">
                For error states, warnings, and critical information
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2 rounded" style={{ backgroundColor: 'var(--color-bg-alert-subtle)' }}>
                  <span className="text-[var(--color-fg-alert-primary)]">--color-bg-alert-subtle</span>
                </div>
                <div className="p-2 rounded" style={{ backgroundColor: 'var(--color-bg-alert-low-accented)' }}>
                  <span className="text-[var(--color-fg-alert-primary)]">--color-bg-alert-low-accented</span>
                </div>
                <div className="p-2 rounded" style={{ backgroundColor: 'var(--color-bg-alert-high-accented)' }}>
                  <span className="text-[var(--color-fg-neutral-inverse-primary)]">--color-bg-alert-high-accented</span>
                </div>
              </div>
            </div>

            {/* Information */}
            <div
              className="p-6 rounded-lg"
              style={{
                backgroundColor: 'var(--color-bg-information-subtle)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--color-bg-information-medium)'
              }}
            >
              <h2 className="text-xl font-semibold mb-3 text-[var(--color-fg-information-primary)]">
                Information
              </h2>
              <p className="text-sm text-[var(--color-fg-information-secondary)] mb-4">
                For informational messages and helpful content
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2 rounded" style={{ backgroundColor: 'var(--color-bg-information-subtle)' }}>
                  <span className="text-[var(--color-fg-information-primary)]">--color-bg-information-subtle</span>
                </div>
                <div className="p-2 rounded" style={{ backgroundColor: 'var(--color-bg-information-low-accented)' }}>
                  <span className="text-[var(--color-fg-information-primary)]">--color-bg-information-low-accented</span>
                </div>
                <div className="p-2 rounded" style={{ backgroundColor: 'var(--color-bg-information-high-accented)' }}>
                  <span className="text-[var(--color-fg-neutral-inverse-primary)]">--color-bg-information-high-accented</span>
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
