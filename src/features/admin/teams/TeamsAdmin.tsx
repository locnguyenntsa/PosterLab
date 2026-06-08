import { useMemo, useState } from 'react'
import { Users, MapPin, Pencil, Copy, Trash2 } from 'lucide-react'
import type { Club } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { DataTable } from '@/components/ui/data-table'
import type { Column } from '@/components/ui/data-table'
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/features/admin/PageHeader'
import { SPORTS, getSport } from '@/data/sports'
import { useAdminStore } from '@/store/useAdminStore'
import { useCatalogStore, useTeams } from '@/store/useCatalogStore'
import { useToastStore } from '@/store/useToastStore'

export function TeamsAdmin() {
  const teams = useTeams()
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
      key: 'colors',
      header: '',
      className: 'w-16',
      cell: (c) => (
        <div className="flex gap-1">
          <span className="size-5 border border-line" style={{ background: c.colors.primary }} />
          <span className="size-5 border border-line" style={{ background: c.colors.secondary }} />
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
      cell: (c) => (
        <span className="flex items-center gap-1 t-body">
          <MapPin className="size-3.5 text-mute" strokeWidth={1.5} />
          {c.city}
        </span>
      ),
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
          <Badge variant="outline">
            <span>{sport?.emoji}</span>
            {sport?.name ?? c.sportId}
          </Badge>
        )
      },
    },
    {
      key: 'posters',
      header: 'Posters',
      align: 'center',
      sortAccessor: (c) => c.posters?.length ?? 0,
      cell: (c) => <span className="label text-mute">{c.posters?.length ?? 0}</span>,
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
        <Input
          placeholder="Search teams…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-44"
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
                <Button size="sm" onClick={() => openTeam('new')}>New team</Button>
              ) : undefined
            }
          />
        }
      />
    </div>
  )
}
