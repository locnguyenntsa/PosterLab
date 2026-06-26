import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronRight, MapPin, Search, Sparkles, X } from 'lucide-react'
import { StepScreen } from '@/components/StepScreen'
import { PosterArt } from '@/components/PosterArt'
import { ClubNotFound } from '@/features/design/ClubNotFound'
import { GenericDesign } from '@/features/design/GenericDesign'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useFlowStore } from '@/store/useFlowStore'
import type { DesignSub } from '@/store/useFlowStore'
import type { Place } from '@/types'
import { SPORTS, getSport } from '@/data/sports'
import { getPlace, findPlaceByCityName, filterPlaces, fold } from '@/data/places'
import { useTeams, useDesigns, clubPosterAt, clubDesign, resolveClub } from '@/store/useCatalogStore'

const SUBTITLES: Record<DesignSub, string> = {
  sport: 'Pick your sport. We match the clubs.',
  place: 'Where’s your club based? Search by department or city.',
  club: 'Pick the club you fight for.',
  template: 'Your club’s design — confirm to continue.',
}

// Neutral poster base shown (tinted to the club's brand color) when a partner
// club has no real artwork of its own yet. Repoint at a neutral
// "/posters/base.jpg" template once that asset lands.
const FALLBACK_BASE = '/posters/reims-1.jpg'

