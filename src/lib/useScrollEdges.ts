import { useEffect, useState } from 'react'

/*
  Tracks whether the page is resting against its top / bottom edge.
  Used to toggle the sticky header & footer drop shadows — the shadow shows
  only while content is sliding underneath them (i.e. NOT at that edge), so a
  short, non-scrolling page stays flat.
*/
export function useScrollEdges() {
  const [edges, setEdges] = useState({ atTop: true, atBottom: true })

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement
      const atTop = window.scrollY <= 1
      const atBottom =
        window.scrollY + window.innerHeight >= doc.scrollHeight - 1
      setEdges((prev) =>
        prev.atTop === atTop && prev.atBottom === atBottom
          ? prev
          : { atTop, atBottom },
      )
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    // Recompute when the page content grows/shrinks (step changes, images, etc.)
    const ro = new ResizeObserver(update)
    ro.observe(document.body)

    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      ro.disconnect()
    }
  }, [])

  return edges
}
