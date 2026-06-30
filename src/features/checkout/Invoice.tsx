import { forwardRef } from 'react'
import { formatEUR } from '@/lib/utils'
import { resolveClub } from '@/store/useCatalogStore'
import type { CartItem, Club, OrderDetails } from '@/types'
import type { CartTotals } from '@/lib/pricing'

/*
  Print-ready A4 invoice (794×1123px @ 96dpi) captured to PNG via html-to-image
  on the Order Confirmed screen. Rendered off-screen, so it uses self-contained
  light-document styling (white sheet, dark text) rather than the app's dark
  theme tokens — html-to-image snapshots the computed styles as-is.
*/
const INK = '#18181b'
const MUTE = '#6b6770'
const LINE = '#e5e5e5'
const ACCENT = '#ff4f18'

export const Invoice = forwardRef<
  HTMLDivElement,
  {
    order: OrderDetails
    orderNumber: string
    items: CartItem[]
    totals: CartTotals
    teams: Club[]
    dateStr: string
  }
>(function Invoice({ order, orderNumber, items, totals, teams, dateStr }, ref) {
  const cell = { padding: '10px 0', fontFamily: 'Inter, sans-serif', fontSize: 13 }
  // Digital-only orders don't ship — keep the footer fulfilment line honest.
  const hasPhysical = items.some((it) => it.offer !== 'digital')
  return (
    <div
      ref={ref}
      style={{
        width: 794,
        minHeight: 1123,
        background: '#ffffff',
        color: INK,
        padding: 56,
        boxSizing: 'border-box',
        fontFamily: 'Inter, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header — brand + INVOICE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, background: ACCENT, display: 'grid', placeItems: 'center' }}>
            <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, color: '#0a0a0a', lineHeight: 1 }}>PL</span>
          </div>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 30, lineHeight: 1 }}>
            Poster <span style={{ color: ACCENT }}>Lab</span>
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 44, lineHeight: 1 }}>Invoice</div>
          <div style={{ fontSize: 12, color: MUTE, letterSpacing: '0.08em', marginTop: 4 }}>
            {dateStr}
          </div>
        </div>
      </div>

      <div style={{ height: 3, background: ACCENT, margin: '24px 0' }} />

      {/* Meta — order no + billed to */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 32 }}>
        <div>
          <div style={{ fontSize: 11, color: MUTE, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Billed To</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginTop: 6 }}>
            {order.firstName} {order.lastName}
          </div>
          <div style={{ fontSize: 13, color: MUTE, marginTop: 2 }}>{order.email}</div>
          <div style={{ fontSize: 13, color: MUTE, marginTop: 2 }}>{order.phone}</div>
          <div style={{ fontSize: 13, color: MUTE, marginTop: 2, maxWidth: 280 }}>
            {order.address}, {order.postalCode} {order.city}, {order.country}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: MUTE, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Order No.</div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 26, lineHeight: 1.1, marginTop: 6 }}>
            {orderNumber}
          </div>
        </div>
      </div>

      {/* Line items */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 36 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${INK}` }}>
            <th style={{ ...cell, textAlign: 'left', fontSize: 11, color: MUTE, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Item</th>
            <th style={{ ...cell, textAlign: 'center', fontSize: 11, color: MUTE, letterSpacing: '0.12em', textTransform: 'uppercase', width: 60 }}>Qty</th>
            <th style={{ ...cell, textAlign: 'right', fontSize: 11, color: MUTE, letterSpacing: '0.12em', textTransform: 'uppercase', width: 100 }}>Unit</th>
            <th style={{ ...cell, textAlign: 'right', fontSize: 11, color: MUTE, letterSpacing: '0.12em', textTransform: 'uppercase', width: 110 }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => {
            const club = resolveClub(teams, it.clubId)
            return (
              <tr key={it.id} style={{ borderBottom: `1px solid ${LINE}` }}>
                <td style={{ ...cell }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{club?.name ?? 'Poster'} Poster</div>
                  <div style={{ color: MUTE, fontSize: 12, marginTop: 2 }}>{it.format}</div>
                </td>
                <td style={{ ...cell, textAlign: 'center' }}>{it.qty}</td>
                <td style={{ ...cell, textAlign: 'right' }}>{formatEUR(it.priceEur)}</td>
                <td style={{ ...cell, textAlign: 'right', fontWeight: 700 }}>{formatEUR(it.priceEur * it.qty)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28 }}>
        <div style={{ width: 320 }}>
          <Row label={`Subtotal (${totals.count} poster${totals.count === 1 ? '' : 's'})`} value={formatEUR(totals.subtotal)} />
          {totals.discountEur > 0 && (
            <Row label={`Multi-poster −${Math.round(totals.discountRate * 100)}%`} value={`−${formatEUR(totals.discountEur)}`} color="#16a34a" />
          )}
          <Row label="Delivery" value={totals.shipping === 0 ? 'Free' : formatEUR(totals.shipping)} color={totals.shipping === 0 ? '#16a34a' : undefined} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: `2px solid ${INK}`, marginTop: 10, paddingTop: 12 }}>
            <span style={{ fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>Total</span>
            <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 34, lineHeight: 1 }}>{formatEUR(totals.total)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 'auto', borderTop: `1px solid ${LINE}`, paddingTop: 20 }}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20 }}>Thank you for your order</div>
        <div style={{ fontSize: 12, color: MUTE, marginTop: 6, lineHeight: 1.6 }}>
          {hasPhysical
            ? 'Print on demand · Framed · Ships in 5–7 days. '
            : 'Digital delivery · Download link sent to your email. '}
          Questions? Reply to your confirmation email. This document was generated by Poster Lab and
          serves as your purchase receipt.
        </div>
      </div>
    </div>
  )
})

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '6px 0' }}>
      <span style={{ fontSize: 13, color: MUTE }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: color ?? INK }}>{value}</span>
    </div>
  )
}
