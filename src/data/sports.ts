import type { Sport } from '@/types'

/**
 * Mock sport catalog. Static for the prototype — this is a clean seam to
 * later replace with an API call (see services/ note in the plan).
 */
export const SPORTS: Sport[] = [
  { id: 'football', name: 'Football', emoji: '⚽', tagline: 'The beautiful game' },
  { id: 'basketball', name: 'Basketball', emoji: '🏀', tagline: 'Above the rim' },
  { id: 'rugby', name: 'Rugby', emoji: '🏉', tagline: 'No guts, no glory' },
  // Coming soon — kept in the data + admin, but folded behind the "Other sport"
  // tile in the guest flow (the deck wants only Football/Basketball/Rugby now).
  { id: 'handball', name: 'Handball', emoji: '🤾', tagline: 'Fast hands, fast hearts', comingSoon: true },
  { id: 'volleyball', name: 'Volleyball', emoji: '🏐', tagline: 'Set, spike, win', comingSoon: true },
  { id: 'hockey', name: 'Ice Hockey', emoji: '🏒', tagline: 'Cold ice, hot game', comingSoon: true },
]

export function getSport(id: string | null): Sport | undefined {
  return SPORTS.find((s) => s.id === id)
}
