# Component Migration Guide: Using Semantic Tokens

This guide shows how to migrate design system components from hard-coded colors to semantic tokens.

---

## Why Migrate?

**Benefits of semantic tokens:**
- ✅ Automatic dark mode support
- ✅ Consistent color usage across app
- ✅ Easier to maintain (change tokens, not components)
- ✅ Better accessibility (semantic naming encourages thoughtful color choices)
- ✅ Theme switching without component changes

---

## Migration Checklist

For each component:

1. ☐ Identify current hard-coded colors
2. ☐ Map to appropriate semantic tokens
3. ☐ Update className strings
4. ☐ Test in Storybook (light + dark themes)
5. ☐ Verify no visual regressions
6. ☐ Update component stories if needed

---

## Color Mapping Reference

### Backgrounds

| Old | New | Use Case |
|-----|-----|----------|
| `bg-white` | `bg-[var(--color-bg-neutral-base)]` | Default backgrounds |
| `bg-gray-25` | `bg-[var(--color-bg-neutral-min)]` | Subtle backgrounds |
| `bg-gray-50` | `bg-[var(--color-bg-neutral-subtle)]` | Card backgrounds |
| `bg-gray-100` | `bg-[var(--color-bg-neutral-low)]` | Hover states |
| `bg-gray-200` | `bg-[var(--color-bg-neutral-medium)]` | Borders, dividers |

### Text Colors

| Old | New | Use Case |
|-----|-----|----------|
| `text-gray-900` | `text-[var(--color-fg-neutral-primary)]` | Primary text |
| `text-gray-800` | `text-[var(--color-fg-neutral-secondary)]` | Secondary text |
| `text-gray-600` | `text-[var(--color-fg-neutral-secondary)]` | Muted text |
| `text-gray-400` | `text-[var(--color-fg-neutral-softest)]` | Disabled text |

### Semantic Colors

| Old | New | Use Case |
|-----|-----|----------|
| `bg-green-50` | `bg-[var(--color-bg-positive-subtle)]` | Success backgrounds |
| `text-green-800` | `text-[var(--color-fg-positive-primary)]` | Success text |
| `bg-red-50` | `bg-[var(--color-bg-alert-subtle)]` | Error backgrounds |
| `text-red-800` | `text-[var(--color-fg-alert-primary)]` | Error text |
| `bg-yellow-50` | `bg-[var(--color-bg-attention-subtle)]` | Warning backgrounds |
| `text-yellow-800` | `text-[var(--color-fg-attention-primary)]` | Warning text |
| `bg-blue-50` | `bg-[var(--color-bg-information-subtle)]` | Info backgrounds |
| `text-blue-800` | `text-[var(--color-fg-information-primary)]` | Info text |

---

## Example Migrations

### Example 1: Button Component

**Before:**
```tsx
const buttonVariants = cva(
  "rounded-lg font-semibold",
  {
    variants: {
      type: {
        primary: "bg-green-500 text-white hover:bg-green-600",
        secondary: "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50",
        destructive: "bg-red-500 text-white hover:bg-red-600",
      }
    }
  }
);
```

**After:**
```tsx
const buttonVariants = cva(
  "rounded-lg font-semibold",
  {
    variants: {
      type: {
        primary: "bg-[var(--color-bg-positive-high)] text-[var(--color-fg-neutral-inverse-primary)] hover:bg-[var(--color-bg-positive-medium)]",
        secondary: "bg-[var(--color-bg-neutral-base)] text-[var(--color-fg-neutral-primary)] border border-[var(--color-bg-neutral-medium)] hover:bg-[var(--color-bg-neutral-subtle)]",
        destructive: "bg-[var(--color-bg-alert-high)] text-[var(--color-fg-neutral-inverse-primary)] hover:bg-[var(--color-bg-alert-medium)]",
      }
    }
  }
);
```

---

### Example 2: Card Component

**Before:**
```tsx
const cardVariants = cva(
  "bg-white rounded-2xl p-4",
  {
    variants: {
      variant: {
        default: "",
        interactive: "shadow hover:shadow-md cursor-pointer",
      }
    }
  }
);
```

**After:**
```tsx
const cardVariants = cva(
  "bg-[var(--color-bg-neutral-base)] rounded-2xl p-4",
  {
    variants: {
      variant: {
        default: "",
        interactive: "shadow hover:shadow-md cursor-pointer",
      }
    }
  }
);
```

**Note:** Card is a great example - the only change needed is `bg-white` → `bg-[var(--color-bg-neutral-base)]`. When theme switches to dark, the card background automatically becomes dark!

---

### Example 3: Pill Component

**Before:**
```tsx
const pillVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1",
  {
    variants: {
      type: {
        filled: "bg-gray-200 text-gray-900",
        transparent: "bg-transparent text-gray-600 border border-gray-300",
      }
    }
  }
);
```

**After:**
```tsx
const pillVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1",
  {
    variants: {
      type: {
        filled: "bg-[var(--color-bg-neutral-medium)] text-[var(--color-fg-neutral-primary)]",
        transparent: "bg-transparent text-[var(--color-fg-neutral-secondary)] border border-[var(--color-bg-neutral-medium)]",
      }
    }
  }
);
```

---

## Testing Your Migration

### 1. Test in Storybook

```bash
npm run storybook
```

