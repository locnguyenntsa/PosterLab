import type { Sport } from '@/types'

/**
 * Mock sport catalog. Static for the prototype — this is a clean seam to
 * later replace with an API call (see services/ note in the plan).
 */
export const SPORTS: Sport[] = [
  { id: 'football', name: 'Football', emoji: '⚽', tagline: 'The beautiful game' },
  { id: 'basketball', name: 'Basketball', emoji: '🏀', tagline: 'Above the rim' },
  { id: 'rugby', name: 'Rugby', emoji: '🏉', tagline: 'No guts, no glory' },
  { id: 'handball', name: 'Handball', emoji: '🤾', tagline: 'Fast hands, fast hearts' },
  { id: 'volleyball', name: 'Volleyball', emoji: '🏐', tagline: 'Set, spike, win' },
  { id: 'hockey', name: 'Ice Hockey', emoji: '🏒', tagline: 'Cold ice, hot game' },
]

export function getSport(id: string | null): Sport | undefined {
  return SPORTS.find((s) => s.id === id)
}
