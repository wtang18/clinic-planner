# Design System Export Preparation Checklist

Complete preparation guide for exporting this design system to other platforms and applications.

## Overview

This design system is currently implemented for **Next.js/React Web**. This document outlines all preparation steps needed to make it easily portable to:
- React Native mobile apps (iOS/Android)
- Other web frameworks (Vue, Angular, Svelte)
- Native iOS (SwiftUI)
- Native Android (Jetpack Compose)

---

## ✅ Already Completed

### Token Architecture
- [x] Three-layer token system (Primitives → Decoratives → Semantics)
- [x] Style Dictionary configuration for web (CSS variables)
- [x] Figma token export pipeline
- [x] Comprehensive token documentation
- [x] Semantic color tokens for light/dark themes
- [x] Typography tokens with responsive sizes
- [x] Elevation/shadow tokens
- [x] Spacing/dimension tokens
- [x] Border radius tokens

### Component Library
- [x] 12 core components with consistent API
- [x] Comprehensive Storybook documentation
- [x] Accessibility documentation (WCAG 2.1 AA)
- [x] Shared TypeScript interfaces
- [x] Token-based styling (no hard-coded values)

### Documentation
- [x] Component documentation guidelines
- [x] Accessibility best practices
- [x] Token usage examples
- [x] AI-friendly ClaudeCodeExamples

---

## 🎯 React Native Preparation (NEW - Ready to Use!)

### Token Generation
- [x] Style Dictionary config for React Native (`sd.config.react-native.js`)
- [x] Token output as JavaScript objects instead of CSS
- [x] Elevation helper with iOS/Android platform detection
- [x] Text styles generator for React Native StyleSheet
- [x] Font loading configuration helper
- [x] Build scripts in package.json

### Quick Start Commands

```bash
# Generate React Native tokens
npm run tokens:build:react-native

# Or build both web and React Native tokens
npm run tokens:build:all
```

**Output Files:**
- `src/design-system/tokens/build/react-native/tokens.js` - All tokens as JS objects
- `src/design-system/tokens/build/react-native/tokens.d.ts` - TypeScript definitions
- `src/design-system/tokens/build/react-native/elevation.ts` - Platform-specific shadows
- `src/design-system/tokens/build/react-native/text-styles.ts` - Text style utilities
- `src/design-system/tokens/build/react-native/fonts.ts` - Font loading config

### Documentation
- [x] Comprehensive React Native migration guide
- [x] Platform-specific considerations documented
- [x] Component migration strategy outlined
- [x] Best practices and troubleshooting guide

---

## 📋 Additional Preparation Steps

### 1. **Component Abstraction** (Recommended)

Extract platform-agnostic logic from components:

```
✅ Current Structure:
src/design-system/components/Button.tsx

🎯 Target Structure:
src/design-system/components/Button/
├── Button.types.ts       # ✅ Shared types (platform-agnostic)
├── Button.logic.ts       # ⏳ TODO: Extract shared state/logic
├── Button.web.tsx        # ⏳ TODO: Rename from Button.tsx
├── Button.native.tsx     # ⏳ TODO: Create React Native version
├── Button.stories.tsx    # ✅ Already exists
└── index.ts              # ⏳ TODO: Platform resolver
```

**Benefits:**
- Shared business logic across platforms
- Consistent behavior on web and mobile
- Easier testing (test logic separately from rendering)
- Reduced code duplication

**Priority Order:**
1. **High Priority** (most commonly used):
   - Button
   - Input
   - Card
   - Toast

2. **Medium Priority**:
   - Toggle
   - Pill
   - SegmentedControl
   - SearchInput

3. **Low Priority**:
   - Sidebar (often platform-specific navigation)
   - Container (simple wrapper)
   - Textarea
   - TogglePill

### 2. **Icon System Compatibility**

Current icons may need React Native versions:

```typescript
// ⏳ TODO: Investigate current icon implementation
// Option 1: Use react-native-svg
// Option 2: Convert to React Native compatible format
// Option 3: Use separate icon libraries per platform
```

**Checklist:**
- [ ] Audit current icon system (SVG-based?)
- [ ] Test icons in React Native environment
- [ ] Create React Native icon wrapper if needed
- [ ] Document icon usage for both platforms

### 3. **Animation System** (If Applicable)

If you add animations later:

| Web | React Native |
|-----|--------------|
| CSS transitions/animations | Animated API |
| Framer Motion | React Native Reanimated |
| CSS `@keyframes` | `Animated.timing()` |

