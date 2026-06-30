import { ShieldCheck, Plus, Mail, Pencil, Trash2 } from 'lucide-react'
import type { AdminAccount } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import type { Column } from '@/components/ui/data-table'
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/features/admin/PageHeader'
import { relativeTime } from '@/features/admin/format'
import { roleLabel } from '@/features/admin/schemas'
import { useAdminStore } from '@/store/useAdminStore'
import { useAdmins } from '@/store/useAdminsStore'

/*
  Admin accounts list — a management page mirroring TeamsAdmin. Email + name +
  created, with Edit / Delete row actions. Passwords are never shown in the list
  (set/reset only inside the form). This list does NOT gate login (demo gate
  accepts any input) — it's a manageable record of admin accounts.
*/
export function AdminsAdmin() {
  const admins = useAdmins()
  const openAdmin = useAdminStore((s) => s.openAdmin)
  const askDelete = useAdminStore((s) => s.askDelete)

  const columns: Column<AdminAccount>[] = [
    {
      key: 'email',
      header: 'Email',
      sortAccessor: (a) => a.email,
      cell: (a) => (
        <span className="flex items-center gap-2 t-body text-cream">
          <Mail className="size-4 shrink-0 text-mute" strokeWidth={1.5} />
          {a.email}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      sortAccessor: (a) => a.name ?? '',
      cell: (a) =>
        a.name ? <span className="t-body">{a.name}</span> : <span className="text-mute">—</span>,
    },
    {
      key: 'role',
      header: 'Role',
      sortAccessor: (a) => roleLabel(a.role),
      cell: (a) => <Badge variant="outline">{roleLabel(a.role)}</Badge>,
    },
    {
      key: 'created',
      header: 'Created',
      sortAccessor: (a) => a.createdAt,
      cell: (a) => <span className="t-body">{relativeTime(a.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      className: 'w-12',
      cell: (a) => (
        <DropdownMenu
          items={[
            { label: 'Edit', icon: Pencil, onClick: () => openAdmin(a.id) },
            {
              label: 'Delete',
              icon: Trash2,
              destructive: true,
              onClick: () => askDelete('admin', a.id, a.email),
            },
          ]}
        />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Admins"
        count={admins.length}
        actionLabel="New admin"
        onAction={() => openAdmin('new')}
      />

      <DataTable
        rows={admins}
        columns={columns}
        getRowId={(a) => a.id}
        onRowClick={(a) => openAdmin(a.id)}
        empty={
          <EmptyState
            icon={ShieldCheck}
            title="No admins yet"
            message="Add an admin account to manage this list."
            action={
              <Button onClick={() => openAdmin('new')}>
                <Plus className="size-5" strokeWidth={2} />
                New admin
              </Button>
            }
          />
        }
      />
    </div>
  )
}
