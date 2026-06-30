import { useMemo, useState } from 'react'
import { CalendarDays, Plus, Pencil, Trash2, ExternalLink, Link2 } from 'lucide-react'
import type { Event } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { DataTable } from '@/components/ui/data-table'
import type { Column } from '@/components/ui/data-table'
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/features/admin/PageHeader'
import { useAdminStore } from '@/store/useAdminStore'
import { useEvents, useTeams } from '@/store/useCatalogStore'
import { useToastStore } from '@/store/useToastStore'

/* Pro Admin: campaign windows (fixtures) that turn a partner club's storefront
   into an event page while active. Mirrors the Teams table — "add an event"
   with a start + end date. */
function fmtDate(d: string): string {
  if (!d) return '—'
  const date = new Date(d)
  return Number.isNaN(date.getTime())
    ? d
    : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function EventsAdmin() {
  const events = useEvents()
  const teams = useTeams()
  const openEvent = useAdminStore((s) => s.openEvent)
  const askDelete = useAdminStore((s) => s.askDelete)
  const push = useToastStore((s) => s.push)

  const clubName = (id: string) => teams.find((c) => c.id === id)?.name ?? id
  // The event lives on its club's Pro Shop landing. `?event=<id>` force-previews
  // it (any date / draft); the plain link is the public storefront.
  const shopUrl = (clubId: string) => `${window.location.origin}/shop/${clubId}`

  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return events
    return events.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.opponentName.toLowerCase().includes(q) ||
        clubName(e.clubId).toLowerCase().includes(q),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, query, teams])

  const columns: Column<Event>[] = [
    {
      key: 'name',
      header: 'Event',
      sortAccessor: (e) => e.name,
      cell: (e) => <span className="font-display text-xl leading-none text-cream">{e.name}</span>,
    },
    {
      key: 'club',
      header: 'Club',
      sortAccessor: (e) => clubName(e.clubId),
      cell: (e) => <span className="t-body">{clubName(e.clubId)}</span>,
    },
    {
      key: 'matchup',
      header: 'Match-up',
      sortAccessor: (e) => e.opponentName,
      cell: (e) => (
        <span className="t-body">
          vs {e.opponentName} <span className="text-mute">· {e.competition}</span>
        </span>
      ),
    },
    {
      key: 'window',
      header: 'Window',
      sortAccessor: (e) => e.startDate,
      cell: (e) => (
        <span className="t-body tabular-nums">
          {fmtDate(e.startDate)} → {fmtDate(e.endDate)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortAccessor: (e) => e.status ?? 'live',
      cell: (e) =>
        e.status === 'draft' ? (
          <Badge variant="outline">Draft</Badge>
        ) : (
          <Badge variant="success">Live</Badge>
        ),
    },
    {
      key: 'preview',
      header: 'Preview',
      align: 'center',
      // `?event=<id>` force-shows the event (any date / draft) so the back-office
      // can preview the match-day landing it just built. Opens in a new tab.
      cell: (e) => (
        <a
          href={`${shopUrl(e.clubId)}?event=${e.id}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(ev) => ev.stopPropagation()}
          className="inline-flex items-center gap-1.5 label text-accent transition-[filter] duration-100 hover:brightness-110"
        >
          Preview
          <ExternalLink className="size-3.5" strokeWidth={2} />
        </a>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      className: 'w-12',
      cell: (e) => (
        <DropdownMenu
          items={[
            { label: 'Edit', icon: Pencil, onClick: () => openEvent(e.id) },
            {
              label: 'Copy shop link',
              icon: Link2,
              onClick: () => {
                void navigator.clipboard?.writeText(shopUrl(e.clubId))
                push('Pro Shop link copied')
              },
            },
            {
              label: 'Delete',
              icon: Trash2,
              destructive: true,
              onClick: () => askDelete('event', e.id, e.name),
            },
          ]}
        />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Pro Admin"
        count={events.length}
        actionLabel="New event"
        onAction={() => openEvent('new')}
      >
        <SearchInput
          placeholder="Search events…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </PageHeader>

      <DataTable
        rows={filtered}
        columns={columns}
        getRowId={(e) => e.id}
        onRowClick={(e) => openEvent(e.id)}
        empty={
          <EmptyState
            icon={CalendarDays}
            title={events.length === 0 ? 'No events yet' : 'No matches'}
            message={
              events.length === 0
                ? 'Add a match-day campaign — it leads the club’s Pro Shop while it’s active.'
                : 'Try a different search.'
            }
            action={
              events.length === 0 ? (
                <Button onClick={() => openEvent('new')}>
                  <Plus className="size-5" strokeWidth={2} />
                  New event
                </Button>
              ) : undefined
            }
          />
        }
      />
    </div>
  )
}
