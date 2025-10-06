# Icon System

The icon system uses static imports to work with both Vite (Storybook) and Next.js (webpack/Turbopack).

## How It Works

1. **Icon Files**: SVG icons are stored in `small/` (20px) and `medium/` (24px) directories
2. **Generated Map**: `icon-map.ts` contains static imports of all icons (auto-generated)
3. **Icon Component**: `Icon.tsx` uses the generated map instead of `import.meta.glob`

## Adding New Icons

When adding new SVG icons to `small/` or `medium/` directories:

```bash
# Regenerate the icon map
npm run generate-icon-map
```

This script:
- Scans `small/` and `medium/` directories
- Generates static imports for each SVG file
- Creates lookup maps (`smallIconMap`, `mediumIconMap`)
- Outputs to `icon-map.ts`

## Why Static Imports?

`import.meta.glob` is Vite-specific and doesn't work with Next.js webpack. By using static imports generated at build time, the icon system works with both:

- ✅ **Storybook (Vite)**: Works with `?raw` imports
- ✅ **Next.js (webpack/Turbopack)**: Works with standard imports

## Files

- `Icon.tsx` - Main icon component
- `icon-names.ts` - TypeScript types for icon names (auto-generated)
- `icon-map.ts` - Static import maps (auto-generated, **DO NOT EDIT**)
- `generate-icon-map.js` - Script to regenerate icon map
- `small/` - 20px icons (207 icons)
- `medium/` - 24px icons (321 icons)

## Usage

```tsx
import { Icon } from '@/design-system/icons/Icon';

// Small icon (20px)
<Icon name="star" size="small" />

// Medium icon (24px)
<Icon name="checkmark" size="medium" />

// With accessibility
<Icon name="heart" size="small" aria-label="Favorite" aria-hidden={false} />
```