**Preparation:**
- [ ] Decide on animation library (if needed)
- [ ] Create platform-agnostic animation utilities
- [ ] Document animation tokens (duration, easing)

### 4. **Package Structure for Multi-Platform**

Update `src/design-system/package.json` for optimal packaging:

```json
{
  "name": "@your-org/design-system",
  "version": "1.0.0",
  "main": "index.js",
  "types": "index.d.ts",
  "react-native": "index.native.js",
  "exports": {
    ".": {
      "import": "./index.js",
      "require": "./index.js",
      "react-native": "./index.native.js"
    },
    "./tokens": {
      "import": "./tokens/build/tokens.js",
      "react-native": "./tokens/build/react-native/tokens.js"
    },
    "./components/*": {
      "import": "./components/*/index.js",
      "react-native": "./components/*/index.native.js"
    }
  },
  "files": [
    "components",
    "tokens",
    "icons",
    "index.js",
    "index.d.ts"
  ]
}
```

**Checklist:**
- [ ] Update package.json with platform exports
- [ ] Test package installation in separate project
- [ ] Document installation instructions
- [ ] Consider publishing to npm (optional)

### 5. **Asset Management**

**Fonts:**
- [x] Inter font family in use
- [ ] Copy font files to design system assets folder
- [ ] Create font loading utilities
- [ ] Document font installation process

**Images/Illustrations:**
- [ ] Audit if any images are part of design system
- [ ] Optimize images for mobile (smaller file sizes)
- [ ] Document asset requirements

### 6. **Testing Strategy**

**Current State:**
- ✅ Storybook for visual testing (web)
- ⏳ No automated tests yet

**Recommended Additions:**
- [ ] Set up Vitest/Jest for unit tests
- [ ] Test shared logic functions
- [ ] Set up visual regression testing (Chromatic or Percy)
- [ ] Create test utilities for both platforms
- [ ] Document testing approach

### 7. **Versioning and Changelog**

Prepare for multi-platform releases:

- [ ] Set up semantic versioning
- [ ] Create CHANGELOG.md
- [ ] Document breaking changes between versions
- [ ] Tag platform-specific changes in changelog

### 8. **Performance Considerations**

**Web:**
- ✅ CSS tokens loaded once
- ✅ Tree-shaking support

**React Native:**
- [ ] Measure bundle size with tokens
- [ ] Test app startup time
- [ ] Optimize StyleSheet creation
- [ ] Document performance best practices

---

## 🚀 Immediate Action Items (Start Here)

### Step 1: Test React Native Token Generation

```bash
# Build React Native tokens
npm run tokens:build:react-native

# Verify output
ls -la src/design-system/tokens/build/react-native/
```

**Expected output:**
- tokens.js
- tokens.d.ts
- tokens.json
- elevation.ts
- text-styles.ts
- fonts.ts

### Step 2: Create Sample React Native Component

Create a simple test to verify tokens work:

```typescript
// test-react-native-tokens.js
const { tokens } = require('./src/design-system/tokens/build/react-native/tokens');

console.log('✓ Tokens loaded successfully');
console.log('Sample token:', tokens.color.bg.primary);
console.log('Spacing token:', tokens.dimension.space.around.md);
```

Run: `node test-react-native-tokens.js`

### Step 3: Extract Logic from One Component

Start with Button component:

1. Create `src/design-system/components/Button/` directory
2. Move `Button.tsx` → `Button/Button.web.tsx`
3. Extract types to `Button.types.ts`
4. Extract state logic to `Button.logic.ts`
5. Create simple `index.ts` resolver
6. Update imports in app code
7. Test that web app still works

### Step 4: Document Token Updates in Figma

Establish process for keeping tokens in sync:

- [ ] Document Figma export workflow
- [ ] Create script to validate token changes
- [ ] Set up version control for Figma exports
- [ ] Document token update process in README

---

## 🎨 Other Platform Preparations

### Vue/Angular/Svelte (Web Frameworks)

**Tokens: Already Ready! ✅**
- CSS custom properties work in all web frameworks
- Style Dictionary output is framework-agnostic

**Components: Needs Adaptation**
- [ ] Create framework-specific component wrappers
- [ ] Use framework's native patterns (Vue SFC, Angular templates, etc.)
- [ ] Maintain same TypeScript interfaces

### iOS (SwiftUI)

**Tokens:**
- [ ] Create Style Dictionary config for iOS
- [ ] Output format: Swift structs or JSON
- [ ] Map tokens to SwiftUI modifiers

