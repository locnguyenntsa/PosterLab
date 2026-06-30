import { useMemo, useState } from 'react'
import { Users, Plus, Pencil, Copy, Trash2, Link2, ImageOff } from 'lucide-react'
import type { Club } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { Select } from '@/components/ui/select'
import { DataTable } from '@/components/ui/data-table'
import type { Column } from '@/components/ui/data-table'
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/features/admin/PageHeader'
import { SPORTS, getSport } from '@/data/sports'
import { useAdminStore } from '@/store/useAdminStore'
import { useCatalogStore, useTeams, useDesigns, clubDesign } from '@/store/useCatalogStore'
import { useToastStore } from '@/store/useToastStore'

export function TeamsAdmin() {
  const teams = useTeams()
  const designs = useDesigns()
  const openTeam = useAdminStore((s) => s.openTeam)
  const askDelete = useAdminStore((s) => s.askDelete)
  const duplicateTeam = useCatalogStore((s) => s.duplicateTeam)
  const push = useToastStore((s) => s.push)

  const [query, setQuery] = useState('')
  const [sportFilter, setSportFilter] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return teams.filter((c) => {
      if (sportFilter && c.sportId !== sportFilter) return false
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.shortCode.toLowerCase().includes(q)
      )
    })
  }, [teams, query, sportFilter])

  const columns: Column<Club>[] = [
    {
      key: 'logo',
      header: '',
      className: 'w-16',
      cell: (c) =>
        c.logoUrl ? (
          // Transparent crest, no backdrop.
          <img src={c.logoUrl} alt="" className="size-10 shrink-0 object-contain" />
        ) : (
          // No crest uploaded yet — a muted, dashed placeholder icon.
          <div className="grid size-10 shrink-0 place-items-center border border-dashed border-line text-mute">
            <ImageOff className="size-5" strokeWidth={1.5} />
          </div>
        ),
    },
    {
      key: 'name',
      header: 'Name',
      sortAccessor: (c) => c.name,
      cell: (c) => <span className="font-display text-xl leading-none text-cream">{c.name}</span>,
    },
    {
      key: 'city',
      header: 'City',
      sortAccessor: (c) => c.city,
      cell: (c) => <span className="t-body">{c.city}</span>,
    },
    {
      key: 'code',
      header: 'Code',
      sortAccessor: (c) => c.shortCode,
      cell: (c) => <Badge variant="ink">{c.shortCode}</Badge>,
    },
    {
      key: 'sport',
      header: 'Sport',
      sortAccessor: (c) => getSport(c.sportId)?.name ?? c.sportId,
      cell: (c) => {
        const sport = getSport(c.sportId)
        return (
          <span className="flex items-center gap-1.5 label text-cream">
            <span>{sport?.emoji}</span>
            {sport?.name ?? c.sportId}
          </span>
        )
      },
    },
    {
      key: 'design',
      header: 'Design',
      sortAccessor: (c) => (c.partner === false ? 'Coming Soon' : clubDesign(c, designs)?.name ?? ''),
      cell: (c) =>
        c.partner === false ? (
          <Badge variant="warning">Coming Soon</Badge>
        ) : (
          <span className="t-body">{clubDesign(c, designs)?.name ?? '—'}</span>
        ),
    },
    {
      key: 'posters',
      header: 'Posters',
      align: 'center',
      sortAccessor: (c) => c.posters?.length ?? 0,
      cell: (c) => <span className="font-bold tabular-nums text-cream">{c.posters?.length ?? 0}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      className: 'w-12',
      cell: (c) => (
        <DropdownMenu
          items={[
            { label: 'Edit', icon: Pencil, onClick: () => openTeam(c.id) },
            {
              label: 'Duplicate',
              icon: Copy,
              onClick: () => {
                duplicateTeam(c.id)
                push('Team duplicated')
              },
            },
            {
              label: 'Copy shop link',
              icon: Link2,
              onClick: () => {
                void navigator.clipboard?.writeText(`${window.location.origin}/shop/${c.id}`)
                push('Pro Shop link copied')
              },
            },
            {
              label: 'Delete',
              icon: Trash2,
              destructive: true,
              onClick: () => askDelete('team', c.id, c.name),
            },
          ]}
        />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Teams"
        count={teams.length}
        actionLabel="New team"
        onAction={() => openTeam('new')}
      >
        <SearchInput
          placeholder="Search teams…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select
          aria-label="Filter by sport"
          value={sportFilter}
          onChange={setSportFilter}
          className="w-44"
          options={[
            { value: '', label: 'All sports' },
            ...SPORTS.map((s) => ({ value: s.id, label: s.name })),
          ]}
        />
      </PageHeader>

      <DataTable
        rows={filtered}
        columns={columns}
        getRowId={(c) => c.id}
        onRowClick={(c) => openTeam(c.id)}
        empty={
          <EmptyState
            icon={Users}
            title={teams.length === 0 ? 'No teams yet' : 'No matches'}
            message={
              teams.length === 0
                ? 'Add your first team — its colors theme the poster previews.'
                : 'Try a different search or sport filter.'
            }
            action={
              teams.length === 0 ? (
                <Button onClick={() => openTeam('new')}>
                  <Plus className="size-5" strokeWidth={2} />
                  New team
                </Button>
              ) : undefined
            }
          />
        }
      />
    </div>
  )
}
