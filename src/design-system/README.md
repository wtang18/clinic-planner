# Clinic Planner Design System

Core UI components extracted from Figma design system with full Storybook documentation.

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
- Storybook: `npm run storybook`
- Next.js app: `npm run dev`

## Adding New Icons

1. Export from Figma: `icon-name-small.svg` and `icon-name.svg`
2. Place in `src/design-system/icons/small/` and `medium/`
3. Clear cache: `rm -rf .next && npm run dev`
