import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImagePlus, Loader2, X } from 'lucide-react'
import type { Club, PosterTemplate } from '@/types'
import { BRAND } from '@/lib/brand'
import { cn, isDarkColor } from '@/lib/utils'
import { deepTeamColors } from '@/lib/color'
import { PosterArt } from '@/components/PosterArt'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { DIGITAL_PRICE_EUR, PRINTED_PRICE_EUR, PACK_PRICE_EUR } from '@/types'
import { teamSchema } from '@/features/admin/schemas'
import type { TeamFormValues } from '@/features/admin/schemas'
import { uploadImage } from '@/features/admin/upload'
import { SPORTS } from '@/data/sports'
import { shopConfigForClub } from '@/data/shopConfig'
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

/**
 * Default form values for the optional Pro Shop override fields.
 *
 * For an EXISTING club the Storefront copy fields are pre-filled with the copy
 * the Pro Shop hero actually renders — the club's own overrides overlaid on the
 * static/default storefront config (accent + badge fall back to the club primary
 * and `My <code> Poster`, matching the homepage). So the admin edits real
 * content, not blank inputs. Pricing is likewise pre-filled with the effective
 * base price the storefront charges (the club override, or the catalog default).
 * A NEW team leaves them all blank → the placeholders show the defaults.
 */
