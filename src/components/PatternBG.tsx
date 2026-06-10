import { useFlowStore } from '@/store/useFlowStore'
import { useTeams } from '@/store/useCatalogStore'

/**
 * Fixed, full-viewport monogram pattern behind all content (matches the Figma
 * BG). A rotated wall of the brand monogram ("1P") — or the selected club's
 * code once a team is picked — tiled across rows.
 *
 * The rows scroll ALTERNATELY IN OPPOSITE DIRECTIONS: even rows drift left,
 * odd rows drift right. Each row is a seamless marquee made of two identical
 * halves (CSS translateX 0 ↔ -50%), so the loop never shows a seam. Tone-on-
 * tone via an `overlay` blend (auto-adapts to the team-color swap); all motion
 * is transform-only and pauses under prefers-reduced-motion.
 */

// Enough rows that the (vertically-centered) wall always OVERFLOWS the viewport
// on any screen — so the visible area is fully covered with no empty bands, even
// on tall phones/tablets. Off-screen rows are clipped by the fixed parent.
const ROWS = 40
// Repeat count per half — wide enough that one half overflows the rotated
// stage on large screens, so the -50% loop never reveals a gap.
const TOKENS = 28

export function PatternBG({ token: tokenOverride }: { token?: string } = {}) {
  const clubId = useFlowStore((s) => s.clubId)
  const teams = useTeams()
  const club = teams.find((c) => c.id === clubId)
  // Callers outside the guest tunnel (e.g. the admin login) can force the brand
  // monogram so a leftover in-session clubId never tiles a stale club code.
  const token = tokenOverride ?? club?.shortCode ?? '1P'
  // No inter-token space → letters pack tightly (denser, matches Figma).
  const half = `${token}`.repeat(TOKENS)

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="bgp-stage">
        {Array.from({ length: ROWS }, (_, i) => (
          <div
            key={i}
            className={`bgp-row ${i % 2 === 0 ? 'is-ltr' : 'is-rtl'}`}
            // Slight per-row speed variation for an organic, non-mechanical feel.
            style={{ ['--dur' as string]: `${200 + (i % 3) * 6}s` }}
          >
            <span>{half}</span>
            <span>{half}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
