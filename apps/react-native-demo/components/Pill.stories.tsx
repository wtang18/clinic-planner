import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Pill } from './Pill';

const meta: Meta<typeof Pill> = {
  title: 'Design System/Components/Pill',
  component: Pill,
  argTypes: {
    type: {
      control: 'select',
      options: ['transparent', 'outlined', 'subtle-outlined', 'positive', 'attention', 'alert', 'alert-emphasis', 'info', 'info-emphasis', 'accent', 'accent-emphasis', 'no-fill', 'carby'],
      description: 'Visual variant',
    },
    size: {
      control: 'select',
      options: ['x-small', 'small', 'medium'],
      description: 'Size',
    },
    iconOnly: {
      control: 'boolean',
      description: 'Icon-only mode (small/medium only)',
    },
    truncate: {
      control: 'boolean',
      description: 'Truncate text with ellipsis',
    },
    interactive: {
      control: 'boolean',
      description: 'Interactive (pressable)',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    label: {
      control: 'text',
      description: 'Main label text',
    },
    subtextL: {
      control: 'text',
      description: 'Left subtext',
    },
    subtextR: {
      control: 'text',
      description: 'Right subtext',
    },
    onPress: { action: 'pressed' },
  },
  args: {
    type: 'transparent',
    size: 'medium',
    iconOnly: false,
    truncate: false,
    interactive: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof Pill>;

export const Documentation: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {/* HEADER */}
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8 }}>
        Pill
      </Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
        Badge/tag component with semantic types, icons, subtexts, and interactive states
      </Text>

      {/* QUICK REFERENCE */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Quick Reference
        </Text>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, gap: 8 }}>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Types:</Text> 13 variants (transparent, outlined, subtle-outlined, positive, attention, alert, alert-emphasis, info, info-emphasis, accent, accent-emphasis, no-fill, carby)
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Sizes:</Text> x-small (20px), small (24px), medium (32px)
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Icons:</Text> Supports iconL/iconR and bicolorIconL/bicolorIconR on small/medium pill sizes (icons are always 20px)
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Bicolor Icons:</Text> Use semantic two-color icons for status (takes precedence over regular icons)
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Icon-only:</Text> Supported for small/medium pill sizes
          </Text>
        </View>
      </View>

      {/* FEATURES */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Features
        </Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}> 13 semantic pill types with design tokens</Text>
          <Text style={{ fontSize: 14 }}> 3 sizes (x-small, small, medium)</Text>
          <Text style={{ fontSize: 14 }}> Left/right icons with automatic sizing</Text>
          <Text style={{ fontSize: 14 }}> Left/right subtexts for metadata</Text>
          <Text style={{ fontSize: 14 }}> Icon-only mode with proper centering</Text>
          <Text style={{ fontSize: 14 }}> Text truncation support</Text>
          <Text style={{ fontSize: 14 }}> Interactive states (press/disabled)</Text>
          <Text style={{ fontSize: 14 }}> Accessibility with proper labels</Text>
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
              {`<Pill type="positive" label="Success" />`}
            </Text>
            <Pill type="positive" label="Success" />
          </View>
          <View>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937', marginBottom: 8 }}>
              {`<Pill type="attention" iconL="alert" label="Warning" />`}
            </Text>
            <Pill type="attention" iconL="alert-triangle" label="Warning" />
          </View>
          <View>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937', marginBottom: 8 }}>
              {`<Pill size="small" iconOnly iconL="checkmark" />`}
            </Text>
            <Pill size="small" iconOnly iconL="checkmark-circle" accessibilityLabel="Success" />
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
          <Text style={{ fontSize: 14 }}> Touch targets: 44x44 minimum (medium size)</Text>
          <Text style={{ fontSize: 14 }}> Screen reader support with accessibilityRole</Text>
          <Text style={{ fontSize: 14 }}> Color contrast: WCAG AA compliant</Text>
          <Text style={{ fontSize: 14 }}> Icon-only pills require accessibilityLabel</Text>
        </View>
      </View>

      {/* BEST PRACTICES */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Best Practices
        </Text>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
           Do
        </Text>
        <View style={{ gap: 6, marginBottom: 12 }}>
          <Text style={{ fontSize: 14 }}>" Use semantic types that match content meaning</Text>
          <Text style={{ fontSize: 14 }}>" Provide accessibilityLabel for icon-only pills</Text>
          <Text style={{ fontSize: 14 }}>" Use subtexts for counts/metadata</Text>
          <Text style={{ fontSize: 14 }}>" Set interactive={'{true}'} for clickable pills</Text>
        </View>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
          L Don't
        </Text>
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14 }}>" Don't use x-small size with icons</Text>
          <Text style={{ fontSize: 14 }}>" Don't forget accessibilityLabel for icon-only</Text>
          <Text style={{ fontSize: 14 }}>" Don't use vague labels like "Info"</Text>
        </View>
      </View>

      {/* PLATFORM DIFFERENCES */}
      <View style={{ backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
          React Native vs Web
        </Text>
        <Text style={{ fontSize: 14 }}>
          " RN uses onPress instead of onClick{'\n'}
          " RN uses accessibilityLabel instead of aria-label{'\n'}
          " RN uses TouchableOpacity instead of button element{'\n'}
          " Hover states work differently (activeOpacity on press)
        </Text>
      </View>
    </ScrollView>
  ),
};

