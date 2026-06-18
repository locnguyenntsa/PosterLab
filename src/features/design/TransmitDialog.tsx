import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/ui/copy-button'

/*
  "Transmit to your staff" — the referral path of the club-not-found edge case.
  A ready-made message the user copies and forwards to their club's president /
  staff so the club gets listed. Built on the shared Dialog; CopyButton handles
  the clipboard + success toast.
*/
const MESSAGE = `Hello,

I'm reaching out regarding an opportunity for the club: Posterlab.fr offers personalized posters to members and can pay a commission to the club on each sale. No expense or organization required on our side: we just need to let our members know the offer exists. Since our club isn't listed on their site yet, I'm passing the info on to you directly.

Feel free to check out the site to see how it works: https://posterlab.fr
You can also contact them directly: posterlab.fr@gmail.com`

export function TransmitDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Help Your Club Join"
      size="md"
      footer={
        <Button variant="outline" onClick={onClose}>
          Done
        </Button>
      }
    >
      <div className="space-y-4">
        <p className="t-body">
          Copy this message and send it to your club’s president or staff — once
          they’re on board, your club gets listed.
        </p>

        <div className="relative border border-line bg-ink p-4">
          <CopyButton value={MESSAGE} label="Copy message" className="absolute right-2 top-2" />
          <p className="whitespace-pre-line pr-12 t-body text-cream">{MESSAGE}</p>
        </div>

        <div className="flex flex-col gap-3 border-t border-line pt-5">
          <div className="flex items-center justify-between gap-3">
            <span className="min-w-0 label-wide text-mute">
              Site ·{' '}
              <a
                href="https://posterlab.fr"
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                posterlab.fr
              </a>
            </span>
            <CopyButton value="https://posterlab.fr" label="Copy site" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="min-w-0 label-wide text-mute">
              Contact ·{' '}
              <a href="mailto:posterlab.fr@gmail.com" className="text-accent hover:underline">
                posterlab.fr@gmail.com
              </a>
            </span>
            <CopyButton value="posterlab.fr@gmail.com" label="Copy email" />
          </div>
        </div>
      </div>
    </Dialog>
  )
}
