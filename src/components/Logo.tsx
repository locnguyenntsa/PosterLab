import { cn } from '@/lib/utils'

/* Flat OnePact wordmark: hard orange monogram block + Bebas wordmark. */
export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)}>
      <div className="grid size-8 place-items-center bg-accent">
        <span className="font-display text-xl leading-none text-ink">1P</span>
      </div>
      <span className="font-display text-2xl leading-none text-cream">
        One<span className="text-accent">pact</span>
      </span>
    </div>
  )
}
