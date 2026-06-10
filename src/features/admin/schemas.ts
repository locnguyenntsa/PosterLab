import { z } from 'zod'
import type { AdminRole } from '@/types'

/*
  Validation for the admin CRUD forms. Mirrors the react-hook-form + zod pattern
  used by the guest CheckoutForm (mode 'onBlur', aria-invalid per control).
*/

export const STYLE_VALUES = ['spotlight', 'stadium', 'retro', 'minimal'] as const

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

export const teamSchema = z.object({
  name: z.string().min(2, 'Team name is required').max(50, 'Keep it under 50 characters'),
  sportId: z.string().min(1, 'Choose a sport'),
  city: z.string().min(1, 'City is required'),
  shortCode: z
    .string()
    .min(2, 'At least 2 characters')
    .max(5, 'At most 5 characters')
    .regex(/^[A-Za-z0-9]+$/, 'Letters and numbers only'),
  colors: z.object({
    primary: z.string().regex(HEX, 'Use a hex color like #121317'),
    secondary: z.string().regex(HEX, 'Use a hex color like #1a1920'),
  }),
  status: z.enum(['live', 'draft']),
  posters: z.array(z.string()).optional(),
  logoUrl: z.string().optional(),
})

export type TeamFormValues = z.infer<typeof teamSchema>

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
