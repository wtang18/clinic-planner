import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { ThemeProvider, useTheme, useThemeMode } from './ThemeProvider';

// Component imports for ComponentShowcase
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Toggle } from '../components/Toggle';
import { Pill } from '../components/Pill';
import { TogglePill } from '../components/TogglePill';
import { Toast } from '../components/Toast';
import { SegmentedControl } from '../components/SegmentedControl';
import { Textarea } from '../components/Textarea';
import { SearchInput } from '../components/SearchInput';
import { Select } from '../components/Select';
import { DateInput } from '../components/DateInput';
import { Container } from '../components/Container';

const meta: Meta = {
  title: 'Theme System/Theme Demo',
  parameters: {
    docs: {
      description: {
        component: `
# Theme System

The React Native design system now includes automatic light/dark mode support, mirroring the web design system's behavior.

## Key Principles

**Same Token Names, Different Values:** Just like the web design system, components always use the same semantic token names (e.g., \`theme.colorBgNeutralBase\`). The values automatically change based on the current theme mode.

**Automatic Theme Detection:** The ThemeProvider uses React Native's \`useColorScheme()\` hook to detect the system theme preference and applies the appropriate token mappings.

**No Component Changes:** Once you switch to using the theme system, your components never need to check the theme mode manually. Simply use \`theme.colorBgNeutralBase\` and it will automatically be white in light mode and black in dark mode.

## How It Works

### 1. Wrap Your App

\`\`\`tsx
import { ThemeProvider } from './theme';

export default function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}
\`\`\`

### 2. Use Theme Tokens in Components

\`\`\`tsx
import { useTheme } from './theme';

function MyComponent() {
  const theme = useTheme();

  return (
    <View style={{ backgroundColor: theme.colorBgNeutralBase }}>
      <Text style={{ color: theme.colorFgNeutralPrimary }}>
        This automatically adapts to light/dark mode!
      </Text>
    </View>
  );
}
\`\`\`

### 3. Token Mapping Example

Here's how the same token name maps to different primitives:

**Light Mode:**
- \`colorBgNeutralBase\` → \`#ffffff\` (white)
- \`colorFgNeutralPrimary\` → \`#181818\` (dark gray)

**Dark Mode:**
- \`colorBgNeutralBase\` → \`#181818\` (dark gray)
- \`colorFgNeutralPrimary\` → \`#ffffff\` (white)

## Web vs React Native

**Web Design System:**
- Uses CSS custom properties (\`var(--color-bg-neutral-base)\`)
- Switches via \`[data-theme="dark"]\` selector
- Automatic, no JavaScript required

**React Native Design System:**
- Uses Context API with \`useTheme()\` hook
- Switches via \`useColorScheme()\` system detection
- Requires manual token referencing, but automatic value switching

Both systems share the same **semantic token names** and **design principles**, making it easy to maintain consistency across platforms.
        `,
      },
    },
  },
};

export default meta;

/**
 * Component that demonstrates theme usage
 */
