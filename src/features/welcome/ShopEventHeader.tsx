import type { Club } from '@/types'
import type { EventConfig } from '@/data/shopConfig'
import { Countdown } from '@/features/welcome/Countdown'

/*
  Event-page hero for a Pro Shop fixture — the matchday IS the hero, floating
  directly on the club backdrop (no panel): a competition eyebrow, a big match-up
  (home crest + VS + opponent crest), the kick-off date/time, and a live
  countdown. Flat, centered, no radius/shadow. The opponent is free-form config
  (see EventConfig), so it need not be a catalog club. `accent` (the club colour)
  tints the competition label; the VS uses the brand accent.
*/
export function ShopEventHeader({
  home,
  event,
  accent,
}: {
  home: Club
  event: EventConfig
  accent: string
}) {
  // Show the venue's local kick-off time (French fixtures), not the viewer's
  // timezone — so it always reads e.g. "Sun 23 Aug 2026 · 19:00".
  const d = new Date(event.kickoff)
  const tz = 'Europe/Paris'
  const dateStr = d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: tz,
  })
  const timeStr = d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: tz,
  })

  return (
    <div className="flex w-full flex-col items-center gap-7">
      {/* Competition eyebrow */}
      <span
        className="inline-block bg-ink px-3 py-1 label"
        style={{ color: accent }}
      >
        {event.competition}
      </span>

      {/* Match-up: home crest + name · VS · opponent crest + name */}
      <div className="flex w-full items-start justify-center gap-4 sm:gap-12">
        <Side
          logo={home.logoUrl}
          shortCode={home.shortCode}
          name={home.name}
          color={home.colors.primary}
        />
        <span className="mt-6 shrink-0 font-display text-3xl leading-none text-cream sm:mt-8 sm:text-4xl">
          VS
        </span>
        <Side
          logo={event.opponent.logo}
          shortCode={event.opponent.shortCode}
          name={event.opponent.name}
          color={event.opponent.color}
        />
      </div>

      {/* Kick-off date / time / venue */}
      <p className="label-wide text-center text-mute">
        {dateStr} · {timeStr}
        {event.venue ? ` · ${event.venue}` : ''}
      </p>

      <Countdown kickoff={event.kickoff} className="mx-auto w-full max-w-xs" />
    </div>
  )
}

/* One team side — real crest if available, else a colored shortCode disc. */
function Side({
  logo,
  shortCode,
  name,
  color,
}: {
  logo?: string
  shortCode: string
  name: string
  color?: string
}) {
  return (
    <div className="flex w-24 flex-col items-center gap-2.5 text-center sm:w-32">
      {logo ? (
        <img src={logo} alt="" className="size-20 shrink-0 object-contain sm:size-24" />
      ) : (
        <span
          className="grid size-20 shrink-0 place-items-center sm:size-24"
          style={{ backgroundColor: color ?? '#1a1920' }}
        >
          <span className="font-display text-3xl leading-none text-cream sm:text-4xl">
            {shortCode}
          </span>
        </span>
      )}
      <span className="font-display text-lg uppercase leading-none text-cream sm:text-xl">
        {name}
      </span>
    </div>
  )
}
