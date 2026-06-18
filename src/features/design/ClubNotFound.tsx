import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ChevronRight, MapPinOff, Palette, Send, type LucideIcon } from 'lucide-react'
import { TransmitDialog } from '@/features/design/TransmitDialog'
import { DEFAULT_GENERIC_COLOR } from '@/data/generic'
import { GENERIC_PRICE_EUR } from '@/types'
import { formatEUR } from '@/lib/utils'

/*
  The "club not a partner yet" edge case, shown inside the club step when the user
  taps a not-yet-registered club or the "My club isn't listed" tile. Two ways
  forward: transmit a referral message to the club's staff, or buy a logo-less
  generic poster in the colors of their choice (€14.99).
*/
export function ClubNotFound({
  onClose,
  onGeneric,
}: {
  /** Return to the club list. */
  onClose: () => void
  /** Enter the generic-design flow with a starting color. */
  onGeneric: (color: string) => void
}) {
  const [showTransmit, setShowTransmit] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={onClose}
        className="mb-6 inline-flex items-center gap-1.5 label text-mute transition-colors duration-100 hover:text-cream"
      >
        <ArrowLeft className="size-4" strokeWidth={1.5} />
        Back to clubs
      </button>

      <div className="flex flex-col items-center text-center">
        <span className="grid size-14 place-items-center bg-cream/15 text-cream">
          <MapPinOff className="size-7" strokeWidth={1.5} />
        </span>
        <h2 className="mt-4 t-card">Club Not Found In Your Region</h2>
        <p className="mt-2 max-w-sm t-body">It’s not in our catalogue yet. Two ways forward:</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-px border border-line bg-line backdrop-blur-sm sm:grid-cols-2">
        <Option
          icon={Send}
          title="Transmit To Your Staff"
          text="Send your club a ready-made message so they can join us."
          onClick={() => setShowTransmit(true)}
        />
        <Option
          icon={Palette}
          title="Generic Design"
          text={`A logo-less poster in your colors — just ${formatEUR(GENERIC_PRICE_EUR)}.`}
          onClick={() => onGeneric(DEFAULT_GENERIC_COLOR)}
        />
      </div>

      <TransmitDialog open={showTransmit} onClose={() => setShowTransmit(false)} />
    </div>
  )
}

function Option({
  icon: Icon,
  title,
  text,
  onClick,
}: {
  icon: LucideIcon
  title: string
  text: string
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.12 }}
      onClick={onClick}
      className="group flex flex-col items-start gap-4 bg-surface p-6 text-left transition-[background-color] duration-100 hover:bg-primary"
    >
      <span className="grid size-12 place-items-center bg-cream/15 text-cream">
        <Icon className="size-6" strokeWidth={1.5} />
      </span>
      <span className="t-card text-2xl">{title}</span>
      <span className="t-body">{text}</span>
      <span className="mt-1 inline-flex items-center gap-1 label-wide text-accent">
        Continue
        <ChevronRight className="size-3.5" strokeWidth={2} />
      </span>
    </motion.button>
  )
}
