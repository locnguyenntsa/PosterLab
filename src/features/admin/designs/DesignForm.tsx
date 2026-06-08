import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImagePlus, Loader2, X } from 'lucide-react'
import type { PosterTemplate } from '@/types'
import { PosterArt } from '@/components/PosterArt'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { designSchema, STYLE_VALUES } from '@/features/admin/schemas'
import type { DesignFormValues } from '@/features/admin/schemas'
import { relativeTime } from '@/features/admin/format'
import { uploadImage } from '@/features/admin/upload'
import { useAdminStore } from '@/store/useAdminStore'
import { useCatalogStore, useTeams } from '@/store/useCatalogStore'
import { useToastStore } from '@/store/useToastStore'

const FORM_ID = 'design-form'

const styleLabel = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function DesignForm() {
  const designEdit = useAdminStore((s) => s.designEdit)
  const close = useAdminStore((s) => s.closeDesign)
  const open = designEdit !== null
  const isNew = designEdit === 'new'

  return (
    <Dialog
      open={open}
      onClose={close}
      size="lg"
      title={isNew ? 'New design' : 'Edit design'}
      footer={
        open ? (
          <>
            <Button variant="outline" size="sm" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" form={FORM_ID} size="sm">
              {isNew ? 'Create design' : 'Save design'}
            </Button>
          </>
        ) : undefined
      }
    >
      {open && <DesignFormBody key={designEdit} id={designEdit} />}
    </Dialog>
  )
}

function DesignFormBody({ id }: { id: string | 'new' }) {
  const isNew = id === 'new'
  const existing = useCatalogStore((s) =>
    isNew ? undefined : s.designs.find((d) => d.id === id),
  )
  const teams = useTeams()
  const sampleClub = teams[0]
  const addDesign = useCatalogStore((s) => s.addDesign)
  const updateDesign = useCatalogStore((s) => s.updateDesign)
  const close = useAdminStore((s) => s.closeDesign)
  const push = useToastStore((s) => s.push)

  const [note, setNote] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DesignFormValues>({
    resolver: zodResolver(designSchema),
    mode: 'onBlur',
    defaultValues: existing
      ? {
          name: existing.name,
          style: existing.style,
          description: existing.description,
          universal: existing.universal ?? true,
          status: existing.status ?? 'live',
          thumbnailUrl: existing.thumbnailUrl,
        }
      : {
          name: '',
          style: 'spotlight',
          description: '',
          universal: true,
          status: 'draft',
          thumbnailUrl: undefined,
        },
  })

  const values = watch()
  const draft: PosterTemplate = {
    id: existing?.id ?? 'preview',
    name: values.name || 'Untitled',
    style: values.style,
    description: values.description,
    universal: values.universal,
  }

  const onSubmit = (v: DesignFormValues) => {
    if (isNew) {
      addDesign(v)
      push('Design created')
    } else {
      updateDesign(id, v, note)
      push('Design saved')
    }
    close()
  }

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setValue('thumbnailUrl', url, { shouldDirty: true })
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* ── Form ───────────────────────────────────────── */}
      <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Name" error={errors.name?.message} htmlFor="design-name">
          <Input id="design-name" placeholder="Spotlight" aria-invalid={!!errors.name} {...register('name')} />
        </Field>

        <Field label="Style" error={errors.style?.message} htmlFor="design-style">
          <Select
            id="design-style"
            aria-invalid={!!errors.style}
            value={values.style}
            onChange={(v) =>
              setValue('style', v as DesignFormValues['style'], {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            options={STYLE_VALUES.map((s) => ({ value: s, label: styleLabel(s) }))}
          />
        </Field>

        <Field
          label="Description"
          error={errors.description?.message}
          htmlFor="design-desc"
          hint={`${values.description?.length ?? 0}/160`}
        >
          <Textarea
            id="design-desc"
            rows={3}
            placeholder="Dramatic single-subject spotlight with a bold name banner."
            aria-invalid={!!errors.description}
            {...register('description')}
          />
        </Field>

        <div className="flex items-center justify-between border-t border-line pt-4">
          <div className="space-y-1.5">
            <p className="label text-cream">Live</p>
            <p className="t-help">Visible to guests in the tunnel</p>
          </div>
          <Switch
            aria-label="Live"
            checked={values.status === 'live'}
            onCheckedChange={(v) => setValue('status', v ? 'live' : 'draft', { shouldDirty: true })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <p className="label text-cream">Universal</p>
            <p className="t-help">Available for every team</p>
          </div>
          <Switch
            aria-label="Universal"
            checked={values.universal}
            onCheckedChange={(v) => setValue('universal', v, { shouldDirty: true })}
          />
        </div>

        {!isNew && (
          <Field label="Change note (optional)" htmlFor="design-note">
            <Input
              id="design-note"
              placeholder="e.g. Reworded the description"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Field>
        )}
      </form>

      {/* ── Preview + artwork + history ─────────────────── */}
      <div className="space-y-5">
        <div>
          <p className="mb-2 label text-mute">Preview</p>
          {sampleClub ? (
            <div className="mx-auto w-48">
              <PosterArt club={sampleClub} template={draft} image={values.thumbnailUrl} />
            </div>
          ) : (
            <p className="t-body">Add a team first to preview designs.</p>
          )}
        </div>

        <div className="space-y-2">
          <p className="label text-mute">Artwork</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" strokeWidth={1.5} />}
              {values.thumbnailUrl ? 'Replace image' : 'Upload image'}
            </Button>
            {values.thumbnailUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setValue('thumbnailUrl', undefined, { shouldDirty: true })}
              >
                <X className="size-4" strokeWidth={1.5} />
                Use generated art
              </Button>
            )}
          </div>
          <p className="t-help">Optional. Replaces the generated preview with your image.</p>
        </div>

        {!isNew && existing?.history && existing.history.length > 0 && (
          <div className="space-y-2 border-t border-line pt-4">
            <p className="label text-mute">Version history</p>
            <ul className="space-y-1.5">
              {existing.history.map((h) => (
                <li key={h.version} className="flex items-baseline justify-between gap-3">
                  <span className="label text-cream">
                    v{h.version} · {h.label}
                  </span>
                  <span className="t-meta text-mute">{relativeTime(h.at)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
