# NativeWind Migration: 6-Phase Plan

**Created:** December 16, 2024
**Last Updated:** December 16, 2024
**Purpose:** Migrate RN design system components to CHUI-style structure with NativeWind

---

## Executive Summary

Migrate React Native components from StyleSheet.create approach to NativeWind className-based styling, aligned with CHUI structural patterns while preserving our superior prop interfaces.

**Key Principles:**
- Custom-built from primitives (View, Text, TextInput, Pressable)
- NativeWind `className` for styling with token-backed values
- Margin-based spacing (React Native doesn't support CSS `gap`)
- VStack helper for common repeating patterns (pill groups, card lists, form fields)
- Maintain all existing props and functionality

---

## Phase Overview

| Phase | Description | Status | Effort |
|-------|-------------|--------|--------|
| **Phase 1** | Install & Configure NativeWind | ✅ Complete | - |
| **Phase 2** | Migrate Card & Input to CHUI Structure | ✅ Complete | - |
| **Phase 3** | Sync Tokens + Create Auto-Generator | ✅ Complete | - |
| **Phase 4** | Document Spacing Patterns + Create VStack | ✅ Complete | - |
| **Phase 5** | Migrate Remaining 11 Components | ✅ Complete | - |
| **Phase 6** | Testing & Validation | ⏳ In Progress | 1-2 hrs |

**Total Remaining:** ~7-9 hours

---

## PHASE 1: INSTALL & CONFIGURE NATIVEWIND ✅ Complete

### Completed Tasks

- [x] **Task 1.1:** Install dependencies (`nativewind@^4.2.1`, `tailwindcss@^3.4.19`)
- [x] **Task 1.2:** Initialize Tailwind (`npx tailwindcss init`)
- [x] **Task 1.3:** Configure `tailwind.config.js` with token mapping (47 colors, 15 spacing tokens)
- [x] **Task 1.4:** Configure `babel.config.js` with NativeWind plugin
- [x] **Task 1.5:** Setup TypeScript support (`nativewind-env.d.ts`)
- [x] **Task 1.6:** Configure Metro (`metro.config.js` with `withNativeWind`)
- [x] **Task 1.7:** Create `global.css` with Tailwind directives

### Files Created/Modified
```
sample-apps/react-native-demo/
├── tailwind.config.js      ✅ Created
├── babel.config.js         ✅ Modified
├── metro.config.js         ✅ Modified
├── global.css              ✅ Created
├── nativewind-env.d.ts     ✅ Created
└── index.ts                ✅ Modified (added CSS import)
```

---

## PHASE 2: MIGRATE CARD & INPUT TO CHUI STRUCTURE ✅ Complete

### Completed Tasks

- [x] **Task 2.1:** Migrate `Card.tsx` to NativeWind (7 className usages)
- [x] **Task 2.2:** Migrate `Input.tsx` to NativeWind hybrid approach (12 className usages)

### Migration Pattern Established

**Before (StyleSheet):**
```tsx
const styles = StyleSheet.create({
  container: {
    backgroundColor: colorBgNeutralBase,
    padding: dimensionSpaceAroundMd.number,
    borderRadius: dimensionRadiusSm.number,
  },
});

<View style={styles.container}>
```

**After (NativeWind):**
```tsx
<View className="bg-bg-neutral-base p-around-md rounded-sm">
```

**Hybrid Approach (for state-based styles):**
```tsx
<View
  className="flex-row items-center rounded-sm"
  style={{ borderColor: isFocused ? focusColor : baseColor }}
>
```

---

## PHASE 3: SYNC TOKENS + CREATE AUTO-GENERATOR ✅ Complete

### Why This Phase is Critical

**Current Problem:** Tokens have been updated on React web but not synced to RN. The manual `tailwind.config.js` mappings may be stale.

**Solution:** Create auto-generator script that reads Style Dictionary tokens and outputs Tailwind theme config.

### Task 3.1: Sync Token Definitions

1. Ensure `npm run tokens:build:react-native` is run from project root
2. Verify `src/design-system/tokens/build/react-native/tokens.js` is up to date
3. Compare with web tokens to identify any gaps

### Task 3.2: Create Token Mapper Script

**File:** `scripts/generate-tailwind-theme.js`

```js
/**
 * Auto-generates Tailwind theme config from Style Dictionary tokens
 * Run: npm run tokens:build:tailwind
 */

const fs = require('fs');
const path = require('path');
const tokens = require('../src/design-system/tokens/build/react-native/tokens');

const tokenCategories = {
  colors: {
    prefix: 'color',
    transform: (name, value) => {
      // colorBgNeutralBase → bg-neutral-base
      const cleanName = name
        .replace('color', '')
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .slice(1);
      return { [cleanName]: typeof value === 'string' ? value : value.original };
    },
  },
  spacing: {
    prefix: 'dimensionSpace',
    transform: (name, value) => {
      // dimensionSpaceBetweenCoupled → coupled
      // dimensionSpaceAroundMd → around-md
      let cleanName = name
        .replace('dimensionSpaceBetween', '')
        .replace('dimensionSpaceAround', 'around-')
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase();
      if (cleanName.startsWith('-')) cleanName = cleanName.slice(1);
      return { [cleanName]: value.number || parseInt(value) };
    },
  },
  borderRadius: {
    prefix: 'dimensionRadius',
    transform: (name, value) => {
      const cleanName = name.replace('dimensionRadius', '').toLowerCase();
      return { [cleanName]: value.original || value };
    },
  },
  fontSize: {
    prefix: 'textFontSize',
    transform: (name, value) => {
      const cleanName = name
        .replace('textFontSize', '')
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .slice(1);
      return { [cleanName]: value.original || value };
    },
  },
  lineHeight: {
    prefix: 'textLineHeight',
    transform: (name, value) => {
      const cleanName = name
        .replace('textLineHeight', '')
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .slice(1);
      return { [cleanName]: value.original || value };
    },
  },
  fontWeight: {
    prefix: 'textFontWeight',
    transform: (name, value) => {
      const cleanName = name.replace('textFontWeight', '').toLowerCase();
      return { [cleanName]: value.original || value };
    },
  },
};

function generateTheme() {
  const theme = {
    colors: {},
    spacing: {},
    borderRadius: {},
    fontSize: {},
    lineHeight: {},
    fontWeight: {},
  };

  Object.entries(tokens).forEach(([tokenName, tokenValue]) => {
    for (const [category, config] of Object.entries(tokenCategories)) {
      if (tokenName.startsWith(config.prefix)) {
        const extracted = config.transform(tokenName, tokenValue);
        Object.assign(theme[category], extracted);
        break;
      }
    }
  });

  return theme;
}

// Generate and write
const theme = generateTheme();
const output = `// AUTO-GENERATED - DO NOT EDIT MANUALLY
// Generated from: src/design-system/tokens/build/react-native/tokens.js
// Run: npm run tokens:build:tailwind

module.exports = ${JSON.stringify(theme, null, 2)};
`;

const outputPath = path.join(__dirname, '../src/design-system/tokens/build/react-native/tailwind-theme.js');
fs.writeFileSync(outputPath, output, 'utf-8');

console.log('✅ Generated Tailwind theme');
console.log(`   Colors: ${Object.keys(theme.colors).length}`);
console.log(`   Spacing: ${Object.keys(theme.spacing).length}`);
console.log(`   Border Radius: ${Object.keys(theme.borderRadius).length}`);
console.log(`   Font Sizes: ${Object.keys(theme.fontSize).length}`);
```

### Task 3.3: Add Build Script

**Add to root `package.json`:**
```json
{
  "scripts": {
    "tokens:build:tailwind": "node scripts/generate-tailwind-theme.js"
  }
}
```

### Task 3.4: Update Tailwind Config to Use Generated Theme

**Update `sample-apps/react-native-demo/tailwind.config.js`:**
```js
const generatedTheme = require('../../src/design-system/tokens/build/react-native/tailwind-theme');

module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './index.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
    './.rnstorybook/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      ...generatedTheme,
      // Manual overrides if needed
    },
  },
  plugins: [],
};
```

### Acceptance Criteria
- [ ] Token generator script created and working
- [ ] `npm run tokens:build:tailwind` generates `tailwind-theme.js`
- [ ] `tailwind.config.js` uses generated theme
- [ ] All existing className values still resolve correctly
- [ ] New/updated tokens from web are now available

---

## PHASE 4: DOCUMENT SPACING PATTERNS + CREATE VSTACK ✅ Complete

### Why VStack is Important

**Common patterns in our app that benefit from VStack:**
- Pill/chip groups (event types, tags, filters)
- Card lists (event cards, material cards)
- Form fields (multiple inputs in a form)
- Content sections (repeating info blocks)

### Task 4.1: Create VStack Component

**File:** `sample-apps/react-native-demo/components/VStack.tsx`

```tsx
import React from 'react';
import { View, ViewProps } from 'react-native';

type SpacingToken =
  | 'coupled'      // 4px - tightly coupled
  | 'repeating-sm' // 6px - small repeating items
  | 'repeating'    // 8px - standard repeating items (default)
  | 'related-sm'   // 8px - related elements
  | 'related'      // 16px - related groups
  | 'separated-sm' // 24px - separated sections
  | 'separated';   // 32px - distinct sections

interface VStackProps extends ViewProps {
  /** Spacing between children. Maps to margin-bottom on all but last child. */
  spacing?: SpacingToken;
  /** Additional className for the container */
  className?: string;
  children: React.ReactNode;
}

const spacingClasses: Record<SpacingToken, string> = {
  'coupled': 'mb-coupled',
  'repeating-sm': 'mb-repeating-sm',
  'repeating': 'mb-repeating',
  'related-sm': 'mb-related-sm',
  'related': 'mb-related',
  'separated-sm': 'mb-separated-sm',
  'separated': 'mb-separated',
};

export function VStack({
  spacing = 'repeating',
  className = '',
  children,
  ...props
}: VStackProps) {
  const childArray = React.Children.toArray(children);
  const spacingClass = spacingClasses[spacing];

  return (
    <View className={className} {...props}>
      {childArray.map((child, index) => {
        const isLast = index === childArray.length - 1;

        if (!React.isValidElement(child)) return child;

        // Clone child and add margin class (except for last child)
        return React.cloneElement(child as React.ReactElement<any>, {
          key: index,
          className: isLast
            ? (child.props.className || '')
            : `${child.props.className || ''} ${spacingClass}`.trim(),
        });
      })}
    </View>
  );
}

export default VStack;
```

### Task 4.2: Create HStack Component (Optional)

**File:** `sample-apps/react-native-demo/components/HStack.tsx`

```tsx
import React from 'react';
import { View, ViewProps } from 'react-native';

type SpacingToken = 'coupled' | 'repeating-sm' | 'repeating' | 'related-sm' | 'related';

interface HStackProps extends ViewProps {
  spacing?: SpacingToken;
  className?: string;
  children: React.ReactNode;
}

const spacingClasses: Record<SpacingToken, string> = {
  'coupled': 'mr-coupled',
  'repeating-sm': 'mr-repeating-sm',
  'repeating': 'mr-repeating',
  'related-sm': 'mr-related-sm',
  'related': 'mr-related',
};

export function HStack({
  spacing = 'repeating',
  className = '',
  children,
  ...props
}: HStackProps) {
  const childArray = React.Children.toArray(children);
  const spacingClass = spacingClasses[spacing];

  return (
    <View className={`flex-row ${className}`} {...props}>
      {childArray.map((child, index) => {
        const isLast = index === childArray.length - 1;

        if (!React.isValidElement(child)) return child;

        return React.cloneElement(child as React.ReactElement<any>, {
          key: index,
          className: isLast
            ? (child.props.className || '')
            : `${child.props.className || ''} ${spacingClass}`.trim(),
        });
      })}
    </View>
  );
}

export default HStack;
```

### Task 4.3: Create Spacing Documentation

**File:** `sample-apps/react-native-demo/docs/SPACING-PATTERNS.md`

```markdown
# Spacing Patterns

## Core Principle

React Native does not support CSS `gap`. All spacing uses margin on child elements.

## Two Approaches

### 1. Direct Margin Classes (Simple Cases)

Best for: 2-4 static items with potentially different spacing needs.

```tsx
<View>
  <Text className="mb-coupled">Label</Text>
  <TextInput className="mb-related" />
  <Text>Helper text</Text>
</View>
```

### 2. VStack/HStack Helpers (Repeating Patterns)

Best for: Lists, groups, forms with uniform spacing.

```tsx
// Pill group
<HStack spacing="repeating-sm">
  <Pill label="Event" />
  <Pill label="Outreach" />
  <Pill label="Material" />
</HStack>

// Card list
<VStack spacing="repeating">
  {events.map(event => <EventCard key={event.id} event={event} />)}
</VStack>

// Form fields
<VStack spacing="related">
  <Input label="Email" />
  <Input label="Password" />
  <Button>Submit</Button>
</VStack>
```

## Spacing Token Scale

| Token | Value | Use Case |
|-------|-------|----------|
| `coupled` | 4px | Tightly coupled (label + input) |
| `repeating-sm` | 6px | Small repeating items (pills, tags) |
| `repeating` | 8px | Standard repeating items (cards in a list) |
| `related-sm` | 8px | Related elements within a group |
| `related` | 16px | Related groups within a section |
| `separated-sm` | 24px | Separated sections |
| `separated` | 32px | Distinct major sections |

## When to Use Which

| Scenario | Approach |
|----------|----------|
| Label + Input + Helper | Margin classes |
| Mixed spacing in one group | Margin classes |
| Pill/tag groups | HStack |
| Card lists | VStack |
| Form fields | VStack |
| Dynamic `.map()` lists | VStack/HStack |
| 5+ items uniform spacing | VStack/HStack |
```

### Acceptance Criteria
- [ ] VStack component created and exported
- [ ] HStack component created and exported
- [ ] SPACING-PATTERNS.md documentation created
- [ ] Components added to index exports
- [ ] Storybook stories for VStack/HStack created

---

## PHASE 5: MIGRATE REMAINING 11 COMPONENTS ⏳ Next

### Component Migration Order

**Priority based on usage frequency and dependencies:**

| Order | Component | Current State | Complexity | Notes |
|-------|-----------|---------------|------------|-------|
| 1 | Button | StyleSheet only | High | Most used, many variants |
| 2 | Pill | StyleSheet only | Medium | Used in VStack examples |
| 3 | Container | StyleSheet only | Low | Simple wrapper |
| 4 | Toggle | StyleSheet only | Medium | Animation consideration |
| 5 | TogglePill | StyleSheet only | Medium | Combines Toggle + Pill |
| 6 | SegmentedControl | StyleSheet only | Medium | Uses blur effect |
| 7 | Toast | StyleSheet only | Medium | Positioning/animation |
| 8 | Textarea | StyleSheet only | Low | Similar to Input |
| 9 | SearchInput | StyleSheet only | Low | Input variant |
| 10 | Select | StyleSheet only | High | Bottom sheet integration |
| 11 | DateInput | StyleSheet only | High | Native picker integration |

### Migration Checklist Per Component

For each component:

- [ ] Convert static styles to `className`
- [ ] Keep dynamic/state-based styles as inline `style`
- [ ] Use margin-based spacing (no gap)
- [ ] Preserve all existing props
- [ ] Add `className` prop for customization
- [ ] Update Storybook story to use NativeWind
- [ ] Test all states (default, focus, error, disabled)
- [ ] Test all variants and sizes

### Component Migration Template

```tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';

interface ComponentProps {
  // Keep all existing props
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  // Add className for customization
  className?: string;
}

const sizeClasses = {
  small: 'px-around-xs py-around-2xs text-body-sm',
  medium: 'px-around-sm py-around-xs text-body-md',
  large: 'px-around-md py-around-sm text-body-lg',
};

const variantClasses = {
  primary: 'bg-bg-neutral-inverse text-fg-neutral-inverse-primary',
  secondary: 'bg-bg-neutral-base text-fg-neutral-primary border border-border-neutral-low',
};

export function Component({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = '',
  ...props
}: ComponentProps) {
  return (
    <Pressable
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? 'opacity-50' : ''}
        ${className}
      `}
      disabled={disabled}
      {...props}
    />
  );
}
```

### Acceptance Criteria
- [ ] All 11 components migrated to NativeWind
- [ ] All existing props preserved
- [ ] All Storybook stories updated and working
- [ ] No visual regressions

---

## PHASE 6: TESTING & VALIDATION ⏳ Pending

### Task 6.1: Storybook Validation

```bash
cd sample-apps/react-native-demo
npm run storybook:web
```

**Verify:**
- [ ] All component stories render without errors
- [ ] All variants display correctly
- [ ] Interactive controls work
- [ ] No console errors

### Task 6.2: Device Testing

**iOS Simulator:**
```bash
npm run storybook:ios
```
- [ ] All components render correctly
- [ ] Touch interactions work
- [ ] Animations smooth

**Android Emulator:**
```bash
npm run storybook:android
```
- [ ] All components render correctly
- [ ] Shadows/elevation display correctly (platform differences)
- [ ] Touch interactions work

### Task 6.3: Integration Testing

Test components in actual app screens:

- [ ] MonthScreen renders with migrated components
- [ ] QuarterScreen renders with migrated components
- [ ] YearScreen renders with migrated components
- [ ] All pill groups display correctly
- [ ] All card lists display correctly
- [ ] Forms work correctly

### Task 6.4: Token Sync Validation

- [ ] Compare RN token values with web token values
- [ ] Verify all colors match
- [ ] Verify all spacing values match
- [ ] Verify typography matches

### Acceptance Criteria
- [ ] All Storybook stories pass
- [ ] iOS Simulator testing complete
- [ ] Android Emulator testing complete
- [ ] Integration with app screens verified
- [ ] Token parity with web confirmed

---

## Files Changed Summary

### New Files to Create
```
scripts/
└── generate-tailwind-theme.js          # Phase 3

