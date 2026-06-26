import { create } from 'zustand'
import type { CoachResult, OrderDetails, StepId } from '@/types'
import { TOTAL_STEPS } from '@/types'
import { useCartStore } from '@/store/useCartStore'
import { findTeam } from '@/store/useCatalogStore'
import { shopClubFromPath, isJoinPath } from '@/store/useAuthStore'

/* The Design step (step 1) is internally a sport → place → club → style flow. */
export type DesignSub = 'sport' | 'place' | 'club' | 'template'
const DESIGN_SUBS: DesignSub[] = ['sport', 'place', 'club', 'template']

/* The non-partner `/join` prelude: a club registration form, then a "set up your
   design" chooser. Once the chooser hands off into the builder, joinPhase → null
   and the flow runs the normal steps on the synthetic `generic` house club. */
export type JoinPhase = 'form' | 'design'

/** Captured club registration (fire-and-forget; greets the chooser by name). */
export interface JoinClub {
  clubName: string
  sport: string
  city: string
  contactName: string
  email: string
  phone?: string
  /** Free-text note from the club-request form. */
  message?: string
}

const EMPTY_ORDER: OrderDetails = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'France',
}

/* The cleared "working poster" fields — shared by reset/startAnother/enterShop. */
const CLEARED_POSTER = {
  templateId: null,
  photoUrl: null,
  photoName: null,
  coachResult: null,
  posterUrl: null,
  cartItemId: null,
  uploadedDesignUrl: null,
  genericDesign: false,
  genericColor: null,
}

/*
  Pro Shop boot: if the page loaded on a `/shop/<club>` URL, seed the flow into
  club-locked mode BEFORE first paint (so the themed landing renders immediately,
  no flash of the normal home). App.tsx reconciles later navigations.
*/
function bootShop(): { shopClubId: string; clubId: string; sportId: string } | null {
  const slug = shopClubFromPath()
  const club = slug ? findTeam(slug) : undefined
  return club && slug ? { shopClubId: slug, clubId: slug, sportId: club.sportId } : null
}
const BOOT = bootShop()

/* Same idea for the non-partner funnel: if the page loaded on `/join`, open the
   registration prelude before first paint (no flash of the normal home). */
const BOOT_JOIN = !BOOT && isJoinPath()

/* Leaving the join funnel drops everything back to the neutral normal home —
   shared by exitJoin() and Back-ing out of the registration form. */
const JOIN_EXIT = {
  joinPhase: null,
  shopClubId: null,
  step: 0 as StepId,
  designSub: 'sport' as DesignSub,
  placeId: null,
  sportId: null,
  clubId: null,
  joinClub: null,
  orderNumber: null,
  ...CLEARED_POSTER,
}

interface FlowState {
  step: StepId

  // Selections (Step 1)
  designSub: DesignSub
  placeId: string | null
  sportId: string | null
  clubId: string | null
  templateId: string | null

  // Photo (Step 2)
  photoUrl: string | null
  photoName: string | null
  coachResult: CoachResult | null

  // Generated poster (Step 3)
  posterUrl: string | null
  /** Cart line-item id once the working poster has been added (else null). */
  cartItemId: string | null

  /** Pro Shop: the club this storefront is locked to (else null = normal funnel). */
  shopClubId: string | null

  // Non-partner /join funnel
  /** Which prelude screen is showing (form → design chooser), or null once in the builder. */
  joinPhase: JoinPhase | null
  /** The submitted club registration (greets the chooser; not persisted). */
  joinClub: JoinClub | null
  /** A club's own uploaded design artwork (the "upload your own" path). */
  uploadedDesignUrl: string | null

  // Non-partner "generic design" (€14.99, logo-less, color of choice)
  /** True while building a logo-less generic poster (club-not-found edge case). */
  genericDesign: boolean
  /** The chosen jersey color (poster primary) for the generic design. */
  genericColor: string | null

  // Checkout (Steps 4–5)
  order: OrderDetails
  /** Digital-version upsell accepted at the ordering moment. */
  digitalAddon: boolean
  orderNumber: string | null

  // Navigation
  start: () => void
  next: () => void
  back: () => void
  goTo: (step: StepId) => void

  // Mutations
  setDesignSub: (sub: DesignSub) => void
  setPlace: (id: string) => void
  setSport: (id: string) => void
  setClub: (id: string) => void
  setTemplate: (id: string) => void
  setPhoto: (url: string, name: string, coach: CoachResult) => void
  clearPhoto: () => void
  setPoster: (url: string) => void
  setCartItemId: (id: string | null) => void
  updateOrder: (partial: Partial<OrderDetails>) => void
  setDigitalAddon: (v: boolean) => void
  setOrderNumber: (n: string) => void
  /** Clear the working poster and return to the Design step, KEEPING the cart. */
  startAnother: () => void
  reset: () => void
  /** Enter a club-locked Pro Shop (themed landing → style picker). */
  enterShop: (clubId: string) => void
  /** Leave Pro Shop mode and return to the normal funnel. */
  exitShop: () => void
  /** Enter the non-partner funnel at the registration form. */
  enterJoin: () => void
  /** Switch between the prelude screens (form ↔ design chooser). */
  setJoinPhase: (phase: JoinPhase) => void
  /** Stash the submitted club registration. */
  setJoinClub: (club: JoinClub) => void
  /** Leave the join funnel and return to the normal neutral home. */
  exitJoin: () => void
  /** Hand off the chooser → builder on a generic style (lands on the style picker). */
  startGenericBuild: () => void
  /** Hand off the chooser → builder with the club's own uploaded design as the poster. */
  startUploadedBuild: (designUrl: string) => void
  /** Enter the non-partner generic-design flow (color picker → logo-less styles). */
  enterGenericDesign: (color: string) => void
  /** Live-recolor the generic design (keeps the chosen style). */
  setGenericColor: (color: string) => void

