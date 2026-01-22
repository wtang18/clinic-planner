# Design Token System

This package contains the design tokens exported from Figma and the tools to generate CSS custom properties from them.

**Full documentation:** [Token Architecture](../../docs/architecture/token-architecture.md)

## Token Architecture

The token system supports **multiple product families and themes** through a layered architecture:

```
┌─────────────────────────────────────────────────────────┐
│  Themes (product-specific overrides)                    │
│    └── themes/pro/{ehr, billing, operations, ...}       │
│                              ↓                          │
│  Bases (product family semantics)                       │
│    └── bases/pro/   (dense UI)                         │
│    └── bases/consumer/  (generous spacing)             │
│                              ↓                          │
│  Decorative (named color abstractions)                  │
│                              ↓                          │
│  Primitives (raw values, not for direct use)            │
└─────────────────────────────────────────────────────────┘
```

**Key concepts:**
- **Primitives**: Raw color/typography/dimension values shared by all products
- **Bases**: Product family semantics (Pro = healthcare workers, Consumer = patients)
- **Themes**: Sparse overrides for product-specific accents (EHR = teal, Billing = purple)
- **Light/Dark**: Orthogonal axis - each base has light and dark variants

See [Token Architecture](../../docs/architecture/token-architecture.md) for full details on multi-theme support.

### Layer 1: Primitives (Not for direct use)

**Purpose:** Base values that define the raw design system foundation.

**Collections:**
- `Primitives: Color Ramp` - All color scales (gray, blue, green, etc.)
- `Primitives: Typography` - Font families, sizes, weights, line heights
- `Primitives: Dimensions` - Base spacing values

**Example:**
```css
--color-gray-500: #8c8c8c;
--color-blue-100: #c9e6f0;
--dimension-space-25: 4px;
```

⚠️ **Do not use primitive tokens directly in components.** They are building blocks for semantic tokens.

---

### Layer 2: Semantic (Use in components)

**Purpose:** Contextual tokens that describe intent and support theming/responsive behavior.

**Collections:**
- `Semantic: Color` - Background and foreground colors by context
- `Semantic: Typography` - Text styles with responsive variants
- `Semantic: Dimensions` - Spacing by usage (space-between, space-around, radius)

**Modes:**
- **Color:** `on-light`, `on-dark` - Automatic theme switching
- **Typography:** `small-viewport`, `large-viewport` - Responsive font sizes

**Example:**
```css
/* Semantic tokens reference primitive tokens directly */
--color-bg-neutral-base: var(--color-white-solid);
--color-fg-neutral-primary: var(--color-gray-1000);
--color-bg-positive-high: var(--color-green-600);
--dimension-space-around-default: var(--dimension-space-200);
--dimension-space-around-compact: var(--dimension-space-150);
```

**Usage in components:**
```tsx
// ✅ Good - Use semantic tokens
<div className="bg-[var(--color-bg-neutral-base)] text-[var(--color-fg-neutral-primary)]">

// ❌ Bad - Don't use primitives directly
<div className="bg-[var(--color-gray-50)] text-[var(--color-gray-1000)]">
```

---

## Workflow: Updating Tokens

### 1. Export from Figma

1. Open Figma file with design tokens
2. Go to **Plugins → Export Variables**
3. Export as JSON
4. Save as `design-tokens-variables-full.json` in this directory (`src/design-system/tokens/`)

### 2. Build Tokens with Style Dictionary

Run the token build script:

```bash
npm run tokens:build
```

This runs a two-step process:

**Step 1: Parse Figma JSON** (`npm run tokens:parse`)
- Parses `design-tokens-variables-full.json`
- Resolves variable aliases and modes
- Auto-fills missing primitives (e.g., `dimension.space.0`)
- Generates Style Dictionary-compatible JSON in `sd-input/`

**Step 2: Build with Style Dictionary** (`style-dictionary build`)
- Transforms tokens for multiple platforms
- Generates CSS custom properties (web)
- Generates JavaScript constants (React Native)
- Generates TypeScript definitions
- Outputs to `build/` directory

### 3. Review Generated Files

Check the git diff to see what changed:

```bash
git diff src/design-system/tokens/build/
```

**Generated files:**

**CSS (Web):**
- `index.css` - Imports all CSS tokens
- `primitives-color.css` - Base colors
- `primitives-typography.css` - Base typography
- `primitives-dimensions.css` - Base dimensions
- `decorative-light.css` - Named colors for light theme
- `semantic-light.css` - Semantic tokens for light theme

**JavaScript (React Native):**
- `react-native/tokens.js` - Flat exports with resolved hex values
- `react-native/tokens.d.ts` - TypeScript type definitions

**Intermediate (can be regenerated):**
- `sd-input/*.json` - Style Dictionary source files (10 files)

### 4. Test in Storybook

```bash
npm run storybook
```

Navigate to **Design System → Tokens** to see:
- Token documentation
- Visual examples
- Theme switching (light/dark)
- Responsive typography behavior

### 5. Test Build

Ensure the app builds successfully:

```bash
npm run build
```

### 6. Commit Changes

```bash
git add src/design-system/tokens/
git commit -m "Update design tokens from Figma export"
```

---

## Multi-Platform Support

Style Dictionary generates tokens for multiple platforms from a single source:

### Web (CSS Custom Properties)

```tsx
import '@/design-system/tokens/build/index.css';

// Use CSS variables
<div style={{ backgroundColor: 'var(--color-bg-neutral-base)' }}>
  Hello World
</div>
```

