/**
 * ── BRAND PALETTE — SINGLE SOURCE for code that can't read CSS variables ─────
 *
 * The visual source of truth is the CSS tokens in `src/index.css` (`--brand-*`
 * and the `--c-*` / `--text-*` tokens that reference them). Every component
 * picks those up automatically through Tailwind utilities (`bg-accent`, …).
 *
 * A few places run OUTSIDE the CSS cascade and need the literal values:
 *   • the <canvas> poster renderer (`features/generate/posterComposite.ts`)
 *   • admin team-form defaults/fallbacks (`features/admin/teams/TeamForm.tsx`)
 *   • the runtime team-color tint (`lib/color.ts`)
 * Those import from here.
 *
 * ⚠️  KEEP IN SYNC with `src/index.css`: these values MUST equal the
 *     `--brand-*` / `--c-accent` / `--c-ink` tokens there (and vice-versa).
 *     On a rebrand, change both files together.
 */
export const BRAND = {
  primary: '#121317', // --brand-primary — Base (app background)
  secondary: '#1a1920', // --brand-secondary — Surface (cards / panels)
  accent: '#ff4f18', // --c-accent — Orange Blaze (CTA / accent only)
  ink: '#0a0a0a', // --c-ink — near-black (text on accent, name bar)
  cream: '#f4f4f5', // --brand-text / --c-text-main — primary readable text
  mute: '#9a90a6', // --brand-mute / --c-text-mute — supporting copy
} as const

/**
 * Font family stacks, mirroring `--font-display` / `--font-ui` in `src/index.css`.
 * Used as canvas `ctx.font` family strings (which can't read CSS vars).
 */
export const BRAND_FONTS = {
  display: "'Bebas Neue', sans-serif", // headings / poster name — matches --font-display
  ui: "'Inter', system-ui, sans-serif", // body / labels — matches --font-ui
} as const
