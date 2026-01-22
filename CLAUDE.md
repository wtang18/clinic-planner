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
```

## Documentation Map

| Task | Primary Document |
|------|------------------|
| Understand token architecture | `/docs/architecture/token-architecture.md` |
| Look up token names | `/docs/guides/quick-token-reference.md` |
| Add a new component | `/apps/clinic-planner/design-system/DOCUMENTATION_GUIDELINES.md` |
| Check design system status | `/apps/clinic-planner/design-system/STATUS.md` |
| Set up React Native | `/docs/guides/react-native-setup.md` |
| Migrate components | `/docs/guides/component-migration.md` |

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

## Important Notes

- DO NOT modify Supabase configuration or data without explicit permission
- When working on design system, keep STATUS.md updated
- Each prototype should have its entry in `prototypes.json`
