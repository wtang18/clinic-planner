import type { Meta, StoryObj } from '@storybook/react-native';
import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SearchInput } from './SearchInput';

const meta: Meta<typeof SearchInput> = {
  title: 'Design System/Components/SearchInput',
  component: SearchInput,
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size variant',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    editable: {
      control: 'boolean',
      description: 'Editable state',
    },
  },
  args: {
    size: 'medium',
    placeholder: 'Search',
    editable: true,
  },
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Documentation: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8 }}>SearchInput</Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
        Specialized search input with magnifying glass icon and clear button. Features pill-shaped design with semi-transparent background.
      </Text>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Quick Reference</Text>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, gap: 8 }}>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Sizes:</Text> small (32px), medium (40px), large (56px)
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Shape:</Text> Pill-shaped (fully rounded corners)
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Background:</Text> Semi-transparent (rgba blur effect)
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Icons:</Text> Search (left), X clear button (right, when has value)
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Icon Sizes:</Text> 20px (small/medium), 24px (large)
          </Text>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Features</Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}>✅ Three sizes: small, medium, large</Text>
          <Text style={{ fontSize: 14 }}>✅ Pill-shaped design (fully rounded)</Text>
          <Text style={{ fontSize: 14 }}>✅ Semi-transparent background</Text>
          <Text style={{ fontSize: 14 }}>✅ Built-in search icon (left)</Text>
          <Text style={{ fontSize: 14 }}>✅ Auto-clearing X button (right, when has value)</Text>
          <Text style={{ fontSize: 14 }}>✅ Focus state with darker background</Text>
          <Text style={{ fontSize: 14 }}>✅ Disabled state support</Text>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Usage Examples</Text>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, gap: 16 }}>
          <View>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937', marginBottom: 8 }}>
              {`<SearchInput\n  value={query}\n  onChangeText={setQuery}\n/>`}
            </Text>
            {(() => {
              const [value, setValue] = useState('');
              return <SearchInput value={value} onChangeText={setValue} />;
            })()}
          </View>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Accessibility</Text>
        <Text style={{ fontSize: 14, marginBottom: 8 }}>
          Follows WCAG 2.1 Level AA guidelines
        </Text>
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14 }}>✅ Touch targets: 44x44 minimum</Text>
          <Text style={{ fontSize: 14 }}>✅ Screen reader support (accessibilityRole="search")</Text>
          <Text style={{ fontSize: 14 }}>✅ Clear button with accessible label</Text>
          <Text style={{ fontSize: 14 }}>✅ Disabled state announced to screen readers</Text>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Best Practices</Text>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>✅ Do</Text>
        <View style={{ gap: 6, marginBottom: 12 }}>
          <Text style={{ fontSize: 14 }}>• Use for search functionality</Text>
          <Text style={{ fontSize: 14 }}>• Keep placeholder text concise</Text>
          <Text style={{ fontSize: 14 }}>• Show clear button when user has typed</Text>
          <Text style={{ fontSize: 14 }}>• Use medium size for standard layouts</Text>
        </View>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>❌ Don't</Text>
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14 }}>• Don't use for general text input (use Input instead)</Text>
          <Text style={{ fontSize: 14 }}>• Don't hide the clear button when value exists</Text>
          <Text style={{ fontSize: 14 }}>• Don't use long placeholder text</Text>
        </View>
      </View>

      <View style={{ backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Platform Differences</Text>
        <Text style={{ fontSize: 14 }}>
          • RN uses semi-transparent background (web uses backdrop-blur){'\n'}
          • RN uses TouchableOpacity for clear button{'\n'}
          • RN uses onChangeText instead of onChange{'\n'}
          • Focus state changes background (no hover on mobile)
        </Text>
      </View>
    </ScrollView>
  ),
};

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <View style={{ padding: 16 }}>
        <SearchInput
          {...args}
          value={value}
          onChangeText={setValue}
        />
      </View>
    );
  },
  args: {
    size: 'medium',
    placeholder: 'Search',
    editable: true,
  },
};

export const AllSizes: Story = {
  render: () => {
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('');
    const [value3, setValue3] = useState('');

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Small (32px)
        </Text>
        <SearchInput
          size="small"
          placeholder="Search..."
          value={value1}
          onChangeText={setValue1}
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Medium (40px) - Default
        </Text>
        <SearchInput
          size="medium"
          placeholder="Search..."
          value={value2}
          onChangeText={setValue2}
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Large (56px)
        </Text>
        <SearchInput
          size="large"
          placeholder="Search..."
          value={value3}
          onChangeText={setValue3}
        />
      </ScrollView>
    );
  },
};

export const States: Story = {
  render: () => {
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('react native');

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Empty</Text>
        <SearchInput
          placeholder="Search..."
          value={value1}
          onChangeText={setValue1}
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          With Value (Shows Clear Button)
        </Text>
        <SearchInput
          placeholder="Search..."
          value={value2}
          onChangeText={setValue2}
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Focused (Tap to focus)
        </Text>
        <SearchInput
          placeholder="Tap to see focus state..."
          value={value1}
          onChangeText={setValue1}
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Disabled
        </Text>
        <SearchInput
          placeholder="Search..."
          value="Cannot edit"
          onChangeText={() => {}}
          editable={false}
        />
      </ScrollView>
    );
  },
};

export const RealWorldExamples: Story = {
  render: () => {
    const [globalSearch, setGlobalSearch] = useState('');
    const [filterSearch, setFilterSearch] = useState('');
    const [productSearch, setProductSearch] = useState('');

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Global Search (Navigation)
        </Text>
        <SearchInput
          placeholder="Search"
          value={globalSearch}
          onChangeText={setGlobalSearch}
          onClear={() => console.log('Global search cleared')}
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Filter Search (Table/List)
        </Text>
        <SearchInput
          size="small"
          placeholder="Filter items..."
          value={filterSearch}
          onChangeText={setFilterSearch}
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Product Search (Large, Prominent)
        </Text>
        <SearchInput
          size="large"
          placeholder="Search products..."
          value={productSearch}
          onChangeText={setProductSearch}
        />
      </ScrollView>
    );
  },
};

export const AccessibilityDemo: Story = {
  render: () => {
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('existing query');

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ backgroundColor: '#e3f2fd', padding: 16, borderRadius: 8, gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>Accessibility Features</Text>
          <Text style={{ fontSize: 14 }}>✓ accessibilityRole="search"</Text>
          <Text style={{ fontSize: 14 }}>✓ Clear button labeled "Clear search"</Text>
          <Text style={{ fontSize: 14 }}>✓ Disabled state announced</Text>
          <Text style={{ fontSize: 14 }}>✓ Increased touch targets (hitSlop)</Text>

          <View style={{ gap: 12, marginTop: 12 }}>
            <Text style={{ fontSize: 14, color: '#555' }}>✓ Good: Standard search</Text>
            <SearchInput
              placeholder="Search"
              value={value1}
              onChangeText={setValue1}
              accessibilityLabel="Global search"
              accessibilityHint="Enter text to search"
            />

            <Text style={{ fontSize: 14, color: '#555', marginTop: 8 }}>
              ✓ Good: Clear button is accessible
            </Text>
            <SearchInput
              placeholder="Search products"
              value={value2}
              onChangeText={setValue2}
              accessibilityLabel="Product search"
            />
          </View>
        </View>
      </ScrollView>
    );
  },
};
