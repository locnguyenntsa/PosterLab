import { motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, Timer, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HomePosterCard } from '@/features/welcome/HomePosterCard'
import { cn } from '@/lib/utils'
import { useFlowStore } from '@/store/useFlowStore'
import { useTeams, useDesigns, clubPosterAt } from '@/store/useCatalogStore'

// Three sample posters fanned into a curve at the top of the home page.
const FAN = [
  { clubId: 'stade-reims', templateId: 'stadium', rot: -13, y: 20 },
  { clubId: 'paris-fc', templateId: 'spotlight', rot: 0, y: -14 },
  { clubId: 'asse', templateId: 'retro', rot: 13, y: 20 },
]

const VALUE_PROPS = [
  { icon: BadgeCheck, title: 'Official HD', line: 'Print-ready render' },
  { icon: Timer, title: 'Under 15s', line: 'Preview before you buy' },
  { icon: Truck, title: 'Delivered', line: 'Framed, 5–7 days' },
]

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
}

export function WelcomeScreen() {
  const start = useFlowStore((s) => s.start)
  const teams = useTeams()
  const designs = useDesigns()

  return (
    <div className="mx-auto flex min-h-[calc(100svh-65px)] w-full max-w-3xl flex-col items-center justify-center px-5 py-10 text-center">
      {/* Curved fan of 3 poster cards — the hero focal point */}
      <div className="relative flex items-end justify-center">
        {FAN.map((f, i) => {
          const club = teams.find((c) => c.id === f.clubId)
          const template = designs.find((d) => d.id === f.templateId)
          if (!club || !template) return null
          const isCenter = i === 1
          return (
            <motion.div
              key={f.clubId}
              initial={{ opacity: 0, y: f.y + 22, rotate: f.rot }}
              animate={{ opacity: 1, y: f.y, rotate: f.rot }}
              transition={{ duration: 0.18, delay: i * 0.07, ease: 'easeOut' }}
              style={{ transformOrigin: 'bottom center' }}
              className={cn(
                'hover:z-30',
                isCenter ? 'z-20 w-36 sm:w-44' : 'z-10 w-28 sm:w-36',
                i === 0 && '-mr-10 sm:-mr-12',
                i === 2 && '-ml-10 sm:-ml-12',
              )}
            >
              <HomePosterCard
                club={club}
                template={template}
                image={clubPosterAt(club, 0)}
              />
            </motion.div>
          )
        })}
      </div>

      {/* Centered title block — compact so the page never needs scrolling */}
      <motion.div {...fade} transition={{ duration: 0.15, delay: 0.18 }} className="mt-7">
        <span className="inline-block bg-ink px-2.5 py-1 label text-cream">
          Personalized Sports Posters
        </span>
      </motion.div>

      <motion.h1
        {...fade}
        transition={{ duration: 0.15, delay: 0.22 }}
        className="mt-5 t-hero"
      >
        Your Face.
        <br />
        Their Colors.
      </motion.h1>

      <motion.p
        {...fade}
        transition={{ duration: 0.15, delay: 0.26 }}
        className="mx-auto mt-5 max-w-sm t-body"
      >
        Pick a club. Drop one photo.
        <br />
        Get a print-ready poster with you on it.
      </motion.p>

      <motion.div
        {...fade}
        transition={{ duration: 0.15, delay: 0.3 }}
        className="mt-7 flex flex-col items-center gap-3"
      >
        <Button size="lg" onClick={start}>
          Build My Poster
          <ArrowRight className="size-6" strokeWidth={1.5} />
        </Button>
        <span className="label-wide text-mute">
          2 Min · No Account · From €39 Framed
        </span>
      </motion.div>

      {/* Value props — distinct dark tiles, orange icons, orange top accent */}
      <motion.div
        {...fade}
        transition={{ duration: 0.15, delay: 0.34 }}
        className="relative mt-6 w-full border border-line"
      >
        <div className="absolute inset-x-0 top-0 z-10 h-[3px] bg-accent" />
        <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-3">
          {VALUE_PROPS.map(({ icon: Icon, title, line }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-2 bg-surface px-3 py-6 text-center sm:py-10"
            >
              <Icon className="size-6 text-accent" strokeWidth={1.5} />
              <p className="t-card">
                {title}
              </p>
              <p className="t-body">{line}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
