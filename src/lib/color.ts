// Small color helpers for the runtime team-theme swap.

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Linear blend between two hex colors. amount 0 → a, 1 → b. */
export function mix(a: string, b: string, amount: number): string {
  const [ar, ag, ab] = hexToRgb(a)
  const [br, bg, bb] = hexToRgb(b)
  const t = Math.min(1, Math.max(0, amount))
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const bl = Math.round(ab + (bb - ab) * t)
  return `rgb(${r}, ${g}, ${bl})`
}

export const INK = '#0a0a0a'

/**
 * Derive a deep, club-tinted background pair from a club's primary color.
 * We always force the app background dark (mix heavily toward ink) so cream
 * text + lime accent stay legible no matter how light the source hue is —
 * the vivid club color itself lives on the poster, not the page chrome.
 */
export function deepTeamColors(clubPrimary: string): {
  primary: string
  secondary: string
} {
  return {
    primary: mix(clubPrimary, INK, 0.72),
    secondary: mix(clubPrimary, INK, 0.84),
  }
}
