import { shopConfigForClub } from '@/data/shopConfig'
import { useTeams, resolveClub } from '@/store/useCatalogStore'
import { cn } from '@/lib/utils'

/*
  Pro Shop backdrop — a full-bleed club photo layer (the Figma "BG-Demo"). It
  sits BELOW the monogram PatternBG and ABOVE the deep club-tinted page color.

  Two intensities. On the STOREFRONT LANDING (`vivid`) the photo reads as a real
  matchday hero shot — near-full opacity so the crowd/players come through, the
  way the storefront mock shows it. On the INNER builder steps it drops to a
  soft-light wash at half opacity so it stays pure atmosphere behind forms and
  never fights the content. Renders nothing for clubs without artwork (graceful
  fall back to tint + pattern).
*/
export function ShopBackdrop({
  clubId,
  vivid = false,
}: {
  clubId: string | null
  vivid?: boolean
}) {
  const teams = useTeams()
  const src = shopConfigForClub(resolveClub(teams, clubId)).backdrop
  if (!src) return null
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <img
        src={src}
        alt=""
        className={cn(
          'size-full object-cover',
          vivid ? 'opacity-90' : 'opacity-50 mix-blend-soft-light',
        )}
      />
      {/* Flat (non-gradient) scrim on the vivid landing — keeps muted copy legible
          over the photo without dimming the whole shot. */}
      {vivid && <div className="absolute inset-0 bg-primary/25" />}
    </div>
  )
}
