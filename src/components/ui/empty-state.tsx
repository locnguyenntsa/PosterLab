import * as React from 'react'
import { cn } from '@/lib/utils'

/* Centered empty placeholder inside a solid 1px frame (no dashed borders). */
export function EmptyState({
  title,
  message,
  icon: Icon,
  action,
  className,
}: {
  title: string
  message?: string
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 border border-line bg-surface px-6 py-16 text-center',
        className,
      )}
    >
      {Icon && <Icon className="size-10 text-mute" strokeWidth={1.5} />}
      <p className="t-card">{title}</p>
      {message && <p className="max-w-sm t-body">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
