# React Native vs Web Design System: Platform Differences

This document outlines the differences between the React Native implementation and the web design system, including required platform-specific adaptations and naming conventions.

## Overview

The React Native design system aims to match the web design system as closely as possible while accounting for platform-specific constraints and best practices. This document explains where they differ and why.

---

## Component Props/API Differences

### Button Component

#### ✅ **Matching Props** (Same API between RN and Web)
- `type`: 9 variants (primary, outlined, solid, transparent, generative, high-impact, no-fill, subtle, carby)
- `size`: 5 sizes (x-small, small, medium, large, large-floating)
- `iconOnly`: Boolean for icon-only buttons
- `label`: Button text content
- `subtext`: Secondary inline text
- `showSubtext`: Toggle subtext visibility
- `disabled`: Disabled state
- `state`: Visual state (default, hover, disabled)

#### ⚠️ **Platform-Specific Differences**

| Feature | Web | React Native | Reason |
|---------|-----|--------------|--------|
| **Icon Props** | ✅ `iconL`, `iconR` (icon names) | ✅ `iconL`, `iconR` (icon names) | **NOW MATCHING!** Icon library implemented. Clean API using icon names only. |
| **Event Handlers** | `onClick`, `onMouseDown`, etc. | `onPress`, `onPressIn`, `onPressOut` | Native platform event naming |
| **Accessibility** | `aria-label`, `aria-describedby` | `accessibilityLabel`, `accessibilityHint` | React Native uses different a11y props |
| **HTML Type** | `htmlType` (button/submit/reset) | N/A | No HTML form context in RN |
| **Width** | `inline-flex` (hugs content) | `alignSelf: 'flex-start'` (hugs content) | Different layout systems |
| **Focus Ring** | CSS `:focus-visible` | N/A | RN doesn't have keyboard focus visual indicators by default |

#### ✅ **Icon Library (NOW IMPLEMENTED!)**

React Native now has full icon library support matching the web API:

**Matching Features:**
- ✅ 386 icon names (same as web)
- ✅ `iconL` and `iconR` props (icon library names)
- ✅ 2 sizes: `small` (20px) and `medium` (24px)
- ✅ Automatic icon sizing based on button size
- ✅ BicolorIcon component with semantic status icons

**Platform-Specific Implementation:**

| Aspect | Web | React Native |
|--------|-----|--------------|
| **SVG Rendering** | `dangerouslySetInnerHTML` | `react-native-svg` with `SvgXml` |
| **Icon Maps** | `icon-map.ts` (Vite `?raw` imports) | `icon-map.rn.ts` (inlined SVG strings) |
| **Build Process** | `npm run icons:build` | `npm run icons:build:rn` |
| **Source Files** | Shared SVG files in `src/design-system/icons/small/` and `medium/` | Same source files |

**How It Works:**

The icon library uses a **single source of truth** (SVG files) with **platform-specific build outputs**, similar to design tokens:

1. **Source:** SVG files in `/src/design-system/icons/small/` and `/medium/`
2. **Web Build:** Generates `icon-map.ts` using Vite's `?raw` import syntax
   ```typescript
   // Web: icon-map.ts
   import starIcon from './small/star.svg?raw';
   export const smallIconMap = { './star.svg': starIcon };
   ```
3. **React Native Build:** Generates `icon-map.rn.ts` with inlined SVG strings
   ```typescript
   // RN: icon-map.rn.ts (Metro doesn't support ?raw)
   export const smallIconMap = {
     './star.svg': `<svg>...</svg>`  // SVG content inlined
   };
   ```
4. **Metro Resolution:** Metro bundler automatically selects `.rn.ts` files over `.ts` files for React Native
   ```typescript
   // Both platforms import the same way:
   import { smallIconMap } from '@design-system/icons/icon-map';
   // → Web: icon-map.ts
   // → RN: icon-map.rn.ts (automatically!)
   ```

**Build Scripts:**
```bash
# Generate web icon maps (Vite ?raw imports)
npm run icons:build

# Generate RN icon maps (inlined SVG strings)
npm run icons:build:rn

# Generate both
npm run icons:build:all
```

