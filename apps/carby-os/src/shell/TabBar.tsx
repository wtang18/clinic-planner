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
