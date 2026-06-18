import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckBadge } from '@/components/ui/check-badge'

/*
  Shown after a non-partner club submits the registration form. The journey ends
  here: the team follows up about partnership + setup steps (no self-serve design
  on the spot). Built on the shared Dialog primitive, mirroring UpsellDialog's
  centered layout. Esc / backdrop / "Back to Home" all call onClose, which returns
  the visitor to the homepage (see JoinRegistration → exitJoin).
*/
export function JoinConfirmation({
  open,
  clubName,
  onClose,
}: {
  open: boolean
  clubName?: string
  onClose: () => void
}) {
  const name = clubName?.trim()

  return (
    <Dialog open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center">
        <CheckBadge className="size-14 [&_svg]:size-7" />

        <h2 className="mt-4 t-card">Request Received</h2>
        <p className="mt-2 max-w-xs t-body">
          Thanks{name ? `, ${name}` : ''} — we’ve got your details. Our team will
          reach out about partnership and the setup steps.
        </p>

        <Button size="lg" className="mt-6 w-full" onClick={onClose}>
          Back to Home
        </Button>
      </div>
    </Dialog>
  )
}
