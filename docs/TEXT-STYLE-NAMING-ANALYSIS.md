# Text Style Utility Class Naming Analysis

## Context
We're generating CSS utility classes from Figma text styles. Need to decide on naming convention that's:
- Easy to type/remember
- Clear about what it does
- Works well with autocomplete
- Distinguishes core vs. expressive

## Options

### Option A: `.text-expressive-{category}-{size}-{weight}`
```css
/* Core */
.text-body-md-medium { }
.text-heading-xl-bold { }

/* Expressive */
.text-expressive-body-md-medium { }
.text-expressive-heading-xl-bold { }
```

**Pros:**
- ✅ Clear namespace separation (expressive is obvious)
- ✅ Groups by prefix in autocomplete
- ✅ Follows pattern: modifier-category-size-weight
- ✅ Easy to search/grep: `text-expressive-*`

**Cons:**
- ⚠️ Longer class names
- ⚠️ "expressive" comes before semantic info

**Autocomplete experience:**
```
text-e... → text-expressive-body-...
text-b... → text-body-... (core only)
text-expressive-b... → all expressive body styles
```

---

### Option B: `.text-{category}-{size}-{weight}-expressive`
```css
/* Core */
.text-body-md-medium { }
.text-heading-xl-bold { }

/* Expressive */
.text-body-md-medium-expressive { }
.text-heading-xl-bold-expressive { }
```

**Pros:**
- ✅ Semantic info comes first (category-size-weight)
- ✅ Shorter typing path to find base style
- ✅ Suffix modifier is common pattern (like `-hover`, `-sm`, etc.)
- ✅ Can quickly add/remove `-expressive` variant

**Cons:**
- ⚠️ Expressive styles don't group together in autocomplete
- ⚠️ Harder to see all expressive styles at once

**Autocomplete experience:**
```
text-b... → shows BOTH core and expressive body styles mixed
text-body-md-medium → core
text-body-md-medium-expressive → variant
```

---

### Option C: `.text-marketing-{category}-{size}-{weight}`
```css
/* Core */
.text-body-md-medium { }
.text-heading-xl-bold { }

/* Marketing/Expressive */
.text-marketing-body-md-medium { }
.text-marketing-heading-xl-bold { }
```

**Pros:**
- ✅ Clearer semantic purpose ("marketing" vs "product")
- ✅ Shorter than "expressive"
- ✅ Groups by prefix in autocomplete

**Cons:**
- ⚠️ Name doesn't match Figma terminology
- ⚠️ Less flexible if expressive is used outside marketing

---

### Option D: Separate root class (Tailwind-style variants)
```css
/* Core */
.text-body-md-medium { }

/* Expressive - same name, different context */
.expressive .text-body-md-medium { }
```

**Usage:**
```tsx
<div className="expressive">
  <h1 className="text-display-xl-bold">
    Marketing headline
  </h1>
</div>
```

**Pros:**
- ✅ No need for different class names
- ✅ Single source of truth for naming
- ✅ Shorter classes
- ✅ Easy to switch entire section between core/expressive

**Cons:**
- 🔴 Can't mix core and expressive styles in same container
- 🔴 Less explicit at component level
- 🔴 Requires wrapper element
- 🔴 Could cause confusion about which style is actually applied

---

### Option E: Data attribute modifier
```css
/* Core */
.text-body-md-medium { }

/* Expressive */
[data-typography="expressive"] .text-body-md-medium { }
```

**Usage:**
```tsx
<div data-typography="expressive">
  <h1 className="text-display-xl-bold">Marketing</h1>
</div>
```

**Pros:**
- ✅ Clean separation via data attribute
- ✅ Same class names
- ✅ Easy to switch entire sections

**Cons:**
- 🔴 Same issues as Option D
- 🔴 Data attributes are less common in utility-first CSS

---

## Recommendation

### **Option B** is best for this use case

**Why:**
1. **Semantic-first**: Developers think "I need body-md-medium... oh and expressive variant"
2. **Common pattern**: Matches Tailwind's variant syntax (`hover:`, `sm:`, etc.)
3. **Easy transitions**: Start with core, add `-expressive` if needed
4. **Co-location**: Related styles appear together in autocomplete
5. **Flexible**: Can easily see both core and expressive versions side-by-side

**Usage example:**
```tsx
// Product UI (clinic-planner)
<p className="text-body-md-medium text-fg-neutral-primary">
  Internal tool content
</p>

// Marketing page
<p className="text-body-md-medium-expressive text-fg-neutral-primary">
  Customer-facing content with Campton font
</p>
```

---

## Alternative: Hybrid Approach

If you want namespace separation but semantic-first benefits:

### **Option F: Core default, prefix only expressive**
```css
/* Core - no prefix (default) */
.text-body-md-medium { }
.text-heading-xl-bold { }

/* Expressive - prefixed for marketing */
.text-expressive-body-md-medium { }
.text-expressive-heading-xl-bold { }
```

**Rationale:**
- Core is the default (clinic-planner is primary use case)
- Expressive is the "special" case (marketing/customer pages)
- Clear separation without suffix noise on most common usage

**This might be THE BEST option if:**
- Core styles are used 80%+ of the time
- Expressive is truly for specific marketing contexts
- You want clear namespace for special cases

---

## Final Recommendation

**For clinic-planner: Option F (Core default + Expressive prefix)**

Reasoning:
1. **Most usage is core** → Keep those class names clean
2. **Expressive is special case** → Prefix makes it obvious
3. **Clear separation** → Easy to grep, easy to understand
4. **Future-proof** → Could add other variants (`.text-compact-`, `.text-dense-`)

```tsx
// 90% of your code (clean)
<h1 className="text-heading-xl-bold">Page Title</h1>
<p className="text-body-md-regular">Paragraph text</p>

// 10% marketing pages (explicit)
<h1 className="text-expressive-display-xl-bold">Marketing Headline</h1>
<p className="text-expressive-body-lg-regular">Marketing copy</p>
```

What do you think? Should we go with **Option F**?
