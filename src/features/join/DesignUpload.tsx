import { useRef, useState, type DragEvent } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, ImagePlus, RefreshCw } from 'lucide-react'
import { StepScreen } from '@/components/StepScreen'
import { Button } from '@/components/ui/button'
import { useFlowStore } from '@/store/useFlowStore'
import { cn } from '@/lib/utils'

/*
  The "upload your own design" path. Reuses PhotoUpload's dropzone pattern (hard
  dashed border, drag handlers, object-URL preview, revoke-on-replace) but WITHOUT
  the photo coach — this is a club's finished artwork, not a face photo. On
  continue the artwork becomes the working poster (startUploadedBuild), so the
  club can add it to the cart / check out like any render. Honest prototype: a
  bespoke design is set up by the studio for real production.
*/
const MAX_BYTES = 10 * 1024 * 1024
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']

export function DesignUpload({ onBack }: { onBack: () => void }) {
  const startUploadedBuild = useFlowStore((s) => s.startUploadedBuild)
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  function handleFile(file: File | undefined) {
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
    // Release any previous preview URL before replacing.
    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(file))
    setFileName(file.name)
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  return (
    <StepScreen
      step={0}
      kicker="Set Up"
      title="Upload Your Design"
      subtitle="Drop your club's poster artwork — we'll set it up for your store."
      footer={
        preview ? (
          // NOTE: the object URL is intentionally NOT revoked here — it becomes
          // the working poster (and any cart thumbnail) for the rest of the session.
          <Button className="w-full" size="lg" onClick={() => startUploadedBuild(preview)}>
            Preview My Poster
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

      {!preview ? (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              'flex w-full flex-col items-center justify-center gap-5 border-2 border-dashed px-8 py-20 text-center transition-colors duration-100',
              dragging
                ? 'border-accent bg-surface'
                : 'border-line bg-surface hover:border-cream/30',
            )}
          >
            <div className="grid size-14 place-items-center border border-line text-cream">
              <ImagePlus className="size-7" strokeWidth={1.5} />
            </div>
            <div>
              <p className="t-card">Tap Or Drop Your Design</p>
              <p className="mt-2 label-wide text-mute">JPG · PNG · WebP · Up To 10 MB</p>
            </div>
          </button>

          {error && (
            <div className="mt-4 border-l-[3px] border-danger bg-surface px-4 py-3">
              <p className="t-body text-danger">{error}</p>
            </div>
          )}

          <button
            type="button"
            onClick={onBack}
            className="mt-6 inline-flex items-center gap-1.5 label text-mute transition-colors duration-100 hover:text-cream"
          >
            <ArrowLeft className="size-4" strokeWidth={1.5} />
            Back to options
          </button>
        </>
      ) : (
        <div className="space-y-7">
          <div className="flex flex-col items-center gap-4 text-center">
            <motion.img
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.12 }}
              src={preview}
              alt="Your design"
              className="max-h-80 border border-line object-contain"
            />
            {fileName && <p className="max-w-full truncate label text-cream">{fileName}</p>}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (preview) URL.revokeObjectURL(preview)
                setPreview(null)
                setFileName(null)
                setError(null)
                inputRef.current?.click()
              }}
            >
              <RefreshCw className="size-4" strokeWidth={1.5} />
              Replace
            </Button>
          </div>

          <div className="border border-line bg-surface px-4 py-3 text-center">
            <p className="t-body">
              Prototype — our studio sets up your bespoke design for production.
              Preview how it looks as a poster next.
            </p>
          </div>
        </div>
      )}
    </StepScreen>
  )
}
