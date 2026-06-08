import { Sun, Moon } from 'lucide-react'
import { useAdminTheme } from '@/store/useAdminTheme'

/*
  Admin Light/Dark toggle. Lives on the (always-green) chrome top bar, so it's
  styled light-on-green in both modes. Shows the TARGET mode's icon: a moon while
  light (click → dark), a sun while dark (click → light).
*/
export function ThemeToggle() {
  const theme = useAdminTheme((s) => s.theme)
  const toggleTheme = useAdminTheme((s) => s.toggleTheme)
  const isLight = theme === 'light'
  const label = isLight ? 'Switch to dark mode' : 'Switch to light mode'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={!isLight}
      title={label}
      className="grid size-9 cursor-pointer place-items-center text-mute transition-colors hover:bg-ink/40 hover:text-cream"
    >
      {isLight ? (
        <Moon className="size-5" strokeWidth={1.5} />
      ) : (
        <Sun className="size-5" strokeWidth={1.5} />
      )}
    </button>
  )
}
