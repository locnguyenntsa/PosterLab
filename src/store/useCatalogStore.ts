import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Club, PosterTemplate, GenericDesign, Event } from '@/types'
import { TEMPLATES } from '@/data/templates'
import { CLUBS } from '@/data/clubs'
import { GENERIC_CLUB, GENERIC_DESIGNS } from '@/data/generic'
import type {
  DesignFormValues,
  TeamFormValues,
  GenericDesignFormValues,
  EventFormValues,
} from '@/features/admin/schemas'

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

function seedGenericDesigns(): GenericDesign[] {
  return GENERIC_DESIGNS.map((g) => ({ ...g, status: 'live' as const, updatedAt: SEED_AT }))
}

function seedEvents(): Event[] {
  // No seed fixtures — events are created in the Pro Admin tab.
  return []
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

/** Strip blank strings to undefined so omitted overrides fall back to defaults. */
const blankToUndef = (v?: string) => {
  const t = v?.trim()
  return t ? t : undefined
}

/** Parse the string price inputs to numbers, dropping blanks/invalid entries. */
function cleanPrices(p?: {
  digital?: string
  printed?: string
  pack?: string
}): Club['prices'] | undefined {
  if (!p) return undefined
  const parse = (s?: string) => {
    const n = Number(s)
    return s && Number.isFinite(n) && n > 0 ? n : undefined
  }
  const out: NonNullable<Club['prices']> = {}
  const d = parse(p.digital)
  const pr = parse(p.printed)
  const pk = parse(p.pack)
  if (d != null) out.digital = d
  if (pr != null) out.printed = pr
  if (pk != null) out.pack = pk
  return Object.keys(out).length ? out : undefined
}

/** Map the admin Teams form values onto the optional Pro Shop Club fields. */
function teamProShopFields(v: TeamFormValues): Partial<Club> {
  return {
    eventDesignId: blankToUndef(v.eventDesignId),
    prices: cleanPrices(v.prices),
    heroTitleTop: blankToUndef(v.heroTitleTop),
    heroHighlight: blankToUndef(v.heroHighlight),
    heroDescription: blankToUndef(v.heroDescription),
    badgeTitle: blankToUndef(v.badgeTitle),
    accent: blankToUndef(v.accent),
    backdropUrl: blankToUndef(v.backdropUrl),
  }
}

interface CatalogState {
  designs: PosterTemplate[]
  teams: Club[]
  genericDesigns: GenericDesign[]
  events: Event[]

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

  // Generic designs CRUD
  addGenericDesign: (v: GenericDesignFormValues) => string
  updateGenericDesign: (id: string, v: GenericDesignFormValues) => void
  deleteGenericDesign: (id: string) => void

  // Events CRUD (Pro Shop campaign windows)
  addEvent: (v: EventFormValues) => string
  updateEvent: (id: string, v: EventFormValues) => void
  deleteEvent: (id: string) => void

  resetCatalog: () => void
}

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set, get) => ({
      designs: seedDesigns(),
      teams: seedTeams(),
      genericDesigns: seedGenericDesigns(),
      events: seedEvents(),

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
          ...teamProShopFields(v),
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
                  ...teamProShopFields(v),
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

      addGenericDesign: (v) => {
        const id = makeId(v.name, get().genericDesigns)
        const design: GenericDesign = {
          id,
          name: v.name,
          color: v.color,
          thumbnailUrl: v.thumbnailUrl,
          status: v.status,
          updatedAt: nowISO(),
        }
        set((s) => ({ genericDesigns: [design, ...s.genericDesigns] }))
        return id
      },

      updateGenericDesign: (id, v) =>
        set((s) => ({
          genericDesigns: s.genericDesigns.map((g) =>
            g.id === id
              ? {
                  ...g,
                  name: v.name,
                  color: v.color,
                  thumbnailUrl: v.thumbnailUrl,
                  status: v.status,
                  updatedAt: nowISO(),
                }
              : g,
          ),
        })),

      deleteGenericDesign: (id) =>
        set((s) => ({ genericDesigns: s.genericDesigns.filter((g) => g.id !== id) })),

      addEvent: (v) => {
        const id = makeId(v.name, get().events)
        const event: Event = {
          id,
          clubId: v.clubId,
          name: v.name,
          startDate: v.startDate,
          endDate: v.endDate,
          competition: v.competition,
          opponentName: v.opponentName,
          opponentCode: v.opponentCode.toUpperCase(),
          opponentColor: v.opponentColor || undefined,
          venue: v.venue || undefined,
          kickoff: v.kickoff,
          status: v.status,
          updatedAt: nowISO(),
        }
        set((s) => ({ events: [event, ...s.events] }))
        return id
      },

      updateEvent: (id, v) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === id
              ? {
                  ...e,
                  clubId: v.clubId,
                  name: v.name,
                  startDate: v.startDate,
                  endDate: v.endDate,
                  competition: v.competition,
                  opponentName: v.opponentName,
                  opponentCode: v.opponentCode.toUpperCase(),
                  opponentColor: v.opponentColor || undefined,
                  venue: v.venue || undefined,
                  kickoff: v.kickoff,
                  status: v.status,
                  updatedAt: nowISO(),
                }
              : e,
          ),
        })),

      deleteEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),

      resetCatalog: () =>
        set({
          designs: seedDesigns(),
          teams: seedTeams(),
          genericDesigns: seedGenericDesigns(),
          events: seedEvents(),
        }),
    }),
    {
      name: 'posterlab-catalog',
      // Bump whenever the static catalog (clubs/designs) changes so a browser
      // holding a cached snapshot re-seeds instead of showing stale data.
      // v2: club crests/logos, the Mantes→Nantes rename, the SAISON template.
      // v3: generic-designs gallery + Pro Shop events slices.
      // v4: per-club Pro Shop overrides (event design, offer prices, hero copy,
      //     backdrop) added to the Club shape.
      version: 4,
      partialize: (s) => ({
        designs: s.designs,
        teams: s.teams,
        genericDesigns: s.genericDesigns,
        events: s.events,
      }),
      // On a version bump, re-seed from the static data files (mirrors
      // resetCatalog). Without this, zustand v5 keeps the old persisted state.
      migrate: () =>
        ({
          designs: seedDesigns(),
          teams: seedTeams(),
          genericDesigns: seedGenericDesigns(),
          events: seedEvents(),
        }) as unknown as CatalogState,
    },
  ),
)

