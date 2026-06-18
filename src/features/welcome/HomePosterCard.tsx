import { PosterTiltCard } from '@/components/PosterTiltCard'
import { PosterArt } from '@/components/PosterArt'
import type { Club, PosterTemplate } from '@/types'

interface Props {
  club: Club
  template: PosterTemplate
  image?: string
}

/* Home showcase poster card — the flashy tilt/glare chrome around CSS PosterArt. */
export function HomePosterCard({ club, template, image }: Props) {
  return (
    <PosterTiltCard>
      <PosterArt club={club} template={template} image={image} />
    </PosterTiltCard>
  )
}
