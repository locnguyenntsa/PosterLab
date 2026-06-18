import * as React from 'react'
import { cn } from '@/lib/utils'

/* Flat, hard-edged input. No radius, no glow. Hard 2px cream focus outline. */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex h-12 w-full border border-line bg-[var(--c-field)] px-4 text-lg font-semibold text-cream backdrop-blur-sm',
          'transition-none placeholder:font-medium',
          'focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cream',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:outline-danger',
          className,
        )}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
