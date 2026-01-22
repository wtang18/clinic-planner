# NativeWind Migration Status

**Last Updated:** December 18, 2024
**Status:** Phases 1-6 Complete

> **See full plan:** [docs/NATIVEWIND-6-PHASE-PLAN.md](docs/NATIVEWIND-6-PHASE-PLAN.md)

---

## Completed Phases

### Phase 1: Configuration ✅
- [x] Installed `nativewind@^4` and `tailwindcss@^3.4`
- [x] Created `tailwind.config.js` with 47 color tokens + 15 spacing tokens
- [x] Created `global.css` with Tailwind directives
- [x] Created `babel.config.js` with NativeWind + Reanimated plugins
- [x] Updated `metro.config.js` with `withNativeWind()` wrapper
- [x] Created `nativewind-env.d.ts` for TypeScript support
- [x] Updated `tsconfig.json` to include type definitions
- [x] Added `import './global.css'` to `index.ts`

### Phase 2: Initial Component Migration ✅
- [x] **Card.tsx** - Full NativeWind migration (196→177 lines)
- [x] **Input.tsx** - Hybrid migration (480→297 lines)

### Phase 3: Token Sync & Auto-Generator ✅
- [x] Token generator script created
- [x] `npm run tokens:build:tailwind` generates `tailwind-theme.js`
- [x] `tailwind.config.js` uses generated theme

### Phase 4: VStack/HStack & Documentation ✅
- [x] VStack component created
- [x] HStack component created
- [x] Stack.stories.tsx documentation created
- [x] Spacing patterns documented

### Phase 5: Migrate Remaining 11 Components ✅

All 11 components successfully migrated to NativeWind:

| Component | Status | Line Reduction | Notes |
|-----------|--------|----------------|-------|
| Button.tsx | ✅ | ~390→287 | Size/text/gap classes |
| Pill.tsx | ✅ | 444→370 | Computed colors for variants |
| Container.tsx | ✅ | 214→184 | Gap classes |
| Toggle.tsx | ✅ | Hybrid | Animation requires inline styles |
| TogglePill.tsx | ✅ | 282→219 | Size/text class mappings |
| SegmentedControl.tsx | ✅ | 263→173 | BlurView + NativeWind |
| Toast.tsx | ✅ | 291→219 | Elevation tokens |
| Textarea.tsx | ✅ | 377→257 | State-based border/bg colors |
| SearchInput.tsx | ✅ | 301→179 | Pill-shaped, focus states |
| Select.tsx | ✅ | 508→327 | Platform-specific pickers |
| DateInput.tsx | ✅ | 549→340 | Tablet detection, native pickers |

**Migration Pattern Applied:**
- Static layout classes moved to `className` prop
- Size variants defined as NativeWind class mappings
- Dynamic/computed values (colors based on state) kept as inline `style`
- Added `className` prop to all components for customization
- Animation-related styles kept inline (Toggle component)

---

### Phase 6: Testing & Validation ✅

- [x] Run Storybook and verify all stories render
- [x] Test all component variants
- [x] Fix critical NativeWind issues (see below)
- [ ] Test on iOS Simulator (optional)
- [ ] Test on Android Emulator (optional)

#### Critical Fixes Applied (Dec 18, 2024)

**1. LineHeight Fix**
NativeWind interprets unitless `lineHeight` values as multipliers (e.g., `leading-body-sm: 20` = 20× font size = 280px!).

**Solution:** Remove all `leading-*` classes and use inline `lineHeight`:
```tsx
// ❌ Before - causes 280px height
<Text className="text-body-sm leading-body-sm">

// ✅ After - correct 20px height
<Text className="text-body-sm" style={{ lineHeight: 20 }}>
```

**2. Input Text Vertical Alignment**
Text appeared slightly low within input fields.

**Solution:** Apply 1px upward nudge:
```tsx
style={{ transform: [{ translateY: -1 }] }}
```

**3. Gap-Based Spacing**
Using `mb-coupled`/`mt-coupled` on individual elements caused inconsistent spacing.

**Solution:** Use `gap-coupled` on parent container:
```tsx
// ❌ Before
<View>
  <Text className="mb-coupled">Label</Text>
  <TextInput />
  <Text className="mt-coupled">Helper</Text>
</View>

// ✅ After
<View className="gap-coupled">
  <Text>Label</Text>
  <TextInput />
  <Text>Helper</Text>
</View>
```

**4. Prevent Label/Helper Stretching**
Flex children stretched to fill container height.

**Solution:** Add `self-start` to text elements:
```tsx
<Text className="text-body-sm self-start" style={{ lineHeight: 20 }}>
```

**5. Remove Browser Focus Outline**
Web rendered inputs showed double focus indicators.

**Solution:** Add to TextInput style:
```tsx
style={{ outlineStyle: 'none' }}
```

**Components Updated:**
- Input.tsx, Textarea.tsx, SearchInput.tsx, Select.tsx, DateInput.tsx
- Button.tsx, Pill.tsx, Toggle.tsx, TogglePill.tsx
- Toast.tsx, SegmentedControl.tsx

