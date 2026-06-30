import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { toPng } from 'html-to-image'
import { Check, Download, Hash, Loader2, Mail, Package, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/ui/copy-button'
import { PosterTiltCard } from '@/components/PosterTiltCard'
import { Invoice } from '@/features/checkout/Invoice'
import { useFlowStore } from '@/store/useFlowStore'
import { useCartItems, useCartStore } from '@/store/useCartStore'
import { useTeams } from '@/store/useCatalogStore'
import { cartTotals } from '@/lib/pricing'

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
}

export function OrderConfirmed() {
  const { order, orderNumber, reset } = useFlowStore()
  const items = useCartItems()
  const clearCart = useCartStore((s) => s.clear)
  const teams = useTeams()
  const totals = cartTotals(items)
  // Split the delivery summary by fulfilment: printed/pack ship, digital is an
  // instant download. A digital-only order never claims a framed poster ships.
  const physicalCount = items
    .filter((it) => it.offer !== 'digital')
    .reduce((n, it) => n + it.qty, 0)
  const digitalCount = items
    .filter((it) => it.offer === 'digital')
    .reduce((n, it) => n + it.qty, 0)
  const digitalOnly = physicalCount === 0

  const invoiceRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  // Snapshot the off-screen A4 invoice to a PNG and trigger a download.
  async function downloadInvoice() {
    const node = invoiceRef.current
    if (!node || downloading) return
    setDownloading(true)
    try {
      const dataUrl = await toPng(node, { pixelRatio: 2, backgroundColor: '#ffffff', width: 794, height: 1123 })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `poster-lab-invoice-${orderNumber ?? 'order'}.png`
      a.click()
    } finally {
      setDownloading(false)
    }
  }

  // Make sure the user lands at the top of this success screen.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  // "Create Another" empties the cart and wipes the working poster — a clean slate.
  function startFresh() {
    clearCart()
    reset()
  }

  return (
    <div className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-3xl flex-col items-center px-5 pb-10 pt-20 text-center sm:px-10 sm:pt-28">
      {/* Check stacked above the title, both centered — matches the Figma spec
          (vertical layout, 64px check, 28px gap, single-line title). */}
      <motion.div
        {...fade}
        transition={{ duration: 0.12 }}
        className="flex flex-col items-center gap-7"
      >
        <span className="grid size-16 shrink-0 place-items-center bg-success text-ink">
          <Check className="size-9" strokeWidth={1.5} />
        </span>
        <h1 className="t-section whitespace-nowrap">Order Confirmed</h1>
      </motion.div>

      <hr className="rule mx-auto mt-5 w-24" />

      <motion.p
        {...fade}
        transition={{ duration: 0.15, delay: 0.08 }}
        className="mx-auto mt-5 max-w-md t-body"
      >
        Check your email for the invoice and order details that were sent to the
        address you provided.
      </motion.p>

      {items.length > 0 && (
        <motion.div
          {...fade}
          transition={{ duration: 0.15, delay: 0.1 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-4"
        >
          {items.map((it) => (
            <PosterTiltCard key={it.id} className="w-28">
              <img src={it.posterUrl} alt="Your poster" className="block w-full" />
            </PosterTiltCard>
          ))}
        </motion.div>
      )}

      <motion.div
        {...fade}
        transition={{ duration: 0.15, delay: 0.12 }}
        className="mt-6 w-full max-w-sm space-y-px bg-line text-left"
      >
        {orderNumber && (
          <div className="flex items-center gap-3 bg-surface px-5 py-4">
            <Hash className="size-5 shrink-0 text-mute" strokeWidth={1.5} />
            <div className="min-w-0 flex-1">
              <p className="label-wide text-mute">Order No.</p>
              <p className="truncate t-card">
                {orderNumber}
              </p>
            </div>
            <CopyButton value={orderNumber} label="Copy order number" />
          </div>
        )}
        <div className="flex items-center gap-3 bg-surface px-4 py-3">
          <Mail className="size-5 shrink-0 text-mute" strokeWidth={1.5} />
          <div className="min-w-0 flex-1">
            <p className="label-wide text-mute">Invoice &amp; confirmation</p>
            <p className="truncate t-body text-cream">{order.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-surface px-4 py-3">
          {digitalOnly ? (
            <Download className="size-5 shrink-0 text-mute" strokeWidth={1.5} />
          ) : (
            <Package className="size-5 shrink-0 text-mute" strokeWidth={1.5} />
          )}
          <div className="min-w-0 flex-1">
            <p className="label-wide text-mute">Delivery</p>
            <p className="truncate t-body text-cream">
              {digitalOnly
                ? `${digitalCount} Digital File${digitalCount === 1 ? '' : 's'} · Instant Download`
                : `${physicalCount} Poster${physicalCount === 1 ? '' : 's'} · Framed · 5–7 Days`}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        {...fade}
        transition={{ duration: 0.15, delay: 0.14 }}
        className="mt-8 flex flex-wrap items-center justify-center gap-3"
      >
        <Button variant="outline" onClick={downloadInvoice} disabled={downloading}>
          {downloading ? (
            <Loader2 className="size-5 animate-spin" strokeWidth={1.5} />
          ) : (
            <Download className="size-5" strokeWidth={1.5} />
          )}
          Download Invoice
        </Button>
        <Button variant="ghost" onClick={startFresh}>
          <RotateCcw className="size-5" strokeWidth={1.5} />
          Create Another
        </Button>
      </motion.div>

      {/* Off-screen A4 invoice — rendered (not hidden) so html-to-image can snapshot it. */}
      {orderNumber && (
        <div aria-hidden style={{ position: 'fixed', left: -10000, top: 0, pointerEvents: 'none' }}>
          <Invoice
            ref={invoiceRef}
            order={order}
            orderNumber={orderNumber}
            items={items}
            totals={totals}
            teams={teams}
            dateStr={new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          />
        </div>
      )}
    </div>
  )
}
