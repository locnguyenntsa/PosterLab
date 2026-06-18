import { useState, type PointerEvent, type ReactNode } from 'react'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'

/*
  Flashy 3D-tilt poster card chrome — a deliberate exception to the flat system:
  small radius, a soft realistic shadow that lifts on hover, a 3D tilt that
  FOLLOWS THE CURSOR, and a glare/sheen that tracks the mouse. Pointer-driven, so
  it stays inert on touch devices. Wraps any poster visual (the CSS PosterArt on
  the home hero, or a rendered <img> on the order-confirmed screen).
*/
export function PosterTiltCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const [hovered, setHovered] = useState(false)

  // Normalised cursor position over the card (0–1 on each axis).
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)

  // Tilt the card toward the cursor (springy for a natural feel).
  const rotateX = useSpring(useTransform(py, [0, 1], [11, -11]), {
    stiffness: 220,
    damping: 18,
  })
  const rotateY = useSpring(useTransform(px, [0, 1], [-11, 11]), {
    stiffness: 220,
    damping: 18,
  })

  // Glare follows the cursor across the card surface.
  const glareX = useTransform(px, (v) => `${v * 100}%`)
  const glareY = useTransform(py, (v) => `${v * 100}%`)
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.5), rgba(255,255,255,0) 45%)`

  function handleMove(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }
  function handleEnter(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'mouse') setHovered(true)
  }
  function handleLeave() {
    px.set(0.5)
    py.set(0.5)
    setHovered(false)
  }

  return (
    <div style={{ perspective: 900 }} className={className}>
      <motion.div
        onPointerMove={handleMove}
        onPointerEnter={handleEnter}
        onPointerLeave={handleLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        animate={{ scale: hovered ? 1.05 : 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 20 }}
        className="relative overflow-hidden rounded-[7px] border border-cream/15 shadow-[0_12px_28px_-12px_rgba(0,0,0,0.75)] transition-shadow duration-200 hover:shadow-[0_26px_60px_-14px_rgba(0,0,0,0.9)]"
      >
        {children}

        {/* Cursor-tracking glare */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-soft-light"
          style={{ background: glare }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />

        {/* Glossy inner rim */}
        <div className="pointer-events-none absolute inset-0 rounded-[7px] ring-1 ring-inset ring-white/10" />
      </motion.div>
    </div>
  )
}
