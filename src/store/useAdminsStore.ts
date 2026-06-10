import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AdminAccount, AdminRole } from '@/types'
import { ADMIN_ACCOUNTS } from '@/data/adminAccounts'

/*
  Admin accounts for the back-office "Admins" page — a MANAGEMENT LIST only.

  Mirrors useCatalogStore: seeded from the static data file and persisted to
  localStorage under its OWN key, so the sidebar's "Reset demo data"
  (resetCatalog, designs + teams only) never wipes the admin list. CRUD actions
  return a result object so the form can surface a duplicate-email error inline.

  Front-end seam: passwords are plaintext (no backend, not hashed) and are NOT
  enforced at login — the demo login accepts any input (see useAuthStore). When a
  backend lands, hash server-side and point the login at these records.
*/

// Stable seed timestamp so "Created" reads sensibly for the seeded accounts.
const SEED_AT = '2026-06-04T00:00:00.000Z'
const nowISO = () => new Date().toISOString()

function seedAdmins(): AdminAccount[] {
  return ADMIN_ACCOUNTS.map((a) => ({ ...a, createdAt: SEED_AT }))
}

/** Unique slug id from the email's local-part, avoiding collisions. */
function makeId(email: string, existing: { id: string }[]): string {
  const base =
    (email.split('@')[0] || 'admin')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'admin'
  const ids = new Set(existing.map((e) => e.id))
  if (!ids.has(base)) return base
  let n = 2
  while (ids.has(`${base}-${n}`)) n++
  return `${base}-${n}`
}

const normEmail = (email: string) => email.trim().toLowerCase()

export type AdminResult = { ok: true; id: string } | { ok: false; error: string }

export interface AdminAccountInput {
  email: string
  name?: string
  role: AdminRole
  /** On update, a blank/absent password keeps the existing one. */
  password?: string
}

const DUPLICATE_EMAIL = 'An admin with this email already exists'

interface AdminsState {
  admins: AdminAccount[]
  addAdmin: (v: AdminAccountInput) => AdminResult
  updateAdmin: (id: string, v: AdminAccountInput) => AdminResult
  deleteAdmin: (id: string) => void
  resetAdmins: () => void
}

export const useAdminsStore = create<AdminsState>()(
  persist(
    (set, get) => ({
      admins: seedAdmins(),

      addAdmin: (v) => {
        const email = v.email.trim()
        if (get().admins.some((a) => normEmail(a.email) === normEmail(email))) {
          return { ok: false, error: DUPLICATE_EMAIL }
        }
        const id = makeId(email, get().admins)
        const account: AdminAccount = {
          id,
          email,
          name: v.name?.trim() || undefined,
          role: v.role,
          password: v.password ?? '',
          createdAt: nowISO(),
        }
        set((s) => ({ admins: [account, ...s.admins] }))
        return { ok: true, id }
      },

      updateAdmin: (id, v) => {
        const email = v.email.trim()
        if (get().admins.some((a) => a.id !== id && normEmail(a.email) === normEmail(email))) {
          return { ok: false, error: DUPLICATE_EMAIL }
        }
        set((s) => ({
          admins: s.admins.map((a) =>
            a.id === id
              ? {
                  ...a,
                  email,
                  name: v.name?.trim() || undefined,
                  role: v.role,
                  // Blank password = keep the existing one.
                  password: v.password?.trim() ? v.password : a.password,
                  updatedAt: nowISO(),
                }
              : a,
          ),
        }))
        return { ok: true, id }
      },

      deleteAdmin: (id) => set((s) => ({ admins: s.admins.filter((a) => a.id !== id) })),

      resetAdmins: () => set({ admins: seedAdmins() }),
    }),
    {
      name: 'onepact-admins',
      version: 2,
      // v1 had no `role`; backfill it so older persisted accounts stay valid.
      migrate: (persisted, version) => {
        const state = persisted as { admins?: AdminAccount[] } | undefined
        if (version < 2 && state?.admins) {
          state.admins = state.admins.map((a) => ({ ...a, role: a.role ?? 'admin' }))
        }
        return state as AdminsState
      },
      partialize: (s) => ({ admins: s.admins }),
    },
  ),
)

/* Reactive read hook (subscribes to the store). */
export const useAdmins = () => useAdminsStore((s) => s.admins)