export const Playground: Story = {
  args: {
    type: 'transparent',
    size: 'medium',
    label: 'Pill Label',
  },
};

export const AllVariants: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
        All Pill Types
      </Text>
      <View style={{ gap: 12 }}>
        <Pill type="transparent" label="Transparent" />
        <Pill type="outlined" label="Outlined" />
        <Pill type="subtle-outlined" label="Subtle Outlined" />
        <Pill type="positive" label="Positive" />
        <Pill type="attention" label="Attention" />
        <Pill type="alert" label="Alert" />
        <Pill type="alert-emphasis" label="Alert Emphasis" />
        <Pill type="info" label="Info" />
        <Pill type="info-emphasis" label="Info Emphasis" />
        <Pill type="accent" label="Accent" />
        <Pill type="accent-emphasis" label="Accent Emphasis" />
        <Pill type="no-fill" label="No Fill" />
        <Pill type="carby" label="Carby" />
      </View>

      <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
        Emphasis Variants
      </Text>
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: '#666', width: 60 }}>Alert:</Text>
          <Pill type="alert" label="Standard" />
          <Pill type="alert-emphasis" label="Emphasis" />
        </View>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: '#666', width: 60 }}>Info:</Text>
          <Pill type="info" label="Standard" />
          <Pill type="info-emphasis" label="Emphasis" />
        </View>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: '#666', width: 60 }}>Accent:</Text>
          <Pill type="accent" label="Standard" />
          <Pill type="accent-emphasis" label="Emphasis" />
        </View>
      </View>
    </ScrollView>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
        X-Small (20px) - No icons
      </Text>
      <View style={{ gap: 12, marginBottom: 24 }}>
        <Pill size="x-small" type="transparent" label="Extra Small" />
        <Pill size="x-small" type="positive" label="Success" />
        <Pill size="x-small" type="alert" label="Error" />
      </View>

      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
        Small (24px) - Icons supported
      </Text>
      <View style={{ gap: 12, marginBottom: 24 }}>
        <Pill size="small" type="transparent" label="Small" />
        <Pill size="small" type="positive" label="Success" iconL="checkmark-circle" />
        <Pill size="small" type="alert" label="Error" iconL="close-circle" />
      </View>

      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
        Medium (32px) - Icons supported
      </Text>
      <View style={{ gap: 12 }}>
        <Pill size="medium" type="transparent" label="Medium" />
        <Pill size="medium" type="positive" label="Success" iconL="checkmark-circle" />
        <Pill size="medium" type="alert" label="Error" iconL="close-circle" />
      </View>
    </ScrollView>
  ),
};

