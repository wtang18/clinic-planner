# Composite Tokens Analysis: Typography & Shadows

## Current State: How Typography is Handled

### ❌ Current Approach: Atomic Tokens Only

Our current system generates **individual atomic tokens** for each typography property:

```css
/* Generated from semantic-typography-small.css */
--text-font-family-body: var(--font-global-sans);
--text-font-size-body-md: var(--font-size-300);        /* 16px */
--text-line-height-body-md: var(--font-line-height-400); /* 24px */
--text-font-weight-body-medium: var(--font-weight-500);
--text-letter-spacing-body: var(--font-letter-spacing-400);
```

**Usage in code requires 5+ properties:**
```tsx
<p className="
  font-[var(--text-font-family-body)]
  text-[var(--text-font-size-body-md)]
  leading-[var(--text-line-height-body-md)]
  font-[var(--text-font-weight-body-medium)]
  tracking-[var(--text-letter-spacing-body)]
  text-[var(--color-fg-neutral-primary)]
">
  Body text medium weight
</p>
```

**Problems:**
- 🔴 Verbose and error-prone
- 🔴 Easy to mix incompatible tokens (e.g., `body-md` size with `heading-xl` line-height)
- 🔴 No guarantee of visual consistency
- 🔴 Doesn't match Figma workflow (designers use text styles, not individual properties)

---

## Solution Options for Composite Tokens

### Option 1: CSS Utility Classes (Recommended ⭐)

Create CSS utility classes that bundle atomic tokens together.

**Implementation:**

```css
/* src/design-system/tokens/build/text-styles.css */
/* Generated or manually maintained */

.text-body-md-regular {
  font-family: var(--text-font-family-body);
  font-size: var(--text-font-size-body-md);
  line-height: var(--text-line-height-body-md);
  font-weight: var(--text-font-weight-body-regular);
  letter-spacing: var(--text-letter-spacing-body);
}

.text-body-md-medium {
  font-family: var(--text-font-family-body);
  font-size: var(--text-font-size-body-md);
  line-height: var(--text-line-height-body-md);
  font-weight: var(--text-font-weight-body-medium);
  letter-spacing: var(--text-letter-spacing-body);
}

.text-heading-xl-bold {
  font-family: var(--text-font-family-heading);
  font-size: var(--text-font-size-heading-xl);
  line-height: var(--text-line-height-heading-xl);
  font-weight: var(--text-font-weight-heading-bold);
  letter-spacing: var(--text-letter-spacing-heading);
}

/* Shadow utilities */
.shadow-sm {
  box-shadow:
    var(--shadow-sm-offset-x, 0px)
    var(--shadow-sm-offset-y, 1px)
    var(--shadow-sm-blur, 3px)
    var(--shadow-sm-spread, 0px)
    var(--shadow-sm-color, rgba(0, 0, 0, 0.1));
}

.shadow-elevated {
  box-shadow:
    0px 2px 8px 0px var(--color-shadow-elevated, rgba(0, 0, 0, 0.16));
}
```

**Usage:**
```tsx
<p className="text-body-md-medium text-fg-neutral-primary">
  Simple and clean!
</p>

<button className="shadow-elevated">
  Elevated button
</button>
```

**Pros:**
- ✅ Simple, familiar pattern (like Tailwind)
- ✅ Single class applies all properties
- ✅ Works with existing Tailwind setup
- ✅ Easy to override individual properties
- ✅ Good TypeScript autocomplete support

**Cons:**
- ⚠️ Need to generate/maintain CSS file
- ⚠️ Adds to bundle size (but tree-shakeable with PurgeCSS)

---

### Option 2: Tailwind Plugin (Most Integrated)

Extend Tailwind with custom utilities for composite tokens.

**Implementation:**

