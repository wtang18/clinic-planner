# RN Component Guidelines (AI Reference)

**PURPOSE:** Build RN components matching Button.tsx quality
**TRIGGER:** User says "build [X] following RN component guidelines"
**REFERENCE:** `components/Button.tsx` and `components/Button.stories.tsx`

---

## STEP 1: Component Implementation

### File Location
- **Component:** `components/ComponentName.tsx`
- **Stories:** `components/ComponentName.stories.tsx`

### Required Imports
```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { colorBgX, colorFgX, dimensionX } from '../../../src/design-system/tokens/build/react-native/tokens';
import { elevation } from '../../../src/design-system/tokens/build/react-native/elevation';
import type { IconName } from '../icons';
import { Icon } from '../icons';
```

### Component Structure Template
```typescript
export type ComponentVariant = 'primary' | 'secondary';  // Define variants
export type ComponentSize = 'small' | 'medium' | 'large';  // Define sizes

export interface ComponentProps {
  // Variants
  variant?: ComponentVariant;
  size?: ComponentSize;

  // Content
  label?: string;

  // Icons (use web naming: iconL, iconR)
  iconL?: IconName;
  iconR?: IconName;

  // State
  disabled?: boolean;

  // Events (RN uses onPress not onClick)
  onPress?: () => void;

  // Style
  style?: StyleProp<ViewStyle>;

  // Accessibility (RN naming)
  accessibilityLabel?: string;
  accessibilityHint?: string;

  children?: React.ReactNode;
}

export const ComponentName = React.forwardRef<TouchableOpacity, ComponentProps>(
  ({ variant = 'primary', size = 'medium', disabled = false, onPress, style, accessibilityLabel }, ref) => {

    // Compute styles dynamically based on props
    const getContainerStyle = (): ViewStyle => {
      const sizeStyles: Record<ComponentSize, ViewStyle> = {
        small: { height: 32, paddingHorizontal: 12 },
        medium: { height: 40, paddingHorizontal: 16 },
        large: { height: 56, paddingHorizontal: 24 },
      };

      const variantStyles: Record<ComponentVariant, ViewStyle> = {
        primary: { backgroundColor: colorBgNeutralBase },
        secondary: { backgroundColor: colorBgNeutralSubtle },
      };

      return {
        ...sizeStyles[size],
        ...variantStyles[variant],
        opacity: disabled ? 0.5 : 1,
      };
    };

    return (
      <TouchableOpacity
        ref={ref}
        style={[getContainerStyle(), style]}
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        activeOpacity={0.7}
      >
        {/* Content */}
      </TouchableOpacity>
    );
  }
);

ComponentName.displayName = 'ComponentName';
```

### CRITICAL RULES

#### ✅ ALWAYS DO
1. **Use design tokens only** - Import from `tokens/build/react-native/tokens`
2. **Compute styles dynamically** - Use functions, not static StyleSheet.create
3. **Use Record types** - Ensure exhaustive variant/size mapping
4. **React.forwardRef** - Always support ref forwarding
5. **Set displayName** - For debugging
6. **TouchableOpacity with activeOpacity={0.7}** - Standard interaction
7. **Accessibility attributes** - role, label, hint, state
8. **Disabled opacity: 0.5** - Standard disabled state

#### ❌ NEVER DO
1. Hardcode colors, spacing, or sizes
2. Use StyleSheet.create for variant-dependent styles
3. Use onClick (use onPress)
4. Use aria-label (use accessibilityLabel)
5. Forget disabled state handling

---

## STEP 2: Storybook Documentation

### File Template
```typescript
import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Design System/Components/ComponentName',
  component: ComponentName,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
      description: 'Visual variant',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size',
    },
    disabled: { control: 'boolean' },
    onPress: { action: 'pressed' },
  },
  args: {
    variant: 'primary',
    size: 'medium',
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof ComponentName>;
```

### REQUIRED STORIES (7 minimum)

