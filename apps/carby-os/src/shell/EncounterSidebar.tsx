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
