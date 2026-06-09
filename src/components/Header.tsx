import { ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { RoleToggle } from '@/components/RoleToggle'
import { useFlowStore } from '@/store/useFlowStore'
import { useScrollEdges } from '@/lib/useScrollEdges'
import { cn } from '@/lib/utils'
import type { StepId } from '@/types'

/* Flat top bar: back button (left), centered logo, trust label (right). */
export function Header({ step }: { step: StepId }) {
  const back = useFlowStore((s) => s.back)
  const goTo = useFlowStore((s) => s.goTo)
  const showBack = step >= 1 && step <= 5
  const { atTop } = useScrollEdges()

  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b border-line bg-primary transition-shadow duration-200',
        !atTop && 'shadow-[0_10px_30px_-4px_rgba(0,0,0,0.7)]',
      )}
    >
      {/* Logo pinned left, role toggle pinned right (back tucks in on inner steps). */}
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-5 sm:px-10">
        {/* Left — back (inner steps) + logo (click = home) */}
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
          <button
            type="button"
            onClick={() => goTo(0)}
            aria-label="Onepact home"
            className="shrink-0 cursor-pointer rounded-sm transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            <Logo />
          </button>
        </div>

        {/* Right — demo-only Guest/Admin mode toggle */}
        <div className="flex shrink-0 justify-end">
          <RoleToggle />
        </div>
      </div>
    </header>
  )
}
