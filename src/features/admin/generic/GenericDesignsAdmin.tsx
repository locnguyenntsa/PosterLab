import { useMemo, useState } from 'react'
import { Palette, Plus, Pencil, Trash2 } from 'lucide-react'
import type { GenericDesign } from '@/types'
import { GenericPosterArt } from '@/components/GenericPosterArt'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
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
      key: 'preview',
      header: '',
      className: 'w-16',
      // A real thumbnail of the design — the recolored SAISON poster (or an
      // uploaded artwork override) — instead of a bare colour swatch.
      cell: (d) =>
        d.thumbnailUrl ? (
          <img
            src={d.thumbnailUrl}
            alt=""
            className="aspect-[3/4] w-10 border border-line object-cover"
          />
        ) : (
          <GenericPosterArt color={d.color} className="w-10 border border-line" />
        ),
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
        <SearchInput
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
                <Button onClick={() => openGeneric('new')}>
                  <Plus className="size-5" strokeWidth={2} />
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