#### 1. Documentation (MOST IMPORTANT)
```typescript
export const Documentation: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {/* HEADER */}
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8 }}>
        Component Name
      </Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
        One-line description with key features
      </Text>

      {/* QUICK REFERENCE */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Quick Reference
        </Text>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, gap: 8 }}>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Variants:</Text> List all
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Sizes:</Text> List all
          </Text>
        </View>
      </View>

      {/* FEATURES */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Features
        </Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}>✅ Feature 1</Text>
          <Text style={{ fontSize: 14 }}>✅ Feature 2</Text>
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
              {`<ComponentName variant="primary" />`}
            </Text>
            <ComponentName variant="primary" />
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
          <Text style={{ fontSize: 14 }}>✅ Touch targets: 44x44 minimum</Text>
          <Text style={{ fontSize: 14 }}>✅ Screen reader support</Text>
          <Text style={{ fontSize: 14 }}>✅ Color contrast: WCAG AA</Text>
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
          <Text style={{ fontSize: 14 }}>• Do this</Text>
        </View>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
          ❌ Don't
        </Text>
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14 }}>• Don't do this</Text>
        </View>
      </View>

      {/* PLATFORM DIFFERENCES (if applicable) */}
      <View style={{ backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
          React Native vs Web
        </Text>
        <Text style={{ fontSize: 14 }}>
          Key differences between platforms
        </Text>
      </View>
    </ScrollView>
  ),
};
```

#### 2. Playground

**⚠️ CRITICAL: Controls Setup**

For stateful components (like inputs with `value` prop), use this pattern to make controls work:

**✅ CORRECT - Stateful Component:**
```typescript
export const Playground: Story = {
  render: (args) => {  // Accept args parameter
    const [value, setValue] = useState('');
    return (
      <View style={{ padding: 16 }}>
        <Input
          {...args}  // Spread args into component
          value={value}
          onChangeText={setValue}
        />
      </View>
    );
  },
  args: {  // Define all controllable props
    type: 'outlined',
    size: 'medium',
    label: 'Email',
    placeholder: 'you@example.com',
    error: false,
    editable: true,
  },
};
```

**✅ CORRECT - Stateless Component:**
```typescript
export const Playground: Story = {
  args: { variant: 'primary', size: 'medium' },
};
```

**❌ INCORRECT - Controls Won't Work:**
```typescript
// DON'T DO THIS
export const Playground: Story = {
  render: () => {  // Missing args parameter
    const [value, setValue] = useState('');
    return (
      <View style={{ padding: 16 }}>
        <Input
          label="Email"  // Hardcoded props
          value={value}
          onChangeText={setValue}
        />
      </View>
    );
  },
};
```

#### 3. AllVariants
```typescript
export const AllVariants: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={{ gap: 8 }}>
        <ComponentName variant="primary" />
        <ComponentName variant="secondary" />
      </View>
    </ScrollView>
  ),
};
```

#### 4. AllSizes
```typescript
export const AllSizes: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={{ gap: 12 }}>
        <ComponentName size="small" />
        <ComponentName size="medium" />
        <ComponentName size="large" />
      </View>
    </ScrollView>
  ),
};
```

#### 5. States
```typescript
export const States: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={{ gap: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '600' }}>Default</Text>
        <ComponentName />
        <Text style={{ fontSize: 16, fontWeight: '600' }}>Disabled</Text>
        <ComponentName disabled />
      </View>
    </ScrollView>
  ),
};
```

#### 6. RealWorldExamples
```typescript
export const RealWorldExamples: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={{ gap: 20 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>Context 1</Text>
          {/* Show component in realistic usage */}
        </View>
      </View>
    </ScrollView>
  ),
};
```

#### 7. AccessibilityDemo
```typescript
export const AccessibilityDemo: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={{ backgroundColor: '#e3f2fd', padding: 16, borderRadius: 8, gap: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>
          Accessibility Features
        </Text>
        <Text style={{ fontSize: 14 }}>✓ Proper accessibilityRole</Text>
        <Text style={{ fontSize: 14 }}>✓ Descriptive labels</Text>
        <Text style={{ fontSize: 14 }}>✓ State announced</Text>

        {/* Show good and bad examples */}
        <View style={{ gap: 8, marginTop: 8 }}>
          <Text style={{ fontSize: 14, color: '#555' }}>✓ Good example</Text>
          <ComponentName accessibilityLabel="Descriptive label" />

          <Text style={{ fontSize: 14, color: '#555' }}>❌ Bad example (no label)</Text>
          <ComponentName />
        </View>
      </View>
    </ScrollView>
  ),
};
```

