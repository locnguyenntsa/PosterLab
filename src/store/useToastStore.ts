import { create } from 'zustand'

/*
  Tiny toast queue for save/delete feedback. Auto-dismisses each toast after a
  few seconds. Not persisted. Rendered by <Toaster/> at the app root.
*/
export type ToastVariant = 'success' | 'danger' | 'info'

export interface Toast {
  id: number
  message: string
  variant: ToastVariant
}

interface ToastState {
  toasts: Toast[]
  push: (message: string, variant?: ToastVariant) => void
  dismiss: (id: number) => void
}

let nextId = 1
const TIMEOUT_MS = 3000

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (message, variant = 'success') => {
    const id = nextId++
    set((s) => ({ toasts: [...s.toasts, { id, message, variant }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, TIMEOUT_MS)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
