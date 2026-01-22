# Cross-View Date Synchronization

**Status:** Planned (Not High Priority)
**Estimated Effort:** 8-12 hours
**Date Documented:** 2025-10-14

## Overview

Currently, calendar views (Month, Quarter, Annual) operate independently. When switching between views, each view defaults to the current date or maintains its own state. This enhancement would synchronize the "date position" across all three calendar views, allowing users to navigate seamlessly while maintaining context.

## User Experience Goals

### Desired Behavior

When a user navigates between calendar views, the date context should be preserved intelligently:

**Example 1: Month → Quarter → Year**
- User viewing **December 2026** in Month view
- Switching to Quarter view → Shows **Q4 2026**
- Switching to Year view → Shows **2026**
- Can toggle back and forth while maintaining context

**Example 2: Navigation in Month View**
- User navigates forward/backward in Month view (e.g., Jan → Feb → Mar 2026)
- Quarter view respects this → Shows **Q1 2026**
- Year view respects this → Shows **2026**

**Example 3: Navigation in Quarter View**
- User navigates forward/backward in Quarter view (e.g., Q1 → Q2 2026)
- Year view respects this → Shows **2026**
- Month view defaults to **first month of quarter** (April 2026 for Q2)

**Example 4: Navigation in Year View**
- User navigates forward/backward in Year view (e.g., 2025 → 2026)
- Month view defaults to **first month** (January 2026)
- Quarter view defaults to **first quarter** (Q1 2026)

## Derivation Rules

### Month → Quarter
```
Quarter = Math.ceil(Month / 3)
```
- Jan, Feb, Mar → Q1
- Apr, May, Jun → Q2
- Jul, Aug, Sep → Q3
- Oct, Nov, Dec → Q4

### Month → Year
```
Year = Year (same)
```

### Quarter → Year
```
Year = Year (same)
```

### Quarter → Month (Default)
```
Month = (Quarter - 1) * 3 + 1
```
- Q1 → January (month 1)
- Q2 → April (month 4)
- Q3 → July (month 7)
- Q4 → October (month 10)

### Year → Month (Default)
```
Month = 1 (January)
Year = Year (same)
```

### Year → Quarter (Default)
```
Quarter = 1 (Q1)
Year = Year (same)
```

## Implementation Strategy

### Phase 1: URL-Driven State (2-3 hours)

**Current State:**
- ✅ Month view: Reads `month` and `year` from URL params
- ✅ Quarter view: Reads `quarter` and `year` from URL params
- ❌ Annual view: Does NOT read `year` from URL params

**Required Changes:**

1. **Update Annual View** (`src/app/annual/page.tsx`)
   ```typescript
   const searchParams = useSearchParams();
   const urlYear = searchParams?.get('year');
   const [selectedYear, setSelectedYear] = React.useState(
     urlYear ? parseInt(urlYear) : currentYear
   );
   ```

2. **Add Suspense wrapper** to Annual view (similar to Quarter view)

### Phase 2: View Switching Logic (2-3 hours)

Update all `handleViewChange` functions to derive and pass appropriate URL parameters.

**Files to Update:**
- `src/app/month/page.tsx` - Month view view switcher
- `src/app/quarter/page.tsx` - Quarter view view switcher
- `src/app/annual/page.tsx` - Annual view view switcher

**Example Implementation:**

```typescript
// In Month view
const handleViewChange = (view: 'month' | 'quarter' | 'annual') => {
  if (view === 'month') return; // Already on month view

  if (view === 'quarter') {
    const quarter = Math.ceil(selectedMonth / 3);
    router.push(`/quarter?quarter=${quarter}&year=${selectedYear}`);
  } else if (view === 'annual') {
    router.push(`/annual?year=${selectedYear}`);
  }
};

// In Quarter view
const handleViewChange = (view: 'month' | 'quarter' | 'annual') => {
  if (view === 'quarter') return; // Already on quarter view

  if (view === 'month') {
    // Default to first month of the quarter
    const month = (selectedQuarter - 1) * 3 + 1;
    router.push(`/month?month=${month}&year=${selectedYear}`);
  } else if (view === 'annual') {
    router.push(`/annual?year=${selectedYear}`);
  }
};

// In Annual view
const handleViewChange = (view: 'month' | 'quarter' | 'annual') => {
  if (view === 'annual') return; // Already on annual view

  if (view === 'month') {
    // Default to January of the selected year
    router.push(`/month?month=1&year=${selectedYear}`);
  } else if (view === 'quarter') {
    // Default to Q1 of the selected year
    router.push(`/quarter?quarter=1&year=${selectedYear}`);
  }
};
```

