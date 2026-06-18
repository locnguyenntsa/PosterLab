import { useEffect } from 'react'
import { useAuthStore, roleFromPath, pathForRole, shopClubFromPath, isJoinPath } from '@/store/useAuthStore'
import { useFlowStore } from '@/store/useFlowStore'
import { findTeam } from '@/store/useCatalogStore'
import { GuestApp } from '@/features/guest/GuestApp'
import { AdminApp } from '@/features/admin/AdminApp'
import { AdminLogin } from '@/features/admin/AdminLogin'
import { Toaster } from '@/components/ui/toast'

/*
  Top-level role switch. The same UI kit powers two separate zones:
  - guest → the customer tunnel (GuestApp)        served at  /
  - admin → the back-office dashboard (AdminApp)  served at  /admin
  The URL decides which zone opens (see roleFromPath), so the demo is shared as
  two clean links. The /admin zone is gated by a sign-in screen (AdminLogin) —
  a front-end-only demo gate, no real auth.
*/
export default function App() {
  const role = useAuthStore((s) => s.role)
  const setRole = useAuthStore((s) => s.setRole)
  const isAdminAuthed = useAuthStore((s) => s.isAdminAuthed)
  const enterShop = useFlowStore((s) => s.enterShop)
  const exitShop = useFlowStore((s) => s.exitShop)
  const enterJoin = useFlowStore((s) => s.enterJoin)
  const exitJoin = useFlowStore((s) => s.exitJoin)
  const joinPhase = useFlowStore((s) => s.joinPhase)

  // Toggle → reflect the current zone in the address bar (keeps the URL shareable).
  // Pro Shop (/shop/<club>) and the join funnel (/join) own their own URLs below.
  useEffect(() => {
    if (shopClubFromPath() || isJoinPath()) return
    const current = window.location.pathname.replace(/\/+$/, '')
    const want = pathForRole(role).replace(/\/+$/, '')
    if (current !== want) window.history.pushState(null, '', pathForRole(role))
  }, [role])

  // Reflect the join funnel in the address bar so the home CTA produces a
  // shareable /join link; replace it with / once the prelude hands off to the
  // builder or the user leaves (so browser-back doesn't re-enter the form).
  useEffect(() => {
    const onJoinPath = isJoinPath()
    if (joinPhase && !onJoinPath) window.history.pushState(null, '', '/join')
    else if (!joinPhase && onJoinPath) window.history.replaceState(null, '', '/')
  }, [joinPhase])

  // Reconcile zone + Pro Shop + join mode from the URL on mount and on back/forward.
  useEffect(() => {
    const sync = () => {
      setRole(roleFromPath())
      const slug = shopClubFromPath()
      if (slug && findTeam(slug)) {
        if (useFlowStore.getState().shopClubId !== slug) enterShop(slug)
      } else if (isJoinPath()) {
        if (useFlowStore.getState().joinPhase === null) enterJoin()
      } else {
        if (slug) window.history.replaceState(null, '', '/') // unknown club → home
        if (useFlowStore.getState().shopClubId) exitShop()
        if (useFlowStore.getState().joinPhase !== null) exitJoin()
      }
    }
    sync()
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [setRole, enterShop, exitShop, enterJoin, exitJoin])

  return (
    <>
      {role === 'admin' ? (
        isAdminAuthed ? <AdminApp /> : <AdminLogin />
      ) : (
        <GuestApp />
      )}
      <Toaster />
    </>
  )
}
