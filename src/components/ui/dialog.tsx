import * as React from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
} as const

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'

/*
  Flat portal modal: ink backdrop, surface panel with a orange top rule. Closes on
  Esc and backdrop click. Traps Tab focus inside the panel and restores focus to
  the previously-focused element on close. Body scroll is locked while open.
*/
export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  size?: keyof typeof SIZES
}) {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const lastFocused = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    if (!open) return
    lastFocused.current = document.activeElement as HTMLElement | null
    const body = document.body
    const prevOverflow = body.style.overflow
    body.style.overflow = 'hidden'

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    const focusTimer = window.setTimeout(() => {
      const panel = panelRef.current
      panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus()
    }, 30)

    return () => {
      document.removeEventListener('keydown', onKey)
      body.style.overflow = prevOverflow
      window.clearTimeout(focusTimer)
      lastFocused.current?.focus?.()
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        >
          <div className="fixed inset-0 bg-ink/80" onClick={onClose} aria-hidden />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'relative z-10 my-auto w-full border border-line bg-surface',
              'shadow-[0_24px_70px_-12px_rgba(0,0,0,0.75)]',
              'before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-accent before:content-[""]',
              SIZES[size],
            )}
          >
            {title && (
              <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
                <h2 className="t-card">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="cursor-pointer text-mute transition-colors hover:text-cream"
                >
                  <X className="size-5" strokeWidth={1.5} />
                </button>
              </div>
            )}
            <div className="px-6 py-5">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-3 border-t border-line px-6 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
