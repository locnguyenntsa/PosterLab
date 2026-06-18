import type { Club } from '@/types'

/**
 * The house "club" powering the non-partner `/join` funnel. It is deliberately
 * NOT seeded into the catalog (useCatalogStore) — so it never appears in the
 * admin Teams list or the guest sport/place/club pickers, which all read the
 * reactive `useTeams()` array. Instead `resolveClub`/`findTeam` return it for the
 * id 'generic', so the builder, theming and cart resolve it on demand.
 *
 * Neutral Poster-Lab colors keep the builder reading un-themed (no warm club
 * tint), and `shortCode: 'PL'` matches PatternBG's brand monogram fallback so the
 * background wall looks like the normal home. `sportId: 'house'` has no matching
 * SPORTS row, a second guard against it ever surfacing in a sport tile.
 */
export const GENERIC_CLUB: Club = {
  id: 'generic',
  sportId: 'house',
  name: 'Poster Lab',
  city: '—',
  shortCode: 'PL',
  colors: { primary: '#1a1b20', secondary: '#3b3d45' },
  status: 'live',
}

/** Common amateur-jersey colors offered for the generic "SAISON" design. */
export const PRESET_COLORS: { name: string; value: string }[] = [
  { name: 'Royal', value: '#1d4ed8' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Yellow', value: '#facc15' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Black', value: '#0a0a0f' },
  { name: 'White', value: '#f8fafc' },
]
// Default to blue so the stadium opens looking like its natural (Figma) state.
export const DEFAULT_GENERIC_COLOR = PRESET_COLORS[0].value
