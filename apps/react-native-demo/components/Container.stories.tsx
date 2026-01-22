import type { Meta, StoryObj } from '@storybook/react-native';
import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Container } from './Container';
import { Card } from './Card';

const meta: Meta<typeof Container> = {
  title: 'Design System/Components/Container',
  component: Container,
  argTypes: {
    gap: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Spacing between child elements',
    },
    variant: {
      control: 'select',
      options: ['interactive', 'non-interactive'],
      description: 'Whether container is pressable',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable interaction (interactive variant only)',
    },
  },
  args: {
    gap: 'md',
    variant: 'non-interactive',
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof Container>;

export const Documentation: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {/* HEADER */}
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8 }}>
        Container
      </Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
        Wrapper component with consistent spacing and layout for organizing content
      </Text>

      {/* QUICK REFERENCE */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Quick Reference
        </Text>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, gap: 8 }}>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Background:</Text> rgba(0,0,0,0.06) subtle gray
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Border Radius:</Text> 16px (md)
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Padding:</Text> 16px all sides
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Gap:</Text> sm (8px), md (16px), lg (24px)
          </Text>
        </View>
      </View>

      {/* FEATURES */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Features
        </Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}>✅ Consistent spacing with gap variants</Text>
          <Text style={{ fontSize: 14 }}>✅ Interactive and non-interactive variants</Text>
          <Text style={{ fontSize: 14 }}>✅ Press feedback on interactive containers</Text>
          <Text style={{ fontSize: 14 }}>✅ Disabled state support</Text>
          <Text style={{ fontSize: 14 }}>✅ Design token integration</Text>
          <Text style={{ fontSize: 14 }}>✅ Accessibility with button role</Text>
        </View>
      </View>

      {/* USAGE EXAMPLES */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Usage Examples
        </Text>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, gap: 16 }}>
          <View>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937', marginBottom: 8 }}>
              {`<Container gap="md">\n  <Card>Card 1</Card>\n  <Card>Card 2</Card>\n</Container>`}
            </Text>
            <Container gap="md">
              <Card>Card 1</Card>
              <Card>Card 2</Card>
            </Container>
          </View>
        </View>
      </View>

      {/* ACCESSIBILITY */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Accessibility
        </Text>
        <Text style={{ fontSize: 14, marginBottom: 8 }}>
          Follows WCAG 2.1 Level AA guidelines
        </Text>
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14 }}>✅ Interactive containers have button role</Text>
          <Text style={{ fontSize: 14 }}>✅ Disabled state announced to screen readers</Text>
          <Text style={{ fontSize: 14 }}>✅ Touch targets meet 44x44 minimum</Text>
          <Text style={{ fontSize: 14 }}>✅ Proper accessibilityLabel support</Text>
        </View>
      </View>

      {/* BEST PRACTICES */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Best Practices
        </Text>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
          ✅ Do
        </Text>
        <View style={{ gap: 6, marginBottom: 12 }}>
          <Text style={{ fontSize: 14 }}>• Use for grouping related content/cards</Text>
          <Text style={{ fontSize: 14 }}>• Choose gap size based on content hierarchy</Text>
          <Text style={{ fontSize: 14 }}>• Provide accessibilityLabel for interactive containers</Text>
          <Text style={{ fontSize: 14 }}>• Use variant="interactive" for clickable containers</Text>
        </View>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
          ❌ Don't
        </Text>
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14 }}>• Don't nest containers - use Card variant="interactive" instead</Text>
          <Text style={{ fontSize: 14 }}>• Don't use for single items (use Card instead)</Text>
          <Text style={{ fontSize: 14 }}>• Don't forget onPress handler for interactive variant</Text>
        </View>
      </View>

      {/* PLATFORM DIFFERENCES */}
      <View style={{ backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
          React Native vs Web
        </Text>
        <Text style={{ fontSize: 14 }}>
          • RN uses onPress instead of onClick{'\n'}
          • RN uses TouchableOpacity for interactive variant{'\n'}
          • RN uses onPressIn/Out to show press state{'\n'}
          • Web uses hover, RN uses press feedback
        </Text>
      </View>
    </ScrollView>
  ),
};

export const Playground: Story = {
  render: (args) => (
    <View style={{ padding: 16 }}>
      <Container {...args}>
        <Card><Text>Card 1</Text></Card>
        <Card><Text>Card 2</Text></Card>
        <Card><Text>Card 3</Text></Card>
      </Container>
    </View>
  ),
  args: {
    gap: 'md',
    variant: 'non-interactive',
    disabled: false,
  },
};