- View component in light theme (default)
- Switch to dark theme (use theme toggle button)
- Verify colors look correct in both themes
- Check hover states, focus states, disabled states

### 2. Test in App

```bash
npm run dev
```

- Navigate to pages using the component
- Toggle theme using `useTheme()` hook
- Check for visual regressions
- Verify contrast ratios for accessibility

### 3. Visual Regression Testing

If using visual regression tests:
- Capture baseline screenshots in light theme
- Capture baseline screenshots in dark theme
- Run regression tests after migration

---

## Common Pitfalls

### ❌ Don't Use Primitive Tokens Directly

```tsx
// Bad - bypasses semantic layer
bg-[var(--color-gray-500)]

// Good - uses semantic layer
bg-[var(--color-bg-neutral-medium)]
```

### ❌ Don't Mix Old and New Approaches

```tsx
// Bad - inconsistent
className="bg-white text-[var(--color-fg-neutral-primary)]"

// Good - all semantic tokens
className="bg-[var(--color-bg-neutral-base)] text-[var(--color-fg-neutral-primary)]"
```

### ❌ Don't Forget Hover/Focus States

```tsx
// Bad - only migrated default state
className="bg-[var(--color-bg-neutral-base)] hover:bg-gray-50"

// Good - migrated all states
className="bg-[var(--color-bg-neutral-base)] hover:bg-[var(--color-bg-neutral-subtle)]"
```

---

## Semantic Token Naming Guide

### Background (bg) Tokens

- **base** - Default background (e.g., page, card)
- **min** - Minimal background tint
- **subtle** - Subtle background (hover states)
- **low** - Low emphasis background
- **medium** - Medium emphasis background
- **high** - High emphasis background (buttons)
- **inverse-*** - For dark-on-light or light-on-dark

### Foreground (fg) Tokens

- **primary** - Primary text color
- **secondary** - Secondary/muted text
- **softest** - Very subtle text (placeholders)
- **spot-readable** - Readable colored text
- **inverse-*** - Text on colored backgrounds

### Context Tokens

- **neutral** - Default/neutral colors
- **positive** - Success/affirmative actions (green)
- **alert** - Errors/destructive actions (red)
- **attention** - Warnings/caution (yellow)
- **information** - Info/help content (blue)
- **accent** - Brand/emphasis colors (purple)

---

## Migration Priority

Migrate components in this order:

1. **High Priority** (Used everywhere)
   - Button
   - Card
   - Pill/Badge
   - Input/Form fields

2. **Medium Priority** (Commonly used)
   - Modal/Dialog
   - Dropdown/Select
   - Tabs
   - Toast/Alert

3. **Low Priority** (Specific use cases)
   - Complex data visualizations
   - Custom illustrations
   - Marketing-specific components

---

## Need Help?

- Check `src/styles/tokens/` to see available tokens
- Review `tailwind.config.js` for Tailwind class mappings
- Look at Storybook token documentation for examples
- See `src/design-system/tokens/README.md` for architecture details

---

## Example: Complete Button Migration

Here's a complete before/after for a realistic Button component:

### Before

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
  {
    variants: {
      type: {
        primary: "bg-green-500 text-white hover:bg-green-600 active:bg-green-700",
        secondary: "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 active:bg-gray-100",
        "no-fill": "bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200",
      },
      size: {
        small: "px-3 py-1.5 text-sm",
        medium: "px-4 py-2 text-base",
        large: "px-6 py-3 text-lg",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed pointer-events-none",
      }
    }
  }
);
```

### After

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-bg-information-medium)]",
  {
    variants: {
      type: {
        primary: "bg-[var(--color-bg-positive-high)] text-[var(--color-fg-neutral-inverse-primary)] hover:bg-[var(--color-bg-positive-medium)] active:bg-[var(--color-bg-positive-high)]",
        secondary: "bg-[var(--color-bg-neutral-base)] text-[var(--color-fg-neutral-primary)] border border-[var(--color-bg-neutral-medium)] hover:bg-[var(--color-bg-neutral-subtle)] active:bg-[var(--color-bg-neutral-low)]",
        "no-fill": "bg-transparent text-[var(--color-fg-neutral-secondary)] hover:bg-[var(--color-bg-neutral-subtle)] active:bg-[var(--color-bg-neutral-low)]",
      },
      size: {
        small: "px-3 py-1.5 text-sm",
        medium: "px-4 py-2 text-base",
        large: "px-6 py-3 text-lg",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed pointer-events-none",
      }
    }
  }
);
```

**Changes made:**
1. Focus ring: `blue-500` → `var(--color-bg-information-medium)`
2. Primary bg: `green-500` → `var(--color-bg-positive-high)`
3. Primary text: `white` → `var(--color-fg-neutral-inverse-primary)`
4. Primary hover: `green-600` → `var(--color-bg-positive-medium)`
5. Secondary bg: `white` → `var(--color-bg-neutral-base)`
6. Secondary text: `gray-900` → `var(--color-fg-neutral-primary)`
7. Secondary border: `gray-300` → `var(--color-bg-neutral-medium)`
8. Secondary hover: `gray-50` → `var(--color-bg-neutral-subtle)`
9. No-fill text: `gray-700` → `var(--color-fg-neutral-secondary)`
10. No-fill hover: `gray-100` → `var(--color-bg-neutral-subtle)`

**Result:** Button now automatically adapts to light/dark themes! 🎉
