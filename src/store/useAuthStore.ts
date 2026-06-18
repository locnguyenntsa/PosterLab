import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/*
  App mode + admin session. `role` is orthogonal to the guest tunnel state
  (useFlowStore) and is derived from the URL on every load (see roleFromPath) —
  the /admin link is the source of truth for which zone opens. The admin
  back-office is then gated by `isAdminAuthed`, a persisted demo sign-in flag
  (the session lasts until the explicit Sign out — see DEMO_ADMIN below).
*/
export type Role = 'guest' | 'admin'

const ADMIN_PATH = '/admin'

/*
  Demo-only admin gate — a front-end seam, like the simulated Stripe and AI-render
  steps. There is NO backend and (by request) NO credential check: any input
  unlocks the back-office, and the "signed-in" flag is just persisted in
  localStorage. When the back-office gets a server, replace `login` with a real
  POST /login (returning a token) and stop persisting `isAdminAuthed`.
*/

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

const SHOP_RE = /^\/shop\/([a-z0-9-]+)\/?$/i

/**
 * A Pro Shop link (`/shop/<club>`) returns the club slug, else null. Stays in the
 * guest zone (roleFromPath only special-cases /admin) but puts the flow in a
 * club-locked, themed mode — see useFlowStore.enterShop / App.tsx.
 */
export function shopClubFromPath(): string | null {
  if (typeof window === 'undefined') return null
  const m = window.location.pathname.match(SHOP_RE)
  return m ? m[1].toLowerCase() : null
}

const JOIN_RE = /^\/join\/?$/i

/**
 * Whether the URL is the non-partner club funnel (`/join`). Like `/shop`, this
 * stays in the guest zone (roleFromPath only special-cases /admin) but puts the
 * flow into the join prelude — see useFlowStore.enterJoin / App.tsx.
 */
export function isJoinPath(): boolean {
  if (typeof window === 'undefined') return false
  return JOIN_RE.test(window.location.pathname)
}

interface AuthState {
  role: Role
  /** Whether the admin back-office has been unlocked (demo gate — see DEMO_ADMIN). */
  isAdminAuthed: boolean
  setRole: (role: Role) => void
  toggle: () => void
  /** Unlock the back-office (demo gate — accepts any input). */
  login: () => void
  /** Lock the back-office again (returns the /admin zone to the login screen). */
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: roleFromPath(),
      isAdminAuthed: false,
      setRole: (role) => set({ role }),
      toggle: () => set((s) => ({ role: s.role === 'admin' ? 'guest' : 'admin' })),
      login: () => set({ isAdminAuthed: true }),
      logout: () => set({ isAdminAuthed: false }),
    }),
    {
      name: 'posterlab-auth',
      // Only the sign-in flag is worth persisting; `role` is always re-derived
      // from the URL in merge() below, so storing it would be dead weight.
      partialize: (s) => ({ isAdminAuthed: s.isAdminAuthed }),
      // A shared /admin link must always open the back-office zone (the URL wins
      // on load); the gate then decides whether to show the dashboard. The
      // sign-in flag is coerced to a strict boolean so a malformed/stale
      // localStorage payload can never accidentally unlock the back-office.
      merge: (persisted, current) => ({
        ...current,
        role: roleFromPath(),
        isAdminAuthed: (persisted as Partial<AuthState> | undefined)?.isAdminAuthed === true,
      }),
    },
  ),
)
