# EHR Prototype Technical Debt

Tracked TypeScript errors and technical debt items for future cleanup.

---

## Overview

| Status | Category | Count | Priority |
|--------|----------|-------|----------|
| Open | Type mismatches in stories | 38 | Low |
| Open | Type mismatches in AI services | 13 | Medium |
| Open | Style utilities | 2 | Low |
| **Total** | | **53** | |

**Last Updated**: 2026-01-26
**Phase Completed**: Phase 6 (all implementation complete)

---

## TD-001: `Role` Type Missing `"physician"`

**Status**: Open
**Priority**: Low
**Errors**: 28
**Files Affected**: Stories (6 files)

### Description
Story mock data uses `createdBy: { role: 'physician' }` but the `Role` type doesn't include `"physician"`.

### Affected Files
- `src/stories/chart-items/ChartItemCard.stories.tsx`
- `src/stories/chart-items/DiagnosisCard.stories.tsx`
- `src/stories/chart-items/LabCard.stories.tsx`
- `src/stories/chart-items/MedicationCard.stories.tsx`
- `src/stories/composites/EncounterChart.stories.tsx`

### Example Error
```
Type '"physician"' is not assignable to type 'Role | undefined'.
```

### Resolution Options
1. Add `"physician"` to `Role` type (requires product decision on valid roles)
2. Change stories to use existing valid role value
3. Create story-specific mock types

---

## TD-002: `Priority` Type Missing `"medium"`

**Status**: Open
**Priority**: Medium
**Errors**: 5
**Files Affected**: AI services + stories

### Description
Code uses `priority: 'medium'` but `Priority` type only includes `'low' | 'high' | 'urgent'`.

### Affected Files
- `src/services/ai/drug-interaction/drug-interaction-service.ts:131`
- `src/services/ai/dx-association/dx-association-service.ts:137`
- `src/stories/tasks/TaskCard.stories.tsx:15,40,72`
- `src/styles/utils.ts:131`

### Resolution
Add `"medium"` to `Priority` type in `src/state/actions/types.ts` (or wherever defined).

---

## TD-003: Button `onPress` vs `onClick` Mismatch

**Status**: Open
**Priority**: Low
**Errors**: 7
**Files Affected**: Stories

### Description
Button component uses web convention (`onClick`) but stories use React Native convention (`onPress`).

### Affected Files
- `src/stories/primitives/Button.stories.tsx:30,97,98,99`
- `src/stories/composites/EncounterChart.stories.tsx:241,242,243`

### Resolution
Update stories to use `onClick` instead of `onPress`.

**Quick fix** (~5 min):
```typescript
// Change from:
<Button onPress={fn()}>Click</Button>
// To:
<Button onClick={fn()}>Click</Button>
```

---

## TD-004: `PatientContext` Missing Properties

**Status**: Open
**Priority**: Medium
**Errors**: 2
**Files Affected**: AI services

### Description
AI services reference `PatientContext.medications` and `PatientContext.problemList` which don't exist on the type.

### Affected Files
- `src/services/ai/drug-interaction/drug-interaction-service.ts:101`
- `src/services/ai/dx-association/dx-mapper.ts:194`

### Resolution
Either:
1. Add `medications` and `problemList` to `PatientContext` type
2. Update services to use correct property names from existing type

---

## TD-005: `ItemCategory` Type Narrowing in Entity Extraction

**Status**: Open
**Priority**: Medium
**Errors**: 5
**Files Affected**: `src/services/ai/entity-extraction/entity-extraction-service.ts`

### Description
Entity extraction returns objects with generic `ItemCategory` but `Partial<ChartItem>` expects specific category literals. TypeScript can't narrow the union correctly.

### Resolution Options
1. Use type assertions (`as Partial<MedicationItem>`)
2. Create discriminated union helper function
3. Restructure return type to be category-specific

---

## TD-006: `VisitMeta` Missing `reasonForVisit`

**Status**: Open
**Priority**: Low
**Errors**: 2
**Files Affected**: `src/services/ai/note-generation/note-generator.ts`

### Description
Note generator references `VisitMeta.reasonForVisit` which doesn't exist on the type.

### Affected Lines
- Line 133: `state.visitMeta.reasonForVisit`
- Line 136: `state.visitMeta.reasonForVisit`

### Resolution
Add `reasonForVisit?: string` to `VisitMeta` type.

---

## TD-007: Miscellaneous Type Issues

**Status**: Open
**Priority**: Low
**Errors**: 4

### Items

| File | Error | Resolution |
|------|-------|------------|
| `src/services/ai/subscription-manager.ts:12` | `AIServiceRegistry` export missing | Add export or update import |
| `src/services/ai/note-generation/note-generation-service.ts:111` | `"pending"` not in `SyncStatus` | Add to type |
| `src/stories/care-gaps/CareGapCard.stories.tsx:79` | `successful` not in `CareGapClosureAttempt` | Add to type or remove from story |
| `src/styles/foundations/elevation.ts:51` | Platform.select type mismatch | Update elevation object structure |

---

## Impact Assessment

### Build Impact
- **Expo build**: Not blocked (TypeScript errors are warnings only)
- **Storybook**: Renders correctly despite type errors
- **CI**: May fail if `tsc --noEmit` is in pipeline (check config)

### Runtime Impact
- **None** - All errors are compile-time type checking only

### Developer Experience
- Type errors add noise to `tsc` output
- May mask new errors introduced during development

---

## Recommended Prioritization

### Phase 1: Quick Wins (15 min)
1. TD-003: Change `onPress` → `onClick` in stories
2. TD-002: Add `"medium"` to `Priority` type

### Phase 2: AI Services (30 min)
1. TD-004: Fix `PatientContext` properties
2. TD-006: Add `reasonForVisit` to `VisitMeta`
3. TD-005: Add type assertions in entity extraction

### Phase 3: Stories & Design Decisions (45 min)
1. TD-001: Decide on valid `Role` values with product
2. TD-007: Miscellaneous fixes

---

## Related Documentation

- [State Contract](./archive/initial-setup/STATE_CONTRACT.md) - Type definitions
- [AI Integration](./archive/initial-setup/AI_INTEGRATION.md) - AI service architecture
- [Chart Items](./archive/initial-setup/CHART_ITEMS.md) - ChartItem type structure
