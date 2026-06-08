import { Segmented } from '@/components/ui/segmented'
import { useAuthStore } from '@/store/useAuthStore'
import type { Role } from '@/store/useAuthStore'

const OPTIONS = [
  { value: 'guest' as const, label: 'Guest' },
  { value: 'admin' as const, label: 'Admin' },
]

/*
  Demo-only mode switch (no real auth). Lives in the header. Flipping to Admin
  swaps the whole app to the back-office; Guest returns to the customer tunnel.
*/
export function RoleToggle() {
  const role = useAuthStore((s) => s.role)
  const setRole = useAuthStore((s) => s.setRole)
  return (
    <Segmented<Role>
      ariaLabel="Switch between the guest site and the admin back-office"
      value={role}
      onChange={setRole}
      options={OPTIONS}
    />
  )
}
