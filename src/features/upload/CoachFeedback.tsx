import { motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, XCircle, MinusCircle } from 'lucide-react'
import type { CoachCheck, CoachResult } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_STYLE = {
  pass: { Icon: CheckCircle2, block: 'bg-success text-ink' },
  warn: { Icon: AlertTriangle, block: 'bg-warn text-ink' },
  fail: { Icon: XCircle, block: 'bg-danger text-cream' },
  skipped: { Icon: MinusCircle, block: 'bg-surface text-mute border border-line' },
} as const

function CheckRow({ check, index }: { check: CoachCheck; index: number }) {
  const { Icon, block } = STATUS_STYLE[check.status]
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.12, delay: index * 0.04 }}
      className="grid grid-cols-[auto_1fr] items-stretch border border-line bg-primary"
    >
      <div className={cn('grid w-11 place-items-center', block)}>
        <Icon className="size-5" strokeWidth={1.5} />
      </div>
      <div className="min-w-0 px-4 py-3">
        <p className="label text-cream">{check.label}</p>
        <p className="mt-2 t-body">{check.message}</p>
      </div>
    </motion.div>
  )
}

export function CoachFeedback({ result }: { result: CoachResult }) {
  return (
    <div className="space-y-px">
      <div className="mb-2 flex items-center justify-between">
        <p className="label-wide text-mute">Photo Coach</p>
        {result.passed ? (
          <span className="bg-success px-2 py-0.5 label text-ink">
            Looks Great
          </span>
        ) : (
          <span className="bg-danger px-2 py-0.5 label text-cream">
            Needs A Better Photo
          </span>
        )}
      </div>
      <div className="space-y-2.5">
        {result.checks.map((c, i) => (
          <CheckRow key={c.id} check={c} index={i} />
        ))}
      </div>
    </div>
  )
}
