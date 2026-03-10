# Problems List Prototype — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a demo-ready problems list prototype inside a patient view shell for internal stakeholder review.

**Architecture:** Vite+React+TS app at `apps/carby-os/` with design system components copied from clinic-planner. Static patient shell wraps an interactive problems list with 4 sections (Conditions, Encounter Dx, SDOH, Health Concerns), filter pills, and inline card actions. All mock data, no backend.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind CSS, CVA (class-variance-authority), @carbon-health/design-tokens, @carbon-health/design-icons

**Design Spec:** `apps/carby-os/problems-list/docs/DESIGN-SPEC.md`
**PRD Reference:** `apps/carby-os/problems-list/reference/Patient Problem List PRD.md`
**Figma:** fileKey `Wm3cfzJvKzITMVvkxpX9mQ`, node `12953:13268`

---

## Task 1: Initialize Vite App

**Files:**
- Create: `apps/carby-os/package.json`
- Create: `apps/carby-os/vite.config.ts`
- Create: `apps/carby-os/tsconfig.json`
- Create: `apps/carby-os/tsconfig.app.json`
- Create: `apps/carby-os/index.html`
- Create: `apps/carby-os/src/main.tsx`
- Create: `apps/carby-os/src/App.tsx`

**Step 1: Scaffold the Vite app**

`apps/carby-os/package.json`:
```json
{
  "name": "carby-os",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite --port 3002",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.3.1",
    "lucide-react": "^0.511.0",
    "@carbon-health/design-tokens": "*",
    "@carbon-health/design-icons": "*"
  },
  "devDependencies": {
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "~5.7.2",
    "vite": "^6.0.5",
    "tailwindcss": "^3.4.17",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49"
  }
}
```

`apps/carby-os/vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

`apps/carby-os/tsconfig.json`:
```json
{
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }]
}
```

`apps/carby-os/tsconfig.app.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

`apps/carby-os/index.html`:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Carby OS — Problems List</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`apps/carby-os/src/main.tsx`:
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

`apps/carby-os/src/App.tsx`:
```typescript
export default function App() {
  return <div>Carby OS Prototype</div>
}
```

**Step 2: Install dependencies**

Run: `cd apps/carby-os && npm install` (from monorepo root: `npm install`)

**Step 3: Verify app starts**

Run: `cd apps/carby-os && npm run dev`
Expected: Vite dev server on port 3002, "Carby OS Prototype" visible in browser.

**Step 4: Commit**

```bash
git add apps/carby-os/package.json apps/carby-os/vite.config.ts apps/carby-os/tsconfig.json apps/carby-os/tsconfig.app.json apps/carby-os/index.html apps/carby-os/src/main.tsx apps/carby-os/src/App.tsx
git commit -m "Initialize Vite+React+TS app for carby-os prototypes"
```

---

## Task 2: Configure Tailwind + Design Tokens

**Files:**
- Create: `apps/carby-os/tailwind.config.js`
- Create: `apps/carby-os/postcss.config.js`
- Create: `apps/carby-os/src/index.css`

**Step 1: Create Tailwind config**

Copy the tailwind config from clinic-planner, adapting paths:

`apps/carby-os/postcss.config.js`:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

`apps/carby-os/tailwind.config.js`:
Copy from `apps/clinic-planner/tailwind.config.js` — this has all the token-based color, spacing, and radius mappings. Adjust the `content` path:

```javascript
// Copy clinic-planner/tailwind.config.js content, changing content paths to:
content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
```

**Step 2: Create index.css with token imports**

`apps/carby-os/src/index.css`:
```css
@import '../../../packages/design-tokens/dist/index.css';
@import '../../../packages/design-tokens/dist/text-styles-core.css';
@import '../../../packages/design-tokens/dist/text-styles-expressive.css';
@import '../../../packages/design-tokens/dist/elevation-utilities.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow: hidden;
}

#root {
  height: 100vh;
  width: 100vw;
}
```

**Step 3: Verify tokens load**

Update `App.tsx` temporarily to use a token color:
```typescript
export default function App() {
  return (
    <div className="h-screen w-screen bg-bg-neutral-base flex items-center justify-center">
      <span className="text-fg-neutral-primary text-lg font-semibold">
        Tokens Working
      </span>
    </div>
  )
}
```

Run: `npm run dev`
Expected: Page shows "Tokens Working" with correct neutral background and text colors.

**Step 4: Commit**

```bash
git add apps/carby-os/tailwind.config.js apps/carby-os/postcss.config.js apps/carby-os/src/index.css
git commit -m "Configure Tailwind CSS with design tokens for carby-os"
```

---

## Task 3: Copy Design System Components

**Files:**
- Create: `apps/carby-os/src/design-system/lib/utils.ts`
- Create: `apps/carby-os/src/design-system/components/Button.tsx`
- Create: `apps/carby-os/src/design-system/components/Card.tsx`
- Create: `apps/carby-os/src/design-system/components/Pill.tsx`
- Create: `apps/carby-os/src/design-system/components/TogglePill.tsx`
- Create: `apps/carby-os/src/design-system/components/SearchInput.tsx`
- Create: `apps/carby-os/src/design-system/components/Toast.tsx`
- Create: `apps/carby-os/src/design-system/components/SegmentedControl.tsx`
- Create: `apps/carby-os/src/design-system/index.ts`

**Step 1: Copy utility**

```bash
mkdir -p apps/carby-os/src/design-system/lib
mkdir -p apps/carby-os/src/design-system/components
cp apps/clinic-planner/design-system/lib/utils.ts apps/carby-os/src/design-system/lib/utils.ts
```

**Step 2: Copy components**

```bash
# Copy each component file
for comp in Button Card Pill TogglePill SearchInput Toast SegmentedControl; do
  cp "apps/clinic-planner/design-system/components/${comp}.tsx" \
     "apps/carby-os/src/design-system/components/${comp}.tsx"
done
```

**Step 3: Fix import paths in copied components**

All components import from `@/design-system/lib/utils` — update to `@/design-system/lib/utils` (should work with our Vite alias). Also check for any `@/design-system/components/` cross-imports.

Check each component for imports referencing:
- `@/design-system/lib/utils` → keep as-is (Vite alias `@` → `./src`)
- `@carbon-health/design-icons` → keep as-is (workspace dep)
- Any other `@/` imports → fix or remove if not needed

**Step 4: Create index barrel**

`apps/carby-os/src/design-system/index.ts`:
```typescript
export * from './components/Button'
export * from './components/Card'
export * from './components/Pill'
export * from './components/TogglePill'
export * from './components/SearchInput'
export * from './components/Toast'
export * from './components/SegmentedControl'
```

**Step 5: Verify components render**

Update `App.tsx` to test a component:
```typescript
import { Button, Pill, TogglePill } from '@/design-system'

export default function App() {
  return (
    <div className="h-screen w-screen bg-bg-neutral-subtle p-8 flex flex-col gap-4">
      <Button type="transparent" size="x-small" label="Confirm" />
      <Pill type="attention" size="small" label="Unconfirmed" />
      <TogglePill label="Active" selected={true} rightSubtext="2" onChange={() => {}} />
    </div>
  )
}
```

Run: `npm run dev`
Expected: Button, Pill, and TogglePill render with correct styling.

**Step 6: Commit**

```bash
git add apps/carby-os/src/design-system/
git commit -m "Copy design system components from clinic-planner"
```

---

## Task 4: Build Patient Shell (Static Wrapper)

**Files:**
- Create: `apps/carby-os/src/shell/mock-patient.ts`
- Create: `apps/carby-os/src/shell/IconNav.tsx`
- Create: `apps/carby-os/src/shell/EncounterSidebar.tsx`
- Create: `apps/carby-os/src/shell/PatientHeader.tsx`
- Create: `apps/carby-os/src/shell/TabBar.tsx`
- Create: `apps/carby-os/src/shell/PatientShell.tsx`

