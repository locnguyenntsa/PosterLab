import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/*
  App mode. The role is orthogonal to the guest tunnel state (useFlowStore) and
  must survive a tunnel reset — so it lives in its own small, persisted store.
  Demo only: there is NO real auth. The header toggle flips this value.
*/
export type Role = 'guest' | 'admin'

interface AuthState {
  role: Role
  setRole: (role: Role) => void
  toggle: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: 'guest',
      setRole: (role) => set({ role }),
      toggle: () => set((s) => ({ role: s.role === 'admin' ? 'guest' : 'admin' })),
    }),
    { name: 'onepact-auth' },
  ),
)
