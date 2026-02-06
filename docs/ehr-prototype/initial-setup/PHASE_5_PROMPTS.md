# Phase 5: Storybook Setup — Claude Code Prompts

This document contains Claude Code prompts for setting up Storybook to document and showcase all UI components.

---

## Overview

| Chunk | Description | Est. Files |
|-------|-------------|------------|
| 5.1 | Storybook Installation & Config | 5 |
| 5.2 | Design Token Stories | 4 |
| 5.3 | Primitive Component Stories | 10 |
| 5.4 | Chart Item Stories | 8 |
| 5.5 | Suggestion & Task Stories | 6 |
| 5.6 | OmniAdd & AI UI Stories | 5 |
| 5.7 | Care Gap & Layout Stories | 6 |
| 5.8 | Composite Pattern Stories | 4 |
| 5.9 | Documentation Pages | 5 |

---

## Chunk 5.1: Storybook Installation & Configuration

### Prompt

```
Set up Storybook for the EHR component library with proper configuration.

## Requirements

### 1. Install Storybook

Run in project root:

```bash
npx storybook@latest init --builder=vite
npm install -D @storybook/addon-a11y @storybook/addon-interactions @storybook/addon-links
```

### 2. CREATE `.storybook/main.ts`

```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-links',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: { autodocs: 'tag' },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
};

export default config;
```

### 3. CREATE `.storybook/preview.tsx`

```typescript
import type { Preview } from '@storybook/react';
import React from 'react';
import { ThemeProvider } from '../src/context/ThemeContext';
import '../src/styles/global.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#F9FAFB' },
        { name: 'white', value: '#FFFFFF' },
        { name: 'dark', value: '#1F2937' },
      ],
    },
    a11y: {
      element: '#storybook-root',
      config: {},
      options: {},
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ padding: '1rem' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default preview;
```

### 4. CREATE `.storybook/manager.ts`

```typescript
import { addons } from '@storybook/manager-api';
import { create } from '@storybook/theming/create';

const ehrTheme = create({
  base: 'light',
  brandTitle: 'EHR Component Library',
  brandUrl: '/',
  colorPrimary: '#6366F1',
  colorSecondary: '#4F46E5',
  appBg: '#F9FAFB',
  appContentBg: '#FFFFFF',
  appBorderColor: '#E5E7EB',
  appBorderRadius: 8,
  fontBase: '"Inter", system-ui, -apple-system, sans-serif',
  fontCode: '"Fira Code", monospace',
  textColor: '#111827',
  textInverseColor: '#FFFFFF',
  barTextColor: '#6B7280',
  barSelectedColor: '#4F46E5',
  barBg: '#FFFFFF',
});

addons.setConfig({
  theme: ehrTheme,
  sidebar: {
    showRoots: true,
  },
});
```

### 5. UPDATE `package.json` scripts

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

## Guidelines
- Use Vite builder for faster builds
- Enable autodocs by default
- Include a11y addon for accessibility testing
- Use custom theme matching app design
```

---

## Chunk 5.2: Design Token Stories

### Prompt

```
Create Storybook stories for design tokens to document the visual language.

## Requirements

### 1. CREATE `src/stories/tokens/Colors.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const ColorSwatch: React.FC<{ name: string; value: string; textDark?: boolean }> = ({ 
  name, value, textDark = false 
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
    <div style={{ 
      width: '3rem', height: '3rem', borderRadius: '0.5rem', 
      backgroundColor: value, border: '1px solid #E5E7EB' 
    }} />
    <div>
      <div style={{ fontWeight: 500 }}>{name}</div>
      <code style={{ fontSize: '0.875rem', color: '#6B7280' }}>{value}</code>
    </div>
  </div>
);

const ColorPalette: React.FC<{ title: string; colors: Record<string, string> }> = ({ title, colors }) => (
  <div style={{ marginBottom: '2rem' }}>
    <h3 style={{ marginBottom: '1rem' }}>{title}</h3>
    {Object.entries(colors).map(([name, value]) => (
      <ColorSwatch key={name} name={name} value={value} />
    ))}
  </div>
);

const AllColors = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
    <ColorPalette title="Primary" colors={{
      'primary-50': '#EEF2FF', 'primary-100': '#E0E7FF', 'primary-500': '#6366F1',
      'primary-600': '#4F46E5', 'primary-700': '#4338CA',
    }} />
    <ColorPalette title="Neutral" colors={{
      'neutral-50': '#F9FAFB', 'neutral-100': '#F3F4F6', 'neutral-200': '#E5E7EB',
      'neutral-500': '#6B7280', 'neutral-700': '#374151', 'neutral-900': '#111827',
    }} />
    <ColorPalette title="Semantic" colors={{
      'success': '#10B981', 'warning': '#F59E0B', 'error': '#EF4444', 'info': '#3B82F6',
    }} />
    <ColorPalette title="Clinical Status" colors={{
      'status-draft': '#9CA3AF', 'status-pending': '#F59E0B', 'status-confirmed': '#10B981',
      'status-ordered': '#3B82F6', 'status-completed': '#8B5CF6', 'status-cancelled': '#EF4444',
    }} />
  </div>
);

const meta: Meta = {
  title: 'Design Tokens/Colors',
  component: AllColors,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AllPalettes: Story = {};
```

### 2. CREATE `src/stories/tokens/Typography.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const TypeScale: React.FC = () => (
  <div>
    {[
      { name: 'display-lg', size: '2.25rem', weight: 700, sample: 'Display Large' },
      { name: 'display', size: '1.875rem', weight: 700, sample: 'Display' },
      { name: 'heading-lg', size: '1.5rem', weight: 600, sample: 'Heading Large' },
      { name: 'heading', size: '1.25rem', weight: 600, sample: 'Heading' },
      { name: 'heading-sm', size: '1.125rem', weight: 600, sample: 'Heading Small' },
      { name: 'body-lg', size: '1.125rem', weight: 400, sample: 'Body Large' },
      { name: 'body', size: '1rem', weight: 400, sample: 'Body - Default text size' },
      { name: 'body-sm', size: '0.875rem', weight: 400, sample: 'Body Small' },
      { name: 'caption', size: '0.75rem', weight: 400, sample: 'Caption text' },
    ].map(({ name, size, weight, sample }) => (
      <div key={name} style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
        <code style={{ width: '120px', fontSize: '0.75rem', color: '#6B7280' }}>{name}</code>
        <span style={{ fontSize: size, fontWeight: weight }}>{sample}</span>
        <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{size} / {weight}</span>
      </div>
    ))}
  </div>
);

const meta: Meta = {
  title: 'Design Tokens/Typography',
  component: TypeScale,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const TypeScaleDemo: Story = {};
```

### 3. CREATE `src/stories/tokens/Spacing.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const SpacingScale: React.FC = () => (
  <div>
    {[
      { name: 'spacing-1', value: '0.25rem', px: '4px' },
      { name: 'spacing-2', value: '0.5rem', px: '8px' },
      { name: 'spacing-3', value: '0.75rem', px: '12px' },
      { name: 'spacing-4', value: '1rem', px: '16px' },
      { name: 'spacing-6', value: '1.5rem', px: '24px' },
      { name: 'spacing-8', value: '2rem', px: '32px' },
      { name: 'spacing-12', value: '3rem', px: '48px' },
      { name: 'spacing-16', value: '4rem', px: '64px' },
    ].map(({ name, value, px }) => (
      <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
        <code style={{ width: '100px', fontSize: '0.75rem' }}>{name}</code>
        <div style={{ width: value, height: '1.5rem', backgroundColor: '#6366F1', borderRadius: '2px' }} />
        <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>{value} ({px})</span>
      </div>
    ))}
  </div>
);

const meta: Meta = {
  title: 'Design Tokens/Spacing',
  component: SpacingScale,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SpacingScaleDemo: Story = {};
```

### 4. CREATE `src/stories/tokens/StatusIndicators.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Badge } from '../../components/primitives/Badge';
import { Tag } from '../../components/primitives/Tag';

const StatusIndicatorsDemo: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
    <div>
      <h3 style={{ marginBottom: '1rem' }}>Item Status Badges</h3>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Badge variant="neutral">Draft</Badge>
        <Badge variant="warning">Pending Review</Badge>
        <Badge variant="success">Confirmed</Badge>
        <Badge variant="info">Ordered</Badge>
        <Badge variant="primary">Completed</Badge>
        <Badge variant="error">Cancelled</Badge>
      </div>
    </div>
    <div>
      <h3 style={{ marginBottom: '1rem' }}>Tag Types</h3>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Tag type="status" label="New" />
        <Tag type="source" label="Quest" />
        <Tag type="alert" label="OOR" />
        <Tag type="category" label="Lab" />
        <Tag type="ai" label="AI Suggested" />
        <Tag type="workflow" label="E-Prescribed" />
      </div>
    </div>
    <div>
      <h3 style={{ marginBottom: '1rem' }}>Priority Indicators</h3>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Badge variant="neutral" size="sm">Low</Badge>
        <Badge variant="info" size="sm">Normal</Badge>
        <Badge variant="warning" size="sm">High</Badge>
        <Badge variant="error" size="sm">Urgent</Badge>
      </div>
    </div>
  </div>
);

const meta: Meta = {
  title: 'Design Tokens/Status Indicators',
  component: StatusIndicatorsDemo,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AllIndicators: Story = {};
```

## Guidelines
- Document all design tokens visually
- Include usage examples
- Show clinical-specific status colors
```

---

## Chunk 5.3: Primitive Component Stories

### Prompt

```
Create Storybook stories for all primitive components.

## Requirements

### 1. CREATE `src/stories/primitives/Button.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../components/primitives/Button';
import { fn } from '@storybook/test';

const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  args: { onClick: fn() },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { children: 'Primary Button', variant: 'primary' } };
export const Secondary: Story = { args: { children: 'Secondary Button', variant: 'secondary' } };
export const Ghost: Story = { args: { children: 'Ghost Button', variant: 'ghost' } };
export const Danger: Story = { args: { children: 'Danger Button', variant: 'danger' } };
export const Small: Story = { args: { children: 'Small', size: 'sm' } };
export const Large: Story = { args: { children: 'Large', size: 'lg' } };
export const Loading: Story = { args: { children: 'Loading...', loading: true } };
export const Disabled: Story = { args: { children: 'Disabled', disabled: true } };

export const ClinicalActions: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <Button variant="primary">Confirm</Button>
      <Button variant="secondary">Edit</Button>
      <Button variant="danger">Cancel Order</Button>
    </div>
  ),
};
```

### 2. CREATE `src/stories/primitives/Badge.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../../components/primitives/Badge';

