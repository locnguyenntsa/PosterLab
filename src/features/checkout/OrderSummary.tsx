import { formatEUR } from '@/lib/utils'
import { POSTER_PRICE_EUR, SHIPPING_EUR } from '@/types'
import { useFlowStore } from '@/store/useFlowStore'
import { useTeams, useDesigns } from '@/store/useCatalogStore'
import { Card } from '@/components/ui/card'

/** Compact order recap: poster thumbnail, what was chosen, and pricing. */
export function OrderSummary() {
  const { posterUrl, clubId, templateId } = useFlowStore()
  const teams = useTeams()
  const designs = useDesigns()
  const club = teams.find((c) => c.id === clubId)
  const template = designs.find((d) => d.id === templateId)
  const total = POSTER_PRICE_EUR + SHIPPING_EUR

  return (
    <Card accent className="p-6">
      <div className="flex gap-5">
        {posterUrl && (
          <img
            src={posterUrl}
            alt="Your poster"
            className="h-28 shrink-0 border border-line object-cover"
            style={{ width: 84 }}
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
          <p className="t-card">
            {club?.name} Poster
          </p>
          <p className="label-wide text-mute">
            {template?.name} · Framed · A2 42×59
          </p>
          <p className="label-wide text-mute">
            Print On Demand · Ships 5–7 Days
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3 border-t border-line pt-5">
        <div className="flex items-baseline justify-between">
          <span className="label text-mute">Poster Framed</span>
          <span className="t-body text-cream">{formatEUR(POSTER_PRICE_EUR)}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="label text-mute">Delivery</span>
          <span className="t-body text-accent">
            {SHIPPING_EUR === 0 ? 'Free' : formatEUR(SHIPPING_EUR)}
          </span>
        </div>
        <div className="flex items-baseline justify-between border-t border-line pt-4">
          <span className="label text-cream">Total</span>
          <span className="t-card">
            {formatEUR(total)}
          </span>
        </div>
      </div>
    </Card>
  )
}
