/**
 * Card Component Stories - React Native
 * Storybook documentation for Card component
 */

import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Card, CardProps } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Design System/Components/Card',
  component: Card,
  argTypes: {
    // Core props
    variant: {
      control: 'select',
      options: ['interactive', 'non-interactive'],
      description: 'Card interaction type',
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
      description: 'Card size',
    },

    // State props
    disabled: {
      control: 'boolean',
      description: 'Disabled state (interactive only)',
    },

    // Interaction props
    onPress: {
      action: 'pressed',
      description: 'Press handler (interactive only)',
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
    variant: 'non-interactive',
    size: 'medium',
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<typeof Card>;

/**
 * Complete documentation for the Card component
 */
export const Documentation: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {/* Header */}
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8 }}>
        Card Component
      </Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
        Production-ready container component with interactive and non-interactive variants, matching the web design system API.
      </Text>

      {/* Quick Reference */}
      <View style={{ backgroundColor: '#F9FAFB', padding: 16, borderRadius: 8, marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Quick Reference
        </Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Variants:</Text> 2 (interactive, non-interactive)</Text>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Sizes:</Text> 2 (small, medium)</Text>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>States:</Text> default, pressed, disabled</Text>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Platform:</Text> React Native with TouchableOpacity</Text>
        </View>
      </View>

      {/* Features */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Features
        </Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}>✅ Two distinct variants: interactive (clickable) and non-interactive (static)</Text>
          <Text style={{ fontSize: 14 }}>✅ Automatic elevation changes on press for interactive cards</Text>
          <Text style={{ fontSize: 14 }}>✅ Disabled state with 50% opacity</Text>
          <Text style={{ fontSize: 14 }}>✅ Design token integration for consistent spacing, radius, and colors</Text>
          <Text style={{ fontSize: 14 }}>✅ Full accessibility support with proper roles and states</Text>
        </View>
      </View>

      {/* Variants */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Card Variants
        </Text>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
            Interactive
          </Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
            Clickable cards with shadow effects. Use for navigation, selection, or any actionable item.
          </Text>
          <Card variant="interactive" size="medium" onPress={() => {}}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>Clickable Card</Text>
            <Text style={{ fontSize: 14, color: '#666' }}>Press to trigger an action</Text>
          </Card>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
            Non-Interactive
          </Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
            Static container for displaying content. No shadows or press handlers.
          </Text>
          <Card variant="non-interactive" size="medium">
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>Static Card</Text>
            <Text style={{ fontSize: 14, color: '#666' }}>For displaying content only</Text>
          </Card>
        </View>
      </View>

      {/* Sizes */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Card Sizes
        </Text>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
            Small (8px radius, 12px padding)
          </Text>
          <Card size="small" variant="non-interactive">
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 4 }}>Small Card</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>Compact card for dense layouts</Text>
          </Card>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
            Medium (16px radius, 16px padding) - Default
          </Text>
          <Card size="medium" variant="non-interactive">
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Medium Card</Text>
            <Text style={{ fontSize: 14, color: '#666' }}>Default card size for most use cases</Text>
          </Card>
        </View>
      </View>

      {/* Elevation System */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Elevation System
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
          Interactive cards use elevation tokens to create depth:
        </Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>Default:</Text> elevation-sm (0px 1.5px 6px rgba(0,0,0,0.12))</Text>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>Pressed:</Text> elevation-md (0px 3px 12px rgba(0,0,0,0.16))</Text>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>Non-interactive:</Text> No shadow</Text>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>Disabled:</Text> No shadow, 50% opacity</Text>
        </View>
      </View>

      {/* Accessibility */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Accessibility
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
          Card follows WCAG 2.1 Level AA guidelines:
        </Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}>✅ Minimum touch target size (44x44) for interactive cards</Text>
          <Text style={{ fontSize: 14 }}>✅ Proper accessibilityRole="button" for interactive variant</Text>
          <Text style={{ fontSize: 14 }}>✅ accessibilityState announces disabled state</Text>
          <Text style={{ fontSize: 14 }}>✅ Visual feedback (shadow changes) on press</Text>
          <Text style={{ fontSize: 14 }}>✅ Non-interactive cards use semantic View without button role</Text>
        </View>
      </View>

      {/* Best Practices */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Best Practices
        </Text>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#059669' }}>
            ✅ Do
          </Text>
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 14 }}>• Use interactive variant for clickable/navigational cards</Text>
            <Text style={{ fontSize: 14 }}>• Use non-interactive variant for static content displays</Text>
            <Text style={{ fontSize: 14 }}>• Provide accessibilityLabel for interactive cards describing the action</Text>
            <Text style={{ fontSize: 14 }}>• Use small size for list items, medium for feature cards</Text>
            <Text style={{ fontSize: 14 }}>• Keep card content simple and scannable</Text>
          </View>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#DC2626' }}>
            ❌ Don't
          </Text>
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 14 }}>• Don't use interactive variant if there's no onPress handler</Text>
            <Text style={{ fontSize: 14 }}>• Don't nest interactive cards (creates confusing UX)</Text>
            <Text style={{ fontSize: 14 }}>• Don't override elevation styles manually</Text>
            <Text style={{ fontSize: 14 }}>• Don't forget to handle disabled state for unavailable actions</Text>
            <Text style={{ fontSize: 14 }}>• Don't put too much content in a single card</Text>
          </View>
        </View>
      </View>

      {/* Usage Examples */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Usage Examples
        </Text>

        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, gap: 16 }}>
          <View>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937', marginBottom: 8 }}>
              {`// Interactive list item\n<Card variant="interactive" size="small"\n  onPress={() => navigate('/details')}>\n  <Text>Appointment Details</Text>\n</Card>`}
            </Text>
            <Card variant="interactive" size="small" onPress={() => {}}>
              <Text style={{ fontSize: 14, fontWeight: '600' }}>Appointment Details</Text>
            </Card>
          </View>

          <View>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937', marginBottom: 8 }}>
              {`// Dashboard stat card\n<Card variant="non-interactive" size="medium">\n  <Text style={{ fontSize: 24 }}>127</Text>\n  <Text>Total Events</Text>\n</Card>`}
            </Text>
            <Card variant="non-interactive" size="medium">
              <Text style={{ fontSize: 24, fontWeight: '700' }}>127</Text>
              <Text style={{ fontSize: 12, color: '#666' }}>Total Events</Text>
            </Card>
          </View>

          <View>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937', marginBottom: 8 }}>
              {`// Disabled card\n<Card variant="interactive" disabled\n  accessibilityLabel="Premium feature">\n  <Text>Premium Feature</Text>\n</Card>`}
            </Text>
            <Card variant="interactive" disabled accessibilityLabel="Premium feature">
              <Text style={{ fontSize: 14, fontWeight: '600' }}>Premium Feature</Text>
              <Text style={{ fontSize: 12, color: '#666' }}>Requires upgrade</Text>
            </Card>
          </View>
        </View>
      </View>

      {/* Platform Differences */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Platform Differences
        </Text>
        <View style={{ backgroundColor: '#FEF3C7', padding: 12, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#F59E0B' }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#92400E', marginBottom: 8 }}>
            React Native vs Web
          </Text>
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 13, color: '#92400E' }}>
              • RN uses TouchableOpacity for interactive cards, web uses button/div with hover states
            </Text>
            <Text style={{ fontSize: 13, color: '#92400E' }}>
              • RN elevation uses shadowOffset/shadowOpacity, web uses box-shadow CSS
            </Text>
            <Text style={{ fontSize: 13, color: '#92400E' }}>
              • Press feedback is instant on RN (onPressIn), delayed on web (hover)
            </Text>
            <Text style={{ fontSize: 13, color: '#92400E' }}>
              • Both share identical API props for consistency
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  ),
};

