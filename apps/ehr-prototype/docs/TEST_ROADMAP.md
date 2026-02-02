# Test Roadmap

> **Status:** Phase 1 Complete (Infrastructure)
> **Last Updated:** February 2026

---

## Overview

This document outlines the testing strategy for the EHR Prototype, including current state, future phases, and priorities.

---

## Current State (Phase 1)

### Completed
- [x] Vitest configuration (`vitest.config.ts`)
- [x] Test setup with browser API mocks (`tests/setup.ts`)
- [x] Test fixtures for common data patterns (`tests/fixtures.ts`)
- [x] Smoke tests to verify infrastructure (`tests/smoke.test.ts`)
- [x] Integration test structure (`src/__tests__/integration/`)

### Test Commands
```bash
npm test              # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage report
npm run test:ui       # Interactive UI
npm run test:e2e      # Playwright E2E tests
```

---

## Test Categories

| Category | Tool | Location | Purpose |
|----------|------|----------|---------|
| Unit | Vitest | `**/*.test.ts` | Individual functions |
| Component | Vitest + RTL | `**/*.test.tsx` | React components |
| Integration | Vitest | `src/__tests__/integration/` | Multi-module flows |
| E2E | Playwright | `e2e/` | Full user journeys |

---

## Future Phases

### Phase 2: Hook Tests (Priority: HIGH)
**Timing:** After current feature stabilizes (1-2 sessions)

Target the new hooks with complex logic:

| Hook | Tests Needed | Complexity |
|------|--------------|------------|
| `useAIAssistant` | Mode transitions, content priority, context updates | Medium |
| `useToDoNavigation` | Prev/next navigation, state persistence, edge cases | Medium |
| `useEncounterState` | Action dispatch, selector derivation | High |
| `useWorkspace` | Tab management, workspace switching | Medium |

**Example test file:** `src/hooks/useAIAssistant.test.ts`
```typescript
describe('useAIAssistant', () => {
  describe('mode transitions', () => {
    it('togglePalette switches between minibar and palette');
    it('openDrawer sets mode to drawer');
    it('closeToPill returns to minibar from any state');
  });

  describe('content priority', () => {
    it('error content takes priority over suggestions');
    it('loading content takes priority over idle');
    it('todo-context shows when in todoReview context');
  });

  describe('context updates', () => {
    it('setContext updates quick actions');
    it('setToDoNavigation enables prev/next');
  });
});
```

### Phase 3: Component Tests (Priority: MEDIUM)
**Timing:** 2-3 sessions after hook tests

Target new AI UI components:

| Component | Tests Needed | Complexity |
|-----------|--------------|------------|
| `TranscriptionPill` | States (recording/idle/minimized), callbacks | Low |
| `AIMinibar` | Content type rendering, navigation buttons | Medium |
| `AIPalette` | Quick actions, input handling, sections | Medium |
| `PatientWorkspaceItem` | Recording indicator, tab management | Low |

**Example test file:** `src/components/ai-ui/AIMinibar.test.tsx`
```typescript
describe('AIMinibar', () => {
  it('renders idle content with sparkles icon');
  it('renders suggestion content with lightbulb icon');
  it('renders todo-context with navigation buttons');
  it('calls onExpandPalette when expand clicked');
  it('calls onPrev/onNext for todo-context navigation');
});
```

### Phase 4: Integration Test Updates (Priority: MEDIUM)
**Timing:** After component tests

Update existing integration tests and add new flows:

| Test File | Updates Needed |
|-----------|----------------|
| `capture-flow.test.ts` | Add AI minibar state verification |
| `mode-transitions.test.ts` | Add tri-state mode transitions |
| New: `workspace-flow.test.ts` | Multi-patient workspace management |
| New: `todo-navigation.test.ts` | Full To-Do → patient → next flow |

### Phase 5: E2E Test Expansion (Priority: LOW)
**Timing:** Before major releases

Add Playwright tests for critical user journeys:

| Journey | Coverage |
|---------|----------|
| New encounter start → chart → close | Happy path |
| To-Do item → patient workspace → next | Navigation |
| AI suggestions → accept/dismiss | AI interaction |
| Transcription start → stop → review | Voice capture |

---

## Priority Matrix

| Priority | Category | Reason |
|----------|----------|--------|
| **HIGH** | Hook tests | Pure logic, easy to test, high value |
| **MEDIUM** | Component tests | UI behavior verification |
| **MEDIUM** | Integration updates | Catch regressions in flows |
| **LOW** | E2E expansion | High maintenance, slower feedback |

---

## Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| Hooks | 80% | — |
| State reducers | 80% | — |
| Utility functions | 90% | — |
| Components | 50% | — |
| Integration flows | Key paths | Partial |

---

## Test Writing Guidelines

### 1. Use Fixtures
```typescript
// Good
const patient = createTestPatient({ demographics: { firstName: 'John' } });

// Avoid
const patient = { id: '...', mrn: '...', ... };
```

### 2. Test Behavior, Not Implementation
```typescript
// Good: Tests what happens
it('shows recording indicator when transcribing', () => {
  render(<TranscriptionPill status="recording" />);
  expect(screen.getByTitle('Recording active')).toBeInTheDocument();
});

// Avoid: Tests how it happens
it('sets isRecording state to true', () => { ... });
```

### 3. One Assertion Per Test (When Practical)
```typescript
// Good: Clear what failed
it('returns error content when error is set', () => {
  const [state] = useAIAssistant();
  state.setError('Network error');
  expect(state.content.type).toBe('error');
});
```

### 4. Use Descriptive Test Names
```typescript
// Good
it('navigates to next To-Do item when next button clicked');
it('shows patient name in transcription pill when recording');

// Avoid
it('works correctly');
it('handles click');
```

---

## Running Specific Tests

```bash
# Run a specific file
npx vitest run tests/smoke.test.ts

# Run tests matching a pattern
npx vitest run --grep "useAIAssistant"

# Run in watch mode for a file
npx vitest tests/smoke.test.ts

# Run with verbose output
npx vitest run --reporter=verbose
```

---

## Suggested Session Plan

| Session | Focus | Deliverable |
|---------|-------|-------------|
| Current | Infrastructure | ✅ Vitest setup, fixtures, smoke tests |
| Next | Hook tests | `useAIAssistant.test.ts`, `useToDoNavigation.test.ts` |
| +1 | Component tests | AI UI component tests |
| +2 | Integration updates | Updated flow tests |
| As needed | E2E | Critical journey tests |

---

## Related Documents

| Document | Purpose |
|----------|---------|
| `resources/test-harnesses/README.md` | Reference from Task Co-Pilot |
| `vitest.config.ts` | Test configuration |
| `tests/setup.ts` | Global mocks and setup |
| `tests/fixtures.ts` | Test data factories |
