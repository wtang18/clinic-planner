# Multi-Theme Token Architecture

The Carbon Health design token system supports multiple product families and themes through a layered architecture that separates universal values from product-specific customization.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  THEMES (product-specific overrides)                                │
│    └── themes/pro/{ehr, billing, operations, patient-app}/          │
│    └── themes/concept/{liquid-glass, ...}                           │
│                              ↑                                      │
├─────────────────────────────────────────────────────────────────────┤
│  BASES (product family semantics)                                   │
│    └── bases/pro/semantic-*       (dense UI, Inter font)           │
│    └── bases/consumer/semantic-*  (generous spacing, friendly font) │
│                              ↑                                      │
├─────────────────────────────────────────────────────────────────────┤
│  DECORATIVE (named color abstractions, theme-aware)                 │
│    └── decorative/color-on-{light, dark}                           │
│                              ↑                                      │
├─────────────────────────────────────────────────────────────────────┤
│  PRIMITIVES (universal raw values)                                  │
│    └── primitives/{color-ramp, typography, dimensions, elevation}   │
└─────────────────────────────────────────────────────────────────────┘
```

### Layer Definitions

| Layer | Purpose | Example |
|-------|---------|---------|
| **Primitives** | Raw values shared by all products | `color.blue.500`, `dimension.space.200` |
| **Decorative** | Named color abstractions | `gray.min`, `blue.low` |
| **Bases** | Product family semantics | `bg-neutral-base`, `text-body-md` |
| **Themes** | Product-specific overrides | EHR accent = teal, Billing accent = purple |

## Product Families

### Pro vs Consumer

The system supports two main product families with different design philosophies:

| Aspect | Pro | Consumer |
|--------|-----|----------|
| **Typography** | Inter (functional, dense) | Nunito Sans (friendly, readable) |
| **Spacing** | Compact (information-dense UI) | Generous (breathing room) |
| **Target Users** | Healthcare workers | Patients |
| **Products** | EHR, Billing Hub, Clinic Operations, Patient App | Patient Website |

### Pro Products and Their Accents

Within the Pro family, each product has a unique accent color:

| Product | Accent Color | Rationale |
|---------|--------------|-----------|
| **EHR** | Teal | Clinical, calming, medical |
| **Billing Hub** | Purple | Financial, professional |
| **Clinic Operations** | Orange | Active, operational |
| **Patient App** | Green | Health, wellness |

These are implemented as sparse overrides - only the accent tokens differ from the Pro base.

### Product Families Divergence

Different product families require different levels of customization. This diagram shows how the architecture handles varying divergence:

```
                              ┌──────────────────────────────────────┐
                              │            PRIMITIVES                │
                              │   (color ramp, spacing scale, etc.)  │
                              └───────────────┬────────────────────┬─┘
                                              │                    │
                  ┌───────────────────────────┼────────────────────┼───────────────┐
                  │                           │                    │               │
                  ▼                           ▼                    ▼               ▼
        ┌─────────────────┐       ┌─────────────────┐    ┌─────────────────┐    (future)
        │  Consumer Base  │       │    Pro Base     │    │  Concept Base   │
        │   (standalone)  │       │   (foundation)  │    │  (standalone)   │
        │                 │       │                 │    │                 │
        │  • Nunito Sans  │       │  • Inter font   │    │  • Glassmorphic │
        │  • Generous     │       │  • Compact      │    │  • Blur effects │
        │    spacing      │       │    spacing      │    │  • Translucent  │
        └────────┬────────┘       └────────┬────────┘    └────────┬────────┘
                 │                         │                      │
                 ▼                         ▼                      ▼
        ┌─────────────────┐       ┌───────┴───────┐      ┌─────────────────┐
        │ Patient Website │       │    THEMES     │      │ Liquid Glass    │
        │   (no themes)   │       │ (sparse only) │      │     EHR         │
        └─────────────────┘       └───────┬───────┘      └─────────────────┘
                                          │
                         ┌────────────────┼────────────────┐
                         │                │                │
                         ▼                ▼                ▼
                    ┌─────────┐     ┌──────────┐     ┌──────────┐
                    │   EHR   │     │ Billing  │     │ Patient  │
                    │  (teal) │     │ (purple) │     │   App    │
                    └─────────┘     └──────────┘     │ (green)  │
                                                     └──────────┘
                                           │
                                     ┌──────────┐
                                     │   Ops    │
                                     │ (orange) │
                                     └──────────┘
```

### Divergence Level Strategy

| Layer | Divergence Level | Strategy | Example |
|-------|------------------|----------|---------|
| **Primitives** | None (shared) | Single source of truth | Color ramp, spacing scale |
| **Bases** | High (50+ tokens) | Full semantic files | Pro vs Consumer typography |
| **Themes** | Low (5-15 tokens) | Sparse overrides | EHR accent = teal |
| **Concept** | Experimental | Standalone base | Liquid Glass effects |

### When to Use Each Strategy

**Use Sparse Theme Overrides when:**
- Products share 90%+ of tokens
- Differences are limited to branding (accent colors, logos)
- Same component library across products
- Examples: EHR, Billing, Operations (all Pro products)

**Use Separate Base when:**
- Products have fundamentally different design philosophies
- Different typography, spacing, or interaction patterns
- Target different user types with different needs
- Examples: Consumer (patient-facing) vs Pro (staff-facing)

**Use Concept/Experimental when:**
- Exploring future design directions
- Not ready for production
- May require unique components
- Examples: Liquid Glass EHR concept

## Light/Dark Mode

Light and dark modes are an **orthogonal axis** to the product theme structure:

```
                      Light Mode              Dark Mode
                      ──────────              ─────────
