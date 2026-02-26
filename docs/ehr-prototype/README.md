# EHR Prototype Documentation

Documentation for the EHR prototype application (`apps/ehr-prototype`).

## Status

**Implementation**: Complete (Phases 1-6)
**Last Updated**: 2026-02-26

## Documentation Index

| Document | Description |
|----------|-------------|
| [LAYOUT_SPEC.md](./LAYOUT_SPEC.md) | Adaptive multi-pane layout specification |
| [LAYOUT_REFACTOR_PLAN.md](./LAYOUT_REFACTOR_PLAN.md) | Phased implementation plan for layout refactor |
| [TECH_DEBT.md](./TECH_DEBT.md) | Tracked TypeScript errors and technical debt |
| [TEST_ROADMAP.md](../../apps/ehr-prototype/docs/TEST_ROADMAP.md) | Testing strategy and roadmap |
| [Demo Scenarios](../../apps/ehr-prototype/docs/demo/) | Demo walkthroughs and feature coverage matrix |

### Archive

The `archive/initial-setup/` folder contains original phase implementation prompts and specifications from the initial build (Phases 1-6). These are preserved for historical reference but are no longer actively maintained — the codebase and its tests are the source of truth for current behavior.

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