const meta: Meta<typeof Badge> = {
  title: 'Primitives/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'success', 'warning', 'error', 'info', 'neutral'] },
    size: { control: 'select', options: ['sm', 'md'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { children: 'Primary', variant: 'primary' } };
export const Success: Story = { args: { children: 'Success', variant: 'success' } };
export const Warning: Story = { args: { children: 'Warning', variant: 'warning' } };
export const Error: Story = { args: { children: 'Error', variant: 'error' } };
export const Info: Story = { args: { children: 'Info', variant: 'info' } };
export const Neutral: Story = { args: { children: 'Neutral', variant: 'neutral' } };

export const ItemStatus: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Badge variant="neutral">Draft</Badge>
      <Badge variant="warning">Pending Review</Badge>
      <Badge variant="success">Confirmed</Badge>
      <Badge variant="info">Ordered</Badge>
      <Badge variant="primary">Completed</Badge>
      <Badge variant="error">Cancelled</Badge>
    </div>
  ),
};

export const TaskStatus: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <Badge variant="neutral">Queued</Badge>
      <Badge variant="info">Processing</Badge>
      <Badge variant="warning">Needs Review</Badge>
      <Badge variant="success">Ready</Badge>
    </div>
  ),
};

export const WithCount: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <Badge variant="error" size="sm">3</Badge>
      <Badge variant="warning" size="sm">5</Badge>
    </div>
  ),
};
```

### 3. CREATE `src/stories/primitives/Tag.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Tag } from '../../components/primitives/Tag';
import { fn } from '@storybook/test';

