import * as React from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

/*
  Form field wrapper: uppercase label, the control, and a danger-red error line.
  Extracted from the guest CheckoutForm so admin forms share the exact pattern.
*/
export function Field({
  label,
  error,
  htmlFor,
  hint,
  className,
  children,
}: {
  label: string
  error?: string
  htmlFor?: string
  hint?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  // Tie the error to its control (aria-describedby) and announce it on appear
  // (role="alert") — the control gets `aria-describedby={`${htmlFor}-error`}`.
  const errorId = htmlFor && error ? `${htmlFor}-error` : undefined
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint && <span className="t-meta text-mute">{hint}</span>}
      </div>
      {children}
      {error && (
        <p id={errorId} role="alert" className="label text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