export const States: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
        Default
      </Text>
      <View style={{ gap: 12, marginBottom: 24 }}>
        <Pill type="positive" label="Default State" />
        <Pill type="outlined" label="Default State" />
        <Pill type="accent" label="Default State" />
      </View>

      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
        Interactive (press to activate)
      </Text>
      <View style={{ gap: 12, marginBottom: 24 }}>
        <Pill type="positive" label="Clickable" interactive onPress={() => console.log('Pressed')} />
        <Pill type="outlined" label="Clickable" interactive onPress={() => console.log('Pressed')} />
        <Pill type="accent" label="Clickable" interactive onPress={() => console.log('Pressed')} />
      </View>

      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
        Disabled
      </Text>
      <View style={{ gap: 12 }}>
        <Pill type="positive" label="Disabled" disabled />
        <Pill type="outlined" label="Disabled" disabled />
        <Pill type="accent" label="Disabled" disabled />
      </View>
    </ScrollView>
  ),
};

export const RealWorldExamples: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
        Status Badges (with Bicolor Icons)
      </Text>
      <View style={{ gap: 12, marginBottom: 24 }}>
        <Pill type="positive" bicolorIconL="positive" label="Completed" />
        <Pill type="attention" bicolorIconL="attention" label="Pending" />
        <Pill type="alert" bicolorIconL="alert" label="Failed" />
        <Pill type="info" bicolorIconL="info" label="In Progress" />
      </View>

      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
        Count Badges
      </Text>
      <View style={{ gap: 12, marginBottom: 24 }}>
        <Pill type="transparent" subtextL="5" label="Tasks" />
        <Pill type="info" subtextL="12" label="Notifications" />
        <Pill type="alert" subtextL="3" label="Errors" />
      </View>

      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
        Tags/Labels
      </Text>
      <View style={{ gap: 12, marginBottom: 24 }}>
        <Pill type="outlined" label="React Native" />
        <Pill type="outlined" label="TypeScript" />
        <Pill type="outlined" label="Storybook" />
      </View>

      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
        Icon-Only Actions
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pill size="medium" iconOnly iconL="heart" type="positive" accessibilityLabel="Like" interactive />
        <Pill size="medium" iconOnly iconL="share" type="info" accessibilityLabel="Share" interactive />
        <Pill size="medium" iconOnly iconL="close" type="alert" accessibilityLabel="Close" interactive />
      </View>
    </ScrollView>
  ),
};

export const AccessibilityDemo: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={{ backgroundColor: '#e3f2fd', padding: 16, borderRadius: 8, gap: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>
          Accessibility Features
        </Text>
        <Text style={{ fontSize: 14 }}> Proper accessibilityRole (button for interactive)</Text>
        <Text style={{ fontSize: 14 }}> Descriptive accessibilityLabels</Text>
        <Text style={{ fontSize: 14 }}> State announced via accessibilityState</Text>
        <Text style={{ fontSize: 14 }}> Touch targets: 44x44 minimum (medium size)</Text>

        <View style={{ gap: 12, marginTop: 12 }}>
          <Text style={{ fontSize: 14, color: '#555' }}> Good: Icon-only with label</Text>
          <Pill
            size="medium"
            iconOnly
            iconL="heart"
            type="positive"
            accessibilityLabel="Mark as favorite"
            interactive
          />

          <Text style={{ fontSize: 14, color: '#555', marginTop: 8 }}> Good: Interactive with clear purpose</Text>
          <Pill
            type="outlined"
            label="Remove tag"
            iconR="close"
            interactive
            onPress={() => console.log('Removed')}
          />

          <Text style={{ fontSize: 14, color: '#555', marginTop: 8 }}> Good: Semantic types match meaning</Text>
          <Pill type="positive" iconL="checkmark-circle" label="Task completed" />
          <Pill type="alert" iconL="close-circle" label="Task failed" />
        </View>
      </View>
    </ScrollView>
  ),
};
