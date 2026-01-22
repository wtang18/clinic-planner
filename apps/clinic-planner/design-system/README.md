# @carbon-health/design-system

Carbon Health Design System - Production-ready design tokens, components, and styles for web and React Native applications.

> ⭐ **Current Status:** Phase 3 Complete - React Native Ready
>
> 📊 **For complete status, roadmap, and next steps:** See [STATUS.md](./STATUS.md)
>
> - ✅ 12 production-ready React web components
> - ✅ Complete token architecture (Primitives → Decoratives → Semantics)
> - ✅ React Native token generation ready
> - ✅ Comprehensive Storybook documentation
> - ✅ WCAG 2.1 Level AA accessibility

## Installation

```bash
# When extracted to npm package
npm install @carbon-health/design-system

# Currently (in-repo)
# Import from local path: @/design-system
```

## Design Tokens

### Web (CSS Variables)

Import CSS tokens in your app entry point:

```tsx
import '@/design-system/tokens/build/index.css';

// Use CSS variables in your styles
const MyComponent = () => (
  <div style={{
    backgroundColor: 'var(--color-bg-neutral-base)',
    color: 'var(--color-fg-neutral-primary)'
  }}>
    Hello World
  </div>
);
```

### React Native (JavaScript)

Import token constants directly:

```tsx
import {
  ColorBgNeutralBase,
  ColorFgNeutralPrimary
} from '@/design-system/tokens/build/tokens';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: ColorBgNeutralBase,  // '#ffffff'
    color: ColorFgNeutralPrimary,         // '#171717'
  }
});
```

### Token Architecture

Tokens are organized in a 3-layer hierarchy:

1. **Primitives** - Base values (colors, typography, dimensions)
2. **Decorative** - Named abstractions (gray-min, blue-high, etc.)
3. **Semantic** - Contextual tokens (color-bg-neutral-base, color-fg-positive-primary, etc.)

### Updating Tokens

```bash
# 1. Export from Figma
# Save as: src/design-system/tokens/design-tokens-variables-full.json

# 2. Build tokens
npm run tokens:build

# 3. Review & commit
git diff src/design-system/tokens/build/
git add src/design-system/tokens/
git commit -m "Update design tokens from Figma"
```

## Components

- **Button** - 9 variants, 5 sizes, icon support
- **Card** - Interactive/non-interactive containers
- **Pill** - Status indicators with 6 types
- **Input** - Form fields with validation states
- **Textarea** - Multi-line input with auto-resize
- **SegmentedControl** - Button group selector
- **Container** - Layout wrapper for Cards

## Icon Library

386 custom icons in small (20px) and medium (24px) sizes.

Usage: `<Button leftIcon="star" />`

## Development

- Components: `src/design-system/components/`
- Tokens: `src/design-system/tokens/`
- Storybook: `npm run storybook`
- Next.js app: `npm run dev`

## Scripts

- `npm run tokens:parse` - Convert Figma JSON to Style Dictionary format
- `npm run tokens:build` - Generate CSS, JS, and TS tokens
- `npm run tokens:clean` - Remove generated token files

## Documentation

**📊 Start Here:**
- **[STATUS.md](./STATUS.md)** - **Complete status, roadmap, and next steps**
- **[DOCUMENTATION_GUIDELINES.md](./DOCUMENTATION_GUIDELINES.md)** - Component documentation template

**React Native:**
- [React Native Migration Guide](../../docs/REACT-NATIVE-MIGRATION-GUIDE.md) - Complete setup guide
- [Design System Export Prep](../../docs/DESIGN-SYSTEM-EXPORT-PREP.md) - Multi-platform preparation

**Technical Docs:**
- [Style Dictionary Migration](../../docs/STYLE-DICTIONARY-MIGRATION.md) - Complete migration summary
- [Token System Comparison](../../docs/TOKEN-SYSTEM-COMPARISON.md) - Custom script vs Style Dictionary
- [Component Migration Guide](../../docs/COMPONENT-MIGRATION-GUIDE.md) - Migrate components to semantic tokens
- [Package Extraction Guide](../../docs/PACKAGE-EXTRACTION-GUIDE.md) - How to extract to separate package

## File Structure

```
src/design-system/
├── package.json                           # Package configuration
├── index.ts                               # Public API entry point
├── README.md                              # This file
│
├── tokens/
│   ├── design-tokens-variables-full.json  # Figma export (source)
│   ├── sd-input/                          # Style Dictionary input (generated)
│   └── build/                             # Generated tokens (DO NOT EDIT)
│       ├── index.css                      # All CSS tokens
│       ├── tokens.js                      # React Native tokens
│       └── tokens.d.ts                    # TypeScript definitions
│
├── components/                            # React components
├── icons/                                 # SVG icons
└── ...
```

## Adding New Icons

1. Export from Figma: `icon-name-small.svg` and `icon-name.svg`
2. Place in `src/design-system/icons/small/` and `medium/`
3. Clear cache: `rm -rf .next && npm run dev`

## Tech Stack

- **Style Dictionary** v4.4.0 - Token transformation
- **React** 18+/19+ - UI framework
- **React Native** 0.70+ - Mobile (ready when needed)
- **TypeScript** - Type safety

## License

UNLICENSED - Private to Carbon Health