---

## Key Files Changed

```
sample-apps/react-native-demo/
├── tailwind.config.js          # Token mappings
├── global.css                  # Tailwind imports
├── babel.config.js             # NativeWind babel config
├── nativewind-env.d.ts         # TypeScript types
├── metro.config.js             # withNativeWind wrapper
├── tsconfig.json               # Type includes
├── index.ts                    # CSS import
└── components/
    ├── Card.tsx                # ✅ Migrated
    ├── Input.tsx               # ✅ Migrated
    ├── Button.tsx              # ✅ Migrated
    ├── Pill.tsx                # ✅ Migrated
    ├── Container.tsx           # ✅ Migrated
    ├── Toggle.tsx              # ✅ Migrated (hybrid)
    ├── TogglePill.tsx          # ✅ Migrated
    ├── SegmentedControl.tsx    # ✅ Migrated
    ├── Toast.tsx               # ✅ Migrated
    ├── Textarea.tsx            # ✅ Migrated
    ├── SearchInput.tsx         # ✅ Migrated
    ├── Select.tsx              # ✅ Migrated
    ├── DateInput.tsx           # ✅ Migrated
    ├── VStack.tsx              # ✅ Created (Phase 4)
    └── HStack.tsx              # ✅ Created (Phase 4)
```

---

## Token Mapping Summary

The `tailwind.config.js` maps your design tokens to Tailwind classes:

| Token Category | Example Token | Tailwind Class |
|---------------|---------------|----------------|
| Background | `colorBgNeutralBase` | `bg-bg-neutral-base` |
| Foreground | `colorFgNeutralPrimary` | `text-fg-neutral-primary` |
| Spacing | `dimensionSpaceBetweenCoupled` (4px) | `gap-coupled`, `mb-coupled` |
| Border Radius | `dimensionRadiusSm` (8px) | `rounded-sm` |
| Font Size | `textFontSizeBodySm` | `text-body-sm` |

---

## NativeWind v4 Patterns Used

```tsx
// Direct className on RN components (no styled() wrapper needed)
<View className="flex-row items-center bg-bg-neutral-base rounded-sm">
  <Text className="text-body-sm text-fg-neutral-primary">Hello</Text>
</View>

// Combining className with style for dynamic values
<View
  className="flex-row items-center"
  style={{ backgroundColor: dynamicColor }}
>

// Size variant class mappings
const sizeClasses: Record<'small' | 'medium' | 'large', string> = {
  small: 'h-8',
  medium: 'h-10',
  large: 'h-14',
};

// Using custom className prop
<Card className="border border-border-neutral-low" />
```

---

## Completed Enhancements

### Tailwind Theme Generator LineHeight Fix ✅

**Issue:** `tailwind-theme.generated.js` output numeric lineHeight values (e.g., `20`), which NativeWind interpreted as multipliers instead of pixels.

**Fix Applied (Dec 18, 2024):**
Updated `scripts/generate-tailwind-theme.js` to output lineHeight values with `px` suffix:
```js
// Before (broken) - interpreted as 20× multiplier = 280px
"lineHeight": { "body-sm": 20 }

// After (fixed) - interpreted as 20px
"lineHeight": { "body-sm": "20px" }
```

**Benefit:** `leading-body-sm` classes now work correctly. Future components can use NativeWind classes instead of inline `lineHeight` styles.

**Note:** Existing components still use inline `lineHeight` for backward compatibility. They can optionally be updated to use `leading-*` classes.

---

## Future Enhancements

### Dark Mode Support for Components

**Current State:**
- Components use direct token imports (e.g., `colorBgNeutralBase`)
- Tokens are static light-mode values
- Storybook uses a decorator to force light backgrounds for readability

**Infrastructure Already in Place:**
- `theme/ThemeProvider.tsx` - Context provider with `forcedTheme` prop
- `theme/tokens.ts` - Complete `lightTokens` and `darkTokens` mappings
- `useTheme()` hook - Returns current theme tokens
- `useThemeMode()` hook - Returns 'light' or 'dark'

**To Enable Dark Mode:**

1. **Update components to use `useTheme()` hook:**
   ```tsx
   // Before (static)
   import { colorBgNeutralBase } from '../tokens';
   <View style={{ backgroundColor: colorBgNeutralBase }} />

   // After (dynamic)
   import { useTheme } from '../theme';
   const theme = useTheme();
   <View style={{ backgroundColor: theme.colorBgNeutralBase }} />
   ```

2. **Wrap app with ThemeProvider:**
   ```tsx
   <ThemeProvider>
     <App />
   </ThemeProvider>
   ```

3. **For manual theme control:**
   ```tsx
   <ThemeProvider forcedTheme="dark">
     <App />
   </ThemeProvider>
   ```

**Effort Estimate:** Medium - requires updating all component token imports to use the hook pattern.