function ThemedCard() {
  const theme = useTheme();
  const mode = useThemeMode();

  return (
    <View
      style={{
        backgroundColor: theme.colorBgNeutralBase,
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colorBgNeutralLow,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: '600',
          color: theme.colorFgNeutralPrimary,
          marginBottom: 8,
        }}
      >
        Current Theme: {mode}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: theme.colorFgNeutralSecondary,
          marginBottom: 16,
        }}
      >
        This card uses theme tokens and automatically adapts to system theme changes.
      </Text>

      {/* Neutral Colors Example */}
      <View style={{ marginBottom: 12 }}>
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: theme.colorFgNeutralPrimary,
            marginBottom: 4,
          }}
        >
          Neutral Colors
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View
            style={{
              width: 40,
              height: 40,
              backgroundColor: theme.colorBgNeutralBase,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: theme.colorBgNeutralLow,
            }}
          />
          <View
            style={{
              width: 40,
              height: 40,
              backgroundColor: theme.colorBgNeutralSubtle,
              borderRadius: 8,
            }}
          />
          <View
            style={{
              width: 40,
              height: 40,
              backgroundColor: theme.colorBgNeutralLow,
              borderRadius: 8,
            }}
          />
        </View>
      </View>

      {/* Semantic Colors Grid */}
      <View>
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: theme.colorFgNeutralPrimary,
            marginBottom: 4,
          }}
        >
          Semantic Colors
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: theme.colorBgPositiveSubtle,
              borderRadius: 6,
            }}
          >
            <Text style={{ fontSize: 12, color: theme.colorFgPositivePrimary }}>
              Success
            </Text>
          </View>
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: theme.colorBgAlertSubtle,
              borderRadius: 6,
            }}
          >
            <Text style={{ fontSize: 12, color: theme.colorFgAlertPrimary }}>
              Alert
            </Text>
          </View>
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: theme.colorBgAttentionSubtle,
              borderRadius: 6,
            }}
          >
            <Text style={{ fontSize: 12, color: theme.colorFgAttentionPrimary }}>
              Warning
            </Text>
          </View>
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: theme.colorBgInformationSubtle,
              borderRadius: 6,
            }}
          >
            <Text style={{ fontSize: 12, color: theme.colorFgInformationPrimary }}>
              Info
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/**
 * Interactive demo with manual theme toggle
 */
function InteractiveThemeDemo() {
  const [forcedTheme, setForcedTheme] = useState<'light' | 'dark' | undefined>(undefined);

  return (
    <View style={{ flex: 1 }}>
      {/* Theme Toggle Buttons */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <TouchableOpacity
          onPress={() => setForcedTheme(undefined)}
          style={{
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: forcedTheme === undefined ? '#2563EB' : '#E5E7EB',
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: forcedTheme === undefined ? '#FFFFFF' : '#1F2937',
            }}
          >
            System
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setForcedTheme('light')}
          style={{
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: forcedTheme === 'light' ? '#2563EB' : '#E5E7EB',
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: forcedTheme === 'light' ? '#FFFFFF' : '#1F2937',
            }}
          >
            Light
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setForcedTheme('dark')}
          style={{
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: forcedTheme === 'dark' ? '#2563EB' : '#E5E7EB',
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: forcedTheme === 'dark' ? '#FFFFFF' : '#1F2937',
            }}
          >
            Dark
          </Text>
        </TouchableOpacity>
      </View>

      {/* Themed Content */}
      <ThemeProvider forcedTheme={forcedTheme}>
        <ScrollView>
          <ThemedCard />
          <ThemedCard />
        </ScrollView>
      </ThemeProvider>
    </View>
  );
}

type Story = StoryObj<typeof meta>;

/**
 * Basic usage example
 */
export const BasicUsage: Story = {
  render: () => (
    <ThemeProvider>
      <ScrollView style={{ padding: 16 }}>
        <ThemedCard />
      </ScrollView>
    </ThemeProvider>
  ),
};

/**
 * Interactive demo with manual theme toggle
 */
export const InteractiveDemo: Story = {
  render: () => (
    <View style={{ padding: 16, flex: 1 }}>
      <InteractiveThemeDemo />
    </View>
  ),
};

/**
 * All Semantic Colors Showcase
 */
