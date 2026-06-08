import { cn } from '@/lib/utils'

/* Flat boolean toggle — hard rectangle track + square knob, no radius. */
export function Switch({
  checked,
  onCheckedChange,
  id,
  disabled,
  'aria-label': ariaLabel,
}: {
  checked: boolean
  onCheckedChange: (value: boolean) => void
  id?: string
  disabled?: boolean
  'aria-label'?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center border border-line transition-colors duration-100',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        'disabled:cursor-not-allowed disabled:opacity-40',
        checked ? 'bg-accent' : 'bg-ink/40',
      )}
    >
      {/* Knob color contrasts the track in every theme/state:
          on  → ink on the lime track (brand lime+ink pairing, high contrast)
          off → cream, which is light on the dark off-track (dark theme) and
                dark on the gray off-track (light theme). */}
      <span
        className={cn(
          'block size-4 transition-transform duration-100',
          checked ? 'translate-x-[22px] bg-ink' : 'translate-x-[3px] bg-cream',
        )}
      />
    </button>
  )
}
