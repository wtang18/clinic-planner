# EHR Prototype Design Principles

## 1. Monochrome Default

All surfaces, icons, and text default to grayscale. Color is reserved for communicating status and is never decorative.

- Categories (medications, labs, vitals, etc.) are differentiated by **icon shape and label**, not color
- Icon containers use `colors.bg.neutral.min` background and `colors.fg.neutral.spotReadable` color
- Card backgrounds are `colors.bg.neutral.base` or `colors.bg.neutral.subtle`

## 2. Color Semantics

Color conveys meaning only through these channels:

| Status | Usage | Example |
|--------|-------|---------|
| **Critical/Error** | Red fill (`colors.bg.alert.subtle`) + red icon/text | Drug interaction alert, critical lab value |
| **Success/Complete** | Green text/icon only (no fill) | Completed task, resolved care gap |
| **Attention/Warning** | Yellow text/icon only (no fill) | Due soon, needs review |
| **AI/Generative** | Purple text/icon only (no fill) | AI suggestion badge, Sparkles icon |

**Only critical/error states get a colored background fill.** All other statuses use colored text or icons on neutral backgrounds.

## 3. No Decorative Color

- No colored `borderLeft` indicators on cards
- No category-specific colored backgrounds, borders, or dots
- No colored progress bars (use `colors.fg.neutral.secondary`)
- No tinted backgrounds for non-critical states

## 4. Shadow Over Border (Simple Surfaces)

Cards use subtle elevation rather than visible borders for containment:

```ts
// Card default variant
backgroundColor: colors.bg.neutral.base,
border: '1px solid rgba(0, 0, 0, 0.04)',  // barely visible
boxShadow: shadows.xs,                     // subtle depth
```

- No internal sub-borders (`borderTop`, `borderBottom`) to divide card sections
- Use spacing (`padding`, `gap`, `margin`) for visual separation within cards
- Cards float on surfaces rather than being outlined boxes

## 5. Glass Interactive Elements

Interactive controls (buttons, pills, chips) use translucent backgrounds with backdrop blur to integrate with their surroundings:

```ts
// Secondary button / interactive pill
backgroundColor: 'rgba(128, 128, 128, 0.08)',
backdropFilter: 'blur(12px)',
WebkitBackdropFilter: 'blur(12px)',
border: '1px solid rgba(0, 0, 0, 0.06)',

// Hover state
backgroundColor: 'rgba(128, 128, 128, 0.14)',
```

- **Primary** and **Danger** buttons remain opaque (they need to stand out)
- **Secondary** and **Ghost** buttons use glass effect
- Unselected category pills, suggestion chips use glass
- Reusable tokens in `foundations/glass.ts`

## 6. Typography Hierarchy

Use font weight and spacing to create hierarchy, not internal borders or color:

- Section titles: `fontWeight: semibold`, `marginBottom` for separation
- Body text: `colors.fg.neutral.secondary`
- Disabled/tertiary: `colors.fg.neutral.spotReadable`
- No `borderTop` or `borderBottom` to separate sections within a card

## 7. Icons (lucide-react)

All icons use `lucide-react` with explicit `size` props:

- Button icons: `sm=14, md=16, lg=18` (matches button size)
- Inline icons: typically `14-16`
- Card header icons: `20-24`
- Empty state icons: `48-64`
- Never use `width="100%"` on icons (causes sizing bugs)
- Wrapper spans are unnecessary — lucide components handle their own dimensions
