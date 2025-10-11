# Phase 3 Cleanup Notes

## Issues to Fix in Token Stories

### Colors.stories.tsx
- [ ] Usage examples section still using Tailwind classes instead of CSS variables
  - Fix: Convert all `bg-alert-subtle`, `text-alert-primary`, etc. to `bg-[var(--color-bg-alert-subtle)]`
  - Check all example cards and messages for proper token usage

### BorderRadius.stories.tsx
- [ ] Usage examples aren't using actual components from our design system
  - Consider: Use real Button, Input, Card components instead of generic divs
  - May be acceptable as-is for foundation-level documentation (discuss with team)

### Spacing.stories.tsx
- [ ] Add documentation about directional spacing
  - Add note that "space around" tokens can be applied to individual sides
  - Example: Cards with larger top/bottom padding than left/right
  - Add code example: `paddingTop: 'var(--dimension-space-around-large)', paddingLeft: 'var(--dimension-space-around-medium)'`

## General Consistency
- [ ] Ensure all token stories follow the same structure
- [ ] Verify all stories have proper "Doc" pages
- [ ] Check that all code examples are consistent and use best practices
