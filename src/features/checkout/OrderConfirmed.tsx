import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Hash, Mail, Package, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/ui/copy-button'
import { useFlowStore } from '@/store/useFlowStore'

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
}

export function OrderConfirmed() {
  const { order, orderNumber, posterUrl, reset } = useFlowStore()

  // Make sure the user lands at the top of this success screen.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <div className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-3xl flex-col items-center px-5 py-16 text-center sm:px-10">
      {/* Hard GREEN square + outline check — success confirmation (not brand orange) */}
      <motion.div
        {...fade}
        transition={{ duration: 0.12 }}
        className="grid size-16 place-items-center bg-success text-ink"
      >
        <Check className="size-9" strokeWidth={1.5} />
      </motion.div>

      <motion.h1
        {...fade}
        transition={{ duration: 0.15, delay: 0.04 }}
        className="mt-6 t-hero"
      >
        Order
        <br />
        Confirmed
      </motion.h1>

      <hr className="rule mx-auto mt-6 w-24" />

      <motion.p
        {...fade}
        transition={{ duration: 0.15, delay: 0.08 }}
        className="mx-auto mt-6 max-w-md t-body"
      >
        Check your email for the invoice and order details that were sent to the
        address you provided.
      </motion.p>

      {posterUrl && (
        <motion.img
          {...fade}
          transition={{ duration: 0.15, delay: 0.1 }}
          src={posterUrl}
          alt="Your poster"
          className="mt-9 w-44 border border-line object-cover"
        />
      )}

      <motion.div
        {...fade}
        transition={{ duration: 0.15, delay: 0.12 }}
        className="mt-8 w-full max-w-sm space-y-px bg-line text-left"
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
          <Package className="size-5 shrink-0 text-mute" strokeWidth={1.5} />
          <div className="min-w-0 flex-1">
            <p className="label-wide text-mute">Delivery</p>
            <p className="truncate t-body text-cream">Framed · 5–7 Days</p>
          </div>
        </div>
      </motion.div>

      <motion.div {...fade} transition={{ duration: 0.15, delay: 0.14 }} className="mt-10">
        <Button variant="ghost" onClick={reset}>
          <RotateCcw className="size-5" strokeWidth={1.5} />
          Create Another
        </Button>
      </motion.div>
    </div>
  )
}
