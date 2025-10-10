# Design Token System

This directory contains the design tokens exported from Figma and the tools to generate CSS custom properties from them.

## Token Architecture

Our token system follows a **three-layer hierarchy**:

```
┌─────────────────────────────────────────────────────┐
│  Components (use semantic tokens)                   │
│  ↓                                                   │
│  Semantic Tokens (contextual, mode-aware)           │
│  ↓                                                   │
│  Decorative Tokens (named abstractions)             │
│  ↓                                                   │
│  Primitive Tokens (raw values, not for direct use)  │
└─────────────────────────────────────────────────────┘
```

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

### Layer 2: Decorative (Named abstractions)

**Purpose:** Human-readable names that reference primitives, used as an intermediary layer.

**Collections:**
- `Decorative: Color` - Named color abstractions (e.g., `--gray-lowest`, `--blue-mid`)

**Modes:**
- `on-light` - Colors for light theme
- `on-dark` - Colors for dark theme

**Example:**
```css
/* Decorative tokens reference primitives */
--gray-lowest: var(--color-gray-50);
--gray-mid: var(--color-gray-400);
--blue-high: var(--color-blue-600);
```

---

### Layer 3: Semantic (Use in components)

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
/* Semantic tokens reference decorative/primitive tokens */
--color-bg-neutral-base: var(--white-solid);
--color-fg-neutral-primary: var(--gray-max);
--color-bg-positive-high: var(--green-high);
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

### 2. Generate CSS Files

Run the token generation script:

```bash
npm run tokens:generate
```

This will:
- Parse `design-tokens-variables-full.json`
- Generate CSS custom properties in `src/styles/tokens/`
- Create mode-aware files for theming (light/dark)
- Create responsive typography files (small/large viewport)
- Generate an `index.css` that imports everything in the correct order

### 3. Review Generated Files

Check the git diff to see what changed:

```bash
git diff src/styles/tokens/
```

**Generated files:**
- `primitives-color-ramp.css` - All base colors
- `primitives-typography.css` - Base typography tokens
- `primitives-dimensions.css` - Base spacing/dimensions
- `decorative-color-light.css` - Named colors for light theme
- `decorative-color-dark.css` - Named colors for dark theme
- `semantic-color-light.css` - Semantic colors for light theme
- `semantic-color-dark.css` - Semantic colors for dark theme
- `semantic-typography-small.css` - Typography for small viewports
- `semantic-typography-large.css` - Typography for large viewports
- `semantic-dimensions.css` - Semantic spacing tokens
- `index.css` - Imports all token files

### 4. Test in Storybook

```bash
npm run storybook
```

Navigate to **Design System → Tokens** to see:
- Token documentation
- Visual examples
- Theme switching (light/dark)
- Responsive typography behavior

### 5. Commit Changes

```bash
git add src/design-system/tokens/design-tokens-variables-full.json
git add src/styles/tokens/
git commit -m "Update design tokens from Figma export"
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
- **`Colors.stories.tsx`** - Storybook documentation for color tokens
- **`Typography.stories.tsx`** - Storybook documentation for typography tokens
- **`Spacing.stories.tsx`** - Storybook documentation for spacing tokens
- **`BorderRadius.stories.tsx`** - Storybook documentation for border radius
- **`Shadows.stories.tsx`** - Storybook documentation for shadows

---

## Questions?

If you encounter issues or have questions about the token system:

1. Check this README for common workflows
2. Review the generated CSS files to understand token relationships
3. Check Storybook token documentation for visual examples
4. Ask a teammate or open an issue in the project repo
