/**
 * Stack Component Stories - React Native
 * Storybook documentation for VStack and HStack layout components
 */

import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { VStack } from './VStack';
import { HStack } from './HStack';
import { Pill } from './Pill';
import { Card } from './Card';
import { Input } from './Input';

const meta: Meta = {
  title: 'Design System/Components/Stack',
  argTypes: {
    space: {
      control: 'select',
      options: ['none', 'coupled', 'repeating-sm', 'repeating', 'related-sm', 'related', 'separated-sm', 'separated'],
      description: 'Semantic spacing between children',
    },
  },
  args: {
    space: 'related',
  },
};

export default meta;

type Story = StoryObj;

/**
 * Complete documentation for VStack and HStack components
 */
export const Documentation: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {/* Header */}
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8 }}>
        Stack Components
      </Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
        Optional layout utilities for consistent semantic spacing. VStack arranges children vertically, HStack arranges horizontally.
      </Text>

      {/* Gap vs Stack Decision */}
      <View style={{ backgroundColor: '#FEF3C7', padding: 16, borderRadius: 8, marginBottom: 24, borderLeftWidth: 4, borderLeftColor: '#F59E0B' }}>
        <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 8, color: '#92400E' }}>
          Recommended: Use Gap First
        </Text>
        <Text style={{ fontSize: 14, color: '#92400E', marginBottom: 12 }}>
          With NativeWind v4 and React Native 0.71+, gap is natively supported. Use gap classes as your default:
        </Text>
        <View style={{ backgroundColor: '#FEF9C3', padding: 12, borderRadius: 6 }}>
          <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#713F12' }}>
            {`<View className="flex-col gap-4">\n  <Input label="Email" />\n  <Input label="Password" />\n</View>`}
          </Text>
        </View>
      </View>

      {/* Quick Reference */}
      <View style={{ backgroundColor: '#F9FAFB', padding: 16, borderRadius: 8, marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Quick Reference
        </Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Components:</Text> VStack (vertical), HStack (horizontal)</Text>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Spacing:</Text> 7 semantic values (coupled → separated)</Text>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>HStack extras:</Text> align (vertical), justify (horizontal)</Text>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Method:</Text> Margin-based (marginTop/marginLeft)</Text>
        </View>
      </View>

      {/* When to Use Stack */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          When to Use Stack vs Gap
        </Text>
        <View style={{ gap: 12 }}>
          <View style={{ backgroundColor: '#ECFDF5', padding: 12, borderRadius: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#065F46', marginBottom: 4 }}>Use Gap (Default)</Text>
            <Text style={{ fontSize: 13, color: '#065F46' }}>• Explicit spacing visible in className</Text>
            <Text style={{ fontSize: 13, color: '#065F46' }}>• Native RN support (0.71+)</Text>
            <Text style={{ fontSize: 13, color: '#065F46' }}>• Matches CSS/web patterns</Text>
          </View>
          <View style={{ backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1E40AF', marginBottom: 4 }}>Use VStack/HStack</Text>
            <Text style={{ fontSize: 13, color: '#1E40AF' }}>• Want semantic names (space="related")</Text>
            <Text style={{ fontSize: 13, color: '#1E40AF' }}>• Repeated patterns used 5+ times</Text>
            <Text style={{ fontSize: 13, color: '#1E40AF' }}>• Need bundled align/justify props</Text>
          </View>
        </View>
      </View>

      {/* Spacing Values */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Spacing Values
        </Text>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, gap: 8 }}>
          <Text style={{ fontSize: 13 }}><Text style={{ fontWeight: '600', fontFamily: 'monospace' }}>coupled</Text> (4px) — Icon + text pairs</Text>
          <Text style={{ fontSize: 13 }}><Text style={{ fontWeight: '600', fontFamily: 'monospace' }}>repeating-sm</Text> (6px) — Pills, tags, badges</Text>
          <Text style={{ fontSize: 13 }}><Text style={{ fontWeight: '600', fontFamily: 'monospace' }}>repeating</Text> (8px) — Cards, list items, buttons</Text>
          <Text style={{ fontSize: 13 }}><Text style={{ fontWeight: '600', fontFamily: 'monospace' }}>related-sm</Text> (8px) — Related form elements</Text>
          <Text style={{ fontSize: 13 }}><Text style={{ fontWeight: '600', fontFamily: 'monospace' }}>related</Text> (16px) — Form fields (default)</Text>
          <Text style={{ fontSize: 13 }}><Text style={{ fontWeight: '600', fontFamily: 'monospace' }}>separated-sm</Text> (24px) — Subsections</Text>
          <Text style={{ fontSize: 13 }}><Text style={{ fontWeight: '600', fontFamily: 'monospace' }}>separated</Text> (32px) — Major sections</Text>
        </View>
      </View>

      {/* Import */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Import
        </Text>
        <View style={{ backgroundColor: '#1F2937', padding: 12, borderRadius: 8 }}>
          <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#F9FAFB' }}>
            {`import { VStack, HStack } from './components/Stack';`}
          </Text>
        </View>
      </View>
    </ScrollView>
  ),
};

/**
 * VStack with form inputs - common form layout pattern
 */
export const FormLayout: Story = {
  name: 'VStack - Form Layout',
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
        Form Fields (space="related")
      </Text>

      <Card variant="non-interactive" size="medium">
        <VStack space="related">
          <Input label="Email" placeholder="Enter your email" />
          <Input label="Password" placeholder="Enter password" type="password" />
          <Input label="Confirm Password" placeholder="Confirm password" type="password" />
        </VStack>
      </Card>

      <View style={{ marginTop: 16, backgroundColor: '#1F2937', padding: 12, borderRadius: 8 }}>
        <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#F9FAFB' }}>
          {`<VStack space="related">\n  <Input label="Email" />\n  <Input label="Password" />\n  <Input label="Confirm" />\n</VStack>`}
        </Text>
      </View>
    </ScrollView>
  ),
};

/**
 * HStack with pills - tag/filter layout pattern
 */
export const PillGroup: Story = {
  name: 'HStack - Pill Group',
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
        Tag Group (space="repeating-sm")
      </Text>

      <HStack space="repeating-sm">
        <Pill label="Event" type="info" size="small" />
        <Pill label="Outreach" type="positive" size="small" />
        <Pill label="Material" type="attention" size="small" />
        <Pill label="Follow-up" type="accent" size="small" />
      </HStack>

      <View style={{ marginTop: 16, backgroundColor: '#1F2937', padding: 12, borderRadius: 8 }}>
        <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#F9FAFB' }}>
          {`<HStack space="repeating-sm">\n  <Pill label="Event" type="info" />\n  <Pill label="Outreach" type="positive" />\n  <Pill label="Material" type="attention" />\n</HStack>`}
        </Text>
      </View>
    </ScrollView>
  ),
};

/**
 * HStack with action items - action group pattern
 */
export const ActionGroup: Story = {
  name: 'HStack - Action Group',
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
        Action Items (space="repeating", justify="end")
      </Text>

      <Card variant="non-interactive" size="medium">
        <Text style={{ fontSize: 14, marginBottom: 16 }}>
          Select an action for this item:
        </Text>
        <HStack space="repeating" justify="end">
          <Pill label="Cancel" type="outlined" size="small" interactive />
          <Pill label="Confirm" type="positive" size="small" interactive />
        </HStack>
      </Card>

      <View style={{ marginTop: 16, backgroundColor: '#1F2937', padding: 12, borderRadius: 8 }}>
        <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#F9FAFB' }}>
          {`<HStack space="repeating" justify="end">\n  <Pill label="Cancel" interactive />\n  <Pill label="Confirm" type="positive" />\n</HStack>`}
        </Text>
      </View>
    </ScrollView>
  ),
};

/**
 * HStack icon + text pattern
 */
export const IconTextPair: Story = {
  name: 'HStack - Icon + Text',
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
        Icon + Label (space="coupled")
      </Text>

      <VStack space="repeating">
        <HStack space="coupled" align="center">
          <Pill label="Completed" type="positive" size="small" iconL="checkmark" />
        </HStack>
        <HStack space="coupled" align="center">
          <Pill label="Pending" type="attention" size="small" iconL="clock" />
        </HStack>
        <HStack space="coupled" align="center">
          <Pill label="Failed" type="alert" size="small" iconL="circle-x" />
        </HStack>
      </VStack>

      <View style={{ marginTop: 16, backgroundColor: '#1F2937', padding: 12, borderRadius: 8 }}>
        <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#F9FAFB' }}>
          {`<HStack space="coupled" align="center">\n  <Pill iconL="checkmark" label="Completed" />\n</HStack>`}
        </Text>
      </View>
    </ScrollView>
  ),
};

/**
 * VStack with cards - list layout pattern
 */
export const CardList: Story = {
  name: 'VStack - Card List',
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
        Card List (space="repeating")
      </Text>

      <VStack space="repeating">
        <Card variant="interactive" size="small">
          <HStack space="repeating" justify="between" align="center">
            <Text style={{ fontSize: 14, fontWeight: '500' }}>Team Meeting</Text>
            <Pill label="Today" type="info" size="x-small" />
          </HStack>
        </Card>
        <Card variant="interactive" size="small">
          <HStack space="repeating" justify="between" align="center">
            <Text style={{ fontSize: 14, fontWeight: '500' }}>Project Review</Text>
            <Pill label="Tomorrow" type="transparent" size="x-small" />
          </HStack>
        </Card>
        <Card variant="interactive" size="small">
          <HStack space="repeating" justify="between" align="center">
            <Text style={{ fontSize: 14, fontWeight: '500' }}>Client Call</Text>
            <Pill label="Friday" type="transparent" size="x-small" />
          </HStack>
        </Card>
      </VStack>

      <View style={{ marginTop: 16, backgroundColor: '#1F2937', padding: 12, borderRadius: 8 }}>
        <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#F9FAFB' }}>
          {`<VStack space="repeating">\n  {events.map(event => (\n    <Card key={event.id}>\n      {/* content */}\n    </Card>\n  ))}\n</VStack>`}
        </Text>
      </View>
    </ScrollView>
  ),
};

