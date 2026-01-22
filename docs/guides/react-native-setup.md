# React Native Migration Guide

Complete guide for implementing this design system in a React Native application.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Token System Setup](#token-system-setup)
3. [Component Migration Strategy](#component-migration-strategy)
4. [Platform-Specific Considerations](#platform-specific-considerations)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

```bash
# Ensure you have the React Native CLI or Expo installed
npm install -g react-native-cli
# or
npm install -g expo-cli
```

### Build React Native Tokens

```bash
# Generate React Native token files
npm run tokens:build:react-native

# Or build both web and React Native tokens
npm run tokens:build:all
```

This creates:
- `src/design-system/tokens/build/react-native/tokens.js` - All design tokens as JS objects
- `src/design-system/tokens/build/react-native/elevation.ts` - Platform-specific shadows
- `src/design-system/tokens/build/react-native/text-styles.ts` - Text style utilities
- `src/design-system/tokens/build/react-native/fonts.ts` - Font loading configuration

---

## Token System Setup

### 1. Install Design System Package

```bash
# In your React Native app
npm install @your-org/design-system
# or copy the design-system folder directly
```

### 2. Load Fonts

**For Expo:**

```typescript
// app/_layout.tsx
import { useFonts } from 'expo-font';
import { fontAssets } from '@/design-system/tokens/build/react-native/fonts';

export default function RootLayout() {
  const [fontsLoaded] = useFonts(fontAssets);

  if (!fontsLoaded) {
    return null; // or <SplashScreen />
  }

  return <YourApp />;
}
```

**For React Native CLI:**

```bash
# Link fonts
npx react-native-asset
```

```javascript
// react-native.config.js
module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./node_modules/@your-org/design-system/assets/fonts'],
};
```

### 3. Import Tokens

```typescript
import { tokens } from '@/design-system/tokens/build/react-native/tokens';
import { textStyles } from '@/design-system/tokens/build/react-native/text-styles';
import { elevation } from '@/design-system/tokens/build/react-native/elevation';
```

### 4. Use Tokens in StyleSheet

```typescript
import { StyleSheet, View, Text } from 'react-native';
import { tokens, textStyles, elevation } from '@/design-system/tokens/build/react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: tokens.color.bg.primary,
    padding: tokens.dimension.space.around.md,
    borderRadius: tokens.dimension.radius.md,
    ...elevation.lg,
  },
  text: {
    ...textStyles.body.md.regular,
    color: tokens.color.fg.primary,
  },
});

export function MyComponent() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello World</Text>
    </View>
  );
}
```

---

## Component Migration Strategy

### Phase 1: Extract Shared Logic

Create platform-agnostic logic files:

```
src/design-system/components/Button/
├── Button.types.ts       # Shared types
├── Button.logic.ts       # Shared state management
├── Button.web.tsx        # Web implementation
├── Button.native.tsx     # React Native implementation
└── index.ts              # Platform resolver
```

**Button.types.ts:**
```typescript
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  leftIcon?: string;
  rightIcon?: string;
}

export interface ButtonState {
  pressed: boolean;
  hovered: boolean;
}
```

**Button.logic.ts:**
```typescript
import { useState } from 'react';
import { ButtonProps, ButtonState } from './Button.types';

export function useButtonState(props: ButtonProps): ButtonState {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);

  return {
    pressed,
    hovered,
    setPressed,
    setHovered,
  };
}

export function getButtonStyles(
  variant: ButtonProps['variant'],
  size: ButtonProps['size'],
  state: ButtonState
) {
  // Shared style calculation logic
  return {
    variant,
    size,
    isPressed: state.pressed,
    isHovered: state.hovered,
  };
}
```

### Phase 2: Implement React Native Components

**Button.native.tsx:**
```typescript
import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { tokens, textStyles, elevation } from '@/design-system/tokens/build/react-native';
import { Icon } from '@/design-system/icons';
import { ButtonProps } from './Button.types';
import { useButtonState } from './Button.logic';

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onPress,
  children,
  leftIcon,
  rightIcon,
}) => {
  const state = useButtonState({ variant, size, disabled, onPress, children });

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[size],
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {({ pressed }) => (
        <View style={styles.content}>
          {leftIcon && <Icon name={leftIcon} size="small" />}
          <Text style={[styles.text, styles[`${variant}Text`]]}>
            {children}
          </Text>
          {rightIcon && <Icon name={rightIcon} size="small" />}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: tokens.dimension.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.dimension.space.around.xs,
  },

  // Variants
  primary: {
    backgroundColor: tokens.color.bg.brand.primary,
    ...elevation.sm,
  },
  secondary: {
    backgroundColor: tokens.color.bg.brand.secondary,
    borderWidth: 1,
    borderColor: tokens.color.border.neutral.default,
  },
  tertiary: {
    backgroundColor: 'transparent',
  },

  // Sizes
  small: {
    paddingVertical: tokens.dimension.space.around.xs,
    paddingHorizontal: tokens.dimension.space.around.sm,
    minHeight: 32,
  },
  medium: {
    paddingVertical: tokens.dimension.space.around.sm,
    paddingHorizontal: tokens.dimension.space.around.md,
    minHeight: 40,
  },
  large: {
    paddingVertical: tokens.dimension.space.around.md,
    paddingHorizontal: tokens.dimension.space.around.lg,
    minHeight: 48,
  },

  // Text styles
  text: {
    ...textStyles.label.md.medium,
  },
  primaryText: {
    color: tokens.color.fg.on.brand,
  },
  secondaryText: {
    color: tokens.color.fg.brand.primary,
  },
  tertiaryText: {
    color: tokens.color.fg.brand.primary,
  },

  // States
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
});
```

### Phase 3: Platform Resolver

**index.ts:**
```typescript
// React Native's Metro bundler automatically picks .native.tsx for React Native
export { Button } from './Button';
export type { ButtonProps } from './Button.types';
```

---

## Platform-Specific Considerations

### 1. **No CSS/Tailwind in React Native**

**Web (Current):**
```tsx
<div className="bg-[var(--color-bg-primary)] p-4 rounded-lg" />
```

**React Native:**
```tsx
<View style={{
  backgroundColor: tokens.color.bg.primary,
  padding: tokens.dimension.space.around.md,
  borderRadius: tokens.dimension.radius.lg,
}} />
```

### 2. **Shadows: iOS vs Android**

```typescript
import { Platform } from 'react-native';
import { elevation } from '@/design-system/tokens/build/react-native/elevation';

// Automatic platform detection
<View style={[styles.card, elevation.lg]} />

// Manual platform detection
const cardStyle = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
  },
  android: {
    elevation: 8,
  },
});
```

### 3. **No Backdrop Blur**

**Web:**
```css
backdrop-filter: blur(20px);
```

**React Native:**
```tsx
import { BlurView } from 'expo-blur';

<BlurView intensity={80} tint="light" style={styles.frostedGlass}>
  {children}
</BlurView>
```

### 4. **Typography Classes → StyleSheet**

**Web:**
```tsx
<p className="text-body-md-medium">Hello</p>
```

**React Native:**
```tsx
import { textStyles } from '@/design-system/tokens/build/react-native/text-styles';

<Text style={textStyles.body.md.medium}>Hello</Text>
```

### 5. **Touchable Components**

| Web | React Native |
|-----|--------------|
| `<button>` | `<Pressable>` or `<TouchableOpacity>` |
| `:hover` | `onPressIn` / `onPressOut` |
| `:active` | `({ pressed }) => [...]` |
| `:focus` | `onFocus` / `onBlur` |

### 6. **Responsive Design**

**Web: Media queries**
```css
@media (min-width: 768px) { ... }
```

**React Native: Dimensions API**
```typescript
import { Dimensions, useWindowDimensions } from 'react-native';

function MyComponent() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <View style={isTablet ? styles.tablet : styles.mobile}>
      {/* ... */}
    </View>
  );
}
```

### 7. **Icons**

Ensure icons are React Native compatible:

```typescript
// May need to use react-native-svg
import { Svg, Path } from 'react-native-svg';

export function Icon({ name, size }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="..." fill="currentColor" />
    </Svg>
  );
}
```

---

## Best Practices

### 1. **Create Responsive Helpers**

```typescript
// src/design-system/utils/responsive.ts
import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 390; // iPhone 12 Pro

export function scale(size: number): number {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
}

export function moderateScale(size: number, factor: number = 0.5): number {
  return size + (scale(size) - size) * factor;
}

export function isTablet(): boolean {
  return SCREEN_WIDTH >= 768;
}
```

### 2. **Use Semantic Tokens**

```typescript
// ✅ Good - Uses semantic tokens
backgroundColor: tokens.color.bg.primary

// ❌ Bad - Uses primitive tokens
backgroundColor: tokens.color.neutral[50]
```

### 3. **Keep Component Logic Platform-Agnostic**

```typescript
// ✅ Good - Platform-agnostic logic
function useFormValidation(value: string) {
  return value.length >= 3;
}

// ❌ Bad - Platform-specific logic mixed in
function useFormValidation(value: string, platform: 'web' | 'native') {
  if (platform === 'web') {
    // web-specific code
  }
}
```

### 4. **Share Types and Interfaces**

```typescript
// Shared across web and native
export interface CardProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  interactive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onPress?: () => void;
}
```

### 5. **Use StyleSheet.create()**

```typescript
// ✅ Good - Optimized
const styles = StyleSheet.create({
  container: {
    backgroundColor: tokens.color.bg.primary,
  },
});

// ❌ Bad - Creates new object on every render
<View style={{ backgroundColor: tokens.color.bg.primary }} />
```

### 6. **Handle Platform-Specific Edge Cases**

```typescript
import { Platform, StatusBar } from 'react-native';

const styles = StyleSheet.create({
  container: {
    // Add safe area padding for iOS notch
    paddingTop: Platform.OS === 'ios' ? StatusBar.currentHeight || 44 : 0,
  },
});
```

---

## Troubleshooting

### Fonts Not Loading

```typescript
// Make sure fonts are loaded before rendering
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return <YourApp />;
}
```

### Shadows Not Showing on Android

```typescript
// Android requires elevation AND backgroundColor
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF', // Required for elevation to work!
    ...elevation.lg,
  },
});
```

### Token Values Not Updating

```bash
# Rebuild tokens
npm run tokens:build:react-native

# Clear Metro bundler cache
npx react-native start --reset-cache
# or for Expo
npx expo start -c
```

### TypeScript Errors with Tokens

```typescript
// Make sure you're importing from the correct path
import { tokens } from '@/design-system/tokens/build/react-native/tokens';

// Not from the web build
// import { tokens } from '@/design-system/tokens/build/tokens'; // ❌
```

---

## Migration Checklist

### Initial Setup
- [ ] Run `npm run tokens:build:react-native`
- [ ] Copy font files to `assets/fonts`
- [ ] Set up font loading (Expo or CLI)
- [ ] Test token imports

### Component Migration
- [ ] Extract shared types and logic
- [ ] Create `.native.tsx` versions of components
- [ ] Implement platform-specific styling
- [ ] Handle shadows/elevation
- [ ] Replace backdrop-blur with BlurView where needed
- [ ] Test on iOS and Android

### Testing
- [ ] Visual regression testing
- [ ] Accessibility testing (screen readers)
- [ ] Performance testing (StyleSheet optimization)
- [ ] Test on multiple screen sizes
- [ ] Test light/dark mode

### Documentation
- [ ] Document React Native-specific props
- [ ] Add React Native usage examples to Storybook equivalent
- [ ] Update component README files

---

## Resources

- [React Native Documentation](https://reactnative.dev)
- [Style Dictionary Documentation](https://amzn.github.io/style-dictionary)
- [React Native Shadow Generator](https://ethercreative.github.io/react-native-shadow-generator/)
- [React Navigation](https://reactnavigation.org) - for app navigation
- [Expo](https://expo.dev) - for rapid development

---

## Next Steps

1. Run `npm run tokens:build:react-native` to generate React Native tokens
2. Start with simple components (Button, Card, Text)
3. Test on both iOS and Android simulators
4. Gradually migrate more complex components
5. Set up Storybook for React Native (optional but recommended)

For questions or issues, refer to the main [DOCUMENTATION_GUIDELINES.md](../src/design-system/DOCUMENTATION_GUIDELINES.md).
