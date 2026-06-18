/**
 * Per-club Pro Shop customization — the storefront's backdrop, crest, season and
 * short hero copy. Clubs without an entry fall back to DEFAULT (plain tint +
 * pattern, generic hero). Assets live in /public (from the Figma FC Resources).
 * Keep copy SHORT — a badge, a two-line title, one line of promise.
 */
export interface ShopConfig {
  /** Full-bleed club action photo behind the monogram pattern. */
  backdrop?: string
  /** Club crest shown in the storefront badge. */
  logo?: string
  /** Season label for the badge, e.g. '2025/2026'. */
  season?: string
  /** Big hero title, split across two lines. */
  titleTop: string
  titleBottom: string
  /** One short storefront promise. */
  description: string
  /** Storefront badge title (defaults to `My <shortCode> Poster`). */
  badgeTitle?: string
  /** Accent colour for the badge title + glow (defaults to the club primary). */
  accent?: string
}

const DEFAULT: ShopConfig = {
  titleTop: 'Your Face.',
  titleBottom: 'Their Colors.',
  description: 'Drop one photo. Get a print-ready poster with you on it.',
}

const CONFIG: Record<string, ShopConfig> = {
  asse: {
    backdrop: '/shop-bg/asse.jpg',
    logo: '/club-logos/asse.png',
    season: '2025/2026',
    titleTop: 'Your Face.',
    titleBottom: 'Their Green.',
    description: 'Drop one photo. Join Les Verts in seconds.',
    badgeTitle: 'My ASSE Poster',
    accent: '#1d995b',
  },
  'paris-fc': {
    backdrop: '/shop-bg/paris-fc.jpg',
    logo: '/club-logos/paris-fc.png',
    season: '2025/2026',
    titleTop: 'Your Face.',
    titleBottom: 'Paris Blue.',
    description: 'Drop one photo. Wear the Paris blue.',
    badgeTitle: 'My Paris FC Poster',
    accent: '#3b82f6',
  },
}

export function shopConfigFor(clubId: string | null): ShopConfig {
  return (clubId && CONFIG[clubId]) || DEFAULT
}
