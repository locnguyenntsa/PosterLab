import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

/*
  Flat quantity stepper: [−] value [+]. Hard-edged to match the system. The
  minus disables at `min` (use a separate Remove action to delete the line).
*/
export function QtyStepper({
  value,
  onChange,
  min = 1,
  className,
}: {
  value: number
  onChange: (next: number) => void
  min?: number
  className?: string
}) {
  const btn =
    'grid size-7 shrink-0 place-items-center cursor-pointer text-cream transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent'
  return (
    <div className={cn('inline-flex items-center border border-line', className)}>
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className={btn}
      >
        <Minus className="size-3.5" strokeWidth={2} />
      </button>
      <span className="min-w-7 text-center t-body font-bold tabular-nums text-cream">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(value + 1)}
        className={btn}
      >
        <Plus className="size-3.5" strokeWidth={2} />
      </button>
    </div>
  )
}
