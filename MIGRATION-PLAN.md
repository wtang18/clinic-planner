# Migration Plan: clinic-planner → carbon-prototypes

## Overview

This document details the restructuring from a single-app project to a multi-prototype monorepo using npm workspaces.

**Current Path:** `/Users/william.tang/Projects/clinic-planner`
**Target Path:** Will rename in place to `carbon-prototypes`
**Package Manager:** npm workspaces (pnpm not installed)

---

## Phase 1: Analysis Summary

### Current Directory Structure

```
clinic-planner/
├── .claude/                    # Keep at root
├── .env.example               # Keep at root (shared)
├── .env.local                 # Keep at root (shared)
├── .eslintignore              # → apps/clinic-planner/
├── .eslintrc.json             # → apps/clinic-planner/
├── .expo/                     # → apps/react-native-demo/ (if needed)
├── .git/                      # Keep at root
├── .gitignore                 # Keep at root (update paths)
├── .next/                     # Delete (rebuild)
├── .storybook/                # → apps/clinic-planner/.storybook/
├── CLAUDE.md                  # Keep at root (update)
├── ICON_USAGE.md              # → apps/clinic-planner/docs/ or design-system docs
├── ICON_WORKFLOW.md           # → apps/clinic-planner/docs/ or design-system docs
├── components.json            # → apps/clinic-planner/ (shadcn config)
├── debug-storybook.log        # Delete
├── docs/                      # → docs/ (root level)
├── next-env.d.ts              # → apps/clinic-planner/
├── next.config.js             # → apps/clinic-planner/
├── package-lock.json          # Delete (regenerate)
├── package.json               # Split (root workspace + apps)
├── postcss.config.js          # → apps/clinic-planner/
├── sample-apps/               # Contents → apps/
├── scripts/                   # → packages/design-tokens/scripts/
├── sd.config.*.js             # → packages/design-tokens/
├── src/                       # Split (see breakdown below)
├── supabase/                  # Keep at root (shared backend)
├── tailwind.config.js         # → apps/clinic-planner/
├── tailwind.config.js.backup  # Delete
├── tsconfig.json              # Split (root + app-specific)
├── tsconfig.tsbuildinfo       # Delete (regenerate)
├── vitest.config.ts           # → apps/clinic-planner/
└── vitest.shims.d.ts          # → apps/clinic-planner/
```

### src/ Directory Breakdown

```
src/
├── app/          # → apps/clinic-planner/app/
├── components/   # → apps/clinic-planner/components/
├── contexts/     # → apps/clinic-planner/contexts/
├── design-system/
│   ├── components/      # → apps/clinic-planner/design-system/components/ (NOT shared - drifted)
│   ├── docs/            # → docs/design-system/ or keep with tokens
│   ├── figma-export/    # → packages/design-tokens/figma-export/
│   ├── icons/           # → apps/clinic-planner/design-system/icons/ (app-specific for now)
│   ├── lib/             # → apps/clinic-planner/design-system/lib/
│   ├── tokens/          # → packages/design-tokens/ (SHARED)
│   │   ├── build/       # → packages/design-tokens/dist/
│   │   ├── sd-input/    # → packages/design-tokens/sd-input/ (intermediate)
│   │   └── *.json       # → packages/design-tokens/tokens/
│   └── *.md, *.js       # Evaluate individually
├── lib/          # → apps/clinic-planner/lib/
├── stories/      # → apps/clinic-planner/stories/ (Storybook default examples)
├── types/        # → apps/clinic-planner/types/
├── utils/        # → apps/clinic-planner/utils/
└── svg.d.ts      # → apps/clinic-planner/
```

---

## Style Dictionary Configuration

### Current Configs (5 files at root)

| File | Purpose | Outputs To |
|------|---------|------------|
| `sd.config.js` | Main config (primitives, dimensions, elevation, base semantic) | `src/design-system/tokens/build/` |
| `sd.config.light.js` | Light theme decorative + semantic colors | `src/design-system/tokens/build/` |
| `sd.config.dark.js` | Dark theme decorative + semantic colors | `src/design-system/tokens/build/` |
| `sd.config.react-native.js` | React Native JS/TS/JSON outputs | `src/design-system/tokens/build/react-native/` |
| `sd.config.typography-large.js` | Large viewport typography | `src/design-system/tokens/build/` |

**After migration:** All move to `packages/design-tokens/` with updated paths.

### Token Pipeline Scripts (in /scripts)

