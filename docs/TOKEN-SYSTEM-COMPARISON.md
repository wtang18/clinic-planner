# Token System Comparison: Custom Script vs. Style Dictionary

## Overview

We chose to build a **custom token generation script** rather than use Style Dictionary. This document explains the differences, trade-offs, and when you might consider switching.

---

## Our Current Implementation (Custom Script)

### What We Built

A Node.js script (`scripts/generate-tokens.js`) that:
- Reads `design-tokens-variables-full.json` (Figma export)
- Parses collections, modes, and variable aliases
- Generates CSS custom properties
- Outputs mode-specific files (light/dark, small/large viewport)

### Workflow

```bash
# Designer exports from Figma
# → design-tokens-variables-full.json

npm run tokens:generate

# → Generates CSS files in src/styles/tokens/
# → primitives-color-ramp.css
# → semantic-color-light.css
# → semantic-color-dark.css
# → etc.
```

### Pros ✅

1. **Zero dependencies** - No external libraries needed
2. **Full control** - We understand exactly what's happening
3. **Simple** - ~200 lines of straightforward JavaScript
4. **Fast setup** - Working in minutes, not hours
5. **Easy debugging** - Can add console.logs, tweak output format instantly
6. **Figma-specific** - Handles Figma's exact JSON structure perfectly
7. **Team-friendly** - Any developer can read and modify the script
8. **Lightweight** - No build tool overhead or learning curve

### Cons ❌

1. **Single platform** - Only generates CSS (no iOS, Android, etc.)
2. **Manual maintenance** - If Figma changes export format, we update script
3. **No ecosystem** - Can't leverage community transforms/formats
4. **Limited features** - No built-in validation, documentation generation, etc.
5. **Custom solution** - Team needs to understand our specific implementation

### Best For

- **Web-only projects** (like ours)
- **Small-to-medium teams** (2-10 developers)
- **Fast iteration** needed
- **Simple token structure** (primitives → semantic → decorative)
- **Teams comfortable with custom tooling**

---

## Style Dictionary Alternative

### What It Is

An industry-standard open-source platform by Amazon for managing design tokens across multiple platforms.

### How It Would Work

```bash
npm install style-dictionary

# Create config file (style-dictionary.config.js)
# Create transforms for Figma JSON → Style Dictionary format

npm run tokens:build

# → Generates:
# → CSS custom properties
# → iOS Swift tokens
# → Android XML tokens
# → JSON for documentation
# → TypeScript types
# → Tailwind config
```

### Example Config

```js
// style-dictionary.config.js
module.exports = {
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'src/styles/tokens/',
      files: [{
        destination: 'variables.css',
        format: 'css/variables'
      }]
    },
    ios: {
      transformGroup: 'ios',
      buildPath: 'ios/',
      files: [{
        destination: 'Tokens.swift',
        format: 'ios-swift/class.swift'
      }]
    }
  }
};
```

### Pros ✅

1. **Multi-platform** - Generate tokens for web, iOS, Android, React Native, etc.
2. **Industry standard** - Used by Amazon, Salesforce, Adobe, etc.
3. **Rich ecosystem** - Pre-built transforms, formats, and templates
4. **Extensible** - Plugin system for custom needs
5. **Well-documented** - Extensive guides and examples
6. **Type generation** - Can auto-generate TypeScript types
7. **Validation** - Built-in token validation
8. **Community support** - Active GitHub, lots of examples

### Cons ❌

1. **Learning curve** - Need to understand Style Dictionary concepts
2. **Setup complexity** - More configuration needed
3. **Figma transform needed** - Must write custom transform for Figma's JSON format
4. **Dependency overhead** - Another npm package to maintain
5. **Overkill for web-only** - Most features unused if only targeting CSS
6. **Less flexible output** - Harder to customize exact CSS structure
7. **Debugging harder** - More abstraction layers to understand

### Best For

- **Multi-platform products** (web + mobile apps)
- **Large teams** (10+ developers)
- **Long-term maintenance** (will exist for years)
- **Complex token systems** (components, themes, brands)
- **Teams that value standardization** over customization

---

## Side-by-Side Comparison

| Aspect | Custom Script | Style Dictionary |
|--------|---------------|------------------|
| **Setup Time** | 1 hour | 4-8 hours |
| **Lines of Code** | ~200 | ~400+ (config + transforms) |
| **Dependencies** | 0 | 1+ (style-dictionary + plugins) |
| **Platforms Supported** | CSS only | CSS, iOS, Android, JSON, etc. |
| **Customization** | Very easy | Moderate (plugin system) |
| **Output Control** | Full control | Structured formats |
| **Debugging** | Simple (plain JS) | Complex (abstraction layers) |
| **Team Onboarding** | Quick (read script) | Slower (learn SD concepts) |
| **Future-Proofing** | Manual updates | Community updates |
| **Type Safety** | Manual | Auto-generated |
| **Documentation** | Manual | Can auto-generate |
| **Token Validation** | Manual | Built-in |
| **Industry Standard** | No | Yes |

---

## When to Switch to Style Dictionary

Consider migrating if:

1. **Mobile apps planned** - Building iOS/Android apps that need the same tokens
2. **Team grows** - 10+ developers need standardized workflow
3. **Multiple brands** - Need to manage multiple theme variants
4. **Type safety critical** - Want auto-generated TypeScript types
5. **Documentation automation** - Need to auto-generate token docs
6. **Complex transforms** - Need mathematical transforms (e.g., darken by 10%)

---

## Migration Path (If Needed)

If you decide to switch to Style Dictionary later:

### Phase 1: Parallel Implementation
1. Install Style Dictionary
2. Create SD config alongside custom script
3. Run both, compare outputs
4. Validate identical results

### Phase 2: Gradual Transition
1. Switch one platform at a time (e.g., CSS first)
2. Keep custom script as fallback
3. Update documentation

### Phase 3: Full Migration
1. Remove custom script
2. Update npm scripts
3. Update team documentation

**Estimated effort:** 2-3 days for experienced developer

---

## Our Decision Rationale

We chose the **custom script** because:

1. ✅ **Web-only project** - No need for iOS/Android tokens
2. ✅ **Small team** - Simple workflow preferred
3. ✅ **Fast iteration** - Test library, need to move quickly
4. ✅ **Full control** - Can customize output exactly as needed
5. ✅ **Zero complexity** - Team can understand entire script in 10 minutes
6. ✅ **Easy debugging** - Can add logging, modify output instantly

This gives us a **solid foundation** while staying **simple and maintainable**. If requirements change (mobile apps, larger team), we can migrate to Style Dictionary with minimal disruption.

---

## Recommendation

**Stick with custom script for now** unless:
- Mobile apps are confirmed in roadmap (6-12 months)
- Team grows beyond 10 developers
- You need complex token transforms
- Type generation becomes critical

**The custom script serves us well for this project's scope.**

---

## Questions?

- Custom script too simple? Add features as needed
- Considering Style Dictionary? Review migration path above
- Hybrid approach? Use custom for CSS, SD for mobile when needed
