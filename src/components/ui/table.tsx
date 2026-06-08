import * as React from 'react'
import { cn } from '@/lib/utils'

/*
  Flat table primitives. Hairline rows, uppercase label headers, and a single
  lime accent rule under the header row (the one sanctioned accent per table).
  Table wraps the element in a horizontally scrollable bordered frame.
*/
export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto border border-line bg-surface">
      <table className={cn('w-full border-collapse text-left', className)} {...props} />
    </div>
  )
}

export function THead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  // Solid dark header bar (stays dark on the light admin theme) with light text,
  // under the single lime rule — high contrast + a clear header/body split.
  return (
    <thead
      className={cn('border-b-2 border-accent bg-ink text-on-dark', className)}
      {...props}
    />
  )
}

export function TBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={className} {...props} />
}

export function TR({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('border-b border-line last:border-b-0', className)} {...props} />
}

export function TH({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  // Inherits the light THead text color; the sort button sets active/hover state.
  return <th className={cn('label whitespace-nowrap px-4 py-3', className)} {...props} />
}

export function TD({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-3 align-middle', className)} {...props} />
}
