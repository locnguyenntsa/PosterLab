import { type ReactNode, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Send } from 'lucide-react'
import { StepScreen } from '@/components/StepScreen'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useFlowStore } from '@/store/useFlowStore'
import { JoinConfirmation } from '@/features/join/JoinConfirmation'

/*
  Step one of the non-partner funnel: a club tells us who they are. Mirrors the
  CheckoutForm pattern (react-hook-form + zod, onBlur, a local Field wrapper, the
  submit button wired to the form id). The "sport / league" field is free text —
  a club joining may play a sport we don't list yet.
*/
const schema = z.object({
  clubName: z.string().min(1, 'Club name is required'),
  sport: z.string().min(1, 'Tell us the sport or league'),
  city: z.string().min(1, 'City is required'),
  contactName: z.string().min(1, 'Your name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  phone: z.string().optional(),
  message: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="label text-danger">{error}</p>}
    </div>
  )
}

export function JoinRegistration() {
  const joinClub = useFlowStore((s) => s.joinClub)
  const setJoinClub = useFlowStore((s) => s.setJoinClub)
  const exitJoin = useFlowStore((s) => s.exitJoin)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues:
      joinClub ?? {
        clubName: '',
        sport: '',
        city: '',
        contactName: '',
        email: '',
        phone: '',
        message: '',
      },
    mode: 'onBlur',
  })

  // Submitting captures the club and opens the confirmation popup — the journey
  // ends there (the team follows up); closing it returns to the homepage.
  const onSubmit = (values: FormValues) => {
    setJoinClub(values)
    setSubmitted(true)
  }

  return (
    <>
    <StepScreen
      step={0}
      kicker="Get Listed"
      title="List Your Club"
      subtitle="Not a partner yet? Tell us about your club and we’ll be in touch about getting you listed."
      footer={
        <Button type="submit" form="join-form" className="w-full" size="lg">
          Submit Request
          <Send className="size-5" strokeWidth={1.5} />
        </Button>
      }
    >
      <form id="join-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Field label="Club name" error={errors.clubName?.message}>
          <Input
            placeholder="AS Saint-Étienne"
            aria-invalid={!!errors.clubName}
            {...register('clubName')}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Sport / league" error={errors.sport?.message}>
            <Input
              placeholder="Football · Ligue 2"
              aria-invalid={!!errors.sport}
              {...register('sport')}
            />
          </Field>
          <Field label="City" error={errors.city?.message}>
            <Input
              placeholder="Saint-Étienne"
              aria-invalid={!!errors.city}
              {...register('city')}
            />
          </Field>
        </div>

        <Field label="Your name" error={errors.contactName?.message}>
          <Input
            placeholder="Alex Martin"
            aria-invalid={!!errors.contactName}
            {...register('contactName')}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Email" error={errors.email?.message}>
            <Input
              type="email"
              placeholder="you@club.fr"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
          </Field>
          <Field label="Phone (optional)" error={errors.phone?.message}>
            <Input
              type="tel"
              placeholder="+33 6 12 34 56 78"
              aria-invalid={!!errors.phone}
              {...register('phone')}
            />
          </Field>
        </div>

        <Field label="Message (optional)" error={errors.message?.message}>
          <Textarea
            placeholder="Anything else we should know? Tell us about your club, your colours, your timeline…"
            aria-invalid={!!errors.message}
            {...register('message')}
          />
        </Field>
      </form>
    </StepScreen>

      <JoinConfirmation
        open={submitted}
        clubName={joinClub?.clubName}
        onClose={exitJoin}
      />
    </>
  )
}
