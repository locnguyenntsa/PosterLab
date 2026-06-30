import { LayoutGrid, Plus, Minus, Pencil, Copy, Trash2 } from 'lucide-react'
import { CheckBadge } from '@/components/ui/check-badge'
import type { PosterTemplate } from '@/types'
import { PosterArt } from '@/components/PosterArt'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import type { Column } from '@/components/ui/data-table'
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/features/admin/PageHeader'
import { relativeTime } from '@/features/admin/format'
import { useAdminStore } from '@/store/useAdminStore'
import { useCatalogStore, useDesigns, useTeams } from '@/store/useCatalogStore'
import { useToastStore } from '@/store/useToastStore'

export function DesignsAdmin() {
  const designs = useDesigns()
  const teams = useTeams()
  const sampleClub = teams[0]
  const openDesign = useAdminStore((s) => s.openDesign)
  const askDelete = useAdminStore((s) => s.askDelete)
  const duplicateDesign = useCatalogStore((s) => s.duplicateDesign)
  const push = useToastStore((s) => s.push)

  const columns: Column<PosterTemplate>[] = [
    {
      key: 'thumb',
      header: '',
      className: 'w-14',
      cell: (d) =>
        sampleClub ? (
          <PosterArt template={d} club={sampleClub} image={d.thumbnailUrl} className="w-10" />
        ) : (
          <div className="aspect-[3/4] w-10 bg-ink/40" />
        ),
    },
    {
      key: 'name',
      header: 'Name',
      sortAccessor: (d) => d.name,
      cell: (d) => <span className="font-display text-xl leading-none text-cream">{d.name}</span>,
    },
    {
      key: 'style',
      header: 'Style',
      sortAccessor: (d) => d.style,
      cell: (d) => <Badge variant="outline">{d.style}</Badge>,
    },
    {
      key: 'status',
      header: 'Status',
      sortAccessor: (d) => d.status ?? 'live',
      cell: (d) =>
        d.status === 'draft' ? (
          <Badge variant="outline">Draft</Badge>
        ) : (
          <Badge variant="success">Live</Badge>
        ),
    },
    {
      key: 'universal',
      header: 'Universal',
      align: 'center',
      sortAccessor: (d) => d.universal,
      cell: (d) =>
        d.universal ? (
          <CheckBadge className="mx-auto" />
        ) : (
          <span className="mx-auto grid size-6 place-items-center rounded-full border border-line text-mute">
            <Minus className="size-3.5" strokeWidth={2.5} />
          </span>
        ),
    },
    {
      key: 'version',
      header: 'Version',
      sortAccessor: (d) => d.version ?? 1,
      cell: (d) => <Badge variant="ink">v{d.version ?? 1}</Badge>,
    },
    {
      key: 'updated',
      header: 'Updated',
      sortAccessor: (d) => d.updatedAt ?? '',
      cell: (d) => <span className="label text-mute">{relativeTime(d.updatedAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      className: 'w-12',
      cell: (d) => (
        <DropdownMenu
          items={[
            { label: 'Edit', icon: Pencil, onClick: () => openDesign(d.id) },
            {
              label: 'Duplicate',
              icon: Copy,
              onClick: () => {
                duplicateDesign(d.id)
                push('Design duplicated')
              },
            },
            {
              label: 'Delete',
              icon: Trash2,
              destructive: true,
              onClick: () => askDelete('design', d.id, d.name),
            },
          ]}
        />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Designs"
        count={designs.length}
        actionLabel="New design"
        onAction={() => openDesign('new')}
      />
      <DataTable
        rows={designs}
        columns={columns}
        getRowId={(d) => d.id}
        onRowClick={(d) => openDesign(d.id)}
        empty={
          <EmptyState
            icon={LayoutGrid}
            title="No designs yet"
            message="Create your first poster design — it'll appear for guests in the tunnel."
            action={
              <Button onClick={() => openDesign('new')}>
                <Plus className="size-5" strokeWidth={2} />
                New design
              </Button>
            }
          />
        }
      />
    </div>
  )
}