/**
 * Interactive playground for testing all Card props
 */
export const Playground: Story = {
  render: (args) => (
    <View style={{ padding: 16 }}>
      <Card {...args}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
          Card Title
        </Text>
        <Text style={{ fontSize: 14, color: '#666' }}>
          This is card content. Adjust props in the controls panel to see changes.
        </Text>
      </Card>
    </View>
  ),
  args: {
    variant: 'interactive',
    size: 'medium',
  },
};

/**
 * All card variants displayed side by side
 */
export const AllVariants: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={{ gap: 16 }}>
        {/* Non-Interactive */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
            Non-Interactive (Static Container)
          </Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
            No shadow, no press handlers. Use for display content.
          </Text>
          <Card variant="non-interactive" size="medium">
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
              Static Card
            </Text>
            <Text style={{ fontSize: 14, color: '#666' }}>
              This card is for displaying content without interaction.
            </Text>
          </Card>
        </View>

        {/* Interactive */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
            Interactive (Clickable/Pressable)
          </Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
            Includes shadow that changes on press. Use for actionable items.
          </Text>
          <Card
            variant="interactive"
            size="medium"
            onPress={() => console.log('Card pressed')}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
              Clickable Card
            </Text>
            <Text style={{ fontSize: 14, color: '#666' }}>
              Press this card to trigger an action.
            </Text>
          </Card>
        </View>

        {/* Interactive Disabled */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
            Interactive Disabled
          </Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
            50% opacity, no shadow, no press handler.
          </Text>
          <Card
            variant="interactive"
            size="medium"
            disabled
            onPress={() => console.log('Should not fire')}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
              Disabled Card
            </Text>
            <Text style={{ fontSize: 14, color: '#666' }}>
              This card cannot be pressed.
            </Text>
          </Card>
        </View>
      </View>
    </ScrollView>
  ),
};

/**
 * All card sizes for comparison
 */
export const AllSizes: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={{ gap: 16 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 12, color: '#666' }}>
            Small (8px radius, 12px padding, 8px gap)
          </Text>
          <Card size="small" variant="non-interactive">
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 4 }}>
              Small Card
            </Text>
            <Text style={{ fontSize: 12, color: '#666' }}>
              Compact card for dense layouts or list items.
            </Text>
          </Card>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 12, color: '#666' }}>
            Medium (16px radius, 16px padding, 16px gap) - Default
          </Text>
          <Card size="medium" variant="non-interactive">
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
              Medium Card
            </Text>
            <Text style={{ fontSize: 14, color: '#666' }}>
              Default card size for most use cases. Provides comfortable spacing for
              content.
            </Text>
          </Card>
        </View>
      </View>
    </ScrollView>
  ),
};

