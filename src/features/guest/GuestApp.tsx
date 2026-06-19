import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ComponentType } from 'react'
import { Header } from '@/components/Header'
import { PatternBG } from '@/components/PatternBG'
import { ShopBackdrop } from '@/components/ShopBackdrop'
import { StepIndicator } from '@/components/StepIndicator'
import { useFlowStore } from '@/store/useFlowStore'
import { findTeam } from '@/store/useCatalogStore'
import { applyTeamTheme } from '@/lib/teamTheme'
import { WelcomeScreen } from '@/features/welcome/WelcomeScreen'
import { DesignSelection } from '@/features/design/DesignSelection'
import { PhotoUpload } from '@/features/upload/PhotoUpload'
import { PosterGeneration } from '@/features/generate/PosterGeneration'
import { CheckoutForm } from '@/features/checkout/CheckoutForm'
import { OrderConfirmation } from '@/features/checkout/OrderConfirmation'
import { OrderConfirmed } from '@/features/checkout/OrderConfirmed'
import { JoinRegistration } from '@/features/join/JoinRegistration'
import { JoinSetup } from '@/features/join/JoinSetup'
import type { StepId } from '@/types'

const SCREENS: Record<StepId, ComponentType> = {
  0: WelcomeScreen,
  1: DesignSelection,
  2: PhotoUpload,
  3: PosterGeneration,
  4: CheckoutForm,
  5: OrderConfirmation,
  6: OrderConfirmed,
}

/* The guest customer tunnel — the original app shell, unchanged in behavior. */
export function GuestApp() {
  const step = useFlowStore((s) => s.step)
  const clubId = useFlowStore((s) => s.clubId)
  const designSub = useFlowStore((s) => s.designSub)
  const shopClubId = useFlowStore((s) => s.shopClubId)
  const joinPhase = useFlowStore((s) => s.joinPhase)
  const Screen = SCREENS[step]

  // Hard-cut the app background to the selected club's deep color tint. In a Pro
  // Shop the club is fixed, so the WHOLE flow is themed (landing included). In the
  // normal funnel the tint only locks in once a club is chosen: within the Design
  // step (1) that's the 'template' sub-step onward; stepping BACK to sport/place/
  // club shows the neutral theme. Either way the final confirmation (step 6) drops
  // back to neutral so a warm club color never makes it read like an error.
  useEffect(() => {
    // The join prelude (registration + design chooser) is always neutral — there's
    // no club color yet. Once it hands off, the generic house club's neutral colors
    // keep the builder un-themed too.
    if (joinPhase) {
      applyTeamTheme(null)
      return
    }
    const club = shopClubId
      ? findTeam(shopClubId)
      : (step === 1 ? designSub === 'template' : step >= 2 && step !== 6)
        ? findTeam(clubId)
        : undefined
    applyTeamTheme(step === 6 ? null : (club ?? null))
  }, [clubId, step, designSub, shopClubId, joinPhase])

  // Every step change starts at the top of the new screen.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [step])

  return (
    <div className="relative flex min-h-svh flex-col">
      {/* Pro Shop: club photo UNDER the pattern (rendered first → lower in the
          same z-0 layer), themed steps only — drops on the confirmation (6). */}
      {shopClubId && step !== 6 && <ShopBackdrop clubId={shopClubId} vivid={step === 0} />}
      <PatternBG />
      <div className="relative z-10 flex min-h-svh flex-col">
        <Header step={step} />
        <main className="flex flex-1 flex-col">
          {/* Milestone bar — rendered here, OUTSIDE the animated content, so it
              stays static while only the step content transitions. Matches the
              step content width (max-w-3xl) so it aligns with the headline. The
              join prelude isn't a numbered builder step, so it's hidden there. */}
          {!joinPhase && step >= 1 && step <= 5 && (
            <div className="mx-auto w-full max-w-3xl px-5 pt-10 sm:px-10">
              <StepIndicator step={step} />
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={joinPhase ?? `step-${step}`}
              className="flex flex-1 flex-col"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              {joinPhase === 'form' ? (
                <JoinRegistration />
              ) : joinPhase === 'design' ? (
                <JoinSetup />
              ) : (
                <Screen />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
