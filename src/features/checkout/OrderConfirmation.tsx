import { useState } from 'react'
import { Loader2, Lock } from 'lucide-react'
import { StepScreen } from '@/components/StepScreen'
import { Button } from '@/components/ui/button'
import { OrderSummary } from '@/features/checkout/OrderSummary'
import { useFlowStore } from '@/store/useFlowStore'
import { formatEUR } from '@/lib/utils'
import { POSTER_PRICE_EUR, SHIPPING_EUR } from '@/types'

function generateOrderNumber() {
  const n = Math.floor(Date.now() / 1000) % 1_000_000
  const rand = Math.floor(Math.random() * 900 + 100)
  return `OP-${n.toString().padStart(6, '0')}-${rand}`
}

export function OrderConfirmation() {
  const { order, goTo, setOrderNumber, next } = useFlowStore()
  const [processing, setProcessing] = useState(false)
  const total = POSTER_PRICE_EUR + SHIPPING_EUR

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

        <div className="border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <p className="label text-cream">Contact &amp; Shipping</p>
            <button
              type="button"
              onClick={() => goTo(4)}
              className="label text-accent transition-[filter] duration-100 hover:brightness-110"
            >
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

        <div className="flex items-start gap-3 border border-line bg-surface px-5 py-4">
          <Lock className="mt-0.5 size-4 shrink-0 text-mute" strokeWidth={1.5} />
          <p className="t-body">
            Secured by Stripe. We never store your card details.
          </p>
        </div>
      </div>
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
