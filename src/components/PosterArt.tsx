import { User } from 'lucide-react'
import type { Club, PosterTemplate } from '@/types'
import { cn } from '@/lib/utils'
import { GenericPosterArt } from '@/components/GenericPosterArt'

interface PosterArtProps {
  club: Club
  template: PosterTemplate
  /** Optional user photo to drop into the poster frame. */
  photoUrl?: string | null
  /** Real poster image to show instead of the CSS art (e.g. home showcase). */
  image?: string
  /** Real poster image revealed on hover over the CSS art (template cards). */
  hoverImage?: string
  /** Club color blended over a reused base `image` to re-brand it (mix-blend-color). */
  tint?: string
  className?: string
}

/**
 * Decorative, CSS-rendered poster used for template thumbnails and previews.
 * Themed by the club's colors and the template style. When a photoUrl is
 * provided it fills the subject area; otherwise a placeholder silhouette shows.
 *
 * (The final "generated" poster is produced on a canvas in
 *  features/generate/posterComposite.ts — this component is the lightweight
 *  preview/thumbnail counterpart.)
 *
 * FLAT editorial: solid club-color blocks, hard photo rectangle, orange accent
 * stripe, name on a solid ink bar, shortCode in a hard square. Zero gradients,
 * zero shadows, zero rounded corners. template.style varies the block layout.
 */
export function PosterArt({
  club,
  template,
  photoUrl,
  image,
  hoverImage,
  tint,
  className,
}: PosterArtProps) {
  const { primary, secondary } = club.colors

  // The photographic "SAISON" template renders via its own stadium composite:
  // the stadium recolored to the club's primary, the club's real crest in the
  // slot. Generated art, so it ignores the baked `image`/`tint` props.
  if (template.style === 'saison') {
    return (
      <GenericPosterArt
        color={primary}
        photoUrl={photoUrl}
        logoUrl={club.logoUrl}
        crestText={club.shortCode}
        className={className}
      />
    )
  }

  // Real poster image takes over the whole card (with a orange brand stripe and
  // a subtle hover zoom). Used for the home showcase fan and the style cards.
  if (image) {
    return (
      <div
        className={cn(
          'group relative aspect-[3/4] w-full overflow-hidden bg-ink',
          className,
        )}
      >
        <img
          src={image}
          alt={`${club.name} poster`}
          className="h-full w-full object-cover transition-transform duration-150 ease-out group-hover:scale-[1.06]"
        />
        {/* Re-brand a reused base poster to the club's color — keeps the photo's
            luminance, swaps its hue to the club primary. */}
        {tint && (
          <div
            aria-hidden
            className="absolute inset-0 mix-blend-color"
            style={{ background: tint }}
          />
        )}
        <div className="absolute inset-x-0 top-0 h-[4px] bg-accent" />
      </div>
    )
  }

  // Each style re-blocks the same flat parts: where the subject sits, and how
  // the color bands stack. All solid fills — no gradients.
  const subjectInset =
    template.style === 'stadium'
      ? 'inset-x-[8%] top-[6%] bottom-[26%]'
      : template.style === 'retro'
        ? 'inset-x-[12%] top-[10%] bottom-[24%]'
        : template.style === 'minimal'
          ? 'inset-x-[16%] top-[8%] bottom-[28%]'
          : 'inset-x-[10%] top-[4%] bottom-[26%]' // spotlight

  // Accent stripe placement differs per style (left rail vs. top band).
  const accentLeftRail =
    template.style === 'minimal' || template.style === 'spotlight'

  return (
    <div
      className={cn('group relative aspect-[3/4] w-full overflow-hidden', className)}
      style={{ background: primary }}
    >
      {/* Secondary color block — flat band, placement varies by style */}
      <div
        className={cn(
          'absolute',
          template.style === 'retro'
            ? 'inset-x-0 top-0 h-1/2'
            : template.style === 'minimal'
              ? 'inset-y-0 right-0 w-1/3'
              : 'inset-x-0 top-0 h-1/3',
        )}
        style={{ background: secondary }}
      />

      {/* orange accent stripe — single sparing accent */}
      {accentLeftRail ? (
        <div className="absolute inset-y-0 left-0 w-[6px] bg-accent" />
      ) : (
        <div className="absolute inset-x-0 top-0 h-[6px] bg-accent" />
      )}

      {/* Official tag — hard square, ink */}
      <div className="absolute left-2 top-2 bg-ink px-1.5 py-0.5 label-wide text-[8px] text-on-dark">
        Official
      </div>

      {/* Subject — hard rectangle, no mask fades, no shadows */}
      <div className={cn('absolute', subjectInset)}>
        {photoUrl ? (
          <img
            src={photoUrl}
            alt=""
            className="h-full w-full border border-line object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-ink/20">
            <User className="size-[56%] text-on-dark/20" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Name bar — solid ink block at the bottom */}
      <div className="absolute inset-x-0 bottom-0 flex items-stretch bg-ink">
        {/* Club crest — real logo on the ink bar when available, else the
            shortCode in a hard primary-colored square. */}
        <div
          className="flex aspect-square shrink-0 items-center justify-center"
          style={club.logoUrl ? undefined : { background: primary }}
        >
          {club.logoUrl ? (
            <img
              src={club.logoUrl}
              alt=""
              className="size-full object-contain p-1.5"
            />
          ) : (
            <span className="px-2 font-display text-[13px] leading-none text-on-dark sm:text-base">
              {club.shortCode}
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-col justify-center px-2 py-1.5">
          <p className="truncate font-display text-[13px] leading-none text-on-dark sm:text-base">
            {club.name}
          </p>
          <p className="label-wide mt-0.5 text-[7px] text-on-dark/55">Official Poster</p>
        </div>
      </div>

      {/* Real poster revealed on hover (hard cut) */}
      {hoverImage && (
        <>
          <img
            src={hoverImage}
            alt=""
            aria-hidden
            className="absolute inset-0 z-20 h-full w-full object-cover opacity-0 transition-opacity duration-100 group-hover:opacity-100"
          />
          <div className="absolute inset-x-0 top-0 z-20 h-[4px] bg-accent opacity-0 transition-opacity duration-100 group-hover:opacity-100" />
        </>
      )}
    </div>
  )
}
