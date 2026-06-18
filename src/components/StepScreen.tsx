import type { ReactNode } from 'react'
import { useScrollEdges } from '@/lib/useScrollEdges'
import type { StepId } from '@/types'
import { cn } from '@/lib/utils'

interface StepScreenProps {
  /** Accepted for call-site symmetry; the milestone bar is rendered by App. */
  step: StepId
  /** Tiny uppercase eyebrow above the headline. */
  kicker?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

/*
  Step frame: a centered Bebas headline with an optional kicker + subtitle, a
  scrollable body, and a sticky action footer with a hairline top rule. The step
  milestone bar is rendered persistently by App (above the animated content) so
  it stays static across step changes. Center-aligned across the whole site.
*/
export function StepScreen({
  kicker,
  title,
  subtitle,
  children,
  footer,
}: StepScreenProps) {
  // One shared content width across every step — keeps the flow consistent.
  const width = 'max-w-3xl'
  const { atBottom } = useScrollEdges()

  return (
    <div className="flex flex-1 flex-col">
      <div className={cn('mx-auto w-full px-5 pt-10 sm:px-10', width)}>
        <div className="text-center">
          {kicker && (
            <div className="mb-3 inline-block bg-accent px-2.5 py-1 label text-ink">
              {kicker}
            </div>
          )}
          <h1 className="t-section">
            {title}
          </h1>
          {subtitle && (
            <p className="mx-auto mt-4 max-w-md t-body">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className={cn('mx-auto w-full flex-1 px-5 pb-32 pt-10 sm:px-10', width)}>
        {children}
      </div>

      {footer && (
        <div
          className={cn(
            'sticky bottom-0 z-20 border-t border-line bg-primary transition-shadow duration-200',
            !atBottom && 'shadow-[0_-10px_30px_-4px_rgba(0,0,0,0.7)]',
          )}
        >
          <div className={cn('mx-auto w-full px-5 py-5 sm:px-10', width)}>{footer}</div>
        </div>
      )}
    </div>
  )
}
