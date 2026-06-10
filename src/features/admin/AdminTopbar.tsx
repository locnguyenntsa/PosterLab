import { LogOut } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/features/admin/ThemeToggle'
import { useAuthStore } from '@/store/useAuthStore'
import { useToastStore } from '@/store/useToastStore'

/* Flat admin top bar: brand lockup + Light/Dark theme toggle + sign out. */
export function AdminTopbar() {
  const logout = useAuthStore((s) => s.logout)
  const push = useToastStore((s) => s.push)

  return (
    <header className="chrome-dark z-30 shrink-0 border-b border-line bg-bg">
      <div className="flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="hidden bg-ink px-2 py-0.5 label text-accent sm:inline">
            Back-office
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => {
              logout()
              push('Signed out')
            }}
            aria-label="Sign out"
            title="Sign out"
            className="grid size-9 cursor-pointer place-items-center text-mute transition-colors hover:bg-ink/40 hover:text-cream"
          >
            <LogOut className="size-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  )
}
