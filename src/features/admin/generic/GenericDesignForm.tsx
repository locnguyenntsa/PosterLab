import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { GenericPosterArt } from '@/components/GenericPosterArt'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { genericDesignSchema } from '@/features/admin/schemas'
import type { GenericDesignFormValues } from '@/features/admin/schemas'
import { DEFAULT_GENERIC_COLOR } from '@/data/generic'
import { useAdminStore } from '@/store/useAdminStore'
import { useCatalogStore } from '@/store/useCatalogStore'
import { useToastStore } from '@/store/useToastStore'

const FORM_ID = 'generic-design-form'
const isHex = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v)

export function GenericDesignForm() {
  const genericEdit = useAdminStore((s) => s.genericEdit)
  const close = useAdminStore((s) => s.closeGeneric)
  const open = genericEdit !== null
  const isNew = genericEdit === 'new'

  return (
    <Dialog
      open={open}
      onClose={close}
      size="lg"
      title={isNew ? 'New generic design' : 'Edit generic design'}
      footer={
        open ? (
          <>
            <Button variant="outline" size="sm" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" form={FORM_ID} size="sm">
              {isNew ? 'Create' : 'Save'}
            </Button>
          </>
        ) : undefined
      }
    >
      {open && <GenericDesignFormBody key={genericEdit} id={genericEdit} />}
    </Dialog>
  )
}

function GenericDesignFormBody({ id }: { id: string | 'new' }) {
  const isNew = id === 'new'
  const existing = useCatalogStore((s) =>
    isNew ? undefined : s.genericDesigns.find((d) => d.id === id),
  )
  const addGenericDesign = useCatalogStore((s) => s.addGenericDesign)
  const updateGenericDesign = useCatalogStore((s) => s.updateGenericDesign)
  const close = useAdminStore((s) => s.closeGeneric)
  const push = useToastStore((s) => s.push)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GenericDesignFormValues>({
    resolver: zodResolver(genericDesignSchema),
    mode: 'onBlur',
    defaultValues: existing
      ? {
          name: existing.name,
          color: existing.color,
          status: existing.status ?? 'live',
          thumbnailUrl: existing.thumbnailUrl,
        }
      : { name: '', color: DEFAULT_GENERIC_COLOR, status: 'live', thumbnailUrl: undefined },
  })

  const values = watch()
  const previewColor = isHex(values.color) ? values.color : DEFAULT_GENERIC_COLOR

  const onSubmit = (v: GenericDesignFormValues) => {
    if (isNew) {
      addGenericDesign(v)
      push('Generic design created')
    } else {
      updateGenericDesign(id, v)
      push('Generic design saved')
    }
    close()
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* ── Form ───────────────────────────────────────── */}
      <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Name" error={errors.name?.message} htmlFor="generic-name">
          <Input
            id="generic-name"
            placeholder="Royal Blue"
            aria-invalid={!!errors.name}
            {...register('name')}
          />
        </Field>

        <Field label="Jersey colour" error={errors.color?.message}>
          <div className="flex items-center gap-2">
            <input
              type="color"
              aria-label="Jersey colour swatch"
              value={previewColor}
              onChange={(e) => setValue('color', e.target.value, { shouldValidate: true, shouldDirty: true })}
              className="size-12 shrink-0 cursor-pointer border border-line bg-[var(--c-field)] p-1 [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
            />
            <Input
              value={values.color}
              onChange={(e) => setValue('color', e.target.value, { shouldValidate: true, shouldDirty: true })}
              placeholder="#1d4ed8"
              aria-invalid={!!errors.color}
            />
          </div>
        </Field>

        <div className="flex items-center justify-between border-t border-line pt-4">
          <div className="space-y-1.5">
            <p className="label text-cream">Live</p>
            <p className="t-help">Shown in the customer gallery</p>
          </div>
          <Switch
            aria-label="Live"
            checked={values.status === 'live'}
            onCheckedChange={(v) => setValue('status', v ? 'live' : 'draft', { shouldDirty: true })}
          />
        </div>
      </form>

      {/* ── Preview ─────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="label text-mute">Preview</p>
        <div className="mx-auto w-48">
          <GenericPosterArt color={previewColor} className="border border-line" />
        </div>
        <p className="t-help text-center">
          The logo-less SAISON stadium, recoloured. The crest slot fills in once the club joins.
        </p>
      </div>
    </div>
  )
}
