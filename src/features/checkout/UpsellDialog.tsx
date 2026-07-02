import { Gift, Smartphone, Share2, Frame, Truck } from 'lucide-react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckBadge } from '@/components/ui/check-badge'
import { formatEUR } from '@/lib/utils'

/* What the missing half of the Pack adds, per source offer — shown as a
   structured checklist so the value reads at a glance instead of as prose. */
const COPY = {
  printed: {
    pitch:
      'Add the digital version to your printed poster — keep it on your phone in full resolution, yours to share forever.',
    perks: [
      { icon: Smartphone, text: 'Full-HD file, ready to download' },
      { icon: Share2, text: 'Share instantly with family & friends' },
    ],
    decline: 'No Thanks, Printed Only',
    footnote: 'Your framed poster is already included',
  },
  digital: {
    pitch:
      'Add the framed print to your digital file — museum-grade paper, shipped to your door, ready to hang.',
    perks: [
      { icon: Frame, text: 'Framed 30×40 cm print of your poster' },
      { icon: Truck, text: 'Shipped straight to your door' },
    ],
    decline: 'No Thanks, Digital Only',
    footnote: 'Your digital file is already included',
  },
}

/*
  "Make it a Pack" upsell — fires when a printed-only or digital-only poster is
  added to the cart. Accepting upgrades the cart line to a Pack (printed +
  digital) for the top-up; declining keeps the original offer. Built on the
  shared Dialog.
*/
export function UpsellDialog({
  open,
  from = 'printed',
  topUp,
  saving,
  onClose,
  onAccept,
}: {
  open: boolean
  /** The offer being upgraded — drives the pitch for the Pack's missing half. */
  from?: 'printed' | 'digital'
  /** What the upgrade to a Pack costs on top of the current offer (EUR). */
  topUp: number
  /** What the Pack saves vs buying printed + digital separately (EUR). */
  saving?: number
  onClose: () => void
  onAccept: () => void
}) {
  const copy = COPY[from]
  return (
    <Dialog open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center">
        {/* Eyebrow tag — frames this as a bonus, not a required step */}
        <span className="inline-flex items-center gap-1.5 bg-cream px-2.5 py-1 label text-ink">
          <Gift className="size-3.5" strokeWidth={2} />
          Best Value
        </span>

        <h2 className="mt-4 t-card">Make It A Pack</h2>
        <p className="mt-2 max-w-xs t-body">{copy.pitch}</p>

        {/* What you get — bordered value box anchors the middle of the layout */}
        <ul className="mt-5 w-full divide-y divide-line border border-line bg-ink/40 text-left">
          {copy.perks.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 px-4 py-3">
              <Icon className="size-4 shrink-0 text-accent" strokeWidth={1.5} />
              <span className="t-body text-cream">{text}</span>
              <CheckBadge className="ml-auto size-5" />
            </li>
          ))}
        </ul>

        {/* Price — the top-up to upgrade, with the saving called out */}
        <div className="mt-5 flex items-baseline justify-center gap-2">
          <span className="t-card text-cream">+{formatEUR(topUp)}</span>
          <span className="label-wide text-mute">to upgrade</span>
        </div>
        {saving != null && saving > 0 && (
          <p className="mt-1 label-wide text-success">
            Save {formatEUR(saving)} vs buying both
          </p>
        )}

        <div className="mt-5 flex w-full flex-col gap-3">
          <Button size="lg" className="w-full" onClick={onAccept}>
            Yes, Make It A Pack
          </Button>
          <Button variant="ghost" size="lg" className="w-full" onClick={onClose}>
            {copy.decline}
          </Button>
        </div>

        <p className="mt-4 t-meta text-mute">{copy.footnote}</p>
      </div>
    </Dialog>
  )
}
