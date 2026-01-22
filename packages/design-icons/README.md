# Icon System Documentation

## Overview

The icon system provides two types of icons:

1. **Regular Icons** - Single-color icons that inherit color from CSS via `currentColor`
2. **BicolorIcons** - Two-color semantic icons with customizable container and signifier colors

Both use **static imports** to work seamlessly with Vite (Storybook) and Next.js (webpack/Turbopack). Icons are stored as SVG files and automatically compiled into TypeScript maps for type-safe usage.

---

## Quick Start

### Regular Icons

1. **Add SVG files** to the appropriate directory:
   - Small icons (20px): `src/design-system/icons/small/`
   - Medium icons (24px): `src/design-system/icons/medium/`

2. **Run the generation script:**
   ```bash
   npm run generate-icon-map
   ```

3. **Use the icon** in your components:
   ```tsx
   <Icon name="your-icon-name" size="small" className="text-blue-500" />
   ```

### BicolorIcons

1. **Add SVG files** to the appropriate directory:
   - Small icons (20px): `src/design-system/icons/bicolor/small/`
   - Medium icons (24px): `src/design-system/icons/bicolor/medium/`

2. **Run the generation script:**
   ```bash
   npm run generate-bicolor-icon-map
   ```

3. **Use with semantic names:**
   ```tsx
   <BicolorIcon name="positive" size="medium" />
   <BicolorIcon name="alert" containerColor="#FF0000" signifierColor="#FFF" />
   ```

---

## Directory Structure

```
src/design-system/icons/
├── small/                      # 20px icons
│   └── icon-name-small.svg     # Naming: {name}-small.svg
├── medium/                     # 24px icons
│   └── icon-name.svg           # Naming: {name}.svg
├── icon-map.ts                 # ⚠️ Auto-generated - DO NOT EDIT
├── icon-names.ts               # ⚠️ Auto-generated - DO NOT EDIT
├── Icon.tsx                    # Icon component
├── generate-icon-map.js        # Generation script
├── generate-icon-types.js      # Type generation script
└── README.md                   # This file
```

---

## Naming Conventions

### Small Icons (20px)
- **Format:** `{icon-name}-small.svg`
- **Examples:**
  - `arrow-left-small.svg`
  - `star-small.svg`
  - `checkmark-small.svg`

### Medium Icons (24px)
- **Format:** `{icon-name}.svg`
- **Examples:**
  - `arrow-left.svg`
  - `calendar.svg`
  - `heart.svg`

### Usage in Components
When using icons, **omit the size suffix**:
```tsx
// Reference "arrow-left-small.svg" as:
<Icon name="arrow-left" size="small" />

// Reference "calendar.svg" as:
<Icon name="calendar" size="medium" />
```

---

## SVG File Requirements

### Required Attributes

1. **Use `currentColor` for fills:**
   ```svg
   <path fill="currentColor" d="..." />
   ```
   This allows icons to inherit color from CSS.

2. **Proper viewBox:**
   - Small: `viewBox="0 0 20 20"`
   - Medium: `viewBox="0 0 24 24"`

3. **No hardcoded colors** - all fills/strokes should use `currentColor`

### Example SVG Structure

**Small icon (20px):**
```svg
<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" clip-rule="evenodd" d="..." fill="currentColor"/>
</svg>
```

**Medium icon (24px):**
```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" clip-rule="evenodd" d="..." fill="currentColor"/>
</svg>
```

---

## How It Works

