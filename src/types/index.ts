// Core domain types for the OnePact tunnel.

/** A French place (city/town) the guest picks first in the Design step. */
export interface Place {
  id: string
  name: string
  /** French région the place belongs to — shown as supporting meta. */
  region: string
}

export interface Sport {
  id: string
  name: string
  /** Emoji used as a lightweight icon in the selection grid. */
  emoji: string
  tagline: string
}

/** Publish state for catalog items managed in the admin back-office. */
export type DesignStatus = 'live' | 'draft'

/** One entry in a design's lightweight version history (admin versioning). */
export interface DesignVersionEntry {
  version: number
  /** Short human label, e.g. "Created", "Imported", or a typed change note. */
  label: string
  /** ISO timestamp. */
  at: string
}

export interface Club {
  id: string
  sportId: string
  name: string
  city: string
  /** Short code shown on the crest, e.g. "PFC". */
  shortCode: string
  /** Primary + secondary brand colors used to theme the poster preview. */
  colors: { primary: string; secondary: string }
  /** Real example poster images (served from /public/posters), if any. */
  posters?: string[]
  // ── Admin-managed fields (optional so static seed literals still compile) ──
  /** Publish state. Teams are not filtered by status in the guest tunnel. */
  status?: DesignStatus
  /** Uploaded crest/logo (data URL in the demo). */
  logoUrl?: string
  /** ISO timestamp of the last admin edit. */
  updatedAt?: string
}

export interface PosterTemplate {
  id: string
  name: string
  /** Visual style — drives how the composite is rendered. */
  style: 'spotlight' | 'stadium' | 'retro' | 'minimal'
  description: string
  /** Whether this template is available for every club (generic fallback). */
  universal: boolean
  // ── Admin-managed fields (optional so static seed literals still compile) ──
  /** Publish state. The guest tunnel only shows `live` designs. */
  status?: DesignStatus
  /** Bumped on every admin edit (brief row 7 — versioning). */
  version?: number
  /** ISO timestamp of the last admin edit. */
  updatedAt?: string
  /** Uploaded preview artwork (data URL in the demo). Overrides the CSS art. */
  thumbnailUrl?: string
  /** Newest-first change history. */
  history?: DesignVersionEntry[]
}

/** Access role for an admin account (display-only in this prototype — not enforced). */
export type AdminRole = 'owner' | 'admin' | 'editor' | 'viewer'

/**
 * A back-office admin account — a MANAGEMENT-LIST record only, NOT the login
 * gate. The demo login accepts any input (see useAuthStore); these accounts are
 * not checked at sign-in. When a real backend lands, hash passwords server-side
 * and validate the login against these records.
 */
export interface AdminAccount {
  id: string
  email: string
  /** Plaintext in this front-end prototype — no backend, not hashed, not enforced. */
  password: string
  /** Optional display name. */
  name?: string
  /** Access role — display-only here (the login isn't gated by it). */
  role: AdminRole
  /** ISO timestamp the account was created. */
  createdAt: string
  /** ISO timestamp of the last edit. */
  updatedAt?: string
}

/** A single Photo Coach finding shown inline to the user. */
export interface CoachCheck {
  id: 'resolution' | 'brightness' | 'blur' | 'face'
  label: string
  status: 'pass' | 'warn' | 'fail' | 'skipped'
  message: string
}

export interface CoachResult {
  checks: CoachCheck[]
  /** True when no check failed (warnings allowed). */
  passed: boolean
  /** Convenience flag — at least one hard failure present. */
  hasFailure: boolean
}

export interface OrderDetails {
  email: string
  firstName: string
  lastName: string
  phone: string
  address: string
  city: string
  postalCode: string
  country: string
}

/** Steps of the linear tunnel. 0 = welcome (un-numbered landing). */
export type StepId = 0 | 1 | 2 | 3 | 4 | 5 | 6

export const TOTAL_STEPS = 6

/** Catalog price for a framed poster (mirrors the client mockups). */
export const POSTER_PRICE_EUR = 39
export const SHIPPING_EUR = 0
