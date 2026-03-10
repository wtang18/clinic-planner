import { X, ClipboardList } from 'lucide-react'

interface AdministerScreeningDrawerProps {
  onClose: () => void
}

export function AdministerScreeningDrawer({ onClose }: AdministerScreeningDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[600px] bg-bg-neutral-subtle z-50 shadow-xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-neutral-low">
          <h2 className="text-base font-semibold text-fg-neutral-primary">Administer Screening</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-transparent-low transition-colors text-fg-neutral-secondary"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-5 py-4 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-bg-transparent-low flex items-center justify-center">
            <ClipboardList size={24} className="text-fg-neutral-secondary" />
          </div>
          <p className="text-sm text-fg-neutral-secondary max-w-xs">
            Screening instrument administration will be available in a future iteration.
          </p>
          <p className="text-sm text-fg-neutral-secondary max-w-xs">
            This includes PHQ-9, GAD-7, AUDIT-C, and other validated instruments with auto-scoring and SDOH problem generation.
          </p>
        </div>
      </div>
    </>
  )
}
