import type { CartItem, Club, OfferType } from '@/types'
import {
  SHIPPING_EUR,
  VOLUME_DISCOUNTS,
  DIGITAL_PRICE_EUR,
  PRINTED_PRICE_EUR,
  PACK_PRICE_EUR,
  PRINT_SIZES,
} from '@/types'

/** Volume-discount rate for a given poster count (first matching tier wins). */
export function volumeDiscountRate(count: number): number {
  return VOLUME_DISCOUNTS.find((d) => count >= d.min)?.rate ?? 0
}

/**
 * What a chosen print size adds (or removes) versus the BASE size (the first
 * PRINT_SIZES entry). The global size price list is the same for every club; a
 * per-club override shifts the base and the deltas ride on top, so a club only
 * sets one printed/pack price, not one per size. Digital has no size → 0.
 */
function sizeDelta(size?: string): number {
  if (!size) return 0
  const chosen = PRINT_SIZES.find((s) => s.label === size)
  return chosen ? chosen.priceEur - PRINT_SIZES[0].priceEur : 0
}

/**
 * Unit price for an offer at a given print size. A Pro Shop club can override the
 * BASE digital/printed/pack prices (see Club.prices, edited in the back-office);
 * the amateur shop passes no club and gets the catalog default constants. The
 * size delta (printed/pack only) is then added on top.
 */
export function offerPrice(offer: OfferType, club?: Club, size?: string): number {
  const p = club?.prices
  switch (offer) {
    case 'digital':
      return p?.digital ?? DIGITAL_PRICE_EUR
    case 'printed':
      return (p?.printed ?? PRINTED_PRICE_EUR) + sizeDelta(size)
    case 'pack':
      return (p?.pack ?? PACK_PRICE_EUR) + sizeDelta(size)
  }
}

/** The cart `format` label snapshot for an offer (+ chosen print size). */
export function offerFormat(offer: OfferType, size?: string): string {
  switch (offer) {
    case 'digital':
      return 'Digital · HD file'
    case 'printed':
      return size ? `Printed · ${size}` : 'Printed'
    case 'pack':
      return size ? `Pack · ${size} + Digital` : 'Pack + Digital'
  }
}

/** What a Pack saves versus buying the printed poster and digital separately. */
export function packSaving(club?: Club): number {
  return (
    offerPrice('printed', club) + offerPrice('digital', club) - offerPrice('pack', club)
  )
}

export interface CartTotals {
  count: number
  subtotal: number
  discountRate: number
  discountEur: number
  shipping: number
  total: number
}

/**
 * Single source of truth for every price shown across the checkout (cart panel,
 * order summary, pay button, confirmation). Each line carries its own offer
 * price, so digital/printed/pack are all just line items. The volume discount
 * applies to the line subtotal; shipping is added on top.
 */
export function cartTotals(items: CartItem[]): CartTotals {
  const count = items.reduce((sum, it) => sum + it.qty, 0)
  const subtotal = items.reduce((sum, it) => sum + it.priceEur * it.qty, 0)
  const discountRate = volumeDiscountRate(count)
  const discountEur = subtotal * discountRate
  const shipping = SHIPPING_EUR
  const total = subtotal - discountEur + shipping
  return { count, subtotal, discountRate, discountEur, shipping, total }
}
