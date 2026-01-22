/**
 * Button Component Stories - React Native
 * Storybook documentation for Button component
 */

import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Button, ButtonProps } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Design System/Components/Button',
  component: Button,
  argTypes: {
    // Core props
    type: {
      control: 'select',
      options: [
        'primary',
        'outlined',
        'solid',
        'transparent',
        'generative',
        'high-impact',
        'no-fill',
        'subtle',
        'carby',
      ],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['x-small', 'small', 'medium', 'large', 'large-floating'],
      description: 'Button size',
    },
    iconOnly: {
      control: 'boolean',
      description: 'Display as icon-only button',
    },

    // Icon props
    iconL: {
      control: 'text',
      description: 'Left icon name from icon library (e.g., "star", "arrow-left")',
    },
    iconR: {
      control: 'text',
      description: 'Right icon name from icon library (e.g., "chevron-right")',
    },

    // Content props
    label: {
      control: 'text',
      description: 'Button text label',
    },
    subtext: {
      control: 'text',
      description: 'Secondary text shown next to label',
    },
    showSubtext: {
      control: 'boolean',
      description: 'Toggle subtext visibility',
    },

    // State props
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },

    // Interaction props
    onPress: {
      action: 'pressed',
      description: 'Press handler',
    },

    // Accessibility props
    accessibilityLabel: {
      control: 'text',
      description: 'Accessibility label',
    },
    accessibilityHint: {
      control: 'text',
      description: 'Accessibility hint',
    },
  },
  args: {
    type: 'primary',
    size: 'small',
    label: 'Label',
    disabled: false,
    iconOnly: false,
    showSubtext: false,
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

/**
 * Complete documentation for the Button component
 */
export const Documentation: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {/* Header */}
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8 }}>
        Button Component
      </Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
        Production-ready button component with 9 variants, 5 sizes, icon support, and comprehensive accessibility features matching the web design system.
      </Text>

      {/* Quick Reference */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Quick Reference
        </Text>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, gap: 8 }}>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Types:</Text> 9 variants (primary, outlined, solid, transparent, generative, high-impact, no-fill, subtle, carby)</Text>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Sizes:</Text> 5 sizes (24px to 56px)</Text>
          <Text style={{ fontSize: '14' }}><Text style={{ fontWeight: '600' }}>Features:</Text> Icons, subtext, disabled state, full accessibility</Text>
        </View>
      </View>

      {/* Features */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Features
        </Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}>✅ <Text style={{ fontWeight: '600' }}>9 Button Types:</Text> Semantic variants for all use cases</Text>
          <Text style={{ fontSize: 14 }}>✅ <Text style={{ fontWeight: '600' }}>5 Sizes:</Text> From x-small (24px) to large-floating (56px)</Text>
          <Text style={{ fontSize: 14 }}>✅ <Text style={{ fontWeight: '600' }}>Icon Support:</Text> Left and right icons with auto-sizing</Text>
          <Text style={{ fontSize: 14 }}>✅ <Text style={{ fontWeight: '600' }}>Bicolor Icons:</Text> Semantic two-color icon support</Text>
          <Text style={{ fontSize: 14 }}>✅ <Text style={{ fontWeight: '600' }}>Subtext:</Text> Optional secondary text (e.g., keyboard shortcuts)</Text>
          <Text style={{ fontSize: 14 }}>✅ <Text style={{ fontWeight: '600' }}>Accessibility:</Text> WCAG AA compliant with proper ARIA attributes</Text>
        </View>
      </View>

      {/* Button Types */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Button Types
        </Text>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, gap: 10 }}>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '600' }}>Primary Actions</Text>
            <Text style={{ fontSize: 13, color: '#666' }}>primary, outlined, solid, transparent</Text>
          </View>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '600' }}>Semantic Types</Text>
            <Text style={{ fontSize: 13, color: '#666' }}>generative (AI actions), high-impact (destructive), carby</Text>
          </View>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '600' }}>Subtle Variants</Text>
            <Text style={{ fontSize: 13, color: '#666' }}>subtle, no-fill</Text>
          </View>
        </View>
      </View>

      {/* Button Sizes */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Button Sizes
        </Text>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, gap: 8 }}>
          <Text style={{ fontSize: 13 }}><Text style={{ fontWeight: '600' }}>x-small:</Text> 24px height, 20px icons</Text>
          <Text style={{ fontSize: 13 }}><Text style={{ fontWeight: '600' }}>small:</Text> 32px height, 20px icons</Text>
          <Text style={{ fontSize: 13 }}><Text style={{ fontWeight: '600' }}>medium:</Text> 40px height, 20px icons</Text>
          <Text style={{ fontSize: 13 }}><Text style={{ fontWeight: '600' }}>large:</Text> 56px height, 24px icons</Text>
          <Text style={{ fontSize: 13 }}><Text style={{ fontWeight: '600' }}>large-floating:</Text> 56px height, 24px icons + elevation</Text>
        </View>
      </View>

      {/* Icon System */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Icon System
        </Text>
        <Text style={{ fontSize: 14, marginBottom: 12 }}>
          Buttons support left and right icons from the 386-icon library, including bicolor icons for semantic status. Icons automatically size based on button size.
        </Text>

        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, gap: 12, marginBottom: 12 }}>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 4 }}>Icon Sizing</Text>
            <Text style={{ fontSize: 13, color: '#666' }}>• x-small, small, medium: 20px icons (small)</Text>
            <Text style={{ fontSize: 13, color: '#666' }}>• large, large-floating: 24px icons (medium)</Text>
          </View>

          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 4 }}>Available Icons</Text>
            <Text style={{ fontSize: 13, color: '#666' }}>Browse the Icon and BicolorIcon stories to see all 386 available icons</Text>
          </View>
        </View>

        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, gap: 16 }}>
          <View>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937', marginBottom: 8 }}>
              {`// Left icon\n<Button iconL="star" label="Favorite" />`}
            </Text>
            <Button iconL="star" label="Favorite" size="small" />
          </View>

          <View>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937', marginBottom: 8 }}>
              {`// Right icon\n<Button iconR="chevron-right" label="Next" />`}
            </Text>
            <Button iconR="chevron-right" label="Next" size="small" />
          </View>

          <View>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937', marginBottom: 8 }}>
              {`// Both icons\n<Button iconL="arrow-left" iconR="arrow-right" label="Navigate" />`}
            </Text>
            <Button iconL="arrow-left" iconR="arrow-right" label="Navigate" size="small" />
          </View>

          <View>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937', marginBottom: 8 }}>
              {`// Icon-only button\n<Button iconL="trash" label="Delete" iconOnly />`}
            </Text>
            <Button iconL="trash" label="Delete" iconOnly size="small" />
          </View>
        </View>
      </View>

      {/* Subtext Feature */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Subtext
        </Text>
        <Text style={{ fontSize: 14, marginBottom: 12 }}>
          Display secondary inline text next to the label (e.g., keyboard shortcuts, file formats).
        </Text>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8 }}>
          <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937' }}>
            {`<Button\n  label="Save"\n  subtext="⌘S"\n  showSubtext\n/>`}
          </Text>
        </View>
      </View>

      {/* Accessibility */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Accessibility
        </Text>
        <Text style={{ fontSize: 14, marginBottom: 12 }}>
          All Button components follow WCAG 2.1 Level AA guidelines.
        </Text>

        <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 12, marginBottom: 8 }}>
          Touch Targets
        </Text>
        <View style={{ gap: 6, marginBottom: 12 }}>
          <Text style={{ fontSize: 14 }}>• Minimum 44×44px for medium+ sizes</Text>
          <Text style={{ fontSize: 14 }}>• All sizes meet React Native touch requirements</Text>
        </View>

        <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 12, marginBottom: 8 }}>
          Screen Reader Support
        </Text>
        <View style={{ gap: 6, marginBottom: 12 }}>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>accessibilityRole:</Text> "button" (automatic)</Text>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>accessibilityLabel:</Text> Custom descriptive label</Text>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>accessibilityHint:</Text> Action description</Text>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>accessibilityState:</Text> Disabled state announced</Text>
        </View>

        <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 12, marginBottom: 8 }}>
          Color Contrast
        </Text>
        <Text style={{ fontSize: 14 }}>All button variants meet WCAG AA contrast requirements (4.5:1 for text, 3:1 for UI components).</Text>
      </View>

      {/* Best Practices */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Best Practices
        </Text>

        <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 12, marginBottom: 8 }}>
          ✅ Do
        </Text>
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14 }}>• Use primary for main call-to-action</Text>
          <Text style={{ fontSize: 14 }}>• Use high-impact only for destructive actions</Text>
          <Text style={{ fontSize: 14 }}>• Add accessibilityLabel for icon-only buttons</Text>
          <Text style={{ fontSize: 14 }}>• Match button size to context (small for toolbars, large for heroes)</Text>
          <Text style={{ fontSize: 14 }}>• Use generative type for AI-powered actions</Text>
        </View>

        <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 12, marginBottom: 8 }}>
          ❌ Don't
        </Text>
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14 }}>• Don't use multiple primary buttons in same context</Text>
          <Text style={{ fontSize: 14 }}>• Don't use high-impact for regular actions</Text>
          <Text style={{ fontSize: 14 }}>• Don't mix too many button types on one screen</Text>
          <Text style={{ fontSize: 14 }}>• Don't use x-small buttons for primary actions</Text>
        </View>
      </View>

      {/* Usage Examples */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Common Usage Examples
        </Text>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, gap: 16 }}>
          <View>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937', marginBottom: 8 }}>
              {`// Primary action\n<Button type="primary" label="Save Changes" />`}
            </Text>
            <Button type="primary" label="Save Changes" size="small" />
          </View>
          <View>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937', marginBottom: 8 }}>
              {`// Destructive action\n<Button type="high-impact" label="Delete" />`}
            </Text>
            <Button type="high-impact" label="Delete" size="small" />
          </View>
          <View>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937', marginBottom: 8 }}>
              {`// AI action\n<Button type="generative" label="Generate" />`}
            </Text>
            <Button type="generative" label="Generate" size="small" />
          </View>
        </View>
      </View>

      {/* Platform Differences */}
      <View style={{ marginBottom: 24, backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
          React Native vs Web
        </Text>
        <Text style={{ fontSize: 14, color: '#1F2937', marginBottom: 8 }}>
          The Button API is nearly identical between React Native and web. Key differences:
        </Text>
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 13, color: '#1F2937' }}>• Events: <Text style={{ fontFamily: 'monospace' }}>onPress</Text> (RN) vs <Text style={{ fontFamily: 'monospace' }}>onClick</Text> (web)</Text>
          <Text style={{ fontSize: 13, color: '#1F2937' }}>• Accessibility: <Text style={{ fontFamily: 'monospace' }}>accessibilityLabel</Text> (RN) vs <Text style={{ fontFamily: 'monospace' }}>aria-label</Text> (web)</Text>
          <Text style={{ fontSize: 13, color: '#1F2937' }}>• Focus ring: No visual focus indicator in RN by default</Text>
        </View>
      </View>
    </ScrollView>
  ),
};

