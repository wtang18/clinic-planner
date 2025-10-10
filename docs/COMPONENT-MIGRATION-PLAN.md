# Component Migration Plan: Hard-coded Colors → Semantic Tokens

**Goal:** Migrate all clinic-planner components to use semantic tokens before starting 2nd project

**Status:** Ready to begin

**Found:** 174 instances of hard-coded colors across 21 files

---

## 📊 Audit Results

### Priority 1: Design System Components (Core)
These are used everywhere, migrate first:

| Component | Instances | Priority | Notes |
|-----------|-----------|----------|-------|
| `Button.tsx` | 14 | **HIGH** | Used in all pages |
| `Pill.tsx` | 1 | **HIGH** | Event/material status |
| `Card.stories.tsx` | 15 | MEDIUM | Storybook only |
| `Toast.stories.tsx` | 23 | MEDIUM | Storybook only |

### Priority 2: Page Components (App)
These are user-facing:

| File | Instances | Priority | Notes |
|------|-----------|----------|-------|
| `app/event/[id]/page.tsx` | 6 | **HIGH** | Event detail page |
| `app/materials/[id]/page.tsx` | 6 | **HIGH** | Material detail page |
| `app/quarter/page.tsx` | 2 | MEDIUM | Quarter view |
| `app/month/page.tsx` | 2 | MEDIUM | Month view |
| `app/annual/page.tsx` | 2 | MEDIUM | Annual view |
| `app/materials/page.tsx` | 2 | MEDIUM | Materials list |
| `app/page.tsx` | 2 | LOW | Landing page |

### Priority 3: Storybook Stories (Documentation)
These can be done last or skipped:

- `Container.stories.tsx` (34)
- `Toast.stories.tsx` (23)
- `Card.stories.tsx` (15)
- `Pill.stories.tsx` (12)
- `Toggle.stories.tsx` (11)
- `TogglePill.stories.tsx` (7)
- `SegmentedControl.stories.tsx` (7)
- `Button.stories.tsx` (5)
- `Input.stories.tsx` (4)
- `Textarea.stories.tsx` (2)

**Note:** Stories use hard-coded colors for examples/demos. These can stay as-is or be updated last.

---

## 🎯 Migration Strategy

### Phase 1: Core Components (1-2 hours)
1. **Button.tsx** (14 instances)
   - Primary variant: green → positive
   - Secondary variant: gray → neutral
   - Destructive variant: red → alert

2. **Pill.tsx** (1 instance)
   - Success: green → positive
   - Error: red → alert
   - Warning: yellow → attention

### Phase 2: Page Components (2-3 hours)
3. **Event detail page** (`app/event/[id]/page.tsx`)
4. **Material detail page** (`app/materials/[id]/page.tsx`)
5. **Quarter/Month/Annual views** (all list pages)

### Phase 3: Storybook (Optional, 1-2 hours)
6. Update story examples to use semantic tokens

---

## ✅ Migration Checklist

For each component:

- [ ] **Read the component** - Understand current color usage
- [ ] **Map colors** - Use `docs/QUICK-TOKEN-REFERENCE.md` for mappings
- [ ] **Update code** - Replace hard-coded colors with semantic tokens
- [ ] **Test in Storybook** - Verify no visual regressions
- [ ] **Test in dev** - Check pages render correctly
- [ ] **Check all states** - Hover, focus, active, disabled
- [ ] **Commit** - Small commits per component

---

## 🔄 Example Migrations

### Before: Button.tsx
```tsx
const buttonVariants = cva(
  "rounded-lg",
  {
    variants: {
      type: {
        primary: "bg-green-500 text-white hover:bg-green-600",
        secondary: "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50",
      }
    }
  }
);
```

### After: Button.tsx
```tsx
const buttonVariants = cva(
  "rounded-lg",
  {
    variants: {
      type: {
        primary: "bg-[var(--color-bg-positive-high)] text-[var(--color-fg-neutral-inverse-primary)] hover:bg-[var(--color-bg-positive-medium)]",
        secondary: "bg-[var(--color-bg-neutral-base)] text-[var(--color-fg-neutral-primary)] border border-[var(--color-bg-neutral-medium)] hover:bg-[var(--color-bg-neutral-subtle)]",
      }
    }
  }
);
```

**Result:** Button now supports theme switching automatically!

---

## 🧪 Testing Plan

After each component migration:

### 1. Storybook Test
```bash
npm run storybook
```
- Navigate to component story
- Verify all variants render correctly
- Check no visual regressions

### 2. Dev Mode Test
```bash
npm run dev
```
- Navigate to pages using the component
- Test interactions (hover, click, etc.)
- Verify colors match design

### 3. Build Test
```bash
npm run build
```
- Ensure no TypeScript/build errors
- Verify production bundle builds

---

## 📝 Commit Strategy

Small, focused commits per component:

```bash
# After migrating Button
git add src/design-system/components/Button.tsx
git commit -m "Migrate Button component to semantic tokens"

# After migrating event detail page
git add src/app/event/[id]/page.tsx
git commit -m "Migrate event detail page to semantic tokens"
```

**Or** one commit per phase:

```bash
# After completing Phase 1
git add src/design-system/components/
git commit -m "Migrate core design system components to semantic tokens"
```

---

## ⏱️ Time Estimate

| Phase | Time | Components |
|-------|------|------------|
| **Phase 1:** Core Components | 1-2 hours | Button, Pill |
| **Phase 2:** Page Components | 2-3 hours | Event detail, material detail, list pages |
| **Phase 3:** Storybook (optional) | 1-2 hours | All story files |
| **Testing** | 1 hour | Full app testing |
| **Total** | **5-8 hours** | Complete migration |

---

## 🚦 Success Criteria

Migration is complete when:

- ✅ All design system components use semantic tokens
- ✅ All page components use semantic tokens
- ✅ No hard-coded colors in production code (stories OK)
- ✅ All pages render correctly in dev mode
- ✅ Build succeeds with no errors
- ✅ Test user confirms no visual regressions
- ✅ Ready for theme switching (future feature)

---

## 🎯 Next Steps

**Ready to start?** Here's the order:

1. ✅ **Review this plan** - Understand scope and approach
2. **Start with Button.tsx** - Most impactful component
3. **Test immediately** - Storybook + dev mode
4. **Move to Pill.tsx** - Quick win
5. **Tackle page components** - Event detail first
6. **Full app test** - Test user walkthrough
7. **Commit and done!** - Ready for 2nd project

**Questions?**
- Token mappings: `docs/QUICK-TOKEN-REFERENCE.md`
- Migration examples: `docs/COMPONENT-MIGRATION-GUIDE.md`
- Token architecture: `src/design-system/tokens/README.md`

---

**Ready when you are!** Start with `Button.tsx` for maximum impact.