**Step 1: Create mock patient data**

`apps/carby-os/src/shell/mock-patient.ts`:
```typescript
export const mockPatient = {
  name: 'Maria Santos',
  age: 52,
  sex: 'Female',
  dob: '06/14/1973',
  insurance: 'Blue Cross PPO',
  insuredName: 'Maria Santos',
  pcp: 'Dr. Sarah Chen, MD',
  patientId: '2847391',
  phone: '(415) 555-0142',
  email: 'm.santos@email.com',
  address: '1847 Mission St, San Francisco, CA',
  accountStatus: 'User Account',
  devices: 'No Active Devices',
  privacyNotice: true,
  selfPay: false,
  flags: [] as string[],
}

export const mockAppointment = {
  time: '10:30 AM PDT',
  date: 'March 9, 2026',
  provider: 'Albert Chong, PA-C',
  clinic: 'Carbon Health — SoMa',
  reason: 'Follow-up, Type 2 Diabetes',
  appointmentId: '19284756',
  checkinTime: '3/9/2026 10:22:08 AM PDT',
  triageTime: '3/9/2026 10:28:11 AM PDT',
}
```

**Step 2: Build IconNav**

`apps/carby-os/src/shell/IconNav.tsx`:
Static vertical icon strip on the far left. Use Lucide icons for recognizable shapes. No interactivity.

```typescript
import { LayoutGrid, Calendar, MessageCircle, Users, CheckCircle, Settings } from 'lucide-react'

const navItems = [
  { icon: LayoutGrid, label: 'Dashboard' },
  { icon: Calendar, label: 'Calendar' },
  { icon: MessageCircle, label: 'Messages' },
  { icon: Users, label: 'Patients' },
  { icon: CheckCircle, label: 'Tasks', badge: 5 },
  { icon: Settings, label: 'Settings', alert: true },
]

export function IconNav() {
  return (
    <nav className="w-[52px] h-full bg-white border-r border-bg-transparent-low flex flex-col items-center py-3 gap-4">
      {/* Carbon logo placeholder */}
      <div className="w-8 h-8 rounded-lg bg-bg-accent-medium flex items-center justify-center mb-2">
        <span className="text-white text-xs font-bold">C</span>
      </div>
      {navItems.map(({ icon: Icon, label, badge, alert }) => (
        <div key={label} className="relative w-8 h-8 flex items-center justify-center rounded-lg text-fg-neutral-secondary cursor-default">
          <Icon size={20} />
          {badge && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-bg-accent-medium text-white text-[10px] font-bold flex items-center justify-center">
              {badge}
            </span>
          )}
          {alert && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-bg-alert-high" />
          )}
        </div>
      ))}
    </nav>
  )
}
```

**Step 3: Build EncounterSidebar**

`apps/carby-os/src/shell/EncounterSidebar.tsx`:
Static left sidebar with visit info and workflow steps. Matches Figma screenshot layout.

```typescript
import { mockPatient, mockAppointment } from './mock-patient'
import { X, ChevronDown, ChevronUp, CircleCheck, Circle, ClipboardList } from 'lucide-react'

export function EncounterSidebar() {
  return (
    <aside className="w-[440px] h-full border-r border-bg-transparent-low bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-bg-transparent-low">
        <div className="flex items-center gap-3 mb-2">
          <X size={20} className="text-fg-accent-primary cursor-default" />
          <span className="text-fg-neutral-primary font-semibold text-sm flex-1">
            {mockPatient.name}, {mockAppointment.time}
          </span>
          <span className="text-fg-neutral-secondary">•••</span>
        </div>
        <div className="text-xs text-fg-neutral-secondary space-y-0.5 pl-8">
          <div>DEMO — {mockAppointment.clinic}</div>
          <div>{mockAppointment.provider}</div>
          <div className="font-semibold text-fg-neutral-primary">{mockAppointment.reason}</div>
          <div>Appointment ID: {mockAppointment.appointmentId}</div>
        </div>
        <button className="mt-3 ml-8 w-[calc(100%-32px)] py-2 border border-bg-transparent-low rounded-full text-sm text-fg-accent-primary font-medium cursor-default">
          → Today's chart
        </button>
      </div>

      {/* Workflow Steps */}
      <div className="flex-1 overflow-auto px-5 py-3">
        {/* Check-in */}
        <SidebarSection label="Check-in" detail={mockAppointment.checkinTime} count="3/7" open={false} />
        {/* Triage */}
        <SidebarSection label="Triage" detail={mockAppointment.triageTime} count="0/5" open={false} />
        {/* Evaluation */}
        <SidebarSection label="Evaluation" count="1/1" open>
          <SidebarItem icon="check" label="Reconcile problems" hasChevron />
        </SidebarSection>
        {/* Orders */}
        <SidebarSection label="Orders" count="0/0" open>
          <div className="text-sm text-fg-neutral-secondary py-2">No orders yet.</div>
        </SidebarSection>
        {/* Visit Details */}
        <SidebarSection label="Visit Details" count="0/4" open>
          <SidebarItem icon="clipboard" label="Choose appt type (CPT)" hasChevron />
          <SidebarItem icon="check" label="Assign billing provider" detail={mockAppointment.provider} hasChevron />
          <SidebarItem icon="circle" label="Assign supervisor" hasChevron />
          <SidebarItem icon="clipboard" label="Scribe Sign Off" hasChevron />
        </SidebarSection>
      </div>

      {/* Finish visit button */}
      <div className="px-5 py-4 border-t border-bg-transparent-low flex items-center gap-3">
        <button className="px-6 py-2 rounded-full bg-bg-positive-medium text-white text-sm font-semibold cursor-default">
          Finish visit
        </button>
        <span className="text-sm text-fg-neutral-secondary">5 minutes</span>
      </div>
    </aside>
  )
}

function SidebarSection({ label, detail, count, open, children }: {
  label: string; detail?: string; count: string; open?: boolean; children?: React.ReactNode
}) {
  const Chevron = open ? ChevronUp : ChevronDown
  return (
    <div className="border-b border-bg-transparent-low py-3">
      <div className="flex items-center justify-between cursor-default">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-fg-neutral-primary">{label}</span>
          {detail && <span className="text-xs text-fg-neutral-secondary">{detail}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-fg-neutral-secondary">{count}</span>
          <Chevron size={16} className="text-fg-neutral-secondary" />
        </div>
      </div>
      {open && children && <div className="mt-2 space-y-1">{children}</div>}
    </div>
  )
}

function SidebarItem({ icon, label, detail, hasChevron }: {
  icon: 'check' | 'circle' | 'clipboard'; label: string; detail?: string; hasChevron?: boolean
}) {
  const IconComp = icon === 'check' ? CircleCheck : icon === 'clipboard' ? ClipboardList : Circle
  const iconColor = icon === 'check' ? 'text-fg-positive-primary' : 'text-fg-accent-primary'
  return (
    <div className="flex items-center gap-3 py-2 cursor-default">
      <IconComp size={20} className={iconColor} />
      <span className="text-sm text-fg-neutral-primary flex-1">{label}</span>
      {detail && <span className="text-sm text-fg-neutral-secondary">{detail}</span>}
      {hasChevron && <span className="text-fg-neutral-secondary text-xs">›</span>}
    </div>
  )
}
```

**Step 4: Build PatientHeader**

`apps/carby-os/src/shell/PatientHeader.tsx`:
Patient demographics bar at top of right pane.

