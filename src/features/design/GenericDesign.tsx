import { ArrowRight, Plus } from 'lucide-react'
import { StepScreen } from '@/components/StepScreen'
import { GenericPosterArt } from '@/components/GenericPosterArt'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useFlowStore } from '@/store/useFlowStore'
import { PRESET_COLORS, DEFAULT_GENERIC_COLOR } from '@/data/generic'

/*
  The non-partner "generic design" (€14.99): the "SAISON" stadium template (Figma
  node 112-978), recolored to the colors of the user's choice. One fixed template;
  the color is the variation. Pick a jersey color (presets + a custom swatch) and
  watch the stadium preview recolor live, then continue into the builder (photo →
  render → checkout). The photo fills the dashed oval; the logo slot stays empty
  until the club registers.
*/
export function GenericDesign() {
  const genericColor = useFlowStore((s) => s.genericColor)
  const setGenericColor = useFlowStore((s) => s.setGenericColor)
  const next = useFlowStore((s) => s.next)

  const color = genericColor ?? DEFAULT_GENERIC_COLOR
  const isCustom = !PRESET_COLORS.some((c) => c.value.toLowerCase() === color.toLowerCase())

  return (
    <StepScreen
      step={1}
      kicker="Generic Design"
      title="Make It Your Colors"
      subtitle="Your colors · the logo slot fills in when your club joins · €14.99"
      footer={
        <Button className="w-full" size="lg" onClick={next}>
          Add Photo
          <ArrowRight className="size-5" strokeWidth={1.5} />
        </Button>
      }
    >
      {/* Color picker — presets + a custom swatch */}
      <div className="mb-8">
        <p className="mb-3 label-wide text-mute">Pick your color</p>
        <div className="flex flex-wrap items-center gap-3">
          {PRESET_COLORS.map((c) => {
            const selected = color.toLowerCase() === c.value.toLowerCase()
            return (
              <button
                key={c.value}
                type="button"
                aria-label={c.name}
                title={c.name}
                onClick={() => setGenericColor(c.value)}
                className={cn(
                  'size-10 border transition-transform duration-100 hover:scale-105',
                  selected
                    ? 'border-cream outline outline-2 outline-offset-2 outline-accent'
                    : 'border-line',
                )}
                style={{ background: c.value }}
              />
            )
          })}
          {/* Custom color — a native picker behind a swatch tile */}
          <label
            title="Custom color"
            className={cn(
              'relative grid size-10 cursor-pointer place-items-center border border-line text-mute transition-colors hover:text-cream',
              isCustom && 'border-cream text-cream outline outline-2 outline-offset-2 outline-accent',
            )}
            style={isCustom ? { background: color } : undefined}
          >
            <Plus className="size-4" strokeWidth={1.5} />
            <input
              type="color"
              value={color}
              onChange={(e) => setGenericColor(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Custom color"
            />
          </label>
        </div>
      </div>

      {/* Live stadium preview — recolors as the color changes */}
      <p className="mb-3 label-wide text-mute">Preview</p>
      <div className="mx-auto w-56 sm:w-64">
        <GenericPosterArt color={color} className="border border-line" />
      </div>

      <p className="mx-auto mt-5 max-w-sm text-center t-body text-sm text-mute">
        Add your photo next — it drops into the frame. The crest slot stays empty
        until your club joins Poster Lab.
      </p>
    </StepScreen>
  )
}
