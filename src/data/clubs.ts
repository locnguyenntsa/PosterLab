import type { Club } from '@/types'

/**
 * Mock club catalog, seeded with clubs from the client's reference mockups.
 * Colors drive the poster preview theming. Static seam → swap for an API later.
 */
export const CLUBS: Club[] = [
  // Football
  { id: 'paris-fc', sportId: 'football', name: 'Paris FC', city: 'Paris', shortCode: 'PFC', colors: { primary: '#1e3a8a', secondary: '#3b82f6' }, designId: 'spotlight', eventDesignId: 'minimal', logoUrl: '/club-logos/paris-fc.png', posters: ['/posters/paris-fc-1.jpg'] },
  { id: 'stade-reims', sportId: 'football', name: 'Stade de Reims', city: 'Reims', shortCode: 'SDR', colors: { primary: '#dc2626', secondary: '#f8fafc' }, designId: 'stadium', logoUrl: '/club-logos/stade-reims.png', posters: ['/posters/reims-1.jpg', '/posters/reims-2.jpg', '/posters/reims-3.jpg'] },
  { id: 'asse', sportId: 'football', name: 'AS Saint-Étienne', city: 'Saint-Étienne', shortCode: 'ASSE', colors: { primary: '#16a34a', secondary: '#f8fafc' }, designId: 'retro', eventDesignId: 'stadium', logoUrl: '/club-logos/asse.png', posters: ['/posters/asse-1.jpg', '/posters/asse-2.jpg', '/posters/asse-3.jpg'] },
  { id: 'olympique-lyon', sportId: 'football', name: 'Olympique Lyonnais', city: 'Lyon', shortCode: 'OL', colors: { primary: '#1d4ed8', secondary: '#ef4444' }, designId: 'minimal', partner: false },
  { id: 'fc-nantes', sportId: 'football', name: 'FC Nantes', city: 'Nantes', shortCode: 'FCN', colors: { primary: '#facc15', secondary: '#16a34a' }, designId: 'spotlight', partner: false },

  // Basketball
  { id: 'nantes-basket', sportId: 'basketball', name: 'Hermine Nantes Basket', city: 'Nantes', shortCode: 'HNB', colors: { primary: '#0a2470', secondary: '#c81e1e' }, designId: 'minimal', logoUrl: '/club-logos/nantes-basket.png', posters: ['/posters/mantes-1.jpg'] },
  { id: 'asvel', sportId: 'basketball', name: 'LDLC ASVEL', city: 'Villeurbanne', shortCode: 'ASVEL', colors: { primary: '#dc2626', secondary: '#1f2937' }, designId: 'stadium', partner: false },
  { id: 'paris-basket', sportId: 'basketball', name: 'Paris Basketball', city: 'Paris', shortCode: 'PB', colors: { primary: '#0ea5e9', secondary: '#0a0a0f' }, designId: 'spotlight', logoUrl: '/club-logos/paris-basket.png' },

  // Rugby
  { id: 'stade-toulousain', sportId: 'rugby', name: 'Stade Toulousain', city: 'Toulouse', shortCode: 'ST', colors: { primary: '#b91c1c', secondary: '#0a0a0f' }, designId: 'retro', logoUrl: '/club-logos/stade-toulousain.png' },
  { id: 'rc-toulon', sportId: 'rugby', name: 'RC Toulon', city: 'Toulon', shortCode: 'RCT', colors: { primary: '#dc2626', secondary: '#0a0a0f' }, designId: 'stadium', logoUrl: '/club-logos/rc-toulon.png' },

  // Handball
  { id: 'psg-handball', sportId: 'handball', name: 'PSG Handball', city: 'Paris', shortCode: 'PSG', colors: { primary: '#1e3a8a', secondary: '#dc2626' }, designId: 'minimal' },
  { id: 'montpellier-hb', sportId: 'handball', name: 'Montpellier HB', city: 'Montpellier', shortCode: 'MHB', colors: { primary: '#1d4ed8', secondary: '#f97316' }, designId: 'spotlight' },

  // Volleyball
  { id: 'tours-vb', sportId: 'volleyball', name: 'Tours VB', city: 'Tours', shortCode: 'TVB', colors: { primary: '#0ea5e9', secondary: '#facc15' }, designId: 'retro' },

  // Ice Hockey
  { id: 'rapaces-gap', sportId: 'hockey', name: 'Rapaces de Gap', city: 'Gap', shortCode: 'GAP', colors: { primary: '#b91c1c', secondary: '#0a0a0f' }, designId: 'stadium' },
]

export function getClubsForSport(sportId: string | null): Club[] {
  if (!sportId) return []
  return CLUBS.filter((c) => c.sportId === sportId)
}

export function getClub(id: string | null): Club | undefined {
  return CLUBS.find((c) => c.id === id)
}

/**
 * A real example poster image for a club, or undefined if it has none.
 * `index` cycles through the club's available posters (so a grid of cards can
 * show different real posters for the same club).
 */
export function getClubPoster(id: string | null, index = 0): string | undefined {
  const posters = getClub(id)?.posters
  if (!posters || posters.length === 0) return undefined
  return posters[index % posters.length]
}