```typescript
import { mockPatient } from './mock-patient'
import { Phone, Mail, CreditCard, MapPin, Stethoscope, Video, Calendar } from 'lucide-react'

export function PatientHeader() {
  return (
    <header className="px-6 pt-4 pb-3 bg-white">
      {/* Row 1: Name + actions */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <h1 className="text-xl font-semibold text-fg-neutral-primary">{mockPatient.name}</h1>
          <p className="text-sm text-fg-neutral-secondary">
            {mockPatient.age} year old {mockPatient.sex.toLowerCase()}, <span className="text-fg-neutral-secondary">{mockPatient.dob}</span>
          </p>
          <p className="text-sm text-fg-neutral-secondary">
            Insured name: {mockPatient.insuredName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-fg-neutral-secondary cursor-default">🏷</span>
          <span className="text-fg-neutral-secondary cursor-default">📄</span>
          <span className="text-fg-neutral-secondary cursor-default">•••</span>
        </div>
      </div>

      {/* Row 2: Metadata badges */}
      <div className="flex items-center gap-1 text-xs text-fg-neutral-secondary mb-2 flex-wrap">
        <span>Patient ID: {mockPatient.patientId}</span>
        <span className="mx-1">|</span>
        <span className="flex items-center gap-1">✓ {mockPatient.accountStatus}</span>
        <span className="mx-1">|</span>
        <span className="flex items-center gap-1">● {mockPatient.devices}</span>
        <span className="mx-1">|</span>
        <span className="flex items-center gap-1">✓ Privacy notice signed</span>
      </div>

      {/* Row 3: Contact info */}
      <div className="flex items-center gap-4 text-xs flex-wrap">
        <span className="flex items-center gap-1 text-fg-accent-primary">
          <Phone size={12} /> {mockPatient.phone}
        </span>
        <span className="flex items-center gap-1 text-fg-accent-primary">
          <Mail size={12} /> {mockPatient.email}
        </span>
        <span className="flex items-center gap-1 text-fg-alert-primary">
          <CreditCard size={12} /> {mockPatient.insurance}
        </span>
        <span className="flex items-center gap-1 text-fg-alert-primary">
          🏥 None
        </span>
        <span className="flex items-center gap-1 text-fg-accent-primary">
          <Calendar size={12} /> Schedule appointment
        </span>
        <span className="flex items-center gap-1 text-fg-alert-primary">
          <MapPin size={12} /> {mockPatient.address}
        </span>
        <span className="flex items-center gap-1 text-fg-neutral-secondary">
          <Stethoscope size={12} /> {mockPatient.pcp || 'No PCP'}
        </span>
        <span className="flex items-center gap-1 text-fg-accent-primary">
          <Video size={12} /> Video call
        </span>
      </div>
    </header>
  )
}
```

**Step 5: Build TabBar**

`apps/carby-os/src/shell/TabBar.tsx`:
```typescript
const tabs = [
  'Medical History',
  'Problems List',
  'Cases',
  'Vitals',
  'Medications',
  'Care Adherence',
  'Tasks',
]

export function TabBar({ activeTab }: { activeTab: string }) {
  return (
    <div className="flex border-b border-bg-transparent-low bg-white px-6">
      {tabs.map((tab) => {
        const isActive = tab === activeTab
        return (
          <button
            key={tab}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap cursor-default transition-colors ${
              isActive
                ? 'text-fg-accent-primary border-b-2 border-fg-accent-primary'
                : 'text-fg-neutral-secondary'
            }`}
          >
            {tab}
          </button>
        )
      })}
    </div>
  )
}
```

**Step 6: Build PatientShell**

`apps/carby-os/src/shell/PatientShell.tsx`:
```typescript
import { IconNav } from './IconNav'
import { EncounterSidebar } from './EncounterSidebar'
import { PatientHeader } from './PatientHeader'
import { TabBar } from './TabBar'

export function PatientShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full flex bg-white">
      {/* Left icon nav */}
      <IconNav />

      {/* Encounter sidebar */}
      <EncounterSidebar />

      {/* Right pane: patient header + tabs + content */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <PatientHeader />
        <TabBar activeTab="Problems List" />
        <div className="flex-1 overflow-auto bg-bg-neutral-subtle">
          {children}
        </div>
      </div>
    </div>
  )
}
```

**Step 7: Wire up App.tsx**

`apps/carby-os/src/App.tsx`:
```typescript
import { PatientShell } from '@/shell/PatientShell'

export default function App() {
  return (
    <PatientShell>
      <div className="p-6 text-fg-neutral-secondary text-sm">
        Problems List content goes here
      </div>
    </PatientShell>
  )
}
```

**Step 8: Verify shell renders**

Run: `npm run dev`
Expected: Full patient shell layout visible — icon nav, sidebar, patient header, tab bar with "Problems List" highlighted, placeholder content area.

**Step 9: Commit**

```bash
git add apps/carby-os/src/shell/
git commit -m "Build static patient view shell for carby-os prototype"
```

---

## Task 5: Define Types + Mock Data

**Files:**
- Create: `apps/carby-os/src/features/problems-list/types.ts`
- Create: `apps/carby-os/src/features/problems-list/mock-data.ts`

**Step 1: Define types**

`apps/carby-os/src/features/problems-list/types.ts`:
```typescript
export type ProblemCategory = 'condition' | 'encounter-dx' | 'sdoh' | 'health-concern'

export type VerificationStatus = 'unconfirmed' | 'confirmed' | 'excluded' | 'entered-in-error'

export type ClinicalStatus = 'active' | 'inactive' | 'recurrence' | 'resolved'

export type ProblemSource = 'reported' | 'diagnosed' | 'screened' | 'imported'

export type Severity = 'mild' | 'moderate' | 'severe'

export interface ProblemItem {
  id: string
  category: ProblemCategory
  description: string
  icdCode: string | null
  snomedCode: string | null
  verificationStatus: VerificationStatus
  clinicalStatus: ClinicalStatus
  source: ProblemSource
  sourceDate: string
  severity?: Severity
  onsetDate?: string
  resolvedDate?: string
}

export interface ScreeningInstrument {
  id: string
  name: string
  abbreviation: string
}

export type FilterKey = 'all' | 'unconfirmed' | 'active' | 'inactive' | 'confirmed' | 'excluded'
```

**Step 2: Create mock data**

`apps/carby-os/src/features/problems-list/mock-data.ts`:
```typescript
import type { ProblemItem, ScreeningInstrument } from './types'

