import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Round filled "checked / yes" badge — a GREEN disc with a dark check inside.
 * Green (success), not the brand orange, so a check never reads as a warning.
 * High contrast on both the light admin and dark guest surfaces. Shared so every
 * check reads identically. Override the size via `className` (e.g. size-5).
 */
export function CheckBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'grid size-6 shrink-0 place-items-center rounded-full bg-success text-ink',
        className,
      )}
    >
      <Check className="size-3.5" strokeWidth={3} />
    </span>
  )
}