export const SemanticColorsShowcase: Story = {
  render: () => {
    const theme = useTheme();

    return (
      <ThemeProvider>
        <ScrollView style={{ padding: 16 }}>
          <View
            style={{
              backgroundColor: theme.colorBgNeutralBase,
              padding: 16,
              borderRadius: 12,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: '700',
                color: theme.colorFgNeutralPrimary,
                marginBottom: 16,
              }}
            >
              All Semantic Color Tokens
            </Text>

            {/* Success */}
            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: theme.colorFgNeutralPrimary,
                  marginBottom: 4,
                }}
              >
                Success
              </Text>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <View
                  style={{
                    flex: 1,
                    height: 60,
                    backgroundColor: theme.colorBgPositiveSubtle,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 10, color: theme.colorFgPositivePrimary }}>
                    Subtle
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    height: 60,
                    backgroundColor: theme.colorBgPositiveLow,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 10, color: theme.colorFgPositivePrimary }}>Low</Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    height: 60,
                    backgroundColor: theme.colorBgPositiveStrong,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 10, color: '#FFFFFF' }}>Strong</Text>
                </View>
              </View>
            </View>

            {/* Alert */}
            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: theme.colorFgNeutralPrimary,
                  marginBottom: 4,
                }}
              >
                Alert (Error)
              </Text>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <View
                  style={{
                    flex: 1,
                    height: 60,
                    backgroundColor: theme.colorBgAlertSubtle,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 10, color: theme.colorFgAlertPrimary }}>Subtle</Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    height: 60,
                    backgroundColor: theme.colorBgAlertLow,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 10, color: theme.colorFgAlertPrimary }}>Low</Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    height: 60,
                    backgroundColor: theme.colorBgAlertHigh,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 10, color: '#FFFFFF' }}>High</Text>
                </View>
              </View>
            </View>

            {/* Warning */}
            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: theme.colorFgNeutralPrimary,
                  marginBottom: 4,
                }}
              >
                Attention (Warning)
              </Text>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <View
                  style={{
                    flex: 1,
                    height: 60,
                    backgroundColor: theme.colorBgAttentionSubtle,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 10, color: theme.colorFgAttentionPrimary }}>
                    Subtle
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    height: 60,
                    backgroundColor: theme.colorBgAttentionLow,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 10, color: theme.colorFgAttentionPrimary }}>Low</Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    height: 60,
                    backgroundColor: theme.colorBgAttentionMedium,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 10, color: theme.colorFgAttentionPrimary }}>
                    Medium
                  </Text>
                </View>
              </View>
            </View>

            {/* Information */}
            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: theme.colorFgNeutralPrimary,
                  marginBottom: 4,
                }}
              >
                Information
              </Text>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <View
                  style={{
                    flex: 1,
                    height: 60,
                    backgroundColor: theme.colorBgInformationSubtle,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 10, color: theme.colorFgInformationPrimary }}>
                    Subtle
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    height: 60,
                    backgroundColor: theme.colorBgInformationLow,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 10, color: theme.colorFgInformationPrimary }}>
                    Low
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    height: 60,
                    backgroundColor: theme.colorBgInformationHigh,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 10, color: '#FFFFFF' }}>High</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </ThemeProvider>
    );
  },
};

/**
 * Section header for component showcase
 */
function SectionHeader({ title }: { title: string }) {
  const theme = useTheme();
  return (
    <Text
      style={{
        fontSize: 16,
        fontWeight: '700',
        color: theme.colorFgNeutralPrimary,
        marginTop: 24,
        marginBottom: 12,
      }}
    >
      {title}
    </Text>
  );
}

/**
 * Component showcase content - renders all components
 */
