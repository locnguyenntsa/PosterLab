import { cn } from '@/lib/utils'

export interface SegmentOption<T extends string> {
  value: T
  label: string
}

/*
  Flat segmented control — square buttons, the active one filled lime. Used for
  the header Guest|Admin role toggle (peer modes, not an on/off switch).
*/
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  className,
}: {
  value: T
  onChange: (value: T) => void
  options: SegmentOption<T>[]
  ariaLabel?: string
  className?: string
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn('inline-flex border border-line', className)}
    >
      {options.map((o, i) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'label px-3 py-1.5 transition-colors duration-100 cursor-pointer',
              i > 0 && 'border-l border-line',
              active ? 'bg-accent text-ink' : 'text-mute hover:text-cream',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