### Phase 3: Navigation Updates (1-2 hours)

Update all prev/next navigation handlers to modify URL parameters.

**Files to Update:**
- `src/app/month/page.tsx` - handlePrevMonth, handleNextMonth
- `src/app/quarter/page.tsx` - handlePrevQuarter, handleNextQuarter
- `src/app/annual/page.tsx` - handlePrevYear, handleNextYear

**Example Implementation:**

```typescript
// In Quarter view
const handlePrevQuarter = () => {
  let newQuarter = selectedQuarter - 1;
  let newYear = selectedYear;

  if (newQuarter < 1) {
    newQuarter = 4;
    newYear--;
  }

  router.push(`/quarter?quarter=${newQuarter}&year=${newYear}`);
};

const handleNextQuarter = () => {
  let newQuarter = selectedQuarter + 1;
  let newYear = selectedYear;

  if (newQuarter > 4) {
    newQuarter = 1;
    newYear++;
  }

  router.push(`/quarter?quarter=${newQuarter}&year=${newYear}`);
};
```

### Phase 4: Event Detail Navigation (1-2 hours)

Ensure event detail links pass derived parameters correctly.

**Current State:**
- ✅ Event detail back navigation preserves `month`, `quarter`, `year` params
- ✅ Links from Month view pass correct params
- ✅ Links from Quarter view pass correct params
- ❌ Links from Annual view may need to pass year param

**Files to Update:**
- `src/app/annual/page.tsx` - Event detail links

### Phase 5: Edge Cases & Testing (2-4 hours)

**Edge Cases to Handle:**

1. **Year Boundaries**
   - December (Q4) → Next month = January (Q1) of next year
   - January (Q1) → Prev month = December (Q4) of previous year
   - Q1 → Prev quarter = Q4 of previous year
   - Q4 → Next quarter = Q1 of next year

2. **"Today" Button Behavior**
   - Should reset to current date across all views
   - Should update URL params to reflect current date

3. **Direct URL Access**
   - Invalid month values (< 1 or > 12)
   - Invalid quarter values (< 1 or > 4)
   - Invalid year values (< 1900 or > 2100)
   - Missing parameters (already handled - defaults to current date)

4. **Browser Navigation**
   - Back/forward buttons should work correctly
   - URL should always reflect current state
   - State should sync with URL on mount

**Testing Checklist:**

- [ ] Navigate Month → Quarter → Year → Quarter → Month
- [ ] Navigate forward/backward in Month view, check Quarter/Year sync
- [ ] Navigate forward/backward in Quarter view, check Month/Year sync
- [ ] Navigate forward/backward in Year view, check Month/Quarter defaults
- [ ] Click event from each view, verify back button returns to correct state
- [ ] Test year boundaries (Dec → Jan, Q4 → Q1)
- [ ] Test "Today" button in all views
- [ ] Test browser back/forward buttons
- [ ] Test direct URL access with various params
- [ ] Test invalid URL parameters

## Technical Considerations

### URL as Single Source of Truth

**Benefits:**
- Shareable URLs maintain exact view state
- Browser back/forward work naturally
- No complex state management needed
- Easy to debug (state visible in URL)

**Implementation:**
- Use `router.push()` for user-initiated navigation
- Use `router.replace()` for same-view updates (avoids polluting history)
- Always read from URL params on mount

### Router Strategy