const meta: Meta<typeof Tag> = {
  title: 'Primitives/Tag',
  component: Tag,
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: ['status', 'source', 'alert', 'category', 'ai', 'workflow'] },
    actionable: { control: 'boolean' },
    removable: { control: 'boolean' },
  },
  args: { onRemove: fn(), onClick: fn() },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Status: Story = { args: { label: 'New', type: 'status' } };
export const Source: Story = { args: { label: 'Quest', type: 'source' } };
export const Alert: Story = { args: { label: 'OOR', type: 'alert' } };
export const Category: Story = { args: { label: 'Lab', type: 'category' } };
export const AI: Story = { args: { label: 'AI Suggested', type: 'ai' } };
export const Workflow: Story = { args: { label: 'E-Prescribed', type: 'workflow' } };

export const Actionable: Story = { args: { label: 'Click me', type: 'status', actionable: true } };
export const Removable: Story = { args: { label: 'Remove me', type: 'source', removable: true } };

export const AllTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Tag type="status" label="New" />
      <Tag type="source" label="Quest" />
      <Tag type="alert" label="OOR" />
      <Tag type="alert" label="Critical" />
      <Tag type="category" label="Lab" />
      <Tag type="ai" label="AI Suggested" />
      <Tag type="workflow" label="E-Prescribed" />
    </div>
  ),
};

export const LabResultTags: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <Tag type="source" label="Quest" />
      <Tag type="alert" label="3 OOR" />
      <Tag type="workflow" label="Resulted" />
    </div>
  ),
};
```

### 4. CREATE `src/stories/primitives/Input.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '../../components/primitives/Input';
import { fn } from '@storybook/test';

const meta: Meta<typeof Input> = {
  title: 'Primitives/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: ['text', 'search', 'number', 'password'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    error: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: { onChange: fn() },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { placeholder: 'Enter text...' } };
export const WithLabel: Story = { args: { label: 'Drug Name', placeholder: 'Search medications...' } };
export const WithError: Story = { args: { label: 'Dosage', error: true, helperText: 'Invalid dosage format' } };
export const WithHelperText: Story = { args: { label: 'Frequency', helperText: 'e.g., BID, TID, QID' } };
export const Search: Story = { args: { type: 'search', placeholder: 'Search...', showSearchIcon: true } };
export const Disabled: Story = { args: { placeholder: 'Disabled', disabled: true } };

export const OmniAddSearch: Story = {
  args: { 
    type: 'search', 
    placeholder: 'Add to chart...', 
    showSearchIcon: true,
    size: 'lg',
  },
};

export const DosageInput: Story = {
  args: {
    label: 'Dosage',
    placeholder: '100',
    suffix: 'mg',
    type: 'number',
  },
};
```

### 5. CREATE `src/stories/primitives/Card.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Card } from '../../components/primitives/Card';

const meta: Meta<typeof Card> = {
  title: 'Primitives/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'elevated', 'outlined', 'interactive'] },
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: <div style={{ padding: '1rem' }}>Card content</div> },
};

export const Elevated: Story = {
  args: { variant: 'elevated', children: <div style={{ padding: '1rem' }}>Elevated card</div> },
};

export const Outlined: Story = {
  args: { variant: 'outlined', children: <div style={{ padding: '1rem' }}>Outlined card</div> },
};

export const Interactive: Story = {
  args: { variant: 'interactive', children: <div style={{ padding: '1rem' }}>Clickable card</div> },
};

export const ChartItemExample: Story = {
  render: () => (
    <Card variant="default" padding="md">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <strong>Benzonatate 100mg</strong>
          <div style={{ color: '#6B7280', fontSize: '0.875rem' }}>PO TID PRN cough</div>
        </div>
        <span style={{ 
          backgroundColor: '#DEF7EC', 
          color: '#03543F', 
          padding: '0.25rem 0.5rem', 
          borderRadius: '0.25rem',
          fontSize: '0.75rem' 
        }}>Confirmed</span>
      </div>
    </Card>
  ),
};
```

### 6-10. Continue with Modal, Select, IconButton, Spinner, Tooltip stories following same pattern

## Guidelines
- Include all variants and states
- Show clinical context examples
- Use realistic data
- Document all props via argTypes
```

---

## Chunk 5.4: Chart Item Stories

### Prompt

```
Create Storybook stories for all chart item components.

## Requirements

### 1. CREATE `src/stories/chart-items/ChartItemCard.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { ChartItemCard } from '../../components/chart-items/ChartItemCard';
import { ITEM_TEMPLATES, generateChartItem } from '../../mocks';

const meta: Meta<typeof ChartItemCard> = {
  title: 'Chart Items/ChartItemCard',
  component: ChartItemCard,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['compact', 'default', 'expanded'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Medication: Story = { args: { item: ITEM_TEMPLATES.benzonatate, variant: 'default' } };
export const Lab: Story = { args: { item: ITEM_TEMPLATES.cbc, variant: 'default' } };
export const Diagnosis: Story = { args: { item: ITEM_TEMPLATES.acuteBronchitis, variant: 'default' } };
export const Vitals: Story = { args: { item: generateChartItem('vitals'), variant: 'default' } };

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {['draft', 'pending-review', 'confirmed', 'ordered', 'completed', 'cancelled'].map(status => (
        <ChartItemCard 
          key={status}
          item={{ ...ITEM_TEMPLATES.benzonatate, status }}
          variant="compact"
        />
      ))}
    </div>
  ),
};

export const AIGenerated: Story = {
  args: {
    item: {
      ...ITEM_TEMPLATES.acuteBronchitis,
      status: 'pending-review',
      _meta: { aiGenerated: true, aiConfidence: 0.92, requiresReview: true, syncStatus: 'synced' },
    },
  },
};

export const Compact: Story = { args: { item: ITEM_TEMPLATES.benzonatate, variant: 'compact' } };
export const Expanded: Story = { args: { item: ITEM_TEMPLATES.benzonatate, variant: 'expanded' } };
```

### 2. CREATE `src/stories/chart-items/MedicationCard.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { MedicationCard } from '../../components/chart-items/MedicationCard';
import { ITEM_TEMPLATES, generateMedicationItem } from '../../mocks';

