import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes with conditional logic (shadcn convention). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Perceived luminance (0–255) of a #rrggbb colour, or null if not a valid hex. */
function luminance(hex: string): number | null {
  const m = /^#([0-9a-f]{6})$/i.exec(hex)
  if (!m) return null
  const n = parseInt(m[1], 16)
  return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)
}

/** True when a colour is too dark to read against a dark (ink) surface. */
export function isDarkColor(hex: string): boolean {
  const l = luminance(hex)
  return l !== null && l < 96
}

/** Accent/case-insensitive key so "etienne" matches "Saint-Étienne". */
export function fold(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

/** Format a number as EUR currency, e.g. 39 → "€39.00". */
export function formatEUR(amount: number) {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}
