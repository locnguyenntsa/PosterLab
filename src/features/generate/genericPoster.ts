/**
 * Generic non-partner poster — the "SAISON" stadium template (Figma node
 * 112-978). A photographic stadium background (with the SAISON header baked in)
 * recolored to the user's chosen jersey color, a dashed OVAL slot the photo fills,
 * and an empty dashed CIRCLE logo slot (filled once the club registers).
 *
 * Mirrors the posterComposite.ts seam: a Promise<dataURL> the render screen awaits.
 * Assets live in /public/generic (downloaded from the Figma file).
 */

import { BRAND, BRAND_FONTS } from '@/lib/brand'

const W = 1200
const H = 1600

/* Slot geometry as fractions of the W×H canvas (from the Figma layout). Shared
   with the GenericPosterArt preview so picker + render line up exactly. */
export const GENERIC_LAYOUT = {
  /** Photo slot — a centered ellipse. */
  oval: { cx: 0.5, cy: 0.5, rx: 0.2536, ry: 0.32222 },
  /** Empty logo slot — a small circle, bottom-left (r as a fraction of width). */
  logo: { cx: 0.16681, cy: 0.87683, r: 0.10584 },
}

/* Bounding boxes (% of the container) used by the CSS preview. The "*Svg" boxes
   include the dashed graphic's outer glow padding (the slot SVG is larger than
   the ellipse/circle it draws). Derived once from the Figma node geometry. */
export const GENERIC_SLOTS = {
  photo: { left: 24.64, top: 17.78, width: 50.72, height: 64.44 },
  ovalSvg: { left: 20.16, top: 14.42, width: 59.69, height: 71.17 },
  logoSvg: { left: 1.61, top: 76.38, width: 30.14, height: 22.61 },
}

/** How strongly the chosen color recolors the stadium (shared CSS ↔ canvas). */
export const GENERIC_TINT_OPACITY = 0.85

export const GENERIC_BG_SRC = '/generic/bg.jpg'
export const GENERIC_OVAL_SRC = '/generic/oval.svg'
export const GENERIC_LOGO_SRC = '/generic/logo.svg'

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

/** Draw `img` into the dest rect with object-cover cropping (centered). */
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
    sw = img.naturalHeight * dr
    sx = (img.naturalWidth - sw) / 2
  } else {
    sh = img.naturalWidth / dr
    sy = (img.naturalHeight - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
}

/** Draw `img` fully inside the dest rect (object-contain, centered, no crop). */
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

/* A white dashed glowing stroke for the current path — matches the slot SVGs.
   `scale` maps the SVG's stroke/dash units (sized for its own viewBox) to px. */
function strokeDashed(ctx: CanvasRenderingContext2D, scale: number) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)'
  ctx.lineWidth = 4.57143 * scale
  ctx.lineCap = 'round'
  ctx.setLineDash([16.76 * scale, 16.76 * scale])
  ctx.shadowColor = 'rgba(255, 255, 255, 0.5)'
  ctx.shadowBlur = 22 * scale
  ctx.stroke()
}

export interface GenericCompositeInput {
  photoUrl: string
  color: string
  /** Partner club crest to fill the logo slot. Omitted → empty dashed slot. */
  logoUrl?: string
  /** Fallback monogram (club shortCode) when a partner club has no logo file. */
  crestText?: string
}

/** Build the generic stadium poster and return a PNG data URL. */
export async function compositeGenericPoster({
  photoUrl,
  color,
  logoUrl,
  crestText,
}: GenericCompositeInput): Promise<string> {
  const [bg, photo, logo] = await Promise.all([
    loadImage(GENERIC_BG_SRC),
    loadImage(photoUrl),
    logoUrl ? loadImage(logoUrl).catch(() => null) : Promise.resolve(null),
  ])

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unsupported')

  // Stadium background (SAISON header baked in).
  drawCover(ctx, bg, 0, 0, W, H)

  // Recolor the stadium to the chosen jersey color — hue/sat from the color,
  // luminance from the photo, so it reads like a colored stadium.
  ctx.save()
  ctx.globalCompositeOperation = 'color'
  ctx.globalAlpha = GENERIC_TINT_OPACITY
  ctx.fillStyle = color
  ctx.fillRect(0, 0, W, H)
  ctx.restore()

  const ov = GENERIC_LAYOUT.oval
  const ocx = ov.cx * W
  const ocy = ov.cy * H
  const orx = ov.rx * W
  const ory = ov.ry * H

  // The user's photo, clipped to the oval slot (drawn over the recolored bg, so
  // it keeps its own natural colors).
  ctx.save()
  ctx.beginPath()
  ctx.ellipse(ocx, ocy, orx, ory, 0, 0, Math.PI * 2)
  ctx.clip()
  drawCover(ctx, photo, ocx - orx, ocy - ory, orx * 2, ory * 2)
  ctx.restore()

  // Dashed oval outline + glow.
  ctx.save()
  ctx.beginPath()
  ctx.ellipse(ocx, ocy, orx, ory, 0, 0, Math.PI * 2)
  strokeDashed(ctx, orx / 228.19)
  ctx.restore()

  // Logo slot. Partner clubs fill it with their real crest (or a shortCode
  // monogram); the non-partner generic poster keeps the empty dashed placeholder
  // (it "fills in when the club joins").
  const lo = GENERIC_LAYOUT.logo
  const lcx = lo.cx * W
  const lcy = lo.cy * H
  const lr = lo.r * W
  const glowScale = lr / 95.238
  if (logo) {
    const pad = lr * 0.16
    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)'
    ctx.shadowBlur = 16 * glowScale
    drawContain(ctx, logo, lcx - (lr - pad), lcy - (lr - pad), (lr - pad) * 2, (lr - pad) * 2)
    ctx.restore()
  } else if (crestText) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(lcx, lcy, lr, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(10, 10, 15, 0.55)'
    ctx.fill()
    ctx.fillStyle = BRAND.cream
    ctx.font = `400 ${Math.round(lr * 0.72)}px ${BRAND_FONTS.display}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(crestText.toUpperCase(), lcx, lcy)
    ctx.restore()
  } else {
    ctx.save()
    ctx.beginPath()
    ctx.arc(lcx, lcy, lr, 0, Math.PI * 2)
    strokeDashed(ctx, glowScale)
    ctx.restore()
  }

  return canvas.toDataURL('image/png')
}