export const mockProblems: ProblemItem[] = [
  // === Conditions (6) ===
  {
    id: 'cond-1',
    category: 'condition',
    description: 'Type 2 Diabetes Mellitus',
    icdCode: 'E11.9',
    snomedCode: '44054006',
    verificationStatus: 'confirmed',
    clinicalStatus: 'active',
    source: 'diagnosed',
    sourceDate: '03/15/22',
    severity: 'moderate',
  },
  {
    id: 'cond-2',
    category: 'condition',
    description: 'Essential Hypertension',
    icdCode: 'I10',
    snomedCode: '59621000',
    verificationStatus: 'confirmed',
    clinicalStatus: 'active',
    source: 'diagnosed',
    sourceDate: '01/08/20',
  },
  {
    id: 'cond-3',
    category: 'condition',
    description: 'Chronic Low Back Pain',
    icdCode: 'M54.5',
    snomedCode: '278860009',
    verificationStatus: 'unconfirmed',
    clinicalStatus: 'active',
    source: 'reported',
    sourceDate: '11/20/25',
  },
  {
    id: 'cond-4',
    category: 'condition',
    description: 'Asthma, Mild Persistent',
    icdCode: 'J45.30',
    snomedCode: '195967001',
    verificationStatus: 'confirmed',
    clinicalStatus: 'inactive',
    source: 'diagnosed',
    sourceDate: '06/02/18',
    resolvedDate: '09/15/23',
  },
  {
    id: 'cond-5',
    category: 'condition',
    description: 'Hypothyroidism, Unspecified',
    icdCode: 'E03.9',
    snomedCode: '40930008',
    verificationStatus: 'confirmed',
    clinicalStatus: 'active',
    source: 'imported',
    sourceDate: '09/14/24',
  },
  {
    id: 'cond-6',
    category: 'condition',
    description: 'Obesity, BMI 30.0-34.9',
    icdCode: 'E66.01',
    snomedCode: '408512008',
    verificationStatus: 'unconfirmed',
    clinicalStatus: 'active',
    source: 'reported',
    sourceDate: '02/28/26',
  },

  // === Encounter Dx (3) ===
  {
    id: 'enc-1',
    category: 'encounter-dx',
    description: 'Acute Sinusitis, Unspecified',
    icdCode: 'J01.90',
    snomedCode: '15805002',
    verificationStatus: 'confirmed',
    clinicalStatus: 'active',
    source: 'diagnosed',
    sourceDate: '03/09/26',
  },
  {
    id: 'enc-2',
    category: 'encounter-dx',
    description: 'Urinary Tract Infection, Site Not Specified',
    icdCode: 'N39.0',
    snomedCode: '68566005',
    verificationStatus: 'confirmed',
    clinicalStatus: 'active',
    source: 'diagnosed',
    sourceDate: '01/15/26',
  },
  {
    id: 'enc-3',
    category: 'encounter-dx',
    description: 'Vitamin D Deficiency',
    icdCode: 'E55.9',
    snomedCode: '34713006',
    verificationStatus: 'unconfirmed',
    clinicalStatus: 'active',
    source: 'reported',
    sourceDate: '03/09/26',
  },

  // === SDOH (3) ===
  {
    id: 'sdoh-1',
    category: 'sdoh',
    description: 'Food Insecurity',
    icdCode: 'Z59.48',
    snomedCode: '733423003',
    verificationStatus: 'unconfirmed',
    clinicalStatus: 'active',
    source: 'screened',
    sourceDate: '02/10/26',
  },
  {
    id: 'sdoh-2',
    category: 'sdoh',
    description: 'Transportation Insecurity',
    icdCode: 'Z59.82',
    snomedCode: '551411000124101',
    verificationStatus: 'confirmed',
    clinicalStatus: 'active',
    source: 'screened',
    sourceDate: '02/10/26',
  },
  {
    id: 'sdoh-3',
    category: 'sdoh',
    description: 'Financial Strain',
    icdCode: 'Z59.86',
    snomedCode: '454061000124102',
    verificationStatus: 'unconfirmed',
    clinicalStatus: 'active',
    source: 'screened',
    sourceDate: '02/10/26',
  },

  // === Health Concerns (3) ===
  {
    id: 'hc-1',
    category: 'health-concern',
    description: 'Weight Management Goal',
    icdCode: null,
    snomedCode: null,
    verificationStatus: 'confirmed',
    clinicalStatus: 'active',
    source: 'reported',
    sourceDate: '01/05/26',
  },
  {
    id: 'hc-2',
    category: 'health-concern',
    description: 'Smoking Cessation',
    icdCode: null,
    snomedCode: null,
    verificationStatus: 'unconfirmed',
    clinicalStatus: 'active',
    source: 'reported',
    sourceDate: '12/12/25',
  },
  {
    id: 'hc-3',
    category: 'health-concern',
    description: 'Anxiety',
    icdCode: null,
    snomedCode: null,
    verificationStatus: 'confirmed',
    clinicalStatus: 'resolved',
    source: 'reported',
    sourceDate: '08/20/24',
    resolvedDate: '11/30/25',
  },
]

export const screeningInstruments: ScreeningInstrument[] = [
  { id: 'si-1', name: 'AHC HRSN Screening Tool', abbreviation: 'AHC-HRSN' },
  { id: 'si-2', name: 'PRAPARE', abbreviation: 'PRAPARE' },
]
```

**Step 3: Commit**

```bash
git add apps/carby-os/src/features/problems-list/types.ts apps/carby-os/src/features/problems-list/mock-data.ts
git commit -m "Define problem list types and mock data (15 items, 4 categories)"
```

---

## Task 6: Build useProblemsState Hook

**Files:**
- Create: `apps/carby-os/src/features/problems-list/hooks/useProblemsState.ts`

**Step 1: Create the state hook**

`apps/carby-os/src/features/problems-list/hooks/useProblemsState.ts`:
```typescript
import { useState, useMemo, useCallback } from 'react'
import type { ProblemItem, FilterKey, VerificationStatus, ClinicalStatus, ProblemCategory } from '../types'
import { mockProblems } from '../mock-data'

interface FilterCounts {
  unconfirmed: number
  active: number
  inactive: number
  confirmed: number
  excluded: number
}

export function useProblemsState() {
  const [items, setItems] = useState<ProblemItem[]>(mockProblems)
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(new Set(['all']))

  // Compute filter counts across all items
  const filterCounts = useMemo<FilterCounts>(() => ({
    unconfirmed: items.filter(i => i.verificationStatus === 'unconfirmed').length,
    active: items.filter(i => i.clinicalStatus === 'active').length,
    inactive: items.filter(i => i.clinicalStatus === 'inactive' || i.clinicalStatus === 'resolved').length,
    confirmed: items.filter(i => i.verificationStatus === 'confirmed').length,
    excluded: items.filter(i => i.verificationStatus === 'excluded').length,
  }), [items])

  // Toggle a filter
  const toggleFilter = useCallback((filter: FilterKey) => {
    setActiveFilters(prev => {
      const next = new Set(prev)
      if (filter === 'all') {
        return new Set(['all'])
      }
      next.delete('all')
      if (next.has(filter)) {
        next.delete(filter)
        if (next.size === 0) return new Set(['all'])
      } else {
        next.add(filter)
      }
      return next
    })
  }, [])

  // Filter items by active filters
  const matchesFilter = useCallback((item: ProblemItem): boolean => {
    if (activeFilters.has('all')) return true
    for (const filter of activeFilters) {
      switch (filter) {
        case 'unconfirmed': if (item.verificationStatus === 'unconfirmed') return true; break
        case 'active': if (item.clinicalStatus === 'active') return true; break
        case 'inactive': if (item.clinicalStatus === 'inactive' || item.clinicalStatus === 'resolved') return true; break
        case 'confirmed': if (item.verificationStatus === 'confirmed') return true; break
        case 'excluded': if (item.verificationStatus === 'excluded') return true; break
      }
    }
    return false
  }, [activeFilters])

  // Get items for a specific category, filtered
  const getFilteredItems = useCallback((category: ProblemCategory): ProblemItem[] => {
    return items.filter(i => i.category === category && matchesFilter(i))
  }, [items, matchesFilter])

  // Actions
  const updateItem = useCallback((id: string, updates: Partial<Pick<ProblemItem, 'verificationStatus' | 'clinicalStatus'>>) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ))
  }, [])

  const confirmItem = useCallback((id: string) => {
    updateItem(id, { verificationStatus: 'confirmed', clinicalStatus: 'active' })
  }, [updateItem])

  const excludeItem = useCallback((id: string) => {
    updateItem(id, { verificationStatus: 'excluded' })
  }, [updateItem])

  const markActive = useCallback((id: string) => {
    updateItem(id, { clinicalStatus: 'active' })
  }, [updateItem])

  const markInactive = useCallback((id: string) => {
    updateItem(id, { clinicalStatus: 'inactive' })
  }, [updateItem])

  const markResolved = useCallback((id: string) => {
    updateItem(id, { clinicalStatus: 'resolved' })
  }, [updateItem])

  const reopenItem = useCallback((id: string) => {
    updateItem(id, { clinicalStatus: 'active' })
  }, [updateItem])

  return {
    items,
    activeFilters,
    filterCounts,
    toggleFilter,
    getFilteredItems,
    confirmItem,
    excludeItem,
    markActive,
    markInactive,
    markResolved,
    reopenItem,
  }
}
```

**Step 2: Commit**

```bash
git add apps/carby-os/src/features/problems-list/hooks/
git commit -m "Add useProblemsState hook with filter and action logic"
```

---

## Task 7: Build ProblemCard Component

**Files:**
- Create: `apps/carby-os/src/features/problems-list/ProblemCard.tsx`

**Step 1: Create card component**

`apps/carby-os/src/features/problems-list/ProblemCard.tsx`:
```typescript
import { ChevronRight } from 'lucide-react'
import { Pill } from '@/design-system'
import type { ProblemItem } from './types'

