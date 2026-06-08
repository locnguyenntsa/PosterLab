import { AlertTriangle } from 'lucide-react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

/* Destructive confirmation built on Dialog. Cancel autofocuses (safe default). */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Delete',
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
}) {
  return (
    <Dialog open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center gap-4 text-center">
        <AlertTriangle className="size-9 text-danger" strokeWidth={1.5} />
        <h2 className="t-card">{title}</h2>
        <p className="t-body">{message}</p>
        <div className="mt-2 flex w-full gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