/**
 * Interactive playground for testing all Button props
 */
export const Playground: Story = {
  args: {
    type: 'primary',
    size: 'medium',
    label: 'Click Me',
  },
};

/**
 * All button types displayed side by side
 */
export const AllTypes: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={{ gap: 16 }}>
        {/* Primary Actions */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
            Primary Actions
          </Text>
          <View style={{ gap: 8 }}>
            <Button type="primary" label="Primary" />
            <Button type="outlined" label="Outlined" />
            <Button type="solid" label="Solid" />
            <Button type="transparent" label="Transparent" />
          </View>
        </View>

        {/* Semantic Types */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
            Semantic Types
          </Text>
          <View style={{ gap: 8 }}>
            <Button type="generative" label="Generative (AI)" />
            <Button type="high-impact" label="High Impact" />
            <Button type="carby" label="Carby" />
          </View>
        </View>

        {/* Subtle Variants */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
            Subtle Variants
          </Text>
          <View style={{ gap: 8 }}>
            <Button type="subtle" label="Subtle" />
            <Button type="no-fill" label="No Fill" />
          </View>
        </View>
      </View>
    </ScrollView>
  ),
};

/**
 * All button sizes for comparison
 */
export const AllSizes: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={{ gap: 16, alignItems: 'flex-start' }}>
        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 12, color: '#666' }}>X-Small (24px)</Text>
          <Button size="x-small" label="Extra Small" />
        </View>

        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 12, color: '#666' }}>Small (32px)</Text>
          <Button size="small" label="Small" />
        </View>

        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 12, color: '#666' }}>Medium (40px)</Text>
          <Button size="medium" label="Medium" />
        </View>

        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 12, color: '#666' }}>Large (56px)</Text>
          <Button size="large" label="Large" />
        </View>

        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 12, color: '#666' }}>
            Large Floating (56px + shadow)
          </Text>
          <Button size="large-floating" label="Large Floating" />
        </View>
      </View>
    </ScrollView>
  ),
};

