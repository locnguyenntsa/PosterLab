import * as React from 'react'
import { cn } from '@/lib/utils'

/* Tracked, uppercase Inter label. */
const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn('label text-mute', className)}
    {...props}
  />
))
Label.displayName = 'Label'

export { Label }
