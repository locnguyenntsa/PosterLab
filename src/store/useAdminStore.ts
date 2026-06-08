import { create } from 'zustand'

/*
  Transient admin UI state: which back-office page is showing, and which CRUD
  modal (if any) is open. NOT persisted — re-entering admin always lands on the
  Designs page with no modal open. Catalog data lives in useCatalogStore.
*/
export type AdminSection = 'designs' | 'teams'

export type DeleteTarget = {
  kind: 'design' | 'team'
  id: string
  name: string
}

interface AdminState {
  section: AdminSection
  setSection: (section: AdminSection) => void

  /** Whether the sidebar is collapsed to a narrow icon rail. */
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void

  /** Open design editor: an id to edit, 'new' to create, or null when closed. */
  designEdit: string | 'new' | null
  /** Open team editor: an id to edit, 'new' to create, or null when closed. */
  teamEdit: string | 'new' | null
  /** Pending delete confirmation, or null. */
  confirmDelete: DeleteTarget | null

  openDesign: (id: string | 'new') => void
  closeDesign: () => void
  openTeam: (id: string | 'new') => void
  closeTeam: () => void
  askDelete: (kind: DeleteTarget['kind'], id: string, name: string) => void
  cancelDelete: () => void
}

// Default to a collapsed rail on small viewports so admin stays usable on phones.
const initialCollapsed =
  typeof window !== 'undefined' && window.innerWidth < 768

export const useAdminStore = create<AdminState>((set) => ({
  section: 'designs',
  setSection: (section) => set({ section }),

  sidebarCollapsed: initialCollapsed,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

  designEdit: null,
  teamEdit: null,
  confirmDelete: null,

  openDesign: (id) => set({ designEdit: id }),
  closeDesign: () => set({ designEdit: null }),
  openTeam: (id) => set({ teamEdit: id }),
  closeTeam: () => set({ teamEdit: null }),
  askDelete: (kind, id, name) => set({ confirmDelete: { kind, id, name } }),
  cancelDelete: () => set({ confirmDelete: null }),
}))