interface ProblemCardProps {
  item: ProblemItem
  onConfirm?: (id: string) => void
  onExclude?: (id: string) => void
  onMarkActive?: (id: string) => void
  onMarkInactive?: (id: string) => void
  onMarkResolved?: (id: string) => void
  onReopen?: (id: string) => void
  onDetailClick?: (id: string) => void
}

function ActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className="px-3 py-1.5 rounded-full bg-bg-transparent-low backdrop-blur-xl text-xs font-semibold text-fg-neutral-primary whitespace-nowrap hover:bg-bg-transparent-medium transition-colors"
    >
      {label}
    </button>
  )
}

function getSourceLabel(source: ProblemItem['source']): string {
  switch (source) {
    case 'reported': return 'Reported'
    case 'diagnosed': return 'Diagnosed'
    case 'screened': return 'Screened'
    case 'imported': return 'Imported'
  }
}

export function ProblemCard({
  item,
  onConfirm,
  onExclude,
  onMarkActive,
  onMarkInactive,
  onMarkResolved,
  onReopen,
  onDetailClick,
}: ProblemCardProps) {
  const actions = getActions(item)

  return (
    <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-2">
      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {/* Description */}
        <p className="text-sm font-medium text-fg-neutral-primary">
          {item.description}
        </p>
        {/* Pill row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Verification status pill (only if unconfirmed) */}
          {item.verificationStatus === 'unconfirmed' && (
            <Pill type="attention" size="x-small" label="Unconfirmed" />
          )}
          {/* Clinical status pill (for non-active confirmed items) */}
          {item.verificationStatus === 'confirmed' && item.clinicalStatus !== 'active' && (
            <Pill type="transparent" size="x-small" label={capitalizeFirst(item.clinicalStatus)} />
          )}
          {/* Excluded pill */}
          {item.verificationStatus === 'excluded' && (
            <Pill type="transparent" size="x-small" label="Excluded" />
          )}
          {/* ICD code pill */}
          {item.icdCode && (
            <Pill type="transparent" size="x-small" label={item.icdCode} />
          )}
          {/* Source + date pill */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-bg-transparent-low">
            <span className="text-xs text-fg-neutral-secondary">{getSourceLabel(item.source)}</span>
            <span className="text-xs font-medium text-fg-neutral-primary">{item.sourceDate}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {actions.map(action => (
          <ActionButton
            key={action.label}
            label={action.label}
            onClick={() => action.handler(item.id)}
          />
        ))}
        <button
          onClick={() => onDetailClick?.(item.id)}
          className="w-5 h-5 flex items-center justify-center text-fg-neutral-secondary"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )

  function getActions(item: ProblemItem): Array<{ label: string; handler: (id: string) => void }> {
    const actions: Array<{ label: string; handler: (id: string) => void }> = []

    if (item.verificationStatus === 'unconfirmed') {
      if (onExclude) actions.push({ label: 'Exclude', handler: onExclude })
      if (onConfirm) actions.push({ label: 'Confirm', handler: onConfirm })
    } else if (item.verificationStatus === 'confirmed') {
      if (item.clinicalStatus === 'resolved' && item.category === 'health-concern') {
        if (onReopen) actions.push({ label: 'Reopen', handler: onReopen })
      } else if (item.category === 'sdoh' && item.clinicalStatus === 'active') {
        if (onMarkResolved) actions.push({ label: 'Update', handler: () => {} }) // placeholder
        if (onMarkResolved) actions.push({ label: 'Mark Addressed', handler: onMarkResolved })
      } else {
        if (onMarkInactive && item.clinicalStatus === 'active') {
          actions.push({ label: 'Mark Inactive', handler: onMarkInactive })
        }
        if (onMarkActive && (item.clinicalStatus === 'inactive' || item.clinicalStatus === 'active')) {
          actions.push({ label: 'Mark Active', handler: onMarkActive })
        }
      }
    }

    return actions
  }
}

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
```

**Step 2: Commit**

```bash
git add apps/carby-os/src/features/problems-list/ProblemCard.tsx
git commit -m "Add ProblemCard component with state-dependent actions"
```

---

## Task 8: Build FilterBar, ProblemSection, ScreeningInstruments

**Files:**
- Create: `apps/carby-os/src/features/problems-list/FilterBar.tsx`
- Create: `apps/carby-os/src/features/problems-list/ProblemSection.tsx`
- Create: `apps/carby-os/src/features/problems-list/ScreeningInstruments.tsx`

**Step 1: FilterBar**

`apps/carby-os/src/features/problems-list/FilterBar.tsx`:
```typescript
import { TogglePill } from '@/design-system'
import type { FilterKey } from './types'

interface FilterBarProps {
  activeFilters: Set<FilterKey>
  counts: {
    unconfirmed: number
    active: number
    inactive: number
    confirmed: number
    excluded: number
  }
  onToggle: (filter: FilterKey) => void
}

const filters: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'unconfirmed', label: 'Unconfirmed' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'excluded', label: 'Excluded' },
]

export function FilterBar({ activeFilters, counts, onToggle }: FilterBarProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap sticky top-0 z-10 bg-bg-neutral-subtle py-1">
      {filters.map(({ key, label }) => {
        const count = key !== 'all' ? counts[key] : undefined
        const selected = activeFilters.has(key)
        return (
          <TogglePill
            key={key}
            label={label}
            selected={selected}
            rightSubtext={count !== undefined && count > 0 ? String(count) : undefined}
            onChange={() => onToggle(key)}
            size="small"
          />
        )
      })}
    </div>
  )
}
```

**Step 2: ProblemSection**

`apps/carby-os/src/features/problems-list/ProblemSection.tsx`:
```typescript
import { useState } from 'react'
import { ChevronUp, ChevronDown, Info } from 'lucide-react'
import type { ProblemItem } from './types'
import { ProblemCard } from './ProblemCard'

interface ProblemSectionProps {
  title: string
  items: ProblemItem[]
  rightLabel?: string
  actions?: Array<{ label: string; onClick: () => void }>
  onConfirm: (id: string) => void
  onExclude: (id: string) => void
  onMarkActive: (id: string) => void
  onMarkInactive: (id: string) => void
  onMarkResolved: (id: string) => void
  onReopen: (id: string) => void
  onDetailClick: (id: string) => void
  children?: React.ReactNode
}

export function ProblemSection({
  title,
  items,
  rightLabel,
  actions = [],
  onConfirm,
  onExclude,
  onMarkActive,
  onMarkInactive,
  onMarkResolved,
  onReopen,
  onDetailClick,
  children,
}: ProblemSectionProps) {
  const [collapsed, setCollapsed] = useState(false)
  const Chevron = collapsed ? ChevronDown : ChevronUp

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold text-fg-neutral-secondary flex-1">{title}</h3>
        {rightLabel && (
          <div className="flex items-center gap-2 flex-1">
            <span className="text-sm text-fg-neutral-secondary text-right flex-1">{rightLabel}</span>
          </div>
        )}
        {actions.map(({ label, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="px-3 py-0.5 rounded-full bg-bg-transparent-low text-xs font-semibold text-fg-neutral-primary cursor-pointer hover:bg-bg-transparent-medium transition-colors"
          >
            {label}
          </button>
        ))}
        <button onClick={() => setCollapsed(!collapsed)} className="w-5 h-5 flex items-center justify-center text-fg-neutral-secondary">
          <Chevron size={16} />
        </button>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="flex flex-col gap-2">
          {children}
          {items.map(item => (
            <ProblemCard
              key={item.id}
              item={item}
              onConfirm={onConfirm}
              onExclude={onExclude}
              onMarkActive={onMarkActive}
              onMarkInactive={onMarkInactive}
              onMarkResolved={onMarkResolved}
              onReopen={onReopen}
              onDetailClick={onDetailClick}
            />
          ))}
          {items.length === 0 && !children && (
            <p className="text-sm text-fg-neutral-secondary py-2">No items match current filters.</p>
          )}
        </div>
      )}
    </div>
  )
}
```

**Step 3: ScreeningInstruments**

`apps/carby-os/src/features/problems-list/ScreeningInstruments.tsx`:
```typescript
import { ClipboardPen } from 'lucide-react'
import type { ScreeningInstrument } from './types'

