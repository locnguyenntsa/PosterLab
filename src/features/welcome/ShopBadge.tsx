import type { Club } from '@/types'
import { shopConfigFor } from '@/data/shopConfig'

/*
  Pro Shop badge (the Figma "BG-Demo" badge): club crest + a per-club title and
  season. Shaped like the app's buttons — a flat, skewed parallelogram with NO
  shadow (reusing .skew-btn / .skew-btn-label) — plus an infinite glare sweep.
  Title colour comes from the club's shop config (`accent`), falling back to the
  club's primary colour. Glare lives in index.css, paused under reduced-motion.
*/
export function ShopBadge({ club }: { club: Club }) {
  const cfg = shopConfigFor(club.id)
  const accent = cfg.accent ?? club.colors.primary
  const title = cfg.badgeTitle ?? `My ${club.shortCode} Poster`
  const season = cfg.season ?? '2025/2026'

  return (
    <div className="skew-btn relative inline-flex items-center overflow-hidden border border-cream/15 bg-ink px-5 py-2.5">
      {/* Counter-skewed so the box leans but the crest + text stay upright. */}
      <span className="skew-btn-label inline-flex items-center gap-3">
        {cfg.logo && (
          <img src={cfg.logo} alt="" className="size-9 shrink-0 object-contain" />
        )}
        <span className="flex flex-col gap-1 text-left leading-none">
          <span
            className="font-display text-2xl uppercase leading-none sm:text-[28px]"
            style={{ color: accent }}
          >
            {title}
          </span>
          <span className="label text-cream">Saison {season}</span>
        </span>
      </span>

      {/* Glare sweep — clipped to the skewed badge. */}
      <span
        aria-hidden
        className="shop-glare pointer-events-none absolute inset-y-0 -left-1/3 w-1/3"
      />
    </div>
  )
}
