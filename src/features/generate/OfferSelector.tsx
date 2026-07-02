import { Check } from 'lucide-react'
import type { Club, OfferType } from '@/types'
import { PRINT_SIZES } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { QtyStepper } from '@/components/ui/qty-stepper'
import { offerPrice, packSaving } from '@/lib/pricing'
import { cn, formatEUR } from '@/lib/utils'

const OFFERS: { id: OfferType; title: string; desc: string }[] = [
  { id: 'digital', title: 'Digital', desc: 'HD file — download & share instantly.' },
  { id: 'printed', title: 'Printed', desc: 'Framed poster, shipped to your door.' },
  { id: 'pack', title: 'Pack', desc: 'Printed poster + the digital file.' },
]

/*
  The amateur "Poster Ready" offer chooser: three selectable cards (Digital /
  Printed / Pack). Printed & Pack reveal a print size + quantity; Pack is pushed
  as the best value with the saving vs buying both separately. A Pro Shop club
  passes its price overrides so the figures reflect the back-office pricing.
*/
export function OfferSelector({
  offer,
  onOffer,
  size,
  onSize,
  qty,
  onQty,
  club,
  disabled,
}: {
  offer: OfferType
  onOffer: (o: OfferType) => void
  size: string
  onSize: (s: string) => void
  qty: number
  onQty: (n: number) => void
  club?: Club
  disabled?: boolean
}) {
  const saving = packSaving(club)

  return (
    <div className="w-full max-w-xl space-y-4">
      {OFFERS.map((o) => {
        const selected = o.id === offer
        const isPack = o.id === 'pack'
        const hasSize = o.id === 'printed' || o.id === 'pack'
        return (
          <div
            key={o.id}
            className={cn(
              // 2px box always (no layout shift on select); selection = white stroke.
              'border-2 bg-surface transition-colors duration-100',
              selected ? 'border-cream' : 'border-line',
            )}
          >
            <button
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => onOffer(o.id)}
              className="flex w-full items-start gap-4 px-6 py-5 text-left disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span
                className={cn(
                  'mt-0.5 grid size-5 shrink-0 place-items-center border transition-colors duration-100',
                  selected ? 'border-cream bg-cream text-ink' : 'border-mute text-transparent',
                )}
              >
                <Check className="size-3.5" strokeWidth={3} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="label text-cream">{o.title}</span>
                  {isPack && <Badge variant="success">Best value</Badge>}
                </span>
                <span className="mt-1 block t-body">{o.desc}</span>
                {isPack && saving > 0 && (
                  <span className="mt-1 block label-wide text-success">
                    Save {formatEUR(saving)} vs buying both
                  </span>
                )}
              </span>
              <span className="shrink-0 self-center t-card text-cream">
                {formatEUR(offerPrice(o.id, club, size))}
              </span>
            </button>

            {selected && hasSize && (
              <div className="flex flex-wrap items-center gap-4 border-t border-line px-6 py-4">
                {/* A single catalog size reads as a fixed format, not a choice. */}
                {PRINT_SIZES.length > 1 ? (
                  <Select
                    aria-label="Print size"
                    className="min-w-[12rem] flex-1"
                    value={size}
                    onChange={onSize}
                    options={PRINT_SIZES.map((s) => ({
                      value: s.label,
                      label: s.label,
                      hint: formatEUR(offerPrice(o.id, club, s.label)),
                    }))}
                    disabled={disabled}
                  />
                ) : (
                  <span className="min-w-0 flex-1 t-body text-cream">{size}</span>
                )}
                <QtyStepper value={qty} onChange={onQty} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
