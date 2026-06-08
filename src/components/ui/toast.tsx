import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'
import { useToastStore } from '@/store/useToastStore'
import type { ToastVariant } from '@/store/useToastStore'
import { cn } from '@/lib/utils'

const ICONS = { success: CheckCircle2, danger: AlertTriangle, info: Info }
const BORDER: Record<ToastVariant, string> = {
  success: 'border-l-accent',
  danger: 'border-l-danger',
  info: 'border-l-cream',
}
const ICON_COLOR: Record<ToastVariant, string> = {
  success: 'text-accent',
  danger: 'text-danger',
  info: 'text-on-dark',
}

/* Flat toast stack, bottom-right. Reads the toast queue from useToastStore. */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  return createPortal(
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.variant]
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'pointer-events-auto flex items-center gap-3 border border-line border-l-[3px] bg-ink px-4 py-3',
                BORDER[t.variant],
              )}
            >
              <Icon className={cn('size-5 shrink-0', ICON_COLOR[t.variant])} strokeWidth={1.5} />
              <span className="flex-1 text-[15px] font-semibold leading-snug text-on-dark">
                {t.message}
              </span>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className="cursor-pointer text-on-dark/60 transition-colors hover:text-on-dark"
              >
                <X className="size-4" strokeWidth={1.5} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>,
    document.body,
  )
}