| Script | Purpose | Destination |
|--------|---------|-------------|
| `parse-figma-tokens.js` | Parses raw Figma export → sd-input/ | `packages/design-tokens/scripts/` |
| `generate-elevation-utilities.js` | Generates CSS elevation classes | `packages/design-tokens/scripts/` |
| `generate-elevation-react-native.js` | Generates RN elevation styles | `packages/design-tokens/scripts/` |
| `generate-text-styles-core.js` | Generates core text style CSS | `packages/design-tokens/scripts/` |
| `generate-text-styles-expressive.js` | Generates expressive text CSS | `packages/design-tokens/scripts/` |
| `generate-text-styles-react-native.js` | Generates RN text styles | `packages/design-tokens/scripts/` |
| `wrap-typography-media-queries.js` | Adds responsive media queries | `packages/design-tokens/scripts/` |
| `generate-tailwind-theme.js` | Generates Tailwind theme config | `packages/design-tokens/scripts/` |

### Token Sources

| Source | Description | Destination |
|--------|-------------|-------------|
| `src/design-system/tokens/design-tokens-variables-full.json` | Raw Figma export | `packages/design-tokens/tokens/` |
| `src/design-system/figma-export/*.json` | Typography Figma exports | `packages/design-tokens/figma-export/` |

### Token Build Outputs

| Current Path | New Path |
|--------------|----------|
| `src/design-system/tokens/build/*.css` | `packages/design-tokens/dist/css/` |
| `src/design-system/tokens/build/tokens.js` | `packages/design-tokens/dist/js/tokens.js` |
| `src/design-system/tokens/build/tokens.d.ts` | `packages/design-tokens/dist/js/tokens.d.ts` |
| `src/design-system/tokens/build/react-native/` | `packages/design-tokens/dist/react-native/` |
| `src/design-system/tokens/sd-input/` | `packages/design-tokens/sd-input/` (intermediate, gitignored) |

---

## Import Path Changes

### Pattern 1: TypeScript Path Alias `@/*`

**Current:** `@/*` → `./src/*`
**After (clinic-planner):** `@/*` → `./src/*` (same pattern, different root)

Files using `@/design-system/...`:
- All files in `src/app/` (7+ files)
- All files in `src/design-system/components/` (15+ files)
- `src/contexts/ToastContext.tsx`
- `src/components/MonthNote.tsx`
- Token documentation files

**Action:** Update imports from `@/design-system/tokens/build/...` to `@carbon/design-tokens/dist/...`

### Pattern 2: Relative Imports in React Native Demo

**Current:** `../../../src/design-system/tokens/build/react-native/...`
**After:** `@carbon/design-tokens/dist/react-native/...`

Files affected (25+ files):
- `sample-apps/react-native-demo/components/*.tsx`
- `sample-apps/react-native-demo/screens/*.tsx`
- `sample-apps/react-native-demo/tokens/*.stories.tsx`
- `sample-apps/react-native-demo/theme/tokens.ts`

### Pattern 3: Metro Resolver Alias

**Current (metro.config.js):**
```js
config.resolver.extraNodeModules = {
  '@design-system': path.resolve(parentRoot, 'src/design-system'),
};
```

**After:** Configure to resolve `@carbon/design-tokens` from workspace

---

## Files Requiring Path Updates

### High Priority (Build Will Fail Without These)

1. **Style Dictionary Configs (5 files)**
   - Update all `source` and `buildPath` paths

2. **Token Scripts (8 files in /scripts)**
   - Update input/output paths

3. **tsconfig.json** (root + apps)
   - Update path aliases

4. **apps/clinic-planner/app/globals.css**
   - Update `@import` paths for token CSS

5. **apps/clinic-planner/tailwind.config.js**
   - Update `content` paths

6. **apps/react-native-demo/metro.config.js**
   - Update resolver paths

### Medium Priority (Components/App Code)

- ~58 files with `@/design-system/` imports
- Most will work if path alias is configured correctly
- Token imports specifically need updating

---

## Target Directory Structure