export const GapVariants: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
        Small Gap (8px)
      </Text>
      <Container gap="sm">
        <Card>Item 1</Card>
        <Card>Item 2</Card>
        <Card>Item 3</Card>
      </Container>

      <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
        Medium Gap (16px) - Default
      </Text>
      <Container gap="md">
        <Card>Item 1</Card>
        <Card>Item 2</Card>
        <Card>Item 3</Card>
      </Container>

      <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
        Large Gap (24px)
      </Text>
      <Container gap="lg">
        <Card>Item 1</Card>
        <Card>Item 2</Card>
        <Card>Item 3</Card>
      </Container>
    </ScrollView>
  ),
};

export const InteractiveVariant: Story = {
  render: () => {
    const [pressCount, setPressCount] = useState(0);

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Interactive Container (Press it!)
        </Text>
        <Container
          variant="interactive"
          onPress={() => setPressCount(c => c + 1)}
          accessibilityLabel="Pressable container"
        >
          <Card>This container is pressable</Card>
          <Card color="#E8F5E9">Press count: {pressCount}</Card>
        </Container>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Non-Interactive Container (Default)
        </Text>
        <Container variant="non-interactive">
          <Card>This container is static</Card>
          <Card color="#FFF3E0">Cannot be pressed</Card>
        </Container>
      </ScrollView>
    );
  },
};

export const States: Story = {
  render: () => {
    const [pressCount, setPressCount] = useState(0);

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Default Interactive
        </Text>
        <Container
          variant="interactive"
          onPress={() => setPressCount(c => c + 1)}
        >
          <Card>Active container</Card>
          <Card color="#E8F5E9">Pressed {pressCount} times</Card>
        </Container>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Disabled Interactive
        </Text>
        <Container
          variant="interactive"
          disabled
          onPress={() => console.log('Should not fire')}
        >
          <Card>Disabled container</Card>
          <Card color="#FFE0B2">Cannot be pressed (50% opacity)</Card>
        </Container>
      </ScrollView>
    );
  },
};

export const RealWorldExamples: Story = {
  render: () => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Settings Group
        </Text>
        <Container gap="sm">
          <Card>Account Settings</Card>
          <Card>Privacy Settings</Card>
          <Card>Notification Settings</Card>
        </Container>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Selectable Options
        </Text>
        <View style={{ gap: 16 }}>
          <Card
            variant="interactive"
            onPress={() => setSelectedOption('basic')}
            color={selectedOption === 'basic' ? '#C5E1A5' : '#E3F2FD'}
          >
            <Text style={{ fontWeight: '600', marginBottom: 4 }}>Basic Plan</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>$9/month</Text>
          </Card>

          <Card
            variant="interactive"
            onPress={() => setSelectedOption('pro')}
            color={selectedOption === 'pro' ? '#C5E1A5' : '#E3F2FD'}
          >
            <Text style={{ fontWeight: '600', marginBottom: 4 }}>Pro Plan</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>$19/month</Text>
          </Card>
        </View>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Dashboard Cards
        </Text>
        <Container gap="lg">
          <Card color="#FFF3E0">
            <Text style={{ fontWeight: '600', marginBottom: 8 }}>Revenue</Text>
            <Text style={{ fontSize: 24, fontWeight: '700' }}>$12,345</Text>
          </Card>
          <Card color="#F3E5F5">
            <Text style={{ fontWeight: '600', marginBottom: 8 }}>Users</Text>
            <Text style={{ fontSize: 24, fontWeight: '700' }}>1,234</Text>
          </Card>
        </Container>
      </ScrollView>
    );
  },
};

export const AccessibilityDemo: Story = {
  render: () => {
    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ backgroundColor: '#e3f2fd', padding: 16, borderRadius: 8, gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>
            Accessibility Features
          </Text>
          <Text style={{ fontSize: 14 }}>✓ Interactive containers have button role</Text>
          <Text style={{ fontSize: 14 }}>✓ Disabled state announced</Text>
          <Text style={{ fontSize: 14 }}>✓ Touch targets meet 44x44 minimum</Text>
          <Text style={{ fontSize: 14 }}>✓ Proper labels for context</Text>

          <View style={{ gap: 12, marginTop: 12 }}>
            <Text style={{ fontSize: 14, color: '#555' }}>✓ Good: Clear label for interactive container</Text>
            <Container
              variant="interactive"
              onPress={() => console.log('Settings pressed')}
              accessibilityLabel="Open settings menu"
            >
              <Card>Settings</Card>
            </Container>

            <Text style={{ fontSize: 14, color: '#555', marginTop: 8 }}>✓ Good: Non-interactive for static content</Text>
            <Container variant="non-interactive">
              <Card>Dashboard Summary</Card>
              <Card color="#E8F5E9">Total: $1,234</Card>
            </Container>
          </View>
        </View>
      </ScrollView>
    );
  },
};
