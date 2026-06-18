import { create } from 'zustand'
import type { CartItem } from '@/types'

/*
  In-session multi-poster cart. Deliberately NOT persisted: the generated poster
  images are large data URLs and a durable cart belongs to the planned backend
  (see the project notes). This lives in memory for the visit — it survives
  step-to-step navigation inside the SPA and is cleared by a hard refresh.

  Kept separate from useFlowStore (the working poster + shipping details) the
  same way useAdminsStore is separate from useCatalogStore.
*/

// Session-unique line-item id. A simple counter is enough in-memory (no persist).
let seq = 0
function nextId(): string {
  seq += 1
  return `cart-${seq}`
}

interface CartState {
  items: CartItem[]
  /** Snapshot a finished poster into the cart; returns the new line-item id. */
  addItem: (item: Omit<CartItem, 'id' | 'addedAt' | 'qty'> & { qty?: number }) => string
  removeItem: (id: string) => void
  /** Set a line-item's quantity (clamped to a minimum of 1). */
  setQty: (id: string, qty: number) => void
  clear: () => void
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: ({ qty, ...item }) => {
    const id = nextId()
    const line: CartItem = { ...item, qty: qty ?? 1, id, addedAt: new Date().toISOString() }
    set((s) => ({ items: [...s.items, line] }))
    return id
  },
  removeItem: (id) => set((s) => ({ items: s.items.filter((it) => it.id !== id) })),
  setQty: (id, qty) =>
    set((s) => ({
      items: s.items.map((it) =>
        it.id === id ? { ...it, qty: Math.max(1, Math.round(qty)) } : it,
      ),
    })),
  clear: () => set({ items: [] }),
}))

/* ── Reactive read hooks (subscribe to the store) ─────────────────────────── */
export const useCartItems = () => useCartStore((s) => s.items)
/** Total units across all line-items (sum of quantities). */
export const useCartCount = () =>
  useCartStore((s) => s.items.reduce((n, it) => n + it.qty, 0))
