import * as React from 'react'
import { createPortal } from 'react-dom'
import { ShoppingBag, X, ArrowRight, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { QtyStepper } from '@/components/ui/qty-stepper'
import { cn, formatEUR } from '@/lib/utils'
import { useCartStore, useCartItems } from '@/store/useCartStore'
import { useFlowStore } from '@/store/useFlowStore'
import { useTeams, resolveClub } from '@/store/useCatalogStore'
import { cartTotals } from '@/lib/pricing'

/*
  Header cart popover — the pending posters waiting to be bought. Reuses the
  open/outside-click/Esc/reposition behavior of ui/dropdown-menu.tsx (which is
  hard-wired for row-action lists), but renders a rich panel: thumbnails, the
  volume-discount-aware totals, and a Checkout button. Renders nothing when the
  cart is empty, so the header stays clean until there's something in it.
*/
export function CartMenu() {
  const items = useCartItems()
  const removeItem = useCartStore((s) => s.removeItem)
  const setQty = useCartStore((s) => s.setQty)
  const digitalAddon = useFlowStore((s) => s.digitalAddon)
  const goTo = useFlowStore((s) => s.goTo)
  const teams = useTeams()

  const [open, setOpen] = React.useState(false)
  // The line-item pending deletion confirmation (null = no prompt).
  const [pendingRemove, setPendingRemove] = React.useState<string | null>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const [coords, setCoords] = React.useState<{ top: number; right: number } | null>(null)

  const place = React.useCallback(() => {
    const t = triggerRef.current?.getBoundingClientRect()
    if (!t) return
    setCoords({ top: t.bottom + 6, right: window.innerWidth - t.right })
  }, [])

  React.useLayoutEffect(() => {
    if (!open) return
    place()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
    }
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointerDown, true)
    }
  }, [open, place])

  // Nothing to show until there's something in the cart (also unmounts the
  // panel when the last item is removed, so no explicit close is needed).
  if (items.length === 0) return null

  const totals = cartTotals(items, digitalAddon)

  // Club behind the line-item awaiting delete confirmation (for the prompt copy).
  const pendingItem = items.find((i) => i.id === pendingRemove)
  const pendingClub = pendingItem ? resolveClub(teams, pendingItem.clubId) : null

  function checkout() {
    setOpen(false)
    goTo(4)
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Cart, ${items.length} poster${items.length === 1 ? '' : 's'}`}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((o) => !o)
        }}
        className="relative inline-grid size-9 cursor-pointer place-items-center text-cream transition-colors hover:text-accent"
      >
        <ShoppingBag className="size-5" strokeWidth={1.5} />
        <span className="absolute -right-1 -top-1 grid min-w-[1.05rem] place-items-center bg-accent px-1 text-[11px] font-bold leading-[1.05rem] text-ink">
          {totals.count}
        </span>
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            role="dialog"
            aria-label="Cart"
            style={{ position: 'fixed', top: coords.top, right: coords.right }}
            className="z-50 w-[min(22rem,calc(100vw-1.5rem))] border border-line bg-ink"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="label text-cream">Your Cart · {totals.count}</p>
              <button
                type="button"
                aria-label="Close cart"
                onClick={() => setOpen(false)}
                className="text-mute transition-colors hover:text-cream"
              >
                <X className="size-4" strokeWidth={1.5} />
              </button>
            </div>

            <ul className="max-h-[44vh] divide-y divide-line overflow-y-auto">
              {items.map((it) => {
                const club = resolveClub(teams, it.clubId)
                return (
                  <li key={it.id} className="flex items-center gap-3 px-4 py-3">
                    <img
                      src={it.posterUrl}
                      alt=""
                      className="h-14 w-[42px] shrink-0 border border-line object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate label text-cream">{club?.name ?? 'Poster'}</p>
                      <p className="truncate t-body">{it.format}</p>
                      <div className="mt-2">
                        <QtyStepper value={it.qty} onChange={(q) => setQty(it.id, q)} />
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className="t-body font-bold text-cream">
                        {formatEUR(it.priceEur * it.qty)}
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove ${club?.name ?? 'poster'} from cart`}
                        onClick={() => setPendingRemove(it.id)}
                        className="grid size-7 cursor-pointer place-items-center rounded-full bg-danger/15 text-danger transition-colors hover:bg-danger/25"
                      >
                        <Trash2 className="size-3.5" strokeWidth={2} />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className="space-y-2 border-t border-line px-4 py-3">
              <Row label="Subtotal" value={formatEUR(totals.subtotal)} />
              {totals.discountEur > 0 && (
                <Row
                  label={`Multi-poster −${Math.round(totals.discountRate * 100)}%`}
                  value={`−${formatEUR(totals.discountEur)}`}
                  accent
                />
              )}
              {totals.addonEur > 0 && (
                <Row label="Digital version" value={formatEUR(totals.addonEur)} />
              )}
              <div className="flex items-baseline justify-between border-t border-line pt-2">
                <span className="label text-cream">Total</span>
                <span className="t-card">{formatEUR(totals.total)}</span>
              </div>
            </div>

            <div className="border-t border-line p-3">
              <Button className="w-full" onClick={checkout}>
                Checkout
                <ArrowRight className="size-4" strokeWidth={1.5} />
              </Button>
            </div>
          </div>,
          document.body,
        )}

      <ConfirmDialog
        open={pendingRemove !== null}
        onClose={() => setPendingRemove(null)}
        onConfirm={() => {
          if (pendingRemove) removeItem(pendingRemove)
          setPendingRemove(null)
        }}
        title="Remove poster?"
        message={`${pendingClub?.name ?? 'This poster'} will be removed from your cart.`}
        confirmLabel="Remove"
        image={pendingItem?.posterUrl}
      />
    </>
  )
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="label text-mute">{label}</span>
      <span className={cn('t-body', accent ? 'text-accent' : 'text-cream')}>{value}</span>
    </div>
  )
}
