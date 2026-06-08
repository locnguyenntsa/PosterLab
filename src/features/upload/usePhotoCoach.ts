import { useCallback, useState } from 'react'
import type { CoachCheck, CoachResult } from '@/types'

/**
 * In-browser "Photo Coach". All analysis runs locally on a canvas — no upload,
 * no network. Returns specific, human-readable findings (not generic errors).
 *
 *  - resolution : image dimensions vs print-quality thresholds
 *  - brightness : average luminance (0.299R + 0.587G + 0.114B)
 *  - blur       : variance of the Laplacian over a grayscale downscale
 *  - face       : native FaceDetector API when available (skipped otherwise)
 */

// Downscale long edge to this for consistent, fast analysis.
const ANALYSIS_EDGE = 320

function drawToCanvas(img: HTMLImageElement): {
  ctx: CanvasRenderingContext2D
  w: number
  h: number
} | null {
  const scale = Math.min(1, ANALYSIS_EDGE / Math.max(img.naturalWidth, img.naturalHeight))
  const w = Math.max(1, Math.round(img.naturalWidth * scale))
  const h = Math.max(1, Math.round(img.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.drawImage(img, 0, 0, w, h)
  return { ctx, w, h }
}

function checkResolution(img: HTMLImageElement): CoachCheck {
  const min = Math.min(img.naturalWidth, img.naturalHeight)
  if (min < 500) {
    return {
      id: 'resolution',
      label: 'Resolution',
      status: 'fail',
      message: 'Low resolution — use a larger, sharper photo for a clean print.',
    }
  }
  if (min < 900) {
    return {
      id: 'resolution',
      label: 'Resolution',
      status: 'warn',
      message: 'Resolution is a bit low. A larger photo will print sharper.',
    }
  }
  return {
    id: 'resolution',
    label: 'Resolution',
    status: 'pass',
    message: `Great resolution (${img.naturalWidth}×${img.naturalHeight}).`,
  }
}

function checkBrightness(ctx: CanvasRenderingContext2D, w: number, h: number): CoachCheck {
  const { data } = ctx.getImageData(0, 0, w, h)
  let total = 0
  const px = data.length / 4
  for (let i = 0; i < data.length; i += 4) {
    total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
  }
  const avg = total / px // 0–255

  if (avg < 45) {
    return { id: 'brightness', label: 'Lighting', status: 'fail', message: 'Photo too dark — try better lighting or a brighter shot.' }
  }
  if (avg > 225) {
    return { id: 'brightness', label: 'Lighting', status: 'fail', message: 'Photo too bright — it looks overexposed.' }
  }
  if (avg < 75) {
    return { id: 'brightness', label: 'Lighting', status: 'warn', message: 'A little dark — more light would help.' }
  }
  if (avg > 205) {
    return { id: 'brightness', label: 'Lighting', status: 'warn', message: 'A little bright — watch for washed-out highlights.' }
  }
  return { id: 'brightness', label: 'Lighting', status: 'pass', message: 'Well-lit and balanced.' }
}

function checkBlur(ctx: CanvasRenderingContext2D, w: number, h: number): CoachCheck {
  const { data } = ctx.getImageData(0, 0, w, h)
  // Grayscale buffer
  const gray = new Float64Array(w * h)
  for (let i = 0; i < w * h; i++) {
    const o = i * 4
    gray[i] = 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2]
  }
  // Laplacian kernel response, accumulate variance
  let sum = 0
  let sumSq = 0
  let count = 0
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x
      const lap =
        gray[i - 1] + gray[i + 1] + gray[i - w] + gray[i + w] - 4 * gray[i]
      sum += lap
      sumSq += lap * lap
      count++
    }
  }
  if (count === 0) {
    return { id: 'blur', label: 'Sharpness', status: 'skipped', message: 'Could not assess sharpness.' }
  }
  const mean = sum / count
  const variance = sumSq / count - mean * mean

  if (variance < 60) {
    return { id: 'blur', label: 'Sharpness', status: 'fail', message: 'Image too blurry — hold steady and refocus.' }
  }
  if (variance < 150) {
    return { id: 'blur', label: 'Sharpness', status: 'warn', message: 'Slightly soft — a sharper photo would look crisper.' }
  }
  return { id: 'blur', label: 'Sharpness', status: 'pass', message: 'Nice and sharp.' }
}

async function checkFace(img: HTMLImageElement): Promise<CoachCheck> {
  const FaceDetectorCtor = (window as unknown as {
    FaceDetector?: new (opts?: { fastMode?: boolean; maxDetectedFaces?: number }) => {
      detect: (src: CanvasImageSource) => Promise<unknown[]>
    }
  }).FaceDetector

  if (!FaceDetectorCtor) {
    // Not supported (most Safari/Firefox) — skip rather than false-fail.
    return {
      id: 'face',
      label: 'Face',
      status: 'skipped',
      message: 'Face check unavailable on this browser — make sure your face is clearly visible.',
    }
  }
  try {
    const detector = new FaceDetectorCtor({ fastMode: true, maxDetectedFaces: 5 })
    const faces = await detector.detect(img)
    if (faces.length === 0) {
      return { id: 'face', label: 'Face', status: 'fail', message: 'Face not detected — make sure your face is centered and visible.' }
    }
    if (faces.length > 1) {
      return { id: 'face', label: 'Face', status: 'warn', message: `${faces.length} faces detected — a solo photo works best.` }
    }
    return { id: 'face', label: 'Face', status: 'pass', message: 'Face detected and clear.' }
  } catch {
    return { id: 'face', label: 'Face', status: 'skipped', message: 'Could not run the face check — ensure your face is clearly visible.' }
  }
}

export async function analyzePhoto(img: HTMLImageElement): Promise<CoachResult> {
  const checks: CoachCheck[] = []
  checks.push(checkResolution(img))

  const drawn = drawToCanvas(img)
  if (drawn) {
    checks.push(checkBrightness(drawn.ctx, drawn.w, drawn.h))
    checks.push(checkBlur(drawn.ctx, drawn.w, drawn.h))
  }
  checks.push(await checkFace(img))

  const hasFailure = checks.some((c) => c.status === 'fail')
  return { checks, passed: !hasFailure, hasFailure }
}

/** Hook wrapper: loads a File into an <img>, runs analysis, exposes state. */
export function usePhotoCoach() {
  const [analyzing, setAnalyzing] = useState(false)

  const run = useCallback(
    (file: File): Promise<{ url: string; result: CoachResult }> => {
      setAnalyzing(true)
      return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file)
        const img = new Image()
        img.onload = async () => {
          try {
            const result = await analyzePhoto(img)
            resolve({ url, result })
          } catch (err) {
            reject(err)
          } finally {
            setAnalyzing(false)
          }
        }
        img.onerror = () => {
          setAnalyzing(false)
          URL.revokeObjectURL(url)
          reject(new Error('Could not read this image.'))
        }
        img.src = url
      })
    },
    [],
  )

  return { analyzing, run }
}
