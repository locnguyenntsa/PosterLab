import { Gift, Smartphone, Share2 } from 'lucide-react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckBadge } from '@/components/ui/check-badge'
import { formatEUR } from '@/lib/utils'
import { DIGITAL_ADDON_EUR } from '@/types'

// Benefits of the digital add-on, shown as a structured checklist so the value
// reads at a glance instead of as a wall of prose.
const PERKS = [
  { icon: Smartphone, text: 'Full-HD file, ready to download' },
  { icon: Share2, text: 'Share instantly with family & friends' },
]

/*
  Upsell offered at the ordering moment (deck screen 5): a low-cost digital
  version of the poster. Built on the shared Dialog primitive. Accepting flips
  the `digitalAddon` flag in the flow store; declining just closes.
*/
export function UpsellDialog({
  open,
  onClose,
  onAccept,
}: {
  open: boolean
  onClose: () => void
  onAccept: () => void
}) {
  return (
    <Dialog open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center">
        {/* Eyebrow tag — frames this as a bonus, not a required step */}
        <span className="inline-flex items-center gap-1.5 bg-cream px-2.5 py-1 label text-ink">
          <Gift className="size-3.5" strokeWidth={2} />
          Optional Add-On
        </span>

        <h2 className="mt-4 t-card">Add The Digital Version</h2>
        <p className="mt-2 max-w-xs t-body">
          Keep your poster on your phone in full resolution — yours to share
          forever.
        </p>

        {/* What you get — bordered value box anchors the middle of the layout */}
        <ul className="mt-5 w-full divide-y divide-line border border-line bg-ink/40 text-left">
          {PERKS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 px-4 py-3">
              <Icon className="size-4 shrink-0 text-accent" strokeWidth={1.5} />
              <span className="t-body text-cream">{text}</span>
              <CheckBadge className="ml-auto size-5" />
            </li>
          ))}
        </ul>

        {/* Price — the focal number, oversized and accented */}
        <div className="mt-5 flex items-baseline justify-center gap-2">
          <span className="t-card text-accent">+{formatEUR(DIGITAL_ADDON_EUR)}</span>
          <span className="label-wide text-mute">one-time</span>
        </div>

        <div className="mt-5 flex w-full flex-col gap-3">
          <Button size="lg" className="w-full" onClick={onAccept}>
            Yes, Add It
          </Button>
          <Button variant="ghost" size="lg" className="w-full" onClick={onClose}>
            No Thanks
          </Button>
        </div>

        <p className="mt-4 t-meta text-mute">
          Your framed poster is already included
        </p>
      </div>
    </Dialog>
  )
}
