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
  // --c-text-mute backs the `text-mute` utility; --text-secondary backs the
  // .t-body / .t-help type tiers — both carry secondary copy, so both track the
  // tint-aware mute to hold WCAG-AA contrast on bright club pages.
  if (!club) {
    for (const v of ['--c-primary', '--c-secondary', '--c-text-mute', '--text-secondary']) {
      root.style.removeProperty(v)
    }
    return
  }
  const { primary, secondary, mute } = deepTeamColors(club.colors.primary)
  root.style.setProperty('--c-primary', primary)
  root.style.setProperty('--c-secondary', secondary)
  root.style.setProperty('--c-text-mute', mute)
  root.style.setProperty('--text-secondary', mute)
}
