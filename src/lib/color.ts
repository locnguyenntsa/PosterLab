// Small color helpers for the runtime team-theme swap.

import { BRAND } from '@/lib/brand'

type RGB = [number, number, number]

function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function mixRgb(a: RGB, b: RGB, amount: number): RGB {
  const t = Math.min(1, Math.max(0, amount))
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ]
}

const rgbStr = ([r, g, b]: RGB): string => `rgb(${r}, ${g}, ${b})`

/** Linear blend between two hex colors. amount 0 → a, 1 → b. */
export function mix(a: string, b: string, amount: number): string {
  return rgbStr(mixRgb(hexToRgb(a), hexToRgb(b), amount))
}

export const INK = BRAND.ink

/**
 * Derive a deep, club-tinted background PAIR from a club's primary color.
 *
 * The page (primary) is forced dark — mixed heavily toward ink — so cream text
 * and the orange accent stay legible no matter how light the source hue is (the
 * vivid club color lives on the poster, not the page chrome).
 *
 * The surface (secondary) is a step LIGHTER than the page — a subtle lift toward
 * the cream text color — so cards / panels rise off the background instead of
 * sinking into it. This mirrors the default brand's surface-above-base
 * relationship (Surface #1a1920 over Base #121317) on ANY club color, keeping the
 * chrome readable once the page is tinted. (Hairlines stay visible via the
 * adaptive --brand-border in index.css.)
 *
 * The muted text (mute) is re-derived as a fixed 66% step from the page toward
 * cream, instead of the static brand Muted — on the Base this ≈ the brand mute,
 * but on a tinted page it tracks lighter so secondary copy keeps a WCAG-AA ratio
 * (the static #9a90a6 fell to ~3.4:1 on the brightest club tints). Surface is
 * hue-matched to the page (not re-tinted from the club hue) — the vivid club
 * color belongs on the poster, not the chrome.
 */
export function deepTeamColors(clubPrimary: string): {
  primary: string
  secondary: string
  mute: string
} {
  const ink = hexToRgb(INK)
  const cream = hexToRgb(BRAND.cream)
  const primary = mixRgb(hexToRgb(clubPrimary), ink, 0.72)
  return {
    primary: rgbStr(primary),
    secondary: rgbStr(mixRgb(primary, cream, 0.08)),
    mute: rgbStr(mixRgb(primary, cream, 0.66)),
  }
}
