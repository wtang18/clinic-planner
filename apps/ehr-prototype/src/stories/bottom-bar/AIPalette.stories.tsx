import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { AISurfaceModule } from '../../components/bottom-bar/ai';
import type { Suggestion } from '../../types/suggestions';

// ============================================================================
// Meta
// ============================================================================

const meta: Meta<typeof AISurfaceModule> = {
  title: 'Bottom Bar/AI Palette',
  component: AISurfaceModule,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 400, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AISurfaceModule>;

// ============================================================================
// Mock Data Helpers
// ============================================================================

const createSuggestion = (
  overrides: Partial<Suggestion> & { id: string; displayText: string }
): Suggestion => ({
  type: 'chart-item',
  status: 'active',
  confidence: 0.85,
  source: 'ai-analysis',
  content: {
    type: 'new-item',
    category: 'lab',
    itemTemplate: {},
  },
  createdAt: new Date(),
  ...overrides,
});

// ============================================================================
// Stories - Empty States
// ============================================================================

/**
 * Empty state with just the input area.
 * Palette height hugs content - should be minimal.
 */
export const EmptyState: Story = {
  args: {
    tier: 'palette',
    content: { type: 'idle' },
    patientName: 'John Smith',
    suggestions: [],
  },
};

/**
 * Empty state with quick actions available.
 */
export const QuickActionsOnly: Story = {
  args: {
    tier: 'palette',
    content: { type: 'idle' },
    patientName: 'Maria Garcia',
    suggestions: [],
    onGenerateNote: () => console.log('Generate note'),
    onCheckInteractions: () => console.log('Check interactions'),
  },
};

// ============================================================================
// Stories - Suggestions
// ============================================================================

/**
 * Single suggestion displayed.
 * Height should be minimal - just header + suggestion row + input.
 */
export const OneSuggestion: Story = {
  args: {
    tier: 'palette',
    content: { type: 'suggestion', id: 'sug-001', text: '1 suggestion' },
    patientName: 'Robert Chen',
    suggestions: [
      createSuggestion({
        id: 'sug-001',
        type: 'dx-association',
        displayText: 'Link Metformin to Type 2 Diabetes diagnosis',
      }),
    ],
    onSuggestionAccept: (id) => console.log('Accept:', id),
    onSuggestionDismiss: (id) => console.log('Dismiss:', id),
  },
};

/**
 * Multiple suggestions - shows first one with +N indicator.
 */
export const MultipleSuggestions: Story = {
  args: {
    tier: 'palette',
    content: { type: 'suggestion', id: 'sug-001', text: '3 suggestions' },
    patientName: 'Emily Watson',
    suggestions: [
      createSuggestion({
        id: 'sug-001',
        type: 'correction',
        displayText: 'Update dosage for Lisinopril',
      }),
      createSuggestion({
        id: 'sug-002',
        type: 'follow-up',
        displayText: 'Schedule follow-up in 2 weeks',
      }),
      createSuggestion({
        id: 'sug-003',
        type: 'dx-association',
        displayText: 'Add hypertension to problem list',
      }),
    ],
    onSuggestionAccept: (id) => console.log('Accept:', id),
    onSuggestionDismiss: (id) => console.log('Dismiss:', id),
  },
};

// ============================================================================
// Stories - Suggested Actions (with section header)
// ============================================================================

/**
 * Suggested Actions with section header.
 * Uses definitive short labels (actionLabel) like "CBC" instead of verbose text.
 */
export const SuggestedActions: Story = {
  args: {
    tier: 'palette',
    content: { type: 'suggestion', id: 'action-001', text: '3 suggested actions' },
    patientName: 'David Kim',
    suggestions: [
      createSuggestion({
        id: 'action-001',
        type: 'chart-item',
        displayText: 'Order CBC with differential for fatigue workup',
        actionLabel: 'CBC with Differential',
        content: {
          type: 'new-item',
          category: 'lab',
          itemTemplate: { displayText: 'CBC with differential' },
        },
      }),
      createSuggestion({
        id: 'action-002',
        type: 'chart-item',
        displayText: 'Order Basic Metabolic Panel',
        actionLabel: 'BMP',
        content: {
          type: 'new-item',
          category: 'lab',
          itemTemplate: { displayText: 'Basic Metabolic Panel' },
        },
      }),
      createSuggestion({
        id: 'action-003',
        type: 'chart-item',
        displayText: 'Order Lipid Panel for cardiovascular assessment',
        actionLabel: 'Lipid Panel',
        content: {
          type: 'new-item',
          category: 'lab',
          itemTemplate: { displayText: 'Lipid Panel' },
        },
      }),
    ],
    onSuggestionAccept: (id) => console.log('Accept:', id),
    onSuggestionDismiss: (id) => console.log('Dismiss:', id),
  },
};

/**
 * Mixed content: action suggestions and other suggestions.
 * Actions get section header, others don't.
 */
export const MixedSuggestions: Story = {
  args: {
    tier: 'palette',
    content: { type: 'suggestion', id: 'mixed-001', text: '3 suggestions' },
    patientName: 'Sarah Thompson',
    suggestions: [
      // Action suggestion (gets header)
      createSuggestion({
        id: 'action-001',
        type: 'chart-item',
        displayText: 'Order A1C for diabetes monitoring',
        actionLabel: 'Hemoglobin A1C',
        content: {
          type: 'new-item',
          category: 'lab',
          itemTemplate: {},
        },
      }),
      // Non-action suggestion (no header)
      createSuggestion({
        id: 'sug-001',
        type: 'dx-association',
        displayText: 'Link medication to diabetes diagnosis',
      }),
      createSuggestion({
        id: 'sug-002',
        type: 'correction',
        displayText: 'Update last A1C result date',
      }),
    ],
    onSuggestionAccept: (id) => console.log('Accept:', id),
    onSuggestionDismiss: (id) => console.log('Dismiss:', id),
  },
};

/**
 * Care gap actions.
 */
export const CareGapActions: Story = {
  args: {
    tier: 'palette',
    content: { type: 'care-gap', id: 'cg-001', text: '2 care gaps' },
    patientName: 'Michael Brown',
    suggestions: [
      createSuggestion({
        id: 'gap-001',
        type: 'care-gap-action',
        displayText: 'Schedule mammogram (overdue)',
        actionLabel: 'Mammogram',
        source: 'care-gap',
        content: {
          type: 'care-gap-action',
          careGapId: 'cg-001',
          actionTemplate: {},
        },
      }),
      createSuggestion({
        id: 'gap-002',
        type: 'care-gap-action',
        displayText: 'Order colonoscopy screening',
        actionLabel: 'Colonoscopy',
        source: 'care-gap',
        content: {
          type: 'care-gap-action',
          careGapId: 'cg-002',
          actionTemplate: {},
        },
      }),
    ],
    onSuggestionAccept: (id) => console.log('Accept:', id),
    onSuggestionDismiss: (id) => console.log('Dismiss:', id),
  },
};

// ============================================================================
// Stories - Context Targeting
// ============================================================================

/**
 * With context target - scoped to specific item.
 * Shows ↳ icon + patient name + context label.
 */
export const WithContextTarget: Story = {
  args: {
    tier: 'palette',
    content: { type: 'idle' },
    patientName: 'Jennifer Lee',
    contextTarget: {
      type: 'item',
      label: 'Lisinopril 10mg',
    },
    onClearContext: () => console.log('Clear context'),
    onGenerateNote: () => console.log('Generate note'),
  },
};

/**
 * Context targeting a section.
 */
export const ContextTargetSection: Story = {
  args: {
    tier: 'palette',
    content: { type: 'idle' },
    patientName: 'William Taylor',
    contextTarget: {
      type: 'section',
      label: 'Medications',
    },
    suggestions: [
      createSuggestion({
        id: 'sug-001',
        displayText: 'Review medication interactions',
      }),
    ],
    onClearContext: () => console.log('Clear context'),
    onSuggestionAccept: (id) => console.log('Accept:', id),
    onSuggestionDismiss: (id) => console.log('Dismiss:', id),
  },
};

/**
 * Encounter-level context (default).
 */
export const ContextTargetEncounter: Story = {
  args: {
    tier: 'palette',
    content: { type: 'idle' },
    patientName: 'Amanda Martinez',
    contextTarget: {
      type: 'encounter',
      label: 'Current Visit',
    },
    onClearContext: () => console.log('Clear context'),
    onGenerateNote: () => console.log('Generate note'),
    onCheckInteractions: () => console.log('Check interactions'),
  },
};

// ============================================================================
// Stories - Tier States
// ============================================================================

/**
 * Minibar state (collapsed).
 */
export const MinibarState: Story = {
  args: {
    tier: 'bar',
    content: {
      type: 'suggestion',
      id: 'sug-001',
      text: '3 suggestions',
    },
    patientName: 'Test Patient',
  },
};

/**
 * Mini anchor (most collapsed).
 */
export const MiniAnchorState: Story = {
  args: {
    tier: 'anchor',
    content: { type: 'idle' },
    patientName: 'Test Patient',
    badgeCount: 5,
  },
};
