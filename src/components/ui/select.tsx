import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { CheckBadge } from '@/components/ui/check-badge'
import { useClickOutside } from '@/lib/useClickOutside'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  id?: string
  disabled?: boolean
  /** Applied to the outer wrapper (use for width, e.g. `w-44`). */
  className?: string
  'aria-invalid'?: boolean
  'aria-label'?: string
}

/*
  Custom listbox select — no native OS dropdown, so it matches the flat editorial
  brand (hard edges, token colors, orange accent on the selected row). Keyboard:
  Up/Down/Home/End move, Enter/Space select, Esc closes, type-ahead jumps. Closes
  on outside click. Themed via tokens, so it adapts to the light content area.
*/
export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  id,
  disabled,
  className,
  'aria-invalid': ariaInvalid,
  'aria-label': ariaLabel,
}: SelectProps) {
  const [open, setOpen] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const ref = React.useRef<HTMLDivElement>(null)
  const listRef = React.useRef<HTMLUListElement>(null)
  const typeahead = React.useRef({ buffer: '', timer: 0 })

  useClickOutside(ref, () => setOpen(false), open)

  const selectedIndex = options.findIndex((o) => o.value === value)
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined
  const baseId = id ?? 'select'

  const openMenu = () => {
    if (disabled) return
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
    setOpen(true)
  }

  const choose = (index: number) => {
    const opt = options[index]
    if (!opt) return
    onChange(opt.value)
    setOpen(false)
  }

  // Keep the active option scrolled into view.
  React.useEffect(() => {
    if (!open) return
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  const typeAhead = (char: string) => {
    const t = typeahead.current
    window.clearTimeout(t.timer)
    t.buffer += char.toLowerCase()
    t.timer = window.setTimeout(() => (t.buffer = ''), 600)
    const match = options.findIndex((o) => o.label.toLowerCase().startsWith(t.buffer))
    if (match >= 0) {
      if (open) setActiveIndex(match)
      else onChange(options[match].value)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return
    if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
      typeAhead(e.key)
      return
    }
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        openMenu()
      }
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((i) => Math.min(options.length - 1, i + 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => Math.max(0, i - 1))
        break
      case 'Home':
        e.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
        e.preventDefault()
        setActiveIndex(options.length - 1)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        choose(activeIndex)
        break
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={ariaInvalid}
        aria-label={ariaLabel}
        aria-activedescendant={open && activeIndex >= 0 ? `${baseId}-opt-${activeIndex}` : undefined}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        className={cn(
          'flex h-12 w-full items-center justify-between gap-2 border border-line bg-[var(--c-field)] px-4 text-lg font-semibold',
          selected ? 'text-cream' : 'text-mute',
          'focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cream',
          'disabled:cursor-not-allowed disabled:opacity-50',
          ariaInvalid && 'border-danger focus-visible:outline-danger',
        )}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown
          className={cn(
            'size-5 shrink-0 text-mute transition-transform duration-100',
            open && 'rotate-180',
          )}
          strokeWidth={1.5}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          className="absolute inset-x-0 z-30 mt-1 max-h-60 overflow-y-auto border border-line bg-surface py-1"
        >
          {options.map((o, i) => {
            const isSelected = o.value === value
            const isActive = i === activeIndex
            return (
              <li
                key={o.value}
                id={`${baseId}-opt-${i}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => choose(i)}
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-2 px-4 py-2.5 text-lg font-semibold text-cream',
                  isActive && 'bg-ink/[0.06]',
                )}
              >
                <span className="truncate">{o.label}</span>
                {isSelected && <CheckBadge className="size-5" />}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