/* ── Reactive read hooks (subscribe to the store) ─────────────────────────── */
export const useDesigns = () => useCatalogStore((s) => s.designs)
export const useTeams = () => useCatalogStore((s) => s.teams)
export const useGenericDesigns = () => useCatalogStore((s) => s.genericDesigns)
export const useEvents = () => useCatalogStore((s) => s.events)

/** Generic designs the guest gallery is allowed to show (drafts hidden). */
export const liveGenericDesigns = (designs: GenericDesign[]) =>
  designs.filter((d) => d.status !== 'draft')

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

/**
 * A club's optional EVENT design (the second slot, surfaced during an event
 * window). Returns undefined when the club has none or it's unpublished — so
 * callers fall back to the single classic design.
 */
export function clubEventDesign(
  club: Club | undefined,
  designs: PosterTemplate[],
): PosterTemplate | undefined {
  if (!club?.eventDesignId) return undefined
  return liveDesigns(designs).find((d) => d.id === club.eventDesignId)
}

/**
 * The club's live admin event (Pro Admin tab) whose [start, end] window contains
 * `today`, if any — the campaign that turns the storefront into a match-day page
 * and unlocks the event design. Drafts are ignored.
 */
export function activeEventForClub(
  events: Event[],
  clubId: string | null | undefined,
  today: Date = new Date(),
): Event | undefined {
  if (!clubId) return undefined
  return events.find((e) => {
    if (e.clubId !== clubId || e.status === 'draft') return false
    const start = new Date(e.startDate)
    const end = new Date(e.endDate)
    end.setHours(23, 59, 59, 999)
    return today >= start && today <= end
  })
}

/**
 * Admin preview override: the event named by the `?event=<id>` URL param when it
 * belongs to `clubId`. Lets the back-office force-preview a campaign (any date,
 * even draft) on the storefront. Returns undefined off a preview URL.
 */
export function previewEventForClub(
  events: Event[],
  clubId: string | null | undefined,
): Event | undefined {
  if (!clubId || typeof window === 'undefined') return undefined
  const id = new URLSearchParams(window.location.search).get('event')
  return id ? events.find((e) => e.id === id && e.clubId === clubId) : undefined
}
