import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DatePickerPopoverProps {
  value: string
  onChange: (date: string) => void
  onClose: () => void
}

function parseDate(s: string): Date | null {
  const parts = s.split('/')
  if (parts.length !== 3) return null
  const m = parseInt(parts[0], 10)
  const d = parseInt(parts[1], 10)
  let y = parseInt(parts[2], 10)
  if (isNaN(m) || isNaN(d) || isNaN(y)) return null
  if (y < 100) y += 2000
  return new Date(y, m - 1, d)
}

function formatDate(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const y = String(date.getFullYear()).slice(2)
  return `${m}/${d}/${y}`
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function DatePickerPopover({ value, onChange, onClose }: DatePickerPopoverProps) {
  const [inputValue, setInputValue] = useState(value)
  const parsed = parseDate(value)
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? new Date().getMonth())
  const popoverRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.select()
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const p = parseDate(inputValue)
      if (p) {
        onChange(formatDate(p))
      }
      onClose()
    }
  }

  const handleDayClick = (day: number) => {
    const date = new Date(viewYear, viewMonth, day)
    onChange(formatDate(date))
    onClose()
  }

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth)
  const selectedDate = parseDate(value)
  const isSelectedDay = (day: number) =>
    selectedDate &&
    selectedDate.getFullYear() === viewYear &&
    selectedDate.getMonth() === viewMonth &&
    selectedDate.getDate() === day

  const todayDate = new Date()
  const isToday = (day: number) =>
    todayDate.getFullYear() === viewYear &&
    todayDate.getMonth() === viewMonth &&
    todayDate.getDate() === day

  return (
    <div
      ref={popoverRef}
      className="absolute left-0 top-full mt-1 z-50 bg-white rounded-xl shadow-lg border border-border-neutral-low p-3 w-[260px]"
    >
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleInputKeyDown}
        placeholder="MM/DD/YY"
        className="w-full border border-border-neutral-low rounded-lg px-3 py-2 text-body-sm-regular text-fg-neutral-primary outline-none focus:shadow-[0_0_0_2px_var(--color-bg-input-high)] mb-3"
      />

      <div className="flex items-center justify-between mb-2">
        <button
          onClick={prevMonth}
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-bg-transparent-low text-fg-neutral-secondary"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-label-sm-medium text-fg-neutral-primary">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-bg-transparent-low text-fg-neutral-secondary"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map(d => (
          <div key={d} className="text-center text-body-xs-regular text-fg-neutral-disabled py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const selected = isSelectedDay(day)
          const today = isToday(day)
          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={`
                w-8 h-8 flex items-center justify-center rounded-lg text-body-sm-regular transition-colors
                ${selected
                  ? 'bg-fg-neutral-primary text-white font-medium'
                  : today
                    ? 'bg-bg-transparent-low text-fg-neutral-primary font-medium hover:bg-bg-transparent-medium'
                    : 'text-fg-neutral-secondary hover:bg-bg-transparent-low'
                }
              `}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
