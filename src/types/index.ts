// Core domain types for the PosterLab tunnel.

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
   * The club's CLASSIC prepared design (a PosterTemplate id). Optional so seed
   * literals compile; resolves to the first live design if absent.
   */
  designId?: string
  /**
   * An optional second "event" design (a PosterTemplate id). Surfaced in the Pro
   * Shop only while an event campaign is active, so a club can hold both a
   * classic and an event design (client feedback: several designs per club).
   */
  eventDesignId?: string
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
  /**
   * Per-club Pro Shop offer price overrides (EUR). Any omitted value falls back
   * to the catalog default constant. Edited in the back-office (Teams form).
   */
  prices?: { digital?: number; printed?: number; pack?: number }
  // ── Pro Shop storefront overrides (edited in the Teams form) ──
  /** Big hero title, top line. Falls back to the static shopConfig copy. */
  heroTitleTop?: string
  /** Hero highlight line — shown in the club accent colour (the "green name"). */
  heroHighlight?: string
  /** One short storefront promise line. */
  heroDescription?: string
  /** Storefront badge title (defaults to `My <shortCode> Poster`). */
  badgeTitle?: string
  /** Accent colour (hex) for the badge + highlight line. Defaults to club primary. */
  accent?: string
  /** Uploaded storefront backdrop photo (data URL in the demo). */
  backdropUrl?: string
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
/** Digital top-up — the extra a Pack costs over a printed poster alone. */
export const DIGITAL_ADDON_EUR = 2.5
/** The digital-only HD file, sold as its own amateur-shop offer. */
export const DIGITAL_PRICE_EUR = 14.99
/** Printed poster offer price (alias of the framed-poster catalog price). */
export const PRINTED_PRICE_EUR = POSTER_PRICE_EUR
/** Pack (printed + digital) — printed price plus the small digital top-up. */
export const PACK_PRICE_EUR = POSTER_PRICE_EUR + DIGITAL_ADDON_EUR

/** The three buying options shown on the amateur "Poster Ready" screen. */
export type OfferType = 'digital' | 'printed' | 'pack'

/** A selectable print size with its catalog price (global — same for all clubs). */
export interface PrintSize {
  /** Label — doubles as the cart `size` snapshot. */
  label: string
  /** Catalog price for the PRINTED offer at this size (EUR). */
  priceEur: number
}

/**
 * Print sizes/formats for the Printed & Pack offers, each with its own price.
 * The FIRST entry is the BASE size; a per-club price override shifts the base and
 * any other sizes keep their price difference from it (see lib/pricing). The
 * label doubles as the cart `size` snapshot. One catalog format for now (client
 * feedback: 30×40 only); the machinery stays so more sizes can return later.
 */
export const PRINT_SIZES: PrintSize[] = [
  { label: POSTER_FORMAT, priceEur: POSTER_PRICE_EUR }, // Framed · 30×40 cm
]

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
  /** Which offer this line is — digital file, printed poster, or the pack. */
  offer: OfferType
  /** Generated poster image — a self-contained data URL, safe to hold in memory. */
  posterUrl: string
  /** Chosen print size for printed/pack offers (a PRINT_SIZES label); none for digital. */
  size?: string
  /** Format label snapshot (e.g. POSTER_FORMAT) at the time it was added. */
  format: string
  /** Unit price snapshot in EUR. */
  priceEur: number
  /** How many copies of this poster to print. */
  qty: number
  /** ISO timestamp when the item was added to the cart. */
  addedAt: string
}
