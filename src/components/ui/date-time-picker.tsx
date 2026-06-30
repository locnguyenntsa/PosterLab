import * as React from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useClickOutside } from '@/lib/useClickOutside'
import { cn } from '@/lib/utils'

type Mode = 'date' | 'datetime'

interface DateTimePickerProps {
  /** ISO-ish value: `YYYY-MM-DD` (date) or `YYYY-MM-DDTHH:mm` (datetime). */
  value: string
  onChange: (value: string) => void
  mode?: Mode
  placeholder?: string
  id?: string
  disabled?: boolean
  /** Applied to the outer wrapper (use for width). */
  className?: string
  'aria-invalid'?: boolean
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const pad = (n: number) => String(n).padStart(2, '0')

interface Parts {
  year: number
  month: number // 0-indexed
  day: number
  hour: number
  minute: number
}

function parseValue(value: string): Parts | null {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/)
  if (!m) return null
  return {
    year: +m[1],
    month: +m[2] - 1,
    day: +m[3],
    hour: m[4] ? +m[4] : 0,
    minute: m[5] ? +m[5] : 0,
  }
}

function toValue(p: Parts, mode: Mode): string {
  const date = `${p.year}-${pad(p.month + 1)}-${pad(p.day)}`
  return mode === 'datetime' ? `${date}T${pad(p.hour)}:${pad(p.minute)}` : date
}

function formatDisplay(p: Parts, mode: Mode): string {
  const date = `${pad(p.day)}/${pad(p.month + 1)}/${p.year}`
  return mode === 'datetime' ? `${date}, ${pad(p.hour)}:${pad(p.minute)}` : date
}

/** 42 cells (6 weeks), Monday-first, covering the given month. */
function monthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const startOffset = (first.getDay() + 6) % 7 // Mon=0 … Sun=6
  const cells: Date[] = []
  for (let i = 0; i < 42; i++) {
    cells.push(new Date(year, month, 1 - startOffset + i))
  }
  return cells
}

const sameDay = (a: Date, p: Parts) =>
  a.getFullYear() === p.year && a.getMonth() === p.month && a.getDate() === p.day

