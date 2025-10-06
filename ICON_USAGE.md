# Icon Usage Guide

## Button Component Icons

The Button component uses **icon names (strings)**, not React components.

### ✅ Correct Usage

```tsx
// Using our icon system
<Button iconL="plus" label="Add" />
<Button iconR="chevron-right" label="Next" />
<Button iconOnly iconL="navigation-menu" />

// External icons (Lucide, etc.)
import { Menu } from 'lucide-react';
<Button leftIcon={<Menu />} label="Menu" />
```

### ❌ Wrong Usage

```tsx
// DON'T pass React components to iconL/iconR
import { Menu } from 'lucide-react';
<Button iconL={Menu} /> // ❌ WRONG
<Button leftIcon={Menu} /> // ❌ WRONG

// Use this instead:
<Button iconL="navigation-menu" /> // ✅ CORRECT
```

## Available Icon Props

| Prop | Type | Description |
|------|------|-------------|
| `iconL` | `IconName` (string) | Left icon from our icon system |
| `iconR` | `IconName` (string) | Right icon from our icon system |
| `leftIcon` | `React.ReactNode` | External icon component (left) |
| `rightIcon` | `React.ReactNode` | External icon component (right) |

## Common Icon Names

**IMPORTANT**: Icon names should NOT include the size suffix (e.g., use `plus`, not `plus-small`)

| Icon | Name |
|------|------|
| Menu/Hamburger | `navigation-menu` |
| Panel Toggle | `panel-left-open` |
| Plus | `plus` |
| Left Arrow | `arrow-left` |
| Right Arrow | `arrow-right` |
| Up Arrow | `arrow-up` |
| Down Arrow | `arrow-down` |
| Chevron Left | `chevron-left` |
| Chevron Right | `chevron-right` |
| Close/X | `x` |
| Checkmark | `checkmark` |
| Calendar | `calendar` |
| Star | `star` |

## Finding Icon Names

```bash
# List all small icons (20px)
ls src/design-system/icons/small/

# List all medium icons (24px)
ls src/design-system/icons/medium/

# Search for specific icons
ls src/design-system/icons/small/ | grep "chevron"
```

## Icon Sizes

- **Small icons (20px)**: Used with `xSmall`, `small`, `medium` buttons
- **Medium icons (24px)**: Used with `large`, `largeFloating` buttons

The Button component automatically selects the correct icon size based on the button size.
