# React Native Clinic Planner - Sample App

**Location:** `/sample-apps/react-native-demo/`
**Status:** In Development
**Platform:** iOS (iPhone & iPad)
**Framework:** React Native (Expo)

---

## Overview

A **minimized version** of the Clinic Planner web app, built for iOS using React Native and Expo. This sample app demonstrates how to implement the clinic planner's core calendar viewing experience on mobile, using the same design system tokens and components.

### What's Included

- ✅ **3 Calendar Views**: Month, Quarter, Year
- ✅ **Adaptive Layouts**: iPhone (tabs) vs iPad (drawer navigation)
- ✅ **Design System Integration**: Shared tokens, components (Button, Card, Container, Pill)
- ✅ **Responsive Utilities**: Window-based responsive helpers for iPad Split View support
- ✅ **Read-Only Event Display**: View events, outreach angles, materials

### What's Excluded (Web-Only)

- ❌ Event creation/editing
- ❌ Outreach angle management
- ❌ Marketing materials management
- ❌ Settings and preferences
- ❌ Search and advanced filtering

---

## Quick Start

### Prerequisites

```bash
# Install Expo CLI globally
npm install -g expo-cli

# Or use npx (no global install needed)
npx expo --version
```

### Setup

```bash
# Navigate to sample app
cd sample-apps/react-native-demo

# Install dependencies
npm install

# Generate React Native tokens (from project root)
cd ../..
npm run tokens:build:react-native
```

### Run the App

```bash
# Start Expo dev server
npm start

# Or with tunnel (if on different network)
npx expo start --tunnel

# iOS Simulator (requires Xcode)
npm run ios

# Android Emulator (requires Android Studio)
npm run android

# Web browser
npm run web
```

### Run Storybook (Component Library)

Storybook runs on a **separate port (8082)** so you can run both the app and Storybook simultaneously:

```bash
# Start Storybook dev server (port 8082)
npm run storybook

# iOS Simulator with Storybook
npm run storybook:ios

# Android Emulator with Storybook
npm run storybook:android

# Web browser with Storybook
npm run storybook:web
```

**Running Both Simultaneously:**
```bash
# Terminal 1: Run the app (port 8081)
npm start

# Terminal 2: Run Storybook (port 8082)
npm run storybook
```

**View Storybook on Physical Device:**
```bash
# Start Storybook and scan QR code with Expo Go app
npm run storybook

# The device will load Storybook instead of the app
```

**View Storybook on Web:**
```bash
# Open in web browser (http://localhost:8082)
npm run storybook:web

# Storybook will render in React Native Web
```

**Publishing Storybook to Web:**

You can deploy Storybook as a static website for team sharing:

```bash
# Build static web version (outputs to web-build/)
npm run storybook:build

# Deploy the web-build/ folder to:
# - Vercel: npx vercel web-build/
# - Netlify: netlify deploy --dir=web-build --prod
# - GitHub Pages: Copy web-build/ to gh-pages branch
# - Any static hosting service (Cloudflare Pages, AWS S3, etc.)
```

The built Storybook will be a static website showing all your React Native components rendered via React Native Web.

---

## Architecture

### Project Structure

```
sample-apps/react-native-demo/
├── components/         # React Native components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Container.tsx
│   └── Pill.tsx
├── screens/           # Calendar view screens
│   ├── MonthScreen.tsx
│   ├── QuarterScreen.tsx
│   └── YearScreen.tsx
├── navigation/        # Adaptive navigation
│   └── RootNavigator.tsx
├── utils/            # Responsive utilities
│   └── responsive.ts
├── App.tsx           # App entry point
└── package.json
```

### Design Decisions

#### 1. Adaptive Navigation

**iPhone (< 768px):**
- Bottom tab navigation
- Single-column layouts
- Vertical scrolling

**iPad (≥ 768px):**
- Drawer navigation (persistent sidebar)
- Multi-column layouts where appropriate
- More horizontal space utilization

**iPad Split View:**
- Detects **window width changes** (not device type)
- Adapts column count dynamically:
  - 1 column: < 430px (1/4 or 1/3 split)
  - 2 columns: 430-767px (1/2 split)
  - 3 columns: ≥ 768px (full screen or 2/3 split)

