import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/*
  Admin-only display preference: light vs dark. Persisted so a chosen theme
  survives a refresh. "dark" is the brand dark baseline (the default
  :root tokens); "light" applies the `admin-theme` layer in AdminApp. The guest
  tunnel is unaffected by this.
*/
export type AdminThemeMode = 'light' | 'dark'

interface AdminThemeState {
  theme: AdminThemeMode
  setTheme: (theme: AdminThemeMode) => void
  toggleTheme: () => void
}

export const useAdminTheme = create<AdminThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
    }),
    { name: 'posterlab-admin-theme' },
  ),
)
