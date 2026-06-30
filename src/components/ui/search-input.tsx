import * as React from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

/* A search field: the flat Input with a leading magnifier icon and a roomier
   default width. Used in the admin page headers (events / teams / designs). */
const SearchInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'> & { wrapperClassName?: string }
>(({ className, wrapperClassName, ...props }, ref) => {
  return (
    <div className={cn('relative w-full sm:w-72', wrapperClassName)}>
      <Search
        className="pointer-events-none absolute left-4 top-1/2 z-10 size-5 -translate-y-1/2 text-mute"
        strokeWidth={1.75}
        aria-hidden
      />
      <Input ref={ref} type="search" className={cn('pl-11', className)} {...props} />
    </div>
  )
})
SearchInput.displayName = 'SearchInput'

export { SearchInput }
