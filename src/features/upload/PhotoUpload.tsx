import { useRef, useState, type DragEvent } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ImagePlus, Loader2, RefreshCw, Camera, Sun, Smile, ShieldCheck } from 'lucide-react'
import { StepScreen } from '@/components/StepScreen'
import { Button } from '@/components/ui/button'
import { CoachFeedback } from '@/features/upload/CoachFeedback'
import { usePhotoCoach } from '@/features/upload/usePhotoCoach'
import { useFlowStore } from '@/store/useFlowStore'
import { cn } from '@/lib/utils'

const MAX_BYTES = 10 * 1024 * 1024
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']

const TIPS = [
  { icon: Smile, title: 'Face the camera', text: 'Look straight on — head and shoulders in frame.' },
  { icon: Sun, title: 'Good light', text: 'Bright, even light. Avoid harsh shadows.' },
  { icon: Camera, title: 'Sharp & hi-res', text: 'A clear, recent photo. No filters or blur.' },
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
      // Automatic generation: a clean photo goes straight to the render — no
      // "Generate" button. A flagged photo pauses here so we can surface the
      // issue before committing (the user can still continue anyway).
      if (!result.hasFailure) next()
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
      subtitle="Add one photo and your poster is generated automatically."
      footer={
        photoUrl && hasFailure ? (
          <Button
            className="w-full"
            size="lg"
            variant="secondary"
            onClick={next}
          >
            Use This Photo Anyway
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
          {/* Dropzone — hard dashed border, orange on drag-over, no radius */}
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

          {/* Guidelines — clearly visible up front (the deck asked for this) */}
          <div className="mt-10">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-line" />
              <p className="label-wide text-mute">For the best poster</p>
              <span className="h-px flex-1 bg-line" />
            </div>
            <div className="mt-5 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-3">
              {TIPS.map(({ icon: Icon, title, text }, i) => (
                <div key={title} className="flex flex-col gap-4 bg-primary p-6">
                  <div className="flex items-center justify-between">
                    <span className="grid size-14 shrink-0 place-items-center bg-cream/15 text-cream">
                      <Icon className="size-7" strokeWidth={1.5} />
                    </span>
                    <span className="t-meta text-mute">{`0${i + 1}`}</span>
                  </div>
                  <div className="space-y-2">
                    <span className="block t-card text-3xl">{title}</span>
                    <span className="block t-body">{text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reassurance — how the photo is handled (deck flagged this as missing) */}
          <div className="mt-4 flex items-center gap-3 border border-line bg-surface px-4 py-3">
            <ShieldCheck className="size-5 shrink-0 text-mute" strokeWidth={1.5} />
            <p className="t-body">
              Your photo is used only to create this poster. It’s processed securely,
              never shared, and you can replace it or start over at any time.
            </p>
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
