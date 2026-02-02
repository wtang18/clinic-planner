# EHR Prototype Documentation

Documentation for the EHR prototype application (`apps/ehr-prototype`).

## Status

**Implementation**: Complete (Phases 1-6)
**Last Updated**: 2026-01-26

## Documentation Index

| Document | Description |
|----------|-------------|
| [LAYOUT_SPEC.md](./LAYOUT_SPEC.md) | Adaptive multi-pane layout specification |
| [LAYOUT_REFACTOR_PLAN.md](./LAYOUT_REFACTOR_PLAN.md) | Phased implementation plan for layout refactor |
| [TECH_DEBT.md](./TECH_DEBT.md) | Tracked TypeScript errors and technical debt |
| [TEST_ROADMAP.md](../../apps/ehr-prototype/docs/TEST_ROADMAP.md) | Testing strategy and roadmap |
| [initial-setup/](./initial-setup/) | Phase implementation prompts and specifications |

### Initial Setup Documents

| Document | Description |
|----------|-------------|
| [OVERVIEW.md](./initial-setup/OVERVIEW.md) | Project overview and architecture |
| [STATE_CONTRACT.md](./initial-setup/STATE_CONTRACT.md) | State types and contracts |
| [CHART_ITEMS.md](./initial-setup/CHART_ITEMS.md) | Chart item type definitions |
| [CARE_GAPS.md](./initial-setup/CARE_GAPS.md) | Care gap specifications |
| [SUGGESTIONS_TASKS.md](./initial-setup/SUGGESTIONS_TASKS.md) | Suggestion and task systems |
| [AI_INTEGRATION.md](./initial-setup/AI_INTEGRATION.md) | AI service architecture |
| [PARALLEL_STREAMS.md](./initial-setup/PARALLEL_STREAMS.md) | Parallel processing design |
| [VISIT_SCENARIOS.md](./initial-setup/VISIT_SCENARIOS.md) | Demo visit scenarios |
| [SUPPORTING_TYPES.md](./initial-setup/SUPPORTING_TYPES.md) | Supporting type definitions |

### Phase Prompts

| Phase | Description | Status |
|-------|-------------|--------|
| [PHASE_1_PROMPTS.md](./initial-setup/PHASE_1_PROMPTS.md) | Foundation & State | Complete |
| [PHASE_2_PROMPTS.md](./initial-setup/PHASE_2_PROMPTS.md) | UI Components | Complete |
| [PHASE_3_PROMPTS.md](./initial-setup/PHASE_3_PROMPTS.md) | Navigation & Views | Complete |
| [PHASE_4_PROMPTS.md](./initial-setup/PHASE_4_PROMPTS.md) | AI Services | Complete |
| [PHASE_5_PROMPTS.md](./initial-setup/PHASE_5_PROMPTS.md) | Integration | Complete |
| [PHASE_6_PROMPTS.md](./initial-setup/PHASE_6_PROMPTS.md) | Demo Polish & E2E | Complete |

## Quick Links

- **App Location**: `apps/ehr-prototype/`
- **Main Entry**: `apps/ehr-prototype/src/App.tsx`
- **Design Tokens**: `apps/ehr-prototype/src/styles/foundations/`
- **Storybook**: `npm run storybook` (from app directory)

## Development

```bash
# Start Expo web
cd apps/ehr-prototype
npm run start:web

# Build for web
npm run build:web

# Run Storybook
npm run storybook

# Type check
npx tsc --noEmit
```

## Testing

```bash
cd apps/ehr-prototype

# Run tests in watch mode
npm test

# Single run
npm run test:run

# With coverage
npm run test:coverage

# Interactive UI
npm run test:ui

# E2E tests (Playwright)
npm run test:e2e
```

See [TEST_ROADMAP.md](../../apps/ehr-prototype/docs/TEST_ROADMAP.md) for testing strategy, priorities, and future phases.

## Known Issues

See [TECH_DEBT.md](./TECH_DEBT.md) for tracked TypeScript errors (53 total, non-blocking).