### React Native (JavaScript Constants)

```tsx
import * as tokens from '@carbon-health/design-tokens/react-native';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: tokens.colorBgNeutralBase,  // '#ffffff'
    color: tokens.colorFgNeutralPrimary,         // '#171717'
  }
});
```

For light/dark theme support, use the `ThemeProvider` in your app (see `apps/react-native-demo/theme/`).

**Key difference:**
- **CSS**: Uses `var()` references to maintain token hierarchy
- **React Native**: Uses resolved values (hex codes) since RN doesn't support CSS variables

---

## Token Generation Scripts

```bash
# Build all tokens (parse + Style Dictionary)
npm run tokens:build

# Parse Figma JSON only (generates sd-input/*.json)
npm run tokens:parse

# Clean generated files (build/ and sd-input/)
npm run tokens:clean
```

---

## Theme Switching

The token system supports light/dark themes via `data-theme` attribute:

```tsx
// Set theme on root element
<html data-theme="light">  {/* or "dark" */}
  <body>
    {/* Your app */}
  </body>
</html>
```

When `data-theme="dark"` is set, the CSS automatically switches to dark mode tokens defined in `*-dark.css` files.

**Example:**
```css
/* Light theme (default) */
:root, [data-theme="light"] {
  --color-bg-neutral-base: var(--white-solid);  /* #ffffff */
  --color-fg-neutral-primary: var(--gray-max);  /* #171717 */
}

/* Dark theme */
[data-theme="dark"] {
  --color-bg-neutral-base: var(--gray-max);     /* #171717 */
  --color-fg-neutral-primary: var(--white-solid); /* #ffffff */
}
```

---

## Responsive Typography

Typography tokens automatically adjust based on viewport size using CSS media queries:

```css
/* Small viewport (≤768px) */
@media (max-width: 768px) {
  :root {
    --text-display-lg: 32px;
  }
}

/* Large viewport (≥769px) */
@media (min-width: 769px) {
  :root {
    --text-display-lg: 48px;
  }
}
```

This is particularly useful for expressive typography in marketing/customer-facing areas.

---

## Troubleshooting

### "Cannot resolve alias" warnings

**Problem:** The generation script shows warnings like `⚠️  Warning: Could not resolve alias VariableID:xxx`

**Solution:**
- This means a semantic token references a variable that doesn't exist
- Check the Figma file to ensure all token references are valid
- You may need to re-export from Figma

### Components not using new tokens

**Problem:** After generating tokens, components still use old color values

**Solution:**
- Make sure `src/styles/tokens/index.css` is imported in your app
- Update components to use CSS custom properties: `bg-[var(--color-bg-neutral-base)]`
- Check that Tailwind config references the new CSS variables

### Dark theme not working

**Problem:** Setting `data-theme="dark"` doesn't change colors

**Solution:**
- Ensure `semantic-color-dark.css` and `decorative-color-dark.css` are imported
- Check that the `data-theme` attribute is on a parent element (usually `<html>` or `<body>`)
- Verify components use semantic tokens, not hard-coded primitives

---

## Future: Component Token Layer

As patterns emerge, we may add a **Component Token layer** on top of semantic tokens:

```css
/* Component-specific tokens */
:root {
  --component-card-bg: var(--color-bg-neutral-base);
  --component-card-border: var(--color-bg-neutral-low);
  --component-card-shadow: var(--shadow-default);

  --component-button-primary-bg: var(--color-bg-positive-medium);
  --component-button-primary-fg: var(--color-fg-neutral-inverse-primary);
}
```

This adds another layer of abstraction for components with specific token needs.

---

## Files in This Directory

- **`design-tokens-variables-full.json`** - Source of truth exported from Figma (516+ variables)
- **`README.md`** - This file (documentation and workflow)
- **`build/`** - Generated tokens (CSS, JS, TS) - **DO NOT EDIT**
- **`sd-input/`** - Style Dictionary source files (generated from Figma JSON)
- **`Colors.stories.tsx`** - Storybook documentation for color tokens
- **`Typography.stories.tsx`** - Storybook documentation for typography tokens
- **`Spacing.stories.tsx`** - Storybook documentation for spacing tokens
- **`BorderRadius.stories.tsx`** - Storybook documentation for border radius
- **`Shadows.stories.tsx`** - Storybook documentation for shadows

## Style Dictionary Architecture

Our token system uses a two-step generation process:

```
design-tokens-variables-full.json (Figma export)
    ↓
[scripts/parse-figma-tokens.js]
    ↓
sd-input/*.json (Style Dictionary format)
    ↓
[Style Dictionary (sd.config.js)]
    ↓
build/*.css, build/tokens.js, build/tokens.d.ts
```

**Why two steps?**
1. **Parser handles Figma complexity** - Variable aliases, modes, nested structure
2. **Style Dictionary handles platforms** - Generates CSS, JS, TS from clean JSON
3. **Clean separation** - Easy to debug, easy to modify

**Related files:**
- `scripts/parse-figma-tokens.js` - Figma → Style Dictionary parser
- `sd.config.js` (root) - Style Dictionary configuration

---

## Questions?

If you encounter issues or have questions about the token system:

1. Check this README for common workflows
2. Review the generated CSS files to understand token relationships
3. Check Storybook token documentation for visual examples
4. Ask a teammate or open an issue in the project repo
