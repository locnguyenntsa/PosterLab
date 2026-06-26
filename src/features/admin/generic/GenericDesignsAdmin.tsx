import { useMemo, useState } from 'react'
import { Palette, Pencil, Trash2 } from 'lucide-react'
import type { GenericDesign } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/data-table'
import type { Column } from '@/components/ui/data-table'
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/features/admin/PageHeader'
import { useAdminStore } from '@/store/useAdminStore'
import { useGenericDesigns } from '@/store/useCatalogStore'

/*
  Generic designs back-office: the small gallery of logo-less colour variants
  offered to customers who can't find their club (see the "club not found" flow).
  Mirrors the Teams/Designs table pattern.
*/
export function GenericDesignsAdmin() {
  const designs = useGenericDesigns()
  const openGeneric = useAdminStore((s) => s.openGeneric)
  const askDelete = useAdminStore((s) => s.askDelete)

  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return designs
    return designs.filter((d) => d.name.toLowerCase().includes(q))
  }, [designs, query])

  const columns: Column<GenericDesign>[] = [
    {
      key: 'color',
      header: '',
      className: 'w-12',
      cell: (d) => <span className="size-6 border border-line" style={{ background: d.color }} />,
    },
    {
      key: 'name',
      header: 'Name',
      sortAccessor: (d) => d.name,
      cell: (d) => <span className="font-display text-xl leading-none text-cream">{d.name}</span>,
    },
    {
      key: 'colorHex',
      header: 'Colour',
      sortAccessor: (d) => d.color,
      cell: (d) => <span className="t-body tabular-nums uppercase">{d.color}</span>,
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
      key: 'actions',
      header: '',
      align: 'right',
      className: 'w-12',
      cell: (d) => (
        <DropdownMenu
          items={[
            { label: 'Edit', icon: Pencil, onClick: () => openGeneric(d.id) },
            {
              label: 'Delete',
              icon: Trash2,
              destructive: true,
              onClick: () => askDelete('generic', d.id, d.name),
            },
          ]}
        />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Generic Designs"
        count={designs.length}
        actionLabel="New generic design"
        onAction={() => openGeneric('new')}
      >
        <Input
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-44"
        />
      </PageHeader>

      <DataTable
        rows={filtered}
        columns={columns}
        getRowId={(d) => d.id}
        onRowClick={(d) => openGeneric(d.id)}
        empty={
          <EmptyState
            icon={Palette}
            title={designs.length === 0 ? 'No generic designs yet' : 'No matches'}
            message={
              designs.length === 0
                ? 'Add a colour variant shown to customers who can’t find their club.'
                : 'Try a different search.'
            }
            action={
              designs.length === 0 ? (
                <Button size="sm" onClick={() => openGeneric('new')}>
                  New generic design
                </Button>
              ) : undefined
            }
          />
        }
      />
    </div>
  )
}
