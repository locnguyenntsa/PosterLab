import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronRight, MapPin, Search } from 'lucide-react'
import { StepScreen } from '@/components/StepScreen'
import { PosterArt } from '@/components/PosterArt'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useFlowStore } from '@/store/useFlowStore'
import type { DesignSub } from '@/store/useFlowStore'
import { SPORTS, getSport } from '@/data/sports'
import { searchPlaces, getPlace } from '@/data/places'
import { useTeams, useDesigns, liveDesigns, clubPosterAt } from '@/store/useCatalogStore'

const SUBTITLES: Record<DesignSub, string> = {
  place: 'Where in France are you? Search or scroll to pick your spot.',
  sport: 'Pick your sport. We match the clubs.',
  club: 'Pick the club you fight for.',
  template: 'Lock a style. Preview the render next.',
}

export function DesignSelection() {
  // Sub-step lives in the store so the header's Back button can step through
  // sport → club → style before leaving the Design step.
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
  } = useFlowStore()

  const [placeQuery, setPlaceQuery] = useState('')

  const teams = useTeams()
  const designs = useDesigns()
  const place = getPlace(placeId)
  const sport = getSport(sportId)
  const club = teams.find((c) => c.id === clubId)
  const clubs = sportId ? teams.filter((c) => c.sportId === sportId) : []
  // Guests only ever see published designs.
  const templates = liveDesigns(designs)
  const places = searchPlaces(placeQuery)

  const crumbs: { key: DesignSub; label: string; done: boolean }[] = [
    { key: 'place', label: place?.name ?? 'Place', done: !!place },
    { key: 'sport', label: sport?.name ?? 'Sport', done: !!sport },
    { key: 'club', label: club?.name ?? 'Club', done: !!club },
    {
      key: 'template',
      label: designs.find((d) => d.id === templateId)?.name ?? 'Style',
      done: !!templateId,
    },
  ]

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
            Add Photo
            <ArrowRight className="size-5" strokeWidth={1.5} />
          </Button>
        ) : undefined
      }
    >
      {/* Breadcrumb — flat, uppercase; current crumb is bold + orange */}
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

      {/* ── Sub-step: Place ───────────────────────────── */}
      {sub === 'place' && (
        <div>
          {/* Search — flat input with a leading icon */}
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-mute"
              strokeWidth={1.5}
            />
            <Input
              type="search"
              value={placeQuery}
              onChange={(e) => setPlaceQuery(e.target.value)}
              placeholder="Search your city or région…"
              className="pl-12"
              aria-label="Search places in France"
            />
          </div>

          {/* Scrollable list — flat rows, hairline separators */}
          {places.length > 0 ? (
            <div className="mt-4 max-h-[55vh] overflow-y-auto border border-line">
              <div className="flex flex-col gap-px bg-line">
                {places.map((p) => {
                  const selected = placeId === p.id
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setPlace(p.id)
                        setSub('sport')
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
                      <span className="min-w-0 flex-1 truncate t-body text-cream">
                        {p.name}
                      </span>
                      <span className="label-wide hidden shrink-0 text-mute sm:block">
                        {p.region}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="mt-4 border border-line bg-surface p-8 text-center t-body">
              No places match “{placeQuery.trim()}”. Try another spelling.
            </div>
          )}
        </div>
      )}

      {/* ── Sub-step: Sport ───────────────────────────── */}
      {sub === 'sport' && (
        <div className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3">
          {SPORTS.map((s, i) => {
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
                  setSub('club')
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
        </div>
      )}

      {/* ── Sub-step: Club ────────────────────────────── */}
      {sub === 'club' && (
        <div className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2">
          {clubs.map((c, i) => {
            const selected = clubId === c.id
            return (
              <motion.button
                key={c.id}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.12, delay: i * 0.03 }}
                onClick={() => {
                  setClub(c.id)
                  setSub('template')
                }}
                className={cn(
                  'group relative flex items-center gap-4 bg-surface p-4 text-left transition-[background-color] duration-100 hover:bg-primary',
                  selected && 'outline outline-2 -outline-offset-2 outline-accent',
                )}
              >
                {/* Hard square crest — solid club colors, no gradient */}
                <div className="grid size-12 shrink-0 place-items-center font-display text-sm leading-none text-cream">
                  <span
                    className="flex size-full items-center justify-center border-l-[6px]"
                    style={{
                      backgroundColor: c.colors.primary,
                      borderLeftColor: c.colors.secondary,
                    }}
                  >
                    {c.shortCode}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate t-card">
                    {c.name}
                  </p>
                  <p className="mt-1 flex items-center gap-1 t-body">
                    <MapPin className="size-3" strokeWidth={1.5} />
                    {c.city}
                  </p>
                </div>
                <ChevronRight
                  className="size-4 shrink-0 text-mute transition-transform duration-100 group-hover:translate-x-0.5 group-hover:text-cream"
                  strokeWidth={1.5}
                />
              </motion.button>
            )
          })}
        </div>
      )}

      {/* ── Sub-step: Template ────────────────────────── */}
      {sub === 'template' && club && templates.length === 0 && (
        <div className="border border-line bg-surface p-8 text-center t-body">
          No designs are available right now. Please check back soon.
        </div>
      )}
      {sub === 'template' && club && templates.length > 0 && (
        <div className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
          {templates.map((t, i) => {
            const selected = templateId === t.id
            return (
              <motion.button
                key={t.id}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.12, delay: i * 0.03 }}
                onClick={() => setTemplate(t.id)}
                className={cn(
                  'group relative flex flex-col gap-3 bg-surface p-3 text-left transition-[background-color] duration-100 hover:bg-primary',
                  selected && 'outline outline-2 -outline-offset-2 outline-accent',
                )}
              >
                {selected && (
                  <span className="absolute right-1 top-1 z-30 bg-accent px-1.5 py-0.5 label text-ink">
                    Picked
                  </span>
                )}
                <PosterArt
                  club={club}
                  template={t}
                  hoverImage={clubPosterAt(club, i)}
                />
                <div className="px-1 pb-1">
                  <p className="t-card">
                    {t.name}
                  </p>
                  <p className="mt-1 line-clamp-2 t-body">
                    {t.description}
                  </p>
                </div>
              </motion.button>
            )
          })}
        </div>
      )}
    </StepScreen>
  )
}
