# Carbon Health Design System Documentation

Central documentation hub for the Carbon Health design system and prototypes.

## Quick Start

| Task | Document |
|------|----------|
| Understand token architecture | [Token Architecture](./architecture/token-architecture.md) |
| Look up a token name | [Quick Token Reference](./guides/quick-token-reference.md) |
| Add a new component | [Documentation Guidelines](../apps/clinic-planner/design-system/DOCUMENTATION_GUIDELINES.md) |
| Check design system status | [STATUS.md](../apps/clinic-planner/design-system/STATUS.md) |
| Set up React Native | [React Native Setup](./guides/react-native-setup.md) |
| Migrate components to semantic tokens | [Component Migration](./guides/component-migration.md) |

## Documentation Structure

### Architecture (`/docs/architecture/`)

System design documents explaining the "why" behind decisions.

- [**Token Architecture**](./architecture/token-architecture.md) - Multi-theme token system (primitives → bases → themes)
- [Token Comparison](./architecture/token-comparison.md) - Style Dictionary vs custom scripts analysis
- [Composite Tokens](./architecture/composite-tokens.md) - Typography and shadow composite token analysis

### Guides (`/docs/guides/`)

Step-by-step how-to guides for common tasks.

- [Quick Token Reference](./guides/quick-token-reference.md) - Token cheatsheet for developers
- [Component Migration](./guides/component-migration.md) - Migrate components to semantic tokens
- [React Native Setup](./guides/react-native-setup.md) - Multi-platform setup guide
- [Package Extraction](./guides/package-extraction.md) - Extract to npm package
- [Multi-Platform Export](./guides/multi-platform-export.md) - Prepare for other platforms

### Reference (`/docs/reference/`)

API documentation and specifications.

- [Text Style Classes](./reference/text-style-classes.md) - Generated CSS text utilities

### Archive (`/docs/archive/`)

Historical documents preserved for context. Not actively maintained.

- [Archive Index](./archive/README.md) - What's in the archive and why

## Package Documentation

Each package has its own README for package-specific information:

- [@carbon-health/design-tokens](../packages/design-tokens/README.md) - Token package, build commands
- [@carbon-health/design-icons](../packages/design-icons/README.md) - Icon system

## App Documentation

App-specific documentation lives within each app:

- [clinic-planner/design-system/STATUS.md](../apps/clinic-planner/design-system/STATUS.md) - Component status and roadmap
- [clinic-planner/design-system/DOCUMENTATION_GUIDELINES.md](../apps/clinic-planner/design-system/DOCUMENTATION_GUIDELINES.md) - Storybook documentation template

## For AI Assistants

See [/CLAUDE.md](../CLAUDE.md) for machine-readable instructions and predictable paths.

## Build Commands

```bash
# Build all tokens
npm run build:tokens

# Run Storybook (clinic-planner components)
npm run storybook

# Run Storybook (tokens only)
npm run storybook:tokens
```
