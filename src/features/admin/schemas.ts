import { z } from 'zod'
import type { AdminRole } from '@/types'

/*
  Validation for the admin CRUD forms. Mirrors the react-hook-form + zod pattern
  used by the guest CheckoutForm (mode 'onBlur', aria-invalid per control).
*/

export const STYLE_VALUES = ['spotlight', 'stadium', 'retro', 'minimal', 'saison'] as const

export const designSchema = z.object({
  name: z.string().min(2, 'Name is required').max(40, 'Keep it under 40 characters'),
  style: z.enum(STYLE_VALUES),
  description: z
    .string()
    .min(10, 'Add a short description')
    .max(160, 'Keep it under 160 characters'),
  universal: z.boolean(),
  status: z.enum(['live', 'draft']),
  thumbnailUrl: z.string().optional(),
})

export type DesignFormValues = z.infer<typeof designSchema>

const HEX = /^#([0-9a-fA-F]{6})$/

/** An optional EUR price field, held as a string (blank = use the default). */
const priceField = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, 'Use a price like 39 or 41.50')
  .optional()
  .or(z.literal(''))

export const teamSchema = z.object({
  name: z.string().min(2, 'Team name is required').max(50, 'Keep it under 50 characters'),
  sportId: z.string().min(1, 'Choose a sport'),
  city: z.string().min(1, 'City is required'),
  /** Optional — blank derives a code from the team name (see deriveShortCode). */
  shortCode: z
    .string()
    .min(2, 'At least 2 characters')
    .max(5, 'At most 5 characters')
    .regex(/^[A-Za-z0-9]+$/, 'Letters and numbers only')
    .or(z.literal('')),
  colors: z.object({
    primary: z.string().regex(HEX, 'Use a hex color like #121317'),
    secondary: z.string().regex(HEX, 'Use a hex color like #1a1920'),
  }),
  status: z.enum(['live', 'draft']),
  /**
   * Partner = a club we can fulfil (has a ready design). `false` shows it as
   * "Coming Soon" in the tunnel and routes taps to the "not listed" flow.
   */
  partner: z.boolean(),
  /** The club's CLASSIC prepared design. */
  designId: z.string().min(1, 'Choose a design'),
  /** Optional second EVENT design, surfaced during an event window. */
  eventDesignId: z.string().optional(),
  posters: z.array(z.string()).optional(),
  logoUrl: z.string().optional(),
  // ── Pro Shop overrides (all optional → fall back to catalog defaults) ──
  /** Per-club offer price overrides (EUR strings); blank = use the default constant. */
  prices: z
    .object({ digital: priceField, printed: priceField, pack: priceField })
    .optional(),
  /** Storefront hero copy overrides. */
  heroTitleTop: z.string().max(40, 'Keep it under 40 characters').optional(),
  heroHighlight: z.string().max(40, 'Keep it under 40 characters').optional(),
  heroDescription: z.string().max(120, 'Keep it under 120 characters').optional(),
  badgeTitle: z.string().max(40, 'Keep it under 40 characters').optional(),
  accent: z.string().regex(HEX, 'Use a hex color like #1d995b').optional().or(z.literal('')),
  /** Uploaded storefront backdrop photo (data URL in the demo). */
  backdropUrl: z.string().optional(),
})

export type TeamFormValues = z.infer<typeof teamSchema>

/**
 * Crest monogram fallback when the short code is left blank: the team name's
 * initials ("Hermine Nantes Basket" → "HNB"), or the first letters of a
 * single-word name. Club.shortCode stays non-empty everywhere downstream
 * (crest squares, poster composites, pattern backgrounds).
 */
export function deriveShortCode(name: string): string {
  const words = name.match(/[\p{L}\p{N}]+/gu) ?? []
  const initials = words.map((w) => w[0]).join('').toUpperCase()
  if (initials.length >= 2) return initials.slice(0, 5)
  return (words[0] ?? '').slice(0, 3).toUpperCase() || 'TBD'
}

