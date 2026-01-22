# Package Extraction Guide: @carbon-health/design-system

**Status:** Ready for extraction when 2nd project needs it
**Current Location:** `src/design-system/` (within clinic-planner)
**Target:** Standalone npm package `@carbon-health/design-system`

---

## When to Extract

Extract the design system to a separate package when:

1. ✅ **2nd project is ready** - Another Carbon Health project needs the design system
2. ✅ **Token system is stable** - Tokens generated from Figma, working in production
3. ✅ **Components are tested** - Core components work reliably
4. ✅ **Team approved** - Decision made to maintain separate package
5. ✅ **Mobile team ready** - React Native tokens needed for iOS/Android

**Current status:** Ready for extraction. Token system complete, package.json prepared.

---

## Extraction Steps

### Phase 1: Create New Repository

1. **Create GitHub repository**
   ```bash
   # Create new repo: carbon-health/design-system
   # Initialize with README, .gitignore (Node)
   ```

2. **Clone and set up**
   ```bash
   git clone git@github.com:carbon-health/design-system.git
   cd design-system
   npm init -y  # Will use existing package.json as template
   ```

3. **Copy design system files**
   ```bash
   # From clinic-planner
   cp -r src/design-system/* design-system/

   # Copy token generation scripts
   cp scripts/parse-figma-tokens.js design-system/scripts/
   cp sd.config.js design-system/

   # Copy documentation
   cp docs/STYLE-DICTIONARY-MIGRATION.md design-system/docs/
   cp docs/TOKEN-SYSTEM-COMPARISON.md design-system/docs/
   cp docs/COMPONENT-MIGRATION-GUIDE.md design-system/docs/
   ```

4. **Update package.json**
   ```json
   {
     "name": "@carbon-health/design-system",
     "version": "1.0.0",
     "description": "Carbon Health Design System - Tokens, components, and styles",
     "main": "./dist/index.js",
     "types": "./dist/index.d.ts",
     "exports": {
       ".": {
         "types": "./dist/index.d.ts",
         "import": "./dist/index.js",
         "require": "./dist/index.js"
       },
       "./tokens": {
         "types": "./tokens/build/tokens.d.ts",
         "import": "./tokens/build/tokens.js",
         "require": "./tokens/build/tokens.js"
       },
       "./tokens/css": "./tokens/build/index.css"
     },
     "files": [
       "dist/",
       "tokens/build/",
       "README.md"
     ],
     "scripts": {
       "tokens:parse": "node scripts/parse-figma-tokens.js",
       "tokens:build": "npm run tokens:parse && style-dictionary build",
       "tokens:clean": "rm -rf tokens/build tokens/sd-input",
       "build": "tsc",
       "test": "jest",
       "storybook": "storybook dev -p 6006",
       "build-storybook": "storybook build"
     },
     "peerDependencies": {
       "react": "^18.0.0 || ^19.0.0",
       "react-native": ">=0.70.0"
     },
     "devDependencies": {
       "typescript": "^5.0.0",
       "style-dictionary": "^4.4.0",
       "@storybook/react": "^7.0.0"
     },
     "publishConfig": {
       "access": "restricted",
       "registry": "https://registry.npmjs.org/"
     }
   }
   ```

5. **Set up TypeScript build**
   ```bash
   # Create tsconfig.json for building
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "ESNext",
       "lib": ["ES2020", "DOM"],
       "jsx": "react",
       "declaration": true,
       "outDir": "./dist",
       "rootDir": "./",
       "strict": true,
       "moduleResolution": "node",
       "esModuleInterop": true
     },
     "include": ["components/**/*", "index.ts"],
     "exclude": ["node_modules", "dist", "**/*.stories.tsx"]
   }
   ```

6. **Build and test**
   ```bash
   npm install
   npm run tokens:build
   npm run build
   npm run storybook  # Verify Storybook works
   ```

---

### Phase 2: Publish to npm

1. **Verify package contents**
   ```bash
   npm pack --dry-run
   # Check that only necessary files are included
   ```

