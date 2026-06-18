import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Club, PosterTemplate } from '@/types'
import { TEMPLATES } from '@/data/templates'
import { CLUBS } from '@/data/clubs'
import { GENERIC_CLUB } from '@/data/generic'
import type { DesignFormValues, TeamFormValues } from '@/features/admin/schemas'

/*
  The single, live source of truth for the catalog (poster designs + teams).
  BOTH the admin back-office (writes) and the guest tunnel (reads) consume this
  store, so an edit in admin reflects in the customer flow immediately. Seeded
  from the static data files; persisted to localStorage so demo edits survive a
  refresh. resetCatalog() re-seeds from the static data ("Reset demo data").

  Backend seam: today it seeds from static arrays — later it can hydrate from an
  API with no change to consumer components.
*/

// Stable seed timestamp so "Updated" reads sensibly for un-edited seed items.
const SEED_AT = '2026-06-04T00:00:00.000Z'

const nowISO = () => new Date().toISOString()

function seedDesigns(): PosterTemplate[] {
  return TEMPLATES.map((t) => ({
    ...t,
    status: 'live' as const,
    version: 1,
    updatedAt: SEED_AT,
    history: [{ version: 1, label: 'Imported', at: SEED_AT }],
  }))
}

function seedTeams(): Club[] {
  return CLUBS.map((c) => ({ ...c, status: 'live' as const, updatedAt: SEED_AT }))
}

/** Generate a unique slug id from a name, avoiding collisions with existing. */
function makeId(name: string, existing: { id: string }[]): string {
  const base =
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'item'
  const ids = new Set(existing.map((e) => e.id))
  if (!ids.has(base)) return base
  let n = 2
  while (ids.has(`${base}-${n}`)) n++
  return `${base}-${n}`
}

const MAX_HISTORY = 10

interface CatalogState {
  designs: PosterTemplate[]
  teams: Club[]

  // Designs CRUD (+ versioning)
  addDesign: (v: DesignFormValues) => string
  updateDesign: (id: string, v: DesignFormValues, note?: string) => void
  duplicateDesign: (id: string) => string
  deleteDesign: (id: string) => void
  setDesignStatus: (id: string, status: 'live' | 'draft') => void

  // Teams CRUD
  addTeam: (v: TeamFormValues) => string
  updateTeam: (id: string, v: TeamFormValues) => void
  duplicateTeam: (id: string) => string
  deleteTeam: (id: string) => void

