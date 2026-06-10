import {
  LayoutGrid,
  Users,
  ShieldCheck,
  ArrowLeft,
  RotateCcw,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { useAdminStore } from '@/store/useAdminStore'
import type { AdminSection } from '@/store/useAdminStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useCatalogStore } from '@/store/useCatalogStore'
import { useToastStore } from '@/store/useToastStore'
import { cn } from '@/lib/utils'

const NAV: { id: AdminSection; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'designs', label: 'Designs', icon: LayoutGrid },
  { id: 'teams', label: 'Teams', icon: Users },
  { id: 'admins', label: 'Admins', icon: ShieldCheck },
]

/*
  Full-height left nav: Designs / Teams with a orange active rail, plus a
  collapse/expand toggle that shrinks it to an icon rail (default-collapsed on
  small screens). The whole rail fills the viewport height and never scrolls
  with the content — only <main> scrolls (see AdminApp).
*/
export function AdminSidebar() {
  const section = useAdminStore((s) => s.section)
  const setSection = useAdminStore((s) => s.setSection)
  const collapsed = useAdminStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useAdminStore((s) => s.toggleSidebar)
  const setRole = useAuthStore((s) => s.setRole)
  const resetCatalog = useCatalogStore((s) => s.resetCatalog)
  const push = useToastStore((s) => s.push)

  const footerActions = [
    {
      label: 'Reset demo data',
      icon: RotateCcw,
      onClick: () => {
        resetCatalog()
        push('Demo data reset')
      },
    },
    {
      label: 'Back to site',
      icon: ArrowLeft,
      onClick: () => setRole('guest'),
    },
  ]

  return (
    <aside
      className={cn(
        'chrome-dark flex h-full shrink-0 flex-col overflow-y-auto border-r border-line bg-surface transition-[width] duration-150 ease-out',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Collapse / expand toggle */}
      <div
        className={cn(
          'flex h-12 shrink-0 items-center border-b border-line',
          collapsed ? 'justify-center px-2' : 'justify-between px-3',
        )}
      >
        {!collapsed && <span className="t-meta text-mute">Catalogue</span>}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="grid size-9 cursor-pointer place-items-center text-mute transition-colors hover:bg-ink/40 hover:text-cream"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-5" strokeWidth={1.5} />
          ) : (
            <PanelLeftClose className="size-5" strokeWidth={1.5} />
          )}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-2">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = section === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              aria-current={active ? 'page' : undefined}
              title={label}
              className={cn(
                'label relative flex cursor-pointer items-center gap-3 px-3 py-3 transition-colors duration-100',
                collapsed ? 'justify-center' : 'justify-start',
                active
                  ? 'bg-ink text-cream'
                  : 'text-mute hover:bg-ink/30 hover:text-cream',
              )}
            >
              {active && <span className="absolute left-0 top-0 h-full w-1 bg-accent" />}
              <Icon className="size-5 shrink-0" strokeWidth={1.5} />
              {!collapsed && <span>{label}</span>}
            </button>
          )
        })}
      </nav>

      <div className="flex shrink-0 flex-col gap-1 border-t border-line p-2">
        {footerActions.map(({ label, icon: Icon, onClick }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            title={label}
            className={cn(
              'label flex cursor-pointer items-center gap-3 px-3 py-3 text-mute transition-colors duration-100 hover:text-cream',
              collapsed ? 'justify-center' : 'justify-start',
            )}
          >
            <Icon className="size-5 shrink-0" strokeWidth={1.5} />
            {!collapsed && <span>{label}</span>}
          </button>
        ))}
      </div>
    </aside>
  )
}
