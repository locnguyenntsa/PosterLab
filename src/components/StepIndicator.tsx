import { TOTAL_STEPS, type StepId } from '@/types'
import { cn } from '@/lib/utils'

const STEP_LABELS: Record<number, string> = {
  1: 'Design',
  2: 'Photo',
  3: 'Preview',
  4: 'Details',
  5: 'Review',
  6: 'Done',
}

/* Flat segmented step indicator — solid orange blocks, hard edges, no animation. */
export function StepIndicator({ step }: { step: StepId }) {
  if (step < 1) return null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="label-wide text-mute">
          Step <span className="text-cream">{step}</span> / {TOTAL_STEPS}
        </span>
        <span className="label-wide text-accent">{STEP_LABELS[step]}</span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const n = i + 1
          const reached = n <= step
          return (
            <div
              key={n}
              className={cn(
                'h-1.5 flex-1',
                reached ? 'bg-accent' : 'bg-cream/12',
              )}
            />
          )
        })}
      </div>
    </div>
  )
}