function proShopDefaults(c?: Club) {
  const cfg = c ? shopConfigForClub(c) : undefined
  return {
    eventDesignId: c?.eventDesignId ?? '',
    prices: {
      digital: c ? String(c.prices?.digital ?? DIGITAL_PRICE_EUR) : '',
      printed: c ? String(c.prices?.printed ?? PRINTED_PRICE_EUR) : '',
      pack: c ? String(c.prices?.pack ?? PACK_PRICE_EUR) : '',
    },
    heroTitleTop: cfg?.titleTop ?? '',
    heroHighlight: cfg?.titleBottom ?? '',
    heroDescription: cfg?.description ?? '',
    badgeTitle: cfg ? (cfg.badgeTitle ?? `My ${c!.shortCode} Poster`) : '',
    accent: cfg ? (cfg.accent ?? c!.colors.primary) : '',
    backdropUrl: c?.backdropUrl,
  }
}

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
  const [backdropUploading, setBackdropUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const logoRef = useRef<HTMLInputElement>(null)
  const backdropRef = useRef<HTMLInputElement>(null)

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
          ...proShopDefaults(existing),
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
          ...proShopDefaults(),
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

  const onPickBackdrop = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBackdropUploading(true)
    try {
      // A storefront hero wants more pixels than a crest — allow a wider edge.
      const url = await uploadImage(file, 1600)
      setValue('backdropUrl', url, { shouldDirty: true })
    } finally {
      setBackdropUploading(false)
      if (backdropRef.current) backdropRef.current.value = ''
    }
  }

  return (
    <div className="grid gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
      {/* ── Form: team details (left column, scrolls) ────── */}
      <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className="space-y-7" noValidate>
        <Section title="Identity" first>
          <Field label="Team name" error={errors.name?.message} htmlFor="team-name">
            <Input id="team-name" placeholder="Paris FC" aria-invalid={!!errors.name} {...register('name')} />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        </Section>

        {/* A club holds a CLASSIC design plus an optional EVENT design. The event
            design is surfaced in the Pro Shop only during an event window. A
            "Coming Soon" club has no design yet, so the pickers are disabled. */}
        <Section title="Designs">
          <Field
            label="Classic design"
            error={errors.designId?.message}
            htmlFor="team-design"
            hint={values.partner ? 'Everyday Pro Shop design' : 'Partners only'}
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

          <Field
            label="Event design"
            htmlFor="team-event-design"
            hint={values.partner ? 'Shown during an event window' : 'Partners only'}
          >
            <Select
              id="team-event-design"
              disabled={!values.partner}
              value={values.eventDesignId ?? ''}
              onChange={(v) => setValue('eventDesignId', v, { shouldDirty: true })}
              options={[
                { value: '', label: '— None —' },
                ...liveOptions.map((d) => ({ value: d.id, label: d.name })),
              ]}
            />
          </Field>
        </Section>

        <Section title="Team colours">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        </Section>

        {/* Partner = fulfillable (has a ready design). Off → tagged "Coming Soon"
            in the tunnel and routed to the "not listed" flow. */}
        <Section title="Visibility">
          <div className="divide-y divide-line">
            <ToggleRow
              label="Partner club"
              hint="Off shows it as “Coming Soon” in the tunnel"
              checked={values.partner}
              onChange={(v) => setValue('partner', v, { shouldDirty: true })}
            />
            <ToggleRow
              label="Live"
              hint="Active in the catalogue"
              checked={values.status === 'live'}
              onChange={(v) => setValue('status', v ? 'live' : 'draft', { shouldDirty: true })}
            />
          </div>
        </Section>

        {/* ── Pro Shop offer pricing (optional per-club overrides) ── */}
        <Section
          title="Pro Shop pricing"
          hint="Base price (30×40); larger sizes add the standard size difference. Blank = catalog default."
        >
          <div className="grid grid-cols-3 gap-3">
            <Field label="Digital €" error={errors.prices?.digital?.message} htmlFor="price-digital">
              <Input
                id="price-digital"
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                placeholder={String(DIGITAL_PRICE_EUR)}
                {...register('prices.digital')}
              />
            </Field>
            <Field label="Printed €" error={errors.prices?.printed?.message} htmlFor="price-printed">
              <Input
                id="price-printed"
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                placeholder={String(PRINTED_PRICE_EUR)}
                {...register('prices.printed')}
              />
            </Field>
            <Field label="Pack €" error={errors.prices?.pack?.message} htmlFor="price-pack">
              <Input
                id="price-pack"
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                placeholder={String(PACK_PRICE_EUR)}
                {...register('prices.pack')}
              />
            </Field>
          </div>
        </Section>

        {/* ── Storefront text (optional Pro Shop landing copy overrides) ── */}
        <Section title="Storefront copy" hint="Overrides the Pro Shop hero copy. Blank = default.">
          {/* Live hero preview — the background tracks the real Pro Shop hero
              (the team's primary colour, or the backdrop photo); the highlight
              line renders in the accent colour, falling back to the title colour
              when the accent is too dark to read on the hero. */}
          <HeroPreview
            top={values.heroTitleTop || 'Your Face.'}
            highlight={values.heroHighlight || 'Their Colors.'}
            accent={
              isHex(values.accent ?? '')
                ? (values.accent as string)
                : isHex(values.colors.primary)
                  ? values.colors.primary
                  : BRAND.primary
            }
            primary={values.colors.primary}
            backdropUrl={values.backdropUrl}
          />

          <Field label="Hero title — top line" error={errors.heroTitleTop?.message} htmlFor="hero-top">
            <Input id="hero-top" placeholder="Your Face." {...register('heroTitleTop')} />
          </Field>
          <Field
            label="Highlight line (shown in accent colour)"
            error={errors.heroHighlight?.message}
            htmlFor="hero-highlight"
          >
            <Input id="hero-highlight" placeholder="Their Green." {...register('heroHighlight')} />
          </Field>
          <Field label="Description" error={errors.heroDescription?.message} htmlFor="hero-desc">
            <Input
              id="hero-desc"
              placeholder="Drop one photo. Join the team in seconds."
              {...register('heroDescription')}
            />
          </Field>
          <Field label="Badge title" error={errors.badgeTitle?.message} htmlFor="hero-badge">
            <Input
              id="hero-badge"
              placeholder={`My ${(values.shortCode || 'CLUB').toUpperCase()} Poster`}
              {...register('badgeTitle')}
            />
          </Field>
          <ColorField
            label="Accent colour"
            value={values.accent ?? ''}
            error={errors.accent?.message}
            onChange={(v) => setValue('accent', v, { shouldValidate: true, shouldDirty: true })}
          />
        </Section>
      </form>

      {/* ── Live preview + media (right column, sticks while scrolling) ── */}
      <aside className="space-y-6 lg:sticky lg:top-2 lg:self-start">
        <div className="space-y-2">
          <p className="label text-mute">Preview</p>
          <div className="mx-auto w-full max-w-[15rem] lg:max-w-none">
            <PosterArt club={draftClub} template={sampleTemplate} />
          </div>
        </div>

        <MediaField
          label="Club logo"
          hint="Shown in the poster’s crest slot. A transparent PNG works best."
          uploading={logoUploading}
          hasValue={!!values.logoUrl}
          uploadLabel={values.logoUrl ? 'Replace logo' : 'Upload logo'}
          onUploadClick={() => logoRef.current?.click()}
          onRemove={() => setValue('logoUrl', undefined, { shouldDirty: true })}
          preview={
            values.logoUrl ? (
              <div className="size-16 shrink-0 border border-line bg-ink p-1">
                <img src={values.logoUrl} alt="" className="size-full object-contain" />
              </div>
            ) : (
              <div className="grid size-16 shrink-0 place-items-center border border-dashed border-line text-mute">
                <ImagePlus className="size-5" strokeWidth={1.5} />
              </div>
            )
          }
        >
          <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={onPickLogo} />
        </MediaField>

        <MediaField
          label="Storefront backdrop"
          hint="Full-bleed photo behind the Pro Shop hero."
          uploading={backdropUploading}
          hasValue={!!values.backdropUrl}
          uploadLabel={values.backdropUrl ? 'Replace photo' : 'Upload photo'}
          onUploadClick={() => backdropRef.current?.click()}
          onRemove={() => setValue('backdropUrl', undefined, { shouldDirty: true })}
          preview={
            values.backdropUrl ? (
              <div className="h-16 w-24 shrink-0 overflow-hidden border border-line bg-ink">
                <img src={values.backdropUrl} alt="" className="size-full object-cover" />
              </div>
            ) : (
              <div className="grid h-16 w-24 shrink-0 place-items-center border border-dashed border-line text-mute">
                <ImagePlus className="size-5" strokeWidth={1.5} />
              </div>
            )
          }
        >
          <input ref={backdropRef} type="file" accept="image/*" className="hidden" onChange={onPickBackdrop} />
        </MediaField>

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
      </aside>
    </div>
  )
}

