import * as React from 'react'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'
import { cn } from '@/lib/utils'

type SortValue = string | number | boolean | null | undefined

export interface Column<T> {
  key: string
  header: React.ReactNode
  cell: (row: T) => React.ReactNode
  align?: 'right' | 'center'
  /** Extra classes applied to both the header cell and body cells. */
  className?: string
  /**
   * Provide to make this column sortable. Returns the comparable value for a
   * row; clicking the header then toggles ascending / descending.
   */
  sortAccessor?: (row: T) => SortValue
}

type SortState = { key: string; dir: 'asc' | 'desc' }

/** Compare two cell values; empties always sort last (handled by the caller). */
function compareValues(a: SortValue, b: SortValue): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (typeof a === 'boolean' && typeof b === 'boolean')
    return a === b ? 0 : a ? -1 : 1 // true before false
  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: 'base',
  })
}

const isEmpty = (v: SortValue) => v === null || v === undefined || v === ''

/*
  Generic, config-driven table. Pass rows + column definitions. Columns with a
  `sortAccessor` get a clickable header (small sort icon on the left) that sorts
  rows ascending / descending. Optional row click handler and an `empty` slot.
*/
export function DataTable<T>({
  rows,
  columns,
  getRowId,
  onRowClick,
  empty,
}: {
  rows: T[]
  columns: Column<T>[]
  getRowId: (row: T) => string
  onRowClick?: (row: T) => void
  empty?: React.ReactNode
}) {
  const [sort, setSort] = React.useState<SortState | null>(null)

  const sortedRows = React.useMemo(() => {
    if (!sort) return rows
    const acc = columns.find((c) => c.key === sort.key)?.sortAccessor
    if (!acc) return rows
    const dir = sort.dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const av = acc(a)
      const bv = acc(b)
      // Empty/unknown values always sink to the bottom, regardless of direction.
      if (isEmpty(av) || isEmpty(bv)) {
        return isEmpty(av) === isEmpty(bv) ? 0 : isEmpty(av) ? 1 : -1
      }
      return compareValues(av, bv) * dir
    })
  }, [rows, sort, columns])

  if (rows.length === 0 && empty !== undefined) return <>{empty}</>

  const alignClass = (a?: Column<T>['align']) =>
    a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : undefined

  const toggleSort = (key: string) =>
    setSort((s) =>
      s && s.key === key
        ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' },
    )

  return (
    <Table>
      <THead>
        <TR>
          {columns.map((c) => {
            const active = sort?.key === c.key
            return (
              <TH
                key={c.key}
                aria-sort={
                  active ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : undefined
                }
                className={cn(alignClass(c.align), c.className)}
              >
                {c.sortAccessor ? (
                  <button
                    type="button"
                    onClick={() => toggleSort(c.key)}
                    className={cn(
                      'group/sort -mx-1 inline-flex cursor-pointer items-center gap-1.5 px-1 transition-colors duration-100',
                      active ? 'text-accent' : 'text-on-dark hover:text-accent',
                    )}
                  >
                    {active ? (
                      sort!.dir === 'asc' ? (
                        <ArrowUp className="size-3.5 shrink-0 text-accent" strokeWidth={2} />
                      ) : (
                        <ArrowDown className="size-3.5 shrink-0 text-accent" strokeWidth={2} />
                      )
                    ) : (
                      <ArrowUpDown
                        className="size-3.5 shrink-0 opacity-55 transition-opacity duration-100 group-hover/sort:opacity-100"
                        strokeWidth={2}
                      />
                    )}
                    {c.header}
                  </button>
                ) : (
                  c.header
                )}
              </TH>
            )
          })}
        </TR>
      </THead>
      <TBody>
        {sortedRows.map((row) => (
          <TR
            key={getRowId(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={cn(
              onRowClick && 'cursor-pointer transition-colors duration-100 hover:bg-ink/[0.05]',
            )}
          >
            {columns.map((c) => (
              <TD key={c.key} className={cn(alignClass(c.align), c.className)}>
                {c.cell(row)}
              </TD>
            ))}
          </TR>
        ))}
      </TBody>
    </Table>
  )
}
