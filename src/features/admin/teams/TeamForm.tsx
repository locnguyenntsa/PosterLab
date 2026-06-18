import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImagePlus, Loader2, X } from 'lucide-react'
import type { Club, PosterTemplate } from '@/types'
import { BRAND } from '@/lib/brand'
import { PosterArt } from '@/components/PosterArt'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { teamSchema } from '@/features/admin/schemas'
import type { TeamFormValues } from '@/features/admin/schemas'
import { uploadImage } from '@/features/admin/upload'
import { SPORTS } from '@/data/sports'
import { useAdminStore } from '@/store/useAdminStore'
import { useCatalogStore, useDesigns, liveDesigns } from '@/store/useCatalogStore'
import { useToastStore } from '@/store/useToastStore'

const FORM_ID = 'team-form'

const FALLBACK_TEMPLATE: PosterTemplate = {
  id: 'spotlight',
  name: 'Spotlight',
  style: 'spotlight',
  description: '',
  universal: true,
}

const isHex = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v)

export function TeamForm() {
  const teamEdit = useAdminStore((s) => s.teamEdit)
  const close = useAdminStore((s) => s.closeTeam)
  const open = teamEdit !== null
  const isNew = teamEdit === 'new'

  return (
    <Dialog
      open={open}
      onClose={close}
      size="lg"
      title={isNew ? 'New team' : 'Edit team'}
      footer={
        open ? (
          <>
            <Button variant="outline" size="sm" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" form={FORM_ID} size="sm">
              {isNew ? 'Create team' : 'Save team'}
            </Button>
          </>
        ) : undefined
      }
    >
      {open && <TeamFormBody key={teamEdit} id={teamEdit} />}
    </Dialog>
  )
}

