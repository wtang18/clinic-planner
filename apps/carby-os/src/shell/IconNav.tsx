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
