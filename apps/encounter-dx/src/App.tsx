import React, { useState, useRef, useCallback } from 'react'
import { Icon } from '@carbon-health/design-icons'
import { Button, Toast } from '@carbon-health/design-system'
import { DiagnosesSection } from './features/encounter-chart/DiagnosesSection'
import { DxDetailDrawer } from './features/encounter-chart/DxDetailDrawer'
import { SearchDiagnosesModal } from './features/dx-search/SearchDiagnosesModal'
import { useEncounterState } from './features/encounter-chart/useEncounterState'
import type { EncounterDx } from './features/encounter-chart/types'

/** Anchor link definitions — label + optional count */
const ANCHOR_LINKS = [
  { label: 'Intake', count: 2 },
  { label: 'Notes' },
  { label: 'Orders', count: 2 },
  { label: 'Diagnosis' },
  { label: 'Care Gaps', count: 2 },
  { label: 'Instructions' },
  { label: 'Documentation', count: 4 },
  { label: 'Sign Off' },
] as const

export default function App() {
  const { diagnoses, toast, addDiagnosis, removeDiagnosis, addToProblems, dismissToast } = useEncounterState()
  const [selectedDx, setSelectedDx] = useState<EncounterDx | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [isCompact, setIsCompact] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Keep selectedDx in sync with state changes (e.g., addedToProblems update)
  const resolvedDx = selectedDx ? diagnoses.find(d => d.id === selectedDx.id) ?? null : null

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setIsCompact(scrollRef.current.scrollTop > 40)
    }
  }, [])

  return (
    <div className="flex h-full bg-bg-neutral-subtle">
      {/* Left sidebar — icon nav */}
      <div className="w-12 shrink-0 border-r border-fg-transparent-soft bg-bg-neutral-subtle flex flex-col items-center py-4 gap-5">
        <div className="w-7 h-7 rounded-full bg-bg-accent-medium flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">CH</span>
        </div>
        <div className="flex flex-col gap-4 mt-2">
          {(['home', 'calendar', 'chat-bubble', 'user', 'clipboard-check', 'settings'] as const).map((icon, i) => (
            <div
              key={icon}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                i === 3 ? 'bg-bg-transparent-low' : 'hover:bg-bg-transparent-low'
              }`}
            >
              <Icon name={icon} size="small" className="text-fg-neutral-secondary" />
            </div>
          ))}
        </div>
      </div>

      {/* Left panel — encounter sidebar */}
      <div className="w-[320px] shrink-0 border-r border-fg-transparent-soft bg-bg-neutral-subtle overflow-auto px-3 py-4 flex flex-col gap-4">
        {/* Patient banner (redacted) */}
        <div className="flex flex-col items-start gap-1.5 px-1">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-14 h-14 rounded-full bg-bg-attention-low flex items-center justify-center shrink-0">
              <span className="text-label-md-medium text-fg-attention-primary">WT</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-4 w-20 rounded bg-bg-neutral-low" />
              <div className="h-4 w-16 rounded bg-bg-neutral-low" />
            </div>
          </div>
          <div className="h-3 w-48 rounded bg-bg-neutral-low" />
          <div className="h-3 w-40 rounded bg-bg-alert-low" />
        </div>

        {/* Sidebar section cards (redacted) */}
        <SidebarCard icon="heart-wave" showAdd>
          <div className="h-3 w-24 rounded bg-bg-neutral-low" />
          <div className="h-3 w-40 rounded bg-bg-neutral-low mt-2" />
        </SidebarCard>

        <SidebarCard icon="exclamation">
          <div className="h-3 w-20 rounded bg-bg-neutral-low" />
          <div className="h-3 w-36 rounded bg-bg-neutral-low mt-2" />
        </SidebarCard>

        <SidebarCard icon="pencil" showAdd>
          <div className="h-3 w-28 rounded bg-bg-neutral-low" />
          <div className="flex flex-col gap-2 mt-2">
            {[52, 70, 36, 44, 58].map((w, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <div className="h-3 rounded bg-bg-neutral-low" style={{ width: `${w}%` }} />
                  <div className="h-2.5 w-16 rounded bg-bg-neutral-low opacity-60" />
                </div>
                <div className="h-3 w-12 rounded bg-bg-neutral-low shrink-0" />
              </div>
            ))}
          </div>
        </SidebarCard>

        <SidebarCard icon="stethoscope">
          <div className="h-3 w-32 rounded bg-bg-neutral-low" />
          <div className="flex flex-col gap-1.5 mt-2">
            <div className="h-3 w-full rounded bg-bg-neutral-low" />
            <div className="h-3 w-[80%] rounded bg-bg-neutral-low" />
          </div>
        </SidebarCard>
      </div>

      {/* Main chart area (Work Pane) */}
      <div className="flex-1 flex flex-col relative min-w-0">

      {/* ── Header ── */}
      <div className={`flex flex-col px-5 shrink-0 transition-all duration-200 ${isCompact ? 'gap-1 pt-1.5 pb-0' : 'gap-3 pt-3 pb-0'}`}>
        {/* Title row */}
        <div className="flex items-start justify-between gap-4">
          {/* Left: date tile + title */}
          <div className="flex items-start gap-3 min-w-0">
            {/* Date tile */}
            <button className="shrink-0 w-10 bg-white border border-fg-transparent-soft rounded-xl px-1 py-2 flex flex-col items-center gap-0.5">
              <span className="text-[8px] font-semibold uppercase tracking-wider text-fg-alert-primary leading-[8px]">Feb</span>
              <span className="text-[18px] font-medium leading-5 text-fg-neutral-primary">27</span>
              <span className="text-[8px] font-semibold uppercase tracking-wider text-fg-neutral-primary leading-[8px]">Tue</span>
            </button>
            {/* Title + details (redacted) */}
            <div className="pt-1.5 min-w-0 flex flex-col gap-1">
              <div className={`h-5 rounded bg-bg-neutral-low transition-all duration-200 ${isCompact ? 'w-48' : 'w-64'}`} />
              {!isCompact && (
                <div className="h-3.5 w-80 rounded bg-bg-neutral-low opacity-70" />
              )}
              {isCompact && (
                <div className="h-3 w-56 rounded bg-bg-neutral-low opacity-50" />
              )}
            </div>
          </div>

          {/* Right: action icons + close */}
          <div className="flex items-center gap-2 shrink-0">
            <button className="w-10 h-10 rounded-full bg-bg-transparent-low flex items-center justify-center hover:bg-bg-transparent-low-accented transition-colors">
              <Icon name="more-horizontal" size="small" className="text-fg-neutral-primary" />
            </button>
            <button className="w-10 h-10 rounded-full bg-bg-transparent-low flex items-center justify-center hover:bg-bg-transparent-low-accented transition-colors">
              <Icon name="chat-bubble" size="small" className="text-fg-neutral-primary" />
            </button>
            <button className="w-10 h-10 rounded-full bg-bg-transparent-low flex items-center justify-center hover:bg-bg-transparent-low-accented transition-colors">
              <Icon name="x" size="small" className="text-fg-neutral-primary" />
            </button>
          </div>
        </div>

        {/* Detail pills row (redacted) — hidden in compact mode */}
        <div className={`flex items-center gap-1.5 overflow-hidden transition-all duration-200 ${isCompact ? 'max-h-0 opacity-0' : 'max-h-8 opacity-100'}`}>
          <div className="h-6 w-28 rounded-lg bg-bg-neutral-low" />
          <div className="h-6 w-36 rounded-lg bg-bg-neutral-low" />
          <div className="h-6 w-24 rounded-lg bg-bg-neutral-low" />
        </div>
      </div>

      {/* ── Anchor link bar ── */}
      <div className="flex items-center gap-1.5 px-5 py-3 shrink-0">
        {ANCHOR_LINKS.map(({ label, count }) => (
          <button
            key={label}
            className="h-8 px-4 py-1.5 rounded-full bg-bg-transparent-subtle flex items-center gap-2 hover:bg-bg-transparent-low transition-colors"
          >
            <span className="text-label-xs-medium text-fg-neutral-primary whitespace-nowrap">{label}</span>
            {count != null && (
              <span className="text-body-xs-regular text-fg-neutral-secondary">{count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Scrollable chart body ── */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-auto px-5 pb-20">
        <div className="flex flex-col gap-4">

          {/* Intake card */}
          <div className="bg-white rounded-2xl overflow-hidden px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-bg-neutral-low flex items-center justify-center">
                  <Icon name="settings" size="small" className="text-fg-neutral-secondary" />
                </div>
                <span className="text-label-sm-medium text-fg-neutral-primary">Intake</span>
              </div>
              <div className="flex items-center gap-1">
                <Button type="transparent" size="small" label="Add New Intake" />
                <button className="w-8 h-8 rounded-full bg-bg-transparent-low flex items-center justify-center">
                  <Icon name="chevron-up" size="small" className="text-fg-neutral-primary" />
                </button>
              </div>
            </div>
          </div>

          {/* Provider Notes card */}
          <div className="bg-white rounded-2xl overflow-hidden px-5 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-bg-positive-low flex items-center justify-center">
                  <Icon name="chat-bubble" size="small" className="text-fg-positive-primary" />
                </div>
                <div>
                  <span className="text-label-sm-medium text-fg-neutral-primary">Provider Notes</span>
                  <p className="text-body-xs-regular text-fg-neutral-secondary">Carby at 08:05PM PST</p>
                </div>
              </div>
              <Button type="transparent" size="small" iconL="magnifying-glass" label="Macros" />
            </div>
            {/* Notes body + vitals sidebar */}
            <div className="flex gap-6">
              {/* Left: note content placeholder */}
              <div className="flex-1">
                <p className="text-body-sm-regular text-fg-neutral-disabled">Enter notes here...</p>
              </div>
              {/* Right: Vitals Overview (redacted) */}
              <div className="w-[220px] shrink-0">
                <div className="text-label-xs-medium text-fg-neutral-primary mb-2">Vitals Overview</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: '-- bpm', w: 'full' },
                    { label: '-- %', w: 'full' },
                    { label: '-- mmHg', w: 'full' },
                    { label: '-- cm', w: 'full' },
                    { label: '-- °C', w: 'full' },
                    { label: '-- kg', w: 'full' },
                  ].map((v, i) => (
                    <div key={i} className="h-10 rounded-lg bg-bg-neutral-subtle flex items-center px-3">
                      <span className="text-body-xs-regular text-fg-neutral-secondary">{v.label}</span>
                    </div>
                  ))}
                  <div className="h-10 rounded-lg bg-bg-neutral-subtle flex items-center px-3">
                    <span className="text-body-xs-regular text-fg-neutral-secondary">-- rr</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Orders section card (skeleton) */}
          <SectionCard title="Orders" icon="clipboard-check" subtitle="2 Active" lines={2} actionLabel="Add Order" />

          {/* ★ Diagnosis section card — functional */}
          <div className="bg-white rounded-2xl overflow-hidden">
            <DiagnosesSection
              diagnoses={diagnoses}
              onAddDx={() => setShowSearch(true)}
              onSelectDx={setSelectedDx}
            />
          </div>

          {/* Care Gaps section card (skeleton) */}
          <SectionCard title="Care Gaps" icon="clipboard-checkmark" subtitle="2 Open" lines={2} actionLabel="Review" />

          {/* Instructions section card (skeleton) */}
          <SectionCard title="Instructions" icon="clipboard-pen" lines={1} actionLabel="Macros" />

          {/* Documentation section card (skeleton) */}
          <SectionCard title="Documentation" icon="file-lines" subtitle="4 Attached" lines={3} actionLabel="Add Documentation" />

          {/* Sign Off section card (skeleton) */}
          <div className="bg-white rounded-2xl overflow-hidden px-5 py-4 opacity-60">
            <h3 className="text-label-sm-medium text-fg-neutral-secondary mb-3">Sign Off</h3>
            <div className="flex flex-col gap-3">
              <div className="h-12 rounded-xl bg-bg-neutral-low" />
              <div className="h-12 rounded-xl bg-bg-neutral-low" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom button row ── */}
      <div className="absolute bottom-0 left-0 right-0 h-14 px-5 flex items-center justify-end bg-bg-neutral-subtle">
        <div className="flex items-center gap-1">
          <Button type="transparent" size="medium" iconL="dot-solid" label="Record" className="rounded-l-full rounded-r-[2px]" />
          <button className="h-10 px-3 rounded-l-[2px] rounded-r-full bg-bg-transparent-low flex items-center justify-center hover:bg-bg-transparent-low-accented transition-colors">
            <Icon name="settings" size="small" className="text-fg-neutral-primary" />
          </button>
        </div>
      </div>

      </div>{/* end Main chart area */}

      {/* Dx Detail Drawer */}
      {resolvedDx && (
        <DxDetailDrawer
          dx={resolvedDx}
          onClose={() => setSelectedDx(null)}
          onRemove={(id) => { removeDiagnosis(id); setSelectedDx(null) }}
          onAddToProblems={addToProblems}
        />
      )}

      {/* Search Diagnoses Modal */}
      {showSearch && (
        <SearchDiagnosesModal
          onClose={() => setShowSearch(false)}
          onSelect={(desc, code) => addDiagnosis(desc, code, false)}
          onSelectAndProblems={(desc, code) => addDiagnosis(desc, code, true)}
        />
      )}

      {/* Toast notification */}
      {toast.visible && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]">
          <Toast
            type="positive"
            title={toast.message}
            onClose={dismissToast}
            showClose
            autoDismiss
          />
        </div>
      )}
    </div>
  )
}

/** Sidebar card for the left encounter panel (redacted content) */
function SidebarCard({ icon, showAdd, children }: {
  icon: string
  showAdd?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-bg-neutral-low flex items-center justify-center">
            <Icon name={icon as any} size="x-small" className="text-fg-neutral-secondary" />
          </div>
          <div className="h-3 w-20 rounded bg-bg-neutral-low" />
        </div>
        {showAdd && (
          <button className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-bg-transparent-low transition-colors">
            <Icon name="plus" size="x-small" className="text-fg-neutral-secondary" />
          </button>
        )}
      </div>
      <div className="px-3 pb-3">
        {children}
      </div>
    </div>
  )
}

/** Skeleton section card used for non-functional chart sections */
function SectionCard({ title, icon, subtitle, lines = 2, actionLabel }: {
  title: string
  icon: string
  subtitle?: string
  lines?: number
  actionLabel?: string
}) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden px-5 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-bg-neutral-low flex items-center justify-center">
            <Icon name={icon as any} size="small" className="text-fg-neutral-secondary" />
          </div>
          <div>
            <span className="text-label-sm-medium text-fg-neutral-primary">{title}</span>
            {subtitle && <p className="text-body-xs-regular text-fg-neutral-secondary">{subtitle}</p>}
          </div>
        </div>
        {actionLabel && (
          <Button type="transparent" size="small" label={actionLabel} disabled />
        )}
      </div>
      {/* Skeleton rows with subtle bg — full width */}
      <div className="mt-3 flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="bg-bg-neutral-subtle rounded-xl py-3 px-3"
          >
            <div
              className="h-3 rounded bg-bg-neutral-low"
              style={{ width: `${55 + Math.sin(i * 2.1) * 25}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