```
carbon-prototypes/
├── .claude/
├── .env.example
├── .env.local
├── .git/
├── .gitignore
├── CLAUDE.md
├── package.json                 # Workspace root
├── tsconfig.base.json           # Shared TS config
├── prototypes.json              # Manifest for prototype-index
│
├── packages/
│   └── design-tokens/
│       ├── package.json         # @carbon/design-tokens
│       ├── tokens/
│       │   └── design-tokens-variables-full.json
│       ├── figma-export/
│       │   ├── typography-core-figma-export.json
│       │   └── typography-expressive-figma-export.json
│       ├── scripts/
│       │   ├── parse-figma-tokens.js
│       │   ├── generate-*.js
│       │   └── wrap-typography-media-queries.js
│       ├── sd-input/            # Intermediate (gitignored)
│       ├── sd.config.js
│       ├── sd.config.light.js
│       ├── sd.config.dark.js
│       ├── sd.config.react-native.js
│       ├── sd.config.typography-large.js
│       └── dist/                # Built outputs
│           ├── css/
│           ├── js/
│           └── react-native/
│
├── apps/
│   ├── clinic-planner/
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   ├── postcss.config.js
│   │   ├── vitest.config.ts
│   │   ├── .storybook/
│   │   ├── app/                 # Next.js app router
│   │   ├── components/          # App-specific components
│   │   ├── contexts/
│   │   ├── design-system/       # App-specific (components, icons - NOT shared)
│   │   │   ├── components/
│   │   │   ├── icons/
│   │   │   └── lib/
│   │   ├── lib/
│   │   ├── stories/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── react-native-demo/
│   │   ├── package.json
│   │   ├── app.json
│   │   ├── App.tsx
│   │   ├── metro.config.js
│   │   ├── tailwind.config.js
│   │   ├── .rnstorybook/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── navigation/
│   │   ├── theme/
│   │   └── ...
│   │
│   ├── prototype-index/         # NEW (Phase 3)
│   │   ├── package.json
│   │   ├── next.config.js
│   │   └── app/
│   │
│   └── ehr-prototype/           # NEW (Phase 4)
│       ├── package.json
│       ├── next.config.js
│       └── app/
│
├── docs/
│   ├── COMPONENT-MIGRATION-GUIDE.md
│   ├── REACT-NATIVE-MIGRATION-GUIDE.md
│   ├── STYLE-DICTIONARY-MIGRATION.md
│   ├── future-enhancements/
│   └── ...
│
├── prototypes/                  # Future throwaway experiments
│
└── supabase/                    # Shared backend (UNTOUCHED)
```

---

## Decisions (Confirmed)

### 1. Design System Components Location
**Decision:** Keep with clinic-planner (not shared).
**Note:** These are canonical current-gen components. Storybook = target state, production is behind.

### 2. Icon System
**Decision:** Extract to `packages/design-icons/` as `@carbon-health/design-icons`

### 3. Storybook Stories for Tokens
**Decision:** Move to `packages/design-tokens/stories/` with minimal Storybook config.

### 4. Package Naming
**Decision:**
- `@carbon-health/design-tokens`
- `@carbon-health/design-icons`

### 5. Environment Files
**Decision:** Each app gets its own `.env.local` (multiple Supabase projects).
- Create `.env.example` at workspace root as a template
- clinic-planner keeps its existing Supabase connection
- EHR prototype will get a separate Supabase project (not yet created)
- Document Supabase project mapping in root README or CLAUDE.md

### 6. Additional: seed-data/
**Decision:** Create `seed-data/` at workspace root with README explaining its purpose (shared mock data that can hydrate any Supabase project).

---

## Execution Checklist (Phase 2)

After your approval, I will:

1. [ ] Create empty directory structure
2. [ ] Create `packages/design-tokens/package.json`
3. [ ] Move token source files
4. [ ] Move and update Style Dictionary configs
5. [ ] Move and update build scripts
6. [ ] Test token build in isolation
7. [ ] Create `apps/clinic-planner/package.json`
8. [ ] Move clinic-planner app files
9. [ ] Update clinic-planner imports
10. [ ] Move `apps/react-native-demo/`
11. [ ] Update react-native-demo imports
12. [ ] Move `docs/`
13. [ ] Create root `package.json` with workspaces
14. [ ] Create root `tsconfig.base.json`
15. [ ] Update `.gitignore`
16. [ ] Run `npm install` from root
17. [ ] Verify token build works
18. [ ] Verify clinic-planner dev server starts
19. [ ] Verify TypeScript has no errors

---

## Risk Assessment

### Low Risk
- Moving docs (no code dependencies)
- Creating new directory structure

### Medium Risk
- Moving token files (many imports to update)
- Updating path aliases (affects all imports)

### Higher Risk
- React Native demo (complex Metro configuration)
- Storybook configurations (path-sensitive)

### Mitigation
- Git will preserve history for moves (use `git mv`)
- Run verification after each major step
- Keep old structure available in git history

---

## Notes

- **Supabase:** Will NOT be modified (as requested)
- **Git history:** Will use `git mv` to preserve history
- **npm workspaces:** Using npm (pnpm not installed)
- **Build outputs:** `dist/` directories will be gitignored and regenerated