  resetCatalog: () => void
}

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set, get) => ({
      designs: seedDesigns(),
      teams: seedTeams(),

      addDesign: (v) => {
        const id = makeId(v.name, get().designs)
        const at = nowISO()
        const design: PosterTemplate = {
          id,
          name: v.name,
          style: v.style,
          description: v.description,
          universal: v.universal,
          status: v.status,
          thumbnailUrl: v.thumbnailUrl,
          version: 1,
          updatedAt: at,
          history: [{ version: 1, label: 'Created', at }],
        }
        set((s) => ({ designs: [design, ...s.designs] }))
        return id
      },

      updateDesign: (id, v, note) =>
        set((s) => ({
          designs: s.designs.map((d) => {
            if (d.id !== id) return d
            const version = (d.version ?? 1) + 1
            const at = nowISO()
            const label = note?.trim() || 'Updated'
            const history = [{ version, label, at }, ...(d.history ?? [])].slice(0, MAX_HISTORY)
            return {
              ...d,
              name: v.name,
              style: v.style,
              description: v.description,
              universal: v.universal,
              status: v.status,
              thumbnailUrl: v.thumbnailUrl,
              version,
              updatedAt: at,
              history,
            }
          }),
        })),

      duplicateDesign: (id) => {
        const src = get().designs.find((d) => d.id === id)
        if (!src) return ''
        const name = `${src.name} (Copy)`
        const newId = makeId(name, get().designs)
        const at = nowISO()
        const copy: PosterTemplate = {
          ...src,
          id: newId,
          name,
          status: 'draft',
          version: 1,
          updatedAt: at,
          history: [{ version: 1, label: 'Duplicated', at }],
        }
        set((s) => ({ designs: [copy, ...s.designs] }))
        return newId
      },

      deleteDesign: (id) => set((s) => ({ designs: s.designs.filter((d) => d.id !== id) })),

      setDesignStatus: (id, status) =>
        set((s) => ({
          designs: s.designs.map((d) =>
            d.id === id ? { ...d, status, updatedAt: nowISO() } : d,
          ),
        })),

      addTeam: (v) => {
        const id = makeId(v.name, get().teams)
        const team: Club = {
          id,
          sportId: v.sportId,
          name: v.name,
          city: v.city,
          shortCode: v.shortCode.toUpperCase(),
          colors: { primary: v.colors.primary, secondary: v.colors.secondary },
          posters: v.posters,
          partner: v.partner,
          designId: v.designId,
          logoUrl: v.logoUrl,
          status: v.status,
          updatedAt: nowISO(),
        }
        set((s) => ({ teams: [team, ...s.teams] }))
        return id
      },

      updateTeam: (id, v) =>
        set((s) => ({
          teams: s.teams.map((c) =>
            c.id === id
              ? {
                  ...c,
                  sportId: v.sportId,
                  name: v.name,
                  city: v.city,
                  shortCode: v.shortCode.toUpperCase(),
                  colors: { primary: v.colors.primary, secondary: v.colors.secondary },
                  posters: v.posters,
                  partner: v.partner,
                  designId: v.designId,
                  logoUrl: v.logoUrl,
                  status: v.status,
                  updatedAt: nowISO(),
                }
              : c,
          ),
        })),

      duplicateTeam: (id) => {
        const src = get().teams.find((c) => c.id === id)
        if (!src) return ''
        const name = `${src.name} (Copy)`
        const newId = makeId(name, get().teams)
        const copy: Club = { ...src, id: newId, name, updatedAt: nowISO() }
        set((s) => ({ teams: [copy, ...s.teams] }))
        return newId
      },

      deleteTeam: (id) => set((s) => ({ teams: s.teams.filter((c) => c.id !== id) })),

      resetCatalog: () => set({ designs: seedDesigns(), teams: seedTeams() }),
    }),
    {
      name: 'posterlab-catalog',
      // Bump whenever the static catalog (clubs/designs) changes so a browser
      // holding a cached snapshot re-seeds instead of showing stale data.
      // v2: club crests/logos, the Mantes→Nantes rename, the SAISON template.
      version: 2,
      partialize: (s) => ({ designs: s.designs, teams: s.teams }),
      // On a version bump, re-seed from the static data files (mirrors
      // resetCatalog). Without this, zustand v5 keeps the old persisted state.
      migrate: () =>
        ({ designs: seedDesigns(), teams: seedTeams() }) as unknown as CatalogState,
    },
  ),
)

/* ── Reactive read hooks (subscribe to the store) ─────────────────────────── */
export const useDesigns = () => useCatalogStore((s) => s.designs)
export const useTeams = () => useCatalogStore((s) => s.teams)

/* ── Non-reactive lookups (for effects / non-React callers) ───────────────── */
export const findTeam = (id: string | null) =>
  id === 'generic' ? GENERIC_CLUB : useCatalogStore.getState().teams.find((c) => c.id === id)

/**
 * Resolve a club id against a teams list, transparently returning the synthetic
 * generic house club (used by the non-partner /join funnel) for the id
 * 'generic'. Lets reactive components resolve a working/cart clubId without the
 * generic club ever being seeded into — and leaking out of — the catalog.
 */
export const resolveClub = (teams: Club[], id: string | null): Club | undefined =>
  id === 'generic' ? GENERIC_CLUB : teams.find((c) => c.id === id)

export const findDesign = (id: string | null) =>
  useCatalogStore.getState().designs.find((d) => d.id === id)

/** Designs the guest tunnel is allowed to show (drafts are hidden). */
export const liveDesigns = (designs: PosterTemplate[]) =>
  designs.filter((d) => d.status !== 'draft')

/** A sample poster image for a club, cycling through its available posters. */
export function clubPosterAt(club: Club | undefined, index = 0): string | undefined {
  const posters = club?.posters
  if (!posters || posters.length === 0) return undefined
  return posters[index % posters.length]
}

/**
 * The single design assigned to a club (slide 7 "one design, one clear action").
 * Falls back to the first live design when the club has none or its design is
 * missing/unpublished — so the guest flow never dead-ends on a confirmation step.
 */
export function clubDesign(
  club: Club | undefined,
  designs: PosterTemplate[],
): PosterTemplate | undefined {
  const live = liveDesigns(designs)
  return live.find((d) => d.id === club?.designId) ?? live[0]
}
