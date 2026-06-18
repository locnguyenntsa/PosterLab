import type { CartItem } from '@/types'
import { SHIPPING_EUR, DIGITAL_ADDON_EUR, VOLUME_DISCOUNTS } from '@/types'

/** Volume-discount rate for a given poster count (first matching tier wins). */
export function volumeDiscountRate(count: number): number {
  return VOLUME_DISCOUNTS.find((d) => count >= d.min)?.rate ?? 0
}

export interface CartTotals {
  count: number
  subtotal: number
  discountRate: number
  discountEur: number
  addonEur: number
  shipping: number
  total: number
}

/**
 * Single source of truth for every price shown across the checkout (cart panel,
 * order summary, pay button, confirmation). The volume discount applies to the
 * poster subtotal only — the digital add-on and shipping are excluded.
 */
export function cartTotals(items: CartItem[], digitalAddon: boolean): CartTotals {
  const count = items.reduce((sum, it) => sum + it.qty, 0)
  const subtotal = items.reduce((sum, it) => sum + it.priceEur * it.qty, 0)
  const discountRate = volumeDiscountRate(count)
  const discountEur = subtotal * discountRate
  const addonEur = digitalAddon ? DIGITAL_ADDON_EUR : 0
  const shipping = SHIPPING_EUR
  const total = subtotal - discountEur + addonEur + shipping
  return { count, subtotal, discountRate, discountEur, addonEur, shipping, total }
}
