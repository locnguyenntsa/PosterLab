import * as React from 'react'
import { cn } from '@/lib/utils'

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0–100 */
  value?: number
  /** Override the fill colour (defaults to the orange accent). */
  indicatorClassName?: string
}

/* Flat progress bar — solid orange fill on a bordered track. Hard edges. */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, indicatorClassName, ...props }, ref) => {
    const clamped = Math.min(100, Math.max(0, value))
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped)}
        className={cn('h-3 w-full border border-line bg-ink/30', className)}
        {...props}
      >
        <div
          className={cn(
            'h-full bg-accent transition-[width] duration-100 ease-linear',
            indicatorClassName,
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    )
  },
)
Progress.displayName = 'Progress'

export { Progress }
