import type { PosterTemplate } from '@/types'

/**
 * Poster templates. All are "universal" in the prototype so every club has a
 * full grid to choose from. `style` drives the composite rendering in
 * features/generate/posterComposite.ts.
 */
export const TEMPLATES: PosterTemplate[] = [
  {
    id: 'spotlight',
    name: 'Spotlight',
    style: 'spotlight',
    description: 'Dramatic single-subject spotlight with a bold name banner.',
    universal: true,
  },
  {
    id: 'stadium',
    name: 'Stadium Night',
    style: 'stadium',
    description: 'Floodlit stadium atmosphere with stacked club colors.',
    universal: true,
  },
  {
    id: 'retro',
    name: 'Retro Print',
    style: 'retro',
    description: 'Vintage matchday print with halftone texture.',
    universal: true,
  },
  {
    id: 'minimal',
    name: 'Minimal Pro',
    style: 'minimal',
    description: 'Clean, modern layout that lets the photo lead.',
    universal: true,
  },
]

export function getTemplate(id: string | null): PosterTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id)
}