const meta: Meta<typeof MedicationCard> = {
  title: 'Chart Items/MedicationCard',
  component: MedicationCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const NewPrescription: Story = { args: { item: ITEM_TEMPLATES.benzonatate } };

export const Refill: Story = {
  args: {
    item: generateMedicationItem({
      displayText: 'Metformin 500mg',
      data: { prescriptionType: 'refill', dosage: '500mg', frequency: 'BID', route: 'PO' },
    }),
  },
};

export const Controlled: Story = {
  args: {
    item: generateMedicationItem({
      displayText: 'Hydrocodone/Acetaminophen 5/325',
      data: { isControlled: true, controlSchedule: 'II', dosage: '5/325mg', frequency: 'Q4-6H PRN' },
      tags: [{ type: 'alert', label: 'C-II' }],
    }),
  },
};

export const Discontinued: Story = {
  args: {
    item: generateMedicationItem({
      displayText: 'Amoxicillin 500mg',
      status: 'cancelled',
      data: { prescriptionType: 'discontinue' },
    }),
  },
};

export const EPrescribed: Story = {
  args: {
    item: {
      ...ITEM_TEMPLATES.benzonatate,
      status: 'ordered',
      tags: [{ type: 'workflow', label: 'E-Prescribed' }],
    },
  },
};

export const Reported: Story = {
  args: {
    item: generateMedicationItem({
      displayText: 'Lisinopril 10mg',
      data: { reportedBy: 'patient', verificationStatus: 'verified', dosage: '10mg', frequency: 'daily' },
      tags: [{ type: 'source', label: 'Reported' }],
    }),
  },
};

export const WithLinkedDx: Story = {
  args: {
    item: {
      ...ITEM_TEMPLATES.benzonatate,
      linkedDiagnoses: ['dx-001'],
      tags: [{ type: 'status', label: 'Dx Linked' }],
    },
  },
};
```

### 3. CREATE `src/stories/chart-items/LabCard.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { LabCard } from '../../components/chart-items/LabCard';
import { ITEM_TEMPLATES, generateLabItem } from '../../mocks';

const meta: Meta<typeof LabCard> = {
  title: 'Chart Items/LabCard',
  component: LabCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Draft: Story = {
  args: { item: { ...ITEM_TEMPLATES.cbc, status: 'draft', data: { ...ITEM_TEMPLATES.cbc.data, orderStatus: 'draft' } } },
};

export const Ordered: Story = {
  args: {
    item: {
      ...ITEM_TEMPLATES.cbc,
      status: 'ordered',
      data: { ...ITEM_TEMPLATES.cbc.data, orderStatus: 'ordered', requisitionId: 'REQ-001234' },
      tags: [{ type: 'source', label: 'Quest' }, { type: 'workflow', label: 'Ordered' }],
    },
  },
};

export const Collected: Story = {
  args: {
    item: generateLabItem({
      displayText: 'CBC Panel',
      data: { orderStatus: 'collected', collectedAt: new Date() },
      tags: [{ type: 'workflow', label: 'Collected' }],
    }),
  },
};

export const ResultedNormal: Story = {
  args: {
    item: generateLabItem({
      displayText: 'Hemoglobin A1C',
      status: 'completed',
      data: {
        orderStatus: 'resulted',
        results: [{ component: 'HbA1c', value: 6.8, unit: '%', referenceRange: '4.0-5.6', flag: 'high' }],
      },
      tags: [{ type: 'alert', label: '1 OOR' }],
    }),
  },
};

export const ResultedCritical: Story = {
  args: {
    item: generateLabItem({
      displayText: 'Potassium',
      status: 'completed',
      data: {
        orderStatus: 'resulted',
        results: [{ component: 'K+', value: 6.2, unit: 'mEq/L', referenceRange: '3.5-5.0', flag: 'critical' }],
      },
      tags: [{ type: 'alert', label: 'Critical' }],
    }),
  },
};

export const RapidTest: Story = {
  args: {
    item: generateLabItem({
      displayText: 'Rapid COVID-19 Antigen',
      data: { collectionType: 'in-house', orderStatus: 'resulted', results: [{ component: 'Result', value: 'Negative' }] },
      tags: [{ type: 'source', label: 'In-House' }],
    }),
  },
};
```

### 4-8. Continue with DiagnosisCard, VitalsCard, PhysicalExamCard, NarrativeCard, ImagingCard following same pattern

## Guidelines
- Show all clinical states
- Include realistic medical data
- Demonstrate tag combinations
- Show AI-generated variants
```

---

## Chunk 5.5: Suggestion & Task Stories

### Prompt

```
Create Storybook stories for suggestion and task components.

## Requirements

### 1. CREATE `src/stories/suggestions/SuggestionChip.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { SuggestionChip } from '../../components/suggestions/SuggestionChip';
import { fn } from '@storybook/test';

const meta: Meta<typeof SuggestionChip> = {
  title: 'AI/SuggestionChip',
  component: SuggestionChip,
  tags: ['autodocs'],
  args: { onAccept: fn(), onDismiss: fn() },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const HighConfidence: Story = {
  args: {
    suggestion: { id: 's1', displayText: 'Acute bronchitis J20.9', confidence: 0.92, source: 'transcription' },
  },
};

export const MediumConfidence: Story = {
  args: {
    suggestion: { id: 's2', displayText: 'Benzonatate 100mg TID', confidence: 0.75, source: 'ai-analysis' },
  },
};

export const LowConfidence: Story = {
  args: {
    suggestion: { id: 's3', displayText: 'Possible follow-up', confidence: 0.55, source: 'ai-analysis' },
  },
};

export const FromTranscription: Story = {
  args: {
    suggestion: { id: 's4', displayText: 'Cough × 5 days', confidence: 0.88, source: 'transcription' },
  },
};

export const CareGapAction: Story = {
  args: {
    suggestion: { id: 's5', displayText: 'Order A1C (gap open)', confidence: 0.95, source: 'care-gap' },
  },
};

export const MultipleSuggestions: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <SuggestionChip suggestion={{ id: 's1', displayText: 'Acute bronchitis J20.9', confidence: 0.92 }} onAccept={fn()} onDismiss={fn()} />
      <SuggestionChip suggestion={{ id: 's2', displayText: 'Benzonatate 100mg', confidence: 0.85 }} onAccept={fn()} onDismiss={fn()} />
      <SuggestionChip suggestion={{ id: 's3', displayText: 'Chest X-ray', confidence: 0.72 }} onAccept={fn()} onDismiss={fn()} />
    </div>
  ),
};
```

### 2. CREATE `src/stories/tasks/TaskCard.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { TaskCard } from '../../components/tasks/TaskCard';
import { fn } from '@storybook/test';

const meta: Meta<typeof TaskCard> = {
  title: 'AI/TaskCard',
  component: TaskCard,
  tags: ['autodocs'],
  args: { onApprove: fn(), onReject: fn(), onRetry: fn() },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DxAssociationPending: Story = {
  args: {
    task: {
      id: 't1', type: 'dx-association', status: 'pending-review',
      displayTitle: 'Link diagnosis', displayStatus: 'CBC Panel',
      result: { suggestions: [{ description: 'Acute bronchitis', icdCode: 'J20.9', confidence: 0.88 }] },
    },
  },
};

export const DrugInteractionAlert: Story = {
  args: {
    task: {
      id: 't2', type: 'drug-interaction', status: 'pending-review', priority: 'urgent',
      displayTitle: '⚠️ Drug Interaction', displayStatus: 'Severe - review required',
      result: { interactions: [{ drug1: 'Metformin', drug2: 'Contrast', severity: 'severe' }] },
    },
  },
};

export const FormularyCheck: Story = {
  args: {
    task: {
      id: 't3', type: 'formulary-check', status: 'completed',
      displayTitle: 'Formulary Check', displayStatus: 'Tier 2 - $25 copay',
      result: { covered: true, tier: 2, copay: 25 },
    },
  },
};

export const NoteGeneration: Story = {
  args: {
    task: {
      id: 't4', type: 'note-generation', status: 'pending-review',
      displayTitle: 'Visit Note Draft', displayStatus: 'Ready for review',
    },
  },
};

export const LabSendReady: Story = {
  args: {
    task: {
      id: 't5', type: 'lab-send', status: 'ready',
      displayTitle: 'Send Labs', displayStatus: 'Quest - CBC, CMP, A1C',
    },
  },
};

export const Processing: Story = {
  args: {
    task: {
      id: 't6', type: 'formulary-check', status: 'processing',
      displayTitle: 'Formulary Check', displayStatus: 'Checking...',
      progress: 60,
    },
  },
};

export const Failed: Story = {
  args: {
    task: {
      id: 't7', type: 'lab-send', status: 'failed',
      displayTitle: 'Send Labs', displayStatus: 'Connection failed',
      error: 'Unable to connect to Quest',
    },
  },
};

export const Completed: Story = {
  args: {
    task: {
      id: 't8', type: 'lab-send', status: 'completed',
      displayTitle: 'Labs Sent', displayStatus: 'REQ-001234',
    },
  },
};
```

### 3. CREATE `src/stories/tasks/TaskPane.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { TaskPane } from '../../components/tasks/TaskPane';
import { fn } from '@storybook/test';

const mockTaskData = {
  needsReview: [
    { id: 't1', type: 'dx-association', status: 'pending-review', displayTitle: 'Link diagnosis', displayStatus: 'CBC Panel' },
    { id: 't2', type: 'dx-association', status: 'pending-review', displayTitle: 'Link diagnosis', displayStatus: 'CMP Panel' },
  ],
  readyToSend: [
    { id: 't3', type: 'lab-send', status: 'ready', displayTitle: 'Send Labs', displayStatus: 'Quest - 3 tests' },
    { id: 't4', type: 'rx-send', status: 'ready', displayTitle: 'E-Prescribe', displayStatus: 'Benzonatate' },
  ],
  processing: [
    { id: 't5', type: 'formulary-check', status: 'processing', progress: 60, displayTitle: 'Formulary', displayStatus: 'Checking...' },
  ],
  completed: [
    { id: 't6', type: 'lab-send', status: 'completed', displayTitle: 'Labs Sent', displayStatus: 'REQ-001234' },
  ],
};

const meta: Meta<typeof TaskPane> = {
  title: 'AI/TaskPane',
  component: TaskPane,
  tags: ['autodocs'],
  args: { onTaskSelect: fn(), onBatchSend: fn(), onApprove: fn(), onReject: fn() },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { taskData: mockTaskData } };

export const WithAlert: Story = {
  args: {
    taskData: {
      ...mockTaskData,
      needsReview: [
        { id: 't0', type: 'drug-interaction', status: 'pending-review', priority: 'urgent', displayTitle: '⚠️ Drug Interaction', displayStatus: 'Review required' },
        ...mockTaskData.needsReview,
      ],
    },
  },
};

export const Empty: Story = {
  args: { taskData: { needsReview: [], readyToSend: [], processing: [], completed: [] } },
};

export const AllComplete: Story = {
  args: {
    taskData: {
      needsReview: [],
      readyToSend: [],
      processing: [],
      completed: [
        { id: 't1', type: 'lab-send', status: 'completed', displayTitle: 'Labs Sent', displayStatus: 'REQ-001234' },
        { id: 't2', type: 'rx-send', status: 'completed', displayTitle: 'E-Prescribed', displayStatus: 'Sent to CVS' },
      ],
    },
  },
};
```

### 4-6. Continue with SuggestionCard, TaskList, AlertCard following same pattern

## Guidelines
- Show all task states and types
- Include urgent/alert scenarios
- Demonstrate batch operations
- Show realistic clinical task data
```

---

## Chunk 5.6: OmniAdd & AI UI Stories

### Prompt

```
Create Storybook stories for OmniAdd and AI UI components.

## Requirements

### 1. CREATE `src/stories/core/OmniAddBar.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { OmniAddBar } from '../../components/omni-add/OmniAddBar';
import { fn } from '@storybook/test';

const meta: Meta<typeof OmniAddBar> = {
  title: 'Core/OmniAddBar',
  component: OmniAddBar,
  tags: ['autodocs'],
  args: { onItemAdd: fn(), onSuggestionAccept: fn(), onSuggestionDismiss: fn() },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };

export const WithSuggestions: Story = {
  args: {
    activeSuggestions: [
      { id: 's1', displayText: 'Acute bronchitis J20.9', confidence: 0.92, source: 'transcription' },
      { id: 's2', displayText: 'Benzonatate 100mg TID', confidence: 0.85, source: 'transcription' },
    ],
  },
};

export const CategorySelected: Story = {
  args: { selectedCategory: 'medication' },
};

export const WithSearchResults: Story = {
  args: {
    selectedCategory: 'medication',
    searchQuery: 'benzo',
    searchResults: [
      { id: 'r1', displayText: 'Benzonatate 100mg', category: 'medication' },
      { id: 'r2', displayText: 'Benzonatate 200mg', category: 'medication' },
    ],
  },
};

export const Disabled: Story = { args: { disabled: true } };
```

### 2. CREATE `src/stories/core/Minibar.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Minibar } from '../../components/ai-ui/Minibar';
import { fn } from '@storybook/test';

const meta: Meta<typeof Minibar> = {
  title: 'Core/Minibar',
  component: Minibar,
  tags: ['autodocs'],
  args: { onTranscriptionToggle: fn(), onOpenPalette: fn(), onOpenTaskPane: fn() },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  args: { transcriptionStatus: 'idle', pendingReviewCount: 0, alertCount: 0, syncStatus: 'synced' },
};

export const Recording: Story = {
  args: { transcriptionStatus: 'recording', pendingReviewCount: 2, alertCount: 0, syncStatus: 'synced', duration: 342 },
};

export const Paused: Story = {
  args: { transcriptionStatus: 'paused', pendingReviewCount: 2, alertCount: 0, syncStatus: 'synced', duration: 342 },
};

export const WithAlerts: Story = {
  args: { transcriptionStatus: 'recording', pendingReviewCount: 3, alertCount: 2, syncStatus: 'synced', duration: 156 },
};

export const Syncing: Story = {
  args: { transcriptionStatus: 'idle', pendingReviewCount: 0, alertCount: 0, syncStatus: 'syncing' },
};

export const Offline: Story = {
  args: { transcriptionStatus: 'idle', pendingReviewCount: 5, alertCount: 1, syncStatus: 'offline' },
};
```

### 3. CREATE `src/stories/core/Palette.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Palette } from '../../components/ai-ui/Palette';
import { fn } from '@storybook/test';

