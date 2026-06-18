import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, Lock, LogIn, User } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { PatternBG } from '@/components/PatternBG'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { applyTeamTheme } from '@/lib/teamTheme'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/useAuthStore'
import { useToastStore } from '@/store/useToastStore'

const schema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

/*
  Admin sign-in gate. The /admin URL is the only door into the back-office, so
  this screen stands in front of it. Demo gate (front-end seam, no backend): any
  username/password unlocks the dashboard — see `login` in useAuthStore. Once
  signed in the session persists (across reloads) until the explicit Sign out in
  the topbar; "Back to site" just returns to the storefront. Reuses the guest
  tunnel's brand chrome (PatternBG + flat dark Card) rather than the admin light
  theme, so the lock screen reads as "Poster Lab", not a tool.
*/
export function AdminLogin() {
  const login = useAuthStore((s) => s.login)
  const setRole = useAuthStore((s) => s.setRole)
  const push = useToastStore((s) => s.push)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' },
  })

  // This screen lives outside both app shells, so no one resets the club tint a
  // prior guest session may have left on :root — clear it so the card sits on the
  // neutral brand dark.
  useEffect(() => {
    applyTeamTheme(null)
  }, [])

  const onSubmit = () => {
    // Any input is accepted (demo gate); App swaps to AdminApp the moment the
    // signed-in flag flips.
    login()
    push('Signed in to the back-office')
  }

  return (
    <div className="relative flex min-h-svh flex-col">
      {/* Force the brand "PL" wall — never a leftover club code from a prior session. */}
      <PatternBG token="PL" />

      <div className="relative z-10 flex min-h-svh flex-col items-center justify-center px-5 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          <Card accent className="px-6 py-8 sm:px-8 sm:py-10">
            <div className="flex flex-col gap-7">
              <div className="flex flex-col items-center gap-4 text-center">
                <Logo />
                <span className="bg-ink px-2 py-0.5 label text-accent">
                  Back-office
                </span>
                <div className="space-y-1.5">
                  <h1 className="t-card">Sign In</h1>
                  <p className="t-body">Enter your credentials to manage designs and teams.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <Field label="Username" htmlFor="admin-username" error={errors.username?.message}>
                  <div className="relative">
                    <User
                      aria-hidden
                      className="pointer-events-none absolute left-4 top-1/2 z-10 size-5 -translate-y-1/2 text-mute"
                      strokeWidth={1.5}
                    />
                    <Input
                      id="admin-username"
                      autoFocus
                      autoComplete="username"
                      placeholder="admin"
                      className="pl-12"
                      aria-invalid={!!errors.username}
                      aria-describedby={errors.username ? 'admin-username-error' : undefined}
                      {...register('username')}
                    />
                  </div>
                </Field>

                <Field label="Password" htmlFor="admin-password" error={errors.password?.message}>
                  <div className="relative">
                    <Lock
                      aria-hidden
                      className="pointer-events-none absolute left-4 top-1/2 z-10 size-5 -translate-y-1/2 text-mute"
                      strokeWidth={1.5}
                    />
                    <Input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="px-12"
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? 'admin-password-error' : undefined}
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      aria-pressed={showPassword}
                      className={cn(
                        'absolute right-0 top-0 grid h-12 w-11 place-items-center',
                        'cursor-pointer text-mute transition-colors hover:text-cream',
                        'focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cream',
                      )}
                    >
                      {showPassword ? (
                        <EyeOff className="size-5" strokeWidth={1.5} />
                      ) : (
                        <Eye className="size-5" strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                </Field>

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  <LogIn className="size-5" strokeWidth={1.5} />
                  Sign In
                </Button>
              </form>

              {/* Demo hint — this prototype has no backend, so any input gets you in. */}
              <p className="border-t border-line pt-5 text-center t-meta text-mute">
                Demo access · type anything to sign in
              </p>
            </div>
          </Card>
        </motion.div>

        {/* The /admin URL is the only way here; offer a way back to the storefront. */}
        <button
          type="button"
          onClick={() => setRole('guest')}
          className="mt-6 inline-flex items-center gap-1.5 cursor-pointer label text-mute transition-colors hover:text-cream"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} />
          Back to site
        </button>
      </div>
    </div>
  )
}
