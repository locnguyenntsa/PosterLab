import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

/*
  Live countdown to a kick-off time. Ticks once a second (setInterval in an
  effect, cleaned up on unmount — same pattern as PosterGeneration's progress
  timer). Flat 4-tile grid (hairline dividers via gap-px bg-line). Once the
  kick-off passes it shows a single banner in the same footprint, so the layout
  never jumps. No animation of its own → reduced-motion safe.
*/

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const diffMs = (iso: string) => new Date(iso).getTime() - Date.now()
const pad = (n: number) => String(n).padStart(2, '0')

export function Countdown({ kickoff, className }: { kickoff: string; className?: string }) {
  // Seed synchronously so the first paint is correct (no flash of zeros); the
  // interval then drives every subsequent tick.
  const [remaining, setRemaining] = useState(() => diffMs(kickoff))

  useEffect(() => {
    const id = setInterval(() => setRemaining(diffMs(kickoff)), SECOND)
    return () => clearInterval(id)
  }, [kickoff])

  // Past kick-off — keep the same vertical footprint as the tiles.
  if (remaining <= 0) {
    const underway = remaining > -2 * HOUR
    return (
      <div
        className={cn(
          'flex items-center justify-center border border-line bg-secondary px-4 py-5 text-center',
          className,
        )}
      >
        <span className="t-card text-2xl text-accent">
          {underway ? 'Match Underway' : 'Kick-Off!'}
        </span>
      </div>
    )
  }

  const parts = [
    { value: Math.floor(remaining / DAY), unit: 'Days' },
    { value: Math.floor(remaining / HOUR) % 24, unit: 'Hours' },
    { value: Math.floor(remaining / MINUTE) % 60, unit: 'Min' },
    { value: Math.floor(remaining / SECOND) % 60, unit: 'Sec' },
  ]

  return (
    <div
      className={cn('grid grid-cols-4 gap-px border border-line bg-line', className)}
      role="timer"
      aria-label={`${parts[0].value} days, ${parts[1].value} hours, ${parts[2].value} minutes until kick-off`}
    >
      {parts.map((p) => (
        <div key={p.unit} className="flex flex-col items-center gap-1.5 bg-secondary px-3 py-4 sm:py-5">
          <span className="font-display text-4xl leading-none tabular-nums text-cream sm:text-5xl">
            {pad(p.value)}
          </span>
          <span className="label-wide text-mute">{p.unit}</span>
        </div>
      ))}
    </div>
  )
}