/**
 * HStack alignment options
 */
export const Alignment: Story = {
  name: 'HStack - Alignment',
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
        Vertical Alignment (align prop)
      </Text>

      <VStack space="related">
        {(['start', 'center', 'end'] as const).map((align) => (
          <View key={align}>
            <Text style={{ fontSize: 12, color: '#666', marginBottom: 4, fontFamily: 'monospace' }}>
              align="{align}"
            </Text>
            <View style={{ backgroundColor: '#F3F4F6', padding: 8, borderRadius: 8, height: 70 }}>
              <HStack space="repeating" align={align}>
                <Pill label="Small" type="info" size="x-small" />
                <Pill label="Medium" type="info" size="small" />
                <Card variant="non-interactive" size="small">
                  <Text style={{ fontSize: 12 }}>Tall Card</Text>
                </Card>
              </HStack>
            </View>
          </View>
        ))}
      </VStack>
    </ScrollView>
  ),
};

/**
 * HStack justify options
 */
export const Justify: Story = {
  name: 'HStack - Justify',
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
        Horizontal Distribution (justify prop)
      </Text>

      <VStack space="related">
        {(['start', 'center', 'end', 'between'] as const).map((justify) => (
          <View key={justify}>
            <Text style={{ fontSize: 12, color: '#666', marginBottom: 4, fontFamily: 'monospace' }}>
              justify="{justify}"
            </Text>
            <View style={{ backgroundColor: '#F3F4F6', padding: 8, borderRadius: 8 }}>
              <HStack space="none" justify={justify}>
                <Pill label="One" type="info" size="small" />
                <Pill label="Two" type="info" size="small" />
                <Pill label="Three" type="info" size="small" />
              </HStack>
            </View>
          </View>
        ))}
      </VStack>
    </ScrollView>
  ),
};

