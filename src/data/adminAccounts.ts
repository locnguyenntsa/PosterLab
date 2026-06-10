import type { AdminAccount } from '@/types'

/*
  Seed admin accounts for the back-office "Admins" page.

  Front-end seam: passwords are PLAINTEXT here and in localStorage — there is no
  backend, nothing is hashed, and these are NOT checked at login (the demo login
  accepts any input, see useAuthStore). Swap for an API + server-side hashing
  when a backend lands. Static seam → swap for an API later.
*/
export const ADMIN_ACCOUNTS: Omit<AdminAccount, 'createdAt' | 'updatedAt'>[] = [
  { id: 'owner', email: 'owner@onepact.fr', name: 'Owner', role: 'owner', password: 'Onepact123' },
  { id: 'studio', email: 'studio@onepact.fr', name: 'Studio Lead', role: 'editor', password: 'Studio123' },
]