```js
// tailwind.config.js
const plugin = require('tailwindcss/plugin');

module.exports = {
  plugins: [
    plugin(function({ addUtilities, theme }) {
      // Typography composites
      const textStyles = {
        '.text-body-md-regular': {
          fontFamily: 'var(--text-font-family-body)',
          fontSize: 'var(--text-font-size-body-md)',
          lineHeight: 'var(--text-line-height-body-md)',
          fontWeight: 'var(--text-font-weight-body-regular)',
          letterSpacing: 'var(--text-letter-spacing-body)',
        },
        '.text-body-md-medium': {
          fontFamily: 'var(--text-font-family-body)',
          fontSize: 'var(--text-font-size-body-md)',
          lineHeight: 'var(--text-line-height-body-md)',
          fontWeight: 'var(--text-font-weight-body-medium)',
          letterSpacing: 'var(--text-letter-spacing-body)',
        },
        // ... more styles
      };

      // Shadow composites
      const shadows = {
        '.shadow-elevated': {
          boxShadow: '0px 2px 8px 0px var(--color-shadow-elevated)',
        },
        '.shadow-floating': {
          boxShadow: '0px 4px 16px 0px var(--color-shadow-floating)',
        },
      };

      addUtilities({ ...textStyles, ...shadows });
    }),
  ],
};
```

**Usage:**
```tsx
<p className="text-body-md-medium text-fg-neutral-primary">
  Integrated with Tailwind!
</p>
```

**Pros:**
- ✅ Native Tailwind integration
- ✅ Works with all Tailwind features (variants, responsive, etc.)
- ✅ Better IntelliSense in VS Code
- ✅ Can be variant-aware: `hover:text-body-lg-bold`

**Cons:**
- ⚠️ More complex setup
- ⚠️ Need to keep plugin in sync with token changes

---

### Option 3: Style Dictionary Composite Token Type

Use Style Dictionary's `composite` type to generate bundled tokens.

**Implementation:**

```json
// semantic-text-styles.json
{
  "text-style": {
    "body-md-regular": {
      "value": {
        "fontFamily": "{text.font-family.body}",
        "fontSize": "{text.font-size.body.md}",
        "lineHeight": "{text.line-height.body.md}",
        "fontWeight": "{text.font-weight.body.regular}",
        "letterSpacing": "{text.letter-spacing.body}"
      },
      "type": "typography"
    }
  }
}
```

**Custom Format:**
```js
// formats/css-text-styles.js
module.exports = {
  name: 'css/text-styles',
  formatter: function({ dictionary }) {
    return dictionary.allTokens
      .filter(token => token.type === 'typography')
      .map(token => `
.text-${token.name} {
  font-family: ${token.value.fontFamily};
  font-size: ${token.value.fontSize};
  line-height: ${token.value.lineHeight};
  font-weight: ${token.value.fontWeight};
  letter-spacing: ${token.value.letterSpacing};
}
      `.trim())
      .join('\n\n');
  }
};
```

**Pros:**
- ✅ Single source of truth
- ✅ Auto-generated from tokens
- ✅ Type-safe with TypeScript definitions
- ✅ Matches Figma's text styles structure

**Cons:**
- ⚠️ Requires custom Style Dictionary format
- ⚠️ More complex build pipeline
- ⚠️ Learning curve for team

---

### Option 4: React/CSS-in-JS Approach

Create TypeScript functions or styled-components for composite styles.

**Implementation:**

```ts
// src/design-system/styles/typography.ts
export const textStyles = {
  'body-md-regular': `
    font-family: var(--text-font-family-body);
    font-size: var(--text-font-size-body-md);
    line-height: var(--text-line-height-body-md);
    font-weight: var(--text-font-weight-body-regular);
    letter-spacing: var(--text-letter-spacing-body);
  `,
  'body-md-medium': `
    font-family: var(--text-font-family-body);
    font-size: var(--text-font-size-body-md);
    line-height: var(--text-line-height-body-md);
    font-weight: var(--text-font-weight-body-medium);
    letter-spacing: var(--text-letter-spacing-body);
  `,
} as const;

// Helper function
export function getTextStyle(style: keyof typeof textStyles) {
  return textStyles[style];
}
```

**Usage with styled-components:**
```tsx
import styled from 'styled-components';
import { textStyles } from '@/design-system/styles/typography';

const Paragraph = styled.p`
  ${textStyles['body-md-medium']}
  color: var(--color-fg-neutral-primary);
