import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useAdminStore } from '@/store/useAdminStore'
import { useCatalogStore } from '@/store/useCatalogStore'
import { useToastStore } from '@/store/useToastStore'

/* Shared delete confirmation for both designs and teams. */
export function AdminDeleteConfirm() {
  const target = useAdminStore((s) => s.confirmDelete)
  const cancel = useAdminStore((s) => s.cancelDelete)
  const deleteDesign = useCatalogStore((s) => s.deleteDesign)
  const deleteTeam = useCatalogStore((s) => s.deleteTeam)
  const push = useToastStore((s) => s.push)

  const onConfirm = () => {
    if (!target) return
    if (target.kind === 'design') {
      deleteDesign(target.id)
      push('Design deleted', 'danger')
    } else {
      deleteTeam(target.id)
      push('Team deleted', 'danger')
    }
    cancel()
  }

  return (
    <ConfirmDialog
      open={target !== null}
      onClose={cancel}
      onConfirm={onConfirm}
      title={target?.kind === 'team' ? 'Delete team?' : 'Delete design?'}
      message={
        target
          ? `${target.name} will be removed from the catalogue and the tunnel. This can't be undone.`
          : ''
      }
    />
  )
}