/*
  Branded date / datetime picker — a custom calendar popover that matches the flat
  editorial UI (hard edges, token colors, Bebas month title, orange accent on the
  selected day / time) instead of the unstyleable native OS calendar. Mirrors the
  Select component: trigger styled like an Input, bg-surface popover, closes on
  outside click / Escape. Value stays in the native `datetime-local` / `date`
  string format so forms and schemas are unchanged.
*/
export function DateTimePicker({
  value,
  onChange,
  mode = 'datetime',
  placeholder = mode === 'datetime' ? 'Pick date & time' : 'Pick a date',
  id,
  disabled,
  className,
  'aria-invalid': ariaInvalid,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  const selected = parseValue(value)

  // The month currently shown in the grid — follows the selection, else today.
  const [view, setView] = React.useState(() => {
    const base = selected ?? null
    const now = new Date()
    return {
      year: base?.year ?? now.getFullYear(),
      month: base?.month ?? now.getMonth(),
    }
  })

  useClickOutside(ref, () => setOpen(false), open)

  // Open the popover, re-syncing the visible month to the current selection.
  const openPicker = () => {
    const base = parseValue(value)
    const now = new Date()
    setView({
      year: base?.year ?? now.getFullYear(),
      month: base?.month ?? now.getMonth(),
    })
    setOpen(true)
  }

  const today = new Date()

  const emit = (next: Partial<Parts>) => {
    const now = new Date()
    const base: Parts = selected ?? {
      year: now.getFullYear(),
      month: now.getMonth(),
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
    }
    onChange(toValue({ ...base, ...next }, mode))
  }

  const pickDay = (d: Date) =>
    emit({ year: d.getFullYear(), month: d.getMonth(), day: d.getDate() })

  const setNow = () => {
    const now = new Date()
    const p: Parts = {
      year: now.getFullYear(),
      month: now.getMonth(),
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
    }
    onChange(toValue(p, mode))
    setView({ year: p.year, month: p.month })
  }

  const moveMonth = (delta: number) =>
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })

  const cells = monthGrid(view.year, view.month)
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from({ length: 60 }, (_, i) => i)

  return (
    <div
      ref={ref}
      className={cn('relative', className)}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) {
          e.preventDefault()
          setOpen(false)
        }
      }}
    >
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={ariaInvalid}
        onClick={() => !disabled && (open ? setOpen(false) : openPicker())}
        className={cn(
          'flex h-12 w-full items-center justify-between gap-2 border border-line bg-[var(--c-field)] px-4 text-lg font-semibold backdrop-blur-sm',
          selected ? 'text-cream' : 'text-mute',
          'focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cream',
          'disabled:cursor-not-allowed disabled:opacity-50',
          ariaInvalid && 'border-danger focus-visible:outline-danger',
        )}
      >
        <span className="truncate">
          {selected ? formatDisplay(selected, mode) : placeholder}
        </span>
        <CalendarDays className="size-5 shrink-0 text-mute" strokeWidth={1.5} />
      </button>

      {open && (
        <div
          role="dialog"
          className="absolute left-0 top-[calc(100%+0.5rem)] z-40 flex border border-line bg-surface p-4 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.55)]"
        >
          {/* Calendar */}
          <div className="w-64">
            {/* Month nav */}
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display text-2xl italic leading-none text-cream">
                {MONTHS[view.month]} {view.year}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={() => moveMonth(-1)}
                  className="grid size-7 cursor-pointer place-items-center text-mute transition-colors hover:bg-ink/[0.06] hover:text-cream"
                >
                  <ChevronLeft className="size-4" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() => moveMonth(1)}
                  className="grid size-7 cursor-pointer place-items-center text-mute transition-colors hover:bg-ink/[0.06] hover:text-cream"
                >
                  <ChevronRight className="size-4" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Weekday header */}
            <div className="grid grid-cols-7">
              {WEEKDAYS.map((w, i) => (
                <span
                  key={i}
                  className="grid h-8 place-items-center text-xs font-semibold uppercase tracking-wide text-mute"
                >
                  {w}
                </span>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7">
              {cells.map((d) => {
                const inMonth = d.getMonth() === view.month
                const isSelected = selected && sameDay(d, selected)
                const isToday =
                  d.getFullYear() === today.getFullYear() &&
                  d.getMonth() === today.getMonth() &&
                  d.getDate() === today.getDate()
                return (
                  <button
                    key={d.toISOString()}
                    type="button"
                    onClick={() => pickDay(d)}
                    className={cn(
                      'grid h-8 cursor-pointer place-items-center text-sm font-semibold tabular-nums transition-colors duration-100',
                      isSelected
                        ? 'bg-accent text-ink'
                        : cn(
                            inMonth ? 'text-cream' : 'text-mute/45',
                            'hover:bg-ink/[0.06]',
                          ),
                      !isSelected && isToday && 'outline outline-1 -outline-offset-1 outline-accent',
                    )}
                  >
                    {d.getDate()}
                  </button>
                )
              })}
            </div>

            {/* Footer actions */}
            <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
              <button
                type="button"
                onClick={() => onChange('')}
                className="label cursor-pointer text-mute transition-colors hover:text-cream"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={setNow}
                className="label cursor-pointer text-accent transition-colors hover:brightness-110"
              >
                {mode === 'datetime' ? 'Now' : 'Today'}
              </button>
            </div>
          </div>

          {/* Time columns */}
          {mode === 'datetime' && (
            <div className="ml-4 flex gap-2 border-l border-line pl-4">
              <TimeColumn
                label="HH"
                values={hours}
                active={selected?.hour ?? null}
                onPick={(h) => emit({ hour: h })}
              />
              <TimeColumn
                label="MM"
                values={minutes}
                active={selected?.minute ?? null}
                onPick={(m) => emit({ minute: m })}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TimeColumn({
  label,
  values,
  active,
  onPick,
}: {
  label: string
  values: number[]
  active: number | null
  onPick: (v: number) => void
}) {
  const listRef = React.useRef<HTMLDivElement>(null)

  // Scroll the active value into view when the column mounts (popover opens).
  React.useEffect(() => {
    if (active == null) return
    const el = listRef.current?.querySelector<HTMLElement>('[data-active="true"]')
    el?.scrollIntoView({ block: 'center' })
  }, [active])

  return (
    <div className="flex flex-col">
      <span className="mb-1 text-center text-xs font-semibold uppercase tracking-wide text-mute">
        {label}
      </span>
      <div
        ref={listRef}
        className="flex w-11 flex-col gap-0.5 overflow-y-auto pr-0.5"
        style={{ maxHeight: '14rem' }}
      >
        {values.map((v) => {
          const isActive = v === active
          return (
            <button
              key={v}
              type="button"
              data-active={isActive}
              onClick={() => onPick(v)}
              className={cn(
                'shrink-0 py-1.5 text-center text-sm font-semibold tabular-nums transition-colors duration-100',
                isActive
                  ? 'bg-accent text-ink'
                  : 'text-cream hover:bg-ink/[0.06]',
              )}
            >
              {pad(v)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