function ComponentShowcaseContent() {
  const theme = useTheme();
  const [toggleValue, setToggleValue] = useState(false);
  const [togglePillValue, setTogglePillValue] = useState(false);
  const [segmentValue, setSegmentValue] = useState('day');
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [dateValue, setDateValue] = useState<Date | undefined>(undefined);

  return (
    <View style={{ backgroundColor: theme.colorBgNeutralBase, flex: 1 }}>
      {/* BUTTONS */}
      <SectionHeader title="Buttons" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Button type="primary" size="medium">Primary</Button>
        <Button type="secondary" size="medium">Secondary</Button>
        <Button type="tertiary" size="medium">Tertiary</Button>
        <Button type="outlined" size="medium">Outlined</Button>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
        <Button type="primary" size="medium" disabled>Disabled</Button>
        <Button type="alert" size="medium">Alert</Button>
      </View>

      {/* INPUTS */}
      <SectionHeader title="Inputs" />
      <View style={{ gap: 12 }}>
        <Input
          label="Text Input"
          placeholder="Enter text..."
          value={inputValue}
          onChangeText={setInputValue}
        />
        <Input
          label="Error State"
          placeholder="Enter text..."
          value=""
          error
          errorMessage="This field is required"
          onChangeText={() => {}}
        />
        <SearchInput
          value={searchValue}
          onChangeText={setSearchValue}
          placeholder="Search..."
        />
        <Textarea
          label="Textarea"
          placeholder="Enter longer text..."
          value={textareaValue}
          onChangeText={setTextareaValue}
          rows={3}
        />
        <Select
          label="Select"
          placeholder="Choose an option"
          value={selectValue}
          onChange={setSelectValue}
          options={[
            { label: 'Option 1', value: 'opt1' },
            { label: 'Option 2', value: 'opt2' },
            { label: 'Option 3', value: 'opt3' },
          ]}
        />
        <DateInput
          label="Date Input"
          value={dateValue}
          onChange={setDateValue}
          showPlaceholder
        />
      </View>

      {/* SELECTION */}
      <SectionHeader title="Selection Controls" />
      <View style={{ gap: 12 }}>
        <Toggle
          label="Toggle Switch"
          value={toggleValue}
          onValueChange={setToggleValue}
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Pill type="neutral">Neutral Pill</Pill>
          <Pill type="positive">Positive</Pill>
          <Pill type="alert">Alert</Pill>
          <Pill type="attention">Attention</Pill>
        </View>
        <TogglePill
          label="Toggle Pill"
          value={togglePillValue}
          onValueChange={setTogglePillValue}
        />
        <SegmentedControl
          options={[
            { value: 'day', label: 'Day' },
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
          ]}
          value={segmentValue}
          onChange={setSegmentValue}
        />
      </View>

      {/* FEEDBACK */}
      <SectionHeader title="Feedback" />
      <View style={{ gap: 8 }}>
        <Toast type="success" title="Success" subtext="Operation completed successfully" />
        <Toast type="error" title="Error" subtext="Something went wrong" />
        <Toast type="warning" title="Warning" subtext="Please review before continuing" />
        <Toast type="info" title="Info" subtext="Here's some helpful information" />
      </View>

      {/* LAYOUT */}
      <SectionHeader title="Layout" />
      <Card>
        <Text style={{ color: theme.colorFgNeutralPrimary, fontWeight: '600' }}>Card Component</Text>
        <Text style={{ color: theme.colorFgNeutralSecondary, marginTop: 4 }}>
          Cards adapt their background and border colors to the current theme.
        </Text>
      </Card>
      <View style={{ marginTop: 12 }}>
        <Container>
          <Text style={{ color: theme.colorFgNeutralPrimary, fontWeight: '600' }}>Container</Text>
          <Text style={{ color: theme.colorFgNeutralSecondary }}>
            Containers provide consistent spacing and backgrounds.
          </Text>
        </Container>
      </View>
    </View>
  );
}

/**
 * Full component showcase with theme toggle
 */
function ComponentShowcaseDemo() {
  const [forcedTheme, setForcedTheme] = useState<'light' | 'dark' | undefined>(undefined);

  return (
    <View style={{ flex: 1 }}>
      {/* Theme Toggle Buttons */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <TouchableOpacity
          onPress={() => setForcedTheme(undefined)}
          style={{
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: forcedTheme === undefined ? '#2563EB' : '#E5E7EB',
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: forcedTheme === undefined ? '#FFFFFF' : '#1F2937',
            }}
          >
            System
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setForcedTheme('light')}
          style={{
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: forcedTheme === 'light' ? '#2563EB' : '#E5E7EB',
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: forcedTheme === 'light' ? '#FFFFFF' : '#1F2937',
            }}
          >
            Light
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setForcedTheme('dark')}
          style={{
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: forcedTheme === 'dark' ? '#2563EB' : '#E5E7EB',
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: forcedTheme === 'dark' ? '#FFFFFF' : '#1F2937',
            }}
          >
            Dark
          </Text>
        </TouchableOpacity>
      </View>

      {/* Themed Component Showcase */}
      <ThemeProvider forcedTheme={forcedTheme}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
          <ComponentShowcaseContent />
        </ScrollView>
      </ThemeProvider>
    </View>
  );
}

/**
 * All design system components with theme toggle
 */
export const ComponentShowcase: Story = {
  render: () => (
    <View style={{ padding: 16, flex: 1 }}>
      <ComponentShowcaseDemo />
    </View>
  ),
};