`;
```

**Usage with style prop:**
```tsx
<p style={{ ...getTextStyle('body-md-medium') }}>
  Text content
</p>
```

**Pros:**
- ✅ Type-safe with TypeScript
- ✅ Works with any CSS-in-JS library
- ✅ No build step changes needed

**Cons:**
- 🔴 Doesn't work with Tailwind
- 🔴 Runtime overhead (CSS-in-JS)
- 🔴 Requires different approach than rest of codebase

---

## Shadow Tokens: Special Considerations

Shadows are more complex because they have:
- Multiple values (x, y, blur, spread, color)
- Multiple layers (e.g., `shadow-md` has 2 shadow layers)
- Color values that should adapt to theme

### Recommended Shadow Token Structure

**Primitives (atomic):**
```json
{
  "shadow": {
    "color": {
      "subtle": { "value": "rgba(0, 0, 0, 0.08)" },
      "medium": { "value": "rgba(0, 0, 0, 0.16)" },
      "strong": { "value": "rgba(0, 0, 0, 0.24)" }
    },
    "offset": {
      "sm": { "value": "1px" },
      "md": { "value": "2px" },
      "lg": { "value": "4px" }
    },
    "blur": {
      "sm": { "value": "3px" },
      "md": { "value": "8px" },
      "lg": { "value": "16px" }
    }
  }
}
```

**Semantic (composite):**
```json
{
  "shadow": {
    "elevated": {
      "value": "0px 2px 8px 0px {shadow.color.medium}",
      "type": "shadow"
    },
    "floating": {
      "value": [
        "0px 4px 16px 0px {shadow.color.medium}",
        "0px 1px 3px 0px {shadow.color.subtle}"
      ],
      "type": "shadow"
    }
  }
}
```

**Generated CSS:**
```css
:root {
  /* Primitives */
  --shadow-color-subtle: rgba(0, 0, 0, 0.08);
  --shadow-color-medium: rgba(0, 0, 0, 0.16);

  /* Composites */
  --shadow-elevated: 0px 2px 8px 0px var(--shadow-color-medium);
  --shadow-floating:
    0px 4px 16px 0px var(--shadow-color-medium),
    0px 1px 3px 0px var(--shadow-color-subtle);
}

[data-theme="dark"] {
  --shadow-color-subtle: rgba(0, 0, 0, 0.32);
  --shadow-color-medium: rgba(0, 0, 0, 0.48);
}
```

**Usage:**
```tsx
// With Tailwind arbitrary values
<div className="shadow-[var(--shadow-elevated)]">
  Elevated card
</div>

// With utility class (Option 1)
<div className="shadow-elevated">
  Elevated card
</div>
```

---

## Recommendation: Hybrid Approach

**For clinic-planner, I recommend:**

1. **Use Option 1 (CSS Utility Classes) for typography**
   - Create `text-styles.css` with composite text utilities
   - Import after token CSS in `globals.css`
   - Manually maintain initially, automate later if needed

2. **Add shadow tokens to Style Dictionary**
   - Add primitive shadow tokens (color, blur, offset)
   - Add semantic shadow composites
   - Generate as CSS custom properties

3. **Extend Tailwind config for shadows**
   - Map shadow utilities to CSS variables
   - Keep existing Tailwind shadow utilities for compatibility

### Implementation Steps

**Step 1: Add shadow tokens to Figma/JSON**
```json
// primitives-shadow.json (new file)
{
  "shadow": {
    "color": {
      "subtle": { "value": "rgba(0, 0, 0, 0.08)", "type": "color" },
      "medium": { "value": "rgba(0, 0, 0, 0.16)", "type": "color" },
      "strong": { "value": "rgba(0, 0, 0, 0.24)", "type": "color" }
    }
  }
}

// semantic-shadow.json (new file)
{
  "shadow": {
    "elevated": {
      "value": "0px 2px 8px 0px {shadow.color.medium}",
      "type": "shadow"
    },
    "floating": {
      "value": "0px 4px 16px 0px {shadow.color.medium}",
      "type": "shadow"
    },
    "button": {
      "value": "0px 1px 3px 0px {shadow.color.subtle}",
      "type": "shadow"
    }
  }
}
```

