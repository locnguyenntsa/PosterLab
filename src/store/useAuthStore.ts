import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/*
  App mode. The role is orthogonal to the guest tunnel state (useFlowStore) and
  must survive a tunnel reset — so it lives in its own small, persisted store.
  Demo only: there is NO real auth. The header toggle flips this value.
*/
export type Role = 'guest' | 'admin'

const ADMIN_PATH = '/admin'

/**
 * The URL decides which zone opens, so the demo can be shared as two clean links:
 *   /        → guest tunnel
 *   /admin   → back-office
 */
export function roleFromPath(): Role {
  if (typeof window === 'undefined') return 'guest'
  const path = window.location.pathname.replace(/\/+$/, '').toLowerCase()
  return path === ADMIN_PATH || path.startsWith(ADMIN_PATH + '/') ? 'admin' : 'guest'
}

/** The path that represents a role — used to keep the address bar in sync. */
export function pathForRole(role: Role): string {
  return role === 'admin' ? ADMIN_PATH : '/'
}

interface AuthState {
  role: Role
  setRole: (role: Role) => void
  toggle: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: roleFromPath(),
      setRole: (role) => set({ role }),
      toggle: () => set((s) => ({ role: s.role === 'admin' ? 'guest' : 'admin' })),
    }),
    {
      name: 'onepact-auth',
      // A shared /admin link must always open the back-office, even if a previous
      // visit on this browser persisted a different role — so the URL wins on load.
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<AuthState>),
        role: roleFromPath(),
      }),
    },
  ),
)
