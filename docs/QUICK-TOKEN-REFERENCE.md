# Quick Token Reference

Quick reference for migrating components to semantic tokens.

---

## 🎨 Most Common Tokens

### Backgrounds

| Use Case | Token | Result (Light) |
|----------|-------|----------------|
| Page/Card background | `var(--color-bg-neutral-base)` | White (#ffffff) |
| Subtle background | `var(--color-bg-neutral-subtle)` | Light gray (#f2f2f2) |
| Hover state | `var(--color-bg-neutral-low)` | Gray (#e6e6e6) |
| Border/divider | `var(--color-bg-neutral-medium)` | Medium gray (#d9d9d9) |
| Success background | `var(--color-bg-positive-subtle)` | Light green |
| Error background | `var(--color-bg-alert-subtle)` | Light red |
| Warning background | `var(--color-bg-attention-subtle)` | Light yellow |

### Text Colors

| Use Case | Token | Result (Light) |
|----------|-------|----------------|
| Primary text | `var(--color-fg-neutral-primary)` | Black (#171717) |
| Secondary text | `var(--color-fg-neutral-secondary)` | Dark gray (#525252) |
| Muted text | `var(--color-fg-neutral-soft)` | Medium gray |
| Disabled text | `var(--color-fg-neutral-disabled)` | Light gray |
| Success text | `var(--color-fg-positive-primary)` | Green |
| Error text | `var(--color-fg-alert-primary)` | Red |

### Buttons

| Button Type | Background | Text |
|-------------|------------|------|
| Primary (green) | `var(--color-bg-positive-high)` | `var(--color-fg-neutral-inverse-primary)` (white) |
| Primary hover | `var(--color-bg-positive-medium)` | Same |
| Secondary | `var(--color-bg-neutral-base)` | `var(--color-fg-neutral-primary)` |
| Secondary hover | `var(--color-bg-neutral-subtle)` | Same |
| Destructive | `var(--color-bg-alert-high)` | `var(--color-fg-neutral-inverse-primary)` |

---

## 🔄 Common Replacements

### Hard-coded → Semantic

```tsx
// Backgrounds
bg-white           → bg-[var(--color-bg-neutral-base)]
bg-gray-50         → bg-[var(--color-bg-neutral-subtle)]
bg-gray-100        → bg-[var(--color-bg-neutral-low)]
bg-gray-200        → bg-[var(--color-bg-neutral-medium)]

// Text
text-gray-900      → text-[var(--color-fg-neutral-primary)]
text-gray-800      → text-[var(--color-fg-neutral-secondary)]
text-gray-600      → text-[var(--color-fg-neutral-soft)]
text-gray-400      → text-[var(--color-fg-neutral-softest)]

// Success (green)
bg-green-50        → bg-[var(--color-bg-positive-subtle)]
bg-green-500       → bg-[var(--color-bg-positive-high)]
text-green-800     → text-[var(--color-fg-positive-primary)]

// Error (red)
bg-red-50          → bg-[var(--color-bg-alert-subtle)]
bg-red-500         → bg-[var(--color-bg-alert-high)]
text-red-800       → text-[var(--color-fg-alert-primary)]

// Warning (yellow)
bg-yellow-50       → bg-[var(--color-bg-attention-subtle)]
text-yellow-800    → text-[var(--color-fg-attention-primary)]

// Borders
border-gray-300    → border-[var(--color-bg-neutral-medium)]
border-gray-200    → border-[var(--color-bg-neutral-low)]
```

---

## 🚀 Quick Migration Steps

For each component:

1. **Find** hard-coded colors (gray-*, green-*, red-*, etc.)
2. **Map** to semantic token using tables above
3. **Replace** with `var(--token-name)`
4. **Test** in Storybook + dev mode
5. **Verify** no visual changes

---

## 💡 Tips

- **Use `bg-` and `fg-` tokens** - Not primitives like `gray-500`
- **Check hover/focus states** - Don't forget interactive states
- **Test theme switching** - Tokens should adapt automatically
- **When unsure** - Check `docs/COMPONENT-MIGRATION-GUIDE.md` for examples

---

## 📁 Where to Find Full Token List

**In code:**
```bash
src/design-system/tokens/build/semantic-light.css
```

**In Storybook:**
```bash
npm run storybook
# → Design System → Tokens → Colors
```

**In documentation:**
```bash
docs/COMPONENT-MIGRATION-GUIDE.md
```
