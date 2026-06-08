import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, AlertCircle } from 'lucide-react'
import { StepScreen } from '@/components/StepScreen'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useFlowStore } from '@/store/useFlowStore'
import { useTeams, useDesigns } from '@/store/useCatalogStore'
import { compositePoster } from '@/features/generate/posterComposite'

const STAGES = [
  { until: 22, label: 'Analyzing photo' },
  { until: 45, label: 'Cutting subject' },
  { until: 70, label: 'Compositing poster' },
  { until: 92, label: 'Finishing touches' },
  { until: 100, label: 'Finalizing render' },
]

function stageLabel(p: number) {
  return STAGES.find((s) => p <= s.until)?.label ?? STAGES[STAGES.length - 1].label
}

export function PosterGeneration() {
  const { photoUrl, clubId, templateId, posterUrl, setPoster, next } = useFlowStore()
  const teams = useTeams()
  const designs = useDesigns()
  const club = teams.find((c) => c.id === clubId)
  const template = designs.find((d) => d.id === templateId)

  const [progress, setProgress] = useState(posterUrl ? 100 : 0)
  const [done, setDone] = useState(Boolean(posterUrl))
  const [error, setError] = useState<string | null>(null)
  const readyRef = useRef(Boolean(posterUrl))
  const startedRef = useRef(false)

  useEffect(() => {
    if (done) return
    if (!photoUrl || !club || !template) return

    // Kick off the real composite once. (Guarded so StrictMode's double-mount
    // doesn't render twice — but the interval below is still recreated on
    // remount so progress always advances.)
    if (!startedRef.current) {
      startedRef.current = true
      compositePoster({ photoUrl, club, template })
        .then((url) => {
          setPoster(url)
          readyRef.current = true
        })
        .catch(() => setError('Something went wrong while rendering. Please try again.'))
    }

    // Drive the progress bar; only finish once the composite is ready.
    const interval = setInterval(() => {
      setProgress((p) => {
        if (readyRef.current) {
          const nextP = Math.min(100, p + 6)
          if (nextP >= 100) {
            clearInterval(interval)
            setTimeout(() => setDone(true), 250)
          }
          return nextP
        }
        // Crawl toward 92 while waiting for the render.
        return Math.min(92, p + Math.random() * 7 + 2)
      })
    }, 220)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error) {
    return (
      <StepScreen step={3} kicker="Preview" title="Render Failed">
        <div className="flex flex-col items-center gap-6 border border-line bg-surface p-8 text-center">
          <div className="flex items-center gap-3">
            <AlertCircle className="size-8 text-danger" strokeWidth={1.5} />
            <p className="label text-danger">Engine Stalled</p>
          </div>
          <p className="max-w-md t-body">{error}</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Start Over
          </Button>
        </div>
      </StepScreen>
    )
  }

  return (
    <StepScreen
      step={3}
      kicker="Preview"
      title={done ? 'Poster Ready' : 'Rendering Now'}
      subtitle={
        done
          ? 'Studio-grade. Print-ready. This is yours.'
          : 'The render engine is compositing your poster.'
      }
      footer={
        done ? (
          <Button className="w-full" size="lg" onClick={next}>
            Continue
            <ArrowRight className="size-5" strokeWidth={1.5} />
          </Button>
        ) : undefined
      }
    >
      <div className="flex flex-col items-center">
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div
              key="rendering"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="flex w-full flex-col items-center gap-8"
            >
              {/* Flat render placeholder — solid scanning bar over tinted photo */}
              <div className="relative aspect-[3/4] w-56 overflow-hidden border border-line bg-surface sm:w-64">
                {photoUrl && (
                  <img
                    src={photoUrl}
                    alt=""
                    className="h-full w-full object-cover opacity-20"
                  />
                )}
                {/* solid hard-edged scan bar */}
                <motion.div
                  className="absolute inset-x-0 h-2 bg-accent"
                  animate={{ top: ['0%', '100%'] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                />
                <div className="absolute left-3 top-3 bg-ink px-2 py-0.5 label text-cream">
                  Live Render
                </div>
              </div>

              <div className="w-full max-w-sm">
                <div className="flex items-end justify-between">
                  <motion.span
                    key={stageLabel(progress)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.1 }}
                    className="label text-cream"
                  >
                    {stageLabel(progress)}
                  </motion.span>
                  <span className="t-card tabular-nums text-accent">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress className="mt-4" value={progress} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.12 }}
              className="flex w-full flex-col items-center gap-5"
            >
              {posterUrl && (
                <img
                  src={posterUrl}
                  alt="Your generated poster"
                  className="w-60 border border-line sm:w-72"
                />
              )}
              <Badge variant="success">HD Render Complete</Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </StepScreen>
  )
}