Pro Base:             pro-light.css           pro-dark.css
Pro + EHR:            pro-ehr-light.css       pro-ehr-dark.css
Pro + Billing:        pro-billing-light.css   pro-billing-dark.css
Consumer Base:        consumer-light.css      consumer-dark.css
```

This means:
- Each base defines both light and dark variants
- Theme overrides apply to both light and dark versions
- Users can switch modes independently of the product theme

## Build Matrix

Style Dictionary composes tokens from multiple source files:

| Output | Source Composition |
|--------|-------------------|
| `pro-light.css` | primitives + decorative-light + bases/pro/*-light |
| `pro-dark.css` | primitives + decorative-dark + bases/pro/*-dark |
| `pro-ehr-light.css` | pro-light + themes/pro/ehr/overrides |
| `pro-ehr-dark.css` | pro-dark + themes/pro/ehr/overrides |
| `consumer-light.css` | primitives + decorative-light + bases/consumer/*-light |
| `consumer-dark.css` | primitives + decorative-dark + bases/consumer/*-dark |

**Note:** Product theme builds (EHR, Billing, etc.) are not yet implemented. Currently all products use the Pro base theme with purple accent + carby green for AI features.

## Directory Structure

```
packages/design-tokens/sd-input/
├── primitives/                    # Raw values (shared by all)
│   ├── color-ramp.json           # Full color palette
│   ├── dimensions.json           # Spacing scale
│   ├── typography.json           # Font families, sizes, weights
│   └── elevation.json            # Shadow definitions
│
├── decorative/                    # Named color abstractions
│   ├── color-on-light.json       # Light mode decoratives
│   └── color-on-dark.json        # Dark mode decoratives
│
├── bases/                         # Product family foundations
│   ├── pro/                      # Healthcare worker products
│   │   ├── semantic-color-light.json
│   │   ├── semantic-color-dark.json
│   │   ├── semantic-dimensions.json    # Compact spacing
│   │   ├── semantic-elevation.json
│   │   ├── semantic-typography-small.json
│   │   └── semantic-typography-large.json
│   │
│   └── consumer/                 # Patient-facing products
│       ├── semantic-color-light.json
│       ├── semantic-color-dark.json
│       ├── semantic-dimensions.json    # Generous spacing
│       ├── semantic-elevation.json
│       ├── semantic-typography-small.json
│       └── semantic-typography-large.json
│
└── themes/                        # Product-specific overrides
    ├── pro/                      # Sparse overrides on Pro base
    │   ├── ehr/overrides.json           # Teal accent
    │   ├── billing/overrides.json       # Purple accent
    │   ├── operations/overrides.json    # Orange accent
    │   └── patient-app/overrides.json   # Green accent
    │
    └── concept/                  # Experimental designs
        └── liquid-glass/
            ├── README.md
            └── effects.json
```

## How Overrides Work

Theme override files use the **sparse override pattern** - they only specify tokens that differ from the base:

```json
// themes/pro/ehr/overrides.json
{
  "$description": "EHR product theme - Teal accent",
  "color": {
    "bg": {
      "accent": {
        "subtle": { "value": "{color.teal.50}" },
        "low": { "value": "{color.teal.100}" },
        "high": { "value": "{color.teal.600}" }
      }
    },
    "fg": {
      "accent": {
        "primary": { "value": "{color.teal.700}" }
      }
    }
  }
}
```

Style Dictionary merges files in order - last wins. So the build includes:
1. Primitives (color ramp)
2. Base semantics (Pro light)
3. Theme overrides (EHR)

Result: All tokens from Pro, with accent colors replaced by teal.

## Adding a New Product Theme

To add a new Pro product (e.g., "Analytics Dashboard"):

1. **Create override file:**
   ```
   themes/pro/analytics/overrides.json
   ```

2. **Define accent colors:**
   ```json
   {
     "$description": "Analytics Dashboard - Indigo accent",
     "color": {
       "bg": {
         "accent": {
           "subtle": { "value": "{color.indigo.50}" },
           "high": { "value": "{color.indigo.600}" }
         }
       },
       "fg": {
         "accent": {
           "primary": { "value": "{color.indigo.700}" }
         }
       }
     }
   }
   ```

3. **Add build target** (when implemented):
   ```js
   // sd.config.themes.js
   { name: 'pro-analytics-light', sources: [...proLight, 'themes/pro/analytics/overrides.json'] }
   ```

4. **Run build:**
   ```bash
   npm run build:tokens
   ```

## Adding a New Base

If a product family diverges significantly (50+ token differences), create a new base:

1. **Create base directory:**
   ```
   bases/<family>/
   ```

2. **Copy closest existing base and modify:**
   - `semantic-color-light.json`
   - `semantic-color-dark.json`
   - `semantic-dimensions.json`
   - `semantic-typography-*.json`
   - `semantic-elevation.json`

3. **Add build targets** for light/dark variants.

## Concept/Experimental Themes

Experimental design directions live in `themes/concept/`:

- **Not for production use**
- Used to explore future design directions
- May have their own component definitions
- Graduate to production when proven

Example: `themes/concept/liquid-glass/` explores Apple-inspired translucent UI with blur effects and glass surfaces.

## Token Resolution

When a component uses a token like `--color-bg-accent-subtle`:

1. Browser looks up CSS custom property
2. Value depends on which CSS file is loaded:
   - `pro-light.css` → blue (Pro default)
   - `pro-ehr-light.css` → teal (EHR override)
   - `consumer-light.css` → blue (Consumer uses same accent)

No runtime JavaScript needed - just load the right CSS file.

## Related Documentation

- [Quick Token Reference](../guides/quick-token-reference.md) - Token cheatsheet
- [sd-input/README.md](../../packages/design-tokens/sd-input/README.md) - Build details
- [Token Comparison](./token-comparison.md) - Why Style Dictionary