2. **Publish to npm (private registry)**
   ```bash
   # First publish
   npm publish --access restricted

   # Tag version
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. **Verify installation**
   ```bash
   # In a test project
   npm install @carbon-health/design-system@1.0.0
   ```

---

### Phase 3: Update clinic-planner

1. **Install package in clinic-planner**
   ```bash
   cd clinic-planner
   npm install @carbon-health/design-system@1.0.0
   ```

2. **Update imports**

   **Before:**
   ```tsx
   import '@/design-system/tokens/build/index.css';
   import { Button } from '@/design-system/components/Button';
   ```

   **After:**
   ```tsx
   import '@carbon-health/design-system/tokens/css';
   import { Button } from '@carbon-health/design-system';
   ```

3. **Remove local design-system files**
   ```bash
   # After confirming everything works
   rm -rf src/design-system/
   rm scripts/parse-figma-tokens.js
   rm sd.config.js

   # Update package.json scripts (remove tokens:* scripts)
   ```

4. **Update documentation**
   - Update README to reference external package
   - Move design system docs to package repo
   - Add link to package documentation

5. **Test thoroughly**
   ```bash
   npm run build
   npm run dev
   npm run storybook

   # Verify all views work
   # Check components render correctly
   # Confirm no import errors
   ```

6. **Commit migration**
   ```bash
   git add .
   git commit -m "Migrate to @carbon-health/design-system package"
   git push
   ```

---

### Phase 4: Update Other Projects

Repeat Phase 3 for each project that needs the design system:

1. Install package
2. Update imports
3. Test thoroughly
4. Deploy

---

## File Structure (Extracted Package)

```
@carbon-health/design-system/
├── package.json
├── README.md
├── tsconfig.json
├── sd.config.js
│
├── scripts/
│   └── parse-figma-tokens.js
│
├── tokens/
│   ├── design-tokens-variables-full.json
│   ├── sd-input/             (generated)
│   └── build/                (generated)
│       ├── index.css
│       ├── primitives-*.css
│       ├── decorative-*.css
│       ├── semantic-*.css
│       ├── tokens.js
│       └── tokens.d.ts
│
├── components/
│   ├── Button/
│   ├── Card/
│   ├── Pill/
│   ├── Input/
│   └── ...
│
├── icons/
│   ├── small/
│   └── medium/
│
├── dist/                     (generated from build)
│   ├── index.js
│   ├── index.d.ts
│   └── components/
│
├── docs/
│   ├── STYLE-DICTIONARY-MIGRATION.md
│   ├── TOKEN-SYSTEM-COMPARISON.md
│   └── COMPONENT-MIGRATION-GUIDE.md
│
└── .storybook/
    └── ... (Storybook config)
```

---

## Token Update Workflow (Post-Extraction)

### In Design System Package

```bash
# 1. Designer exports from Figma
# Save as: tokens/design-tokens-variables-full.json

# 2. Build tokens
npm run tokens:build

# 3. Review changes
git diff tokens/build/

# 4. Test in Storybook
npm run storybook

# 5. Build package
npm run build

# 6. Bump version
npm version patch  # or minor/major

# 7. Publish
npm publish

# 8. Tag release
git tag v1.0.1
git push origin v1.0.1
```

### In Consuming Projects

```bash
# Update to latest version
npm install @carbon-health/design-system@latest

# Test changes
npm run build
npm run dev

# Commit
git add package.json package-lock.json
git commit -m "Update design system to v1.0.1"
```

---

## Versioning Strategy

Follow semantic versioning (semver):

- **Patch (1.0.x)** - Token updates, bug fixes, no breaking changes
- **Minor (1.x.0)** - New components, new tokens, backward compatible
- **Major (x.0.0)** - Breaking changes, removed tokens, API changes

### Examples

```bash
# Token color updates
npm version patch  # 1.0.0 → 1.0.1

# New Button variant added
npm version minor  # 1.0.1 → 1.1.0

