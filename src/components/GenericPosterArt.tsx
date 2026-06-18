import { cn } from '@/lib/utils'
import {
  GENERIC_SLOTS,
  GENERIC_TINT_OPACITY,
  GENERIC_BG_SRC,
  GENERIC_OVAL_SRC,
  GENERIC_LOGO_SRC,
} from '@/features/generate/genericPoster'

/**
 * Live preview of the generic "SAISON" stadium poster (Figma 112-978): the
 * stadium background recolored to the chosen jersey color, the user's photo in
 * the dashed oval slot (or an empty slot before upload), and an empty dashed
 * logo slot. The CSS counterpart of compositeGenericPoster — same geometry so the
 * picker preview matches the rendered poster.
 */
export function GenericPosterArt({
  color,
  photoUrl,
  logoUrl,
  crestText,
  className,
}: {
  color: string
  photoUrl?: string | null
  /** Partner club crest to fill the logo slot. Omitted → empty dashed slot. */
  logoUrl?: string
  /** Fallback monogram (club shortCode) when a partner club has no logo file. */
  crestText?: string
  className?: string
}) {
  const box = (s: { left: number; top: number; width: number; height: number }) => ({
    left: `${s.left}%`,
    top: `${s.top}%`,
    width: `${s.width}%`,
    height: `${s.height}%`,
  })

  return (
    <div className={cn('relative aspect-[3/4] w-full overflow-hidden bg-ink', className)}>
      {/* Stadium background (SAISON header baked in) */}
      <img src={GENERIC_BG_SRC} alt="" className="absolute inset-0 size-full object-cover" />

      {/* Recolor to the chosen jersey color — blends with the stadium below it. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: color, mixBlendMode: 'color', opacity: GENERIC_TINT_OPACITY }}
      />

      {/* Photo, clipped to the oval slot (sits above the recolor, keeps its colors) */}
      {photoUrl && (
        <div className="absolute overflow-hidden" style={{ ...box(GENERIC_SLOTS.photo), borderRadius: '50%' }}>
          <img src={photoUrl} alt="" className="size-full object-cover" />
        </div>
      )}

      {/* Dashed oval slot outline — the provided SVG already carries the glow. */}
      <img
        src={GENERIC_OVAL_SRC}
        alt=""
        aria-hidden
        className="pointer-events-none absolute"
        style={box(GENERIC_SLOTS.ovalSvg)}
      />

      {/* Logo slot: a partner club's real crest, a shortCode monogram, or the
          empty dashed placeholder (non-partner — fills in when the club joins). */}
      {logoUrl ? (
        <div className="absolute grid place-items-center" style={box(GENERIC_SLOTS.logoSvg)}>
          <img
            src={logoUrl}
            alt=""
            className="object-contain"
            style={{ width: '59%', height: '59%', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.35))' }}
          />
        </div>
      ) : crestText ? (
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
          className="pointer-events-none absolute"
          style={box(GENERIC_SLOTS.logoSvg)}
        >
          <circle cx="50" cy="50" r="35" fill="rgba(10,10,15,0.55)" />
          <text
            x="50"
            y="52"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="'Bebas Neue', sans-serif"
            fontSize="34"
            fill="#f4f4f5"
          >
            {crestText.toUpperCase()}
          </text>
        </svg>
      ) : (
        <img
          src={GENERIC_LOGO_SRC}
          alt=""
          aria-hidden
          className="pointer-events-none absolute"
          style={box(GENERIC_SLOTS.logoSvg)}
        />
      )}
    </div>
  )
}