/* The mini Pro Shop hero shown in the Storefront copy section. Its background
   mirrors the real storefront: the team's primary colour (deepened the same way
   teamTheme tints the live shop) or the full-bleed backdrop photo — so it tracks
   the club's branding instead of a fixed black box. The top line uses the title
   colour; the highlight line uses the club's accent, falling back to the title
   colour when the accent is too dark to read on the hero. */
function HeroPreview({
  top,
  highlight,
  accent,
  primary,
  backdropUrl,
}: {
  top: string
  highlight: string
  accent: string
  primary: string
  backdropUrl?: string
}) {
  const bg = isHex(primary) ? deepTeamColors(primary).primary : BRAND.primary
  const dim = isDarkColor(accent)
  return (
    <div
      className="relative overflow-hidden border border-line p-4 text-center"
      style={{ background: bg }}
    >
      {backdropUrl && (
        <>
          <img src={backdropUrl} alt="" className="absolute inset-0 size-full object-cover" />
          <div aria-hidden className="absolute inset-0 bg-ink/55" />
        </>
      )}
      <div className="relative">
        <p className="font-display text-2xl uppercase leading-tight text-on-dark">{top}</p>
        <p
          className={cn('font-display text-2xl uppercase leading-tight', dim && 'text-on-dark')}
          style={dim ? undefined : { color: accent }}
        >
          {highlight}
        </p>
      </div>
    </div>
  )
}

/* A titled form group — a Bebas section header (plus optional helper line) over a
   hairline divider, so the long team form reads as a few scannable blocks. */
function Section({
  title,
  hint,
  first,
  children,
}: {
  title: string
  hint?: string
  first?: boolean
  children: React.ReactNode
}) {
  return (
    <section className={cn('space-y-4', !first && 'border-t border-line pt-6')}>
      <div className="space-y-1">
        <h3 className="font-display text-2xl leading-none text-cream">{title}</h3>
        {hint && <p className="t-help">{hint}</p>}
      </div>
      {children}
    </section>
  )
}

/* A labelled setting row with a description and a Switch (Partner / Live). */
function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-cream">{label}</p>
        <p className="t-help">{hint}</p>
      </div>
      <Switch aria-label={label} checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

/* Image upload row: a thumbnail / dashed placeholder, an upload (and optional
   remove) button, and a helper line. Shared by the logo + backdrop fields. The
   hidden <input type="file"> is passed as children. */
function MediaField({
  label,
  hint,
  preview,
  uploading,
  hasValue,
  uploadLabel,
  onUploadClick,
  onRemove,
  children,
}: {
  label: string
  hint: string
  preview: React.ReactNode
  uploading: boolean
  hasValue: boolean
  uploadLabel: string
  onUploadClick: () => void
  onRemove: () => void
  children?: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <p className="label text-mute">{label}</p>
      {children}
      <div className="flex items-center gap-3">
        {preview}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={onUploadClick}>
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ImagePlus className="size-4" strokeWidth={1.5} />
            )}
            {uploadLabel}
          </Button>
          {hasValue && (
            <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
              <X className="size-4" strokeWidth={1.5} />
              Remove
            </Button>
          )}
        </div>
      </div>
      <p className="t-help">{hint}</p>
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