/**
 * Button states: default, disabled
 */
export const States: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={{ gap: 16 }}>
        {/* Default State */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
            Default State
          </Text>
          <View style={{ gap: 8 }}>
            <Button type="primary" label="Primary" />
            <Button type="outlined" label="Outlined" />
            <Button type="generative" label="Generative" />
          </View>
        </View>

        {/* Disabled State */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
            Disabled State (50% opacity)
          </Text>
          <View style={{ gap: 8 }}>
            <Button type="primary" label="Primary" disabled />
            <Button type="outlined" label="Outlined" disabled />
            <Button type="generative" label="Generative" disabled />
          </View>
        </View>
      </View>
    </ScrollView>
  ),
};

/**
 * Buttons with subtext content
 */
export const WithSubtext: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={{ gap: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
          Buttons with Subtext
        </Text>

        <View style={{ gap: 8 }}>
          <Button
            type="primary"
            label="Save"
            subtext="⌘S"
            showSubtext
            size="medium"
          />
          <Button
            type="outlined"
            label="Export"
            subtext="PDF"
            showSubtext
            size="medium"
          />
          <Button
            type="generative"
            label="Generate"
            subtext="AI"
            showSubtext
            size="medium"
          />
        </View>
      </View>
    </ScrollView>
  ),
};

