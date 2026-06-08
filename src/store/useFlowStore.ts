import { create } from 'zustand'
import type { CoachResult, OrderDetails, StepId } from '@/types'
import { TOTAL_STEPS } from '@/types'

/* The Design step (step 1) is internally a place → sport → club → style flow. */
export type DesignSub = 'place' | 'sport' | 'club' | 'template'
const DESIGN_SUBS: DesignSub[] = ['place', 'sport', 'club', 'template']

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

  // Checkout (Steps 4–5)
  order: OrderDetails
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
  updateOrder: (partial: Partial<OrderDetails>) => void
  setOrderNumber: (n: string) => void
  reset: () => void

  /** Whether the user has met the prerequisites to reach a given step. */
  canAccess: (step: StepId) => boolean
}

export const useFlowStore = create<FlowState>((set, get) => ({
  step: 0,
  designSub: 'place',
  placeId: null,
  sportId: null,
  clubId: null,
  templateId: null,
  photoUrl: null,
  photoName: null,
  coachResult: null,
  posterUrl: null,
  order: EMPTY_ORDER,
  orderNumber: null,

  start: () => set({ step: 1 }),

  next: () => {
    const { step, canAccess } = get()
    const target = Math.min(TOTAL_STEPS, step + 1) as StepId
    if (canAccess(target)) set({ step: target })
  },

  back: () =>
    set((s) => {
      // Inside the Design step, walk back through its sub-steps before leaving it.
      if (s.step === 1) {
        const i = DESIGN_SUBS.indexOf(s.designSub)
        if (i > 0) return { designSub: DESIGN_SUBS[i - 1] }
      }
      return { step: Math.max(0, s.step - 1) as StepId }
    }),

  goTo: (step) => {
    if (get().canAccess(step)) set({ step })
  },

  setDesignSub: (sub) => set({ designSub: sub }),

  setPlace: (id) => set({ placeId: id }),

  setSport: (id) =>
    set((s) =>
      // Changing sport invalidates the club choice
      s.sportId === id ? s : { sportId: id, clubId: null },
    ),
  setClub: (id) => set({ clubId: id }),
  setTemplate: (id) => set({ templateId: id }),

  setPhoto: (url, name, coach) =>
    set({ photoUrl: url, photoName: name, coachResult: coach, posterUrl: null }),
  clearPhoto: () =>
    set({ photoUrl: null, photoName: null, coachResult: null, posterUrl: null }),

  setPoster: (url) => set({ posterUrl: url }),

  updateOrder: (partial) =>
    set((s) => ({ order: { ...s.order, ...partial } })),
  setOrderNumber: (n) => set({ orderNumber: n }),

  reset: () =>
    set({
      step: 0,
      designSub: 'place',
      placeId: null,
      sportId: null,
      clubId: null,
      templateId: null,
      photoUrl: null,
      photoName: null,
      coachResult: null,
      posterUrl: null,
      order: EMPTY_ORDER,
      orderNumber: null,
    }),

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
      case 4:
        return Boolean(s.posterUrl)
      case 5:
        return Boolean(s.posterUrl)
      case 6:
        return Boolean(s.orderNumber)
      default:
        return false
    }
  },
}))
