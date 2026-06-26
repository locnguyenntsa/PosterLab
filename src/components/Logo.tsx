import { cn } from '@/lib/utils'

/* Flat Poster Lab wordmark: PL monogram mark (brand asset) + Bebas wordmark. */
export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)}>
      <img src="/brand/logo-mark.svg" alt="Poster Lab" className="h-8 w-auto shrink-0" />
      <span className="font-display text-2xl leading-none text-cream">
        Poster <span className="text-accent">Lab</span>
      </span>
    </div>
  )
}
