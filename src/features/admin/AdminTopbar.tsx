import { Logo } from '@/components/Logo'
import { RoleToggle } from '@/components/RoleToggle'
import { ThemeToggle } from '@/features/admin/ThemeToggle'

/* Flat admin top bar: brand lockup + Light/Dark theme toggle + Guest|Admin. */
export function AdminTopbar() {
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
          <RoleToggle />
        </div>
      </div>
    </header>
  )
}