#### 2. Responsive Utilities

Located in `/utils/responsive.ts`:

```typescript
// Device detection
export function useDeviceType(): DeviceInfo

// Layout recommendations
export function useAdaptiveLayout(): AdaptiveLayout
```

Key features:
- Window dimension-based (not device type)
- Handles iPad multitasking (Split View, Slide Over)
- Returns layout hints (columns, navigation type, etc.)

#### 3. Component Extraction Strategy

React Native components maintain **API compatibility** with web versions:

**Same Props:**
```typescript
// Web
<Button type="primary" size="medium" onPress={() => {}} />

// React Native (same API!)
<Button type="primary" size="medium" onPress={() => {}} />
```

**Platform Differences:**
- Web: `className` + CSS → RN: `style` + StyleSheet
- Web: `<div>` → RN: `<View>`
- Web: `:hover` → RN: `onPressIn`/`onPressOut`
- Web: CSS variables → RN: Token objects

---

## Calendar Views

### Month View (`screens/MonthScreen.tsx`)

**Layout:** 3-column adaptive layout
- **Column 1:** This Month - Events happening this month
- **Column 2:** Preparation Needed - Events requiring prep
- **Column 3:** Next 3 Months - Upcoming events

**Responsive:**
- iPhone: Single column, vertical stack
- iPad: 2-3 columns side by side
- iPad Split View: Adapts based on width

### Quarter View (`screens/QuarterScreen.tsx`)

**Layout:** 3 month containers for selected quarter
- Each month shows events + MonthNote
- Prep needed section per month
- Clickable month containers

**Responsive:**
- iPhone: Single column, vertical stack
- iPad: 2-3 columns
- iPad Split View: Adapts

### Year View (`screens/YearScreen.tsx`)

**Layout:** 12 month grid
- Minimal event details (title, dates, pills)
- Clickable month containers

**Responsive:**
- iPhone: 1 column (12 months stacked)
- iPad: 2-4 columns
- Matches web app responsive behavior

---

## Design System Integration

### Token Usage

```typescript
// Import React Native tokens
import {
  colorBgNeutralSubtle,
  colorFgNeutralPrimary,
  dimensionSpaceAroundMd,
  dimensionRadiusMd,
} from '../../../src/design-system/tokens/build/react-native/tokens';

// Use in StyleSheet
const styles = StyleSheet.create({
  container: {
    backgroundColor: colorBgNeutralSubtle,
    padding: dimensionSpaceAroundMd.number,
    borderRadius: dimensionRadiusMd.number,
  },
});
```

### Elevation (Shadows)

```typescript
import { elevation } from '../../../src/design-system/tokens/build/react-native/elevation';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    ...elevation.md, // Platform-specific shadows
  },
});
```

**Note:** Elevation automatically handles iOS vs Android shadow differences.

---

## Storybook Integration

This project includes **Storybook for React Native** as a separate runnable component library, allowing you to:

- View and interact with all components in isolation
- Test components with on-device controls
- Document component APIs and usage examples
- Run simultaneously with the main app for development

### How It Works

The project uses an environment variable (`STORYBOOK=true`) to conditionally load either the app or Storybook at startup:

**Entry Point (`index.ts`):**
```typescript
const isStorybook = process.env.STORYBOOK === 'true';

if (isStorybook) {
  AppEntryPoint = require('./.rnstorybook').default;  // Load Storybook
} else {
  AppEntryPoint = require('./App').default;          // Load app
}
```

### Creating Component Stories

Stories live alongside components in the `components/` folder:

```
components/
├── Button.tsx
├── Button.stories.tsx    ← Story file
├── Container.tsx
├── Container.stories.tsx
└── Pill.tsx
```

**Example Story:**
```typescript
import type { Meta, StoryObj } from '@storybook/react-native';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Design System/Components/Button',
  component: Button,
  argTypes: {
    type: {
      control: 'select',
      options: ['primary', 'outlined', 'solid', /* ... */],
    },
  },
};

export default meta;

export const Playground: StoryObj<typeof Button> = {
  args: {
    type: 'primary',
    label: 'Click Me',
  },
};
```

