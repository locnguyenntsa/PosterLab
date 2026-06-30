/**
 * Per-club Pro Shop customization — the storefront's backdrop, crest, season and
 * short hero copy. Clubs without an entry fall back to DEFAULT (plain tint +
 * pattern, generic hero). Assets live in /public (from the Figma FC Resources).
 * Keep copy SHORT — a badge, a two-line title, one line of promise.
 */
/**
 * The visiting team in a Pro Shop fixture. FREE-FORM (not a catalog Club) so a
 * shop can list any opponent without seeding it as a partner club.
 */
export interface EventOpponent {
  /** Display name, e.g. 'Stade de Reims'. */
  name: string
  /** Short code for the monogram-disc fallback when no logo, e.g. 'SDR'. */
  shortCode: string
  /** Crest path under /public (reuse an existing /club-logos PNG where possible). */
  logo?: string
  /** Opponent-side brand colour for the monogram disc (defaults to a neutral tint). */
  color?: string
}

/** An upcoming fixture — turns the storefront landing into an event page. */
export interface EventConfig {
  /** The away team (the home team is the shop's locked club). */
  opponent: EventOpponent
  /** Kick-off as ISO 8601 WITH offset, e.g. '2026-08-23T19:00:00+02:00'
   *  (explicit offset → the countdown is the same in every timezone). */
  kickoff: string
  /** Competition / round label, e.g. 'Ligue 1 · Matchday 2'. */
  competition: string
  /** Optional venue line, e.g. 'Stade Geoffroy-Guichard'. */
  venue?: string
}

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
  /** Optional upcoming fixture — when present the landing leads with the match-up. */
  event?: EventConfig
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
    // Placeholder fixture — edit kickoff/opponent per the real matchday.
    event: {
      opponent: {
        name: 'Stade de Reims',
        shortCode: 'SDR',
        logo: '/club-logos/stade-reims.png',
        color: '#e2231a',
      },
      kickoff: '2026-08-23T19:00:00+02:00',
      competition: 'Ligue 1 · Matchday 2',
      venue: 'Stade Geoffroy-Guichard',
    },
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
    // Placeholder fixture — edit kickoff/opponent per the real matchday.
    event: {
      opponent: {
        name: 'Stade de Reims',
        shortCode: 'SDR',
        logo: '/club-logos/stade-reims.png',
        color: '#e2231a',
      },
      kickoff: '2026-09-13T17:00:00+02:00',
      competition: 'Ligue 1 · Matchday 4',
      venue: 'Stade Jean-Bouin',
    },
  },
}

export function shopConfigFor(clubId: string | null): ShopConfig {
  return (clubId && CONFIG[clubId]) || DEFAULT
}

/**
 * Resolved storefront config for a club: the admin-editable fields on the club
 * (backdrop, hero copy, badge, accent — set in the Teams form) overlaid on the
 * static fallback. Any field the club leaves blank keeps the static/default
 * value, so existing storefronts look unchanged until the back-office edits them.
 */
export function shopConfigForClub(club: import('@/types').Club | null | undefined): ShopConfig {
  const base = shopConfigFor(club?.id ?? null)
  if (!club) return base
  return {
    ...base,
    backdrop: club.backdropUrl ?? base.backdrop,
    logo: club.logoUrl ?? base.logo,
    titleTop: club.heroTitleTop ?? base.titleTop,
    titleBottom: club.heroHighlight ?? base.titleBottom,
    description: club.heroDescription ?? base.description,
    badgeTitle: club.badgeTitle ?? base.badgeTitle,
    accent: club.accent ?? base.accent,
  }
}

/**
 * Map an admin-managed Pro Shop event (Pro Admin tab) to the storefront's
 * EventConfig shape, so a live campaign drives the same match-day landing the
 * static `event` config does. The admin event's start/end window decides
 * whether it's active (see WelcomeScreen); this just maps the fixture details.
 */
export function eventConfigFromAdmin(e: import('@/types').Event): EventConfig {
  return {
    opponent: {
      name: e.opponentName,
      shortCode: e.opponentCode,
      color: e.opponentColor,
    },
    kickoff: e.kickoff,
    competition: e.competition,
    venue: e.venue,
  }
}