export function DesignSelection() {
  // Sub-step lives in the store so the header's Back button can step through
  // sport → place → club → style before leaving the Design step.
  const {
    placeId,
    sportId,
    clubId,
    templateId,
    setPlace,
    setSport,
    setClub,
    setTemplate,
    next,
    designSub: sub,
    setDesignSub: setSub,
    shopClubId,
    genericDesign,
    enterGenericDesign,
  } = useFlowStore()
  // Locked mode = no sport/place/club breadcrumb, just a header + the style grid.
  // True in a Pro Shop and in the non-partner funnel's generic house club.
  const lockedMode = !!shopClubId || clubId === 'generic'

  const [placeQuery, setPlaceQuery] = useState('')
  const [clubQuery, setClubQuery] = useState('')
  const [showComingSoon, setShowComingSoon] = useState(false)
  // The "club not a partner yet" edge case overlays the club grid.
  const [showNotFound, setShowNotFound] = useState(false)

  const teams = useTeams()
  const designs = useDesigns()
  const place = getPlace(placeId)
  const sport = getSport(sportId)
  // resolveClub also returns the synthetic generic club (not in the teams array).
  const club = resolveClub(teams, clubId)
  // The normal shop standardizes on the photographic "SAISON" design for every
  // partner club (PM: "use those design for the normal shop"). A club's own
  // `designId` is reserved for its Pro Shop, which still shows the bespoke
  // design — so SAISON is forced here only when NOT in a Pro Shop. The generic
  // house club runs its own multi-style picker instead.
  const saisonDesign = designs.find((d) => d.id === 'saison')
  const design =
    !club || club.id === 'generic'
      ? undefined
      : !shopClubId && club.partner !== false && saisonDesign
        ? saisonDesign
        : clubDesign(club, designs)

  // Auto-select the club's single design so the downstream photo → render →
  // checkout steps (which read templateId) work without a manual style pick.
  useEffect(() => {
    if (!design) return
    if (templateId !== design.id) setTemplate(design.id)
  }, [design, templateId, setTemplate])

  // Preview the one design with the club's own poster when it has one, else a
  // neutral base recolored to the club's brand. No placeholder.
  const ownPoster = club ? clubPosterAt(club, 0) : undefined
  const designPreview = ownPoster ?? FALLBACK_BASE
  const designTint = ownPoster ? undefined : club?.colors.primary

  // Only surface live sports that actually have a club behind them — never a
  // dead end. Coming-soon sports are folded into the single "Other sport" tile.
  const sports = useMemo(
    () => SPORTS.filter((s) => !s.comingSoon && teams.some((c) => c.sportId === s.id)),
    [teams],
  )

  const sportClubs = useMemo(
    () => (sportId ? teams.filter((c) => c.sportId === sportId) : []),
    [teams, sportId],
  )

  // Locations are derived from the clubs that exist for the chosen sport, so a
  // picked place always has at least one club behind it (the deck's "no dead
  // ends" tip). City-level today; true départements are a later refinement.
  const locationPlaces = useMemo(() => {
    const seen = new Set<string>()
    const out: Place[] = []
    for (const c of sportClubs) {
      const p = findPlaceByCityName(c.city)
      if (p && !seen.has(p.id)) {
        seen.add(p.id)
        out.push(p)
      }
    }
    return out.sort((a, b) => a.name.localeCompare(b.name, 'fr'))
  }, [sportClubs])

  // How many clubs with a ready design sit in each place (for the chosen sport)
  // — shown as a count badge next to the place name. "Coming Soon" clubs
  // (partner === false) have no design yet, so they don't count.
  const placeCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const c of sportClubs) {
      if (c.partner === false) continue
      const p = findPlaceByCityName(c.city)
      if (p) counts.set(p.id, (counts.get(p.id) ?? 0) + 1)
    }
    return counts
  }, [sportClubs])

  const places = filterPlaces(locationPlaces, placeQuery)

  // The "club not a partner yet" view — reused from both the place (no search
  // match) and club (not in grid) steps.
  const notFoundView = (
    <ClubNotFound
      onClose={() => setShowNotFound(false)}
      onGeneric={(color) => {
        setShowNotFound(false)
        enterGenericDesign(color)
      }}
    />
  )

  // Clubs are filtered by BOTH the chosen sport and the chosen location.
  const clubs =
    sportId && placeId
      ? sportClubs.filter((c) => findPlaceByCityName(c.city)?.id === placeId)
      : []

  // Free-text club search within the chosen area — matches name or city,
  // accent-insensitive (so "etienne" finds "Saint-Étienne").
  const visibleClubs = clubQuery.trim()
    ? clubs.filter(
        (c) => fold(c.name).includes(fold(clubQuery)) || fold(c.city).includes(fold(clubQuery)),
      )
    : clubs

  const crumbs: { key: DesignSub; label: string; done: boolean }[] = [
    { key: 'sport', label: sport?.name ?? 'Sport', done: !!sport },
    { key: 'place', label: place?.region ?? 'Department', done: !!place },
    { key: 'club', label: club?.name ?? 'Club', done: !!club },
    {
      key: 'template',
      label: designs.find((d) => d.id === templateId)?.name ?? 'Design',
      done: !!templateId,
    },
  ]

  // The non-partner generic-design flow (€14.99, logo-less) takes over the whole
  // step-1 screen — its own color + style picker, not the sport/place/club steps.
  if (genericDesign) return <GenericDesign />

  return (
    <StepScreen
      step={1}
      kicker="Design"
      title="Build Your Poster"
      subtitle={SUBTITLES[sub]}
      footer={
        sub === 'template' ? (
          <Button
            className="w-full"
            size="lg"
            disabled={!templateId}
            onClick={next}
          >
            Choose This Design
            <ArrowRight className="size-5" strokeWidth={1.5} />
          </Button>
        ) : undefined
      }
    >
      {/* Locked mode (Pro Shop or generic house club): the club is fixed, so
          there's no sport/place/club breadcrumb — just a header above the picker. */}
      {lockedMode ? (
        <div className="mb-9 border-b border-line pb-5 text-center">
          <span className="label-wide text-mute">{club?.name} · Your Design</span>
        </div>
      ) : (
        <div className="mb-9 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 border-b border-line pb-5">
          {crumbs.map((c, i) => {
          const reachable = i === 0 || crumbs[i - 1].done
          const isCurrent = c.key === sub
          return (
            <div key={c.key} className="flex items-center gap-2">
              {i > 0 && (
                <ChevronRight className="size-3.5 text-mute" strokeWidth={1.5} />
              )}
              <button
                type="button"
                disabled={!reachable}
                onClick={() => reachable && setSub(c.key)}
                className={cn(
                  'label-wide transition-[color] duration-100',
                  isCurrent
                    ? 'font-bold text-accent'
                    : c.done
                      ? 'text-cream hover:text-accent'
                      : 'text-mute',
                  !reachable && 'cursor-not-allowed',
                )}
              >
                {c.label}
              </button>
            </div>
          )
          })}
        </div>
      )}

      {/* ── Sub-step: Sport ───────────────────────────── */}
      {sub === 'sport' && (
        <>
          <div className="grid grid-cols-2 gap-px border border-line bg-line backdrop-blur-sm">
            {sports.map((s, i) => {
              const selected = sportId === s.id
              return (
                <motion.button
                  key={s.id}
                  type="button"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.12, delay: i * 0.03 }}
                  onClick={() => {
                    setSport(s.id)
                    setSub('place')
                  }}
                  className={cn(
                    'group relative flex flex-col items-start gap-3 bg-surface p-6 text-left transition-[background-color] duration-100 hover:bg-primary',
                    selected && 'outline outline-2 -outline-offset-2 outline-accent',
                  )}
                >
                  {selected && (
                    <span className="absolute right-0 top-0 size-0 border-l-[18px] border-t-[18px] border-l-transparent border-t-accent" />
                  )}
                  <span className="text-4xl leading-none">{s.emoji}</span>
                  <span className="t-card">
                    {s.name}
                  </span>
                  <span className="t-body">{s.tagline}</span>
                </motion.button>
              )
            })}

            {/* Other sport — coming soon (the deck's 4th option). Opens a note
                rather than advancing the funnel. */}
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.12, delay: sports.length * 0.03 }}
              onClick={() => setShowComingSoon(true)}
              className="group relative flex flex-col items-start gap-3 bg-surface p-6 text-left transition-[background-color] duration-100 hover:bg-primary"
            >
              <span className="text-4xl leading-none">🏅</span>
              <span className="t-card">Other Sport</span>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap bg-cream px-2.5 py-1 label text-ink">
                <Sparkles className="size-3.5" strokeWidth={2} />
                Coming soon
              </span>
            </motion.button>
          </div>

          <Dialog open={showComingSoon} onClose={() => setShowComingSoon(false)} size="sm">
            <div className="flex flex-col items-center text-center">
              <span className="inline-flex items-center gap-1.5 bg-cream px-2.5 py-1 label text-ink">
                <Sparkles className="size-3.5" strokeWidth={2} />
                Coming soon
              </span>
              <h2 className="mt-4 t-card">More Sports On The Way</h2>
              <p className="mt-2 max-w-xs t-body">
                Football, basketball and rugby are available now. Handball,
                volleyball, ice hockey and more are coming soon — check back shortly.
              </p>
              <Button size="lg" className="mt-5 w-full" onClick={() => setShowComingSoon(false)}>
                Got It
              </Button>
            </div>
          </Dialog>
        </>
      )}

      {/* ── Sub-step: Place (location / department) ───── */}
      {sub === 'place' && (showNotFound ? notFoundView : (
        <div>
          {/* Search — flat input with a leading icon */}
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 z-10 size-5 -translate-y-1/2 text-mute"
              strokeWidth={1.5}
            />
            <Input
              type="search"
              value={placeQuery}
              onChange={(e) => setPlaceQuery(e.target.value)}
              placeholder="Search your department or city…"
              className="pl-12 pr-11 [&::-webkit-search-cancel-button]:appearance-none"
              aria-label="Search your area"
            />
            {placeQuery && (
              <button
                type="button"
                onClick={() => setPlaceQuery('')}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer text-mute transition-colors duration-100 hover:text-cream"
              >
                <X className="size-5" strokeWidth={1.5} />
              </button>
            )}
          </div>

          {/* Scrollable list — flat rows, hairline separators */}
          {places.length > 0 ? (
            <div className="mt-4 max-h-[55vh] overflow-y-auto border border-line backdrop-blur-sm">
              <div className="flex flex-col gap-px bg-line">
                {places.map((p) => {
                  const selected = placeId === p.id
                  const count = placeCounts.get(p.id) ?? 0
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setPlace(p.id)
                        setSub('club')
                      }}
                      className={cn(
                        'group relative flex items-center gap-3 bg-surface px-4 py-3 text-left transition-[background-color] duration-100 hover:bg-primary',
                        selected && 'outline outline-2 -outline-offset-2 outline-accent',
                      )}
                    >
                      <MapPin
                        className="size-4 shrink-0 text-mute group-hover:text-cream"
                        strokeWidth={1.5}
                      />
                      {/* Department leads (the broader area), with the city as the
                          supporting line below it. */}
                      <span className="min-w-0 flex-1">
                        <span className="block min-w-0 truncate t-card text-[1.75rem] text-cream">
                          {p.region}
                        </span>
                        <span className="mt-0.5 block min-w-0 truncate label-wide text-mute">
                          {p.name}
                        </span>
                      </span>
                      {/* How many clubs with a ready design are in this place. */}
                      <span
                        className={cn(
                          'shrink-0 px-2 py-0.5 label tabular-nums',
                          count > 0 ? 'bg-cream text-ink' : 'bg-cream/10 text-mute',
                        )}
                        aria-label={`${count} ${count === 1 ? 'club' : 'clubs'} with a design`}
                      >
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <>
              <div className="mt-4 border border-line bg-surface p-8 text-center t-body backdrop-blur-sm">
                No areas with a club match “{placeQuery.trim()}”. Try another spelling.
              </div>
              {/* Escape hatch when the search finds nothing — same CTA as the club step. */}
              <div className="mt-6 flex flex-col items-center gap-3 border-t border-line pt-6 text-center">
                <p className="label-wide text-mute">Don’t see your club?</p>
                <button
                  type="button"
                  onClick={() => setShowNotFound(true)}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap t-card text-xl text-cream transition-colors duration-100 hover:text-accent"
                >
                  My Club Isn’t Listed
                  <ArrowRight className="size-4" strokeWidth={1.5} />
                </button>
              </div>
            </>
          )}
        </div>
      ))}

      {/* ── Sub-step: Club ────────────────────────────── */}
      {sub === 'club' &&
        (showNotFound ? (
          notFoundView
        ) : (
          <>
          {/* Search — jump straight to a club by name (or city) within the area */}
          <div className="relative mb-4">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 z-10 size-5 -translate-y-1/2 text-mute"
              strokeWidth={1.5}
            />
            <Input
              type="search"
              value={clubQuery}
              onChange={(e) => setClubQuery(e.target.value)}
              placeholder="Search your club…"
              className="pl-12 pr-11 [&::-webkit-search-cancel-button]:appearance-none"
              aria-label="Search your club"
            />
            {clubQuery && (
              <button
                type="button"
                onClick={() => setClubQuery('')}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer text-mute transition-colors duration-100 hover:text-cream"
              >
                <X className="size-5" strokeWidth={1.5} />
              </button>
            )}
          </div>

          {visibleClubs.length > 0 ? (
          <div className="grid grid-cols-1 gap-px border border-line bg-line backdrop-blur-sm sm:grid-cols-2">
            {visibleClubs.map((c, i) => {
              const selected = clubId === c.id
              const notPartner = c.partner === false
              return (
                <motion.button
                  key={c.id}
                  type="button"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.12, delay: i * 0.03 }}
                  onClick={() => {
                    // A listed-but-not-yet-registered club routes to the edge case.
                    if (notPartner) {
                      setShowNotFound(true)
                      return
                    }
                    setClub(c.id)
                    setSub('template')
                  }}
                  className={cn(
                    'group relative flex items-center gap-4 bg-surface p-4 text-left transition-[background-color] duration-100 hover:bg-primary',
                    selected && 'outline outline-2 -outline-offset-2 outline-accent',
                  )}
                >
                  {/* Crest — real club logo when available, else a hard square
                      in the club's solid colors with the short code. */}
                  <div className="grid size-12 shrink-0 place-items-center font-display text-sm leading-none text-cream">
                    {c.logoUrl ? (
                      <img src={c.logoUrl} alt="" className="size-full object-contain" />
                    ) : (
                      <span
                        className="flex size-full items-center justify-center border-l-[6px]"
                        style={{
                          backgroundColor: c.colors.primary,
                          borderLeftColor: c.colors.secondary,
                        }}
                      >
                        {c.shortCode}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate t-card text-2xl">{c.name}</p>
                    <p className="mt-1 flex items-center gap-1 t-body text-sm">
                      <MapPin className="size-3" strokeWidth={1.5} />
                      {c.city}
                    </p>
                  </div>
                  {/* Not-yet-a-partner clubs are tagged "Coming Soon" (amber =
                      pending, not an error) instead of an arrow. */}
                  {notPartner ? (
                    <span className="shrink-0 whitespace-nowrap bg-warn/15 px-2 py-0.5 label text-warn">
                      Coming Soon
                    </span>
                  ) : (
                    <ChevronRight
                      className="size-4 shrink-0 text-mute transition-transform duration-100 group-hover:translate-x-0.5 group-hover:text-cream"
                      strokeWidth={1.5}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>
          ) : (
            <div className="border border-line bg-surface p-8 text-center t-body backdrop-blur-sm">
              No club matches “{clubQuery.trim()}” in this area.
            </div>
          )}

          {/* Escape hatch — pulled OUT of the list and shown below as a standalone
              CTA, matching the home "get your club listed" button. */}
          <div className="mt-6 flex flex-col items-center gap-3 border-t border-line pt-6 text-center">
            <p className="label-wide text-mute">Don’t see your club?</p>
            <button
              type="button"
              onClick={() => setShowNotFound(true)}
              className="inline-flex items-center gap-1.5 whitespace-nowrap t-card text-xl text-cream transition-colors duration-100 hover:text-accent"
            >
              My Club Isn’t Listed
              <ArrowRight className="size-4" strokeWidth={1.5} />
            </button>
          </div>
          </>
        ))}

      {/* ── Sub-step: Design ──────────────────────────────
          One design, one clear action (slide 7): the club's single prepared
          design shown for confirmation — no grid, no comparison. */}
      {sub === 'template' && club && !design && (
        <div className="border border-line bg-surface p-8 text-center t-body backdrop-blur-sm">
          No designs are available right now. Please check back soon.
        </div>
      )}
      {sub === 'template' && club && design && (
        <div className="mx-auto max-w-xs">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.12 }}
            className="relative flex flex-col gap-3 border border-line bg-surface p-3 backdrop-blur-sm"
          >
            <span className="absolute right-1 top-1 z-30 bg-cream px-1.5 py-0.5 label text-ink">
              Your design
            </span>
            <PosterArt club={club} template={design} image={designPreview} tint={designTint} />
            <div className="px-1 pb-1 text-center">
              <p className="t-card text-xl">{design.name}</p>
              <p className="mt-1 t-body text-sm">{design.description}</p>
            </div>
          </motion.div>
          <p className="mt-4 text-center t-body text-sm text-mute">
            {club.name}’s prepared design. Add your photo to bring it to life.
          </p>
        </div>
      )}
    </StepScreen>
  )
}