/**
 * Menu list pattern
 */
export const MenuList: Story = {
  name: 'VStack - Menu List',
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
        Menu Items (space="separated-sm")
      </Text>

      <Card variant="non-interactive" size="medium">
        <VStack space="separated-sm">
          <HStack space="repeating" justify="between" align="center">
            <Text style={{ fontSize: 14 }}>Profile Settings</Text>
            <Pill label="New" type="info" size="x-small" />
          </HStack>
          <HStack space="repeating" justify="between" align="center">
            <Text style={{ fontSize: 14 }}>Notifications</Text>
            <Pill label="3" type="alert" size="x-small" />
          </HStack>
          <HStack space="repeating" justify="between" align="center">
            <Text style={{ fontSize: 14 }}>Privacy</Text>
            <Pill label="→" type="transparent" size="x-small" />
          </HStack>
        </VStack>
      </Card>

      <View style={{ marginTop: 16, backgroundColor: '#1F2937', padding: 12, borderRadius: 8 }}>
        <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#F9FAFB' }}>
          {`<VStack space="separated-sm">\n  <HStack justify="between" align="center">\n    <Text>Menu Item</Text>\n    <Pill label="Badge" />\n  </HStack>\n</VStack>`}
        </Text>
      </View>
    </ScrollView>
  ),
};

/**
 * All spacing values comparison
 */
export const SpacingComparison: Story = {
  name: 'Spacing Values',
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
        All Spacing Values
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        {(['coupled', 'repeating-sm', 'repeating', 'related', 'separated-sm', 'separated'] as const).map((space) => (
          <View key={space} style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 11, color: '#666', marginBottom: 6, fontFamily: 'monospace' }}>
              {space}
            </Text>
            <View style={{ backgroundColor: '#F3F4F6', padding: 8, borderRadius: 8 }}>
              <VStack space={space}>
                <Pill label="A" type="info" size="x-small" />
                <Pill label="B" type="info" size="x-small" />
                <Pill label="C" type="info" size="x-small" />
              </VStack>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  ),
};
