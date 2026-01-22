import type { Meta, StoryObj } from '@storybook/react-native';
import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { TogglePill } from './TogglePill';

const meta: Meta<typeof TogglePill> = {
  title: 'Design System/Components/TogglePill',
  component: TogglePill,
  argTypes: {
    size: {
      control: 'select',
      options: ['x-small', 'small', 'medium', 'large'],
      description: 'Size variant',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
  args: {
    size: 'medium',
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof TogglePill>;

export const Documentation: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8 }}>TogglePill</Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
        Interactive pill with toggle functionality for filters and selections
      </Text>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Quick Reference</Text>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, gap: 8 }}>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Sizes:</Text> x-small (20px), small (24px), medium (32px), large (40px)
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Unselected:</Text> Transparent with soft border, secondary text
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Selected:</Text> Blue background (#c9e6f0), primary text
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Icons:</Text> Supports iconL/iconR and bicolorIconL/bicolorIconR (always 20px, hidden on x-small)
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Bicolor Icons:</Text> Use semantic two-color icons (takes precedence over regular icons)
          </Text>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Features</Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}>✅ Toggle selection state on press</Text>
          <Text style={{ fontSize: 14 }}>✅ Four size variants (x-small to large)</Text>
          <Text style={{ fontSize: 14 }}>✅ Icon support (hidden on x-small)</Text>
          <Text style={{ fontSize: 14 }}>✅ Bicolor icon support for semantic status</Text>
          <Text style={{ fontSize: 14 }}>✅ Subtext support for counts/metadata</Text>
          <Text style={{ fontSize: 14 }}>✅ Disabled state support</Text>
          <Text style={{ fontSize: 14 }}>✅ Accessibility with switch role</Text>
        </View>
      </View>

      <View style={{ backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Platform Differences</Text>
        <Text style={{ fontSize: 14 }}>
          • RN uses TouchableOpacity for interaction{'\n'}
          • RN uses onPress instead of onClick{'\n'}
          • accessibilityRole="switch" for screen readers{'\n'}
          • Press feedback instead of hover states
        </Text>
      </View>
    </ScrollView>
  ),
};

export const Playground: Story = {
  render: (args) => {
    const [selected, setSelected] = useState(false);
    return (
      <View style={{ padding: 16 }}>
        <TogglePill {...args} selected={selected} onChange={setSelected} />
      </View>
    );
  },
  args: {
    size: 'medium',
    disabled: false,
    label: 'Filter',
  },
};

export const AllSizes: Story = {
  render: () => {
    const [selected1, setSelected1] = useState(false);
    const [selected2, setSelected2] = useState(true);
    const [selected3, setSelected3] = useState(false);
    const [selected4, setSelected4] = useState(true);

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>X-Small (20px)</Text>
        <TogglePill size="x-small" label="Filter" selected={selected1} onChange={setSelected1} />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Small (24px)
        </Text>
        <TogglePill size="small" label="Filter" selected={selected2} onChange={setSelected2} />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Medium (32px) - Default
        </Text>
        <TogglePill size="medium" label="Filter" selected={selected3} onChange={setSelected3} />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Large (40px)
        </Text>
        <TogglePill size="large" label="Filter" selected={selected4} onChange={setSelected4} />
      </ScrollView>
    );
  },
};

export const States: Story = {
  render: () => {
    const [selected1, setSelected1] = useState(false);
    const [selected2, setSelected2] = useState(true);

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Unselected</Text>
        <TogglePill label="Filter" selected={selected1} onChange={setSelected1} />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>Selected</Text>
        <TogglePill label="Active" selected={selected2} onChange={setSelected2} />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Disabled Unselected
        </Text>
        <TogglePill label="Disabled" selected={false} onChange={() => {}} disabled />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Disabled Selected
        </Text>
        <TogglePill label="Disabled Active" selected={true} onChange={() => {}} disabled />
      </ScrollView>
    );
  },
};

export const WithIcons: Story = {
  render: () => {
    const [selected1, setSelected1] = useState(false);
    const [selected2, setSelected2] = useState(true);
    const [selected3, setSelected3] = useState(false);
    const [selected4, setSelected4] = useState(true);

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Left Icon</Text>
        <TogglePill
          iconL="checkmark"
          label="Verified"
          selected={selected1}
          onChange={setSelected1}
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Right Icon
        </Text>
        <TogglePill
          label="Settings"
          iconR="chevron-down"
          selected={selected2}
          onChange={setSelected2}
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Both Icons
        </Text>
        <TogglePill
          iconL="checkmark"
          label="Complete"
          iconR="chevron-right"
          selected={selected3}
          onChange={setSelected3}
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          X-Small (No Icons Shown)
        </Text>
        <TogglePill
          size="x-small"
          iconL="checkmark"
          label="Compact"
          selected={selected4}
          onChange={setSelected4}
        />
      </ScrollView>
    );
  },
};

