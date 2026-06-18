import { shopConfigFor } from '@/data/shopConfig'

/*
  Pro Shop backdrop — a full-bleed club photo layer (the Figma "BG-Demo"). It
  sits BELOW the monogram PatternBG and ABOVE the deep club-tinted page color,
  blended soft-light at 50% so it reads as atmosphere, not a literal photo.
  Renders nothing for clubs without artwork (graceful fall back to tint+pattern).
*/
export function ShopBackdrop({ clubId }: { clubId: string | null }) {
  const src = shopConfigFor(clubId).backdrop
  if (!src) return null
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <img
        src={src}
        alt=""
        className="size-full object-cover opacity-50 mix-blend-soft-light"
      />
    </div>
  )
}