---

## QUICK REFERENCE

### Platform Mappings
| Web | React Native |
|-----|-------------|
| `onClick` | `onPress` |
| `aria-label` | `accessibilityLabel` |
| `aria-describedby` | `accessibilityHint` |
| `role` | `accessibilityRole` |
| `aria-disabled` | `accessibilityState={{ disabled }}` |
| `<button>` | `<TouchableOpacity>` |
| `<div>` | `<View>` |
| `<span>` | `<Text>` |
| `className` | `style` |

### Icon Usage & Verification

**⚠️ CRITICAL: Always verify icon names exist in icon library before using them in stories**

**How to Verify:**
1. Check `Design System/Icons/Icon` story in Storybook
2. Use common icons: `search`, `mail`, `lock`, `eye`, `star`, `heart`, `checkmark`, `close`, `alert-triangle`, `info`, `chevron-right`, `chevron-left`, `chevron-down`, `chevron-up`, `arrow-left`, `arrow-right`, `arrow-up`, `arrow-down`, `pencil`, `trash`, `share`, `tag`
3. For bicolor icons: `positive`, `attention`, `alert`, `info`

**Icon Sizing Pattern:**
```typescript
const iconSize = size === 'large' || size === 'large-floating' ? 'medium' : 'small';
<Icon name={iconL} size={iconSize} color={getTextColor()} />
```

**Examples:**
```typescript
// ✅ VALID - Icons exist in library
<Input leftIcon="search" placeholder="Search..." />
<Input leftIcon="mail" placeholder="Email" />
<Button iconL="star" label="Favorite" />
<Pill bicolorIconL="positive" label="Success" />

// ❌ INVALID - These don't exist
<Input leftIcon="magnifying-glass" />  // Use "search" instead
<Input leftIcon="email" />             // Use "mail" instead
<Button iconL="check" />               // Use "checkmark" instead
```

### Gap Pattern
```typescript
const getGap = () => {
  return size === 'small' ? dimensionSpaceBetweenCoupled.number : dimensionSpaceBetweenRelatedSm.number;
};
<View style={{ flexDirection: 'row', gap: getGap() }}>
```

---

## EXECUTION CHECKLIST

When user says "build [X] following RN component guidelines":

### Implementation Phase
- [ ] Create `components/ComponentName.tsx`
- [ ] Import design tokens (no hardcoded values)
- [ ] Define TypeScript types (variants, sizes, props)
- [ ] Use React.forwardRef
- [ ] Set displayName
- [ ] Implement dynamic style functions with Record types
- [ ] Use TouchableOpacity with activeOpacity={0.7}
- [ ] Add full accessibility attributes
- [ ] Handle disabled state (opacity 0.5)
- [ ] Support icon props if applicable (iconL, iconR)

### Documentation Phase
- [ ] Create `components/ComponentName.stories.tsx`
- [ ] Set up meta with argTypes and default args
- [ ] Create Documentation story (comprehensive)
- [ ] Create Playground story (use `render: (args)` pattern for stateful components)
- [ ] Verify Playground controls work by spreading `{...args}`
- [ ] **Verify all icon names exist in icon library** (check Icon story)
- [ ] Create AllVariants story
- [ ] Create AllSizes story
- [ ] Create States story
- [ ] Create RealWorldExamples story
- [ ] Create AccessibilityDemo story

### Regenerate Storybook
- [ ] Run `npx sb-rn-get-stories` to update requires file

---

## BEFORE STARTING

Ask these questions if unclear:
1. Does this component exist in web design system? (If yes, read web version first)
2. What variants does it have?
3. What sizes does it support?
4. Does it use icons?
5. What are the interactive states?
6. Any platform-specific behaviors?

---

**Last Updated:** 2025-10-16
**Reference Implementation:** `components/Button.tsx` + `components/Button.stories.tsx`