### Available Stories

- **Button.stories.tsx** - 7 stories (Playground, AllTypes, AllSizes, States, WithSubtext, RealWorldExamples, AccessibilityDemo)

---

## Component Status

### ✅ Completed

- **Button** - All variants, sizes, icon support + Storybook stories
- **Card** - Interactive/non-interactive variants
- **Container** - Gap variants, interactive support
- **Responsive utilities** - Device detection, layout helpers
- **Navigation** - Drawer (iPad) + Tabs (iPhone)
- **Storybook** - Separate runnable component library

### 🚧 In Progress

- **Pill** - Event type pills (component done, stories pending)
- **MonthScreen** - 3-column layout
- **QuarterScreen** - Quarter layout
- **YearScreen** - 12-month grid

### ⏳ Planned

- Container and Pill Storybook stories
- Event data fetching from Supabase
- Event display with outreach angles
- SegmentedControl for view switching
- Sidebar component

---

## Development Workflow

### Token Updates

When design tokens change in Figma:

```bash
# From project root
npm run tokens:build:react-native

# Clear Metro cache
cd sample-apps/react-native-demo
npx expo start --clear
```

### Adding New Components

1. Read web component from `/src/design-system/components/`
2. Create React Native version in `sample-apps/react-native-demo/components/`
3. Maintain same prop interface
4. Use design tokens (not hard-coded values)
5. Test on iPhone and iPad

### Testing

**Devices to Test:**
- iPhone (any size) - Tab navigation, single column
- iPad (any size) - Drawer navigation, multi-column
- iPad Split View - Test all split sizes (1/4, 1/3, 1/2, 2/3, 3/4)

**Key Things to Verify:**
- ✅ Responsive layout adapts correctly
- ✅ Touch targets are ≥ 44x44 points
- ✅ Text is readable at all sizes
- ✅ Design tokens match web app visually
- ✅ Navigation works on all device sizes

---

## Related Documentation

### React Native Specific
- [React Native Migration Guide](../REACT-NATIVE-MIGRATION-GUIDE.md) - Component porting patterns
- [Design System Documentation Guidelines](../../src/design-system/DOCUMENTATION_GUIDELINES.md) - Component docs standards

### Future Enhancements
- [Cross-View Date Synchronization](../future-enhancements/cross-view-date-synchronization.md) - Preserving date position across views

### Design System
- [Design System Export Prep](../DESIGN-SYSTEM-EXPORT-PREP.md)
- [Token System Comparison](../TOKEN-SYSTEM-COMPARISON.md)
- [Quick Token Reference](../QUICK-TOKEN-REFERENCE.md)

---

## Troubleshooting

### Metro Bundler Errors

```bash
# Clear cache
npx expo start --clear

# Reset cache and restart
rm -rf node_modules/.cache
npx expo start --clear
```

### Token Import Errors

```bash
# Make sure tokens are built
cd /path/to/project/root
npm run tokens:build:react-native

# Verify token files exist
ls src/design-system/tokens/build/react-native/
```

### Expo Go Version Mismatch

If you see version warnings:
```bash
# Update dependencies to match Expo Go version
npm install react-native-worklets@0.5.1
```

### Device Not Connecting

```bash
# Use tunnel mode if local network issues
npx expo start --tunnel

# Or try LAN mode
npx expo start --lan
```

---

## Next Steps

### Immediate (Phase 1)
1. Complete Pill component extraction
2. Build Month view 3-column layout
3. Build Quarter view with 3 months
4. Build Year view 12-month grid

### Near Term (Phase 2)
5. Integrate Supabase event fetching
6. Add event cards with outreach angles
7. Implement SegmentedControl for view switching
8. Add navigation between views

### Future (Phase 3)
9. Date position preservation across views
10. Offline caching
11. Dark mode support
12. Push notifications

---

## Naming Convention

This sample app is called **"React Native Clinic Planner"** to distinguish it from potential future sample apps that might demonstrate other aspects of the design system.

**Folder naming:** `react-native-demo` (kept generic for now, can be renamed to `clinic-planner` if needed)
