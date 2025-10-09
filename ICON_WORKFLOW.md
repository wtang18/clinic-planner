# Icon System Workflow - Quick Reference

> **For detailed documentation, see:** `src/design-system/icons/README.md`

## TL;DR - Adding New Icons

```bash
# 1. Add SVG files to appropriate directory
cp icon-name-small.svg src/design-system/icons/small/
cp icon-name.svg src/design-system/icons/medium/

# 2. Generate icon map
npm run generate-icon-map

# 3. Use in code
<Icon name="icon-name" size="small" />
```

---

## File Locations

- **Small icons (20px):** `src/design-system/icons/small/`
- **Medium icons (24px):** `src/design-system/icons/medium/`
- **Auto-generated files:** `icon-map.ts`, `icon-names.ts` (DO NOT EDIT)

---

## Naming Conventions

| Size | Filename Format | Example |
|------|----------------|---------|
| Small (20px) | `{name}-small.svg` | `star-small.svg` |
| Medium (24px) | `{name}.svg` | `star.svg` |

**Usage in code:** `<Icon name="star" size="small|medium" />`

---

## SVG Requirements

✅ **Must have:**
- `fill="currentColor"` on all paths/shapes
- Proper viewBox: `0 0 20 20` (small) or `0 0 24 24` (medium)
- No hardcoded colors

❌ **Avoid:**
- Hardcoded fill colors (e.g., `fill="#000000"`)
- Embedded styles
- Multiple artboards

---

## Common Commands

### Generate Icon Map (Required)
```bash
npm run generate-icon-map
```
Run this **every time** you add, remove, or rename icon files.

### Generate TypeScript Types (Optional)
```bash
node src/design-system/icons/generate-icon-types.js
```
Updates TypeScript autocomplete. The generation script above usually handles this.

---

## Usage Examples

### Basic Icon
```tsx
import { Icon } from '@/design-system/icons';

<Icon name="star" size="small" />
```

### Icon with Color
```tsx
<Icon name="heart" size="medium" className="text-red-500" />
```

### In Button Component
```tsx
<Button iconL="arrow-left" label="Back" />
<Button iconR="arrow-right" label="Next" />
```

### In Pill Component
```tsx
<Pill icon="checkmark" label="Completed" />
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Icon not showing | Run `npm run generate-icon-map` |
| TypeScript error | Check icon name spelling, re-run generation |
| Wrong color | Ensure SVG uses `currentColor` |
| Build error | Icon map out of sync - regenerate |

---

## Resources

- **Full Documentation:** `src/design-system/icons/README.md`
- **Storybook:** View all icons at `/storybook` → Icon component
- **TypeScript Types:** `src/design-system/icons/icon-names.ts`

---

## For AI Assistants

When adding icons to this project:

1. Verify naming: `{name}-small.svg` for small, `{name}.svg` for medium
2. Place in correct directory: `src/design-system/icons/small/` or `medium/`
3. Run: `npm run generate-icon-map`
4. Verify usage: `<Icon name="{name}" size="small|medium" />`

**Common integration points:**
- Button: `iconL`, `iconR` props
- Pill: `icon` prop
- Direct: `<Icon name="..." />`

---

**Last Updated:** 2025-01-08
