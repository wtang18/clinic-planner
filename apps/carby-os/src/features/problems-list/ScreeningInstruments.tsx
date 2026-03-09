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
