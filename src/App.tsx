import { useAuthStore } from '@/store/useAuthStore'
import { GuestApp } from '@/features/guest/GuestApp'
import { AdminApp } from '@/features/admin/AdminApp'
import { Toaster } from '@/components/ui/toast'

/*
  Top-level role switch. The same UI kit powers two separate zones:
  - guest → the customer tunnel (GuestApp)
  - admin → the back-office dashboard (AdminApp)
  The Guest/Admin toggle lives in each zone's header (demo only — no real auth).
*/
export default function App() {
  const role = useAuthStore((s) => s.role)

  return (
    <>
      {role === 'admin' ? <AdminApp /> : <GuestApp />}
      <Toaster />
    </>
  )
}