/**
 * Real-world usage examples
 */
export const RealWorldExamples: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={{ gap: 20 }}>
        {/* Form Actions */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
            Form Actions
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Button type="outlined" label="Cancel" size="medium" />
            </View>
            <View style={{ flex: 1 }}>
              <Button type="primary" label="Save" size="medium" />
            </View>
          </View>
        </View>

        {/* Toolbar Actions */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
            Toolbar Actions (with icons)
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button type="transparent" iconL="pencil" label="Edit" size="small" />
            <Button type="transparent" iconL="arrow-up" label="Share" size="small" />
            <Button type="transparent" iconL="trash" label="Delete" size="small" />
          </View>
        </View>

        {/* Destructive Action */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
            Destructive Action
          </Text>
          <Button
            type="high-impact"
            label="Delete Account"
            size="medium"
            onPress={() => console.log('Delete pressed')}
          />
        </View>

        {/* AI Action */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
            AI-Powered Action
          </Text>
          <Button
            type="generative"
            label="Generate with AI"
            size="medium"
            onPress={() => console.log('AI action')}
          />
        </View>

        {/* Floating Action */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
            Floating Action Button
          </Text>
          <View style={{ alignItems: 'center' }}>
            <Button
              type="primary"
              label="Create New"
              size="large-floating"
              onPress={() => console.log('FAB pressed')}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  ),
};

/**
 * Accessibility demonstration
 */
export const AccessibilityDemo: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View
        style={{
          backgroundColor: '#e3f2fd',
          padding: 16,
          borderRadius: 8,
          gap: 16,
        }}
      >
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>
            Accessibility Features
          </Text>
          <Text style={{ fontSize: 14, color: '#555', lineHeight: 20 }}>
            Button follows WCAG 2.1 Level AA guidelines.
          </Text>
        </View>

        <View style={{ gap: 12 }}>
          <Text style={{ fontSize: 14, color: '#333' }}>✓ Keyboard navigation support (React Native gesture handling)</Text>
          <Text style={{ fontSize: 14, color: '#333' }}>✓ Screen reader support with proper accessibilityRole</Text>
          <Text style={{ fontSize: 14, color: '#333' }}>✓ Disabled state properly announced</Text>
          <Text style={{ fontSize: 14, color: '#333' }}>✓ WCAG AA color contrast ratios</Text>
          <Text style={{ fontSize: 14, color: '#333' }}>✓ Touch target size: 44x44 minimum (medium+)</Text>
        </View>

        {/* Accessible Examples */}
        <View style={{ gap: 12, marginTop: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>
            Accessible Button Examples
          </Text>

          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
              ✓ With descriptive label
            </Text>
            <Button
              type="primary"
              label="Delete"
              accessibilityLabel="Delete this item"
              accessibilityHint="Double tap to permanently delete this item"
            />
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
              ✓ Disabled with state announced
            </Text>
            <Button
              type="outlined"
              label="Submit"
              disabled
              accessibilityLabel="Submit button - disabled"
              accessibilityHint="Complete the form to enable submission"
            />
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
              ❌ No accessibility label
            </Text>
            <Button type="transparent" label="?" />
          </View>
        </View>
      </View>
    </ScrollView>
  ),
};
