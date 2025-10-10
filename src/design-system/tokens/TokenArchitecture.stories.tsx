import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Design System/Token Architecture',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Token System Architecture

Our design tokens follow a **three-layer hierarchy** that enables theming, consistency, and maintainability.

## Quick Start

\`\`\`bash
# Update tokens from Figma export
npm run tokens:generate

# View in Storybook
npm run storybook
\`\`\`

## Architecture Overview

\`\`\`
Components (use semantic tokens)
    ↓
Semantic Tokens (contextual, mode-aware)
    ↓
Decorative Tokens (named abstractions)
    ↓
Primitive Tokens (raw values)
\`\`\`

## Key Features

- 🎨 **Automatic theming** via \`data-theme="light|dark"\`
- 📱 **Responsive typography** with viewport modes
- ♿ **Semantic naming** for better accessibility
- 🔄 **Easy updates** via \`npm run tokens:generate\`
- 📚 **Clear hierarchy** prevents token misuse

## Documentation

- **Token README**: \`src/design-system/tokens/README.md\`
- **Migration Guide**: \`docs/COMPONENT-MIGRATION-GUIDE.md\`
- **System Comparison**: \`docs/TOKEN-SYSTEM-COMPARISON.md\`
        `.trim(),
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Overview: Story = {
  render: () => (
    <div className="p-8 space-y-12 bg-[var(--color-bg-neutral-base)]">
      <div>
        <h1 className="text-3xl font-bold mb-4 text-[var(--color-fg-neutral-primary)]">
          Design Token Architecture
        </h1>
        <p className="text-lg text-[var(--color-fg-neutral-secondary)] max-w-3xl">
          A three-layer token system that enables automatic theming, consistent design, and easy maintenance.
        </p>
      </div>

      {/* Layer 1: Primitives */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-[var(--color-fg-neutral-primary)]">
          Layer 1: Primitive Tokens
        </h2>
        <div className="bg-[var(--color-bg-neutral-subtle)] border-l-4 border-[var(--color-bg-information-medium)] p-4 rounded">
          <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-4">
            <strong>Purpose:</strong> Raw design values. Not for direct use in components.
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-semibold mb-2 text-[var(--color-fg-neutral-primary)]">Color Ramp</h3>
              <div className="space-y-1 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded border" style={{ backgroundColor: 'var(--color-gray-500)' }} />
                  <span className="text-[var(--color-fg-neutral-secondary)]">--color-gray-500</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded border" style={{ backgroundColor: 'var(--color-blue-500)' }} />
                  <span className="text-[var(--color-fg-neutral-secondary)]">--color-blue-500</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded border" style={{ backgroundColor: 'var(--color-green-500)' }} />
                  <span className="text-[var(--color-fg-neutral-secondary)]">--color-green-500</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2 text-[var(--color-fg-neutral-primary)]">Dimensions</h3>
              <div className="space-y-1 text-xs font-mono text-[var(--color-fg-neutral-secondary)]">
                <div>--dimension-space-50: 8px</div>
                <div>--dimension-space-100: 16px</div>
                <div>--dimension-space-200: 32px</div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2 text-[var(--color-fg-neutral-primary)]">Typography</h3>
              <div className="space-y-1 text-xs font-mono text-[var(--color-fg-neutral-secondary)]">
                <div>--font-size-100: 14px</div>
                <div>--font-weight-regular: 400</div>
                <div>--line-height-default: 1.5</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Layer 2: Decorative */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-[var(--color-fg-neutral-primary)]">
          Layer 2: Decorative Tokens
        </h2>
        <div className="bg-[var(--color-bg-neutral-subtle)] border-l-4 border-[var(--color-bg-accent-medium)] p-4 rounded">
          <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-4">
            <strong>Purpose:</strong> Human-readable names. Intermediate layer between primitives and semantic.
          </p>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center gap-4">
              <div className="w-24 text-[var(--color-fg-neutral-secondary)]">--gray-lowest</div>
              <div className="text-[var(--color-fg-neutral-secondary)]">→</div>
              <div className="text-[var(--color-fg-neutral-secondary)]">var(--color-gray-50)</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 text-[var(--color-fg-neutral-secondary)]">--gray-mid</div>
              <div className="text-[var(--color-fg-neutral-secondary)]">→</div>
              <div className="text-[var(--color-fg-neutral-secondary)]">var(--color-gray-400)</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 text-[var(--color-fg-neutral-secondary)]">--blue-high</div>
              <div className="text-[var(--color-fg-neutral-secondary)]">→</div>
              <div className="text-[var(--color-fg-neutral-secondary)]">var(--color-blue-600)</div>
            </div>
          </div>
          <p className="text-xs text-[var(--color-fg-neutral-secondary)] mt-4 italic">
            Note: Supports on-light/on-dark modes for automatic theme switching
          </p>
        </div>
      </section>

      {/* Layer 3: Semantic */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-[var(--color-fg-neutral-primary)]">
          Layer 3: Semantic Tokens (Use These!)
        </h2>
        <div className="bg-[var(--color-bg-positive-subtle)] border-l-4 border-[var(--color-bg-positive-high)] p-4 rounded">
          <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-4">
            <strong>Purpose:</strong> Contextual tokens for components. These describe intent and automatically support theming.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold mb-2 text-[var(--color-fg-neutral-primary)]">Background Tokens</h3>
              <div className="space-y-2">
                <div
                  className="p-3 rounded text-xs font-mono"
                  style={{ backgroundColor: 'var(--color-bg-neutral-base)' }}
                >
                  <span className="text-[var(--color-fg-neutral-primary)]">--color-bg-neutral-base</span>
                  <div className="text-[var(--color-fg-neutral-secondary)] mt-1">Default backgrounds</div>
                </div>
                <div
                  className="p-3 rounded text-xs font-mono"
                  style={{ backgroundColor: 'var(--color-bg-neutral-subtle)' }}
                >
                  <span className="text-[var(--color-fg-neutral-primary)]">--color-bg-neutral-subtle</span>
                  <div className="text-[var(--color-fg-neutral-secondary)] mt-1">Subtle backgrounds</div>
                </div>
                <div
                  className="p-3 rounded text-xs font-mono"
                  style={{ backgroundColor: 'var(--color-bg-positive-subtle)' }}
                >
                  <span className="text-[var(--color-fg-positive-primary)]">--color-bg-positive-subtle</span>
                  <div className="text-[var(--color-fg-positive-secondary)] mt-1">Success backgrounds</div>
                </div>
                <div
                  className="p-3 rounded text-xs font-mono"
                  style={{ backgroundColor: 'var(--color-bg-alert-subtle)' }}
                >
                  <span className="text-[var(--color-fg-alert-primary)]">--color-bg-alert-subtle</span>
                  <div className="text-[var(--color-fg-alert-secondary)] mt-1">Error backgrounds</div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2 text-[var(--color-fg-neutral-primary)]">Foreground Tokens</h3>
              <div className="space-y-2">
                <div className="p-3 rounded text-xs font-mono bg-[var(--color-bg-neutral-base)]">
                  <span
                    className="font-semibold"
                    style={{ color: 'var(--color-fg-neutral-primary)' }}
                  >
                    --color-fg-neutral-primary
                  </span>
                  <div className="text-[var(--color-fg-neutral-secondary)] mt-1">Primary text</div>
                </div>
                <div className="p-3 rounded text-xs font-mono bg-[var(--color-bg-neutral-base)]">
                  <span
                    className="font-semibold"
                    style={{ color: 'var(--color-fg-neutral-secondary)' }}
                  >
                    --color-fg-neutral-secondary
                  </span>
                  <div className="text-[var(--color-fg-neutral-secondary)] mt-1">Secondary text</div>
                </div>
                <div className="p-3 rounded text-xs font-mono bg-[var(--color-bg-neutral-base)]">
                  <span
                    className="font-semibold"
                    style={{ color: 'var(--color-fg-positive-primary)' }}
                  >
                    --color-fg-positive-primary
                  </span>
                  <div className="text-[var(--color-fg-neutral-secondary)] mt-1">Success text</div>
                </div>
                <div className="p-3 rounded text-xs font-mono bg-[var(--color-bg-neutral-base)]">
                  <span
                    className="font-semibold"
                    style={{ color: 'var(--color-fg-alert-primary)' }}
                  >
                    --color-fg-alert-primary
                  </span>
                  <div className="text-[var(--color-fg-neutral-secondary)] mt-1">Error text</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Usage Example */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-[var(--color-fg-neutral-primary)]">
          Usage in Components
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[var(--color-bg-neutral-subtle)] p-4 rounded">
            <h3 className="text-sm font-semibold mb-2 text-[var(--color-fg-alert-primary)]">❌ Don't Use Primitives</h3>
            <pre className="text-xs bg-[var(--color-bg-neutral-base)] p-3 rounded overflow-x-auto">
              <code className="text-[var(--color-fg-neutral-primary)]">{`// Bad - bypasses semantic layer
<div className="bg-[var(--color-gray-50)]">
  <p className="text-[var(--color-gray-900)]">
    Text
  </p>
</div>`}</code>
            </pre>
          </div>
          <div className="bg-[var(--color-bg-positive-subtle)] p-4 rounded">
            <h3 className="text-sm font-semibold mb-2 text-[var(--color-fg-positive-primary)]">✅ Use Semantic Tokens</h3>
            <pre className="text-xs bg-[var(--color-bg-neutral-base)] p-3 rounded overflow-x-auto">
              <code className="text-[var(--color-fg-neutral-primary)]">{`// Good - uses semantic layer
<div className="bg-[var(--color-bg-neutral-subtle)]">
  <p className="text-[var(--color-fg-neutral-primary)]">
    Text
  </p>
</div>`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-[var(--color-fg-neutral-primary)]">
          Update Workflow
        </h2>
        <div className="bg-[var(--color-bg-information-subtle)] p-4 rounded">
          <ol className="space-y-3 text-sm text-[var(--color-fg-neutral-primary)]">
            <li className="flex gap-3">
              <span className="font-bold">1.</span>
              <div>
                <strong>Export from Figma</strong>
                <div className="text-[var(--color-fg-neutral-secondary)] text-xs mt-1">
                  Save as <code className="bg-[var(--color-bg-neutral-base)] px-1 py-0.5 rounded">design-tokens-variables-full.json</code>
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">2.</span>
              <div>
                <strong>Generate CSS</strong>
                <div className="text-[var(--color-fg-neutral-secondary)] text-xs mt-1">
                  Run <code className="bg-[var(--color-bg-neutral-base)] px-1 py-0.5 rounded">npm run tokens:generate</code>
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">3.</span>
              <div>
                <strong>Review Changes</strong>
                <div className="text-[var(--color-fg-neutral-secondary)] text-xs mt-1">
                  Check <code className="bg-[var(--color-bg-neutral-base)] px-1 py-0.5 rounded">git diff src/styles/tokens/</code>
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">4.</span>
              <div>
                <strong>Test in Storybook</strong>
                <div className="text-[var(--color-fg-neutral-secondary)] text-xs mt-1">
                  Verify tokens in light/dark themes
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">5.</span>
              <div>
                <strong>Commit</strong>
                <div className="text-[var(--color-fg-neutral-secondary)] text-xs mt-1">
                  Add JSON and generated CSS files
                </div>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* Resources */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-[var(--color-fg-neutral-primary)]">
          Resources
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[var(--color-bg-neutral-subtle)] p-4 rounded">
            <h3 className="text-sm font-semibold mb-2 text-[var(--color-fg-neutral-primary)]">📚 Documentation</h3>
            <ul className="text-xs space-y-1 text-[var(--color-fg-neutral-secondary)]">
              <li><code>src/design-system/tokens/README.md</code></li>
              <li><code>docs/COMPONENT-MIGRATION-GUIDE.md</code></li>
              <li><code>docs/TOKEN-SYSTEM-COMPARISON.md</code></li>
            </ul>
          </div>
          <div className="bg-[var(--color-bg-neutral-subtle)] p-4 rounded">
            <h3 className="text-sm font-semibold mb-2 text-[var(--color-fg-neutral-primary)]">🛠️ Generated Files</h3>
            <ul className="text-xs space-y-1 text-[var(--color-fg-neutral-secondary)]">
              <li><code>src/styles/tokens/*.css</code></li>
              <li><code>scripts/generate-tokens.js</code></li>
              <li><code>tailwind.config.js</code></li>
            </ul>
          </div>
          <div className="bg-[var(--color-bg-neutral-subtle)] p-4 rounded">
            <h3 className="text-sm font-semibold mb-2 text-[var(--color-fg-neutral-primary)]">⚙️ Commands</h3>
            <ul className="text-xs space-y-1 text-[var(--color-fg-neutral-secondary)]">
              <li><code>npm run tokens:generate</code></li>
              <li><code>npm run storybook</code></li>
              <li><code>npm run build</code></li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  ),
};

export const ThemeDemo: Story = {
  render: () => {
    const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

    React.useEffect(() => {
      document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return (
      <div className="p-8 bg-[var(--color-bg-neutral-base)] min-h-screen">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-[var(--color-fg-neutral-primary)]">
              Theme Switching Demo
            </h1>
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="px-4 py-2 bg-[var(--color-bg-positive-high)] text-[var(--color-fg-neutral-inverse-primary)] rounded-lg hover:bg-[var(--color-bg-positive-medium)] transition-colors"
            >
              {theme === 'light' ? '🌙 Switch to Dark' : '☀️ Switch to Light'}
            </button>
          </div>

          <p className="text-lg text-[var(--color-fg-neutral-secondary)]">
            All colors automatically adapt when you switch themes. This is because components use semantic tokens
            that reference different values for light and dark modes.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--color-bg-neutral-subtle)] p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-3 text-[var(--color-fg-neutral-primary)]">
                Neutral Colors
              </h2>
              <p className="text-sm text-[var(--color-fg-neutral-secondary)]">
                Background and foreground colors automatically switch based on theme.
              </p>
            </div>

            <div className="bg-[var(--color-bg-positive-subtle)] p-6 rounded-lg border border-[var(--color-bg-positive-medium)]">
              <h2 className="text-xl font-semibold mb-3 text-[var(--color-fg-positive-primary)]">
                Success Colors
              </h2>
              <p className="text-sm text-[var(--color-fg-positive-secondary)]">
                Semantic colors maintain proper contrast in both themes.
              </p>
            </div>

            <div className="bg-[var(--color-bg-alert-subtle)] p-6 rounded-lg border border-[var(--color-bg-alert-medium)]">
              <h2 className="text-xl font-semibold mb-3 text-[var(--color-fg-alert-primary)]">
                Alert Colors
              </h2>
              <p className="text-sm text-[var(--color-fg-alert-secondary)]">
                Error states remain readable across themes.
              </p>
            </div>

            <div className="bg-[var(--color-bg-information-subtle)] p-6 rounded-lg border border-[var(--color-bg-information-medium)]">
              <h2 className="text-xl font-semibold mb-3 text-[var(--color-fg-information-primary)]">
                Information Colors
              </h2>
              <p className="text-sm text-[var(--color-fg-information-secondary)]">
                Informational content adapts automatically.
              </p>
            </div>
          </div>

          <div className="bg-[var(--color-bg-attention-subtle)] p-6 rounded-lg border-l-4 border-[var(--color-bg-attention-high)]">
            <h3 className="text-lg font-semibold mb-2 text-[var(--color-fg-attention-primary)]">
              How It Works
            </h3>
            <p className="text-sm text-[var(--color-fg-attention-secondary)]">
              When <code className="bg-[var(--color-bg-neutral-base)] px-1 py-0.5 rounded">data-theme="dark"</code> is
              set, the CSS automatically switches to dark mode tokens defined in <code className="bg-[var(--color-bg-neutral-base)] px-1 py-0.5 rounded">semantic-color-dark.css</code>.
              No component changes needed!
            </p>
          </div>
        </div>
      </div>
    );
  },
};
