# Carbon Prototypes - Claude Instructions

## Project Structure

This is a monorepo containing multiple Carbon Health design prototypes:

```
carbon-prototypes/
├── packages/
│   ├── design-tokens/     # @carbon-health/design-tokens - Shared design tokens
│   └── design-icons/      # @carbon-health/design-icons - Shared icon system
├── apps/
│   ├── clinic-planner/    # Main quarterly planning tool (Next.js)
│   ├── react-native-demo/ # Mobile prototype (Expo/React Native)
│   ├── prototype-index/   # Dashboard for navigating prototypes
│   └── ehr-prototype/     # Future EHR prototype
├── docs/                  # Shared documentation
├── seed-data/             # Mock data scripts for Supabase
└── supabase/              # Supabase configuration (shared)
```

## Supabase Project Mapping

- **clinic-planner**: Uses existing production Supabase project
- **react-native-demo**: Shares clinic-planner's Supabase project
- **ehr-prototype**: Will use a separate Supabase project (TBD)

Each app has its own `.env.local` file with Supabase credentials.

## Design System Guidelines

### Components (apps/clinic-planner/design-system)
- Components are kept with clinic-planner (canonical current-gen components)
- Storybook = target state, production implementation may be behind
- When creating a new component, refer to `DOCUMENTATION_GUIDELINES.md`
- Check `STATUS.md` for current design system state and priorities

### Tokens (@carbon-health/design-tokens)
- Source of truth for design tokens from Figma
- Build with: `npm run build:tokens` from root
- Stories in `packages/design-tokens/stories/`

### Icons (@carbon-health/design-icons)
- Shared icon system based on Lucide
- Generate maps with: `npm run build:icons` from root

## Common Commands

```bash
# From workspace root
npm install                    # Install all dependencies
npm run dev                    # Run clinic-planner dev server
npm run dev:rn                 # Run React Native demo
npm run build:tokens           # Build design tokens
npm run storybook              # Run clinic-planner Storybook
npm run storybook:tokens       # Run tokens Storybook

# From specific app
cd apps/clinic-planner && npm run dev
cd apps/react-native-demo && npm run start
cd apps/ehr-prototype && npm run web
```

## Testing (EHR Prototype)

The EHR prototype has a Vitest test infrastructure with browser API mocks.

```bash
cd apps/ehr-prototype

npm test              # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage report
npm run test:ui       # Interactive UI
npm run test:e2e      # Playwright E2E tests
```

**After making changes to EHR prototype:**
- Run `npm run test:run` to verify nothing is broken
- When adding new hooks or complex logic, add corresponding tests
- See `/apps/ehr-prototype/docs/TEST_ROADMAP.md` for priorities and guidelines

## Documentation Map

| Task | Primary Document |
|------|------------------|
| Understand token architecture | `/docs/architecture/token-architecture.md` |
| Look up token names | `/docs/guides/quick-token-reference.md` |
| Add a new component | `/apps/clinic-planner/design-system/DOCUMENTATION_GUIDELINES.md` |
| Check design system status | `/apps/clinic-planner/design-system/STATUS.md` |
| Set up React Native | `/docs/guides/react-native-setup.md` |
| Migrate components | `/docs/guides/component-migration.md` |
| EHR prototype testing | `/apps/ehr-prototype/docs/TEST_ROADMAP.md` |

### Predictable Paths

Documentation follows these patterns:
- **Architecture docs**: `/docs/architecture/{topic}.md`
- **How-to guides**: `/docs/guides/{task}.md`
- **Reference docs**: `/docs/reference/{topic}.md`
- **Historical docs**: `/docs/archive/{YYYY-MM}-{topic}.md`
- **Package docs**: `/packages/{name}/README.md`
- **App-specific**: `/apps/{name}/design-system/{FILE}.md`

### Token File Locations

| Layer | Location |
|-------|----------|
| Primitives | `/packages/design-tokens/sd-input/primitives/` |
| Decoratives | `/packages/design-tokens/sd-input/decorative/` |
| Pro Semantics | `/packages/design-tokens/sd-input/bases/pro/` |
| Consumer Semantics | `/packages/design-tokens/sd-input/bases/consumer/` |
| Theme Overrides | `/packages/design-tokens/sd-input/themes/` |
| Build Output | `/packages/design-tokens/dist/` |

## Workflow Processes

These are automatic behaviors — follow them without being asked.

### After Any Code Change (EHR Prototype)
- Run `npm run test:run` from `apps/ehr-prototype` and report the result
- If the change affects type signatures (hook returns, state shapes, action types), also run `npx tsc --noEmit` from `apps/ehr-prototype`
- If tests fail, fix before moving on — don't leave broken tests behind

### After Any Refactor That Deletes or Renames
- Grep for the old names across the codebase to catch orphaned references
- Check for unused imports in modified files
- Flag anything found; clean it up or note it

### When Adding Hooks, Reducers, or Complex Logic
- Write tests alongside the code, not as a follow-up task
- For new adapter hooks: test initial shape, dispatch round-trip, and cross-hook consistency
- For new reducer actions: test the transition and verify invariant coverage

### When Introducing a New Pattern for the First Time
- Include a brief "what and why" explanation alongside the code
- Cover: what the pattern is, why it was chosen over alternatives, when to use it again
- Subsequent uses of the same pattern don't need the explanation

### After Completing a Task or Phase
- Summarize what changed: files modified, tests added/changed, lines removed (concrete numbers)
- Report current state: tests passing, any warnings or known issues
- Suggest next steps if obvious from context
- Surface any implicit decisions made that might warrant review
- Update `MEMORY.md`: current status, test counts, move "next" marker forward

### At Major Milestones (Feature Complete, Cleanup Done)
- Trim `MEMORY.md`: archive resolved phase details to topic files in `memory/`
- Keep `MEMORY.md` focused on: current status, active decisions, active gotchas, key files
- Remove details about completed phases that are now just history
- Check that referenced documentation (TEST_ROADMAP.md, STATUS.md, etc.) is still accurate

### Commit Cadence
- Offer to commit after each natural boundary:
  - Feature or fix complete and tests pass
  - Refactor done (before starting the next one)
  - Dead code cleanup finished
  - New tests added and passing
  - Before starting something risky or experimental
- Don't commit mid-work, after partial changes, or when tests are failing
- Don't push unless explicitly asked

### When Encountering Stale Documentation
- If reading a doc file during work and it's outdated, flag it immediately
- Offer to update it as a side task or note it for later
- Don't silently continue past stale docs

### After Schema or State Shape Changes
- Verify invariant tests still cover all valid/forbidden states
- If new states were added, add corresponding invariant test cases
- Run the full test suite, not just the new tests

## Important Notes

- DO NOT modify Supabase configuration or data without explicit permission
- When working on design system, keep STATUS.md updated
- Each prototype should have its entry in `prototypes.json`
