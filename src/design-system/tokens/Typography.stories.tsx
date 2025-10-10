import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Design System/Design Tokens/Typography',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Typography Tokens

A comprehensive typography system with consistent scales for all text elements.

## Typography System

The typography system includes three main categories:

### 1. Body Text Sizes
Standard text sizes with both regular and bold variants:
- **2xs**: 10px - Tiny labels, metadata
- **xs**: 12px - Small labels, captions
- **sm**: 14px - Secondary text, form labels
- **base**: 16px - Default body text
- **lg**: 20px - Large body text, intro paragraphs
- **xl**: 24px - Extra large body text

Each size has a \`-bold\` variant (e.g., \`text-sm-bold\`) with 600 font-weight.

### 2. Headings
Semantic heading sizes (600 font-weight):
- **heading-xs**: 14px / 20px line-height
- **heading-sm**: 16px / 24px line-height
- **heading-md**: 20px / 28px line-height
- **heading-lg**: 24px / 36px line-height
- **heading-xl**: 28px / 40px line-height
- **heading-2xl**: 32px / 44px line-height
- **heading-3xl**: 40px / 56px line-height
- **heading-4xl**: 48px / 64px line-height
- **heading-5xl**: 60px / 80px line-height

### 3. Display Text
Large, attention-grabbing text for hero sections (600 font-weight):
- **display-sm**: 28px / 40px line-height
- **display-md**: 32px / 44px line-height
- **display-lg**: 40px / 56px line-height
- **display-xl**: 48px / 64px line-height
- **display-2xl**: 60px / 80px line-height

## Font Family

The design system uses **Inter** as the primary sans-serif font with system font fallbacks:
- Inter
- system-ui
- -apple-system
- sans-serif

## Using Typography Tokens

\`\`\`tsx
// Body text
<p className="text-base">Default body text</p>
<p className="text-sm">Smaller secondary text</p>
<span className="text-xs-bold">Bold caption</span>

// Headings
<h1 className="text-heading-3xl">Page Title</h1>
<h2 className="text-heading-xl">Section Title</h2>
<h3 className="text-heading-md">Subsection Title</h3>

// Display text
<h1 className="text-display-2xl">Hero Heading</h1>
\`\`\`

## Font Weights

- **normal**: 400 (default for body text)
- **medium**: 500 (rarely used, prefer semibold)
- **semibold**: 600 (default for headings)
- **bold**: 700 (for extra emphasis)
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const TypeRow = ({
  className,
  label,
  specs
}: {
  className: string;
  label: string;
  specs: string;
}) => (
  <div className="flex items-baseline gap-6 border-b border-gray-100 py-4">
    <div className="w-32 flex-shrink-0">
      <p className="text-xs font-semibold text-gray-900">{label}</p>
      <p className="text-2xs text-gray-600">{specs}</p>
    </div>
    <div className={className}>
      The quick brown fox jumps over the lazy dog
    </div>
  </div>
);

export const BodyTextSizes: Story = {
  render: () => (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-2">Body Text Sizes</h2>
      <p className="text-sm text-gray-600 mb-6">
        Standard text sizes with regular (400) and bold (600) variants
      </p>

      <div className="space-y-1">
        <TypeRow className="text-2xs" label="2xs" specs="10px / 16px" />
        <TypeRow className="text-2xs-bold" label="2xs-bold" specs="10px / 16px / 600" />

        <TypeRow className="text-xs" label="xs" specs="12px / 16px" />
        <TypeRow className="text-xs-bold" label="xs-bold" specs="12px / 16px / 600" />

        <TypeRow className="text-sm" label="sm" specs="14px / 20px" />
        <TypeRow className="text-sm-bold" label="sm-bold" specs="14px / 20px / 600" />

        <TypeRow className="text-base" label="base" specs="16px / 24px" />
        <TypeRow className="text-base-bold" label="base-bold" specs="16px / 24px / 600" />

        <TypeRow className="text-lg" label="lg" specs="20px / 28px" />
        <TypeRow className="text-lg-bold" label="lg-bold" specs="20px / 28px / 600" />

        <TypeRow className="text-xl" label="xl" specs="24px / 36px" />
        <TypeRow className="text-xl-bold" label="xl-bold" specs="24px / 36px / 600" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete scale of body text sizes from 2xs (10px) to xl (24px).',
      },
    },
  },
};

export const HeadingSizes: Story = {
  render: () => (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-2">Heading Sizes</h2>
      <p className="text-sm text-gray-600 mb-6">
        Semantic heading sizes with semibold weight (600)
      </p>

      <div className="space-y-1">
        <TypeRow className="text-heading-xs" label="heading-xs" specs="14px / 20px / 600" />
        <TypeRow className="text-heading-sm" label="heading-sm" specs="16px / 24px / 600" />
        <TypeRow className="text-heading-md" label="heading-md" specs="20px / 28px / 600" />
        <TypeRow className="text-heading-lg" label="heading-lg" specs="24px / 36px / 600" />
        <TypeRow className="text-heading-xl" label="heading-xl" specs="28px / 40px / 600" />
        <TypeRow className="text-heading-2xl" label="heading-2xl" specs="32px / 44px / 600" />
        <TypeRow className="text-heading-3xl" label="heading-3xl" specs="40px / 56px / 600" />
        <TypeRow className="text-heading-4xl" label="heading-4xl" specs="48px / 64px / 600" />
        <TypeRow className="text-heading-5xl" label="heading-5xl" specs="60px / 80px / 600" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Semantic heading sizes from xs to 5xl.',
      },
    },
  },
};

export const DisplaySizes: Story = {
  render: () => (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-2">Display Sizes</h2>
      <p className="text-sm text-gray-600 mb-6">
        Large display text for hero sections and marketing pages
      </p>

      <div className="space-y-1">
        <TypeRow className="text-display-sm" label="display-sm" specs="28px / 40px / 600" />
        <TypeRow className="text-display-md" label="display-md" specs="32px / 44px / 600" />
        <TypeRow className="text-display-lg" label="display-lg" specs="40px / 56px / 600" />
        <TypeRow className="text-display-xl" label="display-xl" specs="48px / 64px / 600" />
        <TypeRow className="text-display-2xl" label="display-2xl" specs="60px / 80px / 600" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Display text sizes for hero sections and prominent headings.',
      },
    },
  },
};

export const FontWeights: Story = {
  render: () => (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-2">Font Weights</h2>
      <p className="text-sm text-gray-600 mb-6">Available font weight utilities</p>

      <div className="space-y-4">
        <div>
          <p className="text-xs text-gray-600 mb-1">font-normal (400)</p>
          <p className="text-lg font-normal">The quick brown fox jumps over the lazy dog</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">font-medium (500)</p>
          <p className="text-lg font-medium">The quick brown fox jumps over the lazy dog</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">font-semibold (600)</p>
          <p className="text-lg font-semibold">The quick brown fox jumps over the lazy dog</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">font-bold (700)</p>
          <p className="text-lg font-bold">The quick brown fox jumps over the lazy dog</p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Available font weights from normal (400) to bold (700).',
      },
    },
  },
};

export const TypeScale: Story = {
  render: () => (
    <div className="p-8 max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Complete Type Scale</h2>

      <div className="space-y-8">
        <div className="space-y-2">
          <div className="text-display-2xl">Display 2XL - 60px</div>
          <div className="text-display-xl">Display XL - 48px</div>
          <div className="text-display-lg">Display LG - 40px</div>
          <div className="text-display-md">Display MD - 32px</div>
          <div className="text-display-sm">Display SM - 28px</div>
        </div>

        <div className="space-y-2 border-t pt-6">
          <div className="text-heading-5xl">Heading 5XL - 60px</div>
          <div className="text-heading-4xl">Heading 4XL - 48px</div>
          <div className="text-heading-3xl">Heading 3XL - 40px</div>
          <div className="text-heading-2xl">Heading 2XL - 32px</div>
          <div className="text-heading-xl">Heading XL - 28px</div>
          <div className="text-heading-lg">Heading LG - 24px</div>
          <div className="text-heading-md">Heading MD - 20px</div>
          <div className="text-heading-sm">Heading SM - 16px</div>
          <div className="text-heading-xs">Heading XS - 14px</div>
        </div>

        <div className="space-y-2 border-t pt-6">
          <div className="text-xl">Body XL - 24px</div>
          <div className="text-lg">Body LG - 20px</div>
          <div className="text-base">Body Base - 16px (default)</div>
          <div className="text-sm">Body SM - 14px</div>
          <div className="text-xs">Body XS - 12px</div>
          <div className="text-2xs">Body 2XS - 10px</div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Visual comparison of all typography sizes in the design system.',
      },
    },
  },
};

export const UsageExamples: Story = {
  render: () => (
    <div className="p-8 max-w-4xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Typography Usage Examples</h2>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Marketing Hero Section</h3>
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8">
          <h1 className="text-display-2xl mb-4">Build Better Products</h1>
          <p className="text-lg text-gray-700 mb-6">
            A comprehensive design system for creating beautiful, consistent user interfaces.
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg text-base-bold">
            Get Started
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Article Layout</h3>
        <article className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h1 className="text-heading-2xl">Article Title</h1>
          <p className="text-sm text-gray-600">Published on January 1, 2025 by John Doe</p>
          <p className="text-base leading-relaxed">
            This is a paragraph of body text using the base size (16px). It's comfortable to read
            and works well for longer content. The line height is set to 24px for optimal readability.
          </p>
          <h2 className="text-heading-lg mt-6">Section Heading</h2>
          <p className="text-base leading-relaxed">
            Another paragraph continuing the article content. Notice how the typography creates
            a clear hierarchy and makes the content easy to scan.
          </p>
        </article>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Dashboard Card</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-heading-sm">Revenue</h3>
            <span className="text-xs text-gray-600">Last 30 days</span>
          </div>
          <p className="text-heading-3xl">$12,345</p>
          <p className="text-sm text-positive-primary">
            <span className="font-semibold">+12.5%</span> from last month
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Form Layout</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div>
            <label className="text-sm-bold block mb-1">Email Address</label>
            <p className="text-xs text-gray-600 mb-2">We'll never share your email with anyone else.</p>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full text-base border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm-bold block mb-1">Message</label>
            <textarea
              placeholder="Enter your message..."
              rows={4}
              className="w-full text-base border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Typography Best Practices</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Use <code className="bg-gray-200 px-1 rounded">text-base</code> (16px) for main body text</li>
          <li>• Use heading sizes semantically (largest for most important)</li>
          <li>• Use display sizes sparingly for hero sections and landing pages</li>
          <li>• Prefer <code className="bg-gray-200 px-1 rounded">text-sm-bold</code> over manual weight classes</li>
          <li>• Maintain consistent vertical rhythm with line-height utilities</li>
          <li>• Use <code className="bg-gray-200 px-1 rounded">text-xs</code> or <code className="bg-gray-200 px-1 rounded">text-2xs</code> for metadata and labels</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world examples of typography in different UI contexts.',
      },
    },
  },
};

export const LineHeights: Story = {
  render: () => (
    <div className="p-8 max-w-3xl">
      <h2 className="text-2xl font-bold mb-2">Line Heights</h2>
      <p className="text-sm text-gray-600 mb-6">
        Line heights are automatically set with font sizes, but can be overridden
      </p>

      <div className="space-y-6">
        <div>
          <p className="text-xs text-gray-600 mb-2">Default line-height (from text-base)</p>
          <p className="text-base bg-gray-50 p-4 rounded">
            This paragraph uses the default line-height that comes with text-base (24px).
            It creates comfortable spacing for reading longer paragraphs of text.
            The consistent rhythm makes content easier to consume.
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-2">Custom line-height (leading-relaxed)</p>
          <p className="text-base leading-relaxed bg-gray-50 p-4 rounded">
            This paragraph uses leading-relaxed for even more breathing room between lines.
            This can be useful for longer-form content where extra space improves readability.
            Notice how the increased spacing affects the overall feel of the text.
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-2">Tight line-height (leading-tight)</p>
          <p className="text-base leading-tight bg-gray-50 p-4 rounded">
            This paragraph uses leading-tight for more compact spacing.
            This works well for headings or short snippets where space is at a premium.
            Use sparingly for body text as it can hurt readability.
          </p>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">Available Line Heights</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><code className="bg-white px-2 py-1 rounded">leading-4</code>: 16px</div>
          <div><code className="bg-white px-2 py-1 rounded">leading-5</code>: 20px</div>
          <div><code className="bg-white px-2 py-1 rounded">leading-6</code>: 24px</div>
          <div><code className="bg-white px-2 py-1 rounded">leading-7</code>: 28px</div>
          <div><code className="bg-white px-2 py-1 rounded">leading-8</code>: 32px</div>
          <div><code className="bg-white px-2 py-1 rounded">leading-9</code>: 36px</div>
          <div><code className="bg-white px-2 py-1 rounded">leading-10</code>: 40px</div>
          <div><code className="bg-white px-2 py-1 rounded">leading-11</code>: 44px</div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Line height utilities and their impact on text readability.',
      },
    },
  },
};