```typescript
// User navigates to different view = push (adds history entry)
router.push(`/quarter?quarter=2&year=2026`);

// User navigates within same view = could use replace to avoid history pollution
router.replace(`/quarter?quarter=3&year=2026`);
```

**Recommendation:** Use `push()` for all navigation to maintain full history.

### Performance

**Current Implementation:**
- Each view re-renders on param change
- No performance concerns for calendar views (lightweight components)

**Future Optimization:**
- If performance becomes an issue, consider memoizing calendar calculations
- Could add transition states for smoother navigation

## Alternative Approaches Considered

### 1. Shared Context/State Management

**Pros:**
- More flexible than URL params
- Can store additional UI state

**Cons:**
- State not shareable via URL
- Browser back/forward don't work
- More complex implementation
- State can get out of sync

**Decision:** Rejected in favor of URL-driven state

### 2. localStorage Persistence

**Pros:**
- State persists across sessions
- Can store user preferences

**Cons:**
- State not shareable via URL
- Not server-side renderable
- Can get stale/out of sync

**Decision:** Could be added later for user preferences, but not for primary navigation

### 3. Hybrid Approach (URL + Context)

**Pros:**
- Best of both worlds
- URL for shareable state, context for ephemeral UI state

**Cons:**
- More complex
- Two sources of truth to manage

**Decision:** Not needed for current requirements, but could be considered if complexity grows

## Migration Path

This feature can be implemented incrementally:

1. **Phase 1-2:** Basic URL sync (most important, 4-6 hours)
2. **Phase 3:** Navigation updates (nice to have, 1-2 hours)
3. **Phase 4:** Event detail links (nice to have, 1-2 hours)
4. **Phase 5:** Edge cases & testing (polish, 2-4 hours)

**Minimum Viable Implementation:** Phases 1-2 only (4-6 hours)
- Gets core functionality working
- Can deploy and gather user feedback
- Can iterate based on real usage

## Related Files

**Files to Modify:**
- `src/app/month/page.tsx` - Add view switching logic, update navigation
- `src/app/quarter/page.tsx` - Add view switching logic, update navigation
- `src/app/annual/page.tsx` - Add URL params, view switching logic, update navigation
- `src/app/event/[id]/page.tsx` - Verify event detail links (likely no changes needed)

**Dependencies:**
- Next.js `useSearchParams` hook (already in use)
- Next.js `useRouter` hook (already in use)
- React `Suspense` component (already in use for Quarter view)

## Open Questions

1. **Should "Today" button push or replace history?**
   - Leaning toward `push()` to allow back navigation

2. **Should we limit history entries for same-view navigation?**
   - Current approach: All navigation uses `push()`
   - Alternative: Use `replace()` for prev/next within same view
   - Decision pending user feedback

3. **Should we add URL validation and error handling?**
   - Current: Invalid params fall back to current date
   - Could add user-facing error messages
   - Decision: Start with silent fallback, add messages if users report confusion

## Success Metrics

How we'll know this feature is successful:

1. **User can navigate between views without losing context**
   - Test: Manual QA of all navigation paths

2. **URLs are shareable and maintain view state**
   - Test: Share URL, verify recipient sees same view

3. **Browser back/forward work as expected**
   - Test: Navigate through views, use browser buttons

4. **No regressions in existing functionality**
   - Test: Full regression test of calendar views

## Future Enhancements

Beyond this feature, we could consider:

1. **URL param for selected event**
   - Allow deep linking to specific events
   - Event modal opens automatically from URL

2. **Calendar view preferences in localStorage**
   - Remember user's preferred default view
   - Remember user's preferred calendar settings

3. **Smooth view transitions**
   - Animate between views
   - Highlight date position continuity

4. **Week view**
   - Additional calendar view granularity
   - Would follow same URL-driven pattern

## References

- **Related Commit:** `487e4cf` - "Preserve view context in event detail back navigation and quarter view URL params"
- **Related Files:** Event detail page, Quarter view page
- **Pattern Established:** URL params + Suspense wrapper for client components
