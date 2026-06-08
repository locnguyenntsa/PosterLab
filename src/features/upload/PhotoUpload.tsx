import { useRef, useState, type DragEvent } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ImagePlus, Loader2, RefreshCw, Camera, Sun, Smile } from 'lucide-react'
import { StepScreen } from '@/components/StepScreen'
import { Button } from '@/components/ui/button'
import { CoachFeedback } from '@/features/upload/CoachFeedback'
import { usePhotoCoach } from '@/features/upload/usePhotoCoach'
import { useFlowStore } from '@/store/useFlowStore'
import { cn } from '@/lib/utils'

const MAX_BYTES = 10 * 1024 * 1024
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']

const TIPS = [
  { icon: Smile, text: 'Face Forward' },
  { icon: Sun, text: 'Bright Light' },
  { icon: Camera, text: 'Sharp & Hi-Res' },
]

export function PhotoUpload() {
  const { photoUrl, photoName, coachResult, setPhoto, clearPhoto, next } = useFlowStore()
  const { analyzing, run } = usePhotoCoach()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError(null)
    if (!ACCEPTED.includes(file.type)) {
      setError('Unsupported format. Please use a JPG, PNG, or WebP image.')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('That file is over 10 MB. Please choose a smaller image.')
      return
    }
    try {
      // Release any previous preview URL before replacing.
      if (photoUrl) URL.revokeObjectURL(photoUrl)
      const { url, result } = await run(file)
      setPhoto(url, file.name, result)
    } catch {
      setError('We could not read that image. Please try another file.')
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  const hasFailure = coachResult?.hasFailure

  return (
    <StepScreen
      step={2}
      kicker="Step 02"
      title="Drop Your Photo"
      subtitle="We check it instantly and coach you to the best possible result."
      footer={
        photoUrl ? (
          <Button
            className="w-full"
            size="lg"
            variant={hasFailure ? 'secondary' : 'default'}
            onClick={next}
          >
            {hasFailure ? 'Use Anyway' : 'Generate Poster'}
            <ArrowRight className="size-5" strokeWidth={1.5} />
          </Button>
        ) : undefined
      }
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {!photoUrl ? (
        <>
          {/* Dropzone — hard dashed border, lime on drag-over, no radius */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            disabled={analyzing}
            className={cn(
              'flex w-full flex-col items-center justify-center gap-5 border-2 border-dashed px-8 py-20 text-center transition-colors duration-100',
              dragging
                ? 'border-accent bg-surface'
                : 'border-line bg-surface hover:border-cream/30',
            )}
          >
            {analyzing ? (
              <>
                <Loader2 className="size-9 animate-spin text-accent" strokeWidth={1.5} />
                <p className="t-card">
                  Analyzing Photo…
                </p>
              </>
            ) : (
              <>
                <div className="grid size-14 place-items-center border border-line text-cream">
                  <ImagePlus className="size-7" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="t-card">
                    Tap Or Drop A Photo
                  </p>
                  <p className="mt-2 label-wide text-mute">
                    JPG · PNG · WebP · Up To 10 MB
                  </p>
                </div>
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 border-l-[3px] border-danger bg-surface px-4 py-3">
              <p className="t-body text-danger">{error}</p>
            </div>
          )}

          {/* Guidance — flat bordered blocks, outline icons */}
          <div className="mt-8 grid grid-cols-3 gap-px border border-line bg-line">
            {TIPS.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex flex-col items-center gap-3 bg-primary p-5 text-center"
              >
                <Icon className="size-5 text-cream" strokeWidth={1.5} />
                <span className="label text-mute">{text}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-7">
          <div className="flex flex-col items-center gap-4 text-center">
            <motion.img
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.12 }}
              src={photoUrl}
              alt="Your upload"
              className="size-36 border border-line object-cover"
            />
            <p className="max-w-full truncate label text-cream">{photoName}</p>
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (photoUrl) URL.revokeObjectURL(photoUrl)
                  clearPhoto()
                  setError(null)
                  inputRef.current?.click()
                }}
              >
                <RefreshCw className="size-4" strokeWidth={1.5} />
                Replace
              </Button>
            </div>
          </div>

          {coachResult && <CoachFeedback result={coachResult} />}

          {hasFailure && (
            <p className="t-body">
              You can continue, but fixing the flagged issues gives you a far
              better poster.
            </p>
          )}
        </div>
      )}
    </StepScreen>
  )
}
