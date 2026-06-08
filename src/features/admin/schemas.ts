import { z } from 'zod'

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
    primary: z.string().regex(HEX, 'Use a hex color like #1a4d2e'),
    secondary: z.string().regex(HEX, 'Use a hex color like #143d24'),
  }),
  status: z.enum(['live', 'draft']),
  posters: z.array(z.string()).optional(),
  logoUrl: z.string().optional(),
})

export type TeamFormValues = z.infer<typeof teamSchema>
