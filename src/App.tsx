import { useEffect } from 'react'
import { useAuthStore, roleFromPath, pathForRole } from '@/store/useAuthStore'
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

  // Toggle → reflect the current zone in the address bar (keeps the URL shareable).
  useEffect(() => {
    const current = window.location.pathname.replace(/\/+$/, '')
    const want = pathForRole(role).replace(/\/+$/, '')
    if (current !== want) window.history.pushState(null, '', pathForRole(role))
  }, [role])

  // Browser back/forward → follow the URL back to the matching zone.
  useEffect(() => {
    const onPop = () => setRole(roleFromPath())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [setRole])

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
