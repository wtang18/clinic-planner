# Design System Tokens

> **Generated on:** October 1, 2025
> **Source:** Figma Design Tokens → Tailwind CSS Configuration

This document provides a comprehensive reference for all design tokens available in the clinic planner design system. All tokens are available as Tailwind CSS utilities.

## Table of Contents

- [Colors](#colors)
  - [Core Color Scales](#core-color-scales)
  - [Brand Colors](#brand-colors)
  - [Semantic Background Colors](#semantic-background-colors)
  - [Semantic Foreground Colors](#semantic-foreground-colors)
  - [Utility Colors](#utility-colors)
- [Typography](#typography)
  - [Font Sizes](#font-sizes)
  - [Font Weights](#font-weights)
  - [Line Heights](#line-heights)
- [Spacing](#spacing)
- [Border Radius](#border-radius)
- [Box Shadows](#box-shadows)

---

## Colors

### Core Color Scales

These are the foundational color scales that form the basis of our design system.

#### Gray Scale
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin: 16px 0;">
  <div style="background: #fafafa; padding: 12px; border-radius: 4px; border: 1px solid #e1e1e1;">
    <div style="font-weight: 600; font-size: 12px;">gray-25</div>
    <div style="font-size: 11px; color: #666;">#fafafa</div>
  </div>
  <div style="background: #f1f1f1; padding: 12px; border-radius: 4px; border: 1px solid #e1e1e1;">
    <div style="font-weight: 600; font-size: 12px;">gray-50</div>
    <div style="font-size: 11px; color: #666;">#f1f1f1</div>
  </div>
  <div style="background: #e1e1e1; padding: 12px; border-radius: 4px; border: 1px solid #d4d4d4;">
    <div style="font-weight: 600; font-size: 12px;">gray-100</div>
    <div style="font-size: 11px; color: #666;">#e1e1e1</div>
  </div>
  <div style="background: #d4d4d4; padding: 12px; border-radius: 4px; border: 1px solid #bcbcbc;">
    <div style="font-weight: 600; font-size: 12px;">gray-200</div>
    <div style="font-size: 11px; color: #666;">#d4d4d4</div>
  </div>
  <div style="background: #bcbcbc; padding: 12px; border-radius: 4px; color: white;">
    <div style="font-weight: 600; font-size: 12px;">gray-300</div>
    <div style="font-size: 11px; opacity: 0.9;">#bcbcbc</div>
  </div>
  <div style="background: #a4a4a4; padding: 12px; border-radius: 4px; color: white;">
    <div style="font-weight: 600; font-size: 12px;">gray-400</div>
    <div style="font-size: 11px; opacity: 0.9;">#a4a4a4</div>
  </div>
  <div style="background: #8b8b8b; padding: 12px; border-radius: 4px; color: white;">
    <div style="font-weight: 600; font-size: 12px;">gray-500</div>
    <div style="font-size: 11px; opacity: 0.9;">#8b8b8b</div>
  </div>
  <div style="background: #676767; padding: 12px; border-radius: 4px; color: white;">
    <div style="font-weight: 600; font-size: 12px;">gray-600</div>
    <div style="font-size: 11px; opacity: 0.9;">#676767</div>
  </div>
  <div style="background: #5f5f5f; padding: 12px; border-radius: 4px; color: white;">
    <div style="font-weight: 600; font-size: 12px;">gray-700</div>
    <div style="font-size: 11px; opacity: 0.9;">#5f5f5f</div>
  </div>
  <div style="background: #424242; padding: 12px; border-radius: 4px; color: white;">
    <div style="font-weight: 600; font-size: 12px;">gray-800</div>
    <div style="font-size: 11px; opacity: 0.9;">#424242</div>
  </div>
  <div style="background: #323232; padding: 12px; border-radius: 4px; color: white;">
    <div style="font-weight: 600; font-size: 12px;">gray-900</div>
    <div style="font-size: 11px; opacity: 0.9;">#323232</div>
  </div>
  <div style="background: #181818; padding: 12px; border-radius: 4px; color: white;">
    <div style="font-weight: 600; font-size: 12px;">gray-1000</div>
    <div style="font-size: 11px; opacity: 0.9;">#181818</div>
  </div>
</div>

**Usage:** `bg-gray-50`, `text-gray-600`, `border-gray-200`

#### Blue Scale
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin: 16px 0;">
  <div style="background: #e5f3f8; padding: 12px; border-radius: 4px; border: 1px solid #c9e6f0;">
    <div style="font-weight: 600; font-size: 12px; color: #234658;">blue-50</div>
    <div style="font-size: 11px; color: #376c89;">#e5f3f8</div>
  </div>
  <div style="background: #c9e6f0; padding: 12px; border-radius: 4px; border: 1px solid #b9dfea;">
    <div style="font-weight: 600; font-size: 12px; color: #234658;">blue-100</div>
    <div style="font-size: 11px; color: #376c89;">#c9e6f0</div>
  </div>
  <div style="background: #b9dfea; padding: 12px; border-radius: 4px; border: 1px solid #8bc9de;">
    <div style="font-weight: 600; font-size: 12px; color: #234658;">blue-200</div>
    <div style="font-size: 11px; color: #376c89;">#b9dfea</div>
  </div>
  <div style="background: #8bc9de; padding: 12px; border-radius: 4px; color: #234658;">
    <div style="font-weight: 600; font-size: 12px;">blue-300</div>
    <div style="font-size: 11px; opacity: 0.8;">#8bc9de</div>
  </div>
  <div style="background: #6ab0ca; padding: 12px; border-radius: 4px; color: white;">
    <div style="font-weight: 600; font-size: 12px;">blue-400</div>
    <div style="font-size: 11px; opacity: 0.9;">#6ab0ca</div>
  </div>
  <div style="background: #4d93af; padding: 12px; border-radius: 4px; color: white;">
    <div style="font-weight: 600; font-size: 12px;">blue-500</div>
    <div style="font-size: 11px; opacity: 0.9;">#4d93af</div>
  </div>
  <div style="background: #376c89; padding: 12px; border-radius: 4px; color: white;">
    <div style="font-weight: 600; font-size: 12px;">blue-600</div>
    <div style="font-size: 11px; opacity: 0.9;">#376c89</div>
  </div>
  <div style="background: #306385; padding: 12px; border-radius: 4px; color: white;">
    <div style="font-weight: 600; font-size: 12px;">blue-700</div>
    <div style="font-size: 11px; opacity: 0.9;">#306385</div>
  </div>
  <div style="background: #234658; padding: 12px; border-radius: 4px; color: white;">
    <div style="font-weight: 600; font-size: 12px;">blue-800</div>
    <div style="font-size: 11px; opacity: 0.9;">#234658</div>
  </div>
  <div style="background: #1b3644; padding: 12px; border-radius: 4px; color: white;">
    <div style="font-weight: 600; font-size: 12px;">blue-900</div>
    <div style="font-size: 11px; opacity: 0.9;">#1b3644</div>
  </div>
</div>

**Usage:** `bg-blue-500`, `text-blue-700`, `border-blue-300`

#### Green Scale
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin: 16px 0;">
  <div style="background: #e3f5eb; padding: 12px; border-radius: 4px; border: 1px solid #cbedda;">
    <div style="font-weight: 600; font-size: 12px; color: #174b34;">green-50</div>
    <div style="font-size: 11px; color: #247450;">#e3f5eb</div>
  </div>
  <div style="background: #cbedda; padding: 12px; border-radius: 4px; border: 1px solid #a9e2b3;">
    <div style="font-weight: 600; font-size: 12px; color: #174b34;">green-100</div>
    <div style="font-size: 11px; color: #247450;">#cbedda</div>
  </div>
  <div style="background: #a9e2b3; padding: 12px; border-radius: 4px; color: #174b34;">
    <div style="font-weight: 600; font-size: 12px;">green-200</div>
    <div style="font-size: 11px; opacity: 0.8;">#a9e2b3</div>
  </div>
  <div style="background: #76ce98; padding: 12px; border-radius: 4px; color: #174b34;">
    <div style="font-weight: 600; font-size: 12px;">green-300</div>
    <div style="font-size: 11px; opacity: 0.8;">#76ce98</div>
  </div>
  <div style="background: #52b784; padding: 12px; border-radius: 4px; color: white;">
    <div style="font-weight: 600; font-size: 12px;">green-400</div>
    <div style="font-size: 11px; opacity: 0.9;">#52b784</div>
  </div>
  <div style="background: #319d6d; padding: 12px; border-radius: 4px; color: white;">
    <div style="font-weight: 600; font-size: 12px;">green-500</div>
    <div style="font-size: 11px; opacity: 0.9;">#319d6d</div>
  </div>
  <div style="background: #247450; padding: 12px; border-radius: 4px; color: white;">
    <div style="font-weight: 600; font-size: 12px;">green-600</div>
    <div style="font-size: 11px; opacity: 0.9;">#247450</div>
  </div>
  <div style="background: #0e6c52; padding: 12px; border-radius: 4px; color: white;">
    <div style="font-weight: 600; font-size: 12px;">green-700</div>
    <div style="font-size: 11px; opacity: 0.9;">#0e6c52</div>
  </div>
  <div style="background: #174b34; padding: 12px; border-radius: 4px; color: white;">
    <div style="font-weight: 600; font-size: 12px;">green-800</div>
    <div style="font-size: 11px; opacity: 0.9;">#174b34</div>
  </div>
  <div style="background: #123928; padding: 12px; border-radius: 4px; color: white;">
    <div style="font-weight: 600; font-size: 12px;">green-900</div>
    <div style="font-size: 11px; opacity: 0.9;">#123928</div>
  </div>
</div>

**Usage:** `bg-green-500`, `text-green-700`, `border-green-300`

#### Additional Core Scales

- **Cream Scale:** `cream-50` through `cream-900` - Warm neutral tones
- **Yellow Scale:** `yellow-50` through `yellow-900` - Attention and warning states
- **Red Scale:** `red-50` through `red-900` - Error and danger states
- **Purple Scale:** `purple-50` through `purple-900` - Accent and brand colors
- **Saturated Red Scale:** `saturated-red-50` through `saturated-red-900` - High-contrast alerts

### Brand Colors

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin: 16px 0;">
  <div style="background: #6bd9a1; padding: 12px; border-radius: 4px; color: white;">
    <div style="font-weight: 600; font-size: 12px;">carby-green</div>
    <div style="font-size: 11px; opacity: 0.9;">#6bd9a1</div>
  </div>
  <div style="background: #222324; padding: 12px; border-radius: 4px; color: white;">
    <div style="font-weight: 600; font-size: 12px;">logo-primary</div>
    <div style="font-size: 11px; opacity: 0.9;">#222324</div>
  </div>
  <div style="background: #6e7071; padding: 12px; border-radius: 4px; color: white;">
    <div style="font-weight: 600; font-size: 12px;">logo-secondary</div>
    <div style="font-size: 11px; opacity: 0.9;">#6e7071</div>
  </div>
  <div style="background: #baa3bf; padding: 12px; border-radius: 4px; color: #4c3c5a;">
    <div style="font-weight: 600; font-size: 12px;">logo-purple</div>
    <div style="font-size: 11px; opacity: 0.8;">#baa3bf</div>
  </div>
  <div style="background: #a3e1c2; padding: 12px; border-radius: 4px; color: #174b34;">
    <div style="font-weight: 600; font-size: 12px;">logo-mint</div>
    <div style="font-size: 11px; opacity: 0.8;">#a3e1c2</div>
  </div>
  <div style="background: #24a06d; padding: 12px; border-radius: 4px; color: white;">
    <div style="font-weight: 600; font-size: 12px;">logo-green</div>
    <div style="font-size: 11px; opacity: 0.9;">#24a06d</div>
  </div>
  <div style="background: #e15c18; padding: 12px; border-radius: 4px; color: white;">
    <div style="font-weight: 600; font-size: 12px;">logo-orange</div>
    <div style="font-size: 11px; opacity: 0.9;">#e15c18</div>
  </div>
  <div style="background: #ebc627; padding: 12px; border-radius: 4px; color: #523f25;">
    <div style="font-weight: 600; font-size: 12px;">logo-yellow</div>
    <div style="font-size: 11px; opacity: 0.8;">#ebc627</div>
  </div>
  <div style="background: #58b3ca; padding: 12px; border-radius: 4px; color: white;">
    <div style="font-weight: 600; font-size: 12px;">logo-blue</div>
    <div style="font-size: 11px; opacity: 0.9;">#58b3ca</div>
  </div>
</div>

**Usage:** `bg-brand-carby-green`, `text-brand-logo-primary`, `border-brand-logo-secondary`

### Semantic Background Colors

These colors provide semantic meaning and should be used for specific UI states and contexts.

#### Neutral Backgrounds
- `bg-neutral-base` - Main background color (#ffffff)
- `bg-neutral-min` - Minimal contrast background (#fafafa)
- `bg-neutral-subtle` - Subtle background (#f1f1f1)
- `bg-neutral-low` - Low contrast background (#e1e1e1)
- `bg-neutral-medium` - Medium contrast background (#d4d4d4)
- `bg-neutral-inverse-base` - Dark mode base (#181818)

#### Attention Backgrounds (Warnings, Info)
- `bg-attention-subtle` - Subtle attention background (#faf1ce)
- `bg-attention-low` - Low attention background (#f3e197)
- `bg-attention-medium` - Medium attention background (#eed366)
- `bg-attention-high` - High attention background (#7f6139)

#### Alert Backgrounds (Errors, Dangers)
- `bg-alert-subtle` - Subtle alert background (#fcedeb)
- `bg-alert-low` - Low alert background (#f8dad6)
- `bg-alert-medium` - Medium alert background (#f5cbc5)
- `bg-alert-high` - High alert background (#b33f3b)

#### Positive Backgrounds (Success, Confirmation)
- `bg-positive-subtle` - Subtle positive background (#e3f5eb)
- `bg-positive-low` - Low positive background (#cbedda)
- `bg-positive-medium` - Medium positive background (#a9e2b3)
- `bg-positive-strong` - Strong positive background (#52b784)

#### Information Backgrounds
- `bg-information-subtle` - Subtle information background (#e5f3f8)
- `bg-information-low` - Low information background (#c9e6f0)
- `bg-information-medium` - Medium information background (#b9dfea)
- `bg-information-high` - High information background (#376c89)

#### Accent Backgrounds
- `bg-accent-subtle` - Subtle accent background (#f3eff6)
- `bg-accent-low` - Low accent background (#e9e3ee)
- `bg-accent-medium` - Medium accent background (#ddcfeb)
- `bg-accent-high` - High accent background (#765c8b)

### Semantic Foreground Colors

These colors provide semantic meaning for text and should be used with appropriate background contrasts.

#### Neutral Text
- `text-fg-neutral-primary` - Primary text color (#181818)
- `text-fg-neutral-secondary` - Secondary text color (#424242)
- `text-fg-neutral-soft` - Soft text color (#d4d4d4)
- `text-fg-neutral-disabled` - Disabled text color (#a4a4a4)
- `text-fg-neutral-inverse-primary` - Inverse primary text (#ffffff)

#### Alert Text
- `text-fg-alert-primary` - Primary alert text (#712c28)
- `text-fg-alert-secondary` - Secondary alert text (#b33f3b)
- `text-fg-alert-inverse-primary` - Inverse alert text (#ffffff)

#### Positive Text
- `text-fg-positive-primary` - Primary positive text (#174b34)
- `text-fg-positive-secondary` - Secondary positive text (#247450)
- `text-fg-positive-spot-readable` - Readable positive text (#52b784)

#### Information Text
- `text-fg-information-primary` - Primary information text (#234658)
- `text-fg-information-secondary` - Secondary information text (#376c89)
- `text-fg-information-spot-readable` - Readable information text (#6ab0ca)

### Utility Colors

Special purpose colors for accessibility and specific use cases.

- `bg-utility-a11y-blue` - Accessibility focused blue (#4477ff)
- `bg-utility-carby-green` - Carby brand green (#6bd9a1)

---

## Typography

### Font Sizes

Our typography system provides a comprehensive scale for all text needs.

#### Body Text Sizes
| Token | Size | Line Height | Usage |
|-------|------|-------------|--------|
| `text-2xs` | 10px | 16px | Captions, fine print |
| `text-xs` | 12px | 16px | Small labels, metadata |
| `text-sm` | 14px | 20px | Secondary text, descriptions |
| `text-base` | 16px | 24px | Body text, paragraphs |
| `text-lg` | 20px | 28px | Large body text, leads |
| `text-xl` | 24px | 36px | Extra large text |

Each size also has a bold variant (e.g., `text-sm-bold`, `text-base-bold`) with font-weight: 600.

#### Heading Sizes
| Token | Size | Line Height | Usage |
|-------|------|-------------|--------|
| `text-heading-xs` | 14px | 20px | Small headings, labels |
| `text-heading-sm` | 16px | 24px | Card titles, small sections |
| `text-heading-md` | 20px | 28px | Subsection headings |
| `text-heading-lg` | 24px | 36px | Section headings |
| `text-heading-xl` | 28px | 40px | Page titles |
| `text-heading-2xl` | 32px | 44px | Large page titles |
| `text-heading-3xl` | 40px | 56px | Hero headings |
| `text-heading-4xl` | 48px | 64px | Display headings |
| `text-heading-5xl` | 60px | 80px | Hero display |

#### Display Sizes
| Token | Size | Line Height | Usage |
|-------|------|-------------|--------|
| `text-display-sm` | 28px | 40px | Small display text |
| `text-display-md` | 32px | 44px | Medium display text |
| `text-display-lg` | 40px | 56px | Large display text |
| `text-display-xl` | 48px | 64px | Extra large display |
| `text-display-2xl` | 60px | 80px | Hero display text |

### Font Weights

| Token | Weight | Usage |
|-------|--------|--------|
| `font-normal` | 400 | Body text, paragraphs |
| `font-medium` | 500 | Emphasized text |
| `font-semibold` | 600 | Headings, strong emphasis |
| `font-bold` | 700 | Extra strong emphasis |

### Line Heights

Standalone line height utilities for custom typography.

| Token | Value | Usage |
|-------|-------|--------|
| `leading-4` | 16px | Tight text |
| `leading-5` | 20px | Small text |
| `leading-6` | 24px | Body text |
| `leading-7` | 28px | Large text |
| `leading-8` | 32px | Display text |
| `leading-9` | 36px | Large headings |
| `leading-10` | 40px | Display headings |
| `leading-11` | 44px | Large display |
| `leading-14` | 56px | Hero text |
| `leading-16` | 64px | Large hero |
| `leading-20` | 80px | Maximum display |
| `leading-24` | 96px | Oversized display |

---

## Spacing

Our spacing system follows a 4px base unit for consistent rhythm and alignment.

| Token | Value | Usage |
|-------|-------|--------|
| `p-0`, `m-0` | 0px | No spacing |
| `p-1`, `m-1` | 4px | Minimal spacing |
| `p-2`, `m-2` | 8px | Small spacing |
| `p-3`, `m-3` | 12px | Medium-small spacing |
| `p-4`, `m-4` | 16px | Standard spacing |
| `p-5`, `m-5` | 20px | Medium spacing |
| `p-6`, `m-6` | 24px | Large spacing |
| `p-8`, `m-8` | 32px | Extra large spacing |
| `p-10`, `m-10` | 40px | Section spacing |
| `p-12`, `m-12` | 48px | Large section spacing |
| `p-16`, `m-16` | 64px | Page spacing |
| `p-20`, `m-20` | 80px | Large page spacing |
| `p-24`, `m-24` | 96px | Extra large page spacing |

**Usage Examples:**
- `p-4` - 16px padding on all sides
- `px-6` - 24px horizontal padding
- `mt-8` - 32px top margin
- `space-y-4` - 16px vertical spacing between children

---

## Border Radius

| Token | Value | Usage |
|-------|-------|--------|
| `rounded-none` | 0 | Sharp corners |
| `rounded-sm` | 2px | Subtle rounding |
| `rounded` | 4px | Standard rounding |
| `rounded-md` | 6px | Medium rounding |
| `rounded-lg` | 8px | Large rounding |
| `rounded-xl` | 12px | Extra large rounding |
| `rounded-2xl` | 16px | Very large rounding |
| `rounded-3xl` | 24px | Maximum rounding |
| `rounded-full` | 9999px | Fully rounded (circles) |

---

## Box Shadows

Our shadow system provides depth and elevation to interface elements.

| Token | Value | Usage |
|-------|-------|--------|
| `shadow-xs` | 0px 1px 2px rgba(0, 0, 0, 0.05) | Minimal elevation |
| `shadow-sm` | 0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06) | Small cards |
| `shadow` | 0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06) | Standard cards |
| `shadow-md` | 0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05) | Medium elevation |
| `shadow-lg` | 0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04) | Large elevation |
| `shadow-xl` | 0px 25px 50px -12px rgba(0, 0, 0, 0.25) | Extra large elevation |
| `shadow-2xl` | 0px 35px 60px -15px rgba(0, 0, 0, 0.3) | Maximum elevation |
| `shadow-inner` | inset 0px 2px 4px rgba(0, 0, 0, 0.06) | Inset shadow |
| `shadow-none` | none | No shadow |

---

## Usage Guidelines

### Color Usage Principles

1. **Semantic First**: Use semantic colors (`bg-positive-*`, `text-alert-*`) over raw colors when conveying meaning
2. **Contrast**: Ensure proper contrast ratios for accessibility (4.5:1 for normal text, 3:1 for large text)
3. **Consistency**: Use the same color tokens across similar components and states
4. **Brand Alignment**: Use brand colors sparingly for highlights and key interactions

### Typography Best Practices

1. **Hierarchy**: Use heading sizes to establish clear information hierarchy
2. **Line Length**: Aim for 45-75 characters per line for optimal readability
3. **Line Height**: Use the provided line heights for optimal text rhythm
4. **Weight**: Reserve bold weights for headings and important emphasis

### Spacing Consistency

1. **Rhythm**: Use consistent spacing multiples (4px base unit)
2. **Hierarchy**: Larger spacing for more important separations
3. **Component Spacing**: Use smaller spacing within components, larger spacing between sections
4. **Responsive**: Consider how spacing scales on different screen sizes

### Component Examples

#### Card Component
```html
<div class="bg-white rounded-lg shadow-md p-6 space-y-4">
  <h3 class="text-heading-md text-fg-neutral-primary">Card Title</h3>
  <p class="text-base text-fg-neutral-secondary">Card description text</p>
  <button class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
    Action
  </button>
</div>
```

#### Alert Component
```html
<div class="bg-alert-subtle border border-alert-low rounded-md p-4">
  <h4 class="text-sm font-semibold text-fg-alert-primary">Error</h4>
  <p class="text-sm text-fg-alert-secondary mt-1">Something went wrong.</p>
</div>
```

---

**Note:** This documentation is automatically generated from the Tailwind configuration. For the most up-to-date token values, refer to `src/design-system/tailwind.config.js`.