**Usage Examples:**
```tsx
// Icon library (same API as web)
<Button iconL="star" label="Favorite" />
<Button iconR="chevron-down" label="Menu" />

// BicolorIcon (semantic status icons)
<BicolorIcon name="positive" size="medium" />
<BicolorIcon name="alert-bold" size="small" />
```

#### 🔄 **Remaining Future Updates**

1. **Focus Indicators**
   - Consider adding custom focus indicator system for keyboard navigation
   - May require additional state management

---

## Token Naming Conventions

### ✅ **Current State: MATCHING**

The React Native tokens **already follow the exact same naming convention** as the web design system:

#### Color Tokens
- Format: `color[Category][Level]`
- Examples:
  - `colorBgNeutralBase` ✅
  - `colorFgNeutralPrimary` ✅
  - `colorBgAlertHigh` ✅
  - `colorBgCarbyDefault` ✅

#### Dimension Tokens
- Format: `dimension[Type][Size]`
- Examples:
  - `dimensionRadiusXl` ✅
  - `dimensionSpaceBetweenCoupled` ✅
  - `dimensionSpace400` ✅

#### Typography Tokens
- Format: `text[Property][Category][Size]`
- Examples:
  - `textFontFamilyBody` ✅
  - `textFontSizeBodyMd` ✅
  - `textLineHeightBodyMd` ✅

#### Primitive Tokens
- Format: `font[Type][Scale]`
- Examples:
  - `fontGlobalSans` ✅
  - `fontSize250` ✅
  - `fontWeight500` ✅
  - `fontLetterSpacing400` ✅

### 🎯 **Token Format Differences**

| Aspect | Web | React Native | Reason |
|--------|-----|--------------|--------|
| **Token Access** | CSS variables (`var(--color-bg-*)`) | JavaScript objects (`colorBgNeutralBase`) | Platform API difference |
| **Value Type** | String (`"16px"`, `"#000"`) | Object with `.number`, `.original` properties | RN uses numeric values for dimensions |
| **Naming** | Kebab-case (`--color-bg-neutral-base`) | camelCase (`colorBgNeutralBase`) | JavaScript naming convention |
| **Usage** | `style={{ color: 'var(--color-fg-*)' }}` | `style={{ color: colorFgNeutralPrimary }}` | Different styling systems |

### Token Value Objects (React Native Specific)

React Native tokens are objects with multiple properties:

```javascript
// Example: dimensionRadiusXl
{
  number: 24,        // Numeric value for RN StyleSheet
  original: "24px",  // Original CSS value
  decimal: "1.5rem", // Rem equivalent
  scale: "xl"        // Size scale identifier
}
```

**Usage in Components:**
```javascript
// Use .number for numeric values
borderRadius: dimensionRadiusXl.number  // 24

// Colors are direct strings
backgroundColor: colorBgNeutralBase  // "#181818"
```

---

## Elevation/Shadow Differences

### Web (CSS)
```css
.elevation-md {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.14);
}
```

### React Native
```javascript
// iOS
{
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.14,
  shadowRadius: 8,
}

// Android
{
  elevation: 6,
}

// Web (React Native Web)
{
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.14)',
}
```

**Platform Detection:**
```javascript
import { Platform } from 'react-native';
import { elevation } from '@/design-system/tokens/elevation';

// Automatically applies correct shadow based on platform
<View style={elevation.md} />
```

---

## Typography/Font Loading Differences

### Web
- Fonts loaded via CSS `@font-face` or `<link>` tags
- Automatic fallback chain: `font-family: 'Inter', -apple-system, sans-serif`

### React Native
- **Native (iOS/Android):** Use `expo-font` or React Native's font loading system
- **Web (React Native Web):** Load fonts via `<link>` tags in HTML or CSS
  ```javascript
  // In Storybook preview.tsx
  if (Platform.OS === 'web') {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  ```

**Token Usage:**
```javascript
// Same tokens, different loading mechanism
<Text style={{ fontFamily: textFontFamilyBody }}>  // "Inter"
```

---

## Layout Differences

### Width/Sizing

