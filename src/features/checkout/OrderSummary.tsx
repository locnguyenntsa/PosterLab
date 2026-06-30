import { cn, formatEUR } from '@/lib/utils'
import { useCartItems, useCartStore } from '@/store/useCartStore'
import { useTeams, resolveClub } from '@/store/useCatalogStore'
import { cartTotals } from '@/lib/pricing'
import { Card } from '@/components/ui/card'
import { QtyStepper } from '@/components/ui/qty-stepper'

/** Order recap: one row per poster in the cart, then the volume-aware totals. */
export function OrderSummary() {
  const items = useCartItems()
  const setQty = useCartStore((s) => s.setQty)
  const teams = useTeams()
  const totals = cartTotals(items)

  return (
    <Card accent className="p-4 sm:p-6">
      <ul className="space-y-5">
        {items.map((it) => {
          const club = resolveClub(teams, it.clubId)
          return (
            <li key={it.id} className="flex gap-4 sm:gap-5">
              <img
                src={it.posterUrl}
                alt="Your poster"
                className="h-24 w-16 shrink-0 border border-line object-cover sm:h-28 sm:w-[84px]"
              />
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 sm:gap-2">
                <p className="t-card text-xl sm:text-3xl">{club?.name} Poster</p>
                <p className="label-wide text-mute tracking-[0.1em] sm:tracking-[0.18em]">
                  {it.format}
                </p>
                <p className="label-wide text-mute tracking-[0.1em] sm:tracking-[0.18em]">
                  {it.offer === 'digital'
                    ? 'Instant Download · HD File'
                    : 'Print On Demand · Ships 5–7 Days'}
                </p>
                <div className="mt-1">
                  <QtyStepper value={it.qty} onChange={(q) => setQty(it.id, q)} />
                </div>
              </div>
              <span className="shrink-0 self-center t-body font-bold text-cream">
                {formatEUR(it.priceEur * it.qty)}
              </span>
            </li>
          )
        })}
      </ul>

      <div className="mt-6 space-y-3 border-t border-line pt-5">
        <div className="flex items-baseline justify-between">
          <span className="label text-mute">
            {totals.count} Poster{totals.count === 1 ? '' : 's'}
          </span>
          <span className="t-body font-bold text-cream">{formatEUR(totals.subtotal)}</span>
        </div>
        {totals.discountEur > 0 && (
          <div className="flex items-baseline justify-between">
            <span className="label text-mute">
              Multi-poster −{Math.round(totals.discountRate * 100)}%
            </span>
            <span className="t-body font-bold text-success">−{formatEUR(totals.discountEur)}</span>
          </div>
        )}
        <div className="flex items-baseline justify-between">
          <span className="label text-mute">Delivery</span>
          <span className={cn('t-body font-bold', totals.shipping === 0 ? 'text-success' : 'text-cream')}>
            {totals.shipping === 0 ? 'Free' : formatEUR(totals.shipping)}
          </span>
        </div>
        <div className="flex items-baseline justify-between border-t border-line pt-4">
          <span className="label text-cream">Total</span>
          <span className="t-card">{formatEUR(totals.total)}</span>
        </div>
      </div>
    </Card>
  )
}
