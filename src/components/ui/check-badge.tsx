import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Round filled "checked / yes" badge — a lime disc with a dark check inside.
 * High contrast on both the light admin and dark guest surfaces (vs. a bare
 * lime check, which washes out on light backgrounds). Shared so every check on
 * the admin reads identically. Override the size via `className` (e.g. size-5).
 */
export function CheckBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'grid size-6 shrink-0 place-items-center rounded-full bg-accent text-ink',
        className,
      )}
    >
      <Check className="size-3.5" strokeWidth={3} />
    </span>
  )
}