| Aspect | Web | React Native |
|--------|-----|--------------|
| **Default Button Width** | `inline-flex` (auto-width) | `flex: 0` with `alignSelf: 'flex-start'` |
| **Full Width** | Add `className="w-full"` | Add `style={{ width: '100%', alignSelf: 'stretch' }}` |
| **Flexbox** | CSS Flexbox | React Native Flexbox (slight differences) |

### Gap Property

| Platform | Support | Usage |
|----------|---------|-------|
| **Web** | Native CSS `gap` | `gap: var(--dimension-space-*)` |
| **React Native** | ✅ Supported (RN 0.71+) | `gap: dimensionSpaceBetweenCoupled.number` |

---

## Storybook Differences

### Controls

| Control Type | Web | React Native |
|--------------|-----|--------------|
| **Icon Selection** | Can browse 386+ icons | Must use code (no icon picker) |
| **Color Picker** | Native color picker | Limited color input |
| **Live Reload** | Fast refresh | Fast refresh (mobile slower) |
| **Preview** | Browser | Mobile device or simulator |

### Story Format
- **Same format:** Both use CSF3 (Component Story Format 3)
- **Same API:** `Meta<typeof Component>` and `StoryObj<typeof Component>`
- **Different renderers:** Web uses `@storybook/react`, RN uses `@storybook/react-native`

---

## Accessibility Differences

### Prop Mapping

| Feature | Web | React Native |
|---------|-----|--------------|
| **Label** | `aria-label` | `accessibilityLabel` |
| **Description** | `aria-describedby` | `accessibilityHint` |
| **Role** | `role="button"` | `accessibilityRole="button"` |
| **State** | `aria-disabled="true"` | `accessibilityState={{ disabled: true }}` |
| **Focus Ring** | CSS `:focus-visible` | No built-in equivalent |

### Screen Reader Support
- **Web:** JAWS, NVDA, VoiceOver (Safari)
- **React Native:** TalkBack (Android), VoiceOver (iOS)

---

## Best Practices

### ✅ Do

1. **Keep prop names aligned** where possible between web and RN
2. **Use the same token names** (already matching!)
3. **Document platform-specific differences** clearly
4. **Test on all platforms** (iOS, Android, Web) for RN components
5. **Use platform-specific code** when necessary:
   ```javascript
   import { Platform } from 'react-native';

   const styles = Platform.select({
     ios: { /* iOS-specific */ },
     android: { /* Android-specific */ },
     web: { /* Web-specific */ },
   });
   ```

### ❌ Don't

1. **Don't use different token names** between platforms (currently aligned ✅)
2. **Don't create RN-specific props** without good reason (document if needed)
3. **Don't ignore platform constraints** (e.g., web-only CSS features)
4. **Don't assume web component APIs work in RN** (different event systems)

---

## Summary

### What's Already Aligned ✅
- ✅ Token naming conventions (camelCase in RN, kebab-case in web CSS)
- ✅ Color token structure and names
- ✅ Dimension token structure and names
- ✅ Typography token structure and names
- ✅ Component variant names (types, sizes)
- ✅ Component prop structure (mostly)
- ✅ **Icon library (386 icons, `iconL`/`iconR` props) - NOW IMPLEMENTED!**
- ✅ **BicolorIcon component - NOW IMPLEMENTED!**

### Platform-Specific Adaptations ⚠️
- ⚠️ Event handler names (`onClick` → `onPress`)
- ⚠️ Accessibility prop names (`aria-*` → `accessibility*`)
- ⚠️ Shadow/elevation implementation (iOS/Android/Web)
- ⚠️ Font loading mechanism
- ⚠️ Layout properties (CSS vs RN StyleSheet)
- ⚠️ Icon rendering (SVG injection vs react-native-svg)

### Future Improvements 🔄
- 🔄 Add focus indicator system for keyboard navigation
- 🔄 Consider unified accessibility wrapper (translate `aria-*` to `accessibility*`)
- 🔄 Explore CSS variable support in React Native Web

---

## Reference

- **Web Design System:** `/src/design-system/`
- **React Native Components:** `/sample-apps/react-native-demo/components/`
- **React Native Tokens:** `/src/design-system/tokens/build/react-native/`
- **Web Tokens (CSS):** `/src/design-system/tokens/build/`
