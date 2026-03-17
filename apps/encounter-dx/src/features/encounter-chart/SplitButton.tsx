import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface SplitButtonProps {
  onSelect: () => void
  onSelectAndProblems: () => void
}

/**
 * Split button: "Select" + chevron dropdown.
 * Two separate buttons with flat inner edges and ~4px gap divider.
 * Uses the design system's transparent button styling.
 */
export function SplitButton({ onSelect, onSelectAndProblems }: SplitButtonProps) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="relative inline-flex" ref={dropdownRef}>
      {/* Select button — left side, flat right edge */}
      <button
        onClick={onSelect}
        className="h-8 px-3.5 text-label-xs-medium text-fg-neutral-primary bg-[var(--color-bg-transparent-low)] backdrop-blur-xl rounded-l-full hover:bg-[var(--color-bg-transparent-low-accented)] active:bg-[var(--color-bg-transparent-medium)] transition-all duration-200 cursor-pointer"
      >
        Select
      </button>

      {/* 4px gap divider */}
      <div className="w-1" />

      {/* Chevron button — right side, flat left edge */}
      <button
        onClick={() => setOpen(!open)}
        className="h-8 px-2 bg-[var(--color-bg-transparent-low)] backdrop-blur-xl rounded-r-full hover:bg-[var(--color-bg-transparent-low-accented)] active:bg-[var(--color-bg-transparent-medium)] transition-all duration-200 cursor-pointer flex items-center justify-center"
      >
        <ChevronDown size={14} className="text-fg-neutral-secondary" />
      </button>

      {/* Dropdown popover */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 bg-white rounded-xl shadow-lg border border-border-transparent-soft py-1 min-w-[240px] animate-fade-in">
          <button
            onClick={() => { onSelect(); setOpen(false) }}
            className="w-full text-left px-3.5 py-2 text-body-sm-regular text-fg-neutral-primary hover:bg-bg-transparent-low transition-colors"
          >
            Add to Chart
          </button>
          <button
            onClick={() => { onSelectAndProblems(); setOpen(false) }}
            className="w-full text-left px-3.5 py-2 text-body-sm-regular text-fg-neutral-primary hover:bg-bg-transparent-low transition-colors"
          >
            Add to Chart + Problems List
          </button>
        </div>
      )}
    </div>
  )
}
