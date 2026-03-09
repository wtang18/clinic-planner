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