# Renamed token (breaking change)
npm version major  # 1.1.0 → 2.0.0
```

---

## CI/CD Setup (Recommended)

### GitHub Actions Workflow

```yaml
# .github/workflows/publish.yml
name: Publish Package

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'

      - run: npm ci
      - run: npm run tokens:build
      - run: npm run build
      - run: npm test

      - run: npm publish --access restricted
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

This automatically publishes when you push a git tag.

---

## Migration Checklist

Use this checklist when extracting the package:

### Pre-Extraction
- [ ] Token system stable and tested
- [ ] Core components working reliably
- [ ] Documentation up to date
- [ ] Team approval for separate package
- [ ] 2nd project ready to consume

### Phase 1: Create Package
- [ ] Create GitHub repository
- [ ] Copy design system files
- [ ] Update package.json
- [ ] Set up TypeScript build
- [ ] Build tokens successfully
- [ ] Build components successfully
- [ ] Storybook works

### Phase 2: Publish
- [ ] Verify package contents (npm pack --dry-run)
- [ ] Publish to npm
- [ ] Tag release in git
- [ ] Verify installation in test project

### Phase 3: Update clinic-planner
- [ ] Install published package
- [ ] Update all imports
- [ ] Remove local design-system files
- [ ] Update documentation
- [ ] Test build succeeds
- [ ] Test dev server works
- [ ] Test Storybook works
- [ ] Verify all views render correctly
- [ ] Commit and deploy

### Phase 4: Update Other Projects
- [ ] Install package in 2nd project
- [ ] Update imports
- [ ] Test thoroughly
- [ ] Deploy

### Post-Extraction
- [ ] Document update workflow
- [ ] Train team on package updates
- [ ] Set up CI/CD (optional)
- [ ] Monitor for issues

---

## Troubleshooting

### Import errors after extraction

**Problem:** `Cannot find module '@carbon-health/design-system'`

**Solution:**
```bash
# Ensure package is installed
npm install @carbon-health/design-system

# Clear cache
rm -rf node_modules .next
npm install
```

### CSS tokens not loading

**Problem:** CSS variables not defined

**Solution:**
```tsx
// Make sure to import CSS tokens
import '@carbon-health/design-system/tokens/css';

// In globals.css or root layout
```

### TypeScript errors

**Problem:** Type definitions not found

**Solution:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@carbon-health/design-system": ["./node_modules/@carbon-health/design-system/dist"]
    }
  }
}
```

### Storybook not finding components

**Problem:** Storybook can't import components

**Solution:**
```js
// .storybook/main.js
module.exports = {
  stories: [
    '../node_modules/@carbon-health/design-system/**/*.stories.@(js|jsx|ts|tsx)'
  ]
}
```

---

## Alternative: Monorepo Approach

If maintaining separate repositories is too complex, consider a monorepo:

```
carbon-health/
├── packages/
│   ├── design-system/
│   ├── clinic-planner/
│   └── other-project/
├── package.json (root)
└── lerna.json or pnpm-workspace.yaml
```

**Pros:**
- Easier to develop across projects
- Shared tooling and dependencies
- Single PR for cross-cutting changes

**Cons:**
- More complex CI/CD setup
- Larger repository
- Need monorepo tooling (Lerna, pnpm workspaces, Turborepo)

**Recommendation:** Start with separate repository. Migrate to monorepo if maintaining multiple packages becomes burdensome.

---

## Questions?

- **When to extract?** When 2nd project needs it (ready now)
- **How to version?** Semantic versioning (patch for tokens, minor for features, major for breaking)
- **How to update?** Publish new version → update in consuming projects
- **Monorepo or separate?** Start separate, consider monorepo if maintaining becomes complex

**See also:**
- [Style Dictionary Migration](./STYLE-DICTIONARY-MIGRATION.md) - Token system details
- [Component Migration Guide](./COMPONENT-MIGRATION-GUIDE.md) - Using tokens in components
- [Token System Comparison](./TOKEN-SYSTEM-COMPARISON.md) - Why Style Dictionary

---

**Ready to extract?** Follow the checklist above and reach out to the team with any questions!
