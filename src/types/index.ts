// Core domain types for the PosterLab tunnel.

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
  /** Not yet pickable in the guest flow — folded behind the "Other sport" tile. */
  comingSoon?: boolean
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
  /**
   * The club's single prepared design (a PosterTemplate id). Per the client
   * feedback (slide 7 "one design, one clear action"; slide 12 "one design =
   * attached to one club") a partner club has exactly ONE design — no picker.
   * Optional so seed literals compile; resolves to the first live design if absent.
   */
  designId?: string
  /**
   * Registration state. Absent/true = a partner we can fulfil. `false` = a known
   * club listed for discovery but NOT yet a registered partner — the club picker
   * tags it "Coming Soon" and routes a tap to the "club not found" edge case.
   */
  partner?: boolean
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
  /**
   * Visual style — drives how the composite is rendered. The four flat editorial
   * styles render on the posterComposite canvas; 'saison' is the photographic
   * "SAISON" stadium template (recolored to the club's colors, real crest in the
   * slot) rendered via genericPoster / GenericPosterArt.
   */
  style: 'spotlight' | 'stadium' | 'retro' | 'minimal' | 'saison'
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

/**
 * A ready-made "generic design" for customers who can't find their club — a
 * named jersey-colour variant of the photographic SAISON template (logo-less,
 * €14.99). Managed in the admin back-office (Generic Designs tab) and offered as
 * a small gallery in the "club not found" flow. The chosen colour seeds the
 * generic-design builder (useFlowStore.enterGenericDesign).
 */
export interface GenericDesign {
  id: string
  name: string
  /** Jersey colour (hex) applied to the SAISON stadium template. */
  color: string
  /** Optional uploaded preview artwork (data URL in the demo). */
  thumbnailUrl?: string
  /** Publish state. The guest gallery only shows `live` generic designs. */
  status?: DesignStatus
  /** ISO timestamp of the last admin edit. */
  updatedAt?: string
}

/**
 * A Pro Shop campaign window for a partner club — a fixture that turns the
 * club's storefront landing into an event page while the campaign is active
 * (today within [startDate, endDate]). Managed in the admin "Pro Admin" tab and
 * mapped to a storefront EventConfig (see data/shopConfig.ts).
 */
export interface Event {
  id: string
  /** The owning partner club (the home side). */
  clubId: string
  /** Campaign name, e.g. "Matchday 2". */
  name: string
  /** Visibility window — ISO date strings (yyyy-mm-dd). */
  startDate: string
  endDate: string
  /** Competition / round label, e.g. 'Ligue 1 · Matchday 2'. */
  competition: string
  /** Away side display name + short code (free-form, not a catalog club). */
  opponentName: string
  opponentCode: string
  /** Optional away-side brand colour for the monogram disc. */
  opponentColor?: string
  /** Optional venue line. */
  venue?: string
  /** Kick-off datetime (datetime-local value), shown in the countdown. */
  kickoff: string
  /** Publish state. The storefront only surfaces `live` events. */
  status?: DesignStatus
  /** ISO timestamp of the last admin edit. */
  updatedAt?: string
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
/** Cheaper logo-less "generic design" for non-partner clubs (color of choice). */
export const GENERIC_PRICE_EUR = 14.99
export const SHIPPING_EUR = 0
/** Standard poster format shown across the checkout. */
export const POSTER_FORMAT = 'Framed · 30×40 cm'
/** Format label for the logo-less generic-design poster. */
export const GENERIC_POSTER_FORMAT = 'Generic · 30×40 cm'
/** Optional digital version offered as an upsell at the ordering moment. */
export const DIGITAL_ADDON_EUR = 2.5

/**
 * Multi-poster volume discount tiers applied to the poster subtotal. First
 * matching tier wins, so keep them ordered highest-threshold-first.
 */
export const VOLUME_DISCOUNTS: { min: number; rate: number }[] = [
  { min: 3, rate: 0.1 },
  { min: 2, rate: 0.05 },
]

/** A finished poster sitting in the cart, waiting to be purchased. */
export interface CartItem {
  id: string
  clubId: string
  templateId: string
  /** Generated poster image — a self-contained data URL, safe to hold in memory. */
  posterUrl: string
  /** Format label snapshot (e.g. POSTER_FORMAT) at the time it was added. */
  format: string
  /** Unit price snapshot in EUR. */
  priceEur: number
  /** How many copies of this poster to print. */
  qty: number
  /** ISO timestamp when the item was added to the cart. */
  addedAt: string
}
