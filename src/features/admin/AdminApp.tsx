import { useEffect } from 'react'
import { useAdminStore } from '@/store/useAdminStore'
import { useAdminTheme } from '@/store/useAdminTheme'
import { applyTeamTheme } from '@/lib/teamTheme'
import { AdminTopbar } from '@/features/admin/AdminTopbar'
import { AdminSidebar } from '@/features/admin/AdminSidebar'
import { AdminDeleteConfirm } from '@/features/admin/AdminDeleteConfirm'
import { DesignsAdmin } from '@/features/admin/designs/DesignsAdmin'
import { DesignForm } from '@/features/admin/designs/DesignForm'
import { TeamsAdmin } from '@/features/admin/teams/TeamsAdmin'
import { TeamForm } from '@/features/admin/teams/TeamForm'
import { GenericDesignsAdmin } from '@/features/admin/generic/GenericDesignsAdmin'
import { GenericDesignForm } from '@/features/admin/generic/GenericDesignForm'
import { EventsAdmin } from '@/features/admin/events/EventsAdmin'
import { EventForm } from '@/features/admin/events/EventForm'
import { AdminsAdmin } from '@/features/admin/admins/AdminsAdmin'
import { AdminForm } from '@/features/admin/admins/AdminForm'

/*
  Admin back-office shell: a sidebar dashboard that REUSES PosterLab's tokens and
  flat style but intentionally drops the guest tunnel's centered layout and the
  PatternBG (admin is a separate, neutral tool). Content switches on the admin
  section — the same conditional-render pattern the guest App uses for steps.
*/
export function AdminApp() {
  const section = useAdminStore((s) => s.section)
  const theme = useAdminTheme((s) => s.theme)

  // Mark <html> as "admin" in BOTH themes so admin-only CSS (e.g. the tighter
  // label tracking) applies identically in light and dark — including dialogs
  // and toasts portaled to <body>, outside this subtree.
  useEffect(() => {
    const root = document.documentElement
    root.classList.add('admin-active')
    return () => root.classList.remove('admin-active')
  }, [])

  // Clear any club tint left on :root by the guest tunnel, and flag <html> with
  // the LIGHT theme only when chosen — so it applies everywhere, including
  // dialogs and toasts that portal to <body>. Dark = the brand green baseline
  // (no class). Re-runs on toggle; cleanup keeps the guest tunnel dark.
  useEffect(() => {
    const root = document.documentElement
    applyTeamTheme(null)
    root.classList.toggle('admin-theme', theme === 'light')
    return () => root.classList.remove('admin-theme')
  }, [theme])

  return (
    // App-shell: the viewport is fixed and only <main> scrolls, so the topbar
    // and sidebar stay put while the content area scrolls.
    <div className="flex h-svh flex-col overflow-hidden bg-bg">
      <AdminTopbar />
      <div className="flex min-h-0 flex-1">
        <AdminSidebar />
        <main className="min-w-0 flex-1 overflow-y-auto px-5 py-8 sm:px-8">
          <div className="mx-auto w-full max-w-6xl">
            {section === 'designs' ? (
              <DesignsAdmin />
            ) : section === 'teams' ? (
              <TeamsAdmin />
            ) : section === 'generic' ? (
              <GenericDesignsAdmin />
            ) : section === 'events' ? (
              <EventsAdmin />
            ) : (
              <AdminsAdmin />
            )}
          </div>
        </main>
      </div>

      {/* CRUD modals + delete confirmation (each controls its own open state) */}
      <DesignForm />
      <TeamForm />
      <GenericDesignForm />
      <EventForm />
      <AdminForm />
      <AdminDeleteConfirm />
    </div>
  )
}