interface ScreeningInstrumentsProps {
  instruments: ScreeningInstrument[]
}

export function ScreeningInstruments({ instruments }: ScreeningInstrumentsProps) {
  return (
    <div className="flex items-center gap-2 py-2">
      {instruments.map(inst => (
        <div key={inst.id} className="flex items-center gap-2 bg-white rounded-lg px-4 py-3 flex-1 min-w-0">
          <ClipboardPen size={16} className="text-fg-neutral-secondary shrink-0" />
          <span className="text-sm font-medium text-fg-neutral-primary truncate">{inst.name}</span>
        </div>
      ))}
      <div className="bg-white rounded-lg px-4 py-3 shrink-0">
        <span className="text-sm font-medium text-fg-neutral-primary">+2 More</span>
      </div>
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add apps/carby-os/src/features/problems-list/FilterBar.tsx apps/carby-os/src/features/problems-list/ProblemSection.tsx apps/carby-os/src/features/problems-list/ScreeningInstruments.tsx
git commit -m "Add FilterBar, ProblemSection, and ScreeningInstruments components"
```

---

## Task 9: Build ProblemsListView + Wire Everything

**Files:**
- Create: `apps/carby-os/src/features/problems-list/ProblemsListView.tsx`
- Modify: `apps/carby-os/src/App.tsx`

**Step 1: Create ProblemsListView**

`apps/carby-os/src/features/problems-list/ProblemsListView.tsx`:
```typescript
import { useProblemsState } from './hooks/useProblemsState'
import { FilterBar } from './FilterBar'
import { ProblemSection } from './ProblemSection'
import { ScreeningInstruments } from './ScreeningInstruments'
import { screeningInstruments } from './mock-data'

interface ProblemsListViewProps {
  mode?: 'tab' | 'drawer'
}

export function ProblemsListView({ mode = 'tab' }: ProblemsListViewProps) {
  const {
    activeFilters,
    filterCounts,
    toggleFilter,
    getFilteredItems,
    confirmItem,
    excludeItem,
    markActive,
    markInactive,
    markResolved,
    reopenItem,
  } = useProblemsState()

  const conditions = getFilteredItems('condition')
  const encounterDx = getFilteredItems('encounter-dx')
  const sdoh = getFilteredItems('sdoh')
  const healthConcerns = getFilteredItems('health-concern')

  const sharedHandlers = {
    onConfirm: confirmItem,
    onExclude: excludeItem,
    onMarkActive: markActive,
    onMarkInactive: markInactive,
    onMarkResolved: markResolved,
    onReopen: reopenItem,
    onDetailClick: (id: string) => {
      // Phase 2: open detail drawer
      console.log('Detail view for:', id)
    },
  }

  const handleAddPlaceholder = () => {
    // Placeholder — search powered by CMS ICD-10-CM in production
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-3 h-full overflow-auto">
      <FilterBar
        activeFilters={activeFilters}
        counts={filterCounts}
        onToggle={toggleFilter}
      />

      <div className="flex flex-col gap-6">
        {/* Conditions */}
        <ProblemSection
          title="Conditions"
          items={conditions}
          actions={[{ label: 'Add', onClick: handleAddPlaceholder }]}
          {...sharedHandlers}
        />

        {/* Encounter Dx */}
        <ProblemSection
          title="Encounter Dx"
          items={encounterDx}
          rightLabel="Automatically imported"
          {...sharedHandlers}
        />

        {/* Social Determinants */}
        <ProblemSection
          title="Social Determinants"
          items={sdoh}
          actions={[
            { label: 'Administer Screening', onClick: handleAddPlaceholder },
            { label: 'Add', onClick: handleAddPlaceholder },
          ]}
          {...sharedHandlers}
        >
          <ScreeningInstruments instruments={screeningInstruments} />
        </ProblemSection>

        {/* Health Concerns */}
        <ProblemSection
          title="Health Concerns"
          items={healthConcerns}
          actions={[{ label: 'Add', onClick: handleAddPlaceholder }]}
          {...sharedHandlers}
        />
      </div>
    </div>
  )
}
```

**Step 2: Wire App.tsx**

`apps/carby-os/src/App.tsx`:
```typescript
import { PatientShell } from '@/shell/PatientShell'
import { ProblemsListView } from '@/features/problems-list/ProblemsListView'

export default function App() {
  return (
    <PatientShell>
      <ProblemsListView />
    </PatientShell>
  )
}
```

**Step 3: Verify everything works**

Run: `npm run dev`
Expected:
- Patient shell renders with all chrome
- Problems List tab is active
- All 4 sections visible with correct mock data
- Filter pills toggle and filter items
- Card actions (Confirm, Exclude, Mark Active, Mark Inactive, Reopen, Mark Addressed) update card state
- Counts on filter pills update after actions
- Sections collapse/expand

**Step 4: Commit**

```bash
git add apps/carby-os/src/features/problems-list/ProblemsListView.tsx apps/carby-os/src/App.tsx
git commit -m "Wire ProblemsListView into patient shell with full interactivity"
```

---

## Task 10: Visual Polish Pass

**Files:**
- Modify: Various files for spacing, colors, and typography adjustments

**Step 1: Compare against Figma**

Open Figma (node 12953:13268) side-by-side with the running prototype. Check:
- Card padding/spacing matches (px-16 py-12 = px-4 py-3)
- Pill colors match (attention yellow, transparent gray)
- Section header typography (16px semibold, #424242)
- Filter pill styling (teal active, outlined inactive)
- Button styling (transparent bg, round, 12px semibold)
- Overall background (#f1f1f1)

**Step 2: Adjust any mismatches**

Fine-tune CSS classes to match Figma specs. Key values from Design Spec §6:
- Card: `bg-white rounded-2xl px-4 py-3` (16px radius per Figma = rounded-2xl in Tailwind)
- Section gap: `gap-6` (24px)
- Card gap: `gap-2` (8px)
- Content padding: `px-5` (20px)

**Step 3: Commit**

```bash
git add -A
git commit -m "Visual polish pass — align spacing and colors with Figma"
```

---

## Task 11: Update Progress Tracker

**Files:**
- Modify: `apps/carby-os/problems-list/docs/PROGRESS.md`

**Step 1: Update PROGRESS.md**

Mark Phase 1-3 as complete, Phase 4 as waiting for Figma.

**Step 2: Commit**

```bash
git add apps/carby-os/problems-list/docs/PROGRESS.md
git commit -m "Update progress tracker — Phases 1-3 complete"
```

---

---

# Rev 2 Addendum — Card States, Detail Drawer, Activity History

> Added 2026-03-09 after Figma card states review (node 13027:15996) and detail drawer discussion.
> Design Spec updated to Rev 2. See PROGRESS.md for full change summary.

---

## Task 12: Update Types + Mock Data for Activity History

**Files:**
- Modify: `apps/carby-os/src/features/problems-list/types.ts`
- Modify: `apps/carby-os/src/features/problems-list/mock-data.ts`
- Create: `apps/carby-os/src/features/problems-list/display-labels.ts`

**Step 1: Add ProblemEvent types to types.ts**

Add to the existing types file:

```typescript
type ProblemEventType =
  | 'reported'
  | 'imported'
  | 'screening-detected'
  | 'confirmed'
  | 'excluded'
  | 'undo-excluded'
  | 'marked-active'
  | 'marked-inactive'
  | 'marked-resolved'
  | 'marked-addressed'
  | 'recurrence'
  | 'reopened'
  | 'edited'
  | 'note-added';

interface ProblemEvent {
  id: string;
  type: ProblemEventType;
  performedBy: string;
  performedAt: string;
  effectiveDate?: string;
  note?: string;
  changes?: { field: string; from: string; to: string }[];
}
```

Add `history: ProblemEvent[]`, `notes?: string`, `relatedScreeningId?: string` to `ProblemItem`.

Remove `'entered-in-error'` from `VerificationStatus` (not in v1 scope). Ensure `ClinicalStatus` includes `'recurrence'`.

**Step 2: Create display-labels.ts**

Category-aware label mappings:

```typescript
import { ProblemCategory } from './types';

export const DEACTIVATE_LABEL: Record<ProblemCategory, string> = {
  'condition': 'Mark Inactive',
  'encounter-dx': 'Mark Inactive',
  'sdoh': 'Mark Addressed',
  'health-concern': 'Mark Resolved',
};

export const ACTIVATE_FROM_INACTIVE_LABEL: Record<ProblemCategory, string> = {
  'condition': 'Mark Active',
  'encounter-dx': 'Mark Active',
  'sdoh': 'Reopen',
  'health-concern': 'Reopen',
};

export const ACTIVATE_FROM_CONFIRMED_LABEL: Record<ProblemCategory, string> = {
  'condition': 'Mark Active',
  'encounter-dx': 'Mark Active',
  'sdoh': 'Mark Active',
  'health-concern': 'Mark Active',
};

export const DRAWER_TITLE: Record<ProblemCategory, string> = {
  'condition': 'Condition Details',
  'encounter-dx': 'Encounter Diagnosis Details',
  'sdoh': 'Social Determinant Details',
  'health-concern': 'Patient Concern Details',
};

export function getSourcePillLabel(item: ProblemItem): string {
  // Logic per DESIGN-SPEC §5.4 source pill label table
  if (item.verificationStatus === 'excluded') {
    return item.source === 'screened' ? 'Screened' : 'Reported';
  }
  if (item.clinicalStatus === 'recurrence') return 'Recurrence';
  if (item.clinicalStatus === 'active' && item.verificationStatus === 'confirmed') return 'Onset';
  if (item.verificationStatus === 'confirmed') return 'Diagnosed';
  return item.source === 'screened' ? 'Screened' : 'Reported';
}
```

**Step 3: Update mock-data.ts**

Add 2-5 `ProblemEvent` entries to each mock item's `history[]`. Example for Type 2 Diabetes:

```typescript
history: [
  { id: 'evt-1', type: 'marked-active', performedBy: 'Paige Anderson, PA-C', performedAt: '03/15/22, 10:15a PT' },
  { id: 'evt-2', type: 'confirmed', performedBy: 'Paige Anderson, PA-C', performedAt: '03/15/22, 10:14a PT' },
  { id: 'evt-3', type: 'imported', performedBy: 'System — CCDA Import', performedAt: '03/15/22, 9:00a PT' },
]
```

Add `relatedScreeningId` to SDOH items that come from screenings. Add screening instrument mock data with scores.

**Step 4: Commit**

```bash
git add apps/carby-os/src/features/problems-list/types.ts apps/carby-os/src/features/problems-list/mock-data.ts apps/carby-os/src/features/problems-list/display-labels.ts
git commit -m "Add ProblemEvent types, activity history mock data, and category-aware display labels"
```

---

## Task 13: Update ProblemCard + useProblemsState for Rev 2

**Files:**
- Modify: `apps/carby-os/src/features/problems-list/ProblemCard.tsx`
- Modify: `apps/carby-os/src/features/problems-list/hooks/useProblemsState.ts`

**Step 1: Update ProblemCard for category-aware actions**

- Import from `display-labels.ts` to get correct button labels per category
- Add `Undo Exclude` button for excluded items (was showing chevron only)
- Add Confirmed transitional state: show BOTH activate + deactivate buttons
- Add Recurrence status pill rendering
- Update source pill to use `getSourcePillLabel()` from display-labels.ts
- Long descriptions: add `truncate` class on card, ensure title shows full text

**Step 2: Update useProblemsState for activity history**

- Each action handler now also appends a `ProblemEvent` to the item's `history[]`
- Add `undoExclude` action: sets `verificationStatus: 'unconfirmed'`, appends `undo-excluded` event
- Ensure `confirm` action creates `confirmed` event
- Ensure category-specific actions (`marked-resolved`, `marked-addressed`) use correct event types
- Add `removeItem` action: removes item from state entirely

**Step 3: Commit**

```bash
git add apps/carby-os/src/features/problems-list/ProblemCard.tsx apps/carby-os/src/features/problems-list/hooks/useProblemsState.ts
git commit -m "ProblemCard category-aware actions, undo exclude, activity history on state changes"
```

---

## Task 14: Replace ScreeningInstruments with ScreeningBanner

**Files:**
- Delete or replace: `apps/carby-os/src/features/problems-list/ScreeningInstruments.tsx` → `ScreeningBanner.tsx`
- Modify: `apps/carby-os/src/features/problems-list/ProblemsListView.tsx` (update import)

**Step 1: Build ScreeningBanner**

Compact banner component:
- Left: clipboard icon + "2 screenings administered · Last: AHC HRSN 02/10/26"
- Right: "View All" button → toast "Screening History — coming soon"
- Props: `screenings: ScreeningInstrument[]`
- Fallback: "No screenings administered" + "Administer Screening" → toast
- Styling: subtle card-like bg, 12px 16px padding, single line

**Step 2: Update ProblemsListView**

Replace `<ScreeningInstruments />` with `<ScreeningBanner />` at top of SDOH section.

**Step 3: Commit**

```bash
git add apps/carby-os/src/features/problems-list/ScreeningBanner.tsx apps/carby-os/src/features/problems-list/ProblemsListView.tsx
git rm apps/carby-os/src/features/problems-list/ScreeningInstruments.tsx 2>/dev/null; true
git commit -m "Replace screening gallery with compact screening banner"
```

---

## Task 15: Build ProblemDetailDrawer

**Files:**
- Create: `apps/carby-os/src/features/problems-list/ProblemDetailDrawer.tsx`
- Modify: `apps/carby-os/src/features/problems-list/ProblemsListView.tsx` (wire drawer open)
- Modify: `apps/carby-os/src/features/problems-list/hooks/useProblemsState.ts` (add selectedItemId)

**Step 1: Add selectedItemId to state**

In `useProblemsState`, add `selectedItemId: string | null` state. Chevron click sets it. Drawer close clears it.

**Step 2: Build ProblemDetailDrawer**

Structure per DESIGN-SPEC §5.5:

```
Header: [←?] {DRAWER_TITLE[category]} [×]
Summary Card: ProblemCard in detail mode (+ Edit button top-right)
Related Screening: (SDOH only, conditional on relatedScreeningId)
Activity: chronological list of item.history[], newest first
Kebab menu: ⋯ with disabled "Merge with..." and "Split record" → toast
Footer: [🚫 Remove] button with confirmation
```

Key implementation notes:
- Drawer slides in from right, `position: fixed`, full height, ~400px wide
- Overlay backdrop on rest of page (click to close)
- Summary card reuses ProblemCard but with `mode="detail"` prop that adds Edit button
- Activity rows: event description (left) + timestamp (right), divider between rows
- Related Screening: static card showing screening name, score, interpretation, "View Full Results" → toast
- Kebab menu: two items, both disabled, both → toast "Coming in a future release"
- Remove button: red bg, white text, prohibition icon. On click → confirmation toast. On confirm → calls `removeItem(id)`, closes drawer.

**Step 3: Wire to ProblemsListView**

Chevron click on ProblemCard → sets `selectedItemId`. ProblemDetailDrawer renders when `selectedItemId !== null`. Actions within drawer call the same action handlers (shared from useProblemsState).

**Step 4: Commit**

```bash
git add apps/carby-os/src/features/problems-list/ProblemDetailDrawer.tsx apps/carby-os/src/features/problems-list/ProblemsListView.tsx apps/carby-os/src/features/problems-list/hooks/useProblemsState.ts
git commit -m "Build ProblemDetailDrawer — summary card, activity log, related screening, remove, split/merge placeholder"
```

---

## Task 16: Build ProblemEditMode

**Files:**
- Create: `apps/carby-os/src/features/problems-list/ProblemEditMode.tsx`
- Modify: `apps/carby-os/src/features/problems-list/ProblemDetailDrawer.tsx` (wire edit toggle)
- Modify: `apps/carby-os/src/features/problems-list/hooks/useProblemsState.ts` (add editItem action)

**Step 1: Build ProblemEditMode**

Inline edit form that replaces the summary card content when Edit is clicked:

- Header: [Cancel] "Edit {Category}" [Save]
- For Conditions/Enc Dx/SDOH: description + ICD shown as display-only text, editable fields = onset date + notes
- For Health Concerns: description is an editable text input, editable fields = reported date + notes
- Date fields: plain text inputs (no date picker widget in v1)
- Notes: textarea
- Cancel: revert, return to detail view
- Save: generate `edited` ProblemEvent with `changes[]`, update item, toast "Changes saved", return to detail view

**Step 2: Add editItem action to useProblemsState**

```typescript
editItem: (id: string, changes: { field: string; from: string; to: string }[]) => {
  // Update the item fields
  // Append 'edited' ProblemEvent with changes array
}
```

**Step 3: Wire in ProblemDetailDrawer**

Edit button click → toggles `isEditing` local state → renders ProblemEditMode instead of summary card.

**Step 4: Commit**

```bash
git add apps/carby-os/src/features/problems-list/ProblemEditMode.tsx apps/carby-os/src/features/problems-list/ProblemDetailDrawer.tsx apps/carby-os/src/features/problems-list/hooks/useProblemsState.ts
git commit -m "Build ProblemEditMode — inline edit for dates, notes, Health Concern descriptions"
```

---

## Task 17: Final Polish + Progress Update

**Files:**
- Modify: various (visual alignment)
- Modify: `apps/carby-os/problems-list/docs/PROGRESS.md`

**Step 1: Visual polish pass**

- Verify all card states render per Figma node 13027:15996
- Check drawer spacing, typography, color tokens against spec §6
- Verify dual display mode (tab vs drawer)
- Check empty states when all items filtered out
- Verify toast messages are clear and consistent
- Ensure long description truncation works on cards

**Step 2: Update PROGRESS.md**

Mark all phases complete. Clear "Still needed" items. Add final decision log entries.

**Step 3: Build verification**

```bash
cd apps/carby-os && npm run build
```

**Step 4: Commit**

```bash
git add -A
git commit -m "Final polish pass — visual alignment, progress tracker update, build verified"
```

---

## Summary

| Task | Description | Phase | Estimated Commits |
|------|-------------|-------|------------------|
| 1 | Initialize Vite app | 1 | 1 |
| 2 | Configure Tailwind + tokens | 1 | 1 |
| 3 | Copy design system components | 1 | 1 |
| 4 | Build patient shell | 1 | 1 |
| 5 | Define types + mock data | 2 | 1 |
| 6 | Build useProblemsState hook | 2-3 | 1 |
| 7 | Build ProblemCard | 2 | 1 |
| 8 | Build FilterBar, ProblemSection, ScreeningInstruments | 2 | 1 |
| 9 | Build ProblemsListView + wire everything | 3 | 1 |
| 10 | Visual polish | 3 | 1 |
| 11 | Update progress | 3 | 1 |
| **12** | **Update types + mock data for activity history** | **2 (Rev 2)** | **1** |
| **13** | **ProblemCard + state management Rev 2 updates** | **2-3 (Rev 2)** | **1** |
| **14** | **Replace ScreeningInstruments with ScreeningBanner** | **2 (Rev 2)** | **1** |
| **15** | **Build ProblemDetailDrawer** | **4** | **1** |
| **16** | **Build ProblemEditMode** | **4** | **1** |
| **17** | **Final polish + progress update** | **4** | **1** |
| **Total** | | | **17 commits** |

Tasks 1-11: Original scope (Phases 1-3). Tasks 12-17: Rev 2 addendum (Phase 2-3 updates + Phase 4).

---

## Rev 3 Amendments (2026-03-10)

The following changes apply to Tasks 12-17 above. They do NOT add new tasks — they modify the scope of existing tasks.

### Task 12 Amendments (Types + Mock Data)

**Additional type changes in `types.ts`:**
- Add `'resolved'` to `ClinicalStatus`: `'active' | 'inactive' | 'resolved' | 'recurrence'`
- Add `abatementDate?: string` to `ProblemItem` interface
- Add `'removed'` to `ProblemEventType` union
- Add `RemovalReason` type: `'entered-in-error' | 'duplicate' | 'replaced' | 'patient-disputed'`
- Add `removalReason?: RemovalReason` to `ProblemEvent` interface

**Update `display-labels.ts`:**
- Change `DEACTIVATE_LABEL` for health-concern from `'Mark Resolved'` to `'Mark Inactive'`
- `Mark Resolved` is now a universal action across all categories (→ `clinicalStatus: 'resolved'`)
- Rename `DEACTIVATE_LABEL` to `SOFT_CLOSE_LABEL` for clarity
- Add `REACTIVATE_FROM_RESOLVED_LABEL` (same values as `ACTIVATE_FROM_INACTIVE_LABEL`)
- Add `getSourcePillLabel` case for resolved: return `'Resolved'` when `clinicalStatus === 'resolved'`

**Updated display-labels.ts shape:**

```typescript
export const SOFT_CLOSE_LABEL: Record<ProblemCategory, string> = {
  'condition': 'Mark Inactive',
  'encounter-dx': 'Mark Inactive',
  'sdoh': 'Mark Addressed',
  'health-concern': 'Mark Inactive',
};

// Mark Resolved is universal — same label for all categories
export const RESOLVE_LABEL = 'Mark Resolved';
```

### Task 13 Amendments (ProblemCard + State)

**ProblemCard changes:**
- Active cards now show 2 buttons: `{SOFT_CLOSE_LABEL[category]}` + `Mark Resolved`
- Resolved cards show 1 button: `{REACTIVATE_LABEL}` (Mark Active or Reopen per category)
- Source pill for resolved items: `Resolved [abatementDate]`

**useProblemsState changes:**
- `markInactive` / `markAddressed` actions now set `abatementDate` to today's date
- New `markResolved` action: sets `clinicalStatus: 'resolved'`, sets `abatementDate` to today
- `markActive` and `reopen` actions now clear `abatementDate`
- `removeItem` action now accepts `removalReason: RemovalReason` parameter, appends `removed` event with reason
- Add `Resolved` to FilterBar filter options

### Task 15 Amendments (Detail Drawer)

**Remove button changes:**
- Click → inline confirmation dialog with reason radio group
- 4 options: Entered in Error (default), Duplicate, Replaced, Patient Disputed
- Cancel + Remove buttons
- On confirm → creates `removed` event with selected `removalReason`, hides item, closes drawer
- Toast: "Removed: {description}"

### Task 16 Amendments (Edit Mode)

**`abatementDate` editing:**
- If item has `abatementDate`, show as editable field in edit mode
- Label: "Resolved Date" or "Ended Date"
- Only visible when `clinicalStatus` is `'inactive'` or `'resolved'`