/**
 * Card states: default, pressed, disabled
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
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
            Interactive cards show small elevation (sm) by default.
          </Text>
          <Card variant="interactive" onPress={() => console.log('Pressed')}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
              Default Interactive Card
            </Text>
            <Text style={{ fontSize: 14, color: '#666' }}>
              elevation-sm (0px 1.5px 6px rgba(0,0,0,0.12))
            </Text>
          </Card>
        </View>

        {/* Pressed State */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
            Pressed State
          </Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
            When pressed, elevation increases to medium (md).
          </Text>
          <Card variant="interactive" onPress={() => console.log('Pressed')}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
              Press This Card
            </Text>
            <Text style={{ fontSize: 14, color: '#666' }}>
              Notice the shadow changes when you press and hold.
            </Text>
          </Card>
        </View>

        {/* Disabled State */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
            Disabled State
          </Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
            50% opacity, no shadow, cannot be pressed.
          </Text>
          <Card variant="interactive" disabled>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
              Disabled Interactive Card
            </Text>
            <Text style={{ fontSize: 14, color: '#666' }}>
              This card is disabled and cannot be interacted with.
            </Text>
          </Card>
        </View>

        {/* Non-Interactive (No Shadow) */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
            Non-Interactive (No Shadow)
          </Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
            Static cards never show shadows.
          </Text>
          <Card variant="non-interactive">
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
              Static Display Card
            </Text>
            <Text style={{ fontSize: 14, color: '#666' }}>
              Used for displaying content without interaction.
            </Text>
          </Card>
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
        {/* List Item Cards */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
            List Item Cards (Interactive)
          </Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
            Common pattern for selectable items in a list.
          </Text>
          <View style={{ gap: 8 }}>
            <Card
              variant="interactive"
              size="small"
              onPress={() => console.log('Item 1')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#e3f2fd',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 16 }}>📅</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600' }}>
                    Team Meeting
                  </Text>
                  <Text style={{ fontSize: 12, color: '#666' }}>
                    Today at 2:00 PM
                  </Text>
                </View>
              </View>
            </Card>

            <Card
              variant="interactive"
              size="small"
              onPress={() => console.log('Item 2')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#fce4ec',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 16 }}>📄</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600' }}>
                    Project Review
                  </Text>
                  <Text style={{ fontSize: 12, color: '#666' }}>
                    Tomorrow at 10:00 AM
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        </View>

        {/* Dashboard Cards */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
            Dashboard Cards (Non-Interactive)
          </Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
            Static information displays.
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Card variant="non-interactive" size="medium">
                <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 4 }}>
                  127
                </Text>
                <Text style={{ fontSize: 12, color: '#666' }}>Total Events</Text>
              </Card>
            </View>
            <View style={{ flex: 1 }}>
              <Card variant="non-interactive" size="medium">
                <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 4 }}>
                  43
                </Text>
                <Text style={{ fontSize: 12, color: '#666' }}>This Month</Text>
              </Card>
            </View>
          </View>
        </View>

        {/* Settings Cards */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
            Settings Cards (Interactive)
          </Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
            Navigational cards for settings pages.
          </Text>
          <View style={{ gap: 8 }}>
            <Card
              variant="interactive"
              size="medium"
              onPress={() => console.log('Account settings')}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                Account Settings
              </Text>
              <Text style={{ fontSize: 14, color: '#666' }}>
                Manage your profile and preferences
              </Text>
            </Card>
            <Card
              variant="interactive"
              size="medium"
              onPress={() => console.log('Notifications')}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                Notifications
              </Text>
              <Text style={{ fontSize: 14, color: '#666' }}>
                Configure notification preferences
              </Text>
            </Card>
          </View>
        </View>

        {/* Content Container */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
            Content Container (Non-Interactive)
          </Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
            Complex content layout in a card.
          </Text>
          <Card variant="non-interactive" size="medium">
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
              Clinic Open House
            </Text>
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
              Join us for a day of learning about our services and meeting our team.
              Free consultations available!
            </Text>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View>
                <Text style={{ fontSize: 12, color: '#888' }}>Date</Text>
                <Text style={{ fontSize: 14, fontWeight: '600' }}>Mar 15, 2025</Text>
              </View>
              <View>
                <Text style={{ fontSize: 12, color: '#888' }}>Time</Text>
                <Text style={{ fontSize: 14, fontWeight: '600' }}>10:00 AM</Text>
              </View>
              <View>
                <Text style={{ fontSize: 12, color: '#888' }}>Location</Text>
                <Text style={{ fontSize: 14, fontWeight: '600' }}>Main Clinic</Text>
              </View>
            </View>
          </Card>
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
            Card follows WCAG 2.1 Level AA guidelines.
          </Text>
        </View>

        <View style={{ gap: 12 }}>
          <Text style={{ fontSize: 14, color: '#333' }}>
            ✓ Touch target size: 44x44 minimum for interactive cards
          </Text>
          <Text style={{ fontSize: 14, color: '#333' }}>
            ✓ Screen reader support with proper accessibilityRole
          </Text>
          <Text style={{ fontSize: 14, color: '#333' }}>
            ✓ Disabled state properly announced
          </Text>
          <Text style={{ fontSize: 14, color: '#333' }}>
            ✓ Press feedback with visual shadow changes
          </Text>
          <Text style={{ fontSize: 14, color: '#333' }}>
            ✓ Non-interactive cards use proper semantics
          </Text>
        </View>

        {/* Accessible Examples */}
        <View style={{ gap: 12, marginTop: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>
            Accessible Card Examples
          </Text>

          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
              ✓ Interactive card with descriptive label
            </Text>
            <Card
              variant="interactive"
              onPress={() => console.log('Navigate')}
              accessibilityLabel="Navigate to account settings"
              accessibilityHint="Double tap to open account settings page"
            >
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                Account Settings
              </Text>
              <Text style={{ fontSize: 14, color: '#666' }}>
                Manage your profile and preferences
              </Text>
            </Card>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
              ✓ Disabled with state announced
            </Text>
            <Card
              variant="interactive"
              disabled
              accessibilityLabel="Premium feature - requires upgrade"
              accessibilityHint="This feature is currently unavailable"
            >
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                Premium Features
              </Text>
              <Text style={{ fontSize: 14, color: '#666' }}>
                Upgrade to unlock advanced features
              </Text>
            </Card>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
              ✓ Non-interactive card with proper semantics
            </Text>
            <Card
              variant="non-interactive"
              accessibilityLabel="Statistics summary"
            >
              <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 4 }}>
                1,234
              </Text>
              <Text style={{ fontSize: 12, color: '#666' }}>Total Users</Text>
            </Card>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
              ❌ No accessibility label for interactive card
            </Text>
            <Card variant="interactive" onPress={() => {}}>
              <Text style={{ fontSize: 16, fontWeight: '600' }}>?</Text>
            </Card>
          </View>
        </View>
      </View>
    </ScrollView>
  ),
};