src/design-system/tokens/build/react-native/
└── tailwind-theme.js                   # Phase 3 (generated)

sample-apps/react-native-demo/
├── components/
│   ├── VStack.tsx                      # Phase 4
│   └── HStack.tsx                      # Phase 4
└── docs/
    ├── NATIVEWIND-6-PHASE-PLAN.md      # This file
    └── SPACING-PATTERNS.md             # Phase 4
```

### Files to Modify
```
package.json                            # Phase 3 (add script)

sample-apps/react-native-demo/
├── tailwind.config.js                  # Phase 3 (use generated theme)
└── components/
    ├── Button.tsx                      # Phase 5
    ├── Pill.tsx                        # Phase 5
    ├── Container.tsx                   # Phase 5
    ├── Toggle.tsx                      # Phase 5
    ├── TogglePill.tsx                  # Phase 5
    ├── SegmentedControl.tsx            # Phase 5
    ├── Toast.tsx                       # Phase 5
    ├── Textarea.tsx                    # Phase 5
    ├── SearchInput.tsx                 # Phase 5
    ├── Select.tsx                      # Phase 5
    └── DateInput.tsx                   # Phase 5
```

### Components Excluded (App-Specific)
- FloatingHeader.tsx
- FloatingBottomNav.tsx
- GradientBackground.tsx

---

## Architecture Summary

```
Token Flow:
Figma → Style Dictionary → tokens.js → generate-tailwind-theme.js → tailwind.config.js
                                              ↓
                                    Components use className

Component Structure:
├── Custom-built from primitives (View, Text, Pressable)
├── NativeWind className for static styles
├── Inline style for dynamic/state-based values
├── VStack/HStack for repeating patterns
└── All existing props preserved

Spacing Strategy:
├── Margin-based (no gap in RN)
├── Direct classes for simple layouts (mb-coupled, mb-related)
├── VStack for vertical lists/groups
├── HStack for horizontal pill/tag groups
└── Token-driven values throughout
```

---

## Next Steps

**Immediate:** Begin Phase 5 - Migrate remaining 11 components

**Start with Button.tsx** - Most used component with many variants.

**Files created in Phase 4:**
- `components/VStack.tsx` - Vertical stack with semantic spacing
- `components/HStack.tsx` - Horizontal stack with semantic spacing
- `components/Stack.ts` - Re-exports both components
- `tokens/LayoutSpacing.stories.tsx` - Documentation and examples