  /** Whether the user has met the prerequisites to reach a given step. */
  canAccess: (step: StepId) => boolean
}

export const useFlowStore = create<FlowState>((set, get) => ({
  step: 0,
  // On a Pro Shop URL the club is pre-locked and we open at the style picker.
  designSub: BOOT ? 'template' : 'sport',
  placeId: null,
  sportId: BOOT?.sportId ?? null,
  clubId: BOOT?.clubId ?? null,
  templateId: null,
  photoUrl: null,
  photoName: null,
  coachResult: null,
  posterUrl: null,
  cartItemId: null,
  shopClubId: BOOT?.shopClubId ?? null,
  joinPhase: BOOT_JOIN ? 'form' : null,
  joinClub: null,
  uploadedDesignUrl: null,
  genericDesign: false,
  genericColor: null,
  order: EMPTY_ORDER,
  digitalAddon: false,
  orderNumber: null,

  start: () => set({ step: 1 }),

  next: () => {
    const { step, canAccess } = get()
    const target = Math.min(TOTAL_STEPS, step + 1) as StepId
    if (canAccess(target)) set({ step: target })
  },

  back: () =>
    set((s) => {
      // Join prelude: design chooser → registration form → out to the home.
      if (s.joinPhase === 'design') return { joinPhase: 'form' as JoinPhase }
      if (s.joinPhase === 'form') return JOIN_EXIT
      // Non-partner "generic design" (€14.99): Back from the color/style picker
      // (step 1) leaves the mode and returns to the club grid — keeping the chosen
      // sport+place. Deeper steps decrement back toward the picker.
      if (s.genericDesign) {
        if (s.step === 1)
          return { ...CLEARED_POSTER, clubId: null, designSub: 'club' as DesignSub, step: 1 as StepId }
        return { step: Math.max(1, s.step - 1) as StepId }
      }
      // Kept join "generic" builder (generic club, no shop lock): Back from the
      // style picker / uploaded-design preview returns to the chooser, never the
      // sport/place/club sub-steps (which don't exist there).
      if (!s.shopClubId && !s.genericDesign && s.clubId === 'generic' &&
          (s.step === 1 || (s.step === 3 && s.uploadedDesignUrl))) {
        return { joinPhase: 'design' as JoinPhase, step: 0 as StepId, ...CLEARED_POSTER }
      }
      if (s.step === 1) {
        // In a Pro Shop the sport/place/club sub-steps don't exist — Back from the
        // style picker returns straight to the themed landing.
        if (s.shopClubId) return { step: 0 as StepId }
        // Otherwise walk back through the Design sub-steps before leaving step 1.
        const i = DESIGN_SUBS.indexOf(s.designSub)
        if (i > 0) return { designSub: DESIGN_SUBS[i - 1] }
      }
      return { step: Math.max(0, s.step - 1) as StepId }
    }),

  goTo: (step) => {
    if (get().canAccess(step)) set({ step })
  },

  setDesignSub: (sub) => set({ designSub: sub }),

  // Changing location invalidates the club choice (clubs are filtered by place).
  setPlace: (id) =>
    set((s) => (s.placeId === id ? s : { placeId: id, clubId: null })),

  setSport: (id) =>
    set((s) =>
      // Changing sport invalidates the location + club choices downstream of it.
      s.sportId === id ? s : { sportId: id, placeId: null, clubId: null },
    ),
  setClub: (id) => set({ clubId: id }),
  setTemplate: (id) => set({ templateId: id }),

  // A new/replaced photo means a new working poster that isn't in the cart yet.
  // It also supersedes any "upload your own design" path, so clear that flag —
  // the poster is now a real render, not the club's uploaded artwork.
  setPhoto: (url, name, coach) =>
    set({ photoUrl: url, photoName: name, coachResult: coach, posterUrl: null, cartItemId: null, uploadedDesignUrl: null }),
  clearPhoto: () =>
    set({ photoUrl: null, photoName: null, coachResult: null, posterUrl: null, cartItemId: null, uploadedDesignUrl: null }),

  setPoster: (url) => set({ posterUrl: url }),
  setCartItemId: (id) => set({ cartItemId: id }),

  updateOrder: (partial) =>
    set((s) => ({ order: { ...s.order, ...partial } })),
  setDigitalAddon: (v) => set({ digitalAddon: v }),
  setOrderNumber: (n) => set({ orderNumber: n }),

  // Keep the cart + shipping details; just clear the working poster and go back
  // to the Design step to build the next one. In a Pro Shop the club stays locked
  // and we drop straight onto the style picker.
  startAnother: () =>
    set((s) => {
      const base: Partial<FlowState> = { step: 1, placeId: null, ...CLEARED_POSTER }
      if (s.shopClubId) {
        return { ...base, designSub: 'template', clubId: s.shopClubId, sportId: findTeam(s.shopClubId)?.sportId ?? null }
      }
      return { ...base, designSub: 'sport', clubId: null, sportId: null }
    }),

  reset: () =>
    set((s) => {
      const base: Partial<FlowState> = {
        placeId: null,
        ...CLEARED_POSTER,
        order: EMPTY_ORDER,
        digitalAddon: false,
        orderNumber: null,
      }
      // In a Pro Shop, "Create Another" keeps the buyer in the same themed shop.
      if (s.shopClubId) {
        return { ...base, step: 0, designSub: 'template', clubId: s.shopClubId, sportId: findTeam(s.shopClubId)?.sportId ?? null }
      }
      return { ...base, step: 0, designSub: 'sport', clubId: null, sportId: null }
    }),

  enterShop: (clubId) =>
    set((s) => {
      const club = findTeam(clubId)
      if (!club) return s
      return {
        shopClubId: clubId,
        clubId,
        sportId: club.sportId,
        placeId: null,
        designSub: 'template',
        step: 0,
        // A Pro Shop and the join funnel are mutually exclusive locked modes.
        joinPhase: null,
        joinClub: null,
        ...CLEARED_POSTER,
        orderNumber: null,
      }
    }),

  exitShop: () =>
    set({
      shopClubId: null,
      step: 0,
      designSub: 'sport',
      placeId: null,
      sportId: null,
      clubId: null,
      ...CLEARED_POSTER,
      orderNumber: null,
    }),

  // ── Non-partner /join funnel ──────────────────────────────────────────────
  enterJoin: () =>
    set({
      joinPhase: 'form',
      joinClub: null,
      // Entering the funnel cancels any Pro Shop lock and clears the funnel.
      shopClubId: null,
      step: 0,
      designSub: 'sport',
      placeId: null,
      sportId: null,
      clubId: null,
      ...CLEARED_POSTER,
      orderNumber: null,
    }),

  setJoinPhase: (phase) => set({ joinPhase: phase }),
  setJoinClub: (club) => set({ joinClub: club }),

  exitJoin: () => set(JOIN_EXIT),

  // Hand the chooser off into the builder on the generic house club, landing on
  // the style picker (designSub 'template'). The sport is the synthetic 'house',
  // so canAccess(2) — sportId && clubId && templateId — passes once a style is
  // picked, and the normal Photo → Generate → Checkout steps run unchanged.
  startGenericBuild: () =>
    set({
      joinPhase: null,
      clubId: 'generic',
      sportId: 'house',
      placeId: null,
      designSub: 'template',
      step: 1,
      ...CLEARED_POSTER,
    }),

  // The club brought a finished design: it IS the poster. Seed it as the working
  // poster (and photo, so the gate passes) on a universal style, and drop straight
  // onto the render screen (step 3), which shows a ready poster when posterUrl is
  // set — so it can be added to the cart / checked out like any other.
  startUploadedBuild: (designUrl) =>
    set({
      joinPhase: null,
      clubId: 'generic',
      sportId: 'house',
      placeId: null,
      designSub: 'template',
      templateId: 'minimal',
      photoUrl: designUrl,
      photoName: 'Your design',
      coachResult: null,
      posterUrl: designUrl,
      uploadedDesignUrl: designUrl,
      cartItemId: null,
      step: 3,
    }),

  // The club isn't a partner → offer a logo-less generic poster in the colors of
  // their choice (€14.99). Keep the real sportId/placeId (so canAccess passes and
  // Back can rebuild the club grid); only the working poster is cleared.
  enterGenericDesign: (color) =>
    set({
      ...CLEARED_POSTER,
      genericDesign: true,
      genericColor: color,
      clubId: 'generic',
      // One fixed "SAISON" stadium template — a synthetic id so canAccess(2) and
      // the cart gate pass without a style pick (the color is the variation).
      templateId: 'generic-season',
      designSub: 'template',
      step: 1,
      shopClubId: null,
      joinPhase: null,
    }),

  setGenericColor: (color) => set({ genericColor: color }),

  canAccess: (step) => {
    const s = get()
    switch (step) {
      case 0:
      case 1:
        return true
      case 2:
        return Boolean(s.sportId && s.clubId && s.templateId)
      case 3:
        return Boolean(s.photoUrl)
      // Checkout is reachable with a finished working poster OR a non-empty cart
      // (e.g. checking out from the header cart after starting another poster).
      case 4:
      case 5:
        return Boolean(s.posterUrl) || useCartStore.getState().items.length > 0
      case 6:
        return Boolean(s.orderNumber)
      default:
        return false
    }
  },
}))
