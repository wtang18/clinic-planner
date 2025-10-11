# Phase 3 Cleanup Notes

## Completed Tasks ✅

### Spacing.stories.tsx
- [x] Add documentation about directional spacing
  - Added DirectionalSpacing story with 4 real-world examples
  - Updated meta docs to mention directional padding capability
  - Added code examples showing individual side usage

### General Consistency
- [x] Ensure all token stories follow the same structure
  - Verified all titles use `'Design System/Foundations/...'` pattern
  - Added missing `tags: ['autodocs']` to NewTokenSystem.stories.tsx

### Primitive Token Documentation
- [x] Create DimensionsPrimitives.stories.tsx
  - Complete dimension scale (0-96px)
  - Negative dimensions documentation
  - Semantic token mapping examples
- [x] Create ElevationPrimitives.stories.tsx
  - Shadow offset, blur, spread, and color primitives
  - Visual demonstrations with composition examples
- [x] Create TypographyPrimitives.stories.tsx
  - Font families, sizes, weights, line heights, letter spacing
  - Text style composition examples

## Remaining Issues to Fix

### Colors.stories.tsx
- [ ] Usage examples section still using Tailwind classes instead of CSS variables
  - Fix: Convert all `bg-alert-subtle`, `text-alert-primary`, etc. to `bg-[var(--color-bg-alert-subtle)]`
  - Check all example cards and messages for proper token usage

### BorderRadius.stories.tsx
- [ ] Usage examples aren't using actual components from our design system
  - Consider: Use real Button, Input, Card components instead of generic divs
  - May be acceptable as-is for foundation-level documentation (discuss with team)

## Phase 3 Enhanced: Documentation Standardization

### Documentation Structure & Hierarchy
All token documentation should follow this consistent structure:

1. **Overview Section** (in meta.docs.description.component)
   - What the tokens are
   - When to use them
   - Design principles

2. **Accessibility Section** (new - to be added to all stories)
   - WCAG compliance notes
   - Color contrast requirements (for color tokens)
   - Readable text sizes (for typography tokens)
   - Focus states and keyboard navigation (for interactive examples)
   - Screen reader considerations

3. **Reference Tables**
   - Complete list of available tokens
   - Values and use cases
   - Consistent table formatting

4. **Visual Examples** (stories)
   - "All [Tokens]" - Complete scale view
   - "Usage Examples" - Real-world patterns
   - "Comparison" - Side-by-side visual comparison (where applicable)

5. **Best Practices Section**
   - Do's and don'ts
   - Common patterns
   - Anti-patterns to avoid

### Copy Style Guidelines
- **Tone**: Professional, educational, concise
- **Code examples**: Always show both ❌ wrong and ✅ correct patterns
- **Token names**: Use backticks for inline code (e.g., \`--color-bg-alert-subtle\`)
- **Descriptions**: Action-oriented ("Use for..." not "Can be used for...")
- **Consistency**: Use same terminology across all docs (e.g., "semantic tokens" not "contextual tokens")

### Component Usage in Examples

#### Current State
- Most examples use generic divs and inline styles
- Some use Tailwind utility classes
- Inconsistent between foundation docs

#### Target State
**Foundation-Level Documentation** (Primitives, Colors, Spacing, BorderRadius, Elevation, Typography)
- Generic divs are acceptable for demonstrating raw token values
- Should use CSS variables with proper syntax: `bg-[var(--token-name)]`
- Keep examples simple to focus on the tokens themselves

**Semantic Token Documentation** (Text Styles, Components)
- MUST use actual design system components where they exist
- If component doesn't exist in code but exists in Figma, add note: "Component to be implemented"

#### Missing Components to Build (from Figma)
Suggest these as candidates for implementation to improve examples:
- [ ] **Button component** - For showing interactive states, elevation changes
  - Variants: primary, secondary, tertiary, ghost
  - States: default, hover, active, disabled, focus
- [ ] **Input/TextField component** - For form examples
  - With label, error states, helper text
- [ ] **Card component** - For layout examples
  - With header, body, footer sections
- [ ] **Badge/Pill component** - For small status indicators
  - Various colors and sizes
- [ ] **Alert/Banner component** - For message patterns
  - Success, error, warning, info variants
- [ ] **Tooltip component** - For overlay examples
  - Positioning and elevation
- [ ] **Modal/Dialog component** - For high-elevation examples
  - With backdrop, close button
- [ ] **Dropdown/Menu component** - For popover examples
  - With elevation and positioning

### Accessibility Section Template

Add this section to each token story's documentation:

```markdown
## Accessibility

### WCAG Compliance
[Specific guidelines for this token category]

### Best Practices
- [Accessibility best practice 1]
- [Accessibility best practice 2]
- [Accessibility best practice 3]

### Testing
- [How to verify accessibility for this token]
```

#### Per-Category Accessibility Content

**Colors:**
- Minimum contrast ratios: 4.5:1 for normal text, 3:1 for large text (WCAG AA)
- Use semantic color tokens that pair bg/fg with sufficient contrast
- Never rely on color alone to convey information
- Test with color blindness simulators
- Provide text alternatives for color-coded information

**Typography:**
- Minimum font size: 16px for body text (14px acceptable for UI elements)
- Line height: 1.5 minimum for body text
- Line length: 45-75 characters per line for readability
- Avoid all-caps for long text (harder to read)
- Use font weight to create hierarchy, not just size
- Ensure font renders clearly at all sizes

**Spacing:**
- Adequate touch targets: minimum 44x44px (iOS), 48x48px (Android)
- Sufficient spacing between interactive elements
- Consistent spacing improves scannability for screen readers
- Use space to group related content

**Elevation:**
- Shadows provide visual hierarchy cues
- Don't rely solely on shadows - use borders or contrast for users who can't perceive depth
- High contrast mode may remove shadows - ensure UI still works

**Border Radius:**
- Rounded corners can improve touch target perception
- Consistency in radius creates predictable interaction patterns
- Avoid extreme radius values that distort content

### Implementation Checklist

- [ ] Add Accessibility section to Colors.stories.tsx
- [ ] Add Accessibility section to Spacing.stories.tsx
- [ ] Add Accessibility section to BorderRadius.stories.tsx
- [ ] Add Accessibility section to Elevation.stories.tsx (ElevationDemo.stories.tsx)
- [ ] Add Accessibility section to Typography stories (TextStylesDemo, TextStylesExpressiveDemo)
- [ ] Add Accessibility section to DimensionsPrimitives.stories.tsx
- [ ] Add Accessibility section to ElevationPrimitives.stories.tsx
- [ ] Add Accessibility section to TypographyPrimitives.stories.tsx
- [ ] Update Colors.stories.tsx usage examples to use CSS variables instead of Tailwind classes
- [ ] Standardize all code examples to show ❌/✅ patterns
- [ ] Review all documentation copy for consistent tone and terminology
- [ ] Create design system component implementation roadmap for better examples
