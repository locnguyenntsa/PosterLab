import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useAdminStore } from '@/store/useAdminStore'
import { useCatalogStore } from '@/store/useCatalogStore'
import { useAdminsStore } from '@/store/useAdminsStore'
import { useToastStore } from '@/store/useToastStore'

/* Shared delete confirmation for designs, teams, and admin accounts. */
export function AdminDeleteConfirm() {
  const target = useAdminStore((s) => s.confirmDelete)
  const cancel = useAdminStore((s) => s.cancelDelete)
  const deleteDesign = useCatalogStore((s) => s.deleteDesign)
  const deleteTeam = useCatalogStore((s) => s.deleteTeam)
  const deleteAdmin = useAdminsStore((s) => s.deleteAdmin)
  const push = useToastStore((s) => s.push)

  const onConfirm = () => {
    if (!target) return
    if (target.kind === 'design') {
      deleteDesign(target.id)
      push('Design deleted', 'danger')
    } else if (target.kind === 'team') {
      deleteTeam(target.id)
      push('Team deleted', 'danger')
    } else {
      deleteAdmin(target.id)
      push('Admin deleted', 'danger')
    }
    cancel()
  }

  const title =
    target?.kind === 'admin'
      ? 'Delete admin?'
      : target?.kind === 'team'
        ? 'Delete team?'
        : 'Delete design?'

  return (
    <ConfirmDialog
      open={target !== null}
      onClose={cancel}
      onConfirm={onConfirm}
      title={title}
      message={
        target
          ? target.kind === 'admin'
            ? `${target.name} will be removed from the admin list. This can't be undone.`
            : `${target.name} will be removed from the catalogue and the tunnel. This can't be undone.`
          : ''
      }
    />
  )
}