function TeamFormBody({ id }: { id: string | 'new' }) {
  const isNew = id === 'new'
  const existing = useCatalogStore((s) => (isNew ? undefined : s.teams.find((c) => c.id === id)))
  const designs = useDesigns()
  const liveOptions = liveDesigns(designs)
  const addTeam = useCatalogStore((s) => s.addTeam)
  const updateTeam = useCatalogStore((s) => s.updateTeam)
  const close = useAdminStore((s) => s.closeTeam)
  const push = useToastStore((s) => s.push)

  const [uploading, setUploading] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const logoRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    mode: 'onBlur',
    defaultValues: existing
      ? {
          name: existing.name,
          sportId: existing.sportId,
          city: existing.city,
          shortCode: existing.shortCode,
          colors: { primary: existing.colors.primary, secondary: existing.colors.secondary },
          status: existing.status ?? 'live',
          partner: existing.partner !== false,
          designId: existing.designId ?? liveOptions[0]?.id ?? '',
          posters: existing.posters ?? [],
          logoUrl: existing.logoUrl,
        }
      : {
          name: '',
          sportId: SPORTS[0]?.id ?? '',
          city: '',
          shortCode: '',
          colors: { primary: BRAND.primary, secondary: BRAND.secondary },
          status: 'live',
          partner: true,
          designId: liveOptions[0]?.id ?? '',
          posters: [],
          logoUrl: undefined,
        },
  })

  const values = watch()
  const posters = values.posters ?? []
  // Preview reflects the chosen design so the admin sees what the club will ship.
  const sampleTemplate =
    liveOptions.find((d) => d.id === values.designId) ?? liveOptions[0] ?? FALLBACK_TEMPLATE

  const draftClub: Club = {
    id: existing?.id ?? 'preview',
    sportId: values.sportId,
    name: values.name || 'Your Team',
    city: values.city,
    shortCode: (values.shortCode || 'TBD').toUpperCase(),
    colors: {
      primary: isHex(values.colors.primary) ? values.colors.primary : BRAND.primary,
      secondary: isHex(values.colors.secondary) ? values.colors.secondary : BRAND.secondary,
    },
    logoUrl: values.logoUrl,
    posters,
  }

  const onSubmit = (v: TeamFormValues) => {
    if (isNew) {
      addTeam(v)
      push('Team created')
    } else {
      updateTeam(id, v)
      push('Team saved')
    }
    close()
  }

  const onPickPosters = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setUploading(true)
    try {
      const urls = await Promise.all(files.map((f) => uploadImage(f)))
      setValue('posters', [...posters, ...urls], { shouldDirty: true })
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const removePoster = (index: number) =>
    setValue(
      'posters',
      posters.filter((_, i) => i !== index),
      { shouldDirty: true },
    )

  const onPickLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoUploading(true)
    try {
      const url = await uploadImage(file)
      setValue('logoUrl', url, { shouldDirty: true })
    } finally {
      setLogoUploading(false)
      if (logoRef.current) logoRef.current.value = ''
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* ── Form ───────────────────────────────────────── */}
      <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Team name" error={errors.name?.message} htmlFor="team-name">
          <Input id="team-name" placeholder="Paris FC" aria-invalid={!!errors.name} {...register('name')} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="City" error={errors.city?.message} htmlFor="team-city">
            <Input id="team-city" placeholder="Paris" aria-invalid={!!errors.city} {...register('city')} />
          </Field>
          <Field label="Short code" error={errors.shortCode?.message} htmlFor="team-code">
            <Input
              id="team-code"
              placeholder="PFC"
              maxLength={5}
              aria-invalid={!!errors.shortCode}
              className="uppercase"
              {...register('shortCode')}
            />
          </Field>
        </div>

        <Field label="Sport" error={errors.sportId?.message} htmlFor="team-sport">
          <Select
            id="team-sport"
            aria-invalid={!!errors.sportId}
            value={values.sportId}
            onChange={(v) => setValue('sportId', v, { shouldDirty: true, shouldValidate: true })}
            options={SPORTS.map((s) => ({ value: s.id, label: s.name }))}
          />
        </Field>

        {/* One design = one club (slide 7 / slide 12). The guest tunnel shows
            exactly this design for the club — no style picker. A "Coming Soon"
            club has no design yet, so the picker is disabled until it's a partner. */}
        <Field
          label="Design"
          error={errors.designId?.message}
          htmlFor="team-design"
          hint={values.partner ? 'Used in the club’s Pro Shop' : 'Partners only'}
        >
          <Select
            id="team-design"
            disabled={!values.partner}
            aria-invalid={!!errors.designId}
            value={values.designId}
            onChange={(v) => setValue('designId', v, { shouldDirty: true, shouldValidate: true })}
            options={liveOptions.map((d) => ({ value: d.id, label: d.name }))}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <ColorField
            label="Primary color"
            value={values.colors.primary}
            error={errors.colors?.primary?.message}
            onChange={(v) => setValue('colors.primary', v, { shouldValidate: true, shouldDirty: true })}
          />
          <ColorField
            label="Secondary color"
            value={values.colors.secondary}
            error={errors.colors?.secondary?.message}
            onChange={(v) => setValue('colors.secondary', v, { shouldValidate: true, shouldDirty: true })}
          />
        </div>

        {/* Partner = fulfillable (has a ready design). Off → tagged "Coming Soon"
            in the tunnel and routed to the "not listed" flow. */}
        <div className="flex items-center justify-between border-t border-line pt-4">
          <div className="space-y-1.5">
            <p className="label text-cream">Partner club</p>
            <p className="t-help">Off shows it as “Coming Soon” in the tunnel</p>
          </div>
          <Switch
            aria-label="Partner club"
            checked={values.partner}
            onCheckedChange={(v) => setValue('partner', v, { shouldDirty: true })}
          />
        </div>

        <div className="flex items-center justify-between border-t border-line pt-4">
          <div className="space-y-1.5">
            <p className="label text-cream">Live</p>
            <p className="t-help">Active in the catalogue</p>
          </div>
          <Switch
            aria-label="Live"
            checked={values.status === 'live'}
            onCheckedChange={(v) => setValue('status', v ? 'live' : 'draft', { shouldDirty: true })}
          />
        </div>
      </form>

      {/* ── Preview + sample posters ────────────────────── */}
      <div className="space-y-5">
        <div>
          <p className="mb-2 label text-mute">Preview</p>
          <div className="mx-auto w-48">
            <PosterArt club={draftClub} template={sampleTemplate} />
          </div>
        </div>

        <div className="space-y-2">
          <p className="label text-mute">Club logo</p>
          <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={onPickLogo} />
          <div className="flex items-center gap-3">
            {values.logoUrl ? (
              <div className="size-16 shrink-0 border border-line bg-ink p-1">
                <img src={values.logoUrl} alt="" className="size-full object-contain" />
              </div>
            ) : (
              <div className="grid size-16 shrink-0 place-items-center border border-dashed border-line text-mute">
                <ImagePlus className="size-5" strokeWidth={1.5} />
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={logoUploading}
                onClick={() => logoRef.current?.click()}
              >
                {logoUploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" strokeWidth={1.5} />}
                {values.logoUrl ? 'Replace logo' : 'Upload logo'}
              </Button>
              {values.logoUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setValue('logoUrl', undefined, { shouldDirty: true })}
                >
                  <X className="size-4" strokeWidth={1.5} />
                  Remove
                </Button>
              )}
            </div>
          </div>
          <p className="t-help">Shown in the poster’s crest slot. A transparent PNG works best.</p>
        </div>

        <div className="space-y-2">
          <p className="label text-mute">Sample posters</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onPickPosters}
          />
          {posters.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {posters.map((src, i) => (
                <div key={`${src}-${i}`} className="group relative aspect-[3/4] border border-line bg-ink">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePoster(i)}
                    aria-label="Remove poster"
                    className="absolute right-1 top-1 grid size-6 place-items-center bg-ink/80 text-on-dark opacity-0 transition-opacity hover:bg-danger group-hover:opacity-100"
                  >
                    <X className="size-3.5" strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" strokeWidth={1.5} />}
            Add posters
          </Button>
          <p className="t-help">Optional real poster images shown on hover in the tunnel.</p>
        </div>
      </div>
    </div>
  )
}

function ColorField({
  label,
  value,
  onChange,
  error,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
}) {
  return (
    <Field label={label} error={error}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} swatch`}
          value={isHex(value) ? value : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="size-12 shrink-0 cursor-pointer border border-line bg-[var(--c-field)] p-1 [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={BRAND.primary}
          aria-invalid={!!error}
        />
      </div>
    </Field>
  )
}
