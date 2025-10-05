# Icon System

A complete icon library system with 386 unique icons exported from Figma, available in two sizes.

## Overview

- **Total icons**: 386 unique names
- **Small icons**: 207 icons (20×20px)
- **Medium icons**: 321 icons (24×24px)
- **Available in both sizes**: 142 icons

## Usage

### Basic Usage

```tsx
import { Icon } from '@/design-system/icons';

// Small icon (20px)
<Icon name="star" size="small" />

// Medium icon (24px)
<Icon name="chevron-down" size="medium" />

// With custom styling
<Icon name="checkmark" size="small" className="text-blue-500" />
```

### With Accessibility

```tsx
// Decorative icon (default)
<Icon name="star" size="small" aria-hidden={true} />

// Meaningful icon with label
<Icon
  name="checkmark"
  size="small"
  aria-label="Completed"
  aria-hidden={false}
/>
```

### Icon Sizing Rules

Icons are sized based on usage context:

- **Small (20px / w-5 h-5)**: For xSmall, small, and medium buttons
- **Medium (24px / w-6 h-6)**: For large and largeFloating buttons

Icons automatically inherit text color via `currentColor`.

## Icon Names

All icon names are fully typed. Your IDE will provide autocomplete for the `name` prop.

Some examples:
- `star`, `star-solid`
- `chevron-down`, `chevron-up`, `chevron-left`, `chevron-right`
- `checkmark`, `checkmark-circle`
- `arrow-right`, `arrow-left`, `arrow-up`, `arrow-down`
- `calendar`, `clock`, `phone`, `envelope`
- And 370+ more...

## Utilities

```tsx
import {
  iconExists,
  hasSmallIcon,
  hasMediumIcon,
  searchIcons,
  getIconStats
} from '@/design-system/icons/utils';

// Check if icon exists
iconExists('star'); // true

// Check size availability
hasSmallIcon('star'); // true
hasMediumIcon('abdomen-pain'); // true

// Search icons
searchIcons('arrow'); // ['arrow-down', 'arrow-up', 'arrow-left', ...]

// Get statistics
getIconStats();
// {
//   total: 386,
//   small: 207,
//   medium: 321,
//   bothSizes: 142,
//   smallOnly: 65,
//   mediumOnly: 179
// }
```

## File Structure

```
icons/
├── small/              # 207 small icons (20×20px)
│   ├── star-small.svg
│   ├── chevron-down-small.svg
│   └── ...
├── medium/             # 321 medium icons (24×24px)
│   ├── star.svg
│   ├── abdomen-pain.svg
│   └── ...
├── Icon.tsx            # Icon component
├── icon-names.ts       # Generated TypeScript types
├── index.ts            # Main exports
├── utils.ts            # Utility functions
└── generate-icon-types.js  # Type generation script
```

## Regenerating Types

If you add or remove SVG files, regenerate the TypeScript types:

```bash
cd src/design-system/icons
node generate-icon-types.js
```

This will update `icon-names.ts` with the latest icon names.

## Integration with Button Component

The Button component automatically uses the Icon system:

```tsx
import { Button } from '@/design-system/components/Button';

// Button with built-in icons
<Button iconL label="Save" />          // Star icon on left
<Button iconR label="Continue" />      // Chevron icon on right
<Button iconL iconR label="Action" />  // Both icons
<Button iconOnly iconL aria-label="Favorite" />  // Icon-only button

// Icons automatically sized based on button size
<Button size="small" iconL label="Small" />    // 20px icon
<Button size="large" iconL label="Large" />    // 24px icon
```

## Custom Icons

For custom icon integration:

```tsx
import { Icon } from '@/design-system/icons';

<Button
  leftIcon={<Icon name="heart" size="small" />}
  label="Favorite"
/>
```

## Performance

- **Tree-shaking**: Only icons actually used are bundled
- **Eager loading**: Icons are loaded at build time via Vite glob imports
- **No runtime requests**: All icons are inlined as SVG
- **Type-safe**: Full TypeScript support with autocomplete

## Browser Support

- Uses `DOMParser` for runtime SVG manipulation
- Includes SSR fallback for server-side rendering
- Compatible with Next.js, Vite, and other modern build tools