export const WithSubtext: Story = {
  render: () => {
    const [selected1, setSelected1] = useState(false);
    const [selected2, setSelected2] = useState(true);
    const [selected3, setSelected3] = useState(false);

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Left Subtext (Count)</Text>
        <TogglePill
          leftSubtext="24"
          label="Items"
          selected={selected1}
          onChange={setSelected1}
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Right Subtext (Badge)
        </Text>
        <TogglePill
          label="New"
          rightSubtext="5"
          selected={selected2}
          onChange={setSelected2}
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Both Subtexts
        </Text>
        <TogglePill
          leftSubtext="$"
          label="Price"
          rightSubtext="99"
          selected={selected3}
          onChange={setSelected3}
        />
      </ScrollView>
    );
  },
};

export const RealWorldExamples: Story = {
  render: () => {
    const [filter, setFilter] = useState<string>('all');
    const [tags, setTags] = useState<string[]>(['design']);
    const [status, setStatus] = useState<string>('active');

    const toggleTag = (tag: string) => {
      setTags(prev =>
        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
      );
    };

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Filter Bar</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <TogglePill
            label="All"
            leftSubtext="24"
            selected={filter === 'all'}
            onChange={() => setFilter('all')}
          />
          <TogglePill
            label="Active"
            leftSubtext="12"
            selected={filter === 'active'}
            onChange={() => setFilter('active')}
          />
          <TogglePill
            label="Completed"
            leftSubtext="12"
            selected={filter === 'completed'}
            onChange={() => setFilter('completed')}
          />
        </View>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Tag Selection (Multi-Select)
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <TogglePill
            iconL="tag"
            label="Design"
            selected={tags.includes('design')}
            onChange={() => toggleTag('design')}
          />
          <TogglePill
            iconL="tag"
            label="Development"
            selected={tags.includes('development')}
            onChange={() => toggleTag('development')}
          />
          <TogglePill
            iconL="tag"
            label="Marketing"
            selected={tags.includes('marketing')}
            onChange={() => toggleTag('marketing')}
          />
        </View>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Status Toggle (Single Select)
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <TogglePill
            size="small"
            iconL="checkmark"
            label="Active"
            selected={status === 'active'}
            onChange={() => setStatus('active')}
          />
          <TogglePill
            size="small"
            iconL="pause"
            label="Paused"
            selected={status === 'paused'}
            onChange={() => setStatus('paused')}
          />
          <TogglePill
            size="small"
            iconL="close"
            label="Archived"
            selected={status === 'archived'}
            onChange={() => setStatus('archived')}
          />
        </View>
      </ScrollView>
    );
  },
};

export const AccessibilityDemo: Story = {
  render: () => {
    const [selected1, setSelected1] = useState(false);
    const [selected2, setSelected2] = useState(true);

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ backgroundColor: '#e3f2fd', padding: 16, borderRadius: 8, gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>Accessibility Features</Text>
          <Text style={{ fontSize: 14 }}>✓ Switch role for screen readers</Text>
          <Text style={{ fontSize: 14 }}>✓ Checked state announced</Text>
          <Text style={{ fontSize: 14 }}>✓ Disabled state announced</Text>
          <Text style={{ fontSize: 14 }}>✓ Touch targets: 44x44 minimum (medium+)</Text>

          <View style={{ gap: 12, marginTop: 12 }}>
            <Text style={{ fontSize: 14, color: '#555' }}>✓ Good: Clear label with context</Text>
            <TogglePill
              label="Active"
              selected={selected1}
              onChange={setSelected1}
              accessibilityLabel="Filter by active status"
            />

            <Text style={{ fontSize: 14, color: '#555', marginTop: 8 }}>
              ✓ Good: Icon enhances meaning
            </Text>
            <TogglePill
              iconL="checkmark"
              label="Verified"
              selected={selected2}
              onChange={setSelected2}
              accessibilityLabel="Filter by verified items"
            />
          </View>
        </View>
      </ScrollView>
    );
  },
};
