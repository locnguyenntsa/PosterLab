import { ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { CartMenu } from '@/components/CartMenu'
import { Button } from '@/components/ui/button'
import { useFlowStore } from '@/store/useFlowStore'
import { useTeams } from '@/store/useCatalogStore'
import { shopConfigFor } from '@/data/shopConfig'
import { useScrollEdges } from '@/lib/useScrollEdges'
import { cn } from '@/lib/utils'
import type { StepId } from '@/types'

/* Flat top bar: back button + logo (left); cart, plus the Pro Shop club
   lockup when in a storefront (right). */
export function Header({ step }: { step: StepId }) {
  const back = useFlowStore((s) => s.back)
  const goTo = useFlowStore((s) => s.goTo)
  const shopClubId = useFlowStore((s) => s.shopClubId)
  const joinPhase = useFlowStore((s) => s.joinPhase)
  const exitJoin = useFlowStore((s) => s.exitJoin)
  const teams = useTeams()
  // Back is available through the builder steps and across the join prelude
  // (where back() steps design → form → out to the home).
  const showBack = !!joinPhase || (step >= 1 && step <= 5)
  const { atTop } = useScrollEdges()

  // Pro Shop: club lockup (crest + name) sits on the right, next to the cart, so
  // the storefront identity stays present through every step.
  const shopClub = shopClubId ? teams.find((c) => c.id === shopClubId) : null
  const shopCfg = shopClub ? shopConfigFor(shopClub.id) : null
  const shopAccent = shopCfg?.accent ?? shopClub?.colors.primary
  // Transparent, chrome-less header only on the Pro Shop landing (step 0).
  const shopHome = !!shopClubId && step === 0

  return (
    <header
      className={cn(
        'sticky top-0 z-30 transition-shadow duration-200',
        // On the Pro Shop landing (step 0) the header floats transparently over
        // the immersive backdrop — no fill, hairline or scroll shadow. Every
        // other screen (incl. the inner shop steps) keeps the solid brand bar.
        shopHome
          ? 'bg-transparent'
          : 'border-b border-line bg-primary',
        !atTop && !shopHome && 'shadow-[0_10px_30px_-4px_rgba(0,0,0,0.7)]',
      )}
    >
      {/* Back (inner steps) tucks in left of the logo. */}
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-5 sm:px-10">
        <div className="flex min-w-0 items-center gap-2">
          {showBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={back}
              aria-label="Go back"
              className="shrink-0"
            >
              <ArrowLeft className="size-4" strokeWidth={1.5} />
              <span className="hidden sm:inline">Back</span>
            </Button>
          )}
          {/* Pro Shop: the PosterLab (PL) logo is hidden — a storefront carries
              only the club's identity (shown right). Elsewhere it's the home tap. */}
          {!shopClubId && (
            <button
              type="button"
              onClick={() => (joinPhase ? exitJoin() : goTo(0))}
              aria-label="Poster Lab home"
              className="shrink-0 cursor-pointer rounded-sm transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              <Logo />
            </button>
          )}
        </div>

        {/* Right cluster: Pro Shop club lockup + cart. Hidden on the
            post-purchase screen (step 6), which drops back to neutral brand. */}
        {step !== 6 && (
          <div className="ml-auto flex items-center gap-3 sm:gap-4">
            {shopClub && step >= 1 && (
              <>
                <div className="flex items-center gap-2">
                  {shopCfg?.logo && (
                    <img
                      src={shopCfg.logo}
                      alt=""
                      className="size-7 shrink-0 object-contain sm:size-8"
                    />
                  )}
                  <span
                    className="hidden font-display text-lg uppercase leading-none sm:block sm:text-xl"
                    style={{ color: shopAccent }}
                  >
                    {shopClub.name}
                  </span>
                </div>
                <span aria-hidden className="h-6 w-px bg-line" />
              </>
            )}
            <CartMenu />
          </div>
        )}
      </div>
    </header>
  )
}