/* Generic designs — a named jersey-colour variant of the SAISON template, shown
   to customers who can't find their club. */
export const genericDesignSchema = z.object({
  name: z.string().min(2, 'Name is required').max(40, 'Keep it under 40 characters'),
  color: z.string().regex(HEX, 'Use a hex color like #1d4ed8'),
  status: z.enum(['live', 'draft']),
  thumbnailUrl: z.string().optional(),
})

export type GenericDesignFormValues = z.infer<typeof genericDesignSchema>

/* Pro Shop events — a fixture campaign window owned by a partner club. The
   start/end dates define when the storefront leads with the match-up. */
export const eventSchema = z
  .object({
    name: z.string().min(2, 'Name is required').max(50, 'Keep it under 50 characters'),
    clubId: z.string().min(1, 'Choose a club'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    competition: z.string().min(2, 'Competition is required').max(60, 'Keep it short'),
    opponentName: z.string().min(1, 'Opponent is required').max(40, 'Keep it short'),
    opponentCode: z
      .string()
      .min(2, 'At least 2 characters')
      .max(5, 'At most 5 characters')
      .regex(/^[A-Za-z0-9]+$/, 'Letters and numbers only'),
    opponentColor: z.string().regex(HEX, 'Use a hex color like #e2231a').optional().or(z.literal('')),
    venue: z.string().max(80, 'Keep it short').optional(),
    kickoff: z.string().min(1, 'Kick-off is required'),
    status: z.enum(['live', 'draft']),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'End date must be on or after the start date',
      })
    }
  })

export type EventFormValues = z.infer<typeof eventSchema>

/* Selectable admin roles (display-only — the login isn't gated by them). */
export const ADMIN_ROLES: { value: AdminRole; label: string }[] = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
]

export const roleLabel = (role: AdminRole): string =>
  ADMIN_ROLES.find((r) => r.value === role)?.label ?? role

/* Live password requirements — the single source for both the checklist UI and
   the validation below, so they can never drift apart. */
export const PASSWORD_RULES: { id: string; label: string; test: (v: string) => boolean }[] = [
  { id: 'length', label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { id: 'number', label: 'One number', test: (v) => /[0-9]/.test(v) },
]

const meetsAllRules = (v: string) => PASSWORD_RULES.every((r) => r.test(v))

/*
  Admin account forms. Name + email + role + a password section (rules checklist
  + confirm). On CREATE a valid password is required; on EDIT the password is
  optional — leaving both password fields blank keeps the current one. Both
  schemas infer the same shape so one form body serves create and edit.
*/
const adminFields = {
  name: z.string().max(60, 'Keep it under 60 characters').optional(),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  role: z.enum(['owner', 'admin', 'editor', 'viewer']),
  password: z.string(),
  confirmPassword: z.string(),
}

function checkConfirm(
  data: { password: string; confirmPassword: string },
  ctx: z.RefinementCtx,
) {
  if (data.confirmPassword !== data.password) {
    ctx.addIssue({ code: 'custom', path: ['confirmPassword'], message: "Passwords don't match" })
  }
}

export const adminCreateSchema = z.object(adminFields).superRefine((data, ctx) => {
  if (data.password.length === 0) {
    ctx.addIssue({ code: 'custom', path: ['password'], message: 'Password is required' })
  } else if (!meetsAllRules(data.password)) {
    ctx.addIssue({ code: 'custom', path: ['password'], message: 'Meet all the requirements below' })
  }
  checkConfirm(data, ctx)
})

export const adminEditSchema = z.object(adminFields).superRefine((data, ctx) => {
  // Both blank → keep the current password, skip all password validation.
  if (data.password.length === 0 && data.confirmPassword.length === 0) return
  if (!meetsAllRules(data.password)) {
    ctx.addIssue({ code: 'custom', path: ['password'], message: 'Meet all the requirements below' })
  }
  checkConfirm(data, ctx)
})

export type AdminFormValues = z.infer<typeof adminCreateSchema>
