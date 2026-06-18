import * as React from 'react'
import { cn } from '@/lib/utils'

/* Flat, hard-edged textarea — mirrors the Input styling. */
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-28 w-full resize-y border border-line bg-[var(--c-field)] px-4 py-3 text-lg font-semibold text-cream backdrop-blur-sm',
        'transition-none placeholder:font-medium',
        'focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cream',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:outline-danger',
        className,
      )}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'

export { Textarea }
