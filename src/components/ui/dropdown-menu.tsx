import * as React from 'react'
import { createPortal } from 'react-dom'
import { MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MenuItem {
  label: string
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>
  onClick: () => void
  destructive?: boolean
}

/*
  Row "..." actions popover. Click to toggle; closes on outside click or Esc.
  The menu is PORTALED to <body> and fixed-positioned to the trigger, so it is
  never clipped by the table's overflow container. It flips above the trigger
  when there isn't room below, and re-anchors on scroll/resize.
*/
export function DropdownMenu({
  items,
  label = 'Row actions',
}: {
  items: MenuItem[]
  label?: string
}) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const [coords, setCoords] = React.useState<{ top: number; right: number } | null>(null)

  const place = React.useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return
    const t = trigger.getBoundingClientRect()
    const gap = 4
    const h = menuRef.current?.getBoundingClientRect().height ?? 0
    let top = t.bottom + gap
    // Flip above the trigger if the menu would overflow the viewport bottom.
    if (h && top + h > window.innerHeight - 8 && t.top - h - gap > 8) {
      top = t.top - h - gap
    }
    setCoords({ top, right: window.innerWidth - t.right })
  }, [])

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setOpen((o) => {
      if (!o) {
        // Provisional anchor so the portal renders; the layout effect then
        // refines it (measuring height for the flip) before paint.
        const t = triggerRef.current?.getBoundingClientRect()
        if (t) setCoords({ top: t.bottom + 4, right: window.innerWidth - t.right })
      }
      return !o
    })
  }

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
    // Capture phase so scrolling the table (or any ancestor) re-anchors too.
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

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={toggle}
        className="inline-grid size-9 cursor-pointer place-items-center text-mute transition-colors hover:bg-ink/10 hover:text-cream"
      >
        <MoreHorizontal className="size-5" strokeWidth={1.5} />
      </button>
      {open &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ position: 'fixed', top: coords.top, right: coords.right }}
            className="z-50 min-w-44 border border-line bg-ink py-1 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.55)]"
          >
            {items.map((it) => {
              const Icon = it.icon
              return (
                <button
                  key={it.label}
                  type="button"
                  role="menuitem"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpen(false)
                    it.onClick()
                  }}
                  className={cn(
                    'label flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left transition-colors duration-100 hover:bg-white/10',
                    it.destructive ? 'text-danger' : 'text-on-dark',
                  )}
                >
                  {Icon && <Icon className="size-4" strokeWidth={1.5} />}
                  {it.label}
                </button>
              )
            })}
          </div>,
          document.body,
        )}
    </>
  )
}
