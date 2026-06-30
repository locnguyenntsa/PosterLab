import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, AlertCircle, RotateCcw, Check, ShoppingBag, Plus } from 'lucide-react'
import { StepScreen } from '@/components/StepScreen'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { UpsellDialog } from '@/features/checkout/UpsellDialog'
import { OfferSelector } from '@/features/generate/OfferSelector'
import { useFlowStore } from '@/store/useFlowStore'
import { useTeams, useDesigns, resolveClub } from '@/store/useCatalogStore'
import { useCartStore } from '@/store/useCartStore'
import { compositePoster } from '@/features/generate/posterComposite'
import { compositeGenericPoster } from '@/features/generate/genericPoster'
import {
  POSTER_FORMAT,
  POSTER_PRICE_EUR,
  GENERIC_POSTER_FORMAT,
  GENERIC_PRICE_EUR,
  PRINT_SIZES,
} from '@/types'
import type { OfferType } from '@/types'
import { offerPrice, offerFormat, packSaving } from '@/lib/pricing'
import { cn } from '@/lib/utils'

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
  const {
    photoUrl,
    clubId,
    templateId,
    posterUrl,
    setPoster,
    clearPhoto,
    goTo,
    cartItemId,
    setCartItemId,
    startAnother,
    genericDesign,
    genericColor,
    uploadedDesignUrl,
    shopClubId,
  } = useFlowStore()
  const addItem = useCartStore((s) => s.addItem)
  const patchItem = useCartStore((s) => s.patchItem)
  const cartItems = useCartStore((s) => s.items)
  const teams = useTeams()
  const designs = useDesigns()
  const club = resolveClub(teams, clubId)
  const template = designs.find((d) => d.id === templateId)
  // A partner club whose assigned design is the photographic "SAISON" stadium —
  // rendered via the generic composite, recolored to the club's colors + its crest.
  const isSaison = template?.style === 'saison'

  const [progress, setProgress] = useState(posterUrl ? 100 : 0)
  const [done, setDone] = useState(Boolean(posterUrl))
  const [error, setError] = useState<string | null>(null)

  // The amateur offer chosen on the "Poster Ready" screen (Digital / Printed /
  // Pack). Only standard club posters show the selector; generic & uploaded
  // designs add a single printed line as before.
  const isStandard = !genericDesign && !uploadedDesignUrl
  const [offer, setOffer] = useState<OfferType>('printed')
  const [size, setSize] = useState<string>(PRINT_SIZES[0].label)
  const [qty, setQty] = useState(1)
  // Pro Shop clubs can override the three offer prices — feed the locked club so
  // the figures reflect the back-office pricing (amateur flow passes none).
  const proClub = shopClubId ? club : undefined

  // The "make it a Pack" upsell fires once when a PRINTED-ONLY poster is added.
  const [showUpsell, setShowUpsell] = useState(false)
  const afterUpsellRef = useRef<'stay' | 'checkout'>('stay')
  const upsellDoneRef = useRef(false)
  const readyRef = useRef(Boolean(posterUrl))
  const startedRef = useRef(false)

  useEffect(() => {
    if (done) return
    if (!photoUrl) return
    // Generic design renders the "SAISON" stadium template from the chosen color;
    // partner posters need a resolved club + template.
    if (!genericDesign && (!club || !template)) return

    // Kick off the real composite once. (Guarded so StrictMode's double-mount
    // doesn't render twice — but the interval below is still recreated on
    // remount so progress always advances.)
    if (!startedRef.current) {
      startedRef.current = true
      const render =
        genericDesign && genericColor
          ? compositeGenericPoster({ photoUrl, color: genericColor })
          : isSaison && club
            ? compositeGenericPoster({
                photoUrl,
                color: club.colors.primary,
                logoUrl: club.logoUrl,
                crestText: club.shortCode,
              })
            : club && template
              ? compositePoster({ photoUrl, club, template })
              : null
      render
        ?.then((url) => {
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

  // Start over after the render: drop the photo + poster and return to upload
  // so the user can try a different shot and re-generate.
  function retake() {
    clearPhoto()
    goTo(2)
  }

  // True only while this poster's snapshot is actually still in the cart — so if
  // it's removed from the header cart, the button reverts from "Added" to "Add".
  const inCart = Boolean(cartItemId) && cartItems.some((it) => it.id === cartItemId)

  // Snapshot the finished poster into the cart (once). Create Another and
  // Checkout both call this first, so the current poster is never lost. Standard
  // posters carry the chosen offer/size/qty; generic & uploaded designs add a
  // single printed line as before.
  function ensureInCart() {
    if (inCart || !posterUrl || !clubId || !templateId) return
    // The offer-specific fields; generic & uploaded designs are fixed printed
    // lines, a standard poster carries the chosen offer/size/qty.
    const line = genericDesign
      ? { offer: 'printed' as const, format: GENERIC_POSTER_FORMAT, priceEur: GENERIC_PRICE_EUR }
      : uploadedDesignUrl
        ? { offer: 'printed' as const, size: PRINT_SIZES[0].label, format: POSTER_FORMAT, priceEur: POSTER_PRICE_EUR }
        : {
            offer,
            size: offer === 'digital' ? undefined : size,
            format: offerFormat(offer, size),
            priceEur: offerPrice(offer, proClub, size),
            qty,
          }
    setCartItemId(addItem({ clubId, templateId, posterUrl, ...line }))
  }

  // The digital upsell: only a PRINTED-only standard poster gets nudged toward
  // the Pack, and only once. Returns true when the pop-up is shown so callers can
  // defer navigation until it's accepted or dismissed.
  function maybeUpsell(after: 'stay' | 'checkout'): boolean {
    if (isStandard && offer === 'printed' && !upsellDoneRef.current) {
      afterUpsellRef.current = after
      setShowUpsell(true)
      return true
    }
    return false
  }

  function addToCart() {
    ensureInCart()
    maybeUpsell('stay')
  }

  function createAnother() {
    ensureInCart()
    startAnother()
  }

  // Checkout: snapshot the poster, then (printed-only) offer the Pack upgrade.
  // Navigation to the details form waits until the pop-up is resolved.
  function checkout() {
    ensureInCart()
    if (!maybeUpsell('checkout')) goTo(4)
  }

  // Decline → keep the printed poster; Accept → upgrade the cart line to a Pack.
  function resolveUpsell(accepted: boolean) {
    upsellDoneRef.current = true
    if (accepted && cartItemId) {
      patchItem(cartItemId, {
        offer: 'pack',
        size,
        format: offerFormat('pack', size),
        priceEur: offerPrice('pack', proClub, size),
      })
      setOffer('pack')
    }
    setShowUpsell(false)
    if (afterUpsellRef.current === 'checkout') goTo(4)
  }

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
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <Button
                variant={inCart ? 'secondary' : 'outline'}
                className="flex-1"
                onClick={addToCart}
                disabled={inCart}
              >
                {inCart ? (
                  <>
                    <Check className="size-4" strokeWidth={1.5} />
                    Added
                  </>
                ) : (
                  <>
                    <ShoppingBag className="size-4" strokeWidth={1.5} />
                    Add to Cart
                  </>
                )}
              </Button>
              <Button variant="outline" className="flex-1" onClick={createAnother}>
                <Plus className="size-4" strokeWidth={1.5} />
                Create Another
              </Button>
            </div>
            <Button className="w-full" size="lg" onClick={checkout}>
              Checkout
              <ArrowRight className="size-5" strokeWidth={1.5} />
            </Button>
            <Button variant="ghost" className="w-full" onClick={retake}>
              <RotateCcw className="size-4" strokeWidth={1.5} />
              Start Over With A New Photo
            </Button>
          </div>
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
                {/* Stage checklist — stays visible the whole render, ticking off
                    each step as the progress bar passes its threshold. */}
                <ul className="flex flex-col gap-2.5">
                  {STAGES.map((stage) => {
                    const stageDone = progress >= stage.until
                    const active = !stageDone && stageLabel(progress) === stage.label
                    return (
                      <li key={stage.label} className="flex items-center gap-3">
                        <span
                          className={cn(
                            'grid size-5 shrink-0 place-items-center border',
                            stageDone
                              ? 'border-success bg-success'
                              : active
                                ? 'border-accent'
                                : 'border-line',
                          )}
                        >
                          {stageDone ? (
                            <Check className="size-3 text-cream" strokeWidth={3} />
                          ) : active ? (
                            <motion.span
                              className="size-2 bg-accent"
                              animate={{ opacity: [1, 0.3, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                          ) : null}
                        </span>
                        <span
                          className={cn(
                            'label',
                            stageDone || active ? 'text-cream' : 'text-mute',
                          )}
                        >
                          {stage.label}
                        </span>
                      </li>
                    )
                  })}
                </ul>

                <div className="mt-6 flex items-end justify-between">
                  <span className="label text-mute">Rendering</span>
                  <span className="t-card tabular-nums text-cream">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress className="mt-3" value={progress} indicatorClassName="bg-cream" />
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
              {isStandard && (
                <OfferSelector
                  offer={offer}
                  onOffer={setOffer}
                  size={size}
                  onSize={setSize}
                  qty={qty}
                  onQty={setQty}
                  club={proClub}
                  disabled={inCart}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <UpsellDialog
        open={showUpsell}
        saving={packSaving(proClub)}
        onClose={() => resolveUpsell(false)}
        onAccept={() => resolveUpsell(true)}
      />
    </StepScreen>
  )
}