**Step 2: Update Style Dictionary config**
```js
// sd.config.js
module.exports = {
  source: [
    'src/design-system/tokens/sd-input/primitives-*.json',
    'src/design-system/tokens/sd-input/semantic-shadow.json',
    // ... other sources
  ],
  // ... rest of config
};
```

**Step 3: Create text-styles.css**
```css
/* src/design-system/tokens/build/text-styles.css */

/* Body text styles */
.text-body-xs-regular { /* ... */ }
.text-body-sm-regular { /* ... */ }
.text-body-md-regular { /* ... */ }
.text-body-md-medium { /* ... */ }
.text-body-lg-regular { /* ... */ }

/* Heading styles */
.text-heading-xs-medium { /* ... */ }
.text-heading-sm-medium { /* ... */ }
.text-heading-md-bold { /* ... */ }
.text-heading-xl-bold { /* ... */ }

/* Display styles */
.text-display-sm-regular { /* ... */ }
.text-display-md-bold { /* ... */ }
.text-display-xl-bold { /* ... */ }
```

**Step 4: Update tailwind.config.js**
```js
module.exports = {
  theme: {
    extend: {
      boxShadow: {
        'elevated': 'var(--shadow-elevated)',
        'floating': 'var(--shadow-floating)',
        'button': 'var(--shadow-button)',
      }
    }
  }
};
```

**Step 5: Import in globals.css**
```css
/* Import design tokens */
@import '../design-system/tokens/build/index.css';
@import '../design-system/tokens/build/text-styles.css';

@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Examples: Before & After

### Typography

**Before (atomic tokens):**
```tsx
<h1 className="
  font-[var(--text-font-family-heading)]
  text-[var(--text-font-size-heading-xl)]
  leading-[var(--text-line-height-heading-xl)]
  font-[var(--text-font-weight-heading-bold)]
  tracking-[var(--text-letter-spacing-heading)]
  text-fg-neutral-primary
">
  Page Title
</h1>
```

**After (composite utility):**
```tsx
<h1 className="text-heading-xl-bold text-fg-neutral-primary">
  Page Title
</h1>
```

### Shadows

**Before (hard-coded):**
```tsx
<div className="shadow-[0px_2px_8px_0px_rgba(0,0,0,0.16)]">
  Card content
</div>
```

**After (semantic token):**
```tsx
<div className="shadow-elevated">
  Card content
</div>
```

---

## Migration Path

1. **Phase 1: Add shadow tokens** (1-2 hours)
   - Create primitive and semantic shadow JSON files
   - Update Style Dictionary config
   - Generate CSS
   - Test in Button component

2. **Phase 2: Create text-styles.css** (2-3 hours)
   - Write utility classes for common text styles
   - Document naming convention
   - Import in globals.css

3. **Phase 3: Update components** (3-4 hours)
   - Migrate Button, Pill to use new utilities
   - Update page components
   - Test in Storybook

4. **Phase 4: Automate (future)** (4-6 hours)
   - Create Style Dictionary format for text styles
   - Auto-generate from semantic tokens
   - Add to build pipeline

---

## Questions to Decide

1. **How many text style variations do we need?**
   - All combinations (8 categories × 3-5 sizes × 2-3 weights = ~100 classes)?
   - Or just the common ones we actually use (~20 classes)?

2. **Naming convention for text styles?**
   - `.text-{category}-{size}-{weight}` (e.g., `.text-body-md-medium`)
   - `.text-{weight}-{category}-{size}` (e.g., `.text-medium-body-md`)
   - Something else?

3. **Shadow naming?**
   - Semantic names (`.shadow-elevated`, `.shadow-floating`)?
   - T-shirt sizes (`.shadow-sm`, `.shadow-md`)?
   - Both?

4. **Generation approach?**
   - Start with manual CSS file, automate later?
   - Or automate from the start with custom Style Dictionary format?

Let me know your preferences and I can implement!