const meta: Meta<typeof Palette> = {
  title: 'Core/Palette',
  component: Palette,
  tags: ['autodocs'],
  args: { onClose: fn(), onSuggestionAccept: fn(), onSuggestionDismiss: fn(), onAlertAcknowledge: fn() },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithSuggestions: Story = {
  args: {
    isOpen: true,
    suggestions: [
      { id: 's1', displayText: 'Acute bronchitis J20.9', confidence: 0.92, source: 'transcription' },
      { id: 's2', displayText: 'Benzonatate 100mg TID', confidence: 0.85, source: 'transcription' },
      { id: 's3', displayText: 'Chest X-ray', confidence: 0.72, source: 'ai-analysis' },
    ],
    alerts: [],
  },
};

export const WithAlerts: Story = {
  args: {
    isOpen: true,
    suggestions: [],
    alerts: [
      { id: 'a1', severity: 'warning', title: 'Drug Interaction', message: 'Moderate interaction detected' },
    ],
  },
};

export const Mixed: Story = {
  args: {
    isOpen: true,
    suggestions: [
      { id: 's1', displayText: 'Order A1C (gap open)', confidence: 0.95, source: 'care-gap' },
    ],
    alerts: [
      { id: 'a1', severity: 'critical', title: 'Allergy Alert', message: 'Patient allergic to Penicillin class' },
    ],
  },
};

export const Empty: Story = { args: { isOpen: true, suggestions: [], alerts: [] } };
export const Closed: Story = { args: { isOpen: false, suggestions: [], alerts: [] } };
```

### 4-5. Continue with CategorySelector, TranscriptionIndicator following same pattern

## Guidelines
- Show all transcription states
- Demonstrate alert badging
- Include sync status variants
- Show realistic suggestion content
```

---

## Chunk 5.7: Care Gap & Layout Stories

### Prompt

```
Create Storybook stories for care gap and layout components.

## Requirements

### 1. CREATE `src/stories/clinical/CareGapCard.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { CareGapCard } from '../../components/care-gaps/CareGapCard';
import { fn } from '@storybook/test';

const meta: Meta<typeof CareGapCard> = {
  title: 'Clinical/CareGapCard',
  component: CareGapCard,
  tags: ['autodocs'],
  args: { onAction: fn(), onExclude: fn() },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const OpenOverdue: Story = {
  args: {
    gap: {
      id: 'gap-001', status: 'open',
      _display: { name: 'A1C Monitoring', category: 'diabetes', priority: 'important', actionLabel: 'Order A1C', dueLabel: 'Overdue by 45 days' },
    },
  },
};

export const OpenDueSoon: Story = {
  args: {
    gap: {
      id: 'gap-002', status: 'open',
      _display: { name: 'Mammogram', category: 'cancer-screening', priority: 'important', actionLabel: 'Schedule mammogram', dueLabel: 'Due in 30 days' },
    },
  },
};

export const OpenRoutine: Story = {
  args: {
    gap: {
      id: 'gap-003', status: 'open',
      _display: { name: 'Flu Vaccine', category: 'immunization', priority: 'routine', actionLabel: 'Administer', dueLabel: 'Due Oct 2024' },
    },
  },
};

export const Pending: Story = {
  args: {
    gap: {
      id: 'gap-004', status: 'pending',
      _display: { name: 'A1C Monitoring', category: 'diabetes', priority: 'important', dueLabel: 'A1C ordered - awaiting result' },
    },
  },
};

export const Closed: Story = {
  args: {
    gap: {
      id: 'gap-005', status: 'closed',
      _display: { name: 'PHQ-9 Screening', category: 'mental-health', priority: 'routine', dueLabel: 'Completed today' },
    },
  },
};

export const Excluded: Story = {
  args: {
    gap: {
      id: 'gap-006', status: 'excluded',
      _display: { name: 'Colorectal Screening', category: 'cancer-screening', priority: 'important', dueLabel: 'Patient declined' },
    },
  },
};

export const Critical: Story = {
  args: {
    gap: {
      id: 'gap-007', status: 'open',
      _display: { name: 'Blood Pressure Check', category: 'hypertension', priority: 'critical', actionLabel: 'Check BP', dueLabel: 'Critical - check now' },
    },
  },
};
```

### 2. CREATE `src/stories/clinical/CareGapList.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { CareGapList } from '../../components/care-gaps/CareGapList';
import { fn } from '@storybook/test';

const mockGaps = [
  { id: 'g1', status: 'open', _display: { name: 'A1C Monitoring', category: 'diabetes', priority: 'important', actionLabel: 'Order A1C', dueLabel: 'Overdue' } },
  { id: 'g2', status: 'open', _display: { name: 'Eye Exam', category: 'diabetes', priority: 'important', actionLabel: 'Order referral', dueLabel: 'Due this year' } },
  { id: 'g3', status: 'pending', _display: { name: 'Mammogram', category: 'cancer-screening', priority: 'important', dueLabel: 'Scheduled' } },
  { id: 'g4', status: 'closed', _display: { name: 'Flu Vaccine', category: 'immunization', priority: 'routine', dueLabel: 'Completed' } },
];

const meta: Meta<typeof CareGapList> = {
  title: 'Clinical/CareGapList',
  component: CareGapList,
  tags: ['autodocs'],
  args: { onGapAction: fn(), onGapExclude: fn() },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { gaps: mockGaps } };
export const GroupedByStatus: Story = { args: { gaps: mockGaps, groupBy: 'status' } };
export const GroupedByCategory: Story = { args: { gaps: mockGaps, groupBy: 'category' } };
export const OpenOnly: Story = { args: { gaps: mockGaps.filter(g => g.status === 'open') } };
export const Empty: Story = { args: { gaps: [] } };
export const Compact: Story = { args: { gaps: mockGaps, compact: true } };
```

### 3. CREATE `src/stories/layout/AppShell.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { AppShell } from '../../components/layout/AppShell';
import { PatientHeader } from '../../components/layout/PatientHeader';
import { ModeSelector } from '../../components/layout/ModeSelector';
import { Minibar } from '../../components/ai-ui/Minibar';
import { PATIENT_TEMPLATES } from '../../mocks';

const meta: Meta<typeof AppShell> = {
  title: 'Layout/AppShell',
  component: AppShell,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    header: <PatientHeader patient={PATIENT_TEMPLATES.ucCough} />,
    main: <div style={{ padding: '1rem' }}>Main content area</div>,
    minibar: <Minibar transcriptionStatus="idle" pendingReviewCount={0} alertCount={0} syncStatus="synced" />,
  },
};

export const WithSidebar: Story = {
  args: {
    header: <PatientHeader patient={PATIENT_TEMPLATES.ucCough} />,
    sidebar: <div style={{ padding: '1rem', borderRight: '1px solid #E5E7EB' }}>Sidebar</div>,
    main: <div style={{ padding: '1rem' }}>Main content</div>,
    minibar: <Minibar transcriptionStatus="recording" pendingReviewCount={2} alertCount={0} syncStatus="synced" duration={156} />,
  },
};

export const FullExample: Story = {
  args: {
    header: (
      <>
        <PatientHeader patient={PATIENT_TEMPLATES.ucCough} encounter={{ id: 'e1', type: 'urgent-care', status: 'in-progress' }} careGapCount={3} />
        <ModeSelector currentMode="capture" onModeChange={() => {}} />
      </>
    ),
    main: <div style={{ padding: '1rem', height: '400px' }}>Chart items would appear here</div>,
    minibar: <Minibar transcriptionStatus="recording" pendingReviewCount={2} alertCount={1} syncStatus="synced" duration={342} />,
  },
};
```

### 4-6. Continue with PatientHeader, ModeSelector, SplitPane following same pattern

## Guidelines
- Show full-page layouts
- Include realistic header configurations
- Demonstrate sidebar variants
- Show mode transitions
```

---

## Chunk 5.8: Composite Pattern Stories

### Prompt

```
Create Storybook stories demonstrating complete workflow patterns.

## Requirements

### 1. CREATE `src/stories/patterns/CaptureFlow.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { PatientHeader } from '../../components/layout/PatientHeader';
import { ModeSelector } from '../../components/layout/ModeSelector';
import { ChartItemCard } from '../../components/chart-items/ChartItemCard';
import { OmniAddBar } from '../../components/omni-add/OmniAddBar';
import { Minibar } from '../../components/ai-ui/Minibar';
import { PATIENT_TEMPLATES, generateChartItem } from '../../mocks';

const CaptureFlowDemo: React.FC<{ step: string }> = ({ step }) => {
  const items = step === 'initial' ? [] : [
    generateChartItem('vitals'),
    ...(step !== 'vitals' ? [generateChartItem('chief-complaint', { displayText: 'Cough × 5 days' })] : []),
  ];

  const suggestions = step === 'suggestions' ? [
    { id: 's1', displayText: 'Acute bronchitis J20.9', confidence: 0.92 },
    { id: 's2', displayText: 'Benzonatate 100mg TID', confidence: 0.85 },
  ] : [];

  return (
    <AppShell
      header={
        <>
          <PatientHeader patient={PATIENT_TEMPLATES.ucCough} encounter={{ id: 'e1', type: 'urgent-care', status: 'in-progress' }} />
          <ModeSelector currentMode="capture" onModeChange={() => {}} />
        </>
      }
      main={
        <div style={{ padding: '1rem', paddingBottom: '8rem' }}>
          {items.map((item, i) => <ChartItemCard key={i} item={item} variant="compact" />)}
          <OmniAddBar activeSuggestions={suggestions} />
        </div>
      }
      minibar={<Minibar transcriptionStatus={step === 'initial' ? 'idle' : 'recording'} pendingReviewCount={0} alertCount={0} syncStatus="synced" duration={step === 'initial' ? 0 : 125} />}
    />
  );
};

const meta: Meta<typeof CaptureFlowDemo> = {
  title: 'Patterns/Capture Flow',
  component: CaptureFlowDemo,
  parameters: { layout: 'fullscreen' },
  argTypes: { step: { control: 'select', options: ['initial', 'vitals', 'suggestions', 'complete'] } },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Initial: Story = { args: { step: 'initial' } };
export const VitalsEntered: Story = { args: { step: 'vitals' } };
export const WithSuggestions: Story = { args: { step: 'suggestions' } };
export const Complete: Story = { args: { step: 'complete' } };
```

### 2. CREATE `src/stories/patterns/TaskReviewFlow.stories.tsx`

Task review flow showing Process mode with task pane.

### 3. CREATE `src/stories/patterns/CareGapWorkflow.stories.tsx`

Care gap workflow showing gap identification, action, and closure.

### 4. CREATE `src/stories/patterns/AIInteractionPatterns.stories.tsx`

AI interaction patterns demonstrating Minibar → Palette → Drawer.

## Guidelines
- Show realistic clinical workflows
- Demonstrate state transitions
- Include annotations explaining patterns
```

---

## Chunk 5.9: Documentation Pages

### Prompt

```
Create MDX documentation pages for Storybook.

## Requirements

### 1. CREATE `src/stories/docs/Introduction.mdx`

```mdx
import { Meta } from '@storybook/blocks';

<Meta title="Documentation/Introduction" />

# EHR Component Library

Welcome to the AI-Enhanced EHR Component Library documentation.

## Design Principles

1. **Capture Fast, Process Smart** — Optimized for quick data entry during encounters
2. **Right-Sized AI** — Progressive disclosure: Minibar → Palette → Drawer
3. **Clinical Context** — Visual indicators designed for clinical workflows
4. **Accessibility** — WCAG 2.1 AA compliance

## Component Categories

| Category | Description |
|----------|-------------|
| **Design Tokens** | Colors, typography, spacing, status indicators |
| **Primitives** | Button, Badge, Tag, Input, Card, Modal |
| **Chart Items** | MedicationCard, LabCard, DiagnosisCard, VitalsCard |
| **AI** | SuggestionChip, TaskCard, AlertCard, TaskPane |
| **Core** | OmniAddBar, Minibar, Palette |
| **Clinical** | CareGapCard, CareGapList |
| **Layout** | AppShell, PatientHeader, ModeSelector |
| **Patterns** | Complete workflow examples |
```

### 2. CREATE `src/stories/docs/AIPatterns.mdx`

AI interaction patterns documentation with visual examples.

### 3. CREATE `src/stories/docs/ClinicalStatus.mdx`

Clinical status indicators reference with color meanings.

### 4. CREATE `src/stories/docs/KeyboardShortcuts.mdx`

Keyboard shortcuts reference for all components.

### 5. CREATE `src/stories/docs/Accessibility.mdx`

Accessibility guidelines and compliance documentation.

## Guidelines
- Use MDX for rich documentation
- Include code examples
- Document clinical context
```

---

## Execution Order

Run these prompts in sequence:

1. **5.1 Installation & Config** → Set up Storybook infrastructure
2. **5.2 Design Token Stories** → Document visual language
3. **5.3 Primitive Stories** → Base component documentation
4. **5.4 Chart Item Stories** → Clinical card documentation
5. **5.5 Suggestion & Task Stories** → AI interaction documentation
6. **5.6 OmniAdd & AI UI Stories** → Core UI documentation
7. **5.7 Care Gap & Layout Stories** → Clinical and structural documentation
8. **5.8 Composite Pattern Stories** → Workflow examples
9. **5.9 Documentation Pages** → Usage guides and reference

---

## Running Storybook

```bash
# Development server
npm run storybook
# Opens at http://localhost:6006

# Build static site
npm run build-storybook
# Output: storybook-static/
```

---

## Storybook Structure

```
📁 Documentation/
  ├── Introduction
  ├── AI Patterns
  ├── Clinical Status
  ├── Keyboard Shortcuts
  └── Accessibility
📁 Design Tokens/
  ├── Colors
  ├── Typography
  ├── Spacing
  └── Status Indicators
📁 Primitives/
  ├── Button
  ├── Badge
  ├── Tag
  ├── Input
  ├── Select
  ├── Card
  ├── Modal
  ├── IconButton
  ├── Spinner
  └── Tooltip
📁 Chart Items/
  ├── ChartItemCard
  ├── MedicationCard
  ├── LabCard
  ├── DiagnosisCard
  ├── VitalsCard
  ├── PhysicalExamCard
  ├── NarrativeCard
  └── ImagingCard
📁 AI/
  ├── SuggestionChip
  ├── SuggestionCard
  ├── TaskCard
  ├── TaskList
  ├── TaskPane
  └── AlertCard
📁 Core/
  ├── OmniAddBar
  ├── CategorySelector
  ├── Minibar
  ├── Palette
  └── TranscriptionIndicator
📁 Clinical/
  ├── CareGapCard
  └── CareGapList
📁 Layout/
  ├── AppShell
  ├── PatientHeader
  ├── ModeSelector
  └── SplitPane
📁 Patterns/
  ├── Capture Flow
  ├── Task Review Flow
  ├── Care Gap Workflow
  └── AI Interaction Patterns
```

---

## Verification Checklist

After completing Phase 5:

- [ ] `npm run storybook` starts without errors
- [ ] All component categories appear in sidebar
- [ ] Autodocs generates for all components
- [ ] Controls work for all argTypes
- [ ] A11y addon runs without critical issues
- [ ] Theme/colors render correctly
- [ ] Pattern stories demonstrate realistic flows
- [ ] Documentation pages render correctly
- [ ] Keyboard navigation works in stories

---

## Related Documents

- [Phase 3: UI Components](./PHASE_3_PROMPTS.md) — Component implementations
- [Phase 4: Integration](./PHASE_4_PROMPTS.md) — Screen assembly
- [Design Tokens](./ui/DESIGN_TOKENS.md) — Token specifications
- [Component Library](./ui/COMPONENT_LIBRARY.md) — Component design specs
