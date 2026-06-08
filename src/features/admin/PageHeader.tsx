import * as React from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

/* Shared admin page header: big Bebas title + item count, optional filters and
   a primary "+ New …" action (the one lime CTA per page). */
export function PageHeader({
  title,
  count,
  actionLabel,
  onAction,
  children,
}: {
  title: string
  count?: number
  actionLabel?: string
  onAction?: () => void
  /** Filters / search rendered between the title and the action button. */
  children?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="t-section">{title}</h1>
        {typeof count === 'number' && (
          <p className="mt-1 label text-mute">
            {count} {count === 1 ? 'item' : 'items'}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {children}
        {actionLabel && (
          <Button size="sm" onClick={onAction}>
            <Plus className="size-5" strokeWidth={2} />
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