**Example output:**
```swift
struct DesignTokens {
    struct Color {
        static let bgPrimary = Color(hex: "#FFFFFF")
        static let fgPrimary = Color(hex: "#181818")
    }
}
```

### Android (Jetpack Compose)

**Tokens:**
- [ ] Create Style Dictionary config for Android
- [ ] Output format: Kotlin objects or XML
- [ ] Map tokens to Compose theme

**Example output:**
```kotlin
object DesignTokens {
    object Color {
        val BgPrimary = Color(0xFFFFFFFF)
        val FgPrimary = Color(0xFF181818)
    }
}
```

---

## 📊 Readiness Matrix

| Feature | Web | React Native | iOS | Android |
|---------|-----|--------------|-----|---------|
| **Tokens** | ✅ Ready | ✅ Ready | ⏳ Config needed | ⏳ Config needed |
| **Components** | ✅ 12 components | ⏳ Need .native versions | ❌ Not started | ❌ Not started |
| **Typography** | ✅ CSS classes | ✅ StyleSheet ready | ⏳ SwiftUI needed | ⏳ Compose needed |
| **Icons** | ✅ Working | ⚠️ Need verification | ❌ Not started | ❌ Not started |
| **Elevation** | ✅ CSS classes | ✅ Platform-specific | ⏳ Shadow mapping | ⏳ Elevation mapping |
| **Documentation** | ✅ Comprehensive | ✅ Migration guide | ❌ Not started | ❌ Not started |
| **Examples** | ✅ Storybook | ⏳ Need RN Storybook | ❌ Not started | ❌ Not started |

**Legend:**
- ✅ Ready to use
- ✅ Available (needs setup)
- ⏳ Partially ready / In progress
- ⚠️ Needs investigation
- ❌ Not started

---

## 🎓 Learning Resources

### React Native
- [React Native Documentation](https://reactnative.dev)
- [React Native Styling](https://reactnative.dev/docs/style)
- [Platform-specific Code](https://reactnative.dev/docs/platform-specific-code)

### Style Dictionary
- [Style Dictionary Docs](https://amzn.github.io/style-dictionary)
- [Custom Transforms](https://amzn.github.io/style-dictionary/#/transforms)
- [Platform Configuration](https://amzn.github.io/style-dictionary/#/config)

### Design Tokens
- [Design Tokens Community Group](https://www.designtokens.org/)
- [W3C Design Tokens Format](https://design-tokens.github.io/community-group/format/)

---

## 🔄 Ongoing Maintenance

### When Adding New Components
- [ ] Create shared types and logic
- [ ] Document platform differences
- [ ] Update both web and React Native versions
- [ ] Add to component inventory

### When Updating Tokens
- [ ] Export from Figma
- [ ] Run all token build scripts
- [ ] Verify changes in both web and React Native
- [ ] Update documentation if needed

### When Making Breaking Changes
- [ ] Document in CHANGELOG.md
- [ ] Update migration guide
- [ ] Bump version according to semver
- [ ] Test in sample apps

---

## 💡 Key Takeaways

### What Makes Export Easy:
1. ✅ **Token-based styling** - No hard-coded values
2. ✅ **Semantic tokens** - Abstract platform differences
3. ✅ **Consistent component API** - Same props across platforms
4. ✅ **TypeScript** - Shared types ensure consistency
5. ✅ **Documentation** - Clear guidelines for implementation

### What Still Needs Work:
1. ⏳ **Component logic extraction** - Separate rendering from logic
2. ⏳ **Platform testing** - Verify in React Native environment
3. ⏳ **Icon compatibility** - Ensure icons work on all platforms
4. ⏳ **Packaging** - Set up npm package structure

### Recommended Next Steps:
1. **Phase 1 (Now)**: Test React Native token generation
2. **Phase 2 (Week 1)**: Extract logic from 2-3 core components
3. **Phase 3 (Week 2)**: Create React Native versions of those components
4. **Phase 4 (Week 3)**: Test in actual React Native app
5. **Phase 5 (Ongoing)**: Expand to remaining components as needed

---

## 📞 Support

For questions or issues during export/migration:
1. Check [REACT-NATIVE-MIGRATION-GUIDE.md](./REACT-NATIVE-MIGRATION-GUIDE.md)
2. Review [DOCUMENTATION_GUIDELINES.md](../src/design-system/DOCUMENTATION_GUIDELINES.md)
3. Check component Storybook docs for usage examples
4. Refer to Style Dictionary documentation for custom transforms

---

Last updated: 2025-10-11
Version: 1.0.0
