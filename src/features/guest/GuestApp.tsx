import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ComponentType } from 'react'
import { Header } from '@/components/Header'
import { PatternBG } from '@/components/PatternBG'
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
  const Screen = SCREENS[step]

  // Hard-cut the app background to the selected club's deep color tint — EXCEPT
  // on the final confirmation (step 6). That success screen drops the club tint
  // back to the neutral default-dark brand, so a warm club color (red/orange)
  // never makes the "Order Confirmed" page read like an error.
  useEffect(() => {
    applyTeamTheme(step === 6 ? null : (findTeam(clubId) ?? null))
  }, [clubId, step])

  // Every step change starts at the top of the new screen.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [step])

  return (
    <div className="relative flex min-h-svh flex-col">
      <PatternBG />
      <div className="relative z-10 flex min-h-svh flex-col">
        <Header step={step} />
        <main className="flex flex-1 flex-col">
          {/* Milestone bar — rendered here, OUTSIDE the animated content, so it
              stays static while only the step content transitions. Matches the
              step content width (max-w-3xl) so it aligns with the headline. */}
          {step >= 1 && step <= 5 && (
            <div className="mx-auto w-full max-w-3xl px-5 pt-10 sm:px-10">
              <StepIndicator step={step} />
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              className="flex flex-1 flex-col"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              <Screen />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
