import type { Club } from '@/types'
import { deepTeamColors } from '@/lib/color'

/**
 * Runtime team-color swap. When a club is selected we re-tint the app
 * background tokens to a deep version of the club's color — a HARD cut,
 * no CSS transition (sports energy). Passing null restores the placeholder
 * brand palette defined in index.css.
 */
export function applyTeamTheme(club: Club | null) {
  const root = document.documentElement
  if (!club) {
    root.style.removeProperty('--c-primary')
    root.style.removeProperty('--c-secondary')
    return
  }
  const { primary, secondary } = deepTeamColors(club.colors.primary)
  root.style.setProperty('--c-primary', primary)
  root.style.setProperty('--c-secondary', secondary)
}
