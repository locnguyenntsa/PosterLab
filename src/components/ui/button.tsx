import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/*
  Skewed parallelogram buttons. Bebas Neue, italic, uppercase. Flat fills,
  no radius, no shadow, hard-cut hover (brightness only, <150ms).
  - default   → orange fill, ink text (primary CTA — use sparingly)
  - secondary → ink fill, cream text, cream outline
  - outline   → transparent, cream outline
  - ghost     → transparent, no skew (used for the header back/icon)
*/
const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-display italic uppercase tracking-[0.06em] cursor-pointer select-none transition-colors duration-100 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
  {
    variants: {
      variant: {
        default: 'skew-btn bg-accent text-ink hover:bg-white [&_svg]:size-5',
        secondary:
          'skew-btn bg-ink text-on-dark border-2 border-cream hover:bg-white hover:text-ink hover:border-white [&_svg]:size-5',
        outline:
          'skew-btn bg-transparent text-cream border-2 border-line hover:bg-cream hover:text-bg hover:border-cream active:bg-cream active:text-bg active:border-cream [&_svg]:size-5',
        ghost: 'text-cream/70 hover:text-cream [&_svg]:size-5',
        danger: 'skew-btn bg-danger text-on-dark hover:bg-white hover:text-danger [&_svg]:size-5',
      },
      size: {
        default: 'h-12 px-8 text-lg',
        lg: 'h-14 px-10 text-2xl',
        sm: 'h-10 px-5 text-base',
        icon: 'size-11 justify-center',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {/* Label is counter-skewed so the parallelogram box leans but text stays upright */}
        <span className="skew-btn-label inline-flex items-center justify-center gap-2">
          {children}
        </span>
      </button>
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
