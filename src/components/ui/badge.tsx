import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/*
  Flat tag / badge. Solid color block, ink or cream text, no radius. Text is the
  UI label tier (Inter 600, 14px, 0.18em tracking, uppercase) — see
  .label in index.css. Padding 10×5 matches the Figma Badge component. Semantic
  variants are solid blocks (no soft tints).
*/
const badgeVariants = cva(
  'inline-flex items-center gap-1 px-2.5 py-[5px] label',
  {
    variants: {
      variant: {
        default: 'bg-accent text-ink',
        ink: 'bg-ink text-on-dark',
        outline: 'border border-line text-mute',
        success: 'bg-accent text-ink',
        warning: 'bg-warn text-ink',
        danger: 'bg-danger text-on-dark',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