### The Problem
- `import.meta.glob` (Vite's dynamic imports) doesn't work with Next.js webpack/Turbopack
- Need icons to work in both Storybook (Vite) and the Next.js app

### The Solution
Generate static imports at build time that work with any bundler.

### The Process

1. **Icon files** are stored as SVGs in `small/` and `medium/` directories

2. **Generation script** (`generate-icon-map.js`) scans directories and creates:
   ```typescript
   // icon-map.ts (auto-generated)
   import SmallIcon0 from './small/arrow-left-small.svg?raw';
   import MediumIcon0 from './medium/calendar.svg?raw';

   export const smallIconMap: Record<string, string> = {
     './arrow-left-small.svg': SmallIcon0,
   };

   export const mediumIconMap: Record<string, string> = {
     './calendar.svg': MediumIcon0,
   };
   ```

3. **Icon component** uses the maps to render icons dynamically

4. **Type generation** creates TypeScript types for autocomplete:
   ```typescript
   export type IconName = "arrow-left" | "calendar" | "star" | ...
   ```

---

## Usage Examples

### Basic Usage

```tsx
import { Icon } from '@/design-system/icons';

// Small icon (20px)
<Icon name="star" size="small" />

// Medium icon (24px)
<Icon name="calendar" size="medium" />

// With custom styling
<Icon name="arrow-left" size="small" className="text-blue-500" />
```

### In Button Components

```tsx
import { Button } from '@/design-system/components/Button';

// Icon-only button
<Button iconL="plus" size="medium" iconOnly />

// Button with left icon
<Button iconL="arrow-left" label="Back" />

// Button with right icon
<Button iconR="arrow-right" label="Next" />

// Button with both icons
<Button iconL="star" iconR="chevron-down" label="Favorites" />
```

### In Pill Components

```tsx
import { Pill } from '@/design-system/components/Pill';

<Pill icon="checkmark" label="Completed" />
<Pill icon="star" label="Featured" type="primary" />
```

### With Accessibility

```tsx
// Decorative icon (default)
<Icon name="star" size="small" aria-hidden={true} />

// Meaningful icon with label
<Icon
  name="heart"
  size="small"
  aria-label="Add to favorites"
  aria-hidden={false}
/>
```

---

## Complete Workflow Example

### Scenario: Adding a "notification-bell" icon

**Step 1: Export from Design Tool (Figma)**
- Export as SVG
- Ensure all fills use `currentColor`
- Export two sizes: 20px and 24px

**Step 2: Prepare Files**
- Save 20px version as `notification-bell-small.svg`
- Save 24px version as `notification-bell.svg`

**Step 3: Add to Project**
```bash
# Copy to appropriate directories
cp notification-bell-small.svg src/design-system/icons/small/
cp notification-bell.svg src/design-system/icons/medium/
```

**Step 4: Generate Icon Map**
```bash
npm run generate-icon-map
```

Expected output:
```
✅ Generated icon-map.ts
   Small icons: 215
   Medium icons: 323
```

**Step 5: Use in Component**
```tsx
<Button
  iconL="notification-bell"
  label="Notifications"
  size="medium"
/>
```

**Step 6: Verify TypeScript Autocomplete**
- Your editor now suggests "notification-bell" in icon name props
- Type checking prevents typos

---

## Scripts Reference

### Generate Icon Map (Required after adding icons)
```bash
npm run generate-icon-map
```
- **Purpose:** Regenerates `icon-map.ts` with static imports
- **When to run:** After adding, removing, or renaming icon files
- **Output:** Updates `icon-map.ts`

### Generate Icon Types (Optional)
```bash
node src/design-system/icons/generate-icon-types.js
```
- **Purpose:** Regenerates `icon-names.ts` with TypeScript types
- **When to run:** After adding new icons (for better autocomplete)
- **Output:** Updates `icon-names.ts`

---

## Icon Component API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `IconName` | Required | Icon name (without size suffix) |
| `size` | `'small' \| 'medium'` | `'small'` | Icon size: small (20px) or medium (24px) |
| `className` | `string` | `undefined` | Additional CSS classes |
| `aria-label` | `string` | `undefined` | Accessible label (if icon is not decorative) |
| `aria-hidden` | `boolean` | `true` | Whether icon is decorative |

### Size Reference

| Size | Dimensions | Tailwind | Used In |
|------|------------|----------|---------|
| `small` | 20×20px | `w-5 h-5` | Small, medium buttons; compact UI |
| `medium` | 24×24px | `w-6 h-6` | Large buttons; prominent UI elements |

---

## Fallback Behavior

The Icon component includes smart fallback logic:

1. **Requested size not found:** Falls back to other size
   ```tsx
   // If "star-small.svg" doesn't exist, uses "star.svg" (medium)
   <Icon name="star" size="small" />
   ```

2. **Icon not found in either size:** Shows fallback question mark icon
   ```tsx
   // Console error + fallback icon displayed
   <Icon name="nonexistent" size="small" />
   ```

---

## File Reference

| File | Purpose | Edit? |
|------|---------|-------|
| `small/*.svg` | Small (20px) icon source files | ✅ Yes |
| `medium/*.svg` | Medium (24px) icon source files | ✅ Yes |
| `icon-map.ts` | Static imports map | ❌ Auto-generated |
| `icon-names.ts` | TypeScript types | ❌ Auto-generated |
| `Icon.tsx` | Icon component logic | ⚠️ Only for new features |
| `generate-icon-map.js` | Icon map generation script | ⚠️ Only if changing logic |
| `generate-icon-types.js` | Type generation script | ⚠️ Only if changing logic |
| `utils.ts` | Helper utilities | ⚠️ Only if needed |

---

## Common Tasks

### Adding a Single Icon
1. Add SVG to `small/` or `medium/`
2. Run `npm run generate-icon-map`
3. Use with `<Icon name="..." />`

### Adding Multiple Icons
1. Copy all SVGs to appropriate folders
2. Run `npm run generate-icon-map` once
3. All icons ready to use

### Updating an Existing Icon
1. Replace SVG file with same name
2. No script needed (Next.js hot reloads in dev)
3. For production: rebuild app

### Removing an Icon
1. Delete SVG file from `small/` or `medium/`
2. Run `npm run generate-icon-map`
3. Remove usage from components (TypeScript will show errors)

### Renaming an Icon
1. Rename SVG file in `small/` or `medium/`
2. Run `npm run generate-icon-map`
3. Update all component usage (find & replace)

---

## Troubleshooting

### Icon Not Showing

**Check console for warnings:**
- "Icon 'name' not found in small size, using medium size as fallback"
- "Icon 'name' not found in any size"

**Common causes:**
1. Forgot to run `npm run generate-icon-map`
2. Incorrect naming (e.g., missing `-small` suffix)
3. File in wrong directory
4. Typo in icon name

**Solution:**
```bash
# Re-run generation
npm run generate-icon-map

# Check file exists
ls src/design-system/icons/small/ | grep "your-icon"
ls src/design-system/icons/medium/ | grep "your-icon"
```

### TypeScript Errors

**Error:** `Type '"icon-name"' is not assignable to type 'IconName'`

**Cause:** Icon not in generated types

**Solution:**
```bash
npm run generate-icon-map
node src/design-system/icons/generate-icon-types.js
```

### SVG Not Displaying Correctly

**Check SVG requirements:**
- Uses `currentColor` for fills/strokes
- Has proper viewBox
- No embedded styles or hardcoded colors

### Build Errors

**Error:** `Cannot find module './small/icon-name-small.svg'`

**Cause:** Icon map out of sync

**Solution:**
```bash
npm run generate-icon-map
```

---

## Best Practices

### ✅ Do

- Use `currentColor` for all fills and strokes
- Follow naming conventions exactly
- Run `npm run generate-icon-map` after adding/removing icons
- Keep icons in appropriate size directories
- Use semantic icon names (e.g., `arrow-left` not `icon-left`)
- Test icons in both sizes if providing both

### ❌ Don't

- Hardcode colors in SVG files
- Edit `icon-map.ts` or `icon-names.ts` manually
- Use `import.meta.glob` in Icon component
- Mix up naming conventions
- Forget to run generation script

---

## Integration with Other Projects

### Setting Up in a New Project

1. **Copy icon system files:**
   ```bash
   cp -r src/design-system/icons/ new-project/src/design-system/icons/
   ```

2. **Install dependencies** (already in package.json):
   - Next.js or React
   - TypeScript
   - Tailwind CSS

3. **Add npm script** to `package.json`:
   ```json
   {
     "scripts": {
       "generate-icon-map": "node src/design-system/icons/generate-icon-map.js"
     }
   }
   ```

4. **Generate initial icon map:**
   ```bash
   npm run generate-icon-map
   ```

5. **Import and use:**
   ```tsx
   import { Icon } from '@/design-system/icons';
   ```

### Maintaining Consistency Across Projects

1. **Shared icon library:** Keep a central repository of approved icons
2. **Naming standards:** Follow the same naming conventions
3. **SVG standards:** Use the same export settings from design tools
4. **Generation process:** Run `npm run generate-icon-map` in all projects after updates

---

## For AI Assistants (Claude Code)

When asked to add icons to this project:

1. **Verify file locations:**
   - Small: `src/design-system/icons/small/`
   - Medium: `src/design-system/icons/medium/`

2. **Check naming:**
   - Small: `{name}-small.svg`
   - Medium: `{name}.svg`

3. **Run generation:**
   ```bash
   npm run generate-icon-map
   ```

4. **Verify in code:**
   - Import: `import { Icon } from '@/design-system/icons'`
   - Usage: `<Icon name="{name}" size="small|medium" />`

5. **Common locations to update:**
   - Button components: `iconL`, `iconR` props
   - Pill components: `icon` prop
   - Direct usage: `<Icon name="..." />`

---

## BicolorIcon System

### Overview

BicolorIcons are semantic status and directional icons with two independently customizable colors:
- **Container**: Outer shape (circle, triangle, square)
- **Signifier**: Inner element (checkmark, exclamation, arrow, etc.)

Unlike regular icons that use `currentColor`, BicolorIcons have hardcoded default colors that can be overridden.

### Key Differences from Regular Icons

| Feature | Regular Icon | BicolorIcon |
|---------|-------------|-------------|
| Colors | Single color via `currentColor` | Two colors: container + signifier |
| Color control | CSS classes (`text-blue-500`) | Props (`containerColor`, `signifierColor`) |
| SVG requirements | `fill="currentColor"` | Hardcoded hex colors |
| Use case | General UI icons | Status indicators, semantic feedback |
| Semantic naming | File-based (`arrow-left`) | Semantic (`positive`, `alert`, `info`) |

### Semantic Icon Names

BicolorIcons use semantic names with default color schemes:

| Name | Description | Container | Signifier | Variants |
|------|-------------|-----------|-----------|----------|
| `positive` | Success/confirmation | Green | White | Light, Bold |
| `alert` | Warning/caution | Yellow | Dark | Light, Bold |
| `attention` | Important notice | Yellow | Dark | Single |
| `info` | Informational | Blue | Dark/White | Light, Bold |
| `question` | Help/unknown | Gray | Dark | Single |
| `plus` | Add/expand | Gray | Dark | Single |
| `minus` | Remove/collapse | Gray | Dark | Single |
| `arrow-*` | Directional | Gray | Dark | Up, Down, Left, Right |
| `chevron-*` | Navigation | Gray | Dark | Up, Down, Left, Right |

### Usage Examples

```tsx
import { BicolorIcon } from '@/design-system/icons';

// Default colors
<BicolorIcon name="positive" size="medium" />

// Custom colors
<BicolorIcon
  name="alert"
  size="medium"
  containerColor="#9C27B0"
  signifierColor="#FFFFFF"
/>

// In a notification
<div className="bg-positive-subtle p-4">
  <BicolorIcon name="positive" size="small" />
  <span>Success!</span>
</div>
```

### Adding New BicolorIcons

1. **Create SVG with two colors:**
   ```svg
   <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
     <!-- Container (first fill) -->
     <circle cx="12" cy="12" r="10" fill="#A9E2B3"/>
     <!-- Signifier (subsequent fills) -->
     <path d="..." fill="#181818"/>
   </svg>
   ```

2. **Important requirements:**
   - First `fill` attribute = container color
   - Subsequent `fill` attributes = signifier color
   - Use hex colors, not `currentColor`
   - Avoid `fill="none"` on shape elements

3. **Add to directories:**
   ```bash
   cp icon-small-bicolor.svg src/design-system/icons/bicolor/small/
   cp icon-bicolor.svg src/design-system/icons/bicolor/medium/
   ```

4. **Regenerate map:**
   ```bash
   npm run generate-bicolor-icon-map
   ```

5. **Update semantic mapping** in `BicolorIcon.tsx`:
   ```typescript
   const defaultColors: Record<BicolorIconName, { signifier: string; container: string }> = {
     'new-icon': { signifier: '#181818', container: '#A9E2B3' },
   };

   const nameToFileMap: Record<BicolorIconName, { small: string; medium: string }> = {
     'new-icon': {
       small: 'icon-small-bicolor.svg',
       medium: 'icon-bicolor.svg',
     },
   };
   ```

### BicolorIcon Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `BicolorIconName` | Required | Semantic icon name |
| `size` | `'small' \| 'medium'` | `'small'` | Icon size: small (20px) or medium (24px) |
| `containerColor` | `string` | Default per icon | Hex color for outer shape |
| `signifierColor` | `string` | Default per icon | Hex color for inner element |
| `className` | `string` | `undefined` | Additional CSS classes |
| `aria-label` | `string` | `undefined` | Accessible label |
| `aria-hidden` | `boolean` | `true` | Whether decorative |

### Color Customization Tips

```tsx
// Match your design tokens
<BicolorIcon
  name="positive"
  containerColor="#34C759"  // bg-positive-high
  signifierColor="#FFFFFF"   // white
/>

// Create variants
<BicolorIcon
  name="alert"
  containerColor="#FFD93D"  // Light variant
  signifierColor="#181818"
/>

<BicolorIcon
  name="alert"
  containerColor="#F5A623"  // Dark variant
  signifierColor="#181818"
/>
```

### Scripts Reference

```bash
# Generate bicolor icon map
npm run generate-bicolor-icon-map

# Check available bicolor icons
ls src/design-system/icons/bicolor/small/
ls src/design-system/icons/bicolor/medium/
```

### Working with Claude Code

When you add new BicolorIcon SVG files, you can ask Claude Code to handle the complete processing workflow.

#### Key Elements to Include in Your Prompt

1. **File names** or pattern description
2. **Desired semantic name** (e.g., "complete", "urgent", "approved")
3. **Default colors** (optional - Claude can suggest based on semantic meaning)
4. **Variant info** if applicable (light/bold)
5. **What you want done** (just regenerate map vs complete setup)

#### Example Prompts

**Simple Addition:**
```
I just added checkmark-square-small-bicolor.svg and checkmark-square-bicolor.svg
to the bicolor folders. Process these as "complete" with green/white colors.
```

**Batch Addition:**
```
I've added 4 new bicolor icons to the bicolor folders:
- star-circle (small + medium)
- heart-circle (small + medium)
- bookmark-circle (small + medium)
- flag-circle (small + medium)

Process all of these with default gray/dark colors. Use semantic names that make sense.
```

**Complete Workflow:**
```
I exported 3 new status icons from Figma and put them in the bicolor folders:

1. in-progress-spinner (blue/white)
2. on-hold-pause (yellow/dark)
3. archived-box (gray/dark)

Please handle everything needed to make them work - regenerate the map,
add semantic mappings, and set up the default colors.
```

**With Variants:**
```
Added light and bold variants of a "critical" status icon:

Files:
- exclamation-square-small-bicolor-light.svg / exclamation-square-bicolor-light.svg
- exclamation-square-small-bicolor-bold.svg / exclamation-square-bicolor-bold.svg

Set up as "critical" and "critical-bold" with red colors
(light: #FF6B6B/#FFF, bold: #D32F2F/#FFF)
```

**Verification/Debugging:**
```
I added bicolor icons but they're not showing up. Can you:
1. Check if the files are in the right folders
2. Regenerate the icon map
3. Verify the semantic mappings are correct
4. Test that they work with default colors
```

**After Renaming:**
```
I renamed some bicolor icon files - can you update the mappings?

Old: success-circle-small-bicolor.svg → New: checkmark-badge-small-bicolor.svg
Old: success-circle-bicolor.svg → New: checkmark-badge-bicolor.svg

Keep the semantic name "positive" but update the file references.
```

#### What Claude Code Will Do

When you give these prompts, Claude Code will:
1. Run `npm run generate-bicolor-icon-map` to regenerate the icon map
2. Update `BicolorIconName` type with new semantic names
3. Add entries to `defaultColors` with appropriate color schemes
4. Add entries to `nameToFileMap` with file references
5. Verify the setup works correctly

---

## Current Icon Inventory

### Regular Icons
- **Small icons:** 213 icons (20×20px)
- **Medium icons:** 323 icons (24×24px)

### BicolorIcons
- **Small bicolor icons:** 15 icons (20×20px)
- **Medium bicolor icons:** 19 icons (24×24px)
- **Semantic names:** 18 (positive, alert, attention, info, arrows, chevrons, etc.)

To see all available icons, check:
- `src/design-system/icons/icon-names.ts` (Regular icon types)
- `src/design-system/icons/BicolorIcon.tsx` (BicolorIcon types)
- Storybook: Icon and BicolorIcon documentation pages
- Directory listings: `ls src/design-system/icons/{small,medium,bicolor/small,bicolor/medium}/`

---

## Additional Resources

- **Storybook:** View all icons in the Icon component documentation
- **Figma:** [Link to design system Figma file]
- **Support:** [Team Slack channel or contact info]

---

## Changelog

- **2025-01-08:** Comprehensive documentation added
- **2024-10-06:** Icon map generation system implemented
- **2024-10-02:** Initial icon system created
