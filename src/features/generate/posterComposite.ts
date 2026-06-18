import type { Club, PosterTemplate } from '@/types'
import { BRAND, BRAND_FONTS } from '@/lib/brand'

/**
 * ── RENDER-ENGINE SEAM ──────────────────────────────────────────────────────
 * Prototype-only client-side compositor. It draws the user's actual uploaded
 * photo onto a themed poster canvas and returns a PNG data URL, so the
 * "generated" result is a real, tangible asset (not just live DOM).
 *
 * In production this is replaced by the server-side render pipeline: the client
 * POSTs the photo + selection to create a render job, then polls for the
 * finished high-resolution asset. The UI contract (a Promise that resolves to
 * an image URL) stays identical, so PosterGeneration.tsx won't need rework.
 *
 * FLAT editorial render: solid fillRect color blocks only, hard photo placement,
 * a solid orange accent rectangle, big Bebas Neue UPPERCASE club name, a tracked
 * "OFFICIAL POSTER" label, and the shortCode in a hard square. Zero gradients,
 * zero shadows, zero rounded corners — a Nike / EA-Sports editorial poster.
 * ────────────────────────────────────────────────────────────────────────────
 */

const W = 1200
const H = 1600

// Brand chrome colors for the poster (independent of the per-club colors below).
const INK = BRAND.ink
const CREAM = BRAND.cream
const ACCENT = BRAND.accent

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

/** Draw `img` into the dest rect with object-contain fitting (centered, no crop). */
function drawContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
) {
  const ir = img.naturalWidth / img.naturalHeight
  const dr = dw / dh
  let w = dw
  let h = dh
  if (ir > dr) h = dw / ir
  else w = dh * ir
  ctx.drawImage(img, dx + (dw - w) / 2, dy + (dh - h) / 2, w, h)
}

/** Draw `img` into the dest rect with object-cover cropping. */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
) {
  const ir = img.naturalWidth / img.naturalHeight
  const dr = dw / dh
  let sx = 0
  let sy = 0
  let sw = img.naturalWidth
  let sh = img.naturalHeight
  if (ir > dr) {
    // image wider — crop sides
    sw = img.naturalHeight * dr
    sx = (img.naturalWidth - sw) / 2
  } else {
    // image taller — crop top/bottom
    sh = img.naturalWidth / dr
    sy = (img.naturalHeight - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
}

/**
 * Flat color-blocked background. Each style stacks solid rectangles in a
 * different arrangement — primary base plus a secondary block. No gradients.
 */
function paintBackground(ctx: CanvasRenderingContext2D, club: Club, template: PosterTemplate) {
  const { primary, secondary } = club.colors

  // Primary fills the whole canvas.
  ctx.fillStyle = primary
  ctx.fillRect(0, 0, W, H)

  // Secondary color block — placement varies per style, always a solid rect.
  ctx.fillStyle = secondary
  if (template.style === 'stadium') {
    ctx.fillRect(0, 0, W, H * 0.34)
  } else if (template.style === 'retro') {
    ctx.fillRect(0, 0, W, H * 0.5)
  } else if (template.style === 'minimal') {
    ctx.fillRect(W * 0.66, 0, W * 0.34, H)
  } else {
    // spotlight — centered vertical band behind the subject
    ctx.fillRect(W * 0.18, 0, W * 0.64, H * 0.72)
  }
}

export interface CompositeInput {
  photoUrl: string
  club: Club
  template: PosterTemplate
}

/** Build the poster and return a PNG data URL. */
export async function compositePoster({
  photoUrl,
  club,
  template,
}: CompositeInput): Promise<string> {
  const [photo, logo] = await Promise.all([
    loadImage(photoUrl),
    // Club crest, if any — failure falls back to the shortCode square below.
    club.logoUrl ? loadImage(club.logoUrl).catch(() => null) : Promise.resolve(null),
    // Ensure the display font is ready so 'Bebas Neue' renders on the canvas.
    document.fonts?.ready?.catch(() => undefined),
  ])

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unsupported')

  paintBackground(ctx, club, template)

  // orange accent rectangle — single sparing accent, a hard top stripe.
  ctx.fillStyle = ACCENT
  ctx.fillRect(0, 0, W, 14)

  // Subject photo — hard rectangle, flat placement, no shadow.
  const pw = W * 0.74
  const ph = H * 0.62
  const px = (W - pw) / 2
  const py = H * 0.1
  drawCover(ctx, photo, px, py, pw, ph)
  // Hairline frame around the photo block.
  ctx.strokeStyle = INK
  ctx.lineWidth = 6
  ctx.strokeRect(px, py, pw, ph)

  // Bottom name bar — solid ink block.
  const barH = H * 0.16
  const barY = H - barH
  ctx.fillStyle = INK
  ctx.fillRect(0, barY, W, barH)

  // Crest at the left of the bar — the real club logo (centered on the ink bar)
  // when available, else the shortCode in a hard primary-filled square.
  const sq = barH
  if (logo) {
    const pad = sq * 0.14
    drawContain(ctx, logo, pad, barY + pad, sq - pad * 2, sq - pad * 2)
  } else {
    ctx.fillStyle = club.colors.primary
    ctx.fillRect(0, barY, sq, sq)
    ctx.fillStyle = CREAM
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `400 ${Math.round(sq * 0.5)}px ${BRAND_FONTS.display}`
    ctx.fillText(club.shortCode.toUpperCase(), sq / 2, barY + sq / 2)
  }

  // Club name — big Bebas Neue UPPERCASE, left-aligned next to the square.
  const textX = sq + 36
  ctx.fillStyle = CREAM
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  let fontSize = 130
  ctx.font = `400 ${fontSize}px ${BRAND_FONTS.display}`
  const name = club.name.toUpperCase()
  while (ctx.measureText(name).width > W - textX - 40 && fontSize > 48) {
    fontSize -= 4
    ctx.font = `400 ${fontSize}px ${BRAND_FONTS.display}`
  }
  ctx.fillText(name, textX, barY + barH * 0.6)

  // "OFFICIAL POSTER" label — tracked, muted, under the name.
  // (cream @ 50% — keep the RGB in sync with BRAND.cream on a rebrand)
  ctx.fillStyle = 'rgba(244, 244, 245, 0.5)'
  ctx.font = `700 24px ${BRAND_FONTS.ui}`
  ctx.fillText(letterspace('OFFICIAL POSTER'), textX, barY + barH * 0.82)

  return canvas.toDataURL('image/png')
}

/** Insert hair spaces between characters to fake wide letter-tracking. */
function letterspace(text: string): string {
  return text.split('').join(' ')
}
