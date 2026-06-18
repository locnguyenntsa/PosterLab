import { useState } from 'react'
import { Check, Loader2, Lock, Pencil } from 'lucide-react'
import { StepScreen } from '@/components/StepScreen'
import { Button } from '@/components/ui/button'
import { OrderSummary } from '@/features/checkout/OrderSummary'
import { UpsellDialog } from '@/features/checkout/UpsellDialog'
import { useFlowStore } from '@/store/useFlowStore'
import { useCartItems } from '@/store/useCartStore'
import { cartTotals } from '@/lib/pricing'
import { cn, formatEUR } from '@/lib/utils'
import { DIGITAL_ADDON_EUR } from '@/types'

function generateOrderNumber() {
  const n = Math.floor(Date.now() / 1000) % 1_000_000
  const rand = Math.floor(Math.random() * 900 + 100)
  return `PL-${n.toString().padStart(6, '0')}-${rand}`
}

export function OrderConfirmation() {
  const { order, goTo, setOrderNumber, next, digitalAddon, setDigitalAddon } = useFlowStore()
  const items = useCartItems()
  const [processing, setProcessing] = useState(false)
  // Offer the digital version at the ordering moment (deck screen 5): the pop-up
  // opens on entering Review & Pay unless it's already been added.
  const [showUpsell, setShowUpsell] = useState(!digitalAddon)
  const total = cartTotals(items, digitalAddon).total

  function confirmAndPay() {
    setProcessing(true)
    // ── PAYMENT SEAM ──────────────────────────────────────────────
    // Prototype: simulate the Stripe round-trip. In production this calls
    // the backend to create a Stripe Checkout Session and redirects to the
    // hosted page; the success_url returns the user to the confirmed step.
    setTimeout(() => {
      setOrderNumber(generateOrderNumber())
      next()
    }, 1400)
  }

  return (
    <StepScreen
      step={5}
      kicker="Final Step"
      title="Review & Pay"
      subtitle="Check it all before you commit. No surprises."
      footer={
        <Button className="w-full" size="lg" onClick={confirmAndPay} disabled={processing}>
          {processing ? (
            <>
              <Loader2 className="size-5 animate-spin" strokeWidth={1.5} />
              Processing
            </>
          ) : (
            <>
              <Lock className="size-5" strokeWidth={1.5} />
              Pay {formatEUR(total)}
            </>
          )}
        </Button>
      }
    >
      <div className="space-y-7">
        <OrderSummary />

        {/* Digital-version add-on — stays available after the pop-up is dismissed */}
        <button
          type="button"
          role="checkbox"
          aria-checked={digitalAddon}
          onClick={() => setDigitalAddon(!digitalAddon)}
          className={cn(
            'flex w-full items-center gap-4 border bg-surface px-5 py-4 text-left transition-colors duration-100',
            digitalAddon ? 'border-accent' : 'border-line hover:border-cream/30',
          )}
        >
          <span
            className={cn(
              'grid size-6 shrink-0 place-items-center border transition-colors duration-100',
              digitalAddon
                ? 'border-accent bg-accent text-ink'
                : 'border-mute text-transparent',
            )}
          >
            <Check className="size-4" strokeWidth={3} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block label text-cream">Digital Version</span>
            <span className="block t-body">High-res file on your phone — easy to share.</span>
          </span>
          <span className={cn('label shrink-0', digitalAddon ? 'text-accent' : 'text-mute')}>
            +{formatEUR(DIGITAL_ADDON_EUR)}
          </span>
        </button>

        <div className="border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <p className="label text-cream">Contact &amp; Shipping</p>
            <button
              type="button"
              onClick={() => goTo(4)}
              className="inline-flex items-center gap-1.5 label text-accent transition-[filter] duration-100 hover:brightness-110"
            >
              <Pencil className="size-3.5" strokeWidth={2} />
              Edit
            </button>
          </div>
          <dl className="grid grid-cols-1 gap-px bg-line">
            <Row label="Name" value={`${order.firstName} ${order.lastName}`} />
            <Row label="Email" value={order.email} />
            <Row label="Phone" value={order.phone} />
            <Row
              label="Address"
              value={`${order.address}, ${order.postalCode} ${order.city}, ${order.country}`}
            />
          </dl>
        </div>

        <div className="flex items-center gap-3 border border-line bg-surface px-5 py-4">
          <Lock className="size-5 shrink-0 text-mute" strokeWidth={1.5} />
          <p className="t-body">
            Secured by Stripe. We never store your card details.
          </p>
        </div>
      </div>

      <UpsellDialog
        open={showUpsell}
        onClose={() => setShowUpsell(false)}
        onAccept={() => {
          setDigitalAddon(true)
          setShowUpsell(false)
        }}
      />
    </StepScreen>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 bg-surface px-5 py-3">
      <dt className="label-wide shrink-0 text-mute">{label}</dt>
      <dd className="min-w-0 truncate text-right t-body text-cream">{value}</dd>
    </div>
  )
}
