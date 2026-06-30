import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { eventSchema } from '@/features/admin/schemas'
import type { EventFormValues } from '@/features/admin/schemas'
import { useAdminStore } from '@/store/useAdminStore'
import { useCatalogStore, useTeams } from '@/store/useCatalogStore'
import { useToastStore } from '@/store/useToastStore'

const FORM_ID = 'event-form'

export function EventForm() {
  const eventEdit = useAdminStore((s) => s.eventEdit)
  const close = useAdminStore((s) => s.closeEvent)
  const open = eventEdit !== null
  const isNew = eventEdit === 'new'

  return (
    <Dialog
      open={open}
      onClose={close}
      size="lg"
      title={isNew ? 'New event' : 'Edit event'}
      footer={
        open ? (
          <>
            <Button variant="outline" size="sm" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" form={FORM_ID} size="sm">
              {isNew ? 'Create event' : 'Save event'}
            </Button>
          </>
        ) : undefined
      }
    >
      {open && <EventFormBody key={eventEdit} id={eventEdit} />}
    </Dialog>
  )
}

function EventFormBody({ id }: { id: string | 'new' }) {
  const isNew = id === 'new'
  const existing = useCatalogStore((s) => (isNew ? undefined : s.events.find((e) => e.id === id)))
  const teams = useTeams()
  // Events belong to a partner club (the home side of the fixture).
  const partnerClubs = teams.filter((c) => c.partner !== false)
  const addEvent = useCatalogStore((s) => s.addEvent)
  const updateEvent = useCatalogStore((s) => s.updateEvent)
  const close = useAdminStore((s) => s.closeEvent)
  const push = useToastStore((s) => s.push)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    mode: 'onBlur',
    defaultValues: existing
      ? {
          name: existing.name,
          clubId: existing.clubId,
          startDate: existing.startDate,
          endDate: existing.endDate,
          competition: existing.competition,
          opponentName: existing.opponentName,
          opponentCode: existing.opponentCode,
          opponentColor: existing.opponentColor ?? '',
          venue: existing.venue ?? '',
          kickoff: existing.kickoff,
          status: existing.status ?? 'live',
        }
      : {
          name: '',
          clubId: partnerClubs[0]?.id ?? '',
          startDate: '',
          endDate: '',
          competition: '',
          opponentName: '',
          opponentCode: '',
          opponentColor: '',
          venue: '',
          kickoff: '',
          status: 'live',
        },
  })

  const values = watch()

  const onSubmit = (v: EventFormValues) => {
    if (isNew) {
      addEvent(v)
      push('Event created')
    } else {
      updateEvent(id, v)
      push('Event saved')
    }
    close()
  }

  return (
    <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Field label="Event name" error={errors.name?.message} htmlFor="event-name">
        <Input
          id="event-name"
          placeholder="Matchday 2"
          aria-invalid={!!errors.name}
          {...register('name')}
        />
      </Field>

      <Field
        label="Club"
        error={errors.clubId?.message}
        htmlFor="event-club"
        hint="The home side · partner clubs only"
      >
        <Select
          id="event-club"
          aria-invalid={!!errors.clubId}
          value={values.clubId}
          onChange={(v) => setValue('clubId', v, { shouldDirty: true, shouldValidate: true })}
          options={partnerClubs.map((c) => ({ value: c.id, label: c.name }))}
          placeholder="Choose a club"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Start date" error={errors.startDate?.message} htmlFor="event-start">
          <DateTimePicker
            id="event-start"
            mode="date"
            value={values.startDate ?? ''}
            onChange={(v) => setValue('startDate', v, { shouldDirty: true, shouldValidate: true })}
            aria-invalid={!!errors.startDate}
          />
        </Field>
        <Field label="End date" error={errors.endDate?.message} htmlFor="event-end">
          <DateTimePicker
            id="event-end"
            mode="date"
            value={values.endDate ?? ''}
            onChange={(v) => setValue('endDate', v, { shouldDirty: true, shouldValidate: true })}
            aria-invalid={!!errors.endDate}
          />
        </Field>
      </div>

      <Field label="Competition" error={errors.competition?.message} htmlFor="event-comp">
        <Input
          id="event-comp"
          placeholder="Ligue 1 · Matchday 2"
          aria-invalid={!!errors.competition}
          {...register('competition')}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Opponent" error={errors.opponentName?.message} htmlFor="event-opp">
          <Input
            id="event-opp"
            placeholder="Stade de Reims"
            aria-invalid={!!errors.opponentName}
            {...register('opponentName')}
          />
        </Field>
        <Field label="Opponent code" error={errors.opponentCode?.message} htmlFor="event-oppcode">
          <Input
            id="event-oppcode"
            placeholder="SDR"
            maxLength={5}
            className="uppercase"
            aria-invalid={!!errors.opponentCode}
            {...register('opponentCode')}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Kick-off" error={errors.kickoff?.message} htmlFor="event-kickoff">
          <DateTimePicker
            id="event-kickoff"
            mode="datetime"
            value={values.kickoff ?? ''}
            onChange={(v) => setValue('kickoff', v, { shouldDirty: true, shouldValidate: true })}
            aria-invalid={!!errors.kickoff}
          />
        </Field>
        <Field label="Venue (optional)" error={errors.venue?.message} htmlFor="event-venue">
          <Input
            id="event-venue"
            placeholder="Stade Geoffroy-Guichard"
            aria-invalid={!!errors.venue}
            {...register('venue')}
          />
        </Field>
      </div>

      <Field label="Opponent colour (optional)" error={errors.opponentColor?.message}>
        <div className="flex items-center gap-2">
          <input
            type="color"
            aria-label="Opponent colour swatch"
            value={/^#[0-9a-fA-F]{6}$/.test(values.opponentColor ?? '') ? values.opponentColor : '#e2231a'}
            onChange={(e) => setValue('opponentColor', e.target.value, { shouldValidate: true, shouldDirty: true })}
            className="size-12 shrink-0 cursor-pointer border border-line bg-[var(--c-field)] p-1 [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
          />
          <Input
            value={values.opponentColor ?? ''}
            onChange={(e) => setValue('opponentColor', e.target.value, { shouldValidate: true, shouldDirty: true })}
            placeholder="#e2231a"
            aria-invalid={!!errors.opponentColor}
          />
        </div>
      </Field>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <div className="space-y-1.5">
          <p className="label text-cream">Live</p>
          <p className="t-help">Active campaigns lead the club’s Pro Shop within the window</p>
        </div>
        <Switch
          aria-label="Live"
          checked={values.status === 'live'}
          onCheckedChange={(v) => setValue('status', v ? 'live' : 'draft', { shouldDirty: true })}
        />
      </div>
    </form>
  )
}
